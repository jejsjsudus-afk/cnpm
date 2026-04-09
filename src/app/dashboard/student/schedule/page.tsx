import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Info } from "lucide-react";

type DayScheduleItem = {
  id: string;
  course: {
    name: string;
  };
  lecturer: string;
  startTime: string;
  endTime: string;
  room: string;
  type: string;
};

const DAYS_OF_WEEK = [
  { id: 2, name: "Thứ 2" },
  { id: 3, name: "Thứ 3" },
  { id: 4, name: "Thứ 4" },
  { id: 5, name: "Thứ 5" },
  { id: 6, name: "Thứ 6" },
  { id: 7, name: "Thứ 7" },
  { id: 8, name: "Chủ nhật" },
];

export default async function SchedulePage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "STUDENT") {
    return <div>Không có quyền truy cập</div>;
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      enrollments: {
        where: { status: "ENROLLED" },
        include: {
          classSection: {
            include: {
              course: true,
              schedules: true,
              lecturer: { include: { user: true } },
            }
          }
        }
      }
    }
  });

  const enrollments = student?.enrollments || [];

  // Transform data into a weekly view format
  const classesByDay: Record<number, DayScheduleItem[]> = {};
  DAYS_OF_WEEK.forEach(day => { classesByDay[day.id] = []; });

  enrollments.forEach(enroll => {
    const section = enroll.classSection;
    section.schedules.forEach(schedule => {
      if (classesByDay[schedule.dayOfWeek]) {
        classesByDay[schedule.dayOfWeek].push({
          id: schedule.id,
          course: section.course,
          lecturer: section.lecturer.user.name,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          room: schedule.room,
          type: schedule.type,
        });
      }
    });
  });

  // Sort classes by start time within each day
  Object.keys(classesByDay).forEach(day => {
    classesByDay[Number(day)].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Thời khóa biểu</h1>
        <p className="text-slate-500">Xem lịch học và lịch thi trong tuần</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {DAYS_OF_WEEK.map((day) => {
          const dayClasses = classesByDay[day.id];
          
          if (dayClasses.length === 0 && day.id > 6) return null; // Hide empty weekends natively

          return (
            <Card key={day.id} className="shadow-sm border-t-4 border-t-orange-500">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-base flex items-center justify-between">
                  {day.name}
                  <Badge variant="outline" className="bg-white">{dayClasses.length} ca</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {dayClasses.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {dayClasses.map((cls, idx) => (
                      <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm text-slate-900 line-clamp-2">
                            {cls.course.name}
                          </h4>
                          <Badge variant={cls.type === "EXAM" ? "destructive" : "secondary"} className="ml-2 shrink-0">
                            {cls.type === "EXAM" ? "Thi" : "Lý thuyết"}
                          </Badge>
                        </div>
                        <div className="space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>{cls.startTime} - {cls.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            <span className="font-medium text-slate-700">Phòng {cls.room}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <Info className="h-3.5 w-3.5 text-slate-400" />
                             <span>GV: {cls.lecturer}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                    <div className="bg-slate-100 p-3 rounded-full mb-2">
                      <Clock className="h-5 w-5 text-slate-300" />
                    </div>
                    <p className="text-sm">Trống lịch</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

