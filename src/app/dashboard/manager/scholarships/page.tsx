import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Medal, Download } from "lucide-react";
import { Button } from "@/components/ui/button";


export default async function ManagerScholarshipsPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "MANAGER" && session?.user?.role !== "ADMIN") {
    return <div>Không có quyền truy cập</div>;
  }

  // Find top 10 students by GPA logically
  const topStudents = await prisma.student.findMany({
    where: { currentGPA: { gte: 3.2 } },
    include: { user: true },
    orderBy: { currentGPA: 'desc' },
    take: 10
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Medal className="h-6 w-6 text-yellow-500" />
            Khuyến khích Học tập (Học bổng)
          </h1>
          <p className="text-slate-500">Danh sách Top sinh viên xuất sắc nhất Học kỳ</p>
        </div>
        <Button variant="outline" className="gap-2">
           <Download className="h-4 w-4" />
           Xuất Excel
        </Button>
      </div>

      <Card className="shadow-sm border-t-4 border-t-yellow-400">
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top 10 Tân khoa Xuất sắc</CardTitle>
            <CardDescription className="mt-1">Trao học bổng dựa vào quỹ KKHT của Trường</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-[300px]">
             {topStudents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="w-16 text-center">Xếp hạng</TableHead>
                      <TableHead className="w-32">MSSV</TableHead>
                      <TableHead>Họ và Tên</TableHead>
                      <TableHead className="text-center">Khoa / Viện</TableHead>
                      <TableHead className="text-center text-yellow-600">GPA Học kỳ</TableHead>
                      <TableHead className="text-right">Mức quỹ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topStudents.map((student, idx) => {
                       return (
                          <TableRow key={student.id} className="hover:bg-slate-50 transition-colors">
                            <TableCell className="text-center">
                               {idx === 0 ? <span className="font-bold text-2xl text-yellow-500">🥇</span> : 
                                idx === 1 ? <span className="font-bold text-2xl text-slate-400">🥈</span> :
                                idx === 2 ? <span className="font-bold text-2xl text-amber-600">🥉</span> : 
                                <span className="text-slate-400 font-bold">{idx + 1}</span>}
                            </TableCell>
                            <TableCell className="font-mono text-sm font-medium text-slate-600">{student.mssv}</TableCell>
                            <TableCell className="font-bold text-slate-900">{student.user.name}</TableCell>
                            <TableCell className="text-center font-medium text-slate-500">CNTT</TableCell>
                            <TableCell className="text-center font-black text-slate-900 text-lg">{student.currentGPA.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-semibold text-emerald-600">
                               {idx < 3 ? "Loại A (15.000.000đ)" : "Loại B (8.000.000đ)"}
                            </TableCell>
                          </TableRow>
                       )
                    })}
                  </TableBody>
                </Table>
             ) : (
                <div className="text-center py-16 text-slate-500">
                  <Medal className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                  <p>Chưa có dữ liệu sinh viên có thành tích xuất sắc để trao thưởng.</p>
                </div>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

