"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleRegradeDecision } from "./actions";
import { Loader2, Check, X, AlertTriangle, MessageSquare, Award } from "lucide-react";

export function DecisionButtons({ requestId, status, currentScore }: { requestId: string; status: string; currentScore: number }) {
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [comment, setComment] = useState("");
  const [approvedScore, setApprovedScore] = useState(currentScore.toString());
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  if (status !== "PENDING") {
    return (
      <span className="text-xs text-slate-400 italic">Đã xử lý</span>
    );
  }

  const handleConfirm = () => {
    if (!confirmAction) return;
    setResultMsg(null);

    const scoreNum = parseFloat(approvedScore);
    if (confirmAction === "APPROVED" && (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10)) {
      setResultMsg("Lỗi: Điểm phải từ 0-10");
      return;
    }

    startTransition(async () => {
      const res = await handleRegradeDecision(
        requestId, 
        confirmAction, 
        comment.trim() || undefined, 
        confirmAction === "APPROVED" ? scoreNum : undefined
      );
      if (res?.error) {
        setResultMsg(res.error);
      } else {
        setResultMsg(confirmAction === "APPROVED" ? "Đã duyệt!" : "Đã từ chối!");
        setConfirmAction(null);
        setComment("");
      }
    });
  };

  // Show inline confirmation with form
  if (confirmAction) {
    return (
      <div className="flex flex-col gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3 w-72 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <AlertTriangle className={`h-4 w-4 ${confirmAction === "APPROVED" ? "text-emerald-500" : "text-red-500"}`} />
          {confirmAction === "APPROVED" ? "Duyệt phúc khảo" : "Từ chối phúc khảo"}
        </div>

        <div className="space-y-2.5">
          {confirmAction === "APPROVED" && (
            <div className="space-y-1">
              <Label htmlFor="new-score" className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Điểm mới</Label>
              <div className="relative">
                <Award className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  id="new-score"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={approvedScore}
                  onChange={(e) => setApprovedScore(e.target.value)}
                  className="h-9 pl-8 text-sm border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="feedback" className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Phản hồi cho SV</Label>
            <div className="relative">
              <MessageSquare className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <textarea
                id="feedback"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={confirmAction === "APPROVED" ? "VD: Chấm sót ý b bài 2..." : "Lý do từ chối..."}
                className="w-full min-h-[80px] rounded-md border border-slate-200 bg-white pl-8 pr-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-1 border-t border-slate-200">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setConfirmAction(null); setComment(""); }}
            disabled={isPending}
            className="flex-1 h-8 text-xs hover:bg-slate-200"
          >
            Hủy
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={isPending}
            className={`flex-1 h-8 text-xs ${confirmAction === "APPROVED" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"} text-white shadow-sm`}
          >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
            Xác nhận
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      {resultMsg && (
        <span className={`text-xs font-medium ${resultMsg.includes("Lỗi") || resultMsg.includes("không") ? "text-red-500" : "text-emerald-600"}`}>
          {resultMsg}
        </span>
      )}
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
          onClick={() => setConfirmAction("REJECTED")}
          disabled={isPending}
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Từ chối
        </Button>
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => setConfirmAction("APPROVED")}
          disabled={isPending}
        >
          <Check className="h-3.5 w-3.5 mr-1" />
          Đồng ý
        </Button>
      </div>
    </div>
  );
}
