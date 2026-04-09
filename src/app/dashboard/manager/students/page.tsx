import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Users, AlertTriangle, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CreateStudentForm } from "./CreateStudentForm";



export default async function ManagerStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
    return <div>Không có quyền truy cập</div>;
  }

  const rawQuery = resolvedSearchParams.q;
  const query = Array.isArray(rawQuery) ? rawQuery[0] : rawQuery || "";

  const students = await prisma.student.findMany({
    where: {
      OR: [
        { mssv: { contains: query } },
        { user: { name: { contains: query } } },
      ]
    },
    include: {
      user: true,
      _count: {
        select: { enrollments: { where: { status: "ENROLLED" } } }
      }
    },
    take: 50,
  });

  const warningCount = students.filter(s => s.currentGPA > 0 && s.currentGPA < 2.0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Sinh viên</h1>
          <p className="text-slate-500">Tra cứu thông tin, kết quả học tập và cảnh báo học vụ</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Lọc
          </Button>
          <CreateStudentForm />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Tổng số sinh viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{students.length}</div>
            <p className="text-xs text-slate-500 mt-1">Đang theo học</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-t-4 border-t-orange-500 bg-orange-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Cảnh báo học vụ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{warningCount}</div>
            <p className="text-xs text-orange-600/80 mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> GPA dưới 2.0
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-4 border-t-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Đủ điều kiện tốt nghiệp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">0</div>
            <p className="text-xs text-slate-500 mt-1">Hệ thống chưa tính</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Danh sách Sinh viên</CardTitle>
            <CardDescription className="mt-1">Hỗ trợ tìm kiếm theo MSSV hoặc Họ tên</CardDescription>
          </div>
          <form className="relative max-w-sm hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              name="q"
              defaultValue={query}
              type="text" 
              placeholder="Nhập MSSV..." 
              className="pl-9 h-9 w-[250px] bg-slate-50"
            />
          </form>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="w-32">MSSV</TableHead>
                  <TableHead>Họ và Tên</TableHead>
                  <TableHead className="hidden md:table-cell">Khóa</TableHead>
                  <TableHead className="text-center">Số Lớp Đang Học</TableHead>
                  <TableHead className="text-center">Tín chỉ</TableHead>
                  <TableHead className="text-center">GPA (Hệ 4)</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const isWarning = student.currentGPA > 0 && student.currentGPA < 2.0;
                  
                  return (
                    <TableRow key={student.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                      <TableCell className="font-mono text-sm font-medium text-blue-600">
                        {student.mssv}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {student.user.name}
                        <div className="text-xs text-slate-500 font-normal mt-0.5">{student.user.email}</div>
                      </TableCell>
                      <TableCell className="text-slate-500 hidden md:table-cell">
                        {student.cohort}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {student._count.enrollments}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {student.totalCredits}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${isWarning ? 'text-red-500' : 'text-slate-700'}`}>
                          {student.currentGPA.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={isWarning ? "destructive" : "secondary"} className={!isWarning ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : ""}>
                          {isWarning ? "Cảnh cáo" : "Bình thường"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link 
                          href={`/dashboard/manager/students/${student.id}`}
                          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                        >
                          Chi tiết
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {students.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p>Không tìm thấy sinh viên nào.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

