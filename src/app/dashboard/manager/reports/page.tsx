import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ReportsCharts } from "./ReportsCharts";
import { PieChartIcon } from "lucide-react";


export default async function GlobalReportsPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
    return <div>Không có quyền truy cập</div>;
  }

  const students = await prisma.student.findMany();
  
  // Aggregate GPA groups
  let excellent = 0, good = 0, average = 0, poor = 0;
  students.forEach(s => {
    if(s.currentGPA >= 3.2) excellent++;
    else if(s.currentGPA >= 2.5) good++;
    else if(s.currentGPA >= 2.0) average++;
    else poor++;
  });

  const gradeData = [
    { name: 'Giỏi', value: excellent },
    { name: 'Khá', value: good },
    { name: 'Trung bình', value: average },
    { name: 'Yếu / Kém', value: poor },
  ].filter(c => c.value > 0);

  // Aggregate Finance Data
  const invoices = await prisma.tuitionInvoice.groupBy({
    by: ['status'],
    _count: {
       status: true
    }
  });

  let paid = 0, pending = 0;
  invoices.forEach(inv => {
     if(inv.status === "PAID") paid = inv._count.status;
     if(inv.status === "PENDING") pending = inv._count.status;
  });

  const financeData = [
     { name: 'Đã nộp', value: paid },
     { name: 'Chưa nộp', value: pending },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <PieChartIcon className="h-6 w-6 text-purple-600" />
          Báo cáo thống kê
        </h1>
        <p className="text-slate-500">Tổng hợp dữ liệu toàn trường theo dạng biểu đồ</p>
      </div>

      <ReportsCharts gradeData={gradeData} financeData={financeData} />
    </div>
  )
}

