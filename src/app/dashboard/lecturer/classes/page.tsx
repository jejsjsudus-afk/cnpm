import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AttendanceButton } from "./AttendanceButton";
import { Users, UsersRound, CalendarRange } from "lucide-react";


export default async function LecturerClassesPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "LECTURER") {
    return <div>Không có quyền truy cập</div>;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { lecturer: true }
  });

  if (!user?.lecturer) return null;

  const classes = await prisma.classSection.findMany({
    where: { lecturerId: user.lecturer.id },
    include: {
      course: true,
      semester: true,
      schedules: true,
      _count: {
        select: { enrollments: { where: { status: "ENROLLED" } } }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Lớp học phần</h1>
        <p className="text-slate-500">Danh sách các lớp bạn đang phụ trách giảng dạy</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes.length > 0 ? classes.map((cls) => (
          <Card key={cls.id} className="shadow-sm flex flex-col">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-slate-900 line-clamp-2 leading-tight">
                  {cls.course.name}
                </CardTitle>
                <Badge variant={cls.status === "OPEN" ? "default" : "secondary"}>
                  {cls.status === "OPEN" ? "Đang mở" : "Đã đóng"}
                </Badge>
              </div>
              <CardDescription className="font-mono text-xs">{cls.course.code}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex-1 space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <UsersRound className="h-4 w-4 text-orange-500" />
                  <span>Sĩ số</span>
                </div>
                <span className="font-medium text-slate-900">{cls._count.enrollments} / {cls.capacity}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 text-blue-500" />
                  <span>Học kỳ</span>
                </div>
                <span className="font-medium text-slate-900 max-w-[150px] truncate">{cls.semester.name}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                <p className="mb-1 font-semibold text-slate-700">Lịch học ngẫu nhiên:</p>
                {cls.schedules.length > 0 ? cls.schedules.map((sch, i) => (
                  <div key={i} className="flex gap-2">
                    <span>Thứ {sch.dayOfWeek}</span>
                    <span>|</span>
                    <span>{sch.startTime} - {sch.endTime}</span>
                    <span>|</span>
                    <span>Phòng {sch.room}</span>
                  </div>
                )) : <span>Bổ sung sau</span>}
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-4 px-4 border-t border-slate-100 pt-4">
              <AttendanceButton classId={cls.id} />
            </CardFooter>
          </Card>
        )) : (
          <div className="col-span-full text-center py-12 text-slate-500 border border-dashed rounded-lg bg-slate-50">
             <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
             <p>Chưa có lớp học phần nào được phân công.</p>
          </div>
        )}
      </div>
    </div>
  )
}

