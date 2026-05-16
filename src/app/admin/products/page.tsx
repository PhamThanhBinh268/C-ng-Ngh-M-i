"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Plus, Search, UploadCloud, Edit, Trash2 } from "lucide-react";
import { PRODUCTS } from "@/lib/data";

export default function AdminProducts() {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Quản Lý Sản Phẩm</h1>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
          <Plus className="w-4 h-4" /> Thêm Đồ Chơi Mới
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-8 border-primary shadow-md">
          <CardHeader>
            <CardTitle>Thêm/Sửa Sản Phẩm (Đồ Chơi)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thông tin cơ bản */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-700 border-b pb-2">Thông tin cơ bản</h3>
                <div>
                  <Label>Tên sản phẩm</Label>
                  <Input placeholder="VD: Bộ xếp hình LEGO City..." className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Mã SKU</Label>
                    <Input placeholder="VD: LEGO-CT-102" className="mt-1" />
                  </div>
                  <div>
                    <Label>Thương hiệu</Label>
                    <Input placeholder="VD: LEGO, Hot Wheels" className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Giá bán (VNĐ)</Label>
                    <Input type="number" placeholder="500000" className="mt-1" />
                  </div>
                  <div>
                    <Label>Giá nhập (VNĐ)</Label>
                    <Input type="number" placeholder="400000" className="mt-1" />
                  </div>
                  <div>
                    <Label>Giá KM (VNĐ)</Label>
                    <Input type="number" placeholder="450000" className="mt-1" />
                  </div>
                </div>
              </div>

              {/* Thuộc tính đồ chơi */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-700 border-b pb-2">Thuộc tính & Kho hàng</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Độ tuổi phù hợp</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mt-1">
                      <option>0 - 3 tuổi</option>
                      <option>3 - 6 tuổi</option>
                      <option>6 - 12 tuổi</option>
                      <option>Trên 12 tuổi</option>
                    </select>
                  </div>
                  <div>
                    <Label>Chất liệu</Label>
                    <Input placeholder="VD: Nhựa ABS an toàn, Gỗ..." className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label>Cảnh báo an toàn</Label>
                  <Input placeholder="VD: Có chi tiết nhỏ, không dành cho trẻ dưới 3 tuổi" className="mt-1 text-red-500 placeholder:text-red-300" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Số lượng Tồn Kho</Label>
                    <Input type="number" placeholder="100" className="mt-1" />
                  </div>
                  <div>
                    <Label>Cảnh báo khi dưới (sp)</Label>
                    <Input type="number" placeholder="10" className="mt-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quản lý hình ảnh/Video */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-700 border-b pb-2">Hình ảnh / Video</h3>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <UploadCloud className="w-10 h-10 mb-2 text-primary" />
                <p className="font-medium">Kéo thả hình ảnh đồ chơi vào đây (Hỗ trợ Cloudinary)</p>
                <p className="text-xs mt-1">Nên có ảnh mặt trước, mặt sau và chi tiết sản phẩm.</p>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Hủy</Button>
              <Button>Lưu Sản Phẩm</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danh sách sản phẩm */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle>Danh Sách Đồ Chơi</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Tìm SKU, Tên..." className="pl-9 h-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
              {PRODUCTS.slice(0, 10).map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded object-cover border" />
                    <div>
                      <div className="font-bold text-slate-800">{p.name}</div>
                      <div className="text-xs text-slate-500">Thương hiệu: {p.brand}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{p.category}</td>
                  <td className="px-6 py-4">{p.age}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${p.stock < 15 ? 'text-red-500' : 'text-green-600'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold">{p.price.toLocaleString('vi-VN')}đ</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-blue-600 hover:bg-blue-50"><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
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
