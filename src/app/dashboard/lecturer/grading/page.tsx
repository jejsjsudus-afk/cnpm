import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GradeCell } from "./GradeCell";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FileSpreadsheet, AlertCircle } from "lucide-react";
import type { Prisma } from "@prisma/client";

type EnrollmentWithScores = Prisma.EnrollmentGetPayload<{
  include: {
    student: { include: { user: true } };
    scores: true;
  };
}>;
type ScoreSetting = Prisma.ScoreSettingsGetPayload<Record<string, never>>;

export default async function GradingPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "LECTURER") {
    return <div>Không có quyền truy cập</div>;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { lecturer: true }
  });

  if (!user?.lecturer) return null;

  // Fetch all classes for the lecturer
  const classes = await prisma.classSection.findMany({
    where: { lecturerId: user.lecturer.id },
    include: {
      course: true,
      semester: true,
    }
  });

  const selectedClassId = resolvedSearchParams.classId || (classes.length > 0 ? classes[0].id : null);
  
  let enrollments: EnrollmentWithScores[] = [];
  let scoreSettings: ScoreSetting[] = [];
  let selectedClass = null;

  if (selectedClassId) {
    selectedClass = classes.find((currentClass) => currentClass.id === selectedClassId) ?? null;
    
    // Fetch score configurations for the course
    if (selectedClass) {
      scoreSettings = await prisma.scoreSettings.findMany({
        where: { courseId: selectedClass.course.id },
        orderBy: { componentName: 'asc' }
      });

      // Fetch enrolled students and their scores
      enrollments = await prisma.enrollment.findMany({
        where: { classSectionId: selectedClassId, status: "ENROLLED" },
        include: {
          student: { include: { user: true } },
          scores: true,
        },
        orderBy: { student: { mssv: 'asc' } }
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
            Vào Điểm (Grid Editor)
          </h1>
          <p className="text-slate-500">Quản lý và chốt điểm cho sinh viên</p>
        </div>
      </div>

      <div className="grid grid-cols-[300px_1fr] gap-6">
        <Card className="shadow-sm self-start hidden lg:block">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base">Lớp học phần</CardTitle>
          </CardHeader>
          <div className="flex flex-col max-h-[600px] overflow-y-auto">
            {classes.map((cls) => {
              const active = cls.id === selectedClassId;
              return (
                <Link 
                  key={cls.id} 
                  href={`/dashboard/lecturer/grading?classId=${cls.id}`}
                  className={cn(
                    "px-4 py-3 border-b border-slate-100 transition-colors hover:bg-slate-50",
                    active ? "bg-emerald-50 border-l-4 border-l-emerald-500 border-b-transparent text-emerald-800" : "text-slate-600"
                  )}
                >
                  <div className="font-semibold text-sm line-clamp-1">{cls.course.name}</div>
                  <div className="text-xs opacity-80 mt-1">{cls.course.code} • {cls.semester.name}</div>
                </Link>
              )
            })}
            {classes.length === 0 && <div className="p-4 text-sm text-slate-500">Không có lớp nào</div>}
          </div>
        </Card>

        {selectedClassId && selectedClass ? (
          <Card className="shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle>{selectedClass.course.name} (Học kỳ {selectedClass.semester.name})</CardTitle>
              <CardDescription>Click vào điểm để cập nhật. Vui lòng bấm (Chốt) để công bố điểm thay vì lưu nháp.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {scoreSettings.length > 0 ? (
                <div className="overflow-x-auto min-h-[400px]">
                  <Table className="whitespace-nowrap">
                    <TableHeader>
                      <TableRow className="bg-slate-100 hover:bg-slate-100 border-b border-slate-200">
                        <TableHead className="w-12 text-center border-r border-slate-200">STT</TableHead>
                        <TableHead className="w-32 border-r border-slate-200">MSSV</TableHead>
                        <TableHead className="w-64 border-r border-slate-200">Họ và Tên</TableHead>
                        {scoreSettings.map((setting) => (
                          <TableHead key={setting.id} className="text-center bg-blue-50/50 border-r border-slate-200">
                            <span className="block font-semibold text-slate-700">{setting.componentName}</span>
                            <span className="block text-xs font-normal text-slate-500 mt-0.5">({setting.percentage}%)</span>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollments.map((enroll, idx) => (
                        <TableRow key={enroll.id}>
                          <TableCell className="text-center text-slate-400 border-r border-slate-100">{idx + 1}</TableCell>
                          <TableCell className="font-mono text-xs uppercase text-slate-600 border-r border-slate-100">{enroll.student.mssv}</TableCell>
                          <TableCell className="font-medium text-slate-900 border-r border-slate-100">{enroll.student.user.name}</TableCell>
                          
                          {scoreSettings.map((setting) => {
                            const scoreRecord = enroll.scores.find((score) => score.componentId === setting.id);
                            return (
                              <TableCell key={setting.id} className="text-center p-1 border-r border-slate-100 hover:bg-slate-50/80">
                                <div className="flex justify-center">
                                  <GradeCell 
                                    enrollmentId={enroll.id} 
                                    componentId={setting.id} 
                                    initialValue={scoreRecord?.scoreValue ?? null}
                                    initialFinalized={scoreRecord?.isFinalized ?? false}
                                  />
                                </div>
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-12 text-center max-w-md mx-auto">
                   <AlertCircle className="h-10 w-10 text-orange-400 mx-auto mb-4" />
                   <h3 className="font-semibold text-slate-900 mb-2">Chưa cấu hình cơ cấu điểm</h3>
                   <p className="text-sm text-slate-500 leading-relaxed">Phòng đào tạo chưa thiết lập phần trăm điểm (Chuyên cần, Giữa kỳ, Cuối kỳ) cho môn học này. Vui lòng liên hệ Admin.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
           <Card className="shadow-sm flex items-center justify-center p-12 text-slate-500">
              Vui lòng chọn một lớp học phần ở bên trái
           </Card>
        )}
      </div>
    </div>
  )
}

