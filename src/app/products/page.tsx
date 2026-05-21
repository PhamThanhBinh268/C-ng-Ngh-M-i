"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Search, ShoppingCart, SlidersHorizontal, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  color: string | null;
  icon: string | null;
};

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image_url: string;
  rating: number | null;
  reviews: number | null;
  category: string;
  categoryId: string | null;
  brand: string | null;
  age: string;
  stock: number;
  isNew: boolean;
  isSale: boolean;
  description: string;
};

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [appliedPrice, setAppliedPrice] = useState({ min: "", max: "" });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const addItem = useCartStore(state => state.addItem);

  // Update search term when URL changes
  useEffect(() => {
    if (searchParams.has("search")) {
      setSearchTerm(searchParams.get("search") || "");
    }
  }, [searchParams]);

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      setLoading(true);
      setLoadError(null);

      const supabase = createClient();
      const [{ data: categoryRows, error: categoryError }, { data: productRows, error: productError }] = await Promise.all([
        supabase
          .from("categories")
          .select("id, name, slug, image_url, color, icon"),
        supabase
          .from("products")
          .select("id, name, description, price, original_price, stock, image_url, age_range, brand, rating, reviews, is_new, is_sale, category_id")
      ]);

      if (!isActive) return;

      if (categoryError || productError) {
        setLoadError(categoryError?.message || productError?.message || "Không tải được dữ liệu.");
        setLoading(false);
        return;
      }

      const safeCategories = (categoryRows || []) as Category[];
      const categoryById = new Map(safeCategories.map((cat) => [cat.id, cat.name]));
      const mappedProducts = (productRows || []).map((product) => ({
        id: product.id,
        name: product.name,
        price: Number(product.price || 0),
        originalPrice: Number(product.original_price || product.price || 0),
        image_url: product.image_url || "",
        rating: product.rating ? Number(product.rating) : null,
        reviews: Number.isFinite(product.reviews) ? product.reviews : null,
        category: categoryById.get(product.category_id) || "",
        categoryId: product.category_id || null,
        brand: product.brand || null,
        age: product.age_range || "Mọi lứa tuổi",
        stock: Number(product.stock || 0),
        isNew: Boolean(product.is_new),
        isSale: Boolean(product.is_sale),
        description: product.description || ""
      }));

      setCategories(safeCategories);
      setProducts(mappedProducts);
      setLoading(false);
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, []);

  const toggleAge = (ageRange: string) => {
    setSelectedAges(prev => 
      prev.includes(ageRange) 
        ? prev.filter(a => a !== ageRange)
        : [...prev, ageRange]
    );
  };

  const getAgeRangeNums = (ageStr: string) => {
    if (ageStr === "Mọi lứa tuổi") return [0, 99];
    const nums = ageStr.match(/\d+/g);
    if (!nums) return [0, 99];
    if (ageStr.includes("Trên") || ageStr.includes("Từ")) return [parseInt(nums[0]), 99];
    if (nums.length === 2) return [parseInt(nums[0]), parseInt(nums[1])];
    return [parseInt(nums[0]), parseInt(nums[0])];
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === "all" || p.categoryId === selectedCategory;
      
      let matchAge = true;
      if (selectedAges.length > 0) {
        const [pMin, pMax] = getAgeRangeNums(p.age);
        matchAge = selectedAges.some(range => {
          if (range === "0-3") return pMin <= 3;
          if (range === "4-7") return (pMin <= 7 && pMax >= 4);
          if (range === "8-12") return (pMin <= 12 && pMax >= 8);
          return false;
        });
      }

      const minP = appliedPrice.min ? parseInt(appliedPrice.min) : 0;
      const maxP = appliedPrice.max ? parseInt(appliedPrice.max) : Infinity;
      const matchPrice = p.price >= minP && p.price <= maxP;

      return matchSearch && matchCategory && matchAge && matchPrice;
    });
  }, [searchTerm, selectedCategory, selectedAges, appliedPrice]);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-primary pt-12 pb-24 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Khám Phá Đồ Chơi</h1>
        <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">Tìm kiếm những món quà tuyệt vời nhất cho sự phát triển của bé.</p>
      </div>

      <div className="container mx-auto px-4 -mt-12 pb-24 flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 shrink-0 bg-white rounded-2xl shadow-xl p-6 lg:sticky lg:top-24 border border-slate-100">
          <div className="flex items-center gap-2 font-bold text-xl mb-6 text-slate-800 border-b pb-4">
            <SlidersHorizontal className="w-5 h-5 text-primary" /> 
            Bộ Lọc Tìm Kiếm
          </div>
          
          <div className="space-y-6">
            <div>
              <Label className="font-bold text-slate-800 mb-3 block text-base">Danh mục</Label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="category" 
                    className="w-5 h-5 text-primary accent-primary" 
                    checked={selectedCategory === "all"}
                    onChange={() => setSelectedCategory("all")}
                  /> 
                  <span className="text-slate-600 group-hover:text-primary font-medium transition-colors">Tất cả sản phẩm</span>
                </label>
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category" 
                      className="w-5 h-5 text-primary accent-primary" 
                      checked={selectedCategory === cat.id}
                      onChange={() => setSelectedCategory(cat.id)}
                    /> 
                    <span className="text-slate-600 group-hover:text-primary font-medium transition-colors">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t">
              <Label className="font-bold text-slate-800 mb-3 block text-base">Độ tuổi</Label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-5 h-5 rounded accent-primary text-primary" checked={selectedAges.includes("0-3")} onChange={() => toggleAge("0-3")} /> 
                  <span className="text-slate-600 font-medium group-hover:text-primary transition-colors">0 - 3 tuổi</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-5 h-5 rounded accent-primary text-primary" checked={selectedAges.includes("4-7")} onChange={() => toggleAge("4-7")} /> 
                  <span className="text-slate-600 font-medium group-hover:text-primary transition-colors">4 - 7 tuổi</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-5 h-5 rounded accent-primary text-primary" checked={selectedAges.includes("8-12")} onChange={() => toggleAge("8-12")} /> 
                  <span className="text-slate-600 font-medium group-hover:text-primary transition-colors">8 - 12 tuổi</span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t">
              <Label className="font-bold text-slate-800 mb-3 block text-base">Mức giá</Label>
              <div className="flex gap-3 items-center">
                <Input placeholder="Từ" type="number" className="h-10 bg-slate-50 border-slate-200 focus:bg-white" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                <span className="text-slate-400">-</span>
                <Input placeholder="Đến" type="number" className="h-10 bg-slate-50 border-slate-200 focus:bg-white" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>
              <Button 
                className="w-full mt-4 h-10 font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                onClick={() => setAppliedPrice({ min: minPrice, max: maxPrice })}
              >
                Áp dụng
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full">
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 border border-slate-100">
            <div className="text-slate-500 font-medium px-2">
              Hiển thị <span className="text-slate-900 font-bold">{filteredProducts.length}</span> sản phẩm
            </div>
            
            <div className="relative w-full sm:w-80">
              <Input 
                placeholder="Tìm kiếm đồ chơi..." 
                className="pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white rounded-xl text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-slate-500">Đang tải sản phẩm...</p>
            </div>
          ) : loadError ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm">
              <div className="text-5xl mb-4">⚠️</div>
              <p className="text-slate-600">{loadError}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-slate-500">Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
              <Button variant="outline" className="mt-6 rounded-full" onClick={() => {
                setSearchTerm(""); 
                setSelectedCategory("all");
                setSelectedAges([]);
                setMinPrice("");
                setMaxPrice("");
                setAppliedPrice({min: "", max: ""});
              }}>Xóa bộ lọc</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <Card className="group h-full flex flex-col bg-white border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden relative">
                    {product.isNew && (
                      <div className="absolute top-4 left-4 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Mới</div>
                    )}
                    {product.isSale && (
                      <div className="absolute top-4 right-4 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        -{(100 - (product.price/product.originalPrice)*100).toFixed(0)}%
                      </div>
                    )}
                    
                    <Link href={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-100 p-6">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500"
                      />
                    </Link>
                    <CardContent className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold text-slate-700">{product.rating}</span>
                        <span className="text-xs text-slate-400">({product.reviews})</span>
                      </div>
                      <Link href={`/products/${product.id}`}>
                        <h3 className="font-bold text-lg text-slate-800 mb-1 line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
                      </Link>
                      <p className="text-xs font-medium text-slate-400 mb-4">{product.brand}</p>
                      
                      <div className="mt-auto flex items-end justify-between">
                        <div>
                          {product.isSale && (
                            <div className="text-sm text-slate-400 line-through mb-1">{product.originalPrice.toLocaleString('vi-VN')}đ</div>
                          )}
                          <div className="font-extrabold text-xl text-primary">{product.price.toLocaleString('vi-VN')}đ</div>
                        </div>
                        <Button 
                          size="icon" 
                          className="rounded-full w-10 h-10 shadow-md group-hover:bg-primary group-hover:scale-110 transition-all"
                          onClick={(e) => {
                            e.preventDefault();
                            addItem(product, 1);
                          }}
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
