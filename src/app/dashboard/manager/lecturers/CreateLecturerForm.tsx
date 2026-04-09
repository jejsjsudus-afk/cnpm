"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLecturerAccount } from "./actions";
import { Loader2, UserPlus, X, CheckCircle2, GraduationCap } from "lucide-react";

const FACULTIES = [
  { id: "F_CNTT", name: "Khoa Công nghệ Thông tin" },
  { id: "F_KTCK", name: "Khoa Kỹ thuật Cơ khí" },
  { id: "F_KTE",  name: "Khoa Kinh tế" },
  { id: "F_DTVT", name: "Khoa Điện tử Viễn thông" },
  { id: "F_ATTT", name: "Khoa An toàn Thông tin" },
];

const DEPARTMENTS: Record<string, { id: string; name: string }[]> = {
  F_CNTT: [
    { id: "CNTT", name: "Bộ môn Công nghệ Thông tin" },
    { id: "KHMT", name: "Bộ môn Khoa học Máy tính" },
    { id: "HT", name: "Bộ môn Hệ thống thông tin" },
  ],
  F_KTCK: [
    { id: "KTCK", name: "Bộ môn Kỹ thuật Cơ khí" },
    { id: "CTM", name: "Bộ môn Cơ điện tử" },
  ],
  F_KTE: [
    { id: "QTKD", name: "Bộ môn Quản trị Kinh doanh" },
    { id: "KT", name: "Bộ môn Kế toán" },
  ],
  F_DTVT: [
    { id: "DTVT", name: "Bộ môn Điện tử Viễn thông" },
    { id: "KTDT", name: "Bộ môn Kỹ thuật Điện tử" },
  ],
  F_ATTT: [
    { id: "ATTT", name: "Bộ môn An toàn Thông tin" },
  ],
};

const SELECT_CLASS =
  "w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm " +
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50";

export function CreateLecturerForm() {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "ChangeMe123!",
    lecturerCode: "",
    facultyId: "",
    departmentId: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "facultyId") next.departmentId = "";
      return next;
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.lecturerCode) return;
    setMessage(null);

    startTransition(async () => {
      const res = await createLecturerAccount(form);
      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({ type: "success", text: `✅ Tạo tài khoản giảng viên "${form.name}" thành công!` });
        setForm({ name: "", email: "", password: "ChangeMe123!", lecturerCode: "", facultyId: "", departmentId: "" });
        setTimeout(() => { setOpen(false); setMessage(null); }, 3000);
      }
    });
  };

  const closeModal = () => { setOpen(false); setMessage(null); };
  const availableDepts = form.facultyId ? (DEPARTMENTS[form.facultyId] ?? []) : [];

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 gap-2"
      >
        <UserPlus className="h-4 w-4" />
        Tạo tài khoản mới
      </Button>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={closeModal}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-2xl">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            Tạo tài khoản Giảng viên mới
          </h3>
          <Button variant="ghost" size="sm" onClick={closeModal} className="h-8 w-8 p-0 rounded-lg">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Họ tên */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Nguyễn Văn A"
              required
              disabled={isPending}
            />
          </div>

          {/* Mã Giảng Viên */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">
              Mã giảng viên <span className="text-red-500">*</span>
            </Label>
            <Input
              value={form.lecturerCode}
              onChange={(e) => update("lecturerCode", e.target.value.toUpperCase())}
              placeholder="GV002"
              required
              disabled={isPending}
              className="font-mono text-purple-700 font-bold"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="giangvien@utt.edu.vn"
              required
              disabled={isPending}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">Mật khẩu mặc định</Label>
            <Input
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="Ít nhất 8 ký tự"
              type="text"
              disabled={isPending}
            />
            <p className="text-xs text-slate-400">Giảng viên nên đổi mật khẩu sau lần đăng nhập đầu tiên.</p>
          </div>

          {/* Khoa + Bộ môn */}
          <div className="border border-purple-100 bg-purple-50/40 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-purple-700 uppercase tracking-widest">Phòng ban công tác</p>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Khoa/Viện</Label>
              <select
                value={form.facultyId}
                onChange={(e) => update("facultyId", e.target.value)}
                disabled={isPending}
                className={SELECT_CLASS}
              >
                <option value="">-- Chọn Khoa/Viện --</option>
                {FACULTIES.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Bộ môn</Label>
              <select
                value={form.departmentId}
                onChange={(e) => update("departmentId", e.target.value)}
                disabled={isPending || !form.facultyId}
                className={SELECT_CLASS}
              >
                <option value="">-- Chọn Bộ môn --</option>
                {availableDepts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {!form.facultyId && (
                <p className="text-xs text-slate-400">Chọn Khoa/Viện trước để lọc bộ môn.</p>
              )}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-3 rounded-lg text-sm font-medium flex items-start gap-2 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />}
              {message.text}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isPending} className="flex-1">
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white gap-2"
            >
              {isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Đang tạo...</>
              ) : (
                <><UserPlus className="h-4 w-4" /> Tạo tài khoản</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
