"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function markNotificationAsRead(recipientId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.notificationRecipient.update({
      where: { id: recipientId },
      data: { isRead: true, readAt: new Date() }
    });

    revalidatePath("/dashboard/student/notifications");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
