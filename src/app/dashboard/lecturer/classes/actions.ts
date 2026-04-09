"use server";

import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";


export async function generateAttendanceSession(classSectionId: string, customToken?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "LECTURER") return { error: "Unauthorized" };

  try {
    const lecturer = await prisma.lecturer.findUnique({
      where: { userId: session.user.id }
    });

    if (!lecturer) return { error: "Lecturer profile not found" };

    // Verify lecturer owns this class section
    const section = await prisma.classSection.findFirst({
      where: { id: classSectionId, lecturerId: lecturer.id }
    });

    if (!section) return { error: "Bạn không có quyền quản lý lớp học phần này" };

    // Check if there is an active session today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingSession = await prisma.attendanceSession.findFirst({
       where: {
         classSectionId: classSectionId,
         date: { gte: today },
         expiresAt: { gt: new Date() } // not expired yet
       }
    });

    if (existingSession) {
       return { success: true, token: existingSession.qrCodeToken, message: "Phiên điểm danh cũ vẫn đang mở." };
    }

    const token = customToken && customToken.trim() !== "" 
      ? customToken.trim().toUpperCase() 
      : `${section.courseId.slice(0, 3).toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    
    await prisma.attendanceSession.create({
      data: {
        classSectionId: classSectionId,
        date: new Date(),
        qrCodeToken: token,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      }
    });

    revalidatePath("/dashboard/lecturer/classes");
    return { success: true, token, message: "Đã tạo phiên điểm danh thành công." };
  } catch {
    return { error: "Lỗi hệ thống khi khởi tạo phiên điểm danh." };
  }
}

