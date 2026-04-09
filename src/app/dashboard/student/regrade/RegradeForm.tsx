"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitRegradeRequest } from "./actions";
import { Loader2, Send, X } from "lucide-react";

interface ClassOption {
  sectionId: string;
  courseName: string;
  courseCode: string;
  totalScore: number | null;
  components: { id: string; name: string; score: number | null }[];
}

export function RegradeForm({ classes }: { classes: ClassOption[] }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedComponent, setSelectedComponent] = useState("");
  const [reason, setReason] = useState("");
  const [requestedScore, setRequestedScore] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const selectedInfo = classes.find((c) => c.sectionId === selectedClass);
  const selectedCompInfo = selectedInfo?.components.find(c => c.id === selectedComponent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedComponent || !reason.trim()) return;
    setMessage(null);

    const currentScore = selectedCompInfo?.score ?? 0;

    startTransition(async () => {
      const res = await submitRegradeRequest(
        selectedClass,
        selectedComponent,
        currentScore,
        reason.trim(),
        requestedScore ? parseFloat(requestedScore) : undefined
      );
      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({ type: "success", text: "Đơn phúc khảo đã được gửi thành công!" });
        setReason("");
        setRequestedScore("");
        setSelectedClass("");
        setTimeout(() => {
          setOpen(false);
          setMessage(null);
        }, 2000);
      }
    });
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20">
        <Send className="mr-2 h-4 w-4" />
        Tạo đơn phúc khảo mới
      </Button>
    );
  }

  return (
    <div className="border border-orange-200 rounded-xl bg-gradient-to-br from-orange-50/80 to-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-slate-900 text-lg">Tạo đơn phúc khảo mới</h3>
        <Button variant="ghost" size="sm" onClick={() => { setOpen(false); setMessage(null); }}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="regrade-class" className="text-sm font-medium text-slate-700">Chọn lớp học phần</Label>
            <select
              id="regrade-class"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedComponent("");
              }}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
            >
              <option value="">-- Chọn môn học --</option>
              {classes.map((c) => (
                <option key={c.sectionId} value={c.sectionId}>
                  {c.courseCode} - {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="regrade-component" className="text-sm font-medium text-slate-700">Chọn cột điểm</Label>
            <select
              id="regrade-component"
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              required
              disabled={!selectedClass}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all disabled:opacity-50"
            >
              <option value="">-- Chọn cột điểm --</option>
              {selectedInfo?.components.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name} {comp.score !== null ? `(${comp.score.toFixed(1)})` : "(Chưa có điểm)"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedCompInfo && (
          <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-slate-500">Cột điểm: <span className="font-semibold text-slate-700">{selectedCompInfo.name}</span></p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-slate-900">
                  {selectedCompInfo.score !== null ? selectedCompInfo.score.toFixed(1) : "-"}
                </p>
                <span className="text-xs text-slate-400">/ 10.0</span>
              </div>
            </div>
            <div className="flex-1 w-full sm:w-auto">
              <Label htmlFor="requested-score" className="text-xs text-slate-500">Điểm mong muốn (không bắt buộc)</Label>
              <Input
                id="requested-score"
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="VD: 7.5"
                value={requestedScore}
                onChange={(e) => setRequestedScore(e.target.value)}
                className="mt-1 h-9"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="regrade-reason" className="text-sm font-medium text-slate-700">Lý do phúc khảo <span className="text-red-500">*</span></Label>
          <textarea
            id="regrade-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            rows={4}
            placeholder="Mô tả chi tiết lý do yêu cầu phúc khảo điểm..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none"
          />
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outline" onClick={() => { setOpen(false); setMessage(null); }}>
            Hủy bỏ
          </Button>
          <Button type="submit" disabled={isPending || !selectedClass || !reason.trim()} className="bg-orange-600 hover:bg-orange-700 text-white">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Gửi đơn phúc khảo
          </Button>
        </div>
      </form>
    </div>
  );
}
