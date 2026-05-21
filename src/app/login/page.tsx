"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@toystore.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const login = useAuthStore(state => state.login);

  const getAuthErrorMessage = (message: string, status?: number | null) => {
    if (status === 404) {
      return "Không tìm thấy endpoint Supabase. Kiểm tra NEXT_PUBLIC_SUPABASE_URL và khởi động lại server.";
    }
    if (status === 400) {
      return message || "Email hoặc mật khẩu không đúng.";
    }
    return message || "Đăng nhập thất bại. Vui lòng thử lại.";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("Mật khẩu phải lớn hơn 6 ký tự.");
      setLoading(false);
      return;
    }

    let supabase;
    try {
      supabase = createClient();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể khởi tạo Supabase client.");
      setLoading(false);
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setError(getAuthErrorMessage(signInError.message, signInError.status));
      setLoading(false);
      return;
    }

    const user = data.user;
    if (user) {
      login({
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
        email: user.email || email
      });
    }

    window.location.href = "/";
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

      <Card className="w-full max-w-md relative z-10 border-0 shadow-2xl rounded-3xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary to-purple-500"></div>
        <CardHeader className="space-y-2 text-center pt-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 text-primary">
            <Sparkles className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight">Chào Mừng Trở Lại</CardTitle>
          <CardDescription className="text-base">
            Đăng nhập để nhận ưu đãi và theo dõi đơn hàng
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-5 px-8 pt-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-bold text-slate-700">Mật khẩu</Label>
                <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 px-8 pb-10 mt-6">
            <Button type="submit" className="w-full h-14 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng Nhập"}
            </Button>
            <div className="text-center text-slate-600">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="font-bold text-primary hover:text-primary/80 transition-colors">
                Đăng ký ngay
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
