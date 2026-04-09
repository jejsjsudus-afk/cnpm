import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "./ProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { UserCircle } from "lucide-react";

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return <div>Không có quyền truy cập</div>;
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: { user: true }
  });

  if (!student) return <div>Không tìm thấy sinh viên</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <UserCircle className="h-6 w-6 text-blue-600" />
          Hồ sơ Cá nhân
        </h1>
        <p className="text-slate-500">Xem và cập nhật thông tin liên lạc của bạn</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         {/* Read-only Information */}
         <Card className="shadow-sm border-t-4 border-t-slate-300">
           <CardHeader>
             <CardTitle className="text-lg">Thông tin Học vụ</CardTitle>
             <CardDescription>Dữ liệu này không thể tự chỉnh sửa</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
              <div>
                 <p className="text-sm text-slate-500 mb-1">Mã thẻ sinh viên (MSSV)</p>
                 <p className="font-mono font-medium text-slate-900">{student.mssv}</p>
              </div>
              <div>
                 <p className="text-sm text-slate-500 mb-1">Họ và Tên</p>
                 <p className="font-semibold text-slate-900">{student.user.name}</p>
              </div>
              <div>
                 <p className="text-sm text-slate-500 mb-1">Khóa học</p>
                 <p className="font-medium text-slate-900">K{student.cohort}</p>
              </div>
              <div>
                 <p className="text-sm text-slate-500 mb-1">Email trường cấp</p>
                 <p className="font-medium text-slate-900">{student.user.email}</p>
              </div>
           </CardContent>
         </Card>

         {/* Editable Form */}
         <Card className="shadow-sm border-t-4 border-t-blue-500">
           <CardHeader>
             <CardTitle className="text-lg">Thông tin Liên hệ</CardTitle>
             <CardDescription>Cập nhật số điện thoại và địa chỉ mới nhất</CardDescription>
           </CardHeader>
           <CardContent>
             <ProfileForm 
               initialData={{
                 phone: student.phone || "",
                 address: student.address || "",
                 idCardNumber: student.idCardNumber || "",
               }} 
             />
           </CardContent>
         </Card>

         {/* Change Password */}
         <Card className="shadow-sm border-t-4 border-t-slate-800 md:col-span-2">
           <CardHeader>
             <CardTitle className="text-lg">Bảo mật Tài khoản</CardTitle>
             <CardDescription>Thay đổi mật khẩu đăng nhập của bạn</CardDescription>
           </CardHeader>
           <CardContent className="md:w-1/2">
             <ChangePasswordForm />
           </CardContent>
         </Card>
      </div>
    </div>
  )
}
