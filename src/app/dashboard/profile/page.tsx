import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Building, CalendarDays, ShieldCheck } from "lucide-react";


export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return <div>Không có quyền truy cập</div>;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      student: true,
      lecturer: true,
    }
  });

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hồ sơ cá nhân</h1>
        <p className="text-slate-500">Thông tin tài khoản và lý lịch người dùng</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card className="shadow-sm border-t-4 border-t-blue-500">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Avatar className="h-28 w-28 border-4 border-white shadow-xl shadow-slate-200 mb-4">
              <AvatarImage src="" />
              <AvatarFallback className="bg-slate-100 text-slate-600 text-3xl font-semibold">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500 mt-1 mb-3">{user.email}</p>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {user.role === "STUDENT" ? "Sinh Viên" : user.role === "LECTURER" ? "Giảng Viên" : user.role === "MANAGER" ? "Quản Lý Đào Tạo" : "Quản Trị Viên"}
            </Badge>

            <div className="w-full mt-8 space-y-4 text-sm">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>+84 123 456 789</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>Hà Nội, Việt Nam</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t border-slate-100 py-3 mt-4 text-xs text-slate-500 flex justify-center">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Tài khoản đã được xác thực
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5 text-slate-400" />
                Thông tin Vị trí
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {user.role === "STUDENT" && user.student ? (
                <div className="grid grid-cols-2 gap-4 gap-y-6">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Mã sinh viên (MSSV)</p>
                    <p className="font-semibold text-slate-900 uppercase mt-1">{user.student.mssv}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Khóa học</p>
                    <p className="font-semibold text-slate-900 mt-1">Khóa {user.student.cohort}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Ngành học</p>
                    <p className="font-semibold text-slate-900 mt-1">Công nghệ thông tin</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Khoa / Viện</p>
                    <p className="font-semibold text-slate-900 mt-1">Khoa CNTT</p>
                  </div>
                </div>
              ) : user.role === "LECTURER" && user.lecturer ? (
                 <div className="grid grid-cols-2 gap-4 gap-y-6">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Khoa / Viện</p>
                    <p className="font-semibold text-slate-900 mt-1">{user.lecturer.facultyId || "Chưa cập nhật"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Bộ môn</p>
                    <p className="font-semibold text-slate-900 mt-1">{user.lecturer.departmentId || "Chưa cập nhật"}</p>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 text-sm">Thông tin riêng của tài khoản đặc biệt.</div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-slate-400" />
                Lịch sử hoạt động
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3 mb-3">
                <span className="text-slate-500">Ngày tạo tài khoản</span>
                <span className="font-medium text-slate-900">
                  {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(user.createdAt))}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Cập nhật lần cuối</span>
                <span className="font-medium text-slate-900">
                  {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(user.updatedAt))}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

