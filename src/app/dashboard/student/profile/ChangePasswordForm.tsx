"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePassword } from "./actions";
import { KeyRound, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export function ChangePasswordForm() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự!" });
      return;
    }
    
    startTransition(async () => {
      const res = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({ type: "success", text: "Đã đổi mật khẩu thành công!" });
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setMessage(null), 4000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700 block mb-1">Mật khẩu hiện tại</label>
        <Input 
          type="password"
          placeholder="Nhập mật khẩu hiện tại" 
          value={formData.currentPassword}
          onChange={e => setFormData({...formData, currentPassword: e.target.value})}
          disabled={isPending}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700 block mb-1">Mật khẩu mới</label>
        <Input 
          type="password"
          placeholder="Mật khẩu ít nhất 6 ký tự" 
          value={formData.newPassword}
          onChange={e => setFormData({...formData, newPassword: e.target.value})}
          disabled={isPending}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700 block mb-1">Xác nhận mật khẩu mới</label>
        <Input 
          type="password"
          placeholder="Nhập lại mật khẩu mới" 
          value={formData.confirmPassword}
          onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
          disabled={isPending}
          required
        />
      </div>

      <div className="pt-2">
        <Button 
          type="submit" 
          className="w-full bg-slate-900 hover:bg-slate-800 gap-2"
          disabled={isPending}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
          Lưu mật khẩu mới
        </Button>
      </div>

      {message && (
        <div className={`flex items-center gap-2 text-sm p-3 rounded-md border ${
          message.type === "success" 
            ? "text-emerald-600 bg-emerald-50 border-emerald-100" 
            : "text-red-600 bg-red-50 border-red-100"
        }`}>
           {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
           {message.text}
        </div>
      )}
    </form>
  )
}
