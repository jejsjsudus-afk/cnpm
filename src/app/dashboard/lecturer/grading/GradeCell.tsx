"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveScore } from "./actions";
import { Check, Edit2, Loader2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function GradeCell({ 
  enrollmentId, 
  componentId, 
  initialValue, 
  initialFinalized 
}: { 
  enrollmentId: string, 
  componentId: string, 
  initialValue: number | null,
  initialFinalized: boolean
}) {
  const [val, setVal] = useState(initialValue !== null ? initialValue.toString() : "");
  const [isFinalized, setIsFinalized] = useState(initialFinalized);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = (finalize: boolean) => {
    const parsed = parseFloat(val);
    if (isNaN(parsed) || parsed < 0 || parsed > 10) {
      alert("Điểm phải là số từ 0 đến 10");
      return;
    }

    startTransition(async () => {
      const res = await saveScore(enrollmentId, componentId, parsed, finalize);
      if (res?.error) {
        alert(res.error);
      } else {
        setIsFinalized(finalize);
        setIsEditing(false);
      }
    });
  }

  if (isFinalized) {
    return (
      <div className="flex flex-col items-center gap-1 min-w-[70px]">
        <span className="font-bold text-slate-900">{val ? parseFloat(val).toFixed(1) : "-"}</span>
        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-none px-1 h-4">Chốt</Badge>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 min-w-[120px]">
        <Input 
          type="number" 
          value={val} 
          onChange={e => setVal(e.target.value)} 
          className="h-8 w-16 px-2 text-center" 
          step="0.1" 
          min="0" 
          max="10"
        />
        <div className="flex flex-col gap-1">
          <Button size="icon" variant="ghost" className="h-6 w-6 text-blue-600" onClick={() => handleSave(false)} disabled={isPending} title="Lưu nháp">
            {isPending ? <Loader2 className="h-3 w-3 animate-spin"/> : <Save className="h-3 w-3" />}
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-600" onClick={() => handleSave(true)} disabled={isPending} title="Công bố (Khóa)">
             <Check className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="flex items-center gap-1 group cursor-pointer hover:bg-slate-50 p-1 rounded-md min-w-[70px]"
      onClick={() => setIsEditing(true)}
    >
      <span className="font-medium text-slate-700 w-8 text-center">{val ? parseFloat(val).toFixed(1) : "-"}</span>
      <Edit2 className="h-3 w-3 text-slate-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}
