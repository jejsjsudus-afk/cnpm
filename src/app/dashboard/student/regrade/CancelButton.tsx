"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cancelRegradeRequest } from "./actions";
import { Loader2, Trash2 } from "lucide-react";

export function CancelButton({ requestId }: { requestId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn phúc khảo này?")) return;

    startTransition(async () => {
      const res = await cancelRegradeRequest(requestId);
      if (res?.error) {
        alert(res.error);
      }
    });
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleCancel}
      disabled={isPending}
      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
    >
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
      Hủy đơn
    </Button>
  );
}
