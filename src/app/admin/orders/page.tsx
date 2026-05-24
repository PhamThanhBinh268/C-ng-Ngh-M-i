"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const statusOptions = [
  { value: "pending", label: "Chờ xác nhận" },
  { value: "processing", label: "Đang đóng gói" },
  { value: "shipped", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" },
];

type OrderRow = {
  id: string;
  user_id: string | null;
  status: string;
  total_amount: number;
  payment_method: string | null;
  shipping_address: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
};

type OrderItemRow = {
  order_id: string;
  quantity: number;
  price_at_time: number;
  product: { id: string | null; name: string | null; image_url: string | null } | null;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [profiles, setProfiles] = useState<Map<string, ProfileRow>>(new Map());
  const [orderItems, setOrderItems] = useState<Map<string, OrderItemRow[]>>(new Map());
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data: orderRows, error: orderError } = await supabase
        .from("orders")
        .select("id, user_id, status, total_amount, payment_method, shipping_address, created_at")
        .order("created_at", { ascending: false });

      if (orderError) {
        if (isActive) {
          setError(orderError.message);
          setLoading(false);
        }
        return;
      }

      const userIds = Array.from(new Set((orderRows || []).map((row) => row.user_id).filter(Boolean))) as string[];
      const { data: profileRows } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);

      const orderIds = (orderRows || []).map((row) => row.id);
      const itemRows = orderIds.length
        ? (
            await supabase
              .from("order_items")
              .select("order_id, quantity, price_at_time, products (id, name, image_url)")
              .in("order_id", orderIds)
          ).data
        : [];

      const profileMap = new Map<string, ProfileRow>();
      (profileRows || []).forEach((row) => profileMap.set(row.id, row as ProfileRow));

      const itemsMap = new Map<string, OrderItemRow[]>();
      (itemRows || []).forEach((row) => {
        const product = Array.isArray(row.products) ? row.products[0] : row.products;
        const item: OrderItemRow = {
          order_id: row.order_id,
          quantity: row.quantity,
          price_at_time: Number(row.price_at_time || 0),
          product: product
            ? {
                id: product.id ?? null,
                name: product.name ?? null,
                image_url: product.image_url ?? null,
              }
            : null,
        };
        itemsMap.set(row.order_id, [...(itemsMap.get(row.order_id) || []), item]);
      });

      if (isActive) {
        setOrders((orderRows || []) as OrderRow[]);
        setProfiles(profileMap);
        setOrderItems(itemsMap);
        setLoading(false);
      }
    };

    loadOrders();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (filter !== "all" && order.status !== filter) return false;
      if (!keyword) return true;
      const profile = order.user_id ? profiles.get(order.user_id) : null;
      return (
        order.id.toLowerCase().includes(keyword) ||
        (profile?.full_name || "").toLowerCase().includes(keyword) ||
        (profile?.phone || "").toLowerCase().includes(keyword)
      );
    });
  }, [orders, filter, search, profiles]);

  const handleStatusChange = async (orderId: string, status: string) => {
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setOrders((prev) => prev.map((row) => (row.id === orderId ? { ...row, status } : row)));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Quản Lý Đơn Hàng</h1>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")} size="sm">Tất cả</Button>
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filter === option.value ? "default" : "outline"}
                  onClick={() => setFilter(option.value)}
                  size="sm"
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm mã đơn, khách hàng..."
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="p-6 text-slate-500">Đang tải đơn hàng...</div>
          )}
          {error && (
            <div className="p-6 text-red-600">{error}</div>
          )}
          {!loading && filteredOrders.length === 0 && (
            <div className="p-6 text-slate-500">Chưa có đơn hàng.</div>
          )}
          {filteredOrders.length > 0 && (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                <tr>
                  <th className="px-6 py-3">Mã đơn</th>
                  <th className="px-6 py-3">Ngày đặt</th>
                  <th className="px-6 py-3">Khách hàng</th>
                  <th className="px-6 py-3">Tổng tiền</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const profile = order.user_id ? profiles.get(order.user_id) : null;
                  const items = orderItems.get(order.id) || [];
                  return (
                    <Fragment key={order.id}>
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{order.id}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(order.created_at).toLocaleString("vi-VN")}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-700">{profile?.full_name || "Khách hàng"}</div>
                          <div className="text-xs text-slate-500">{profile?.phone || "-"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-primary">{Number(order.total_amount || 0).toLocaleString("vi-VN")}đ</div>
                          <div className="text-xs text-slate-500">{items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm</div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                            value={order.status}
                            onChange={(event) => handleStatusChange(order.id, event.target.value)}
                          >
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-slate-600"
                            onClick={() => setExpandedOrderId((prev) => (prev === order.id ? null : order.id))}
                          >
                            <Eye className="w-4 h-4" /> Chi tiết
                          </Button>
                        </td>
                      </tr>
                      {expandedOrderId === order.id && (
                        <tr className="bg-slate-50/70">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs font-semibold text-slate-500 mb-2">Địa chỉ giao hàng</div>
                                <div className="text-sm text-slate-700">{order.shipping_address || "-"}</div>
                                <div className="text-xs text-slate-500 mt-2">Phương thức: {order.payment_method || "COD"}</div>
                              </div>
                              <div className="space-y-2">
                                {items.map((item, idx) => (
                                  <div key={`${order.id}-${idx}`} className="flex items-center gap-3">
                                    <img
                                      src={item.product?.image_url || ""}
                                      alt={item.product?.name || ""}
                                      className="w-10 h-10 rounded border object-cover"
                                    />
                                    <div className="flex-1">
                                      <div className="text-sm font-semibold text-slate-800">{item.product?.name || "Sản phẩm"}</div>
                                      <div className="text-xs text-slate-500">SL: {item.quantity}</div>
                                    </div>
                                    <div className="text-sm font-semibold text-primary">
                                      {(item.price_at_time * item.quantity).toLocaleString("vi-VN")}đ
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
