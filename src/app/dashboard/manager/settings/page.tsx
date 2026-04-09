import { getServerSession } from "next-auth/next";
import { Settings, ShieldCheck, Wrench } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function GlobalSettingsPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
    return <div>Không có quyền truy cập</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-slate-600" />
          Cấu hình Hệ thống
        </h1>
        <p className="text-slate-500">Thiết lập tham số vận hành cho toàn bộ hạ tầng quản lý đào tạo.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Trạng thái bảo mật
            </CardTitle>
            <CardDescription>
              `NEXTAUTH_SECRET` đã được cấu hình và fallback secret đã bị loại bỏ khỏi mã nguồn.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              Gợi ý hoàn thiện
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-500 leading-relaxed">
            Bước tiếp theo nên là thêm form cấu hình thật cho hệ thống email, kỳ học hiện tại, chính sách học phí và phân quyền quản trị.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
