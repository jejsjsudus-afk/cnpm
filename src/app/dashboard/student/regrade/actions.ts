"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { regradeSubmissionSchema } from "@/lib/schemas";
import { z } from "zod";

export async function submitRegradeRequest(
  classSectionId: string,
  componentId: string,
  currentScore: number,
  reason: string,
  requestedScore?: number
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return { error: "Bạn không có quyền thực hiện thao tác này." };
  }

  try {
    const parsedInput = regradeSubmissionSchema.safeParse({
      classSectionId,
      componentId,
      currentScore,
      reason,
      requestedScore,
    });
    if (!parsedInput.success) {
      return { error: "Thông tin phúc khảo không hợp lệ." };
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });
    if (!student) return { error: "Không tìm thấy hồ sơ sinh viên." };

    // Check if a PENDING request already exists for this class section and component
    const existing = await prisma.regradeRequest.findFirst({
      where: {
        studentId: student.id,
        classSectionId: parsedInput.data.classSectionId,
        componentId: parsedInput.data.componentId,
        status: "PENDING",
      },
    });
    if (existing) {
      return { error: "Bạn đã có một đơn phúc khảo đang chờ xử lý cho cột điểm này." };
    }

    // Verify student is enrolled in that section
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: student.id,
        classSectionId: parsedInput.data.classSectionId,
        status: "ENROLLED",
      },
    });
    if (!enrollment) {
      return { error: "Bạn không đăng ký lớp học phần này." };
    }

    await prisma.regradeRequest.create({
      data: {
        studentId: student.id,
        classSectionId: parsedInput.data.classSectionId,
        componentId: parsedInput.data.componentId,
        currentScore: parsedInput.data.currentScore,
        requestedScore: parsedInput.data.requestedScore ?? null,
        reason: parsedInput.data.reason,
        status: "PENDING",
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "REGRADE_REQUEST",
        newData: JSON.stringify(parsedInput.data),
      },
    });

    revalidatePath("/dashboard/student/regrade");
    return { success: true };
  } catch (error) {
    console.error("Regrade submit error:", error);
    return { error: "Lỗi hệ thống, vui lòng thử lại sau." };
  }
}

export async function cancelRegradeRequest(requestId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return { error: "Bạn không có quyền thực hiện thao tác này." };
  }

  try {
    const parsedRequestId = z.uuid().safeParse(requestId);
    if (!parsedRequestId.success) {
      return { error: "Mã đơn phúc khảo không hợp lệ." };
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });
    if (!student) return { error: "Không tìm thấy hồ sơ sinh viên." };

    const request = await prisma.regradeRequest.findUnique({
      where: { id: parsedRequestId.data },
    });

    if (!request || request.studentId !== student.id) {
      return { error: "Đơn phúc khảo không tồn tại hoặc không thuộc về bạn." };
    }

    if (request.status !== "PENDING") {
      return { error: "Chỉ có thể hủy đơn đang ở trạng thái chờ xử lý." };
    }

    await prisma.regradeRequest.delete({
      where: { id: parsedRequestId.data },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        entity: "REGRADE_REQUEST",
        oldData: JSON.stringify({ requestId: parsedRequestId.data }),
      },
    });

    revalidatePath("/dashboard/student/regrade");
    return { success: true };
  } catch (error) {
    console.error("Cancel regrade error:", error);
    return { error: "Lỗi hệ thống, vui lòng thử lại sau." };
  }
}

