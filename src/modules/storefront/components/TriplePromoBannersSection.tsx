"use client";

import React, { useState, useEffect } from "react";
import { Slider } from "@/modules/sliders/types/slider.types";

const DEFAULT_PROMOS: Slider[] = [
  {
    id: "def_promo_1",
    badge: "50% SAVE",
    tag: "FREE DELIVERY",
    title: "FRESH AND HEALTHY VEGETABLE",
    subtitle: "Farm-fresh organic greens, crisp carrots & tomatoes delivered daily",
    buttonText: "Shop now",
    buttonLink: "#deals",
    imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80",
    bgGradient: "from-[#881337] via-[#9f1239] to-[#be123c]",
    textColor: "text-white",
    position: "triple_promo",
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "def_promo_2",
    badge: "SAMSUNG",
    tag: "GALAXY AI IS HERE",
    title: "Galaxy S24 FE",
    subtitle: "Galaxy AI ✨ is here",
    buttonText: "Shop now",
    buttonLink: "#deals",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
    bgGradient: "from-[#bfdbfe] via-[#dbeafe] to-[#eff6ff]",
    textColor: "text-slate-900",
    position: "triple_promo",
    displayOrder: 2,
    isActive: true,
  },
  {
    id: "def_promo_3",
    badge: "Limited Stock",
    tag: "EXCLUSIVE SPECIAL OFFER",
    title: "Organic Mountain Delights",
    subtitle: "Organic mountain honey, pantry spices & dates sets",
    buttonText: "Shop now",
    buttonLink: "#deals",
    imageUrl: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80",
    bgGradient: "from-[#b91c1c] via-[#dc2626] to-[#ea580c]",
    textColor: "text-white",
    position: "triple_promo",
    displayOrder: 3,
    isActive: true,
  },
];

export function TriplePromoBannersSection() {
  const [promos, setPromos] = useState<Slider[]>(DEFAULT_PROMOS);

  useEffect(() => {
    let isMounted = true;
    const loadPromos = () => {
      fetch("/api/sliders?position=triple_promo")
        .then((res) => res.json())
        .then((json) => {
          if (isMounted && json.data && json.data.length > 0) {
            setPromos(json.data);
          }
        })
        .catch(() => {});
    };

    loadPromos();

    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === "ANTIGRAVITY_REFRESH_SLIDERS") {
        loadPromos();
      }
    };
    window.addEventListener("message", handleMsg);

    return () => {
      isMounted = false;
      window.removeEventListener("message", handleMsg);
    };
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {promos.map((promo) => (
          <div
            key={promo.id}
            className={`rounded-2xl bg-gradient-to-br ${
              promo.bgGradient || "from-slate-900 to-slate-800"
            } ${promo.textColor || "text-white"} p-6 sm:p-7 relative overflow-hidden shadow-lg min-h-[300px] flex flex-col justify-between group`}
          >
            {/* Top Badges & Tag */}
            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center justify-between">
                {promo.tag && (
                  <span className="text-[10px] font-black uppercase tracking-wider opacity-90">
                    {promo.tag.replace(/emox/gi, "Special")}
                  </span>
                )}
                {promo.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-400 text-slate-900 shadow-2xs">
                    {promo.badge}
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight pt-1">
                {promo.title?.replace(/عرض إيموكس المميز/gi, "Special Value Deals").replace(/emox/gi, "Special")}
              </h3>

              {promo.subtitle && (
                <p className="text-xs font-semibold opacity-90 line-clamp-1">
                  {promo.subtitle}
                </p>
              )}
            </div>

            {/* Visual Image Centered/Bottom */}
            <div className="relative z-10 my-4 flex-1 flex items-center justify-center">
              {promo.imageUrl && (
                <img
                  src={promo.imageUrl}
                  alt={promo.title}
                  className="max-h-[140px] sm:max-h-[160px] object-contain drop-shadow-xl group-hover:scale-108 transition-transform duration-500 pointer-events-none"
                />
              )}
            </div>

            {/* Bottom Button matching screenshot */}
            <div className="relative z-10">
              <a
                href={promo.buttonLink || "#deals"}
                className={`inline-block px-5 py-2 rounded-full text-xs font-bold transition shadow-xs ${
                  promo.textColor === "text-slate-900"
                    ? "bg-[#0284c7] hover:bg-blue-600 text-white"
                    : "bg-black/60 hover:bg-black text-white border border-white/20"
                }`}
              >
                {promo.buttonText || "Shop now"}
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
