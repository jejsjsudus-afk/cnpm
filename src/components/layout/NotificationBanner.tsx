import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Bell, X } from "lucide-react";

export async function NotificationBanner() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return null;
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });

  if (!student) return null;

  const latestUnread = await prisma.notificationRecipient.findFirst({
    where: {
      studentId: student.id,
      isRead: false,
    },
    include: {
      notification: {
        include: {
          sender: { include: { user: true } },
          classSection: { include: { course: true } },
        },
      },
    },
    orderBy: { notification: { date: "desc" } },
  });

  if (!latestUnread) return null;

  const unreadCount = await prisma.notificationRecipient.count({
    where: {
      studentId: student.id,
      isRead: false,
    },
  });

  const notif = latestUnread.notification;
  const senderName = notif.sender.user.name;
  const courseName = notif.classSection?.course?.name;

  return (
    <div className="mb-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-3.5 shadow-lg shadow-orange-200/50 flex items-center gap-4 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white/20 shrink-0">
        <Bell className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">
          {notif.title}
        </p>
        <p className="text-xs text-white/80 truncate mt-0.5">
          Từ {senderName}
          {courseName && ` — ${courseName}`}
          {unreadCount > 1 && ` · và ${unreadCount - 1} thông báo khác chưa đọc`}
        </p>
      </div>
      <Link
        href="/dashboard/student/notifications"
        className="shrink-0 px-4 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-sm font-semibold transition-colors"
      >
        Xem ngay
      </Link>
    </div>
  );
}
