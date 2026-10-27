"use client";

import React, { useState, useEffect } from "react";
import { History, Star, ShoppingBag, Check, Trash2, Heart } from "lucide-react";
import { StoreProduct } from "@/modules/storefront/types/storefront.types";

interface Props {
  onAddToCart: (product: StoreProduct) => void;
  onOpenProduct: (product: StoreProduct) => void;
}

export function RecentlyViewedSection({ onAddToCart, onOpenProduct }: Props) {
  const [recentProducts, setRecentProducts] = useState<StoreProduct[]>([]);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const loadRecent = () => {
    try {
      const stored = localStorage.getItem("emox_recently_viewed");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentProducts(parsed);
          return;
        }
      }
    } catch {
      // fallback
    }

    // Default sample if empty so user immediately sees the functionality
    fetch("/api/products")
      .then((r) => r.json())
      .then((j) => {
        if (j.data && Array.isArray(j.data)) {
          const defaults = j.data.slice(0, 4).map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: Number(p.price) || 0,
            comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
            rating: Number(p.rating) || 4.8,
            reviewsCount: Number(p.reviewsCount) || 120,
            category: p.categoryNames?.[0] || "General",
            brand: p.brand || "Emox Choice",
            image:
              p.mainImage ||
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80",
            discountPercent:
              p.comparePrice && p.comparePrice > p.price
                ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
                : undefined,
            currentStock: p.currentStock,
            isSoldOut: Boolean(p.isSoldOut || p.currentStock <= 0),
          }));
          setRecentProducts(defaults);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadRecent();

    // Listen to custom event for when products are viewed
    const handleStorageChange = () => {
      loadRecent();
    };

    window.addEventListener("product_visited", handleStorageChange);
    return () => {
      window.removeEventListener("product_visited", handleStorageChange);
    };
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("emox_recently_viewed");
    setRecentProducts([]);
  };

  const handleAdd = (p: StoreProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(p);
    setAddedMap((prev) => ({ ...prev, [p.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [p.id]: false }));
    }, 1200);
  };

  if (recentProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans border-t border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Recently Visited Products
          </h2>
          <span className="text-xs text-slate-400">({recentProducts.length})</span>
        </div>

        <button
          onClick={clearHistory}
          className="text-xs text-slate-400 hover:text-red-600 flex items-center space-x-1 transition cursor-pointer"
          title="Clear browsing history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {recentProducts.slice(0, 5).map((product) => {
          const isAdded = addedMap[product.id] || false;

          return (
            <div
              key={product.id}
              onClick={() => onOpenProduct(product)}
              className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md p-3 flex flex-col justify-between transition-all duration-200 group cursor-pointer relative"
            >
              {/* Product Image */}
              <div className="relative w-full aspect-square bg-[#f8fafc] rounded-xl flex items-center justify-center p-2.5 overflow-hidden mb-2.5">
                {product.isSoldOut ? (
                  <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-white">
                    Sold Out
                  </span>
                ) : product.discountPercent ? (
                  <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500 text-white">
                    -{product.discountPercent}%
                  </span>
                ) : null}

                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Title & Price */}
              <div className="space-y-1 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-medium text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition">
                    {product.name}
                  </h3>

                  <div className="flex items-center space-x-1 mt-1 text-[10px] text-slate-400">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                    <span>({product.reviewsCount})</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {product.price.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">AED</span>
                    {product.comparePrice && (
                      <span className="text-[10px] text-slate-400 line-through">
                        {product.comparePrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={product.isSoldOut}
                    onClick={(e) => handleAdd(product, e)}
                    className={`mt-2 w-full py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center space-x-1 ${
                      product.isSoldOut
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : isAdded
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-50 hover:bg-emerald-600 text-slate-700 hover:text-white border border-slate-200 hover:border-emerald-600"
                    }`}
                  >
                    {product.isSoldOut ? (
                      <span>Sold Out</span>
                    ) : isAdded ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3 h-3" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
