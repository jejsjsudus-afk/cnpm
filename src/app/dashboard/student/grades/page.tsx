import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BarChart } from "lucide-react";


export default async function GradesPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "STUDENT") {
    return <div>Không có quyền truy cập</div>;
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      enrollments: {
        include: {
          classSection: {
            include: {
              course: {
                include: {
                  scoreSettings: true
                }
              },
              semester: true
            }
          },
          scores: {
            include: {
              component: true
            }
          }
        }
      }
    }
  });

  if (!student) return null;

  const enrollments = student.enrollments || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kết quả học tập</h1>
        <p className="text-slate-500">Xem điểm số chi tiết các môn học</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-t-4 border-t-emerald-500 bg-emerald-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <BarChart className="h-4 w-4 text-emerald-600" />
              Điểm trung bình (GPA)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{student.currentGPA.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">Thang điểm 4</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-4 border-t-blue-500 bg-blue-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-blue-600" />
              Tín chỉ tích lũy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{student.totalCredits}</div>
            <p className="text-xs text-slate-500 mt-1">Trên tổng yêu cầu khóa học</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Bảng điểm chi tiết</CardTitle>
          <CardDescription>Bao gồm điểm thành phần và điểm tổng kết</CardDescription>
        </CardHeader>
        <CardContent>
          {enrollments.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Mã LHP</TableHead>
                    <TableHead>Tên Môn Học</TableHead>
                    <TableHead className="text-center">Tín chỉ</TableHead>
                    <TableHead className="text-center w-20">CC</TableHead>
                    <TableHead className="text-center w-20">GK</TableHead>
                    <TableHead className="text-center w-20">CK</TableHead>
                    <TableHead className="text-center">Tổng Kết</TableHead>
                    <TableHead className="text-center">Điểm Chữ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enroll) => {
                    const section = enroll.classSection;
                    const course = section.course;
                    const settings = course.scoreSettings;
                    
                    // Initialize mapped scores
                    let totalScore = 0;
                    let cc = "-", gk = "-", ck = "-";
                    let hasAllFinalized = true;

                    enroll.scores.forEach(score => {
                      if (!score.isFinalized) hasAllFinalized = false;
                      const val = score.scoreValue;
                      if (val !== null) {
                        const sName = score.component.componentName.toLowerCase();
                        if (sName.includes("chuyên cần")) cc = val.toString();
                        else if (sName.includes("giữa kỳ")) gk = val.toString();
                        else if (sName.includes("cuối kỳ")) ck = val.toString();
                        
                        totalScore += val * (score.component.percentage / 100);
                      } else {
                         hasAllFinalized = false;
                      }
                    });

                    // Determine char grade (simplified rules)
                    let charGrade = "-";
                    let finalScoreStr = "-";
                    if (hasAllFinalized && enroll.scores.length === settings.length && enroll.scores.length > 0) {
                       finalScoreStr = totalScore.toFixed(1);
                       if (totalScore >= 8.5) charGrade = "A";
                       else if (totalScore >= 7.0) charGrade = "B";
                       else if (totalScore >= 5.5) charGrade = "C";
                       else if (totalScore >= 4.0) charGrade = "D";
                       else charGrade = "F";
                    } else if (enroll.scores.length === 0) {
                        hasAllFinalized = false;
                    }

                    return (
                      <TableRow key={enroll.id}>
                        <TableCell className="font-medium text-slate-500">{course.code}</TableCell>
                        <TableCell className="font-medium text-slate-900">{course.name}</TableCell>
                        <TableCell className="text-center">{course.credits}</TableCell>
                        <TableCell className="text-center">{cc}</TableCell>
                        <TableCell className="text-center">{gk}</TableCell>
                        <TableCell className="text-center">{ck}</TableCell>
                        <TableCell className="text-center font-bold text-slate-700">
                          {finalScoreStr}
                        </TableCell>
                        <TableCell className="text-center">
                          {charGrade !== "-" ? (
                            <Badge variant={charGrade === "F" ? "destructive" : "default"} 
                                   className={charGrade === "A" ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                              {charGrade}
                            </Badge>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
             <div className="text-center py-10">Bạn chưa có dữ liệu môn học nào.</div>
          )}
          <div className="mt-4 flex gap-4 text-xs text-slate-500 justify-end">
            <span>* CC: Chuyên cần</span>
            <span>* GK: Giữa kỳ</span>
            <span>* CK: Cuối kỳ</span>
            <span>Lưu ý: Chỉ các điểm đã công bố (Finalized) mới được hiển thị bảng kết quả.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

