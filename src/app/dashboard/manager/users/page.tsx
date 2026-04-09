import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserCog, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateUserButton } from "./CreateUserButton";
import { ChangeRoleModal } from "./ChangeRoleModal";
import { LockButton } from "./LockButton";


export default async function UsersManagementPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
    return <div>Không có quyền truy cập</div>;
  }

  const users = await prisma.user.findMany({
    orderBy: { role: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <UserCog className="h-6 w-6 text-purple-600" />
            Nhân sự & Phân quyền
          </h1>
          <p className="text-slate-500">Quản lý danh sách tài khoản định danh trong hệ thống đào tạo</p>
        </div>
        <CreateUserButton callerRole={session.user.role} />
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-indigo-500" /> 
              Danh sách Identity (Nhóm phân quyền)
            </CardTitle>
            <CardDescription className="mt-1">Tra cứu các vai trò: Quản trị, Đào tạo, Giảng viên, Sinh viên</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="w-64">ID Tài khoản</TableHead>
                  <TableHead>Email đăng nhập</TableHead>
                  <TableHead>Họ và Tên</TableHead>
                  <TableHead className="text-center">Role (Phân quyền)</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  return (
                    <TableRow key={u.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-mono text-xs font-medium text-slate-500">
                        {u.id.split('-').shift()}****
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {u.email}
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">
                        {u.name}
                      </TableCell>
                      <TableCell className="text-center">
                         <Badge variant={u.role === "ADMIN" ? "default" : u.role === "MANAGER" ? "secondary" : "outline"} className={u.role === "ADMIN" ? "bg-purple-600 hover:bg-purple-700" : ""}>
                            {u.role === "ADMIN" ? "Quản trị kỹ thuật" : u.role === "MANAGER" ? "Phòng Đào tạo" : u.role}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={u.status === "ACTIVE" ? "default" : "destructive"} className={u.status === "ACTIVE" ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                          {u.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <ChangeRoleModal 
                          userId={u.id} 
                          userEmail={u.email} 
                          currentRole={u.role} 
                          callerRole={session.user.role} 
                        />
                        <LockButton userId={u.id} status={u.status} />
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

