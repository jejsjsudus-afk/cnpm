import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookMarked, SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateCourseForm } from "./CreateCourseForm";


export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "MANAGER" && session?.user?.role !== "ADMIN") {
    return <div>Không có quyền truy cập</div>;
  }

  const query = resolvedSearchParams.q || "";

  const courses = await prisma.course.findMany({
    where: {
      OR: [
        { code: { contains: query } },
        { name: { contains: query } },
      ]
    },
    include: {
      scoreSettings: true,
      _count: {
        select: { classSections: true }
      }
    },
    orderBy: { code: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Chương trình Đào tạo</h1>
          <p className="text-slate-500">Quản lý các học phần, tín chỉ và cơ cấu điểm số</p>
        </div>
        <CreateCourseForm />
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-indigo-500" /> 
              Danh mục Khung chương trình (Môn học)
            </CardTitle>
            <CardDescription className="mt-1">Tra cứu danh sách Môn học toàn trường</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="w-32">Mã Học Phần</TableHead>
                  <TableHead>Tên Môn Học</TableHead>
                  <TableHead className="text-center">Số Tín Chỉ</TableHead>
                  <TableHead className="text-center">Lớp HP Từng Mở</TableHead>
                  <TableHead>Cấu hình Điểm</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => {
                  return (
                    <TableRow key={course.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-mono text-sm font-medium text-slate-500">
                        {course.code}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900">
                        {course.name}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">{course.credits} TC</Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {course._count.classSections} lớp
                      </TableCell>
                      <TableCell>
                        {course.scoreSettings.length > 0 ? (
                           <div className="flex gap-2">
                              {course.scoreSettings.map((set, i) => (
                                 <Badge key={i} variant="secondary" className="text-xs">
                                    {set.componentName} ({set.percentage}%)
                                 </Badge>
                              ))}
                           </div>
                        ) : (
                           <span className="text-xs text-orange-500 italic flex items-center gap-1">
                             <SettingsIcon className="h-3 w-3" /> Chưa cấu hình
                           </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          Sửa
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {courses.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <BookMarked className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p>Hệ thống chưa có môn học nào.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

