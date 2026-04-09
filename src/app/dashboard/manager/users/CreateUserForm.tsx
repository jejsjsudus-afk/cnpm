"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUserAccount } from "./actions";
import { UserPlus, Loader2, CheckCircle, X, Eye, EyeOff, GraduationCap, BookOpen } from "lucide-react";

// Danh sách Khoa/Viện (khớp với seed data)
const FACULTIES = [
  { id: "F_CNTT", name: "Khoa Công nghệ Thông tin" },
  { id: "F_KTCK", name: "Khoa Kỹ thuật Cơ khí" },
  { id: "F_KTE", name: "Khoa Kinh tế" },
  { id: "F_DTVT", name: "Khoa Điện tử Viễn thông" },
  { id: "F_ATTT", name: "Khoa An toàn Thông tin" },
];

// Danh sách Bộ môn
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

// Danh sách Ngành (cho sinh viên)
const MAJORS: Record<string, { id: string; name: string }[]> = {
  F_CNTT: [
    { id: "M_KHMT", name: "Khoa học Máy tính" },
    { id: "M_CNPM", name: "Công nghệ Phần mềm" },
    { id: "M_HTTT", name: "Hệ thống Thông tin" },
  ],
  F_KTCK: [
    { id: "M_KTCK", name: "Kỹ thuật Cơ khí" },
    { id: "M_CTM", name: "Cơ điện tử" },
  ],
  F_KTE: [
    { id: "M_QTKD", name: "Quản trị Kinh doanh" },
    { id: "M_KT", name: "Kế toán" },
  ],
  F_DTVT: [
    { id: "M_DTVT", name: "Điện tử Viễn thông" },
  ],
  F_ATTT: [
    { id: "M_ATTT", name: "An toàn Thông tin" },
  ],
};

const ROLES = [
  { value: "LECTURER", label: "Giảng viên", icon: "👨‍🏫", color: "purple" },
  { value: "STUDENT", label: "Sinh viên", icon: "🎓", color: "blue" },
  { value: "MANAGER", label: "Phòng Đào tạo", icon: "🏢", color: "amber" },
  { value: "ADMIN", label: "Quản trị kỹ thuật", icon: "🔐", color: "red" },
];

const MANAGER_ROLES = [
  { value: "LECTURER", label: "Giảng viên", icon: "👨‍🏫", color: "purple" },
  { value: "STUDENT", label: "Sinh viên", icon: "🎓", color: "blue" },
  { value: "MANAGER", label: "Phòng Đào tạo", icon: "🏢", color: "amber" },
];

const COHORTS = ["68", "69", "70", "71", "72", "73"];

