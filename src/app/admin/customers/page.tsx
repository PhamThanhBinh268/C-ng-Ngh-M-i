"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, MapPin, Star } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const VIP_SPENT = 10000000;

type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  role: string | null;
};

type OrderRow = {
  id: string;
  user_id: string | null;
  total_amount: number;
};

type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  address: string;
  orders: number;
  spent: number;
  type: string;
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadCustomers = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const { data: profileRows, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, phone, address, role")
        .neq("role", "admin");

      if (profileError) {
        if (isActive) {
          setError(profileError.message);
          setLoading(false);
        }
        return;
      }

      const userIds = (profileRows || []).map((row) => row.id);
      const { data: orderRows } = await supabase
        .from("orders")
        .select("id, user_id, total_amount")
        .in("user_id", userIds);

      const statsByUser = new Map<string, { orders: number; spent: number }>();
      (orderRows || []).forEach((row) => {
        if (!row.user_id) return;
        const current = statsByUser.get(row.user_id) || { orders: 0, spent: 0 };
        statsByUser.set(row.user_id, {
          orders: current.orders + 1,
          spent: current.spent + Number(row.total_amount || 0),
        });
      });

      if (isActive) {
        const mapped = (profileRows || []).map((row) => {
          const stats = statsByUser.get(row.id) || { orders: 0, spent: 0 };
          let type = "Thường xuyên";
          if (stats.spent >= VIP_SPENT) type = "VIP";
          else if (stats.orders <= 1) type = "Mới";

          return {
            id: row.id,
            name: row.full_name || "Khách hàng",
            phone: row.phone || "-",
            address: row.address || "-",
            orders: stats.orders,
            spent: stats.spent,
            type,
          };
        });

        setCustomers(mapped);
        setLoading(false);
      }
    };

    loadCustomers();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return customers;
    return customers.filter((cust) => {
      return (
        cust.name.toLowerCase().includes(keyword) ||
        cust.phone.toLowerCase().includes(keyword) ||
        cust.address.toLowerCase().includes(keyword)
      );
    });
  }, [customers, search]);

  const totalCustomers = customers.length;
  const vipCustomers = customers.filter((cust) => cust.type === "VIP").length;
  const newCustomers = customers.filter((cust) => cust.type === "Mới").length;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Quản Lý Khách Hàng</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-slate-500 mb-1">Tổng khách hàng</div>
            <div className="text-3xl font-bold text-slate-800">{totalCustomers}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-amber-200">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-amber-600 mb-1 flex items-center gap-1"><Star className="w-4 h-4" /> Khách hàng VIP</div>
            <div className="text-3xl font-bold text-slate-800">{vipCustomers}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-blue-600 mb-1">Khách mới</div>
            <div className="text-3xl font-bold text-slate-800">{newCustomers}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm tên, SĐT, địa chỉ..."
                className="pl-9 h-10"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Xuất Excel</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="p-6 text-slate-500">Đang tải khách hàng...</div>
          )}
          {error && (
            <div className="p-6 text-red-600">{error}</div>
          )}
          {!loading && filteredCustomers.length === 0 && (
            <div className="p-6 text-slate-500">Chưa có khách hàng.</div>
          )}
          {filteredCustomers.length > 0 && (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                <tr>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Liên hệ</th>
                  <th className="px-6 py-4">Lịch sử mua</th>
                  <th className="px-6 py-4">Phân loại</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-base">{cust.name}</div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {cust.address}</div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="text-slate-600 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {cust.phone}</div>
                      <div className="text-slate-600 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> (ẩn)</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-primary">{cust.spent.toLocaleString("vi-VN")}đ</div>
                      <div className="text-xs text-slate-500">{cust.orders} đơn hàng</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                        cust.type === "VIP"
                          ? "bg-amber-100 text-amber-700"
                          : cust.type === "Mới"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {cust.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
