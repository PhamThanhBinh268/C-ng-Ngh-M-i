"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, MapPin, Star, MoreVertical } from "lucide-react";

const mockCustomers = [
  { id: "CUST-001", name: "Nguyễn Văn A", email: "nguyenvana@gmail.com", phone: "0901234567", address: "Quận 1, TP.HCM", orders: 12, spent: 15400000, type: "VIP" },
  { id: "CUST-002", name: "Trần Thị B", email: "tranthib@gmail.com", phone: "0912345678", address: "Quận Đống Đa, Hà Nội", orders: 1, spent: 450000, type: "Mới" },
  { id: "CUST-003", name: "Lê Văn C", email: "levanc@gmail.com", phone: "0987654321", address: "Quận Cầu Giấy, Hà Nội", orders: 5, spent: 3200000, type: "Thường xuyên" },
  { id: "CUST-004", name: "Phạm Thị D", email: "phamthid@gmail.com", phone: "0976543210", address: "Quận 3, TP.HCM", orders: 2, spent: 850000, type: "Thường xuyên" },
  { id: "CUST-005", name: "Hoàng Văn E", email: "hoangvane@gmail.com", phone: "0965432109", address: "Quận Hải Châu, Đà Nẵng", orders: 15, spent: 22000000, type: "VIP" },
];

export default function AdminCustomers() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Quản Lý Khách Hàng</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-slate-500 mb-1">Tổng Khách Hàng</div>
            <div className="text-3xl font-bold text-slate-800">1,248</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-amber-200">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-amber-600 mb-1 flex items-center gap-1"><Star className="w-4 h-4" /> Khách Hàng VIP</div>
            <div className="text-3xl font-bold text-slate-800">86</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-blue-600 mb-1">Khách Mua Lần Đầu (Tháng này)</div>
            <div className="text-3xl font-bold text-slate-800">124</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Tìm tên, email, SĐT..." className="pl-9 h-10" />
            </div>
            <div className="flex gap-2">
              <select className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <option>Tất cả khách hàng</option>
                <option>Khách hàng VIP</option>
                <option>Khách hàng mới</option>
              </select>
              <Button>Xuất Excel</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b">
              <tr>
                <th className="px-6 py-4">Khách hàng (Phụ huynh)</th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4">Lịch sử mua</th>
                <th className="px-6 py-4">Phân tập</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 text-base">{cust.name}</div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {cust.address}</div>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <div className="text-slate-600 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {cust.phone}</div>
                    <div className="text-slate-600 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {cust.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-primary">{cust.spent.toLocaleString('vi-VN')}đ</div>
                    <div className="text-xs text-slate-500">{cust.orders} đơn hàng</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                      cust.type === 'VIP' ? 'bg-amber-100 text-amber-700' : 
                      cust.type === 'Mới' ? 'bg-blue-100 text-blue-700' : 
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {cust.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
