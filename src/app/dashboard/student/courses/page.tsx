import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EnrollButton } from "./EnrollButton";


export default async function CourseRegistrationPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "STUDENT") {
    return <div>Không có quyền truy cập</div>;
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      enrollments: true,
    }
  });

  const enrolledSectionIds = student?.enrollments.map(e => e.classSectionId) || [];

  // Fetch all OPEN class sections
  const availableSections = await prisma.classSection.findMany({
    where: { status: "OPEN" },
    include: {
      course: true,
      lecturer: { include: { user: true } },
      schedules: true,
      _count: {
        select: { enrollments: true },
      }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đăng ký học phần</h1>
        <p className="text-slate-500">Lựa chọn học phần cho học kỳ hiện tại</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Danh sách lớp học phần mở</CardTitle>
          <CardDescription>Học kỳ 1 Năm học 2023-2024</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Mã LHP</TableHead>
                  <TableHead>Tên Môn Học</TableHead>
                  <TableHead>Giảng Viên</TableHead>
                  <TableHead className="text-center">Tín chỉ</TableHead>
                  <TableHead className="text-center">Sĩ số</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableSections.map((section) => {
                  const isEnrolled = enrolledSectionIds.includes(section.id);
                  const isFull = section._count.enrollments >= section.capacity;

                  return (
                    <TableRow key={section.id}>
                      <TableCell className="font-medium text-slate-900">{section.course.code}</TableCell>
                      <TableCell>{section.course.name}</TableCell>
                      <TableCell>{section.lecturer.user.name}</TableCell>
                      <TableCell className="text-center">{section.course.credits}</TableCell>
                      <TableCell className="text-center w-32">
                        <Badge variant={isFull ? "destructive" : "secondary"}>
                          {section._count.enrollments} / {section.capacity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <EnrollButton 
                          sectionId={section.id} 
                          isEnrolled={isEnrolled} 
                          disabled={isFull} 
                        />
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

