"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";

const statusLabel: Record<string, string> = {
  pending: "Chờ xác nhận",
  processing: "Đang đóng gói",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const requestStatusLabel: Record<string, string> = {
  open: "Đã gửi",
  in_progress: "Đang xử lý",
  resolved: "Đã phản hồi",
};

type OrderSummary = {
  id: string;
  createdAt: string;
  status: string;
  total: number;
  itemsCount: number;
};

type CustomerRequest = {
  id: string;
  title: string;
  message: string;
  status: string;
  createdAt: string;
};

type ProfileFormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  avatarUrl: string;
};

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    avatarUrl: user?.avatarUrl || "",
  });
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const [requestForm, setRequestForm] = useState({
    title: "",
    message: "",
  });
  const [requestMessage, setRequestMessage] = useState<string | null>(null);
  const avatarBucket = "avatars";

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

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

      const [{ data: profileRow }, { data: orderRows, error: orderError }, { data: requestRows }] = await Promise.all([
        supabase.from("profiles").select("full_name, phone, address, avatar_url").eq("id", userData.user.id).single(),
        supabase
          .from("orders")
          .select("id, status, total_amount, created_at")
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("customer_requests")
          .select("id, title, message, status, created_at")
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false }),
      ]);

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
        setProfileForm((prev) => ({
          ...prev,
          name: profileRow?.full_name || userData.user.email?.split("@")[0] || "",
          email: userData.user.email || "",
          phone: profileRow?.phone || "",
          address: profileRow?.address || "",
          avatarUrl: profileRow?.avatar_url || user?.avatarUrl || "",
        }));

        setOrders(
          (orderRows || []).map((row) => ({
            id: row.id,
            createdAt: row.created_at,
            status: row.status,
            total: Number(row.total_amount || 0),
            itemsCount: countByOrder.get(row.id) || 0,
          }))
        );

        setRequests(
          (requestRows || []).map((row) => ({
            id: row.id,
            title: row.title,
            message: row.message,
            status: row.status,
            createdAt: row.created_at,
          }))
        );
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, user?.email, user?.avatarUrl]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [orders]);

  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [requests]);

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileMessage(null);

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
      setProfileMessage("Vui lòng đăng nhập lại.");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        address: profileForm.address.trim(),
        avatar_url: profileForm.avatarUrl.trim(),
      })
      .eq("id", userData.user.id);

    if (updateError) {
      setProfileMessage(updateError.message);
      return;
    }

    updateUser({
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      avatarUrl: profileForm.avatarUrl.trim() || undefined,
    });
    setProfileMessage("Đã cập nhật thông tin người dùng.");
  };

  const handleAvatarUpload = async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview((currentPreview) => {
      if (currentPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(currentPreview);
      }
      return previewUrl;
    });
    setAvatarUploading(true);
    setProfileMessage(null);

    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData?.user) {
        throw new Error("Vui lòng đăng nhập lại.");
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
      const storagePath = `${userData.user.id}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(avatarBucket)
        .upload(storagePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage.from(avatarBucket).getPublicUrl(storagePath);
      const publicUrl = publicUrlData.publicUrl;

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userData.user.id);

      if (profileUpdateError) {
        throw profileUpdateError;
      }

      setProfileForm((prev) => ({ ...prev, avatarUrl: publicUrl }));
      updateUser({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        avatarUrl: publicUrl,
      });
      setProfileMessage("Đã cập nhật ảnh đại diện.");
    } catch (err) {
      setProfileMessage(err instanceof Error ? err.message : "Không thể tải ảnh đại diện lên.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: passwordForm.newPassword,
    });

    if (updateError) {
      setPasswordMessage(updateError.message);
      return;
    }

    setPasswordMessage("Đã cập nhật mật khẩu thành công.");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleRequestSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!requestForm.title.trim() || !requestForm.message.trim()) {
      setRequestMessage("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
      return;
    }

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
      setRequestMessage("Vui lòng đăng nhập lại.");
      return;
    }

    const { data: requestRow, error: requestError } = await supabase
      .from("customer_requests")
      .insert({
        user_id: userData.user.id,
        title: requestForm.title.trim(),
        message: requestForm.message.trim(),
        status: "open",
      })
      .select("id, title, message, status, created_at")
      .single();

    if (requestError || !requestRow) {
      setRequestMessage(requestError?.message || "Không thể gửi yêu cầu.");
      return;
    }

    setRequests((prev) => [
      {
        id: requestRow.id,
        title: requestRow.title,
        message: requestRow.message,
        status: requestRow.status,
        createdAt: requestRow.created_at,
      },
      ...prev,
    ]);
    setRequestForm({ title: "", message: "" });
    setRequestMessage("Đã gửi yêu cầu thành công.");
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Bạn cần đăng nhập</h1>
        <p className="text-slate-500 mb-6">Vui lòng đăng nhập để xem hồ sơ và đơn hàng.</p>
        <Link href="/login">
          <Button className="rounded-full px-8">Đăng nhập</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Hồ sơ của tôi</h1>

      {loading && (
        <div className="text-slate-500 mb-6">Đang tải dữ liệu...</div>
      )}
      {error && (
        <div className="text-red-600 mb-6">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin người dùng</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleProfileSubmit}>
                {profileMessage && (
                  <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    {profileMessage}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Họ và tên</Label>
                  <Input
                    id="profile-name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-phone">Số điện thoại</Label>
                  <Input
                    id="profile-phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-address">Địa chỉ</Label>
                  <Input
                    id="profile-address"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="profile-avatar">Ảnh đại diện</Label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="relative h-20 w-20 rounded-full border bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                      {(avatarPreview || profileForm.avatarUrl) ? (
                        <Image
                          src={avatarPreview || profileForm.avatarUrl}
                          alt="Ảnh đại diện"
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-slate-400">
                          {(profileForm.name || user.name).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        id="profile-avatar"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleAvatarUpload(file);
                          }
                        }}
                      />
                      <p className="text-xs text-slate-500">
                        {avatarUploading ? "Đang tải ảnh đại diện..." : "Chọn ảnh để tải lên và lưu URL vào Supabase."}
                      </p>
                    </div>
                  </div>
                </div>
                <Button type="submit" className="rounded-full px-8">Cập nhật thông tin</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handlePasswordSubmit}>
                {passwordMessage && (
                  <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    {passwordMessage}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Mật khẩu mới</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
                <Button type="submit" variant="outline" className="rounded-full px-8">Cập nhật mật khẩu</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu của bạn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-4" onSubmit={handleRequestSubmit}>
                {requestMessage && (
                  <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    {requestMessage}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="request-title">Tiêu đề yêu cầu</Label>
                  <Input
                    id="request-title"
                    value={requestForm.title}
                    onChange={(e) => setRequestForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Ví dụ: Cần hỗ trợ về đơn hàng"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="request-message">Nội dung</Label>
                  <textarea
                    id="request-message"
                    className="w-full min-h-30 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={requestForm.message}
                    onChange={(e) => setRequestForm((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="Mô tả chi tiết yêu cầu của bạn"
                  />
                </div>
                <Button type="submit" className="rounded-full px-8">Gửi yêu cầu</Button>
              </form>

              {sortedRequests.length === 0 ? (
                <div className="text-sm text-slate-500">Chưa có yêu cầu nào.</div>
              ) : (
                <div className="space-y-3">
                  {sortedRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div className="font-semibold text-slate-800">{request.title}</div>
                        <div className="text-xs font-semibold text-primary">
                          {requestStatusLabel[request.status]}
                        </div>
                      </div>
                      <div className="text-sm text-slate-600 mt-1">{request.message}</div>
                      <div className="text-xs text-slate-400 mt-2">
                        {new Date(request.createdAt).toLocaleString("vi-VN")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Hóa đơn đã mua</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedOrders.length === 0 ? (
                <div className="text-sm text-slate-500">Chưa có đơn hàng nào.</div>
              ) : (
                <div className="space-y-3">
                  {sortedOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div className="font-semibold text-slate-800">#{order.id}</div>
                        <div className="text-xs font-semibold text-primary">
                          {statusLabel[order.status] ?? "Đang xử lý"}
                        </div>
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        {order.total.toLocaleString("vi-VN")}đ · {order.itemsCount} sản phẩm
                      </div>
                      <div className="mt-2">
                        <Link href={`/orders/${order.id}`}>
                          <Button size="sm" variant="outline" className="rounded-full">Xem hóa đơn</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
