"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { processPaymentSimulation } from "./actions";
import { CreditCard, Loader2, Wallet, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export function PaymentButton({ invoiceId, status }: { invoiceId: string, status: string }) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (status === "PAID") {
    return (
      <Button variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 cursor-default" disabled>
        <Wallet className="mr-2 h-4 w-4" /> Đã đóng
      </Button>
    )
  }

  const handleConfirmPayment = () => {
    setResult(null);
    startTransition(async () => {
      const res = await processPaymentSimulation(invoiceId);
      if (res?.error) {
        setResult({ type: "error", text: res.error });
        setShowConfirm(false);
      } else {
        setResult({ type: "success", text: "Giao dịch thành công!" });
        setShowConfirm(false);
      }
    });
  };

  if (showConfirm) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          <span>Xác nhận thanh toán VNPAY?</span>
        </div>
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
            className="h-7 text-xs"
          >
            Hủy
          </Button>
          <Button
            size="sm"
            onClick={handleConfirmPayment}
            disabled={isPending}
            className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CreditCard className="h-3 w-3 mr-1" />}
            Xác nhận
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      {result && (
        <div className={`flex items-center gap-1 text-xs font-medium ${result.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
          {result.type === "success" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          {result.text}
        </div>
      )}
      <Button 
        onClick={() => { setShowConfirm(true); setResult(null); }} 
        disabled={isPending}
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
      >
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
        Thanh toán VNPAY
      </Button>
    </div>
  )
}
