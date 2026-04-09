import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Activity } from "lucide-react";


export default async function SystemAuditLogsPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
    return <div>Không có quyền truy cập</div>;
  }

  const logs = await prisma.auditLog.findMany({
    take: 100,
    orderBy: { timestamp: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-red-600" />
          Nhật ký Hoạt động Hệ thống
        </h1>
        <p className="text-slate-500">Giám sát 100 thay đổi dữ liệu gần nhất trong hệ thống quản lý</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-indigo-500" /> 
              Trails Hoạt Động
            </CardTitle>
            <CardDescription className="mt-1">Dữ liệu được bảo vệ và không thể xóa.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="w-48">Thời gian</TableHead>
                  <TableHead className="w-32">User ID Actuator</TableHead>
                  <TableHead className="text-center w-32">Hành động</TableHead>
                  <TableHead className="w-32">Thực thể (Entity)</TableHead>
                  <TableHead>Chi tiết Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  return (
                    <TableRow key={log.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="text-sm font-medium text-slate-500">
                        {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(log.timestamp))}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-400">
                        {log.userId.split('-').shift() || log.userId}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={log.action === "UPDATE" ? "secondary" : log.action === "DELETE" ? "destructive" : "default"}>
                           {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-700">
                        {log.entity}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">
                        <span className="bg-slate-100 p-1 rounded-sm line-clamp-1 max-w-[400px]">
                            {log.newData || log.oldData || "No data payload"}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {logs.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <ShieldAlert className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p>Chưa có log hoạt động nào.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

