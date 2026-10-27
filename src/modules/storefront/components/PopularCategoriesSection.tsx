"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  isActive: boolean;
  displayOrder?: number;
}

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  electronics: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80",
  fashion: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  luxury: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80",
  "home-decor": "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=300&q=80",
  "health-beauty": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80",
  groceries: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=300&q=80",
  sneakers: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80",
};

export function PopularCategoriesSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/categories")
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.data && Array.isArray(json.data)) {
          const activeOnly = json.data
            .filter((c: CategoryRecord) => c.isActive !== false)
            .sort((a: CategoryRecord, b: CategoryRecord) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setCategories(activeOnly);
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

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: "smooth" });
    }
  };

  const getCategoryImage = (cat: CategoryRecord) => {
    if (cat.image && cat.image.trim()) return cat.image;
    const slugKey = cat.slug?.toLowerCase();
    if (slugKey && DEFAULT_CATEGORY_IMAGES[slugKey]) {
      return DEFAULT_CATEGORY_IMAGES[slugKey];
    }
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80";
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Header matching Image */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Explore Popular Categories
        </h2>

        <Link
          href="/category/all"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1 transition cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Categories Row dynamically fetched from backend */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex items-center justify-between gap-4 sm:gap-6 overflow-x-auto scrollbar-none pb-2"
        >
          {isLoading ? (
            <div className="flex items-center space-x-6 w-full py-4">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex flex-col items-center space-y-2 shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-slate-100 animate-pulse" />
                  <div className="w-16 h-3 bg-slate-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-xs text-slate-400 py-4">No categories found in backend.</div>
          ) : (
            categories.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="flex flex-col items-center group shrink-0 select-none text-center"
              >
                {/* Circle Wrapper matching screenshot */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-slate-100 flex items-center justify-center p-2.5 sm:p-3 overflow-hidden shadow-2xs group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
                  <img
                    src={getCategoryImage(cat)}
                    alt={cat.name}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Label */}
                <span className="text-xs font-bold text-slate-800 mt-2.5 group-hover:text-blue-600 transition truncate max-w-[100px]">
                  {cat.name}
                </span>
              </Link>
            ))
          )}
        </div>

        {/* Scroll Arrow on Right */}
        <button
          type="button"
          onClick={scrollRight}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 shadow-md items-center justify-center hover:bg-slate-50 transition cursor-pointer z-10"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
