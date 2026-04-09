import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SearchX, FileQuestion, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { RegradeForm } from "./RegradeForm";
import { CancelButton } from "./CancelButton";


function getStatusConfig(status: string) {
  switch (status) {
    case "PENDING":
      return { label: "Chờ xử lý", icon: Clock, className: "bg-amber-100 text-amber-700 border-amber-200" };
    case "EVALUATING":
      return { label: "Đang xem xét", icon: AlertCircle, className: "bg-blue-100 text-blue-700 border-blue-200" };
    case "APPROVED":
      return { label: "Đã chấp nhận", icon: CheckCircle2, className: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    case "REJECTED":
      return { label: "Từ chối", icon: XCircle, className: "bg-red-100 text-red-700 border-red-200" };
    default:
      return { label: status, icon: Clock, className: "" };
  }
}

export default async function StudentRegradePage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "STUDENT") {
    return <div>Không có quyền truy cập</div>;
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      regradeReqs: {
        include: {
          component: true,
          classSection: {
            include: {
              course: true,
              lecturer: { include: { user: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      enrollments: {
        where: { status: "ENROLLED" },
        include: {
          classSection: {
            include: {
              course: {
                include: { scoreSettings: true },
              },
              semester: true,
            },
          },
          scores: {
            include: { component: true },
          },
        },
      },
    },
  });

  if (!student) return null;

  // Build class options with calculated total scores for the form
  const classOptions = student.enrollments.map((enroll) => {
    const section = enroll.classSection;
    const course = section.course;
    let totalScore: number | null = null;

    if (enroll.scores.length > 0) {
      let sum = 0;
      let allScored = true;
      enroll.scores.forEach((s) => {
        if (s.scoreValue !== null) {
          sum += s.scoreValue * (s.component.percentage / 100);
        } else {
          allScored = false;
        }
      });
      if (allScored && enroll.scores.length === course.scoreSettings.length) {
        totalScore = sum;
      }
    }

    return {
      sectionId: section.id,
      courseName: course.name,
      courseCode: course.code,
      totalScore,
      components: enroll.scores.map(s => ({
        id: s.component.id,
        name: s.component.componentName,
        score: s.scoreValue
      }))
    };
  });

  const requests = student.regradeReqs;
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = requests.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <SearchX className="h-6 w-6 text-orange-500" />
            Phúc khảo điểm
          </h1>
          <p className="text-slate-500">Gửi yêu cầu xem xét lại kết quả thi và theo dõi trạng thái</p>
        </div>
        <RegradeForm classes={classOptions} />
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-t-4 border-t-amber-400 bg-amber-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" /> Đang chờ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-t-4 border-t-emerald-400 bg-emerald-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Đã duyệt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-t-4 border-t-red-400 bg-red-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" /> Từ chối
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{rejectedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Requests table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100">
          <CardTitle>Lịch sử đơn phúc khảo</CardTitle>
          <CardDescription>Theo dõi trạng thái các đơn yêu cầu phúc khảo điểm của bạn</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead>Ngày gửi</TableHead>
                  <TableHead>Môn học / Cột điểm</TableHead>
                  <TableHead className="text-center">Điểm cũ</TableHead>
                  <TableHead className="text-center">Duyệt mới</TableHead>
                  <TableHead>Lý do & Phản hồi</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => {
                  const statusConfig = getStatusConfig(req.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <TableRow key={req.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">{req.classSection.course.name}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 uppercase">
                            {req.classSection.course.code}
                          </span>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase">
                            {req.component?.componentName || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-bold text-slate-500 line-through decoration-red-400 opacity-70 border border-slate-200 px-2 py-0.5 rounded text-sm bg-slate-100">
                          {req.currentScore.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-bold text-emerald-600 text-sm">
                        {req.status === "APPROVED" && req.approvedScore !== null ? (
                          <div className="flex flex-col items-center">
                            <span className="text-lg">{req.approvedScore.toFixed(1)}</span>
                            <span className="text-[9px] text-slate-400 uppercase tracking-tighter">Approved</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[250px] space-y-1.5">
                          <p className="text-xs text-slate-600 italic leading-relaxed">
                            <span className="font-semibold text-slate-400 mr-1">SV:</span>
                            &ldquo;{req.reason}&rdquo;
                          </p>
                          {req.lecturerComment && (
                            <div className="bg-blue-50/50 border-l-2 border-l-blue-400 p-2 rounded-r-md">
                              <p className="text-[11px] text-blue-700 leading-relaxed">
                                <span className="font-bold uppercase mr-1">GV:</span>
                                {req.lecturerComment}
                              </p>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`${statusConfig.className} border gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {req.status === "PENDING" ? (
                          <CancelButton requestId={req.id} />
                        ) : (
                          <span className="text-xs text-slate-400">Đã đóng</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {requests.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <FileQuestion className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="font-medium text-slate-600 mb-1">Chưa có đơn phúc khảo nào</p>
                <p className="text-sm">Nhấn &ldquo;Tạo đơn phúc khảo mới&rdquo; để gửi yêu cầu xem xét lại điểm thi.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

