"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Search, Menu, User, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function Header() {
  const totalItems = useCartStore((state) => state.totalItems());
  const { user, isAuthenticated } = useAuthStore();
  const isAdmin = Boolean(user && user.email === "admin@toystore.com");
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-2' : 'bg-white/50 backdrop-blur-sm py-4 border-b border-white/20'}`}>
      <div className="container mx-auto px-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/" className="font-extrabold text-2xl tracking-tight text-primary flex items-center gap-2 hover:scale-105 transition-transform">
            <span className="text-3xl">🧸</span> 
            <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-purple-600">
              ToyStore
            </span>
          </Link>
        </div>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8 relative group">
          <Input 
            placeholder="Bạn muốn tìm đồ chơi gì hôm nay?..." 
            className="w-full pl-12 pr-4 h-12 rounded-full bg-slate-100/80 border-transparent focus:border-primary focus:ring-primary focus:bg-white transition-all shadow-sm group-hover:shadow-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
          />
          <Search 
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-primary transition-colors cursor-pointer" 
            onClick={() => {
              if (searchQuery.trim()) {
                router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
          />
        </div>

        {/* Navigation & Actions */}
        <nav className="flex items-center gap-2 md:gap-4">
          <Link href="/products" className={`hidden md:flex items-center gap-1 text-sm font-bold transition-colors mr-2 px-3 py-2 rounded-full ${pathname === '/products' ? 'text-primary bg-primary/10' : 'text-slate-600 hover:text-primary hover:bg-slate-100'}`}>
            Sản Phẩm
          </Link>
          
          <Link href="/ai-suggestion" className="hidden lg:flex items-center gap-1 text-sm font-bold text-yellow-600 bg-yellow-100 hover:bg-yellow-200 transition-colors mr-2 px-4 py-2 rounded-full border border-yellow-200">
            <Sparkles className="w-4 h-4" /> AI Gợi Ý
          </Link>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative w-12 h-12 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 text-[11px] font-bold text-white flex items-center justify-center shadow-md animate-in zoom-in">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          
          {isAuthenticated && user ? (
            <div className="relative group/user">
              <Button variant="ghost" className="hidden sm:flex items-center gap-2 h-12 rounded-full hover:bg-primary/10 transition-colors px-4 border border-slate-200 bg-white">
                <div className="relative w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold uppercase overflow-hidden">
                  {user.avatarUrl ? (
                    <Image src={user.avatarUrl} alt={user.name} fill sizes="24px" className="object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <span className="font-medium max-w-25 truncate">{user.name}</span>
              </Button>
              <Button variant="ghost" size="icon" className="sm:hidden w-12 h-12 rounded-full bg-primary text-primary-foreground">
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt={user.name} width={48} height={48} className="rounded-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </Button>
              
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all translate-y-2 group-hover/user:translate-y-0">
                <div className="p-3 border-b border-slate-100">
                  <div className="font-bold text-slate-800 truncate">{user.name}</div>
                  <div className="text-xs text-slate-500 truncate">{user.email}</div>
                </div>
                <div className="p-2">
                  <Link href="/profile" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary hover:bg-slate-50 rounded-xl transition-colors">Hồ sơ</Link>
                  {isAdmin && (
                    <Link href="/admin" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary hover:bg-slate-50 rounded-xl transition-colors">Trang Quản Trị</Link>
                  )}
                  <button 
                    onClick={() => useAuthStore.getState().logout()} 
                    className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                <User className="h-6 w-6" />
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
