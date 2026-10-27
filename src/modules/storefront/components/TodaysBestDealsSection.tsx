"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Heart, Star, ShoppingBag, Check } from "lucide-react";
import { StoreProduct } from "../types/storefront.types";

interface Props {
  onAddToCart: (product: StoreProduct) => void;
  onOpenProduct?: (product: StoreProduct) => void;
  searchFilter?: string;
}

export function TodaysBestDealsSection({ onAddToCart, onOpenProduct, searchFilter }: Props) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [addedAnimation, setAddedAnimation] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    fetch("/api/products")
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.data && Array.isArray(json.data)) {
          const activeOnly = json.data
            .filter((p: any) => p.status === "ACTIVE" && p.mainImage)
            .map((p: any) => {
              const hasDiscount = p.comparePrice && p.comparePrice > p.price;
              const discountPct = hasDiscount
                ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
                : undefined;

              return {
                id: p.id,
                name: p.name,
                slug: p.slug,
                price: Number(p.price) || 0,
                comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
                rating: Number(p.rating) || 4.7,
                reviewsCount: Number(p.reviewsCount) || 120,
                category: p.categoryNames?.[0] || "General",
                brand: p.brand || "Emox Choice",
                image:
                  p.mainImage ||
                  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80",
                isDeal: true,
                discountPercent: discountPct,
                currentStock: p.currentStock,
                isSoldOut: Boolean(p.isSoldOut || p.currentStock <= 0),
              } as StoreProduct;
            });
          setProducts(activeOnly);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAdd = (product: StoreProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedAnimation((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedAnimation((prev) => ({ ...prev, [product.id]: false }));
    }, 1200);
  };

  const filteredDeals = products.filter((product) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      product.name.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q) ||
      (product.brand || "").toLowerCase().includes(q)
    );
  });

  return (
    <section id="deals" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Section Header matching Image */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Todays Best Deals For You!
        </h2>

        <Link
          href="/category/all"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1 transition cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Product Cards Row dynamically rendered from Backend (5 Cards) */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
              <div className="w-full aspect-square bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-4 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-slate-100 rounded animate-pulse" />
              <div className="h-8 bg-slate-100 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="text-xs text-slate-400 py-6">No products found matching your criteria.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {filteredDeals.slice(0, 5).map((product) => {
            const isFavorited = wishlist[product.id] || false;
            const isAdded = addedAnimation[product.id] || false;

            return (
              <div
                key={product.id}
                onClick={() => onOpenProduct && onOpenProduct(product)}
                className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-lg p-3 sm:p-4 flex flex-col justify-between transition-all duration-300 group relative cursor-pointer"
              >
                {/* Product Image Frame matching screenshot */}
                <div className="relative w-full aspect-square bg-[#f8fafc] rounded-xl flex items-center justify-center p-3 overflow-hidden mb-3">
                  {/* Discount or Sold Out Badge */}
                  {product.isSoldOut ? (
                    <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                      Sold Out
                    </span>
                  ) : product.discountPercent ? (
                    <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500 text-white shadow-xs">
                      -{product.discountPercent}% OFF
                    </span>
                  ) : null}

                  {/* Wishlist Heart Icon */}
                  <button
                    type="button"
                    onClick={(e) => toggleWishlist(product.id, e)}
                    title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 shadow-2xs flex items-center justify-center hover:scale-110 transition cursor-pointer z-10"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 transition-colors ${
                        isFavorited ? "fill-red-500 text-red-500" : "text-slate-400"
                      }`}
                    />
                  </button>

                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-108 transition-transform duration-300"
                  />
                </div>

                {/* Title & Metadata */}
                <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-medium text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition">
                      {product.name}
                    </h3>

                    {/* Rating Stars matching screenshot */}
                    <div className="flex items-center space-x-1 mt-1 text-[11px] text-slate-500">
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(product.rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200 fill-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        ({product.reviewsCount >= 1000 ? `${(product.reviewsCount / 1000).toFixed(1)}k` : product.reviewsCount})
                      </span>
                    </div>
                  </div>

                  {/* Price Row matching screenshot */}
                  <div className="pt-2 flex items-baseline justify-between">
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-sm sm:text-base font-black text-slate-900 font-mono">
                        ₹{product.price.toFixed(2)}
                      </span>
                      {product.comparePrice && (
                        <span className="text-[11px] text-slate-400 line-through font-mono">
                          ₹{product.comparePrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    disabled={product.isSoldOut}
                    onClick={(e) => !product.isSoldOut && handleAdd(product, e)}
                    className={`mt-2 w-full py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                      product.isSoldOut
                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        : isAdded
                        ? "bg-emerald-600 text-white cursor-pointer"
                        : "bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white border border-slate-200 hover:border-blue-600 cursor-pointer"
                    }`}
                  >
                    {product.isSoldOut ? (
                      <span>Sold Out</span>
                    ) : isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
