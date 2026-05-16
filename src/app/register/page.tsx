"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const login = useAuthStore(state => state.login);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      if (password.length >= 6) {
        setSuccess(true);
        // Tự động đăng nhập luôn sau khi đăng ký
        login({
          id: `u${Math.floor(Math.random() * 1000)}`,
          name: fullName,
          email: email
        });
      } else {
        setError("Mật khẩu phải từ 6 ký tự trở lên.");
        setLoading(false);
      }
    }, 1500);
  };

  if (success) {
    return (
      <div className="bg-slate-50 min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md text-center border-0 shadow-2xl rounded-3xl overflow-hidden">
          <div className="h-2 bg-green-500"></div>
          <CardHeader className="pt-10">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-10 h-10" />
            </div>
            <CardTitle className="text-2xl font-extrabold text-slate-800">Đăng ký thành công!</CardTitle>
          </CardHeader>
          <CardContent className="px-8 text-slate-600">
            <p className="mb-2">Tài khoản <strong>{email}</strong> đã được tạo.</p>
            <p>Hệ thống đã tự động đăng nhập cho bạn.</p>
          </CardContent>
          <CardFooter className="px-8 pb-10 mt-4">
            <Link href="/" className="w-full">
              <Button className="w-full h-14 rounded-full text-lg font-bold">Bắt Đầu Mua Sắm</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Decoration */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3"></div>
      
      <Card className="w-full max-w-md relative z-10 border-0 shadow-2xl rounded-3xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
        <CardHeader className="space-y-2 text-center pt-8">
          <CardTitle className="text-3xl font-extrabold tracking-tight">Tạo Tài Khoản</CardTitle>
          <CardDescription className="text-base">
            Đăng ký để mua sắm dễ dàng hơn
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-5 px-8 pt-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="font-bold text-slate-700">Họ và Tên</Label>
              <Input 
                id="fullName" 
                placeholder="Ví dụ: Nguyễn Văn A" 
                required 
                className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-slate-700">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold text-slate-700">Mật khẩu</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Tối thiểu 6 ký tự"
                required 
                className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 px-8 pb-10 mt-6">
            <Button type="submit" className="w-full h-14 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng Ký Ngay"}
            </Button>
            <div className="text-center text-slate-600">
              Đã có tài khoản?{" "}
              <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Đăng nhập
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
