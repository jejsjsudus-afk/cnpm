import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { 
  BookOpen,
  CreditCard, TrendingUp, Users, AlertTriangle 
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const userId = session?.user?.id;

  if (role === "STUDENT") {
    // Fetch student data
    if (!userId) return null;
    
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        enrollments: { include: { classSection: { include: { course: true } } } },
        invoices: true,
      }
    });

    const pendingInvoices = student?.invoices.filter(i => i.status === "PENDING").length || 0;
    const totalCredits = student?.totalCredits || 0;
    const gpa = student?.currentGPA || 0;
    const currentClassesCount = student?.enrollments.filter(e => e.status === "ENROLLED").length || 0;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Xin chào, {session?.user?.name}</h1>
          <p className="text-slate-500">Mã sinh viên: {student?.mssv} | Khóa: {student?.cohort}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm shadow-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Lớp đang học</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{currentClassesCount}</div>
              <p className="text-xs text-slate-500 mt-1">Học phần trong kỳ này</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm shadow-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Điểm trung bình (GPA)</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{gpa.toFixed(2)}</div>
              <p className="text-xs text-slate-500 mt-1">Tích lũy toàn khóa</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm shadow-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tín chỉ hoàn thành</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalCredits}</div>
              <p className="text-xs text-slate-500 mt-1">Trên tổng 145 tín chỉ</p>
            </CardContent>
          </Card>
          <Card className={`border-0 shadow-sm shadow-slate-200 ${pendingInvoices > 0 ? "bg-red-50 border border-red-100" : ""}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Công nợ học phí</CardTitle>
              <CreditCard className={`h-4 w-4 ${pendingInvoices > 0 ? "text-red-500" : "text-slate-400"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${pendingInvoices > 0 ? "text-red-600" : "text-slate-900"}`}>
                {pendingInvoices > 0 ? `${pendingInvoices} hóa đơn chưa nộp` : "Đã hoàn thành"}
              </div>
              {pendingInvoices > 0 && <p className="text-xs text-red-500 mt-1">Vui lòng thanh toán sớm</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Manager or Lecturer Dashboards would be added here
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Giao diện Bảng điều khiển</h1>
        <p className="text-slate-500">Xin chào {session?.user?.name} ({role})</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm shadow-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Tổng Sinh Viên</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">4,520</div>
            <p className="text-xs text-emerald-500 mt-1 flex items-center">+120 kỳ này</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm shadow-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Lớp Đang Mở</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">386</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm shadow-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Cảnh báo học vụ</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">124</div>
            <p className="text-xs text-red-500 mt-1 uppercase">Cần xử lý</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

