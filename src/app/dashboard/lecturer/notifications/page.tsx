import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { SendNotificationForm } from "./SendNotificationForm";
import { Bell, History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LecturerNotificationsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || session.user.role !== "LECTURER") {
    return <div>Không có quyền truy cập</div>;
  }

  const lecturer = await prisma.lecturer.findUnique({
    where: { userId: session.user.id }
  });

  if (!lecturer) return null;

  // All classes assigned to this lecturer
  const classes = await prisma.classSection.findMany({
    where: { lecturerId: lecturer.id },
    include: { course: true },
    orderBy: { course: { name: 'asc' } }
  });

  // Past notifications
  const notifications = await prisma.notification.findMany({
    where: { senderId: lecturer.id },
    include: { classSection: { include: { course: true } } },
    orderBy: { date: 'desc' }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Bell className="h-6 w-6 text-blue-600" />
          Phát Thanh & Thông Báo
        </h1>
        <p className="text-slate-500">Gửi thông báo nhanh đến các lớp học phần bạn phụ trách</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-t-4 border-t-blue-500 h-fit">
          <CardHeader>
            <CardTitle>Soạn thông báo mới</CardTitle>
            <CardDescription>Tin nhắn sẽ được gửi đến tất cả sinh viên trong lớp</CardDescription>
          </CardHeader>
          <CardContent>
            <SendNotificationForm classes={classes} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-slate-500" /> Lịch sử Đã gửi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
              {notifications.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Bạn chưa gửi thông báo nào.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="border-b border-slate-100 pb-3 last:border-0">
                    <p className="text-xs text-slate-400 mb-1">
                      {new Date(n.date).toLocaleString("vi-VN", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                      {n.classSection && ` • Lớp: ${n.classSection.course.name}`}
                    </p>
                    <h4 className="font-semibold text-slate-900 mb-1">{n.title}</h4>
                    <p className="text-sm text-slate-600 line-clamp-2">{n.content}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
