"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Email hoặc mật khẩu không chính xác.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-8 bg-slate-50">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-orange-600 p-3 rounded-full mb-4 shadow-lg shadow-orange-600/20">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-center">Đại học Công nghệ Giao thông Vận tải</h1>
            <p className="text-slate-500 mt-2">Hệ thống quản lý sinh viên tập trung</p>
          </div>

          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardHeader>
              <CardTitle>Đăng nhập hệ thống</CardTitle>
              <CardDescription>
                Nhập tài khoản được cấp để truy cập chức năng
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="email@utt.edu.vn" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <a href="#" className="text-sm font-medium text-orange-600 hover:underline">Quên mật khẩu?</a>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && (
                  <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm font-medium">
                    {error}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Đăng nhập vào hệ thống"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
      
      <div className="hidden lg:block relative bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-slate-900/90 mix-blend-multiply" />
        <Image
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2670&auto=format&fit=crop" 
          alt="University Campus" 
          fill
          priority
          sizes="50vw"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
          <blockquote className="space-y-4 max-w-xl">
            <p className="text-2xl font-medium leading-relaxed">
              &ldquo;Số hóa quy trình giáo dục không chỉ giúp tối ưu nguồn lực mà còn nâng cao trải nghiệm học tập, hướng tới môi trường đại học thông minh và hiện đại.&rdquo;
            </p>
            <footer className="text-slate-300">
              Ban Giám Hiệu
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
