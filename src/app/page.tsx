"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight, Star, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORIES, PRODUCTS, BANNERS } from "@/lib/data";
import { useCartStore } from "@/store/cartStore";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const addItem = useCartStore((state) => state.addItem);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: true })
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="flex-1 bg-slate-50 overflow-hidden">
      {/* Animated Hero Carousel */}
      <section className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex h-[80vh] md:h-[600px]">
            {BANNERS.map((banner) => (
              <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative">
                <img 
                  src={banner.image} 
                  alt={banner.title} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${banner.color} opacity-80 mix-blend-multiply`} />
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-4 z-10">
                    <div className="max-w-2xl">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 mb-6 backdrop-blur-md"
                      >
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <span className="text-sm font-medium text-white">AI Assistant Trợ giúp chọn quà</span>
                      </motion.div>
                      <motion.h1 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-2 text-white"
                      >
                        {banner.title}
                      </motion.h1>
                      <motion.h2
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="text-4xl lg:text-6xl font-bold mb-6 text-yellow-400"
                      >
                        {banner.subtitle}
                      </motion.h2>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.5 }}
                        className="text-lg lg:text-xl text-white/90 mb-8 leading-relaxed max-w-xl"
                      >
                        {banner.desc}
                      </motion.p>
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.6 }}
                        className="flex flex-wrap gap-4"
                      >
                        <Link href="/products">
                          <Button size="lg" className="rounded-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-8 h-12 text-lg shadow-lg hover:shadow-xl transition-all">
                            Mua Sắm Ngay
                          </Button>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Carousel Controls */}
        <button onClick={scrollPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-sm transition-colors z-20">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={scrollNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-sm transition-colors z-20">
          <ChevronRight className="w-6 h-6" />
        </button>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-white relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-slate-900">Danh Mục Nổi Bật</h2>
            <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-4"></div>
            <p className="text-slate-500 max-w-2xl mx-auto">Khám phá các thế giới đồ chơi đầy màu sắc dành riêng cho từng độ tuổi và sở thích của bé.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {CATEGORIES.map((category, idx) => (
              <motion.div 
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Link href={`/products?category=${category.slug}`}>
                  <Card className={`group overflow-hidden border-2 ${category.color} shadow-none hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer rounded-2xl h-full flex flex-col`}>
                    <CardContent className="p-6 text-center flex flex-col items-center justify-center flex-1">
                      <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">{category.icon}</div>
                      <h3 className="font-bold text-slate-800">{category.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-slate-900">Sản Phẩm Bán Chạy</h2>
              <div className="w-24 h-1.5 bg-primary rounded-full"></div>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all bg-primary/10 px-4 py-2 rounded-full">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PRODUCTS.slice(0, 8).map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Card className="group h-full flex flex-col bg-white border-slate-200/60 shadow-sm hover:shadow-2xl hover:border-primary/50 transition-all duration-300 rounded-2xl overflow-hidden relative">
                  {product.isNew && (
                    <div className="absolute top-4 left-4 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Mới</div>
                  )}
                  {product.isSale && (
                    <div className="absolute top-4 right-4 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">-{(100 - (product.price/product.originalPrice)*100).toFixed(0)}%</div>
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
        </div>
      </section>
      
      {/* AI Assistant Banner */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        
        {/* Floating toys decoration */}
        <motion.img animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4 }} src="https://cdn-icons-png.flaticon.com/512/3082/3082008.png" className="absolute top-10 left-10 w-24 h-24 opacity-30 invert" />
        <motion.img animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 5 }} src="https://cdn-icons-png.flaticon.com/512/3081/3081897.png" className="absolute bottom-10 right-10 w-32 h-32 opacity-30 invert" />

        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <motion.div
             initial={{ scale: 0.8, opacity: 0 }}
             whileInView={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.5 }}
             className="inline-flex p-4 rounded-full bg-white/10 backdrop-blur-md mb-8 border border-white/20 shadow-2xl"
          >
            <Sparkles className="w-12 h-12 text-yellow-300" />
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white tracking-tight">Bạn Không Biết Nên Tặng Quà Gì?</h2>
          <p className="text-xl text-white/90 mb-10 font-medium max-w-2xl mx-auto leading-relaxed">
            Đừng lo! Trợ lý AI của ToyStore sẽ phân tích sở thích và độ tuổi để tìm ra món quà hoàn hảo nhất cho bé nhà bạn.
          </p>
          
          <div className="flex flex-col sm:flex-row max-w-xl mx-auto gap-3 bg-white/10 p-3 rounded-2xl md:rounded-full backdrop-blur-md border border-white/30 shadow-2xl">
            <input 
              type="text" 
              placeholder="Ví dụ: Bé trai 5 tuổi thích siêu nhân..." 
              className="flex-1 bg-white/20 rounded-xl md:rounded-full border-none text-white placeholder:text-white/70 focus:ring-2 focus:ring-white/50 px-6 py-4 text-lg outline-none"
            />
            <Button className="rounded-xl md:rounded-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-8 py-4 h-auto text-lg shadow-lg">
              Hỏi AI Ngay
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
