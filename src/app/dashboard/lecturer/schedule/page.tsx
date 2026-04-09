import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";


const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

export default async function LecturerSchedulePage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "LECTURER") {
    return <div>Không có quyền truy cập</div>;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { lecturer: true }
  });

  if (!user?.lecturer) return null;

  const schedules = await prisma.schedule.findMany({
    where: {
      classSection: {
        lecturerId: user.lecturer.id,
        status: "OPEN"
      }
    },
    include: {
      classSection: {
        include: { course: true }
      }
    },
    orderBy: { startTime: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <CalendarClock className="h-6 w-6 text-blue-600" />
          Lịch giảng dạy
        </h1>
        <p className="text-slate-500">Kế hoạch lên lớp tuần này</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {DAYS.map((day, ix) => {
          const dayId = ix + 2; // Thứ 2 = 2
          const daySchedules = schedules.filter(s => s.dayOfWeek === dayId);

          return (
            <Card key={dayId} className="shadow-sm border-t-2 border-t-slate-200 h-full">
               <CardHeader className="py-3 px-4 bg-slate-50/50 border-b border-slate-100">
                 <CardTitle className="text-base text-slate-700">{day}</CardTitle>
               </CardHeader>
               <CardContent className="p-4 space-y-3">
                 {daySchedules.length > 0 ? daySchedules.map(sch => (
                   <div key={sch.id} className="p-3 bg-white border border-slate-200 rounded-md shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                     <p className="font-semibold text-slate-900 text-sm mb-1 line-clamp-1">{sch.classSection.course.name}</p>
                     <div className="flex justify-between items-center mt-2">
                        <Badge variant="outline" className="bg-slate-50 text-slate-700 font-mono text-xs border-slate-200">
                          {sch.startTime} - {sch.endTime}
                        </Badge>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                          <MapPin className="h-3 w-3" /> P.{sch.room}
                        </span>
                     </div>
                   </div>
                 )) : (
                   <div className="text-sm text-slate-400 text-center py-6 italic border border-dashed rounded bg-slate-50/30">
                      Trống lịch
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

