"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderTree, Plus, Edit, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";

const mockCategories = [
  {
    id: 1, name: "Đồ chơi giáo dục", children: [
      { id: 11, name: "Đồ chơi STEM", children: [] },
      { id: 12, name: "Boardgame gia đình", children: [] },
    ]
  },
  {
    id: 2, name: "Đồ chơi vận động", children: [
      { id: 21, name: "Xe đạp trẻ em", children: [] },
      { id: 22, name: "Cầu trượt / Xích đu", children: [] },
      { id: 23, name: "Xe scooter", children: [] },
    ]
  },
  { id: 3, name: "LEGO & Lắp ráp", children: [] },
  { id: 4, name: "Gấu bông & Búp bê", children: [] },
];

export default function AdminCategories() {
  const [expanded, setExpanded] = useState<number[]>([1, 2]);

  const toggleExpand = (id: number) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const renderTree = (nodes: any[], depth = 0) => {
    return (
      <div className="space-y-2">
        {nodes.map(node => {
          const isExpanded = expanded.includes(node.id);
          const hasChildren = node.children && node.children.length > 0;
          return (
            <div key={node.id}>
              <div 
                className={`flex items-center justify-between p-3 bg-white border rounded-lg hover:border-primary transition-colors ${depth > 0 ? 'ml-8' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {hasChildren ? (
                    <button onClick={() => toggleExpand(node.id)} className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded hover:bg-slate-200">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  ) : (
                    <div className="w-6 h-6"></div>
                  )}
                  <FolderTree className={`w-5 h-5 ${depth === 0 ? 'text-primary' : 'text-slate-400'}`} />
                  <span className="font-medium text-slate-700">{node.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:bg-blue-50">Thêm mục con</Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-500 hover:text-primary"><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              {isExpanded && hasChildren && (
                <div className="mt-2">
                  {renderTree(node.children, depth + 1)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
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
            <CardTitle>Thêm Danh Mục Mới</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tên danh mục</Label>
              <Input placeholder="VD: Đồ chơi ngoài trời" className="mt-1" />
            </div>
            <div>
              <Label>Đường dẫn (Slug)</Label>
              <Input placeholder="do-choi-ngoai-troi" className="mt-1 bg-slate-50" />
            </div>
            <div>
              <Label>Danh mục cha</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mt-1">
                <option value="0">-- Là danh mục gốc --</option>
                <option value="1">Đồ chơi giáo dục</option>
                <option value="2">Đồ chơi vận động</option>
                <option value="3">LEGO & Lắp ráp</option>
              </select>
            </div>
            <Button className="w-full mt-2"><Plus className="w-4 h-4 mr-2" /> Thêm Danh Mục</Button>
          </CardContent>
        </Card>

        {/* Cây danh mục */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Cây Phân Cấp Danh Mục (Multi-level)</CardTitle>
          </CardHeader>
          <CardContent>
            {renderTree(mockCategories)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
