import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Users, ShieldCheck, Filter, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateLecturerForm } from "./CreateLecturerForm";

export default async function ManagerLecturersPage({
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

  const lecturers = await prisma.lecturer.findMany({
    where: {
      OR: [
        { lecturerCode: { contains: query } },
        { user: { name: { contains: query } } },
      ]
    },
    include: {
      user: true,
      _count: {
        select: { classSections: true }
      }
    },
    orderBy: {
      lecturerCode: 'asc'
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-purple-600" />
            Quản lý Giảng viên
          </h1>
          <p className="text-slate-500">Quản lý đội ngũ giảng viên và phân bổ công tác</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Lọc
          </Button>
          <CreateLecturerForm />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm border-t-4 border-t-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Tổng giảng viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{lecturers.length}</div>
            <p className="text-xs text-slate-500 mt-1">Trong toàn hệ thống</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Đang giảng dạy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {lecturers.filter(l => l._count.classSections > 0).length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Có lớp trong học kỳ này</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Bộ môn/Khoa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">5/5</div>
            <p className="text-xs text-slate-500 mt-1">Sơ đồ tổ chức</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Danh sách Giảng viên</CardTitle>
            <CardDescription className="mt-1">Tìm kiếm theo mã giảng viên hoặc họ và tên</CardDescription>
          </div>
          <form className="relative max-w-sm hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              name="q"
              defaultValue={query}
              type="text" 
              placeholder="Nhập mã hoặc tên..." 
              className="pl-9 h-9 w-[250px] bg-slate-50 focus:bg-white transition-all transform focus:scale-105"
            />
          </form>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="w-40">Mã GV</TableHead>
                  <TableHead>Họ và Tên</TableHead>
                  <TableHead>Khoa / Bộ môn</TableHead>
                  <TableHead className="text-center">Số lớp phụ trách</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lecturers.map((lecturer) => (
                  <TableRow key={lecturer.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-mono text-sm font-bold text-purple-700">
                      {lecturer.lecturerCode}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {lecturer.user.name}
                      <div className="text-xs text-slate-500 font-normal mt-0.5">{lecturer.user.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-slate-700">{lecturer.facultyId}</div>
                      <div className="text-xs text-slate-500">{lecturer.departmentId}</div>
                    </TableCell>
                    <TableCell className="text-center font-bold text-slate-700">
                      {lecturer._count.classSections}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                        Đang công tác
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {lecturers.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p>Không tìm thấy giảng viên nào.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
