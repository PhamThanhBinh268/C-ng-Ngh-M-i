"use client";

import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-slate-300" />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-slate-900">Giỏ hàng của bạn đang trống</h1>
        <p className="text-slate-500 mb-8 max-w-md">
          Có vẻ như bạn chưa thêm món đồ chơi nào vào giỏ hàng. Khám phá các sản phẩm nổi bật của chúng tôi và tìm món quà hoàn hảo ngay!
        </p>
        <Link href="/">
          <Button size="lg" className="rounded-full px-8">
            Tiếp tục mua sắm
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Giỏ Hàng Của Bạn</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-32 h-32 bg-slate-100 shrink-0">
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 -mr-2 -mt-2"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-3 bg-slate-100 rounded-full px-1 py-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full bg-white shadow-sm"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full bg-white shadow-sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="font-bold text-lg text-primary">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Tổng Đơn Hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính ({items.reduce((acc, item) => acc + item.quantity, 0)} sản phẩm)</span>
                <span className="font-medium">{totalPrice().toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phí giao hàng</span>
                <span className="font-medium">Miễn phí</span>
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-bold">Tổng cộng</span>
                <span className="font-bold text-xl text-primary">{totalPrice().toLocaleString('vi-VN')}đ</span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/checkout" className="w-full">
                <Button className="w-full rounded-full" size="lg">
                  Tiến Hành Thanh Toán <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
