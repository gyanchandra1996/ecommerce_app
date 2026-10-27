"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Slider } from "@/modules/sliders/types/slider.types";

interface Props {
  initialMainSlides?: Slider[];
  initialSideSlide?: Slider | null;
}

const DEFAULT_MAIN_SLIDES: Slider[] = [
  {
    id: "def_hero_1",
    title: "iPhone 16 Pro Max",
    subtitle: "From $ 50,769*",
    description: "A18 chip, Superfast, Supersmart History, Biggest Price Drop",
    tag: "*Incl. All Offers",
    buttonText: "Shop Now",
    buttonLink: "#deals",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    bgGradient: "from-[#081226] via-[#16213e] to-[#0a1128]",
    textColor: "text-white",
    position: "main",
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "def_hero_2",
    title: "Samsung Galaxy S24 Ultra",
    subtitle: "From ₹999.99*",
    description: "Galaxy AI is here. Circle to Search, Live Translate & Nightography",
    tag: "Free Galaxy Buds Included",
    buttonText: "Shop Now",
    buttonLink: "#deals",
    imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80",
    bgGradient: "from-[#0f172a] via-[#1e1b4b] to-[#1e293b]",
    textColor: "text-white",
    position: "main",
    displayOrder: 2,
    isActive: true,
  },
  {
    id: "def_hero_3",
    title: "Sony WH-1000XM5",
    subtitle: "Pure Silence, Premium Sound",
    description: "Industry-leading noise cancellation with auto NC optimizer",
    tag: "Special Launch Price",
    buttonText: "Shop Now",
    buttonLink: "#deals",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    bgGradient: "from-[#18181b] via-[#27272a] to-[#09090b]",
    textColor: "text-white",
    position: "main",
    displayOrder: 3,
    isActive: true,
  },
];

const DEFAULT_SIDE_SLIDE: Slider = {
  id: "def_side_1",
  title: "SALE UP TO 50% OFF",
  subtitle: "Puma Nitro Pro Velocity",
  description: "High-cushion responsive running gear",
  buttonText: "Shop Puma",
  buttonLink: "#deals",
  imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
  bgGradient: "from-[#0284c7] via-[#0ea5e9] to-[#38bdf8]",
  textColor: "text-white",
  position: "side",
  displayOrder: 1,
  isActive: true,
};

