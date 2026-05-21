"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderTree, Plus, Edit, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  color: string | null;
  icon: string | null;
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    image_url: "",
    color: "",
    icon: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const isEditing = Boolean(editingId);

  useEffect(() => {
    let isActive = true;

    const loadCategories = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data, error: loadError } = await supabase
        .from("categories")
        .select("id, name, slug, image_url, color, icon")
        .order("created_at", { ascending: false });

      if (!isActive) return;
      if (loadError) {
        setError(loadError.message);
        setLoading(false);
        return;
      }
      setCategories((data || []) as Category[]);
      setLoading(false);
    };

    loadCategories();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredCategories = useMemo(() => categories, [categories]);

  const resetForm = () => {
    setForm({ name: "", slug: "", image_url: "", color: "", icon: "" });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      setError("Vui lòng nhập tên và slug.");
      return;
    }

    const supabase = createClient();
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      image_url: form.image_url.trim() || null,
      color: form.color.trim() || null,
      icon: form.icon.trim() || null,
    };

    if (editingId) {
      const { error: updateError } = await supabase
        .from("categories")
        .update(payload)
        .eq("id", editingId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setCategories((prev) => prev.map((cat) => (cat.id === editingId ? { ...cat, ...payload } : cat)));
      resetForm();
      return;
    }

    const { data: newRow, error: insertError } = await supabase
      .from("categories")
      .insert(payload)
      .select("id, name, slug, image_url, color, icon")
      .single();

    if (insertError || !newRow) {
      setError(insertError?.message || "Không thể thêm danh mục.");
      return;
    }

    setCategories((prev) => [newRow as Category, ...prev]);
    resetForm();
  };

  const handleImageUpload = async (file: File) => {
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

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      image_url: category.image_url || "",
      color: category.color || "",
      icon: category.icon || "",
    });
  };

  const handleDelete = async (categoryId: string) => {
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Quản Lý Danh Mục</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form thêm danh mục */}
        <Card className="lg:col-span-1 shadow-sm h-fit">
          <CardHeader>
            <CardTitle>{isEditing ? "Cập nhật danh mục" : "Thêm danh mục mới"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <div>
              <Label>Tên danh mục</Label>
              <Input
                placeholder="VD: Đồ chơi ngoài trời"
                className="mt-1"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div>
              <Label>Đường dẫn (Slug)</Label>
              <Input
                placeholder="do-choi-ngoai-troi"
                className="mt-1 bg-slate-50"
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              />
            </div>
            <div>
              <Label>Ảnh danh mục</Label>
              <div className="flex flex-col gap-2 mt-1">
                <Input
                  placeholder="https://..."
                  value={form.image_url}
                  onChange={(event) => setForm((prev) => ({ ...prev, image_url: event.target.value }))}
                />
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        handleImageUpload(file);
                      }
                    }}
                  />
                  <span className="text-xs text-slate-500">
                    {uploading ? "Đang tải ảnh..." : "Chọn ảnh từ thiết bị"}
                  </span>
                </div>
                {form.image_url && (
                  <img src={form.image_url} alt="preview" className="h-20 w-20 rounded border object-cover" />
                )}
              </div>
            </div>
            <div>
              <Label>Màu nhấn</Label>
              <Input
                placeholder="bg-blue-100/50"
                className="mt-1"
                value={form.color}
                onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))}
              />
            </div>
            <div>
              <Label>Icon</Label>
              <Input
                placeholder="🧠"
                className="mt-1"
                value={form.icon}
                onChange={(event) => setForm((prev) => ({ ...prev, icon: event.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button className="w-full mt-2" onClick={handleSubmit}>
                <Plus className="w-4 h-4 mr-2" /> {isEditing ? "Lưu cập nhật" : "Thêm danh mục"}
              </Button>
              {isEditing && (
                <Button variant="outline" className="w-full mt-2" onClick={resetForm}>Hủy</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cây danh mục */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Cây Phân Cấp Danh Mục (Multi-level)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loading && (
                <div className="text-sm text-slate-500">Đang tải danh mục...</div>
              )}
              {!loading && filteredCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:border-primary transition-colors">
                  <div className="flex items-center gap-3">
                    <FolderTree className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium text-slate-700">{category.name}</div>
                      <div className="text-xs text-slate-400">{category.slug}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-slate-500 hover:text-primary"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-red-500 hover:bg-red-50"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
