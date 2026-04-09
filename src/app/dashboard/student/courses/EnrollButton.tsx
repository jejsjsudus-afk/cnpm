"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { enrollClass } from "./actions";
import { Check, Plus, Loader2 } from "lucide-react";

export function EnrollButton({ sectionId, isEnrolled, disabled }: { sectionId: string, isEnrolled: boolean, disabled: boolean }) {
  const [isPending, startTransition] = useTransition();

  if (isEnrolled) {
    return (
      <Button variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 cursor-default" disabled>
        <Check className="mr-2 h-4 w-4" /> Đã đăng ký
      </Button>
    )
  }

  const handleEnroll = () => {
    startTransition(async () => {
      const res = await enrollClass(sectionId);
      if (res?.error) {
        alert(res.error); // In real app, standard TOAST notification
      }
    });
  }

  return (
    <Button 
      onClick={handleEnroll} 
      disabled={disabled || isPending}
      className={disabled ? "bg-slate-300" : "bg-orange-600 hover:bg-orange-700 text-white"}
    >
      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
      {disabled ? "Hết chỗ" : "Đăng ký học"}
    </Button>
  )
}
