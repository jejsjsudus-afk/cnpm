"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSectionSchedules } from "./actions";
import { Loader2, X, CheckCircle2 } from "lucide-react";

export function EditScheduleModal({ section }: { section: any }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Initialize form state based on existing schedules
  const existingLecture = section.schedules.find((s: any) => s.type === "LECTURE") || {
    dayOfWeek: 2,
    room: "",
    startTime: "07:30",
    endTime: "09:30"
  };
  const existingExam = section.schedules.find((s: any) => s.type === "EXAM");

  const [lectureForm, setLectureForm] = useState(existingLecture);
  const [hasExam, setHasExam] = useState(!!existingExam);
  const [examForm, setExamForm] = useState(existingExam || {
    dayOfWeek: 8,
    room: "",
    startTime: "07:30",
    endTime: "09:00"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lectureForm.room) return;
    setMessage(null);

    startTransition(async () => {
      const schedulesPayload = [
        { 
          type: "LECTURE",
          dayOfWeek: Number(lectureForm.dayOfWeek),
          room: lectureForm.room,
          startTime: lectureForm.startTime,
          endTime: lectureForm.endTime
        }
      ];
      if (hasExam && examForm.room) {
        schedulesPayload.push({
          type: "EXAM",
          dayOfWeek: Number(examForm.dayOfWeek),
          room: examForm.room,
          startTime: examForm.startTime,
          endTime: examForm.endTime
        });
      }

      const res = await updateSectionSchedules(section.id, schedulesPayload);
      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({ type: "success", text: "Cập nhật lịch thành công!" });
        setTimeout(() => { setOpen(false); setMessage(null); }, 1500);
      }
    });
  };

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
        Sửa Lịch
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => { setOpen(false); setMessage(null); }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl my-8 text-left" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-lg text-slate-900">Sửa lịch học & thi</h3>
            <p className="text-sm text-slate-500 mt-1">{section.course.name} - Lớp ghép {section.capacity} SV</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setOpen(false); setMessage(null); }}><X className="h-4 w-4" /></Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Lecture Schedule */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Lịch Lý thuyết (Bắt buộc)
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Thứ <span className="text-red-500">*</span></Label>
                <select 
                  className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={lectureForm.dayOfWeek} 
                  onChange={e => setLectureForm({...lectureForm, dayOfWeek: parseInt(e.target.value)})}
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
                <Label className="text-sm font-medium text-slate-700">Phòng <span className="text-red-500">*</span></Label>
                <Input value={lectureForm.room} onChange={e => setLectureForm({...lectureForm, room: e.target.value.toUpperCase()})} required />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Giờ bắt đầu <span className="text-red-500">*</span></Label>
                <Input type="time" value={lectureForm.startTime} onChange={e => setLectureForm({...lectureForm, startTime: e.target.value})} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Giờ kết thúc <span className="text-red-500">*</span></Label>
                <Input type="time" value={lectureForm.endTime} onChange={e => setLectureForm({...lectureForm, endTime: e.target.value})} required />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100"></div>

          {/* Exam Schedule */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Lịch Thi (Tùy chọn)
              </h4>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={hasExam} onChange={() => setHasExam(!hasExam)} />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${hasExam ? 'bg-red-500' : 'bg-slate-200'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${hasExam ? 'translate-x-4' : ''}`}></div>
                </div>
              </label>
            </div>
            
            {hasExam && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Thứ <span className="text-red-500">*</span></Label>
                  <select 
                    className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={examForm.dayOfWeek} 
                    onChange={e => setExamForm({...examForm, dayOfWeek: parseInt(e.target.value)})}
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
                  <Label className="text-sm font-medium text-slate-700">Phòng Thi <span className="text-red-500">*</span></Label>
                  <Input value={examForm.room} onChange={e => setExamForm({...examForm, room: e.target.value.toUpperCase()})} required={hasExam} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Giờ bắt đầu <span className="text-red-500">*</span></Label>
                  <Input type="time" value={examForm.startTime} onChange={e => setExamForm({...examForm, startTime: e.target.value})} required={hasExam} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Giờ kết thúc <span className="text-red-500">*</span></Label>
                  <Input type="time" value={examForm.endTime} onChange={e => setExamForm({...examForm, endTime: e.target.value})} required={hasExam} />
                </div>
              </div>
            )}
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {message.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {message.text}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => { setOpen(false); setMessage(null); }}>Hủy</Button>
            <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
