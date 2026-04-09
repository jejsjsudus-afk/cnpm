import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckInForm } from "./CheckInForm";
import { Clock, CalendarCheck } from "lucide-react";


export default async function AttendancePage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "STUDENT") {
    return <div>Không có quyền truy cập</div>;
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });

  if (!student) return null;

  const records = await prisma.attendanceRecord.findMany({
    where: { studentId: student.id },
    include: {
      session: {
        include: {
          classSection: {
            include: {
              course: true,
            }
          }
        }
      }
    },
    orderBy: {
      session: {
        date: 'desc'
      }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Điểm danh</h1>
        <p className="text-slate-500">Ghi nhận sự có mặt và xem lịch sử điểm danh</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <Card className="shadow-sm border-t-4 border-t-orange-500">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Vào lớp (Check-in)
              </CardTitle>
            </CardHeader>
            <CheckInForm />
          </Card>
        </div>

        <Card className="shadow-sm flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-blue-500" />
              Lịch sử điểm danh
            </CardTitle>
            <CardDescription>Các ca học bạn đã điểm danh thành công</CardDescription>
          </CardHeader>
          <CardContent>
            {records.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Ngày học</TableHead>
                      <TableHead>Môn học</TableHead>
                      <TableHead>Mã LHP</TableHead>
                      <TableHead className="text-right">Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {new Intl.DateTimeFormat('vi-VN', { 
                            dateStyle: 'short', 
                            timeStyle: 'short' 
                          }).format(new Date(record.session.date))}
                        </TableCell>
                        <TableCell>{record.session.classSection.course.name}</TableCell>
                        <TableCell className="text-slate-500">{record.session.classSection.course.code}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={record.status === "PRESENT" ? "default" : record.status === "LATE" ? "secondary" : "destructive"} className={record.status === "PRESENT" ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                            {record.status === "PRESENT" ? "Có mặt" : record.status === "LATE" ? "Đi trễ" : "Vắng"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 xl:py-16 rounded-md border border-dashed border-slate-200">
                <CalendarCheck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Chưa có lịch sử điểm danh nào.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

