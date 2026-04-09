"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateStudentProfile } from "./actions";
import { Save, Loader2, CheckCircle } from "lucide-react";

export function ProfileForm({ initialData }: { 
  initialData: { phone: string, address: string, idCardNumber: string } 
}) {
  const [formData, setFormData] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    
    startTransition(async () => {
      const res = await updateStudentProfile(formData);
      if (res?.error) {
        alert(res.error);
      } else {
        setSuccessMsg("Đã cập nhật hồ sơ thành công!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700 block mb-1">Số điện thoại</label>
        <Input 
          type="tel"
          placeholder="Ví dụ: 0987654321" 
          value={formData.phone}
          onChange={e => setFormData({...formData, phone: e.target.value})}
          disabled={isPending}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700 block mb-1">Căn cước công dân (CCCD)</label>
        <Input 
          type="text"
          placeholder="Mã định danh 12 số" 
          value={formData.idCardNumber}
          onChange={e => setFormData({...formData, idCardNumber: e.target.value})}
          disabled={isPending}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700 block mb-1">Địa chỉ thường trú</label>
        <textarea 
          placeholder="Ghi rõ số nhà, đường, phường/xã, quận/huyện, tỉnh/tp" 
          value={formData.address}
          onChange={e => setFormData({...formData, address: e.target.value})}
          disabled={isPending}
          className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="pt-2">
        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
          disabled={isPending}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Lưu thay đổi
        </Button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-md border border-emerald-100">
           <CheckCircle className="h-4 w-4" />
           {successMsg}
        </div>
      )}
    </form>
  )
}
