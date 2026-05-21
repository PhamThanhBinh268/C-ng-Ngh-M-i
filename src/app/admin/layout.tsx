"use client";

import Link from "next/link";
import { LayoutDashboard, Package, Folders, ShoppingCart, Users, Tag, ArrowLeft, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const isAdmin = Boolean(user && user.email === "admin@toystore.com");

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push("/");
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Không có quyền truy cập</h1>
          <p className="text-slate-500 mb-6">Chỉ tài khoản admin mới vào được trang quản trị.</p>
          <Link href="/">
            <Button className="rounded-full px-8">Về trang chủ</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <Link href="/" className="font-extrabold text-xl text-white flex items-center gap-2">
            🧸 ToyStore Admin
          </Link>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <nav className="space-y-1">
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
              <LayoutDashboard className="w-5 h-5" /> Bảng điều khiển
            </Link>
            <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
              <Package className="w-5 h-5" /> Quản lý sản phẩm
            </Link>
            <Link href="/admin/categories" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
              <Folders className="w-5 h-5" /> Quản lý danh mục
            </Link>
            <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
              <ShoppingCart className="w-5 h-5" /> Quản lý đơn hàng
            </Link>
            <Link href="/admin/customers" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
              <Users className="w-5 h-5" /> Quản lý khách hàng
            </Link>
            <Link href="/admin/requests" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
              <MessageSquareText className="w-5 h-5" /> Yêu cầu khách hàng
            </Link>
            <Link href="/admin/marketing" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
              <Tag className="w-5 h-5" /> Khuyến mãi & CMS
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start gap-2 text-slate-400 hover:text-white hover:bg-slate-800">
              <ArrowLeft className="w-4 h-4" /> Quay lại cửa hàng
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
