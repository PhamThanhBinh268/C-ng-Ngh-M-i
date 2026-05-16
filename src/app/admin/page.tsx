"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users, AlertCircle, MessageSquareWarning } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">Bảng Điều Khiển Tổng Quan</h1>
      
      {/* 1. Chỉ số nhanh (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Tổng Doanh Thu</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">125,500,000đ</div>
            <p className="text-xs text-green-500 font-medium">+20.1% so với tháng trước</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Đơn Hàng Mới</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">+124</div>
            <p className="text-xs text-green-500 font-medium">+19% so với tuần trước</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Khách Hàng Mới</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">+53</div>
            <p className="text-xs text-green-500 font-medium">+12% so với tháng trước</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Sắp Hết Hàng</CardTitle>
            <Package className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">8</div>
            <p className="text-xs text-slate-500 font-medium">Sản phẩm cần nhập thêm gấp</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Biểu đồ thống kê (Mockup) */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Biểu đồ Doanh Thu (7 ngày qua)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full flex items-end justify-between gap-2 pt-10 px-4 pb-4 bg-slate-50 rounded-xl border border-slate-100">
              {/* Mocking a bar chart */}
              {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                <div key={i} className="w-full flex flex-col items-center gap-2 group">
                  <div className="text-xs text-slate-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">{(h * 150000).toLocaleString('vi-VN')}đ</div>
                  <div 
                    className="w-full bg-gradient-to-t from-primary/80 to-primary rounded-t-md hover:from-blue-600 hover:to-blue-400 transition-colors cursor-pointer" 
                    style={{ height: `${h}%` }}
                  ></div>
                  <div className="text-xs text-slate-400 font-medium">T{i+2}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 3. Việc cần làm (To-do / Alerts) */}
        <div className="space-y-6">
          <Card className="shadow-sm border-red-100">
            <CardHeader className="bg-red-50/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-red-600 text-lg">
                <AlertCircle className="w-5 h-5" /> Việc Cần Làm Gấp
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex gap-3 items-start border-b border-slate-100 pb-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-amber-500 shrink-0"></div>
                <div>
                  <div className="font-bold text-sm text-slate-800">12 Đơn Hàng Đang Chờ Xử Lý</div>
                  <div className="text-xs text-slate-500 mt-1">Vượt quá 24h chưa đóng gói. Hãy kiểm tra ngay kho hàng.</div>
                </div>
              </div>
              <div className="flex gap-3 items-start border-b border-slate-100 pb-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-red-500 shrink-0"></div>
                <div>
                  <div className="font-bold text-sm text-slate-800">2 Đánh Giá Tiêu Cực Mới</div>
                  <div className="text-xs text-slate-500 mt-1">Sản phẩm "LEGO Tàu Vũ Trụ" bị phàn nàn về móp hộp. Phản hồi khách hàng ngay!</div>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
                <div>
                  <div className="font-bold text-sm text-slate-800">Nhập Hàng Tháng 5</div>
                  <div className="text-xs text-slate-500 mt-1">Cần lên đơn nhập thêm đồ chơi vận động mùa hè.</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Top Đồ Chơi Bán Chạy</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                {[
                  { name: "LEGO Tàu Vũ Trụ Apollo", sales: 145 },
                  { name: "Bảng chữ cái gỗ", sales: 120 },
                  { name: "Mô hình Iron Man", sales: 98 },
                ].map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">{idx + 1}</div>
                      <div className="font-medium text-sm line-clamp-1">{p.name}</div>
                    </div>
                    <div className="text-right text-xs font-bold text-primary">
                      {p.sales} sp
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
