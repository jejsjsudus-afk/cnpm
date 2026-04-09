import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SearchX, FileQuestion } from "lucide-react";
import { DecisionButtons } from "./DecisionButtons";


export default async function LecturerRegradePage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "LECTURER") {
    return <div>Không có quyền truy cập</div>;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { lecturer: true }
  });

  if (!user?.lecturer) return null;

  const requests = await prisma.regradeRequest.findMany({
    where: {
      classSection: {
        lecturerId: user.lecturer.id
      }
    },
    include: {
      student: { include: { user: true } },
      classSection: { include: { course: true } },
      component: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <SearchX className="h-6 w-6 text-orange-500" />
            Đơn phúc khảo
          </h1>
          <p className="text-slate-500">Tiếp nhận và tra soát điểm thi theo yêu cầu của sinh viên</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Danh sách Đơn yêu cầu</CardTitle>
            <CardDescription className="mt-1">Dữ liệu được cập nhật theo thời gian thực</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="w-32">MSSV</TableHead>
                  <TableHead>Họ Tên</TableHead>
                  <TableHead>Môn học</TableHead>
                  <TableHead className="text-center">Điểm cũ</TableHead>
                  <TableHead className="text-center">Điểm mong muốn</TableHead>
                  <TableHead>Lý do</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Xử lý</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-mono text-sm font-medium text-slate-600">
                      {req.student.mssv}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {req.student.user.name}
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium text-sm">
                      <div>{req.classSection.course.name}</div>
                      <div className="text-[10px] text-blue-500 font-bold uppercase mt-0.5 px-1.5 py-0.5 bg-blue-50 rounded w-fit">
                        {req.component?.componentName || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-slate-500 line-through decoration-red-400 opacity-70 border border-slate-200 px-2 py-0.5 rounded text-sm bg-slate-100">{req.currentScore.toFixed(1)}</span>
                    </TableCell>
                    <TableCell className="text-center font-bold text-orange-500 text-sm">
                      {req.requestedScore !== null && req.requestedScore !== undefined ? req.requestedScore.toFixed(1) : "?"}
                    </TableCell>
                    <TableCell>
                      <p className="max-w-[200px] text-xs text-slate-500 italic truncate" title={req.reason}>
                        &ldquo;{req.reason}&rdquo;
                      </p>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={req.status === "PENDING" ? "default" : "secondary"} className={req.status === "PENDING" ? "bg-orange-100 text-orange-700 hover:bg-orange-200 border-none" : ""}>
                        {req.status === "PENDING" ? "Chờ xử lý" : req.status === "APPROVED" ? "Đã duyệt" : "Từ chối"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                       <DecisionButtons requestId={req.id} status={req.status} currentScore={req.currentScore} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {requests.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <FileQuestion className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p>Tuyệt vời! Không có đơn phúc khảo nào cần xử lý.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


