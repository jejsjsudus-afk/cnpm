import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateSectionForm } from "./CreateSectionForm";
import { EditScheduleModal } from "./EditScheduleModal";
import { getMetadataForScheduling } from "./actions";


export default async function ManagerSchedulesPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "MANAGER" && session?.user?.role !== "ADMIN") {
    return <div>Không có quyền truy cập</div>;
  }

  const [sections, metadata] = await Promise.all([
    prisma.classSection.findMany({
      include: {
        course: true,
        lecturer: { include: { user: true } },
        semester: true,
        schedules: true
      },
      take: 40,
      orderBy: { semester: { startDate: 'desc' } }
    }),
    getMetadataForScheduling()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
               <CalendarDays className="h-6 w-6 text-blue-600" />
               Quản lý Thời khóa biểu & Lịch thi
            </h1>
            <p className="text-slate-500">Gán phòng, lịch dạy và phát hành lịch thi cuối kỳ</p>
         </div>
         <div className="flex gap-2">
            <Button variant="outline">Xếp lịch Tự động (Beta)</Button>
            <CreateSectionForm metadata={metadata} />
         </div>
      </div>

      <Card className="shadow-sm">
         <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
            <CardTitle>Danh sách Lớp học phần hiện hành</CardTitle>
            <CardDescription className="mt-1">Dữ liệu phân mảnh theo Học kỳ</CardDescription>
         </CardHeader>
         <CardContent className="p-0">
            <div className="overflow-x-auto">
               <Table>
                  <TableHeader>
                     <TableRow className="bg-slate-50/50">
                        <TableHead className="w-48">Học phần</TableHead>
                        <TableHead>Giảng viên</TableHead>
                        <TableHead className="text-center">Sĩ số (Max)</TableHead>
                        <TableHead>Lịch học lý thuyết</TableHead>
                        <TableHead>Lịch thi dự kiến</TableHead>
                        <TableHead className="text-right">Tác vụ</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {sections.map(sec => {
                        const lecture = sec.schedules.find(s => s.type === "LECTURE");
                        const exam = sec.schedules.find(s => s.type === "EXAM");
                        
                        return (
                           <TableRow key={sec.id} className="hover:bg-slate-50 cursor-pointer">
                              <TableCell>
                                 <p className="font-semibold text-slate-900 line-clamp-1">{sec.course.name}</p>
                                 <p className="font-mono text-xs text-slate-500 mt-1">{sec.course.code} • {sec.semester.name}</p>
                              </TableCell>
                              <TableCell className="font-medium text-slate-700">
                                 {sec.lecturer.user.name}
                              </TableCell>
                              <TableCell className="text-center font-mono font-medium">
                                 {sec.capacity}
                              </TableCell>
                              <TableCell>
                                 {lecture ? (
                                    <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                                       <Badge variant="outline" className="bg-blue-50 text-blue-700 border-none">T{lecture.dayOfWeek}</Badge>
                                       <span>{lecture.startTime} - {lecture.endTime}</span>
                                       <span className="text-slate-400">|</span>
                                       <span>P.{lecture.room}</span>
                                    </div>
                                 ) : (
                                    <span className="text-xs text-orange-500 italic flex items-center gap-1">Chưa xếp lịch</span>
                                 )}
                              </TableCell>
                              <TableCell>
                                 {exam ? (
                                    <div className="text-sm font-medium text-red-600 flex items-center gap-1.5">
                                       <Badge variant="outline" className="bg-red-50 text-red-600 border-none text-[10px]">THI</Badge>
                                       <span>{exam.startTime}</span>
                                       <span className="text-slate-400">|</span>
                                       <span>P.{exam.room}</span>
                                    </div>
                                 ) : (
                                    <span className="text-xs text-slate-400 italic">Chưa xếp</span>
                                 )}
                              </TableCell>
                              <TableCell className="text-right">
                                 <EditScheduleModal section={sec} />
                              </TableCell>
                           </TableRow>
                        )
                     })}
                  </TableBody>
               </Table>
            </div>
         </CardContent>
      </Card>
    </div>
  )
}

