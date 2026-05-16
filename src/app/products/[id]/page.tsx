"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { Star, Minus, Plus, ShoppingCart, ShieldCheck, Truck, RotateCcw, Heart } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PRODUCTS } from "@/lib/data";
import { motion } from "framer-motion";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
  
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 font-medium">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary transition-colors">Sản phẩm</Link>
          <span>/</span>
          <span className="text-primary">{product.name}</span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Product Image */}
            <div className="w-full lg:w-1/2 bg-slate-50/50 p-8 lg:p-12 border-r border-slate-100 relative">
              {product.isSale && (
                <div className="absolute top-8 left-8 z-10 bg-red-500 text-white font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-lg">
                  Giảm {(100 - (product.price/product.originalPrice)*100).toFixed(0)}%
                </div>
              )}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="aspect-square rounded-2xl overflow-hidden bg-white shadow-sm flex items-center justify-center p-8 relative group"
              >
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-slate-50 hover:bg-red-50 flex items-center justify-center transition-colors shadow-sm"
                >
                  <Heart className={`w-6 h-6 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                </button>
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
              
              <div className="grid grid-cols-4 gap-4 mt-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white shadow-sm border-2 border-transparent hover:border-primary cursor-pointer transition-colors p-2">
                     <img src={product.image_url} alt="thumbnail" className="w-full h-full object-contain opacity-70 hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-extrabold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">{product.brand}</span>
                <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold border border-yellow-200">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  {product.rating} ({product.reviews} đánh giá)
                </div>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">{product.name}</h1>
              
              <div className="flex items-end gap-4 mb-8">
                <div className="text-4xl font-extrabold text-primary">
                  {product.price.toLocaleString('vi-VN')}đ
                </div>
                {product.isSale && (
                  <div className="text-xl text-slate-400 line-through mb-1 font-medium">
                    {product.originalPrice.toLocaleString('vi-VN')}đ
                  </div>
                )}
              </div>

              <p className="text-slate-600 leading-relaxed mb-8 text-lg">
                {product.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-slate-500 text-sm mb-1 font-medium">Độ tuổi phù hợp</div>
                  <div className="font-bold text-slate-900">{product.age}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-slate-500 text-sm mb-1 font-medium">Tình trạng kho</div>
                  <div className="font-bold text-green-600">Còn {product.stock} sản phẩm</div>
                </div>
              </div>

              <div className="border-t pt-8 mt-auto">
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                  <div className="flex items-center gap-4 bg-slate-100 rounded-full p-2 w-full sm:w-auto justify-between">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-full bg-white shadow-sm hover:text-primary"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="w-5 h-5" />
                    </Button>
                    <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-full bg-white shadow-sm hover:text-primary"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <Button size="lg" className="flex-1 rounded-full text-lg h-14 shadow-lg hover:shadow-xl transition-all" onClick={handleAddToCart}>
                    <ShoppingCart className="w-6 h-6 mr-2" /> Thêm Vào Giỏ
                  </Button>
                </div>

                <Button size="lg" variant="secondary" className="w-full rounded-full text-lg h-14 bg-orange-100 text-orange-600 hover:bg-orange-200 border border-orange-200 font-bold transition-colors">
                  Mua Ngay
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100">
                <div className="flex flex-col items-center text-center gap-3 text-slate-600">
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-green-500" />
                  </div>
                  <span className="text-sm font-medium">Chính hãng 100%</span>
                </div>
                <div className="flex flex-col items-center text-center gap-3 text-slate-600">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <Truck className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium">Giao hàng 2H</span>
                </div>
                <div className="flex flex-col items-center text-center gap-3 text-slate-600">
                  <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                    <RotateCcw className="w-6 h-6 text-purple-500" />
                  </div>
                  <span className="text-sm font-medium">Đổi trả 7 ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
