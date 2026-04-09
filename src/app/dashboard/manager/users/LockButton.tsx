"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleUserStatus } from "./actions";
import { Loader2, Lock, Unlock } from "lucide-react";

export function LockButton({ userId, status }: { userId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (!confirm(`Bạn có chắc muốn ${status === "ACTIVE" ? "Khóa" : "Mở khóa"} tài khoản này?`)) return;
    
    startTransition(async () => {
      const res = await toggleUserStatus(userId);
      if (res?.error) {
        alert(res.error);
      }
    });
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleToggle}
      disabled={isPending}
      className={status === "ACTIVE" ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : status === "ACTIVE" ? (
        <><Lock className="h-4 w-4 mr-1" /> Khóa</>
      ) : (
        <><Unlock className="h-4 w-4 mr-1" /> Mở khóa</>
      )}
    </Button>
  );
}
