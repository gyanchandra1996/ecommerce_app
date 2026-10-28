"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { StoreHeader } from "./StoreHeader";
import { HeroSliderSection } from "./HeroSliderSection";
import { PopularCategoriesSection } from "./PopularCategoriesSection";
import { TodaysBestDealsSection } from "./TodaysBestDealsSection";
import { TriplePromoBannersSection } from "./TriplePromoBannersSection";
import { WinterWearSection } from "./WinterWearSection";
import { RecentlyViewedSection } from "@/modules/recently-viewed/components/RecentlyViewedSection";
import { StoreFooter } from "./StoreFooter";
import { CartItem, StoreProduct } from "../types/storefront.types";
import { useCart } from "@/modules/cart/context/CartContext";

interface ActiveThemeConfig {
  design: {
    storeName?: string;
    storeTagline?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    headingFont: string;
    headerStyle: "modern" | "classic" | "minimal";
    footerStyle: "standard" | "compact" | "detailed";
    announcementBar: {
      enabled: boolean;
      text: string;
      link?: string;
      bgColor: string;
      textColor: string;
    };
  };
  sections: {
    heroSlider: boolean;
    popularCategories: boolean;
    todaysDeals: boolean;
    promoBanners: boolean;
    winterWear: boolean;
    recentlyViewed: boolean;
    order: string[];
  };
  integrations: {
    captchaEnabled: boolean;
    microsoftUetTag?: string;
    metaPixelId?: string;
    maintenanceMode: boolean;
    maintenanceMessage?: string;
  };
}

function StorefrontHomePageContent({ initialStoreName }: { initialStoreName?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewThemeId = searchParams?.get("themePreview");
  const overridePrimary = searchParams?.get("primary");
  const overrideAccent = searchParams?.get("accent");
  const overrideStoreName = searchParams?.get("storeName");
  const [liveStoreName, setLiveStoreName] = useState(overrideStoreName || initialStoreName || "G-store");

  const { items: cart, addItem, adjustQuantity, removeItem, clearCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  // Active theme configuration
  const [themeConfig, setThemeConfig] = useState<ActiveThemeConfig | null>(null);

  useEffect(() => {
    if (overrideStoreName) setLiveStoreName(overrideStoreName);
  }, [overrideStoreName]);

  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === "ANTIGRAVITY_UPDATE_STORE_NAME" && typeof e.data.storeName === "string") {
        setLiveStoreName(e.data.storeName);
      }
    };
    window.addEventListener("message", handleMsg);
    return () => window.removeEventListener("message", handleMsg);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchTheme() {
      try {
        let url = "/api/themes/active";
        if (previewThemeId) {
          url = `/api/themes/${previewThemeId}`;
        }
        const res = await fetch(url);
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          setThemeConfig(json.data.config);
        }
      } catch (err) {
        console.error("Error loading active theme layout", err);
      }
    }
    fetchTheme();
    return () => {
      isMounted = false;
    };
  }, [previewThemeId]);

  const handleAddToCart = (product: StoreProduct, qty: number = 1) => {
    addItem(product, qty);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    adjustQuantity(productId, delta);
  };

  const handleRemoveFromCart = (productId: string) => {
    removeItem(productId);
  };

  // Section ordering & visibility logic
  const defaultOrder = [
    "heroSlider",
    "popularCategories",
    "todaysDeals",
    "promoBanners",
    "winterWear",
    "recentlyViewed",
  ];
  const sectionOrder = themeConfig?.sections?.order || defaultOrder;

  const renderSection = (key: string) => {
    const sec = themeConfig?.sections;
    switch (key) {
      case "heroSlider":
        return sec && sec.heroSlider === false ? null : <HeroSliderSection key="heroSlider" />;
      case "popularCategories":
        return sec && sec.popularCategories === false ? null : (
          <PopularCategoriesSection key="popularCategories" />
        );
      case "todaysDeals":
        return sec && sec.todaysDeals === false ? null : (
          <TodaysBestDealsSection
            key="todaysDeals"
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onOpenProduct={(p) => router.push(`/products/${p.slug || p.id}`)}
            searchFilter={searchQuery}
          />
        );
      case "promoBanners":
        return sec && sec.promoBanners === false ? null : (
          <TriplePromoBannersSection key="promoBanners" />
        );
      case "winterWear":
        return sec && sec.winterWear === false ? null : (
          <WinterWearSection
            key="winterWear"
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onOpenProduct={(p) => router.push(`/products/${p.slug || p.id}`)}
          />
        );
      case "recentlyViewed":
        return sec && sec.recentlyViewed === false ? null : (
          <RecentlyViewedSection
            key="recentlyViewed"
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onOpenProduct={(p) => router.push(`/products/${p.slug || p.id}`)}
          />
        );
      default:
        return null;
    }
  };

  const primaryColor = overridePrimary || themeConfig?.design?.primaryColor || "#2563eb";
  const announcement = themeConfig?.design?.announcementBar;

  return (
    <div
      style={
        {
          "--theme-primary": primaryColor,
          fontFamily: themeConfig?.design?.fontFamily || "inherit",
        } as React.CSSProperties
      }
      className="min-h-screen bg-[#fafbfc] flex flex-col font-sans selection:bg-indigo-600 selection:text-white"
    >
      {/* Dynamic Announcement Bar from Active Theme matching Screenshot 3 */}
      {announcement?.enabled && (
        <div
          style={{
            backgroundColor: announcement.bgColor || "#1e293b",
            color: announcement.textColor || "#ffffff",
          }}
          className="py-1.5 px-4 text-xs font-semibold text-center tracking-wide shadow-xs transition-colors"
        >
          <a href={announcement.link || "/#deals"} className="hover:underline">
            {announcement.text}
          </a>
        </div>
      )}

      {/* Maintenance mode notice if enabled */}
      {themeConfig?.integrations?.maintenanceMode && (
        <div className="bg-amber-500 text-slate-950 font-bold py-2 px-4 text-xs text-center">
          ⚠️ {themeConfig.integrations.maintenanceMessage || "Store is currently in maintenance mode."}
        </div>
      )}

      {/* E-Commerce Header with Cart Drawer & Gateway Checkout */}
      <StoreHeader
        cart={cart}
        onUpdateCartQuantity={handleUpdateCartQuantity}
        onRemoveFromCart={handleRemoveFromCart}
        onSearch={(q) => setSearchQuery(q)}
        onClearCart={() => clearCart()}
        storeName={liveStoreName || overrideStoreName || themeConfig?.design?.storeName}
      />

      {/* Main Content Area dynamically arranged by Active Theme */}
      <main className="flex-1">
        {sectionOrder.map((sectionKey) => renderSection(sectionKey))}
      </main>

      {/* Trust & E-commerce Footer */}
      <StoreFooter storeName={liveStoreName || overrideStoreName || themeConfig?.design?.storeName} />
    </div>
  );
}

export function StorefrontHomePage({ initialStoreName }: { initialStoreName?: string } = {}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-500">
            Loading {initialStoreName || "Store"} Storefront...
          </p>
        </div>
      }
    >
      <StorefrontHomePageContent initialStoreName={initialStoreName} />
    </Suspense>
  );
}
