"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function sendNotification(data: {
  title: string;
  content: string;
  classSectionId: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "LECTURER") {
    return { error: "Unauthorized" };
  }

  try {
    const lecturer = await prisma.lecturer.findUnique({
      where: { userId: session.user.id }
    });

    if (!lecturer) return { error: "Lecturer not found" };

    // Verify lecturer owns this class section
    const section = await prisma.classSection.findFirst({
      where: { id: data.classSectionId, lecturerId: lecturer.id },
      include: { enrollments: true }
    });

    if (!section) return { error: "Bạn không có quyền quản lý lớp học này." };

    // Create Notification and link to all enrolled students
    const notification = await prisma.notification.create({
      data: {
        title: data.title,
        content: data.content,
        senderId: lecturer.id,
        classSectionId: section.id,
      }
    });

    const recipientData = section.enrollments.map(e => ({
      notificationId: notification.id,
      studentId: e.studentId
    }));

    if (recipientData.length > 0) {
      await prisma.notificationRecipient.createMany({
        data: recipientData
      });
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "NOTIFICATION",
        newData: `Created notification for class ${section.id}: ${data.title}`
      }
    });

    revalidatePath("/dashboard/lecturer/notifications");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to send notification" };
  }
}
