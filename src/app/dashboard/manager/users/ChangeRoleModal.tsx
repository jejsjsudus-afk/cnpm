"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { updateUserRole } from "./actions";
import { Loader2, ShieldAlert } from "lucide-react";

const ROLES = [
  { value: "STUDENT", label: "Sinh viên" },
  { value: "LECTURER", label: "Giảng viên" },
  { value: "MANAGER", label: "Phòng Đào tạo" },
  { value: "ADMIN", label: "Quản trị kỹ thuật" },
];

export function ChangeRoleModal({ 
  userId, 
  userEmail, 
  currentRole,
  callerRole 
}: { 
  userId: string; 
  userEmail: string;
  currentRole: string;
  callerRole: string;
}) {
  const [open, setOpen] = useState(false);
  const [newRole, setNewRole] = useState(currentRole);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = () => {
    if (newRole === currentRole) {
      setOpen(false);
      return;
    }

    startTransition(async () => {
      const res = await updateUserRole(userId, newRole);
      if (res?.error) {
        alert(res.error);
      } else {
        setOpen(false);
      }
    });
  };

  const availableRoles = callerRole === "ADMIN" 
    ? ROLES 
    : ROLES.filter(r => r.value !== "ADMIN");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" />
        }
      >
        Đổi quyền
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thay đổi quyền hạn</DialogTitle>
          <DialogDescription>
            Cập nhật vai trò hệ thống cho tài khoản <span className="font-semibold text-slate-900">{userEmail}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Chọn vai trò mới</label>
            <select 
              value={newRole} 
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {availableRoles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex gap-3 text-amber-800 text-sm">
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />
            <p>Việc thay đổi quyền sẽ ảnh hưởng đến khả năng truy cập các tính năng của người dùng này ngay lập tức.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Hủy
          </Button>
          <Button onClick={handleUpdate} disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
