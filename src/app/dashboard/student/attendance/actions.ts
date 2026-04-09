"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { attendanceCheckInSchema } from "@/lib/schemas";

export async function checkInStudent(token: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return { error: "Không có quyền thực hiện thao tác này." };
  }

  const parsedInput = attendanceCheckInSchema.safeParse({ token });
  if (!parsedInput.success) {
    return { error: "Mã điểm danh không hợp lệ." };
  }

  try {
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) return { error: "Student profile not found" };

    // Find the active session with the specific token
    const attendanceSession = await prisma.attendanceSession.findFirst({
      where: { 
        qrCodeToken: parsedInput.data.token.toUpperCase(),
      },
      include: {
        classSection: true,
      },
    });

    if (!attendanceSession) {
      return { error: "Mã điểm danh không hợp lệ hoặc đã hết hạn!" };
    }

    // Verify if the session has expired
    if (attendanceSession.expiresAt && attendanceSession.expiresAt < new Date()) {
       return { error: "Mã điểm danh đã hết hạn thời gian hiệu lực!" };
    }

    // Check if the student is enrolled in this class
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_classSectionId: {
          studentId: student.id,
          classSectionId: attendanceSession.classSectionId,
        }
      },
    });

    if (!enrollment || enrollment.status !== "ENROLLED") {
      return { error: "Bạn không có tên trong danh sách lớp học phần này!" };
    }

    // Attempt to record attendance
    await prisma.attendanceRecord.create({
      data: {
        sessionId: attendanceSession.id,
        studentId: student.id,
        status: "PRESENT",
      },
    });

    revalidatePath("/dashboard/student/attendance");
    return { success: true, message: "Điểm danh thành công!" };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Bạn đã điểm danh cho ca học này rồi!" };
    }
    return { error: "Lỗi hệ thống trong quá trình điểm danh." };
  }
}

