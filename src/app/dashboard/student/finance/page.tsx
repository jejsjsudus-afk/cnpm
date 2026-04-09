import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PaymentButton } from "./PaymentButton";
import { Banknote, ReceiptText, ShieldCheck } from "lucide-react";


export default async function FinancePage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "STUDENT") {
    return <div>Không có quyền truy cập</div>;
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });

  if (!student) return null;

  const invoices = await prisma.tuitionInvoice.findMany({
    where: { studentId: student.id },
    include: {
      semester: true,
      payments: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalDebt = invoices
    .filter((invoice) => invoice.status === "PENDING")
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Học phí</h1>
        <p className="text-slate-500">Tra cứu công nợ và thanh toán trực tuyến</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-t-4 border-t-red-500 bg-red-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Banknote className="h-4 w-4 text-red-600" />
              Tổng công nợ cần đóng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${totalDebt > 0 ? "text-red-700" : "text-emerald-600"}`}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalDebt)}
            </div>
            <p className={`text-xs mt-1 ${totalDebt > 0 ? "text-red-500" : "text-emerald-500"}`}>{totalDebt > 0 ? "Vui lòng hoàn thành học phí trước hạn" : "Bạn đã hoàn thành nghĩa vụ tài chính"}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
               <div className="p-3 bg-blue-50 text-blue-600 rounded-full shrink-0">
                  <ShieldCheck className="h-6 w-6" />
               </div>
               <div>
                 <h3 className="font-semibold text-slate-900 mb-1">Thanh toán an toàn</h3>
                 <p className="text-sm text-slate-500 leading-relaxed">
                   Hệ thống tích hợp cổng thanh toán VNPAY đảm bảo giao dịch tức thì, an toàn và bảo mật. Học phí sẽ được gạch nợ ngay lập tức sau khi giao dịch thành công.
                 </p>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-slate-500" />
            Danh sách hóa đơn
          </CardTitle>
          <CardDescription>Các khoản thu học phí, lệ phí theo học kỳ</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Mã HĐ</TableHead>
                    <TableHead>Học kỳ / Khoản thu</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Số tiền (VND)</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="text-center">Thanh toán</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-xs text-slate-500">
                        #{invoice.id.split("-").shift()?.toUpperCase()}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {invoice.semester.name}
                        <div className="text-xs font-normal text-slate-500 mt-0.5">
                          Học phí theo tín chỉ
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Intl.DateTimeFormat("vi-VN").format(new Date(invoice.createdAt))}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat("vi-VN").format(invoice.totalAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={invoice.status === "PAID" ? "default" : "destructive"}
                          className={invoice.status === "PAID" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                        >
                          {invoice.status === "PAID" ? "Đã nộp" : "Chưa nộp"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <PaymentButton invoiceId={invoice.id} status={invoice.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
              Hiện chưa có hóa đơn học phí nào được phát hành cho sinh viên này.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

