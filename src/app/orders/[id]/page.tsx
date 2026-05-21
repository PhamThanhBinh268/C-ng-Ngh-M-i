"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";

const statusLabel: Record<string, string> = {
  pending: "Chờ xác nhận",
  processing: "Đang đóng gói",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

type OrderItem = {
  id: string;
  quantity: number;
  price_at_time: number;
  product: {
    id: string | null;
    name: string | null;
    image_url: string | null;
  } | null;
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<{
    id: string;
    status: string;
    createdAt: string;
    totalAmount: number;
    paymentMethod: string;
    shippingAddress: string;
    customerName: string | null;
    customerPhone: string | null;
    customerEmail: string | null;
  } | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price_at_time * item.quantity, 0);
  }, [items]);

  useEffect(() => {
    let isActive = true;

    const loadOrder = async () => {
      if (!orderId) return;
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData?.user) {
        if (isActive) {
          setLoading(false);
        }
        return;
      }

      const { data: orderRow, error: orderError } = await supabase
        .from("orders")
        .select("id, status, total_amount, payment_method, shipping_address, created_at")
        .eq("id", orderId)
        .single();

      if (orderError || !orderRow) {
        if (isActive) {
          setError(orderError?.message || "Không tìm thấy đơn hàng.");
          setLoading(false);
        }
        return;
      }

      const { data: profileRow } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", userData.user.id)
        .single();

      const { data: itemRows } = await supabase
        .from("order_items")
        .select("id, quantity, price_at_time, products (id, name, image_url)")
        .eq("order_id", orderId);

      if (isActive) {
        setOrder({
          id: orderRow.id,
          status: orderRow.status,
          createdAt: orderRow.created_at,
          totalAmount: Number(orderRow.total_amount || 0),
          paymentMethod: orderRow.payment_method || "COD",
          shippingAddress: orderRow.shipping_address || "",
          customerName: profileRow?.full_name || null,
          customerPhone: profileRow?.phone || null,
          customerEmail: userData.user.email || null,
        });
        setItems(
          (itemRows || []).map((row) => ({
            id: row.id,
            quantity: row.quantity,
            price_at_time: Number(row.price_at_time || 0),
            product: row.products
              ? {
                  id: row.products.id ?? null,
                  name: row.products.name ?? null,
                  image_url: row.products.image_url ?? null,
                }
              : null,
          }))
        );
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadOrder();
    } else {
      setLoading(false);
    }

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, orderId]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-3">Bạn cần đăng nhập</h1>
        <p className="text-slate-500 mb-6">Vui lòng đăng nhập để xem hóa đơn.</p>
        <Link href="/login">
          <Button className="rounded-full px-8">Đăng nhập</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="text-slate-500">Đang tải hóa đơn...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="text-red-600">{error}</div>
        <Link href="/orders">
          <Button className="rounded-full px-8 mt-6">Quay lại danh sách đơn</Button>
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-3">Không tìm thấy đơn hàng</h1>
        <p className="text-slate-500 mb-6">Đơn hàng không tồn tại hoặc đã bị xóa.</p>
        <Link href="/orders">
          <Button className="rounded-full px-8">Quay lại danh sách đơn</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Hóa đơn #{order.id}</h1>
          <div className="text-sm text-slate-500">
            {new Date(order.createdAt).toLocaleString("vi-VN")}
          </div>
        </div>
        <div className="text-sm font-semibold text-primary">
          {statusLabel[order.status] ?? "Đang xử lý"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sản phẩm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-white rounded-md overflow-hidden shrink-0 border">
                  <img src={item.product?.image_url || ""} alt={item.product?.name || ""} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-medium line-clamp-2 text-sm">{item.product?.name || "Sản phẩm"}</div>
                  <div className="text-xs text-slate-500">Số lượng: {item.quantity}</div>
                </div>
                <div className="text-sm font-semibold text-primary">
                  {(item.price_at_time * item.quantity).toLocaleString("vi-VN")}đ
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin giao hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <div>{order.customerName || "-"}</div>
              <div>{order.customerPhone || "-"}</div>
              <div>{order.customerEmail || "-"}</div>
              <div>{order.shippingAddress || "-"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <div>Phương thức: {order.paymentMethod === "BANK" ? "Chuyển khoản" : "COD"}</div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tạm tính</span>
                <span>{subtotal.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Phí giao hàng</span>
                <span>Miễn phí</span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span>Tổng cộng</span>
                <span className="text-primary">{order.totalAmount.toLocaleString("vi-VN")}đ</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Link href="/orders">
          <Button variant="outline" className="rounded-full">Quay lại danh sách đơn</Button>
        </Link>
      </div>
    </div>
  );
}
