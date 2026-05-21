"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";

const statusOptions = [
  { value: "open", label: "Đã gửi" },
  { value: "in_progress", label: "Đang xử lý" },
  { value: "resolved", label: "Đã phản hồi" },
];

type RequestRow = {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  status: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
};

export default function AdminRequests() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [profileById, setProfileById] = useState<Map<string, ProfileRow>>(new Map());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadRequests = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data: requestRows, error: requestError } = await supabase
        .from("customer_requests")
        .select("id, user_id, title, message, status, created_at")
        .order("created_at", { ascending: false });

      if (requestError) {
        if (isActive) {
          setError(requestError.message);
          setLoading(false);
        }
        return;
      }

      const userIds = Array.from(new Set((requestRows || []).map((row) => row.user_id).filter(Boolean))) as string[];
      const { data: profileRows } = await supabase
        .from("profiles")
        .select("id, full_name, phone, address")
        .in("id", userIds);

      const profileMap = new Map<string, ProfileRow>();
      (profileRows || []).forEach((row) => {
        profileMap.set(row.id, row as ProfileRow);
      });

      if (isActive) {
        setRequests((requestRows || []) as RequestRow[]);
        setProfileById(profileMap);
        setLoading(false);
      }
    };

    loadRequests();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredRequests = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return requests;
    return requests.filter((row) => {
      const profile = row.user_id ? profileById.get(row.user_id) : null;
      return (
        row.title.toLowerCase().includes(keyword) ||
        row.message.toLowerCase().includes(keyword) ||
        (profile?.full_name || "").toLowerCase().includes(keyword) ||
        (profile?.phone || "").toLowerCase().includes(keyword)
      );
    });
  }, [requests, search, profileById]);

  const handleStatusChange = async (requestId: string, status: string) => {
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("customer_requests")
      .update({ status })
      .eq("id", requestId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setRequests((prev) => prev.map((row) => (row.id === requestId ? { ...row, status } : row)));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Yêu Cầu Khách Hàng</h1>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b">
          <CardTitle>Danh sách yêu cầu</CardTitle>
          <div className="relative w-full md:w-80">
            <Input
              placeholder="Tìm tiêu đề, nội dung, khách hàng..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="p-6 text-slate-500">Đang tải dữ liệu...</div>
          )}
          {error && (
            <div className="p-6 text-red-600">{error}</div>
          )}
          {!loading && filteredRequests.length === 0 && (
            <div className="p-6 text-slate-500">Chưa có yêu cầu nào.</div>
          )}
          {filteredRequests.length > 0 && (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                <tr>
                  <th className="px-6 py-3">Khách hàng</th>
                  <th className="px-6 py-3">Yêu cầu</th>
                  <th className="px-6 py-3">Ngày gửi</th>
                  <th className="px-6 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((row) => {
                  const profile = row.user_id ? profileById.get(row.user_id) : null;
                  return (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{profile?.full_name || "Khách hàng"}</div>
                        <div className="text-xs text-slate-500">{profile?.phone || "-"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{row.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-2">{row.message}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(row.created_at).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                          value={row.status}
                          onChange={(event) => handleStatusChange(row.id, event.target.value)}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
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
