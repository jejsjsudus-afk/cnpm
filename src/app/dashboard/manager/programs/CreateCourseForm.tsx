"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCourse } from "./actions";
import { Loader2, Plus, X, CheckCircle2 } from "lucide-react";

export function CreateCourseForm() {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    credits: 3,
  });

  const update = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name) return;
    setMessage(null);

    startTransition(async () => {
      const res = await createCourse(form);
      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({ type: "success", text: `Tạo học phần "${form.name}" thành công!` });
        setForm({ code: "", name: "", credits: 3 });
        setTimeout(() => { setOpen(false); setMessage(null); }, 2500);
      }
    });
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20">
        <Plus className="mr-2 h-4 w-4" /> Tạo môn học mới
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setOpen(false); setMessage(null); }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-lg text-slate-900">Thêm học phần mới</h3>
          <Button variant="ghost" size="sm" onClick={() => { setOpen(false); setMessage(null); }}><X className="h-4 w-4" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Mã học phần <span className="text-red-500">*</span></Label>
              <Input 
                value={form.code} 
                onChange={e => update("code", e.target.value.toUpperCase())} 
                placeholder="INT1050" 
                required 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Tên môn học <span className="text-red-500">*</span></Label>
              <Input 
                value={form.name} 
                onChange={e => update("name", e.target.value)} 
                placeholder="Nhập môn Lập trình" 
                required 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Số tín chỉ <span className="text-red-500">*</span></Label>
              <Input 
                type="number" 
                value={form.credits} 
                onChange={e => update("credits", parseInt(e.target.value) || 0)} 
                min="1" 
                max="10" 
                required 
              />
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">Cấu hình điểm mặc định:</p>
              <div className="flex gap-2">
                <span className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500">Chuyên cần 10%</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500">Giữa kỳ 30%</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500">Cuối kỳ 60%</span>
              </div>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {message.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {message.text}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => { setOpen(false); setMessage(null); }}>Hủy bỏ</Button>
            <Button type="submit" disabled={isPending} className="bg-orange-600 hover:bg-orange-700 text-white">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Thêm môn học
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