export function CreateUserForm({
  callerRole,
  onClose,
}: {
  callerRole: string;
  onClose: () => void;
}) {
  const availableRoles = callerRole === "ADMIN" ? ROLES : MANAGER_ROLES;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "ChangeMe123!",
    role: "LECTURER",
    lecturerCode: "",
    facultyId: "",
    departmentId: "",
    mssv: "",
    cohort: "71",
    majorId: "",
  });
  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const set = (key: string, val: string) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: val };
      // Reset department & major khi đổi faculty
      if (key === "facultyId") {
        next.departmentId = "";
        next.majorId = "";
      }
      return next;
    });
  };

  const currentFacultyDepts = formData.facultyId ? (DEPARTMENTS[formData.facultyId] || []) : [];
  const currentFacultyMajors = formData.facultyId ? (MAJORS[formData.facultyId] || []) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!formData.name.trim()) {
      setErrorMsg("Họ tên không được để trống.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMsg("Email không hợp lệ.");
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      setErrorMsg("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    if (formData.role === "LECTURER" && !formData.lecturerCode.trim()) {
      setErrorMsg("Mã giảng viên không được để trống.");
      return;
    }
    if (formData.role === "STUDENT" && !formData.mssv.trim()) {
      setErrorMsg("MSSV không được để trống.");
      return;
    }

    startTransition(async () => {
      const res = await createUserAccount(formData);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        const roleLabel = availableRoles.find((r) => r.value === formData.role)?.label || formData.role;
        setSuccessMsg(`✅ Đã tạo tài khoản ${roleLabel} cho ${formData.email} thành công!`);
        // Reset form nhưng giữ role
        setFormData((prev) => ({
          ...prev,
          name: "",
          email: "",
          password: "ChangeMe123!",
          lecturerCode: "",
          facultyId: "",
          departmentId: "",
          mssv: "",
          cohort: "71",
          majorId: "",
        }));
        setTimeout(() => {
          setSuccessMsg("");
        }, 5000);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl mx-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-purple-600" />
            Cấp tài khoản người dùng
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/80 text-slate-400 hover:text-slate-600 transition-colors"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Role selector */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">
              Vai trò <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableRoles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => set("role", r.value)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all flex items-center gap-2 ${
                    formData.role === r.value
                      ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200"
                      : "bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  <span>{r.icon}</span>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-slate-200" />

          {/* Common fields */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                Họ và Tên <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                disabled={isPending}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                Email đăng nhập <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="user@utt.edu.vn"
                disabled={isPending}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                Mật khẩu mặc định
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => set("password", e.target.value)}
                  disabled={isPending}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Người dùng nên đổi mật khẩu sau lần đăng nhập đầu tiên.
              </p>
            </div>
          </div>

          {/* Lecturer-specific fields */}
          {formData.role === "LECTURER" && (
            <div className="border border-purple-100 bg-purple-50/50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-purple-700 uppercase tracking-widest flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" />
                Thông tin Giảng viên
              </p>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">
                  Mã Giảng viên <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.lecturerCode}
                  onChange={(e) => set("lecturerCode", e.target.value.toUpperCase())}
                  placeholder="Ví dụ: GV002"
                  disabled={isPending}
                  className="font-mono"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">
                  Khoa/Viện
                </label>
                <select
                  value={formData.facultyId}
                  onChange={(e) => set("facultyId", e.target.value)}
                  disabled={isPending}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="">-- Chọn Khoa/Viện --</option>
                  {FACULTIES.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">
                  Bộ môn
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => set("departmentId", e.target.value)}
                  disabled={isPending || !formData.facultyId}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="">-- Chọn Bộ môn --</option>
                  {currentFacultyDepts.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {!formData.facultyId && (
                  <p className="text-xs text-slate-400 mt-1">Vui lòng chọn Khoa/Viện trước</p>
                )}
              </div>
            </div>
          )}

          {/* Student-specific fields */}
          {formData.role === "STUDENT" && (
            <div className="border border-blue-100 bg-blue-50/50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                Thông tin Sinh viên
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">
                    MSSV <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.mssv}
                    onChange={(e) => set("mssv", e.target.value)}
                    placeholder="71DCHT20003"
                    disabled={isPending}
                    className="font-mono"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">
                    Khóa học
                  </label>
                  <select
                    value={formData.cohort}
                    onChange={(e) => set("cohort", e.target.value)}
                    disabled={isPending}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                  >
                    {COHORTS.map((c) => (
                      <option key={c} value={c}>Khóa {c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">
                  Khoa/Viện
                </label>
                <select
                  value={formData.facultyId}
                  onChange={(e) => set("facultyId", e.target.value)}
                  disabled={isPending}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="">-- Chọn Khoa/Viện --</option>
                  {FACULTIES.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">
                  Ngành học
                </label>
                <select
                  value={formData.majorId}
                  onChange={(e) => set("majorId", e.target.value)}
                  disabled={isPending || !formData.facultyId}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="">-- Chọn Ngành học --</option>
                  {currentFacultyMajors.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                {!formData.facultyId && (
                  <p className="text-xs text-slate-400 mt-1">Vui lòng chọn Khoa/Viện trước</p>
                )}
              </div>
            </div>
          )}

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200 flex items-start gap-2">
              <span className="text-red-500 mt-0.5">⚠️</span>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium flex items-center gap-2 border border-emerald-200">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
              {successMsg}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isPending}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 gap-2 shadow-md shadow-purple-200"
              disabled={isPending}
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
