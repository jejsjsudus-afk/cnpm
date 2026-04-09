"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, Search, LogOut, User, Menu, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-4 md:px-6 bg-white border-b border-slate-200">
      <div className="flex-1 max-w-xl flex items-center pr-4 gap-4">
        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger
            render={
              <button className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-md">
                <Menu className="h-6 w-6" />
              </button>
            }
          />
          <SheetContent side="left" className="p-0 w-72">
            <SheetHeader className="hidden">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="h-full flex flex-col bg-[#0f172a]">
              {/* Tái hiện phần logo trong mobile menu */}
              <div className="h-16 shrink-0 flex items-center px-6 bg-slate-900/50 border-b border-slate-800/50">
                <div className="flex items-center gap-3 text-white">
                  <div className="bg-orange-600 p-1.5 rounded-md">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-lg tracking-tight">UTT Portal</span>
                </div>
              </div>
              <Sidebar isMobile />
            </div>
          </SheetContent>
        </Sheet>

        <div className="relative w-full max-w-sm hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            type="text" 
            placeholder="Tìm kiếm thông tin..." 
            className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-slate-300"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse border-2 border-white" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-slate-50 p-1 pr-2 rounded-full transition-colors border border-transparent hover:border-slate-200 cursor-pointer focus:outline-none text-left">
            <Avatar className="h-9 w-9 border border-slate-200">
              <AvatarImage src="" />
              <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">
                {session?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-none text-slate-900">{session?.user?.name || "Người dùng"}</p>
              <p className="text-xs text-slate-500 mt-1">{session?.user?.role || "Khách"}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/profile")} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Hồ sơ cá nhân</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
