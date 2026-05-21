"use client";

import Link from "next/link";
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

export default function OrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<{ id: string; createdAt: string; status: string; total: number; itemsCount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData?.user) {
        if (isActive) {
          setOrders([]);
          setLoading(false);
        }
        return;
      }

      const { data: orderRows, error: orderError } = await supabase
        .from("orders")
        .select("id, status, total_amount, created_at")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (orderError) {
        if (isActive) {
          setError(orderError.message);
          setLoading(false);
        }
        return;
      }

      const orderIds = (orderRows || []).map((row) => row.id);
      const itemRows = orderIds.length
        ? (
            await supabase
              .from("order_items")
              .select("order_id, quantity")
              .in("order_id", orderIds)
          ).data
        : [];

      const countByOrder = new Map<string, number>();
      (itemRows || []).forEach((item) => {
        countByOrder.set(item.order_id, (countByOrder.get(item.order_id) || 0) + item.quantity);
      });

      if (isActive) {
        setOrders(
          (orderRows || []).map((row) => ({
            id: row.id,
            createdAt: row.created_at,
            status: row.status,
            total: Number(row.total_amount || 0),
            itemsCount: countByOrder.get(row.id) || 0,
          }))
        );
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadOrders();
    } else {
      setLoading(false);
    }

    return () => {
      isActive = false;
    };
  }, [isAuthenticated]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [orders]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-3">Bạn cần đăng nhập</h1>
        <p className="text-slate-500 mb-6">Vui lòng đăng nhập để xem đơn hàng.</p>
        <Link href="/login">
          <Button className="rounded-full px-8">Đăng nhập</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="text-slate-500">Đang tải đơn hàng...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (sortedOrders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-3">Chưa có đơn hàng</h1>
        <p className="text-slate-500 mb-6">Bạn chưa đặt đơn nào. Hãy tiếp tục mua sắm.</p>
        <Link href="/products">
          <Button className="rounded-full px-8">Mua sắm ngay</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Đơn hàng của tôi</h1>
      <div className="grid grid-cols-1 gap-6">
        {sortedOrders.map((order) => (
          <Card key={order.id} className="shadow-sm">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-lg">#{order.id}</CardTitle>
                <div className="text-sm text-slate-500">
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </div>
              </div>
              <div className="text-sm font-semibold text-primary">
                {statusLabel[order.status] ?? "Đang xử lý"}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-sm text-slate-600">
                {order.itemsCount} sản phẩm
              </div>
              <div className="text-lg font-bold text-primary">
                {order.total.toLocaleString("vi-VN")}đ
              </div>
              <Link href={`/orders/${order.id}`}>
                <Button variant="outline" className="rounded-full">Xem hóa đơn</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
