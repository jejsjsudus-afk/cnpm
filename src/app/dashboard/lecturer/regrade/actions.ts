"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateStudentGPA } from "@/lib/gpa";

export async function handleRegradeDecision(
  requestId: string,
  decision: "APPROVED" | "REJECTED",
  comment?: string,
  approvedScore?: number
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "LECTURER") {
    return { error: "Unauthorized" };
  }

  try {
    const parsedInput = z
      .object({
        requestId: z.uuid(),
        decision: z.enum(["APPROVED", "REJECTED"]),
        comment: z.string().trim().max(500).optional(),
        approvedScore: z.number().min(0).max(10).optional(),
      })
      .safeParse({ requestId, decision, comment, approvedScore });

    if (!parsedInput.success) {
      return { error: "Dữ liệu xử lý phúc khảo không hợp lệ." };
    }

    if (
      parsedInput.data.decision === "APPROVED" &&
      parsedInput.data.approvedScore === undefined
    ) {
      return { error: "Cần nhập điểm mới khi duyệt phúc khảo." };
    }

    const lecturer = await prisma.lecturer.findUnique({
      where: { userId: session.user.id },
    });
    if (!lecturer) return { error: "Lecturer not found" };

    const request = await prisma.regradeRequest.findUnique({
      where: { id: parsedInput.data.requestId },
      include: { classSection: true },
    });

    if (!request || request.classSection.lecturerId !== lecturer.id) {
      return { error: "Bạn không có quyền xử lý đơn này." };
    }

    if (request.status !== "PENDING") {
      return { error: "Đơn này đã được xử lý." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.regradeRequest.update({
        where: { id: parsedInput.data.requestId },
        data: {
          status: parsedInput.data.decision,
          lecturerComment: parsedInput.data.comment || null,
          approvedScore:
            parsedInput.data.decision === "APPROVED"
              ? parsedInput.data.approvedScore
              : null,
        },
      });

      if (
        parsedInput.data.decision === "APPROVED" &&
        parsedInput.data.approvedScore !== undefined
      ) {
        if (!request.componentId) {
          throw new Error("Regrade request is missing score component.");
        }

        const enrollment = await tx.enrollment.findUnique({
          where: {
            studentId_classSectionId: {
              studentId: request.studentId,
              classSectionId: request.classSectionId,
            },
          },
        });

        if (!enrollment) {
          throw new Error("Enrollment not found for regrade request.");
        }

        await tx.score.upsert({
          where: {
            enrollmentId_componentId: {
              enrollmentId: enrollment.id,
              componentId: request.componentId,
            },
          },
          update: {
            scoreValue: parsedInput.data.approvedScore,
            isFinalized: true,
          },
          create: {
            enrollmentId: enrollment.id,
            componentId: request.componentId,
            scoreValue: parsedInput.data.approvedScore,
            isFinalized: true,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE",
          entity: "REGRADE_REQUEST",
          oldData: JSON.stringify({ status: "PENDING" }),
          newData: JSON.stringify(parsedInput.data),
        },
      });

      await tx.notification.create({
        data: {
          title: "Kết quả đơn phúc khảo",
          content: `Đơn phúc khảo của bạn đã được giảng viên xét duyệt. Kết quả: ${
            parsedInput.data.decision === "APPROVED" ? "Chấp nhận" : "Từ chối"
          }. ${
            parsedInput.data.comment
              ? `Nhận xét: ${parsedInput.data.comment}`
              : ""
          }`,
          senderId: lecturer.id,
          classSectionId: request.classSectionId,
          recipients: {
            create: {
              studentId: request.studentId,
            },
          },
        },
      });
    });

    if (
      parsedInput.data.decision === "APPROVED" &&
      parsedInput.data.approvedScore !== undefined
    ) {
      await updateStudentGPA(request.studentId);
    }

    revalidatePath("/dashboard/lecturer/regrade");
    revalidatePath("/dashboard/student/regrade");
    revalidatePath("/dashboard/student/grades");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Regrade decision error:", error);
    return { error: "Lỗi hệ thống." };
  }
}

