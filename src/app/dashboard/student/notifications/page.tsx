import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Bell } from "lucide-react";
import { NotificationList } from "./NotificationList";

export default async function StudentNotificationsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return <div>Không có quyền truy cập</div>;
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id }
  });

  if (!student) return null;

  const notifications = await prisma.notificationRecipient.findMany({
    where: { studentId: student.id },
    include: {
      notification: {
        include: {
          sender: { include: { user: true } },
          classSection: { include: { course: true } }
        }
      }
    },
    orderBy: { notification: { date: 'desc' } }
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6 text-orange-600" />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Thông báo của bạn
        </h1>
      </div>

      <NotificationList initialNotifications={notifications} />
    </div>
  )
}
