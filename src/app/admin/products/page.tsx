"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  original_price: "",
  stock: "",
  image_url: "",
  age_range: "",
  brand: "",
  category_id: "",
  is_new: false,
  is_sale: false,
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  image_url: string | null;
  age_range: string | null;
  brand: string | null;
  category_id: string | null;
  is_new: boolean;
  is_sale: boolean;
};

type CategoryRow = {
  id: string;
  name: string;
};

export default function AdminProducts() {
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
  const [imagePreviewReady, setImagePreviewReady] = useState(false);

  const isEditing = Boolean(editingId);

  useEffect(() => {
    if (localImagePreview) {
      setImagePreviewReady(true);
      return;
    }

    const imageUrl = form.image_url.trim();
    if (!imageUrl) {
      setImagePreviewReady(false);
      return;
    }

    setImagePreviewReady(false);
    const probe = new Image();
    probe.onload = () => setImagePreviewReady(true);
    probe.onerror = () => setImagePreviewReady(false);
    probe.src = imageUrl;

    return () => {
      probe.onload = null;
      probe.onerror = null;
    };
  }, [form.image_url, localImagePreview]);

  useEffect(() => {
    return () => {
      if (localImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(localImagePreview);
      }
    };
  }, [localImagePreview]);

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const [{ data: categoryRows }, { data: productRows, error: productError }] = await Promise.all([
        supabase.from("categories").select("id, name").order("name"),
        supabase
          .from("products")
          .select("id, name, slug, description, price, original_price, stock, image_url, age_range, brand, category_id, is_new, is_sale")
          .order("created_at", { ascending: false }),
      ]);

      if (!isActive) return;
      if (productError) {
        setError(productError.message);
        setLoading(false);
        return;
      }

      setCategories((categoryRows || []) as CategoryRow[]);
      setProducts((productRows || []) as ProductRow[]);
      setLoading(false);
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return products;
    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(keyword) ||
        product.slug.toLowerCase().includes(keyword) ||
        (product.brand || "").toLowerCase().includes(keyword)
      );
    });
  }, [products, search]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setLocalImagePreview(null);
    setImagePreviewReady(false);
  };

  const getAccessToken = async () => {
    const supabase = createClient();
    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !data.session?.access_token) {
      throw new Error("Bạn cần đăng nhập Supabase để thao tác quản trị.");
    }
    return data.session.access_token;
  };

  const callAdminApi = async (method: "POST" | "PUT" | "DELETE", body: Record<string, unknown>) => {
    const token = await getAccessToken();
    const response = await fetch("/api/admin/products", {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const result = (await response.json()) as { data?: ProductRow; message?: string };
    if (!response.ok) {
      throw new Error(result.message || "Không thể thao tác sản phẩm.");
    }
    return result.data;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.name.trim() || !form.slug.trim() || !form.price || !form.stock) {
      setError("Vui lòng nhập đầy đủ tên, slug, giá và tồn kho.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      price: Number(form.price || 0),
      original_price: form.original_price ? Number(form.original_price) : null,
      stock: Number(form.stock || 0),
      image_url: form.image_url.trim() || null,
      age_range: form.age_range.trim() || null,
      brand: form.brand.trim() || null,
      category_id: form.category_id || null,
      is_new: form.is_new,
      is_sale: form.is_sale,
    };

    if (editingId) {
      try {
        const updatedRow = await callAdminApi("PUT", { id: editingId, payload });
        if (updatedRow) {
          setProducts((prev) => prev.map((item) => (item.id === editingId ? updatedRow : item)));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể cập nhật sản phẩm.");
        return;
      }
      resetForm();
      setShowForm(false);
      return;
    }

    try {
      const newRow = await callAdminApi("POST", { payload });
      if (!newRow) {
        setError("Không thể thêm sản phẩm.");
        return;
      }
      setProducts((prev) => [newRow as ProductRow, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể thêm sản phẩm.");
      return;
    }
    resetForm();
    setShowForm(false);
  };

  const handleImageUpload = async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setLocalImagePreview(previewUrl);
    setImagePreviewReady(true);
    setUploading(true);
    setError(null);
    try {
      const result = await uploadImageToCloudinary(file);
      setForm((prev) => ({ ...prev, image_url: result.secure_url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải ảnh lên.");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product: ProductRow) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: String(product.price ?? ""),
      original_price: product.original_price ? String(product.original_price) : "",
      stock: String(product.stock ?? ""),
      image_url: product.image_url || "",
      age_range: product.age_range || "",
      brand: product.brand || "",
      category_id: product.category_id || "",
      is_new: Boolean(product.is_new),
      is_sale: Boolean(product.is_sale),
    });
    setLocalImagePreview(null);
    setImagePreviewReady(false);
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    try {
      await callAdminApi("DELETE", { id: productId });
      setProducts((prev) => prev.filter((item) => item.id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa sản phẩm.");
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "-";
    return categories.find((cat) => cat.id === categoryId)?.name || "-";
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Quản Lý Sản Phẩm</h1>
        <Button onClick={() => setShowForm((prev) => !prev)} className="gap-2">
          <Plus className="w-4 h-4" /> {showForm ? "Đóng" : "Thêm sản phẩm"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 border-primary shadow-md">
          <CardHeader>
            <CardTitle>{isEditing ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Tên sản phẩm</Label>
                  <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} />
                </div>
                <div>
                  <Label>Thương hiệu</Label>
                  <Input value={form.brand} onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))} />
                </div>
                <div>
                  <Label>Độ tuổi</Label>
                  <Input value={form.age_range} onChange={(e) => setForm((prev) => ({ ...prev, age_range: e.target.value }))} />
                </div>
                <div>
                  <Label>Danh mục</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={form.category_id}
                    onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Ảnh sản phẩm</Label>
                  <div className="flex flex-col gap-2">
                    <Input
                      value={form.image_url}
                      onChange={(e) => {
                        setLocalImagePreview(null);
                        setImagePreviewReady(false);
                        setForm((prev) => ({ ...prev, image_url: e.target.value }));
                      }}
                      placeholder="https://..."
                    />
                    <div className="flex items-center gap-3">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                        }}
                      />
                      <span className="text-xs text-slate-500">
                        {uploading ? "Đang tải ảnh..." : "Chọn ảnh từ thiết bị"}
                      </span>
                    </div>
                    {(localImagePreview || (form.image_url && imagePreviewReady)) && (
                      <img
                        src={localImagePreview || form.image_url}
                        alt="preview"
                        className="h-20 w-20 rounded border object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Giá bán</Label>
                  <Input type="number" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} />
                </div>
                <div>
                  <Label>Giá gốc</Label>
                  <Input type="number" value={form.original_price} onChange={(e) => setForm((prev) => ({ ...prev, original_price: e.target.value }))} />
                </div>
                <div>
                  <Label>Tồn kho</Label>
                  <Input type="number" value={form.stock} onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))} />
                </div>
                <div>
                  <Label>Mô tả</Label>
                  <textarea
                    className="w-full min-h-30 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.is_new}
                      onChange={(e) => setForm((prev) => ({ ...prev, is_new: e.target.checked }))}
                    />
                    Sản phẩm mới
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.is_sale}
                      onChange={(e) => setForm((prev) => ({ ...prev, is_sale: e.target.checked }))}
                    />
                    Đang giảm giá
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button variant="outline" onClick={resetForm}>Hủy</Button>
              <Button onClick={handleSubmit}>{isEditing ? "Lưu cập nhật" : "Lưu sản phẩm"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle>Danh sách sản phẩm</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm tên, slug, brand..."
              className="pl-9 h-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="p-6 text-slate-500">Đang tải sản phẩm...</div>
          )}
          {!loading && filteredProducts.length === 0 && (
            <div className="p-6 text-slate-500">Chưa có sản phẩm nào.</div>
          )}
          {filteredProducts.length > 0 && (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                <tr>
                  <th className="px-6 py-3">Sản phẩm</th>
                  <th className="px-6 py-3">Danh mục</th>
                  <th className="px-6 py-3">Độ tuổi</th>
                  <th className="px-6 py-3">Tồn kho</th>
                  <th className="px-6 py-3">Giá bán</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img src={product.image_url || ""} alt={product.name} className="w-12 h-12 rounded object-cover border" />
                      <div>
                        <div className="font-bold text-slate-800">{product.name}</div>
                        <div className="text-xs text-slate-500">Thương hiệu: {product.brand || "-"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getCategoryName(product.category_id)}</td>
                    <td className="px-6 py-4">{product.age_range || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${product.stock < 15 ? "text-red-500" : "text-green-600"}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{product.price.toLocaleString("vi-VN")}đ</td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-blue-600 hover:bg-blue-50"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
