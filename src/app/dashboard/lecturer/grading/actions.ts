"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { updateStudentGPA } from "@/lib/gpa";


export async function saveScore(enrollmentId: string, componentId: string, scoreValue: number, isFinalized: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "LECTURER") return { error: "Unauthorized" };

  try {
    const lecturer = await prisma.lecturer.findUnique({
      where: { userId: session.user.id }
    });
    if (!lecturer) return { error: "Lecturer profile not found" };

    // Verify ownership of the class section
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { classSection: true }
    });
    
    if (!enrollment || enrollment.classSection.lecturerId !== lecturer.id) {
       return { error: "Bạn không có quyền sửa điểm sinh viên này" };
    }

    // Upsert Score
    await prisma.score.upsert({
      where: {
        enrollmentId_componentId: {
          enrollmentId,
          componentId
        }
      },
      update: {
        scoreValue,
        isFinalized
      },
      create: {
        enrollmentId,
        componentId,
        scoreValue,
        isFinalized
      }
    });

    // Log the action!
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entity: "SCORE",
        newData: `{"score": ${scoreValue}, "final": ${isFinalized}}`,
      }
    });

    // Update GPA
    if (isFinalized) {
      await updateStudentGPA(enrollment.studentId);
    }

    revalidatePath("/dashboard/lecturer/grading");
    return { success: true };
  } catch {
    return { error: "Lỗi hệ thống khi lưu điểm." };
  }
}

