"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, BookOpen, CalendarDays, 
  GraduationCap, CreditCard, Settings, Users,
  FileText, CheckSquare, ClipboardList, PieChart, ShieldAlert,
  CalendarClock, SearchX, Medal, UserCog, Bell, UserCircle
} from "lucide-react";
import { useSession } from "next-auth/react";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const menuGroups = [
    {
      label: "Học vụ & Sinh viên",
      roles: ["STUDENT"],
      routes: [
        { title: "Đăng ký học phần", icon: BookOpen, href: "/dashboard/student/courses" },
        { title: "TKB & Lịch thi", icon: CalendarDays, href: "/dashboard/student/schedule" },
        { title: "Kết quả học tập", icon: GraduationCap, href: "/dashboard/student/grades" },
        { title: "Điểm danh", icon: CheckSquare, href: "/dashboard/student/attendance" },
        { title: "Học phí", icon: CreditCard, href: "/dashboard/student/finance" },
        { title: "Phúc khảo điểm", icon: SearchX, href: "/dashboard/student/regrade" },
        { title: "Hồ sơ cá nhân", icon: UserCircle, href: "/dashboard/student/profile" },
        { title: "Thông báo", icon: Bell, href: "/dashboard/student/notifications" },
      ]
    },
    {
      label: "Giảng dạy",
      roles: ["LECTURER"],
      routes: [
        { title: "Lớp học phần", icon: Users, href: "/dashboard/lecturer/classes" },
        { title: "Vào điểm", icon: ClipboardList, href: "/dashboard/lecturer/grading" },
        { title: "Lịch học", icon: CalendarClock, href: "/dashboard/lecturer/schedule" },
        { title: "Phúc khảo", icon: SearchX, href: "/dashboard/lecturer/regrade" },
        { title: "Thông báo", icon: Bell, href: "/dashboard/lecturer/notifications" },
      ]
    },
    {
      label: "Quản lý Đào tạo",
      roles: ["MANAGER", "ADMIN"],
      routes: [
        { title: "Quản lý Sinh viên", icon: Users, href: "/dashboard/manager/students" },
        { title: "Quản lý Giảng viên", icon: GraduationCap, href: "/dashboard/manager/lecturers" },
        { title: "Chương trình Đào tạo", icon: FileText, href: "/dashboard/manager/programs" },
        { title: "TKB & Lịch thi", icon: CalendarDays, href: "/dashboard/manager/schedules" },
        { title: "Xét Tốt nghiệp", icon: GraduationCap, href: "/dashboard/manager/graduation" },
        { title: "Khuyến khích học tập", icon: Medal, href: "/dashboard/manager/scholarships" },
      ]
    },
    {
      label: "Quản trị Hệ thống",
      roles: ["MANAGER", "ADMIN"],
      routes: [
        { title: "Phân quyền User", icon: UserCog, href: "/dashboard/manager/users" },
        { title: "Báo cáo & Thống kê", icon: PieChart, href: "/dashboard/manager/reports" },
        { title: "Nhật ký Hệ thống", icon: ShieldAlert, href: "/dashboard/manager/logs" },
        { title: "Cấu hình hệ thống", icon: Settings, href: "/dashboard/manager/settings" },
      ]
    }
  ];

  const visibleGroups = menuGroups.filter(group => 
    group.roles.includes(role || "")
  );

  return (
    <aside className="w-64 h-screen bg-[#0f172a] text-slate-300 flex flex-col hidden lg:flex shrink-0">
      <div className="h-16 shrink-0 flex items-center px-6 bg-slate-900/50 border-b border-slate-800/50">
        <Link href="/dashboard" className="flex items-center gap-3 text-white group">
          <div className="bg-orange-600 p-1.5 rounded-md group-hover:bg-orange-500 transition-colors">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight">UTT Portal</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8 custom-scrollbar">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
              pathname === "/dashboard" 
                ? "bg-orange-600 text-white" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Tổng quan
          </Link>
        </div>

        {visibleGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {group.label}
            </div>
            {group.routes.map((route) => {
              const active = pathname === route.href || (pathname.startsWith(`${route.href}/`) && route.href !== '/dashboard');
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                    active 
                      ? "bg-orange-600 text-white" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <route.icon className="h-4 w-4" />
                  {route.title}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 shrink-0">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <p className="text-xs text-slate-400 mb-2">Hỗ trợ kỹ thuật</p>
          <div className="text-sm text-slate-200 font-medium">1900 1234</div>
          <div className="text-xs text-slate-500 mt-1">support@utt.edu.vn</div>
        </div>
      </div>
    </aside>
  );
}
