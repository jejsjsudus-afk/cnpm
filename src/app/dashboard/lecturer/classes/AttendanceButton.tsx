"use client";

import { useTransition, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { generateAttendanceSession } from "./actions";
import { QrCode, Loader2, CheckCircle, RefreshCw } from "lucide-react";
import QRCode from "qrcode";

export function AttendanceButton({ classId }: { classId: string }) {
  const [isPending, startTransition] = useTransition();
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [customToken, setCustomToken] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate QR image from token
  useEffect(() => {
    if (activeToken) {
      QRCode.toDataURL(activeToken, {
        width: 256,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
        errorCorrectionLevel: "M"
      }).then(setQrDataUrl);

      // Start 15-minute countdown
      setTimeLeft(15 * 60);
    }
  }, [activeToken]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleGenerate = () => {
    startTransition(async () => {
      const res = await generateAttendanceSession(classId, customToken);
      if (res?.error) {
        alert(res.error);
      } else if (res?.success && res.token) {
        setActiveToken(res.token);
      }
    });
  };

  if (activeToken && qrDataUrl) {
    return (
      <div className="flex flex-col items-center gap-3 p-4 bg-slate-50 border-2 border-dashed border-orange-300 rounded-lg w-full">
        {/* QR Code Image */}
        <div className="bg-white p-3 rounded-lg shadow-inner border border-slate-100">
          <img src={qrDataUrl} alt={`QR Code: ${activeToken}`} width={200} height={200} className="rounded" />
        </div>

        {/* Token Text */}
        <div className="text-center">
          <p className="text-xs text-slate-500 mb-1">Mã điểm danh</p>
          <code className="text-lg font-bold tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded">
            {activeToken}
          </code>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2 text-sm font-semibold ${timeLeft < 120 ? "text-red-500" : "text-emerald-600"}`}>
          <CheckCircle className="h-4 w-4" />
          {timeLeft > 0 ? `Còn lại: ${formatTime(timeLeft)}` : "Đã hết hạn"}
        </div>

        {/* Regenerate */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setActiveToken(null); setQrDataUrl(null); }}
          className="text-slate-500 hover:text-slate-700 text-xs gap-1 mt-1"
        >
          <RefreshCw className="h-3 w-3" /> Tạo mã mới
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full space-y-1">
      <input
        type="text"
        placeholder="Mã tuỳ chỉnh (tùy chọn)"
        value={customToken}
        onChange={e => setCustomToken(e.target.value)}
        className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <Button
        variant="outline"
        onClick={handleGenerate}
        disabled={isPending}
        className="w-full text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
      >
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
        Tạo QR Điểm danh
      </Button>
    </div>
  );
}
