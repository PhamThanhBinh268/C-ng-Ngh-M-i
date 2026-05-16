"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Bot, User, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PRODUCTS } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/store/cartStore";
import { ShoppingCart, Star } from "lucide-react";

export default function AISuggestionPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string, products?: any[]}[]>([
    {
      role: 'ai',
      content: 'Chào bạn! Mình là trợ lý AI của ToyStore. Bạn đang tìm quà cho bé mấy tuổi, sở thích của bé là gì nhỉ?'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  const handleSend = () => {
    if (!query.trim()) return;
    
    const userMsg = query;
    setQuery("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    // Simulate AI delay
    setTimeout(() => {
      // Very basic logic to pick some products based on keywords, or just random
      const lowerQuery = userMsg.toLowerCase();
      let matchedProducts = PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        p.category.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
      );

      // If no match, just pick 3 random ones
      if (matchedProducts.length === 0) {
        matchedProducts = [...PRODUCTS].sort(() => 0.5 - Math.random()).slice(0, 3);
      } else {
        matchedProducts = matchedProducts.slice(0, 3);
      }

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `Dựa vào những gì bạn chia sẻ, mình xin gợi ý những sản phẩm cực kỳ phù hợp sau đây. Chắc chắn bé sẽ rất thích!`,
        products: matchedProducts
      }]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" /> Trợ Lý AI Gợi Ý Quà Tặng
          </h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-[70vh]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                  <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                    <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
                  </div>

                  {/* Product Recommendations */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {msg.products.map(product => (
                        <Card key={product.id} className="bg-white overflow-hidden group hover:border-primary transition-colors">
                          <Link href={`/products/${product.id}`} className="block relative aspect-square bg-slate-100 p-4">
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                          </Link>
                          <CardContent className="p-4">
                            <h4 className="font-bold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">{product.name}</h4>
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-primary text-sm">{product.price.toLocaleString('vi-VN')}đ</span>
                              <Button size="icon" className="w-8 h-8 rounded-full" onClick={(e) => {
                                e.preventDefault();
                                addItem(product, 1);
                              }}>
                                <ShoppingCart className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0 order-2">
                    <User className="w-6 h-6 text-slate-500" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-4 justify-start">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2 text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin" /> Đang suy nghĩ...
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="relative flex items-center">
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="VD: Bé gái 5 tuổi thích vẽ tranh..."
                className="pr-14 h-14 rounded-full bg-slate-50 border-slate-200 focus:bg-white text-base"
                disabled={loading}
              />
              <Button 
                onClick={handleSend} 
                disabled={!query.trim() || loading}
                size="icon" 
                className="absolute right-2 w-10 h-10 rounded-full bg-primary hover:bg-primary/90 text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5 -ml-1 mt-1" />
              </Button>
            </div>
            <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" /> AI có thể đưa ra thông tin không hoàn toàn chính xác.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
