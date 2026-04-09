"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClassSectionWithSchedule } from "./actions";
import { Loader2, CalendarPlus, X, CheckCircle2 } from "lucide-react";

interface Metadata {
  courses: { id: string; name: string; code: string }[];
  semesters: { id: string; name: string }[];
  lecturers: { id: string; user: { name: string } }[];
}

export function CreateSectionForm({ metadata }: { metadata: Metadata }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    courseId: "",
    semesterId: metadata.semesters[0]?.id || "",
    lecturerId: "",
    capacity: 60,
    dayOfWeek: 2, // Monday
    room: "",
    startTime: "07:30",
    endTime: "09:30",
  });

  const update = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.courseId || !form.lecturerId || !form.room) return;
    setMessage(null);

    startTransition(async () => {
      const res = await createClassSectionWithSchedule(form);
      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({ type: "success", text: "Tạo lớp học phần và xếp lịch thành công!" });
        setForm({ ...form, courseId: "", lecturerId: "", room: "" });
        setTimeout(() => { setOpen(false); setMessage(null); }, 2500);
      }
    });
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20">
        <CalendarPlus className="mr-2 h-4 w-4" /> Mở lớp & Xếp lịch
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => { setOpen(false); setMessage(null); }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-lg text-slate-900">Mở lớp học phần & Xếp lịch học</h3>
          <Button variant="ghost" size="sm" onClick={() => { setOpen(false); setMessage(null); }}><X className="h-4 w-4" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column: Basic Info */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Học kỳ <span className="text-red-500">*</span></Label>
                <select 
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.semesterId} 
                  onChange={e => update("semesterId", e.target.value)}
                >
                  {metadata.semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Học phần <span className="text-red-500">*</span></Label>
                <select 
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.courseId} 
                  onChange={e => update("courseId", e.target.value)}
                  required
                >
                  <option value="">-- Chọn học phần --</option>
                  {metadata.courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Giảng viên <span className="text-red-500">*</span></Label>
                <select 
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.lecturerId} 
                  onChange={e => update("lecturerId", e.target.value)}
                  required
                >
                  <option value="">-- Chọn giảng viên --</option>
                  {metadata.lecturers.map(l => <option key={l.id} value={l.id}>{l.user.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Sĩ số tối đa</Label>
                <Input type="number" value={form.capacity} onChange={e => update("capacity", parseInt(e.target.value) || 0)} min="1" required />
              </div>
            </div>

            {/* Right Column: Schedule */}
            <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Thông tin thời khóa biểu</h4>
              
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Thứ <span className="text-red-500">*</span></Label>
                <select 
                  className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.dayOfWeek} 
                  onChange={e => update("dayOfWeek", parseInt(e.target.value))}
                >
                  <option value={2}>Thứ 2</option>
                  <option value={3}>Thứ 3</option>
                  <option value={4}>Thứ 4</option>
                  <option value={5}>Thứ 5</option>
                  <option value={6}>Thứ 6</option>
                  <option value={7}>Thứ 7</option>
                  <option value={8}>Chủ nhật</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Phòng học <span className="text-red-500">*</span></Label>
                <Input value={form.room} onChange={e => update("room", e.target.value.toUpperCase())} placeholder="VD: P.402A3" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Giờ bắt đầu</Label>
                  <Input type="time" value={form.startTime} onChange={e => update("startTime", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Giờ kết thúc</Label>
                  <Input type="time" value={form.endTime} onChange={e => update("endTime", e.target.value)} required />
                </div>
              </div>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {message.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {message.text}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => { setOpen(false); setMessage(null); }}>Hủy bỏ</Button>
            <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarPlus className="mr-2 h-4 w-4" />}
              Xác nhận mở lớp
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
