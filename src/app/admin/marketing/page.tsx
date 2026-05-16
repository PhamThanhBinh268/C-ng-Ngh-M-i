"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ticket, Image as ImageIcon, Plus, Trash2, Edit } from "lucide-react";

export default function AdminMarketing() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Khuyến Mãi & Giao Diện</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Module Mã Giảm Giá */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Ticket className="w-5 h-5 text-primary" /> Mã Giảm Giá (Coupons)</CardTitle>
            <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> Tạo mã mới</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border border-slate-100 rounded-xl p-4 flex justify-between items-center bg-white hover:border-primary transition-colors">
                <div>
                  <div className="font-bold text-lg text-slate-800">SUMMER2026</div>
                  <div className="text-sm text-slate-500 mt-1">Giảm 15% cho đồ chơi vận động</div>
                  <div className="text-xs text-amber-600 mt-2 font-medium">HSD: 30/06/2026 • Còn 45/100 lượt</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-slate-500"><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="border border-slate-100 rounded-xl p-4 flex justify-between items-center bg-white hover:border-primary transition-colors">
                <div>
                  <div className="font-bold text-lg text-slate-800">FREESHIP50K</div>
                  <div className="text-sm text-slate-500 mt-1">Miễn phí vận chuyển (Tối đa 50k) đơn từ 500k</div>
                  <div className="text-xs text-green-600 mt-2 font-medium">Không giới hạn thời gian</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-slate-500"><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="border border-slate-100 rounded-xl p-4 flex justify-between items-center bg-slate-50 opacity-60">
                <div>
                  <div className="font-bold text-lg text-slate-800 line-through">1THANG6</div>
                  <div className="text-sm text-slate-500 mt-1">Giảm 50k nhân ngày Quốc tế Thiếu nhi</div>
                  <div className="text-xs text-slate-500 mt-2 font-medium">Đã hết hạn</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module Banner/Slide */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5 text-primary" /> Quản Lý Banner</CardTitle>
            <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> Thêm Banner</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Add form mockup */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4 hidden">
                 <div>
                    <Label>Tiêu đề Banner</Label>
                    <Input placeholder="Sale Mùa Hè" className="mt-1 bg-white" />
                 </div>
                 <div>
                    <Label>Hình ảnh</Label>
                    <div className="h-24 mt-1 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 bg-white">
                      Kéo thả ảnh banner vào đây (tỉ lệ 16:9)
                    </div>
                 </div>
                 <Button className="w-full">Lưu Banner</Button>
              </div>

              <div className="group relative rounded-xl overflow-hidden border border-slate-200">
                <img src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800" alt="Banner 1" className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <Button variant="secondary" size="sm">Chỉnh sửa</Button>
                  <Button variant="destructive" size="sm">Xóa</Button>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="text-white font-bold">Khám Phá Thế Giới - Đồ Chơi Tuyệt Vời</div>
                  <div className="text-white/80 text-xs">Hiển thị ở: Trang chủ (Slide 1)</div>
                </div>
              </div>

              <div className="group relative rounded-xl overflow-hidden border border-slate-200">
                <img src="https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800" alt="Banner 2" className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <Button variant="secondary" size="sm">Chỉnh sửa</Button>
                  <Button variant="destructive" size="sm">Xóa</Button>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="text-white font-bold">Sale Mùa Hè Lên Đến 50% Off</div>
                  <div className="text-white/80 text-xs">Hiển thị ở: Trang chủ (Slide 2)</div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
