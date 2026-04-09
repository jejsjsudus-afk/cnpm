import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, AlertTriangle, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";


export default async function StudentDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "MANAGER" && session?.user?.role !== "ADMIN") {
    return <div>Không có quyền truy cập</div>;
  }

  const student = await prisma.student.findUnique({
    where: { id: id },
    include: {
      user: true,
      enrollments: {
        include: {
          classSection: { include: { course: true, semester: true } }
        }
      },
      invoices: true,
    }
  });

  if (!student) return <div>Không tìm thấy sinh viên</div>;

  const pendingInvoices = student.invoices.filter(i => i.status === "PENDING").length;
  const isWarning = student.currentGPA > 0 && student.currentGPA < 2.0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/manager/students"
          className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Chi tiết Hồ sơ Sinh viên</h1>
          <p className="text-slate-500">MSSV: <span className="font-mono text-slate-700">{student.mssv}</span></p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm md:col-span-1 border-t-4 border-t-blue-500">
          <CardHeader>
            <CardTitle className="text-lg">Thông tin chung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
                <p className="text-xs text-slate-500 mb-1">Họ và Tên</p>
                <p className="font-semibold text-slate-900">{student.user.name}</p>
             </div>
             <div>
                <p className="text-xs text-slate-500 mb-1">Email liên hệ</p>
                <p className="font-medium text-slate-900">{student.user.email}</p>
             </div>
             <div>
                <p className="text-xs text-slate-500 mb-1">Trạng thái hiện tại</p>
                {isWarning ? (
                   <Badge variant="destructive" className="flex items-center gap-1 w-max">
                     <AlertTriangle className="h-3 w-3" /> Cảnh báo học vụ
                   </Badge>
                ) : (
                   <Badge className="bg-emerald-500 hover:bg-emerald-600">Đang học</Badge>
                )}
             </div>
             
             {pendingInvoices > 0 && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-md">
                   <p className="text-sm font-semibold text-red-600 flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" /> Đang nợ học phí
                   </p>
                   <p className="text-xs text-red-500 mt-1">Sinh viên còn {pendingInvoices} hóa đơn chưa nộp.</p>
                </div>
             )}
          </CardContent>
        </Card>

        <Card className="shadow-sm md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 mb-4">
            <CardTitle className="text-lg flex items-center gap-2">
               <BookOpen className="h-5 w-5 text-blue-600" />
               Các môn học đã và đang đăng ký
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead>Học kỳ</TableHead>
                    <TableHead>Mã LHP</TableHead>
                    <TableHead>Tên Học Phần</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.enrollments.map(enroll => (
                     <TableRow key={enroll.id}>
                        <TableCell className="text-sm text-slate-600">{enroll.classSection.semester.name}</TableCell>
                        <TableCell className="font-mono text-xs">{enroll.classSection.course.code}</TableCell>
                        <TableCell className="font-medium text-slate-900">{enroll.classSection.course.name}</TableCell>
                        <TableCell className="text-center">
                           {enroll.status === "DROPPED" ? (
                             <Badge variant="destructive">Đã hủy</Badge>
                           ) : enroll.classSection.status === "CLOSED" ? (
                             <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">Đã hoàn thành</Badge>
                           ) : (
                             <Badge variant="secondary">Đang học</Badge>
                           )}
                        </TableCell>
                     </TableRow>
                  ))}
                </TableBody>
              </Table>
              {student.enrollments.length === 0 && (
                <div className="text-center py-6 text-slate-500">Sinh viên chưa đăng ký môn nào.</div>
              )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

