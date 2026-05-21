"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ticket, Image as ImageIcon, Plus, Trash2, Edit } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

const emptyCoupon = {
  code: "",
  description: "",
  discount_type: "percent",
  discount_value: "",
  min_order: "",
  max_uses: "",
  expires_at: "",
  is_active: true,
};

const emptyBanner = {
  title: "",
  subtitle: "",
  image_url: "",
  link_url: "",
  position: "0",
  is_active: true,
};

type CouponRow = {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order: number | null;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
};

type BannerRow = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  position: number;
  is_active: boolean;
};

export default function AdminMarketing() {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [couponForm, setCouponForm] = useState(emptyCoupon);
  const [bannerForm, setBannerForm] = useState(emptyBanner);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bannerUploading, setBannerUploading] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const [{ data: couponRows, error: couponError }, { data: bannerRows, error: bannerError }] = await Promise.all([
        supabase.from("coupons").select("*").order("created_at", { ascending: false }),
        supabase.from("banners").select("*").order("position"),
      ]);

      if (!isActive) return;
      if (couponError || bannerError) {
        setError(couponError?.message || bannerError?.message || "Không thể tải dữ liệu.");
        setLoading(false);
        return;
      }

      setCoupons((couponRows || []) as CouponRow[]);
      setBanners((bannerRows || []) as BannerRow[]);
      setLoading(false);
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, []);

  const handleCouponSubmit = async () => {
    setError(null);
    if (!couponForm.code.trim()) {
      setError("Vui lòng nhập mã giảm giá.");
      return;
    }

    const supabase = createClient();
    const payload = {
      code: couponForm.code.trim().toUpperCase(),
      description: couponForm.description.trim() || null,
      discount_type: couponForm.discount_type,
      discount_value: Number(couponForm.discount_value || 0),
      min_order: couponForm.min_order ? Number(couponForm.min_order) : null,
      max_uses: couponForm.max_uses ? Number(couponForm.max_uses) : null,
      expires_at: couponForm.expires_at ? new Date(couponForm.expires_at).toISOString() : null,
      is_active: couponForm.is_active,
    };

    if (editingCouponId) {
      const { error: updateError } = await supabase
        .from("coupons")
        .update(payload)
        .eq("id", editingCouponId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setCoupons((prev) => prev.map((item) => (item.id === editingCouponId ? { ...item, ...payload } : item)));
      setEditingCouponId(null);
      setCouponForm(emptyCoupon);
      return;
    }

    const { data: newRow, error: insertError } = await supabase
      .from("coupons")
      .insert(payload)
      .select("*")
      .single();

    if (insertError || !newRow) {
      setError(insertError?.message || "Không thể thêm mã giảm giá.");
      return;
    }

    setCoupons((prev) => [newRow as CouponRow, ...prev]);
    setCouponForm(emptyCoupon);
  };

  const handleBannerSubmit = async () => {
    setError(null);
    if (!bannerForm.title.trim() || !bannerForm.image_url.trim()) {
      setError("Vui lòng nhập tiêu đề và hình ảnh banner.");
      return;
    }

    const supabase = createClient();
    const payload = {
      title: bannerForm.title.trim(),
      subtitle: bannerForm.subtitle.trim() || null,
      image_url: bannerForm.image_url.trim(),
      link_url: bannerForm.link_url.trim() || null,
      position: Number(bannerForm.position || 0),
      is_active: bannerForm.is_active,
    };

    if (editingBannerId) {
      const { error: updateError } = await supabase
        .from("banners")
        .update(payload)
        .eq("id", editingBannerId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setBanners((prev) => prev.map((item) => (item.id === editingBannerId ? { ...item, ...payload } : item)));
      setEditingBannerId(null);
      setBannerForm(emptyBanner);
      return;
    }

    const { data: newRow, error: insertError } = await supabase
      .from("banners")
      .insert(payload)
      .select("*")
      .single();

    if (insertError || !newRow) {
      setError(insertError?.message || "Không thể thêm banner.");
      return;
    }

    setBanners((prev) => [...prev, newRow as BannerRow].sort((a, b) => a.position - b.position));
    setBannerForm(emptyBanner);
  };

  const handleBannerImageUpload = async (file: File) => {
    setBannerUploading(true);
    setError(null);
    try {
      const result = await uploadImageToCloudinary(file);
      setBannerForm((prev) => ({ ...prev, image_url: result.secure_url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải ảnh lên.");
    } finally {
      setBannerUploading(false);
    }
  };

  const handleCouponEdit = (coupon: CouponRow) => {
    setEditingCouponId(coupon.id);
    setCouponForm({
      code: coupon.code,
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value ?? ""),
      min_order: coupon.min_order ? String(coupon.min_order) : "",
      max_uses: coupon.max_uses ? String(coupon.max_uses) : "",
      expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 10) : "",
      is_active: coupon.is_active,
    });
  };

  const handleBannerEdit = (banner: BannerRow) => {
    setEditingBannerId(banner.id);
    setBannerForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image_url: banner.image_url,
      link_url: banner.link_url || "",
      position: String(banner.position ?? 0),
      is_active: banner.is_active,
    });
  };

  const handleDeleteCoupon = async (couponId: string) => {
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("coupons").delete().eq("id", couponId);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setCoupons((prev) => prev.filter((item) => item.id !== couponId));
  };

  const handleDeleteBanner = async (bannerId: string) => {
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("banners").delete().eq("id", bannerId);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setBanners((prev) => prev.filter((item) => item.id !== bannerId));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Khuyến Mãi & Giao Diện</h1>
      </div>

      {error && (
        <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      {loading && (
        <div className="mb-6 text-slate-500">Đang tải dữ liệu...</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Ticket className="w-5 h-5 text-primary" /> Mã giảm giá</CardTitle>
            <Button size="sm" className="gap-1" onClick={handleCouponSubmit}><Plus className="w-4 h-4" /> {editingCouponId ? "Lưu" : "Tạo mã"}</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label>Mã giảm giá</Label>
                <Input value={couponForm.code} onChange={(e) => setCouponForm((prev) => ({ ...prev, code: e.target.value }))} />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Input value={couponForm.description} onChange={(e) => setCouponForm((prev) => ({ ...prev, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Loại giảm</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={couponForm.discount_type}
                    onChange={(e) => setCouponForm((prev) => ({ ...prev, discount_type: e.target.value }))}
                  >
                    <option value="percent">%</option>
                    <option value="amount">Số tiền</option>
                    <option value="free_shipping">Free ship</option>
                  </select>
                </div>
                <div>
                  <Label>Giá trị</Label>
                  <Input type="number" value={couponForm.discount_value} onChange={(e) => setCouponForm((prev) => ({ ...prev, discount_value: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Đơn tối thiểu</Label>
                  <Input type="number" value={couponForm.min_order} onChange={(e) => setCouponForm((prev) => ({ ...prev, min_order: e.target.value }))} />
                </div>
                <div>
                  <Label>Số lượt tối đa</Label>
                  <Input type="number" value={couponForm.max_uses} onChange={(e) => setCouponForm((prev) => ({ ...prev, max_uses: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Hết hạn</Label>
                <Input type="date" value={couponForm.expires_at} onChange={(e) => setCouponForm((prev) => ({ ...prev, expires_at: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={couponForm.is_active}
                  onChange={(e) => setCouponForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                />
                Đang hoạt động
              </label>
            </div>

            {coupons.map((coupon) => (
              <div key={coupon.id} className="border border-slate-100 rounded-xl p-4 flex justify-between items-center bg-white hover:border-primary transition-colors">
                <div>
                  <div className="font-bold text-lg text-slate-800">{coupon.code}</div>
                  <div className="text-sm text-slate-500 mt-1">{coupon.description || "-"}</div>
                  <div className="text-xs text-slate-500 mt-2 font-medium">
                    Đã dùng: {coupon.used_count}/{coupon.max_uses || "∞"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-slate-500" onClick={() => handleCouponEdit(coupon)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteCoupon(coupon.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5 text-primary" /> Quản lý banner</CardTitle>
            <Button size="sm" className="gap-1" onClick={handleBannerSubmit}><Plus className="w-4 h-4" /> {editingBannerId ? "Lưu" : "Thêm banner"}</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label>Tiêu đề</Label>
                <Input value={bannerForm.title} onChange={(e) => setBannerForm((prev) => ({ ...prev, title: e.target.value }))} />
              </div>
              <div>
                <Label>Phụ đề</Label>
                <Input value={bannerForm.subtitle} onChange={(e) => setBannerForm((prev) => ({ ...prev, subtitle: e.target.value }))} />
              </div>
              <div>
                <Label>Ảnh banner</Label>
                <div className="flex flex-col gap-2">
                  <Input value={bannerForm.image_url} onChange={(e) => setBannerForm((prev) => ({ ...prev, image_url: e.target.value }))} />
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleBannerImageUpload(file);
                        }
                      }}
                    />
                    <span className="text-xs text-slate-500">
                      {bannerUploading ? "Đang tải ảnh..." : "Chọn ảnh từ thiết bị"}
                    </span>
                  </div>
                  {bannerForm.image_url && (
                    <img src={bannerForm.image_url} alt="preview" className="h-20 w-20 rounded border object-cover" />
                  )}
                </div>
              </div>
              <div>
                <Label>Link</Label>
                <Input value={bannerForm.link_url} onChange={(e) => setBannerForm((prev) => ({ ...prev, link_url: e.target.value }))} />
              </div>
              <div>
                <Label>Vị trí</Label>
                <Input type="number" value={bannerForm.position} onChange={(e) => setBannerForm((prev) => ({ ...prev, position: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={bannerForm.is_active}
                  onChange={(e) => setBannerForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                />
                Đang hiển thị
              </label>
            </div>

            {banners.map((banner) => (
              <div key={banner.id} className="group relative rounded-xl overflow-hidden border border-slate-200">
                <img src={banner.image_url} alt={banner.title} className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <Button variant="secondary" size="sm" onClick={() => handleBannerEdit(banner)}>Chỉnh sửa</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteBanner(banner.id)}>Xóa</Button>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="text-white font-bold">{banner.title}</div>
                  <div className="text-white/80 text-xs">Vị trí: {banner.position}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
