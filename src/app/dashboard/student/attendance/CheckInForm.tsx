"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkInStudent } from "./actions";
import { QrCode, Loader2, CheckCircle2, XCircle, Camera, X } from "lucide-react";
import { CardContent, CardFooter } from "@/components/ui/card";

export function CheckInForm() {
  const [token, setToken] = useState("");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });
  const [scannerOpen, setScannerOpen] = useState(false);
  const scannerRef = useRef<any>(null);
  const scannerContainerId = "qr-reader-student";

  const handleCheckIn = useCallback(async (tokenValue: string) => {
    if (!tokenValue.trim()) return;
    setStatus({ type: null, message: "" });

    startTransition(async () => {
      const res = await checkInStudent(tokenValue);
      if (res?.error) {
        setStatus({ type: "error", message: res.error });
      } else if (res?.success) {
        setStatus({ type: "success", message: res.message || "Thành công" });
        setToken("");
      }
    });
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCheckIn(token);
  };

  // Start QR scanner
  const startScanner = useCallback(async () => {
    setScannerOpen(true);
    // Dynamically import to avoid SSR issues
    const { Html5Qrcode } = await import("html5-qrcode");
    const html5QrCode = new Html5Qrcode(scannerContainerId);
    scannerRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          // On successful scan
          const scanned = decodedText.trim().toUpperCase();
          setToken(scanned);
          stopScanner();
          handleCheckIn(scanned);
        },
        () => {} // ignore per-frame errors
      );
    } catch {
      setStatus({ type: "error", message: "Không thể mở camera. Vui lòng kiểm tra quyền truy cập." });
      setScannerOpen(false);
    }
  }, [handleCheckIn]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch { /* ignore */ }
      scannerRef.current = null;
    }
    setScannerOpen(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopScanner(); };
  }, [stopScanner]);

  return (
    <form onSubmit={handleFormSubmit}>
      <CardContent className="space-y-4 pt-4">
        <p className="text-sm text-slate-500">
          Nhập mã điểm danh hoặc nhấn <strong>Quét QR</strong> để mở camera.
        </p>

        {/* QR Scanner viewport */}
        {scannerOpen && (
          <div className="relative rounded-xl overflow-hidden border-2 border-orange-300 bg-black">
            <div id={scannerContainerId} className="w-full" />
            <button
              type="button"
              onClick={stopScanner}
              className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
              title="Đóng camera"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-orange-400 w-48 h-48 rounded-lg opacity-70" />
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <Input
            value={token}
            onChange={(e) => setToken(e.target.value.toUpperCase())}
            placeholder="Ví dụ: INT1050-XXXXX"
            className="flex-1 font-mono uppercase"
            disabled={scannerOpen}
          />
          <Button
            type="button"
            variant={scannerOpen ? "destructive" : "outline"}
            className="shrink-0 gap-1"
            onClick={scannerOpen ? stopScanner : startScanner}
            disabled={isPending}
            title={scannerOpen ? "Dừng camera" : "Bật camera quét QR"}
          >
            {scannerOpen ? <X className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
            {scannerOpen ? "Dừng" : "Quét QR"}
          </Button>
        </div>

        {status.type === "success" && (
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-md text-sm flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="font-medium">{status.message}</p>
          </div>
        )}

        {status.type === "error" && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm flex items-start gap-2 animate-in fade-in">
            <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="font-medium">{status.message}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-slate-50 border-t border-slate-100 rounded-b-xl py-3">
        <Button
          type="submit"
          disabled={isPending || token.length < 3 || scannerOpen}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
          Xác nhận điểm danh
        </Button>
      </CardFooter>
    </form>
  );
}