export function HeroSliderSection({
  initialMainSlides,
  initialSideSlide,
}: Props) {
  const [mainSlides, setMainSlides] = useState<Slider[]>(
    initialMainSlides && initialMainSlides.length > 0 ? initialMainSlides : DEFAULT_MAIN_SLIDES
  );
  const [sideSlide, setSideSlide] = useState<Slider>(
    initialSideSlide || DEFAULT_SIDE_SLIDE
  );
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch live sliders from backend
  useEffect(() => {
    let isMounted = true;
    const loadSliders = () => {
      fetch("/api/sliders?position=main")
        .then((res) => res.json())
        .then((json) => {
          if (isMounted && json.data && json.data.length > 0) {
            setMainSlides(json.data);
          }
        })
        .catch(() => {});

      fetch("/api/sliders?position=side")
        .then((res) => res.json())
        .then((json) => {
          if (isMounted && json.data && json.data.length > 0) {
            setSideSlide(json.data[0]);
          }
        })
        .catch(() => {});
    };

    loadSliders();

    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === "ANTIGRAVITY_REFRESH_SLIDERS") {
        loadSliders();
      }
    };
    window.addEventListener("message", handleMsg);

    return () => {
      isMounted = false;
      window.removeEventListener("message", handleMsg);
    };
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (mainSlides.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % mainSlides.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mainSlides.length, isPaused]);

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + mainSlides.length) % mainSlides.length);
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % mainSlides.length);
  };

  const currentSlide = mainSlides[currentSlideIndex] || mainSlides[0];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Main Hero Slider (Left ~65% width matching Image) */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className={`lg:col-span-8 rounded-2xl bg-gradient-to-r ${
            currentSlide?.bgGradient || "from-[#081226] via-[#16213e] to-[#0a1128]"
          } ${currentSlide?.textColor || "text-white"} relative overflow-hidden shadow-lg p-6 sm:p-10 flex flex-col justify-between min-h-[380px] sm:min-h-[440px] transition-all duration-700`}
        >
          {/* Subtle Background Glow Effect */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Tag & Titles */}
          <div className="relative z-10 max-w-sm sm:max-w-md space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {currentSlide?.title}
            </h2>

            {currentSlide?.subtitle && (
              <div className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                {currentSlide.subtitle}
              </div>
            )}

            {currentSlide?.description && (
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed pt-1">
                {currentSlide.description}
              </p>
            )}

            {/* CTA Button matching Image */}
            <div className="pt-4 sm:pt-6">
              <a
                href={currentSlide?.buttonLink || "#deals"}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[#1e293b] hover:bg-black text-white border border-slate-700 transition cursor-pointer shadow-md"
              >
                <span>{currentSlide?.buttonText || "Shop Now"}</span>
              </a>
            </div>
          </div>

          {/* Product Image on Right side */}
          {currentSlide?.imageUrl && !currentSlide.imageUrl.includes("photo-1610945265064") ? (
            <div className="absolute right-2 sm:right-6 bottom-0 sm:bottom-4 w-[200px] sm:w-[280px] md:w-[340px] pointer-events-none z-10 flex items-end justify-center">
              <img
                src={currentSlide.imageUrl}
                alt={currentSlide.title}
                className="max-h-[260px] sm:max-h-[350px] object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
              />
            </div>
          ) : (
            <div className="absolute right-2 sm:right-6 bottom-0 sm:bottom-4 w-[180px] sm:w-[280px] md:w-[320px] pointer-events-none z-10 flex items-end justify-center">
              {/* Hand holding phone mock visual matching screenshot */}
              <div className="relative w-full h-[280px] sm:h-[380px] flex items-end justify-center">
                <div className="w-[160px] sm:w-[220px] h-[260px] sm:h-[350px] rounded-[36px] bg-slate-900 p-2 sm:p-2.5 shadow-2xl border-4 border-slate-700 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="w-full h-full rounded-[28px] overflow-hidden relative bg-black flex flex-col justify-between p-3 text-white">
                    {/* Dynamic Island */}
                    <div className="w-20 h-4 bg-black rounded-full mx-auto relative z-20 flex items-center justify-end pr-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    </div>

                    {/* Lock Screen Clock 9:41 matching screenshot */}
                    <div className="text-center mt-2 relative z-10">
                      <div className="text-[9px] font-medium text-slate-300">Monday, September 9</div>
                      <div className="text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow">
                        9:41
                      </div>
                    </div>

                    {/* Lock Screen Wallpaper Glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 via-indigo-950/80 to-blue-900/90 pointer-events-none" />
                    <div className="w-32 h-32 rounded-full bg-cyan-400/20 blur-xl absolute top-1/3 left-1/4 pointer-events-none" />

                    {/* Bottom Phone Bar */}
                    <div className="w-24 h-1 bg-white/70 rounded-full mx-auto relative z-10"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Row: Incl. All Offers tag + Pagination Dots matching Image */}
          <div className="relative z-10 flex items-center justify-between pt-6">
            <span className="text-[11px] text-slate-400 font-medium">
              {currentSlide?.tag || "*Incl. All Offers"}
            </span>

            {/* Pagination Dots */}
            <div className="flex items-center space-x-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full">
              {mainSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentSlideIndex === idx
                      ? "w-6 bg-white"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Navigation Arrows on Hover */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition z-20 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition z-20 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Side Promo Banner (Right ~35% width matching Image: SALE UP TO 50% OFF Puma Running Shoe) */}
        <div
          className={`lg:col-span-4 rounded-2xl bg-gradient-to-br ${
            sideSlide?.bgGradient || "from-[#0284c7] via-[#0ea5e9] to-[#38bdf8]"
          } text-white relative overflow-hidden shadow-lg p-6 sm:p-8 flex flex-col justify-between min-h-[380px] sm:min-h-[440px]`}
        >
          {/* Top Headline matching Image or Custom Content */}
          {(!sideSlide?.title || sideSlide?.title === "SALE UP TO 50% OFF") ? (
            <div className="relative z-10 space-y-1">
              <div className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-white drop-shadow-xs">
                SALE
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-white/90">
                UP TO
              </div>
              <div className="text-4xl sm:text-5xl font-black tracking-tight leading-none text-white drop-shadow-sm">
                50<span className="text-2xl font-bold">%</span>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-white/90">
                OFF
              </div>
            </div>
          ) : (
            <div className="relative z-10 space-y-1.5">
              {sideSlide?.tag && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs inline-block">
                  {sideSlide.tag}
                </span>
              )}
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white drop-shadow-xs uppercase">
                {sideSlide?.title}
              </h3>
              {sideSlide?.subtitle && (
                <div className="text-xs sm:text-sm font-bold tracking-wider text-white/90 pt-0.5">
                  {sideSlide.subtitle}
                </div>
              )}
              {sideSlide?.description && (
                <p className="text-[11px] text-white/80 line-clamp-2 font-medium pt-0.5">
                  {sideSlide.description}
                </p>
              )}
            </div>
          )}

          {/* Puma Shoe on Track Artwork matching screenshot */}
          <div className="relative z-10 mt-6 flex-1 flex flex-col justify-end items-center">
            {/* Running Shoe Image */}
            <div className="relative w-full h-[180px] sm:h-[200px] flex items-center justify-center">
              <img
                src={
                  sideSlide?.imageUrl ||
                  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
                }
                alt="Running Sneaker"
                className="w-full h-full object-contain drop-shadow-2xl transform -rotate-12 hover:rotate-0 transition-transform duration-500 pointer-events-none"
              />
            </div>

            {/* Stadium Track Lines Ground Visual */}
            <div className="w-full h-8 rounded-full bg-red-600/30 blur-md transform -skew-x-12 mt-[-15px]" />
          </div>

          {/* CTA Link matching Image */}
          <div className="relative z-10 pt-2 flex items-center justify-between">
            <a
              href={sideSlide?.buttonLink || "#deals"}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition shadow-xs"
            >
              <span>{sideSlide?.buttonText || "Shop Puma"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase">
              PUMA SPEED
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
