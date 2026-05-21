"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    payment: "cod",
  });

  const subtotal = totalPrice();

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isAuthenticated) {
      setError("Vui lòng đăng nhập để đặt hàng.");
      return;
    }
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData?.user) {
        setError("Không xác thực được tài khoản. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
        })
        .eq("id", userData.user.id);

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userData.user.id,
          status: "pending",
          total_amount: subtotal,
          shipping_address: formData.address,
          payment_method: formData.payment === "bank" ? "BANK" : "COD",
        })
        .select("id")
        .single();

      if (orderError || !orderData) {
        setError(orderError?.message || "Không thể tạo đơn hàng.");
        setLoading(false);
        return;
      }

      const orderItemsPayload = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItemsPayload);

      if (itemsError) {
        setError(itemsError.message || "Không thể lưu sản phẩm trong đơn hàng.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setOrderId(orderData.id);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đặt hàng thất bại.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <CheckCircle2 className="w-24 h-24 text-green-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4 text-slate-900">Đặt hàng thành công!</h1>
        <p className="text-slate-500 mb-8 max-w-md">
          Cảm ơn bạn đã mua sắm tại ToyStore. Mã đơn hàng của bạn là <strong>#{orderId ?? "TS00000000"}</strong>.
          Chúng tôi sẽ sớm liên hệ để giao hàng cho bạn.
        </p>
        <div className="flex gap-4">
          <Link href="/products">
            <Button variant="outline" className="rounded-full px-8">
              Tiếp tục mua sắm
            </Button>
          </Link>
          <Link href={orderId ? `/orders/${orderId}` : "/orders"}>
            <Button className="rounded-full px-8">
              Xem đơn hàng
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Giỏ hàng trống</h1>
        <Link href="/products">
          <Button>Quay lại mua sắm</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/cart" className="inline-flex items-center text-sm text-slate-500 hover:text-primary mb-8">
        <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại giỏ hàng
      </Link>
      
      <h1 className="text-3xl font-bold mb-8">Thanh Toán</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <form onSubmit={handleCheckout} id="checkout-form">
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Giao Hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và Tên</Label>
                <Input
                  id="fullName"
                  required
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    required
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ giao hàng</Label>
                <Input
                  id="address"
                  required
                  placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>
              
              <div className="pt-4 border-t mt-6">
                <h3 className="font-semibold mb-4">Phương thức thanh toán</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={formData.payment === "cod"}
                      onChange={() => setFormData((prev) => ({ ...prev, payment: "cod" }))}
                      className="w-4 h-4 text-primary"
                    />
                    <div>
                      <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
                      <div className="text-sm text-slate-500">Thanh toán bằng tiền mặt khi nhận hàng</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="bank"
                      checked={formData.payment === "bank"}
                      onChange={() => setFormData((prev) => ({ ...prev, payment: "bank" }))}
                      className="w-4 h-4 text-primary"
                    />
                    <div>
                      <div className="font-medium">Chuyển khoản ngân hàng</div>
                      <div className="text-sm text-slate-500">Chuyển khoản qua mã QR hoặc STK (MoMo/VNPay)</div>
                    </div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>

        <div>
          <Card className="sticky top-24 bg-slate-50 border-none shadow-sm">
            <CardHeader>
              <CardTitle>Tóm Tắt Đơn Hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-64 overflow-auto pr-2 space-y-4 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-white rounded-md overflow-hidden shrink-0 border">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex justify-between">
                      <div>
                        <div className="font-medium line-clamp-2 text-sm">{item.name}</div>
                        <div className="text-slate-500 text-sm">SL: {item.quantity}</div>
                      </div>
                      <div className="font-semibold text-sm">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tạm tính</span>
                  <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Phí giao hàng</span>
                  <span>Miễn phí</span>
                </div>
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-bold">Tổng cộng</span>
                <span className="font-bold text-2xl text-primary">{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button form="checkout-form" type="submit" className="w-full rounded-full" size="lg" disabled={loading}>
                {loading ? "Đang xử lý..." : "Đặt Hàng Ngay"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
