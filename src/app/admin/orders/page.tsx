"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Truck, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useState } from "react";

const mockOrders = [
  { id: "TS-1029", date: "15/05/2026", customer: "Nguyễn Văn A", phone: "0901234567", total: 1250000, status: "pending", items: 2 },
  { id: "TS-1028", date: "14/05/2026", customer: "Trần Thị B", phone: "0912345678", total: 450000, status: "processing", items: 1 },
  { id: "TS-1027", date: "13/05/2026", customer: "Lê Văn C", phone: "0987654321", total: 3200000, status: "shipping", items: 4 },
  { id: "TS-1026", date: "12/05/2026", customer: "Phạm Thị D", phone: "0976543210", total: 150000, status: "delivered", items: 1 },
  { id: "TS-1025", date: "10/05/2026", customer: "Hoàng Văn E", phone: "0965432109", total: 850000, status: "cancelled", items: 1 },
  { id: "TS-1024", date: "09/05/2026", customer: "Đặng Thị F", phone: "0954321098", total: 2100000, status: "returned", items: 3 },
];

const statusConfig = {
  pending: { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  processing: { label: "Đang đóng gói", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Package },
  shipping: { label: "Đang giao", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: Truck },
  delivered: { label: "Đã giao", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  cancelled: { label: "Đã Hủy", color: "bg-slate-100 text-slate-700 border-slate-200", icon: XCircle },
  returned: { label: "Hoàn trả/Khiếu nại", color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle },
};

import { Package, AlertTriangle } from "lucide-react"; // Import missing icons

export default function AdminOrders() {
  const [filter, setFilter] = useState("all");

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
              <Button variant={filter === "pending" ? "default" : "outline"} onClick={() => setFilter("pending")} size="sm" className={filter === "pending" ? "bg-amber-500 hover:bg-amber-600" : ""}>Chờ xác nhận</Button>
              <Button variant={filter === "shipping" ? "default" : "outline"} onClick={() => setFilter("shipping")} size="sm" className={filter === "shipping" ? "bg-indigo-500 hover:bg-indigo-600" : ""}>Đang giao</Button>
              <Button variant={filter === "returned" ? "default" : "outline"} onClick={() => setFilter("returned")} size="sm" className={filter === "returned" ? "bg-red-500 hover:bg-red-600" : ""}>Hoàn trả/Khiếu nại</Button>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Tìm mã đơn, SĐT..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b">
              <tr>
                <th className="px-6 py-3">Mã Đơn</th>
                <th className="px-6 py-3">Ngày đặt</th>
                <th className="px-6 py-3">Khách hàng</th>
                <th className="px-6 py-3">Tổng tiền</th>
                <th className="px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockOrders.filter(o => filter === "all" || o.status === filter).map((order) => {
                const StatusIcon = statusConfig[order.status as keyof typeof statusConfig].icon;
                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{order.id}</td>
                    <td className="px-6 py-4 text-slate-500">{order.date}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{order.customer}</div>
                      <div className="text-xs text-slate-500">{order.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-primary">{order.total.toLocaleString('vi-VN')}đ</div>
                      <div className="text-xs text-slate-500">{order.items} sản phẩm</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusConfig[order.status as keyof typeof statusConfig].color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig[order.status as keyof typeof statusConfig].label}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" className="gap-1.5 text-slate-600">
                        <Eye className="w-4 h-4" /> Chi tiết
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
