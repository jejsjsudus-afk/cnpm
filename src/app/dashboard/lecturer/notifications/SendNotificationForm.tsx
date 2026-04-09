"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendNotification } from "./actions";
import { Send, Loader2, CheckCircle } from "lucide-react";

export function SendNotificationForm({ classes }: { classes: any[] }) {
  const [formData, setFormData] = useState({ classSectionId: "", title: "", content: "" });
  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    
    if (!formData.classSectionId) return alert("Vui lòng chọn lớp học phần");

    startTransition(async () => {
      const res = await sendNotification(formData);
      if (res?.error) {
        alert(res.error);
      } else {
        setSuccessMsg("Gửi thông báo thành công!");
        setFormData({ ...formData, title: "", content: "" }); // retain selected class
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700 block mb-1">Gửi tới Lớp</label>
        <select 
          value={formData.classSectionId}
          onChange={e => setFormData({...formData, classSectionId: e.target.value})}
          disabled={isPending}
          className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="" disabled>--- Chọn lớp học phần ---</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.course.name} ({c.course.code})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 block mb-1">Tiêu đề</label>
        <Input 
          type="text"
          placeholder="Nhập tiêu đề ngắn gọn..." 
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
          disabled={isPending}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 block mb-1">Nội dung chi tiết</label>
        <textarea 
          placeholder="Viết nội dung thông báo..." 
          value={formData.content}
          onChange={e => setFormData({...formData, content: e.target.value})}
          disabled={isPending}
          required
          className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="pt-2">
        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
          disabled={isPending}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Gửi Thông báo
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
