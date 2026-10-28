"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Monitor,
  Tablet,
  Smartphone,
  Save,
  Check,
  CheckCircle2,
  Paintbrush,
  Sliders,
  Shield,
  Eye,
  RefreshCw,
  Sparkles,
  Layers,
  ShoppingBag,
  ExternalLink,
  Code,
  Tag,
  AlertTriangle,
  MoveUp,
  MoveDown,
  Store,
  Plus,
  Trash2,
  Edit2,
  X,
  Image as ImageIcon,
  ArrowRight,
  Palette,
  CheckSquare,
  Square,
} from "lucide-react";
import { Slider } from "@/modules/sliders/types/slider.types";

interface ThemeDesignSettings {
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
}

interface ThemeConfigRecord {
  design: ThemeDesignSettings;
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
  customCss?: string;
}

interface ThemeRecord {
  id: string;
  name: string;
  slug: string;
  version: string;
  thumbnail: string;
  description: string;
  author: string;
  isActive: boolean;
  isSystem: boolean;
  config: ThemeConfigRecord;
}

const FONTS = [
  "Inter, sans-serif",
  "Roboto, sans-serif",
  "Poppins, sans-serif",
  "Outfit, sans-serif",
  "Plus Jakarta Sans, sans-serif",
  "system-ui, sans-serif",
];

const GRADIENT_PRESETS = [
  { name: "Deep Navy (iPhone)", value: "from-[#091124] via-[#1a233d] to-[#0c142b]" },
  { name: "Slate Indigo (Galaxy)", value: "from-[#0f172a] via-[#1e1b4b] to-[#1e293b]" },
  { name: "Onyx Black (Sony)", value: "from-[#18181b] via-[#27272a] to-[#09090b]" },
  { name: "Sky Cyan (Puma)", value: "from-[#0284c7] via-[#0ea5e9] to-[#38bdf8]" },
  { name: "Berry Red (Vegetables)", value: "from-[#881337] via-[#9f1239] to-[#be123c]" },
  { name: "Soft Sky Blue (Samsung FE)", value: "from-[#bfdbfe] via-[#dbeafe] to-[#eff6ff]" },
  { name: "Flame Crimson (Special Offer)", value: "from-[#b91c1c] via-[#dc2626] to-[#ea580c]" },
  { name: "Emerald Forest", value: "from-[#064e3b] via-[#047857] to-[#059669]" },
  { name: "Royal Violet", value: "from-[#3b0764] via-[#581c87] to-[#7e22ce]" },
];

const SAMPLE_IMAGE_PRESETS = [
  { label: "Galaxy S24", url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80" },
  { label: "iPhone 16", url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80" },
  { label: "Sony Headset", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80" },
  { label: "Puma Sneaker", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80" },
  { label: "Fresh Veggies", url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80" },
  { label: "Galaxy FE", url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80" },
  { label: "Honey & Dates", url: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80" },
  { label: "Smartwatch", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80" },
];

export function ThemeCustomizerView() {
  const searchParams = useSearchParams();
  const themeId = searchParams?.get("id") || "";

  const [theme, setTheme] = useState<ThemeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeAccordion, setActiveAccordion] = useState<string>("design");

  // Local draft config
  const [config, setConfig] = useState<ThemeConfigRecord | null>(null);
  const [iframeKey, setIframeKey] = useState(Date.now());

  // Banners & Sliders Management State
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [slidersLoading, setSlidersLoading] = useState(false);
  const [sliderTab, setSliderTab] = useState<"main" | "side" | "triple_promo">("main");
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [isAddingSlider, setIsAddingSlider] = useState(false);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Form State for editing / adding a slider
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formBadge, setFormBadge] = useState("");
  const [formTag, setFormTag] = useState("");
  const [formButtonText, setFormButtonText] = useState("Shop Now");
  const [formButtonLink, setFormButtonLink] = useState("/#deals");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formBgGradient, setFormBgGradient] = useState("from-[#091124] via-[#1a233d] to-[#0c142b]");
  const [formTextColor, setFormTextColor] = useState("text-white");
  const [formIsActive, setFormIsActive] = useState(true);

  const fetchSlidersList = async () => {
    try {
      setSlidersLoading(true);
      const res = await fetch("/api/sliders?all=true");
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setSliders(json.data);
      }
    } catch (err) {
      console.error("Failed to load sliders", err);
    } finally {
      setSlidersLoading(false);
    }
  };

  useEffect(() => {
    async function loadTheme() {
      try {
        setLoading(true);
        let url = "/api/themes/active";
        if (themeId) {
          url = `/api/themes/${themeId}`;
        }
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && json.data) {
          setTheme(json.data);
          let loadedConfig = json.data.config;

          // If storeName is missing, fetch site settings to initialize it
          if (!loadedConfig?.design?.storeName) {
            try {
              const sRes = await fetch("/api/settings");
              const sJson = await sRes.json();
              if (sJson.success && sJson.data?.themeName) {
                loadedConfig = {
                  ...loadedConfig,
                  design: {
                    ...loadedConfig.design,
                    storeName: sJson.data.themeName,
                    storeTagline: sJson.data.tagline || "Online Shopping for Electronics, Fashion, Deals & More in India",
                  },
                };
              }
            } catch {}
          }
          setConfig(loadedConfig);
        }
      } catch (err) {
        console.error("Failed to load theme for customization", err);
      } finally {
        setLoading(false);
      }
    }

    loadTheme();
    fetchSlidersList();
  }, [themeId]);

  const toggleAccordion = (name: string) => {
    setActiveAccordion(activeAccordion === name ? "" : name);
  };

  // Broadcast to live preview iframe
  const notifyIframe = (message: any) => {
    const iframe = document.querySelector("iframe");
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(message, "*");
    }
  };

  const handleDesignChange = (key: keyof ThemeDesignSettings, val: any) => {
    if (!config) return;
    setConfig({
      ...config,
      design: {
        ...config.design,
        [key]: val,
      },
    });
  };

  const handleStoreNameChange = (val: string) => {
    if (!config) return;
    setConfig({
      ...config,
      design: {
        ...config.design,
        storeName: val,
      },
    });
    // Instant real-time logo update in live preview iframe
    notifyIframe({ type: "ANTIGRAVITY_UPDATE_STORE_NAME", storeName: val });
  };

  const handleAnnouncementChange = (key: string, val: any) => {
    if (!config) return;
    setConfig({
      ...config,
      design: {
        ...config.design,
        announcementBar: {
          ...config.design.announcementBar,
          [key]: val,
        },
      },
    });
  };

  const handleSectionToggle = (key: keyof ThemeConfigRecord["sections"]) => {
    if (!config) return;
    if (key === "order") return;
    setConfig({
      ...config,
      sections: {
        ...config.sections,
        [key]: !config.sections[key],
      },
    });
  };

  const handleIntegrationChange = (key: keyof ThemeConfigRecord["integrations"], val: any) => {
    if (!config) return;
    setConfig({
      ...config,
      integrations: {
        ...config.integrations,
        [key]: val,
      },
    });
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    if (!config) return;
    const order = [...config.sections.order];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= order.length) return;
    const temp = order[index];
    order[index] = order[targetIdx];
    order[targetIdx] = temp;
    setConfig({
      ...config,
      sections: {
        ...config.sections,
        order,
      },
    });
  };

  const handleSave = async (publish = false) => {
    if (!theme || !config) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/themes/${theme.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      const json = await res.json();
      if (json.success) {
        // Sync store name & tagline to global site settings
        if (config.design.storeName) {
          await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              themeName: config.design.storeName,
              siteTitle: `${config.design.storeName} | Online Shopping for Electronics, Fashion, Deals & More in India`,
              tagline: config.design.storeTagline || "Online Shopping for Electronics, Fashion, Deals & More in India",
            }),
          });
        }

        if (publish && !theme.isActive) {
          await fetch(`/api/themes/${theme.id}/activate`, { method: "POST" });
        }
        setSaveSuccess(true);
        setIframeKey(Date.now()); // refresh preview
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(json.error || "Failed to save theme settings");
      }
    } catch {
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  // Slider & Banner Management Actions
  const openAddBanner = (pos: "main" | "side" | "triple_promo") => {
    setEditingSlider(null);
    setIsAddingSlider(true);
    setSliderTab(pos);

    if (pos === "main") {
      setFormTitle("New Hero Flagship Showcase");
      setFormSubtitle("From ₹49,999*");
      setFormDescription("Next-generation performance, titanium body & ultra-smooth display");
      setFormBadge("");
      setFormTag("Limited Period Offer");
      setFormButtonText("Shop Now");
      setFormButtonLink("/#deals");
      setFormImageUrl(SAMPLE_IMAGE_PRESETS[0].url);
      setFormBgGradient("from-[#091124] via-[#1a233d] to-[#0c142b]");
      setFormTextColor("text-white");
      setFormIsActive(true);
    } else if (pos === "side") {
      setFormTitle("SALE UP TO 50% OFF");
      setFormSubtitle("Puma Nitro Pro Velocity");
      setFormDescription("High-cushion responsive running gear");
      setFormBadge("SALE");
      setFormTag("PUMA SPEED");
      setFormButtonText("Shop Puma");
      setFormButtonLink("/#deals");
      setFormImageUrl(SAMPLE_IMAGE_PRESETS[3].url);
      setFormBgGradient("from-[#0284c7] via-[#0ea5e9] to-[#38bdf8]");
      setFormTextColor("text-white");
      setFormIsActive(true);
    } else {
      setFormTitle("FRESH ORGANIC VEGETABLES");
      setFormSubtitle("Farm-fresh crisp greens, carrots & tomatoes delivered daily");
      setFormDescription("");
      setFormBadge("50% SAVE");
      setFormTag("FREE DELIVERY");
      setFormButtonText("Shop now");
      setFormButtonLink("/#deals");
      setFormImageUrl(SAMPLE_IMAGE_PRESETS[4].url);
      setFormBgGradient("from-[#881337] via-[#9f1239] to-[#be123c]");
      setFormTextColor("text-white");
      setFormIsActive(true);
    }
  };

  const openEditBanner = (s: Slider) => {
    setIsAddingSlider(false);
    setEditingSlider(s);
    setSliderTab(s.position);

    setFormTitle(s.title || "");
    setFormSubtitle(s.subtitle || "");
    setFormDescription(s.description || "");
    setFormBadge(s.badge || "");
    setFormTag(s.tag || "");
    setFormButtonText(s.buttonText || "Shop Now");
    setFormButtonLink(s.buttonLink || "/#deals");
    setFormImageUrl(s.imageUrl || "");
    setFormBgGradient(s.bgGradient || "from-[#091124] via-[#1a233d] to-[#0c142b]");
    setFormTextColor(s.textColor || "text-white");
    setFormIsActive(s.isActive !== false);
  };

  const cancelBannerEdit = () => {
    setEditingSlider(null);
    setIsAddingSlider(false);
  };

  const handleSaveBanner = async () => {
    if (!formTitle.trim()) {
      alert("Please provide a banner title.");
      return;
    }

    try {
      setBannerSaving(true);
      const payload = {
        title: formTitle.trim(),
        subtitle: formSubtitle.trim() || undefined,
        description: formDescription.trim() || undefined,
        badge: formBadge.trim() || undefined,
        tag: formTag.trim() || undefined,
        buttonText: formButtonText.trim() || "Shop Now",
        buttonLink: formButtonLink.trim() || "/#deals",
        imageUrl: formImageUrl.trim() || undefined,
        bgGradient: formBgGradient,
        textColor: formTextColor,
        position: sliderTab,
        isActive: formIsActive,
      };

      let res;
      if (isAddingSlider) {
        res = await fetch("/api/sliders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else if (editingSlider) {
        res = await fetch(`/api/sliders/${editingSlider.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res && res.ok) {
        await fetchSlidersList();
        setEditingSlider(null);
        setIsAddingSlider(false);

        // Notify iframe and reload preview
        notifyIframe({ type: "ANTIGRAVITY_REFRESH_SLIDERS" });
        setIframeKey(Date.now());

        setBannerNotice(isAddingSlider ? "Banner created successfully!" : "Banner updated successfully!");
        setTimeout(() => setBannerNotice(null), 3000);
      } else {
        alert("Failed to save banner. Please check all fields.");
      }
    } catch {
      alert("Error saving banner.");
    } finally {
      setBannerSaving(false);
    }
  };

  const handleToggleBannerActive = async (s: Slider) => {
    try {
      const nextActive = !s.isActive;
      await fetch(`/api/sliders/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextActive }),
      });
      await fetchSlidersList();
      notifyIframe({ type: "ANTIGRAVITY_REFRESH_SLIDERS" });
      setIframeKey(Date.now());
    } catch {
      alert("Failed to toggle banner status.");
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const res = await fetch(`/api/sliders/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchSlidersList();
        if (editingSlider?.id === id) {
          setEditingSlider(null);
        }
        notifyIframe({ type: "ANTIGRAVITY_REFRESH_SLIDERS" });
        setIframeKey(Date.now());
      }
    } catch {
      alert("Failed to delete banner.");
    }
  };

  const handleReorderBanner = async (slider: Slider, direction: "up" | "down", list: Slider[]) => {
    const currentIndex = list.findIndex((s) => s.id === slider.id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const targetSlider = list[targetIndex];

    const tempOrder = slider.displayOrder || 1;
    await fetch(`/api/sliders/${slider.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayOrder: targetSlider.displayOrder || targetIndex + 1 }),
    });
    await fetch(`/api/sliders/${targetSlider.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayOrder: tempOrder }),
    });
    await fetchSlidersList();
    notifyIframe({ type: "ANTIGRAVITY_REFRESH_SLIDERS" });
    setIframeKey(Date.now());
  };

  // Filtered slider lists
  const mainSlides = sliders.filter((s) => s.position === "main").sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const sideSlides = sliders.filter((s) => s.position === "side").sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const promoSlides = sliders.filter((s) => s.position === "triple_promo").sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  if (loading || !theme || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
          <span className="font-semibold text-lg">Loading Theme Editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Top Header Bar matching Screenshot 3 */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/themes"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Back to Themes"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm sm:text-base">{theme.name}</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                v{theme.version}
              </span>
              {theme.isActive && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setDevice("desktop")}
            className={`p-1.5 rounded-lg transition ${
              device === "desktop" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
            title="Desktop Preview (100%)"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice("tablet")}
            className={`p-1.5 rounded-lg transition ${
              device === "tablet" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
            title="Tablet Preview (768px)"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`p-1.5 rounded-lg transition ${
              device === "mobile" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
            title="Mobile Preview (375px)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved!</span>
            </span>
          )}

          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>
        </div>
      </header>

      {/* Main Split Body: Sidebar Accordions on Left, Live View on Right */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: Accordions matching Screenshot 3 */}
        <aside className="w-80 sm:w-96 lg:w-[420px] bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-3 text-xs uppercase font-extrabold tracking-wider text-slate-500 border-b border-slate-800 flex items-center justify-between">
            <span>Theme Customization Sections</span>
            {bannerNotice && (
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {bannerNotice}
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-800 text-xs sm:text-sm">
            {/* 1. Theme Design & Store Identity */}
            <div className="overflow-hidden">
              <button
                onClick={() => toggleAccordion("design")}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition font-bold text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Paintbrush className="w-4 h-4 text-indigo-400" />
                  <span>Theme Design</span>
                </div>
                {activeAccordion === "design" ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {activeAccordion === "design" && (
                <div className="p-4 space-y-4 bg-slate-950/60 text-slate-300 border-t border-slate-800/80">
                  {/* Store Identity & Name (Direct User Request) */}
                  <div className="space-y-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Store Identity & Branding</span>
                      </label>
                      <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                        Live Sync
                      </span>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Store Name (Logo & Brand Name)
                      </label>
                      <input
                        type="text"
                        value={config.design.storeName || ""}
                        onChange={(e) => handleStoreNameChange(e.target.value)}
                        placeholder="e.g. G-Store, MyStore"
                        className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold focus:border-indigo-500 focus:outline-none"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Updates storefront logo, browser tab title, and footer copyright in real time.
                      </p>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Store Tagline</label>
                      <input
                        type="text"
                        value={config.design.storeTagline || ""}
                        onChange={(e) => handleDesignChange("storeTagline", e.target.value)}
                        placeholder="e.g. Online Shopping for Electronics, Fashion, Deals & More in India"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">Color Palette</label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Primary Brand Color</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.design.primaryColor}
                            onChange={(e) => handleDesignChange("primaryColor", e.target.value)}
                            className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                          />
                          <span className="text-xs font-mono text-slate-400">{config.design.primaryColor}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs">Secondary Dark Color</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.design.secondaryColor}
                            onChange={(e) => handleDesignChange("secondaryColor", e.target.value)}
                            className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                          />
                          <span className="text-xs font-mono text-slate-400">{config.design.secondaryColor}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs">Accent / Highlight</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.design.accentColor}
                            onChange={(e) => handleDesignChange("accentColor", e.target.value)}
                            className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                          />
                          <span className="text-xs font-mono text-slate-400">{config.design.accentColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Typography */}
                  <div className="pt-2 border-t border-slate-800">
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">Body & Heading Font</label>
                    <select
                      value={config.design.fontFamily}
                      onChange={(e) => handleDesignChange("fontFamily", e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    >
                      {FONTS.map((f) => (
                        <option key={f} value={f}>
                          {f.split(",")[0]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Header & Footer Style */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Header Style</label>
                      <select
                        value={config.design.headerStyle}
                        onChange={(e) => handleDesignChange("headerStyle", e.target.value as any)}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      >
                        <option value="modern">Modern</option>
                        <option value="classic">Classic</option>
                        <option value="minimal">Minimal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Footer Style</label>
                      <select
                        value={config.design.footerStyle}
                        onChange={(e) => handleDesignChange("footerStyle", e.target.value as any)}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      >
                        <option value="standard">Standard</option>
                        <option value="detailed">Detailed</option>
                        <option value="compact">Compact</option>
                      </select>
                    </div>
                  </div>

                  {/* Announcement Bar */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Top Announcement Bar</span>
                      <input
                        type="checkbox"
                        checked={config.design.announcementBar.enabled}
                        onChange={(e) => handleAnnouncementChange("enabled", e.target.checked)}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>

                    {config.design.announcementBar.enabled && (
                      <div className="space-y-2 pt-1">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Bar Text</label>
                          <input
                            type="text"
                            value={config.design.announcementBar.text}
                            onChange={(e) => handleAnnouncementChange("text", e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400">Background</span>
                          <input
                            type="color"
                            value={config.design.announcementBar.bgColor}
                            onChange={(e) => handleAnnouncementChange("bgColor", e.target.value)}
                            className="w-6 h-6 rounded bg-transparent cursor-pointer border border-slate-700"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Sliders & Banners Management Studio (Direct User Request) */}
            <div className="overflow-hidden">
              <button
                onClick={() => toggleAccordion("sliders")}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition font-bold text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  <span>Sliders & Banners</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {sliders.length}
                  </span>
                </div>
                {activeAccordion === "sliders" ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {activeAccordion === "sliders" && (
                <div className="p-3 space-y-3 bg-slate-950/70 text-slate-300 border-t border-slate-800/80">
                  {/* Sub-Tabs: Hero Sliders | Selected Side Banner | Promotion Banners */}
                  <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setSliderTab("main");
                        cancelBannerEdit();
                      }}
                      className={`py-1.5 px-2 rounded-lg font-bold text-center transition ${
                        sliderTab === "main"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Hero ({mainSlides.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSliderTab("side");
                        cancelBannerEdit();
                      }}
                      className={`py-1.5 px-2 rounded-lg font-bold text-center transition ${
                        sliderTab === "side"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Side Banner ({sideSlides.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSliderTab("triple_promo");
                        cancelBannerEdit();
                      }}
                      className={`py-1.5 px-2 rounded-lg font-bold text-center transition ${
                        sliderTab === "triple_promo"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Promos ({promoSlides.length})
                    </button>
                  </div>

                  {/* Banner Editor Form (Shown when editing or adding) */}
                  {(isAddingSlider || editingSlider) ? (
                    <div className="p-3.5 bg-slate-900 border border-indigo-500/40 rounded-xl space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="font-bold text-xs text-indigo-400 flex items-center gap-1.5">
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>
                            {isAddingSlider
                              ? sliderTab === "main"
                                ? "Add New Hero Slide"
                                : sliderTab === "side"
                                ? "Add Selected Side Banner"
                                : "Add Promotion Banner"
                              : `Edit ${sliderTab === "side" ? "Selected Banner" : "Banner"}`}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={cancelBannerEdit}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Banner Headline / Title *
                        </label>
                        <input
                          type="text"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="e.g. Samsung Galaxy S24 Ultra, SALE UP TO 50% OFF"
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white font-medium focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      {/* Subtitle / Price highlight */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Subtitle / Price Highlight
                        </label>
                        <input
                          type="text"
                          value={formSubtitle}
                          onChange={(e) => setFormSubtitle(e.target.value)}
                          placeholder="e.g. From ₹999.99*, Puma Nitro Pro Velocity"
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      {/* Badge & Tag */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Badge</label>
                          <input
                            type="text"
                            value={formBadge}
                            onChange={(e) => setFormBadge(e.target.value)}
                            placeholder="e.g. 50% SAVE, SALE"
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Tag</label>
                          <input
                            type="text"
                            value={formTag}
                            onChange={(e) => setFormTag(e.target.value)}
                            placeholder="e.g. FREE DELIVERY, GALAXY AI"
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      {sliderTab !== "triple_promo" && (
                        <div>
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                            Description Features
                          </label>
                          <textarea
                            rows={2}
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            placeholder="Galaxy AI is here. Circle to Search, Live Translate & Nightography"
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      )}

                      {/* Button Text & Link */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Button Text</label>
                          <input
                            type="text"
                            value={formButtonText}
                            onChange={(e) => setFormButtonText(e.target.value)}
                            placeholder="Shop Now"
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Button Link</label>
                          <input
                            type="text"
                            value={formButtonLink}
                            onChange={(e) => setFormButtonLink(e.target.value)}
                            placeholder="/#deals or /products/..."
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Image URL & Quick Suggestions */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Product Image URL
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={formImageUrl}
                            onChange={(e) => setFormImageUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono focus:border-indigo-500 focus:outline-none truncate"
                          />
                          {formImageUrl && (
                            <img
                              src={formImageUrl}
                              alt="Preview"
                              className="w-8 h-8 rounded object-cover border border-slate-700 shrink-0"
                            />
                          )}
                        </div>

                        {/* Quick sample image chips */}
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {SAMPLE_IMAGE_PRESETS.map((p) => (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => setFormImageUrl(p.url)}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                            >
                              +{p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Background Gradient Presets */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 flex items-center gap-1">
                          <Palette className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Background Theme Gradient</span>
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                          {GRADIENT_PRESETS.map((gp) => (
                            <button
                              key={gp.name}
                              type="button"
                              onClick={() => setFormBgGradient(gp.value)}
                              className={`p-1.5 rounded-lg text-left flex items-center gap-1.5 border transition ${
                                formBgGradient === gp.value
                                  ? "border-indigo-500 bg-indigo-500/10 text-white"
                                  : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded bg-gradient-to-r ${gp.value} border border-white/20 shrink-0`}
                              />
                              <span className="text-[10px] font-medium truncate">{gp.name.split(" ")[0]}</span>
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={formBgGradient}
                          onChange={(e) => setFormBgGradient(e.target.value)}
                          placeholder="from-[#...] via-[#...] to-[#...]"
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-400 font-mono"
                        />
                      </div>

                      {/* Status switch */}
                      <label className="flex items-center justify-between text-xs font-semibold cursor-pointer pt-1 border-t border-slate-800">
                        <span>Active on Storefront</span>
                        <input
                          type="checkbox"
                          checked={formIsActive}
                          onChange={(e) => setFormIsActive(e.target.checked)}
                          className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                        />
                      </label>

                      {/* Save & Cancel Buttons */}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={handleSaveBanner}
                          disabled={bannerSaving}
                          className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition shadow flex items-center justify-center gap-1.5"
                        >
                          {bannerSaving ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          <span>{isAddingSlider ? "Create Banner" : "Update Banner"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={cancelBannerEdit}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* TAB 1: HERO CAROUSEL SLIDERS */}
                  {sliderTab === "main" && !isAddingSlider && !editingSlider && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">
                          Main Hero Slides ({mainSlides.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => openAddBanner("main")}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20 transition"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Hero Slide</span>
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {mainSlides.map((slide, idx) => (
                          <div
                            key={slide.id}
                            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2.5 hover:border-slate-700 transition"
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              {/* Thumbnail preview */}
                              <div
                                className={`w-10 h-10 rounded-lg bg-gradient-to-r ${
                                  slide.bgGradient || "from-slate-800 to-slate-900"
                                } flex items-center justify-center border border-slate-700 shrink-0 overflow-hidden relative`}
                              >
                                {slide.imageUrl ? (
                                  <img
                                    src={slide.imageUrl}
                                    alt={slide.title}
                                    className="w-full h-full object-contain p-0.5"
                                  />
                                ) : (
                                  <ImageIcon className="w-4 h-4 text-slate-400" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs text-white truncate">{slide.title}</span>
                                  {slide.isActive ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Active" />
                                  ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" title="Hidden" />
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">
                                  {slide.subtitle || slide.buttonText || "Shop Now"}
                                </div>
                              </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleReorderBanner(slide, "up", mainSlides)}
                                className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition"
                                title="Move up"
                              >
                                <MoveUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === mainSlides.length - 1}
                                onClick={() => handleReorderBanner(slide, "down", mainSlides)}
                                className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition"
                                title="Move down"
                              >
                                <MoveDown className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditBanner(slide)}
                                className="p-1 text-slate-400 hover:text-indigo-400 transition"
                                title="Edit slide"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBanner(slide.id)}
                                className="p-1 text-slate-400 hover:text-rose-400 transition"
                                title="Delete slide"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: SELECTED SIDE BANNER */}
                  {sliderTab === "side" && !isAddingSlider && !editingSlider && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-300 block">
                            Featured Side Banner ({sideSlides.length})
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Promotional banner next to hero slider
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => openAddBanner("side")}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20 transition"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Side Banner</span>
                        </button>
                      </div>

                      {/* Display current active side banner showcase */}
                      {sideSlides.length > 0 && (
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                              Selected Banner
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                              Displaying Live
                            </span>
                          </div>

                          <div
                            className={`p-3 rounded-lg bg-gradient-to-br ${
                              sideSlides[0]?.bgGradient || "from-[#0284c7] to-[#38bdf8]"
                            } text-white flex items-center justify-between gap-3 shadow-md`}
                          >
                            <div className="min-w-0">
                              <div className="font-black text-sm uppercase leading-tight truncate">
                                {sideSlides[0]?.title || "SALE UP TO 50% OFF"}
                              </div>
                              <div className="text-[11px] opacity-90 truncate">
                                {sideSlides[0]?.subtitle || "Puma Nitro Pro Velocity"}
                              </div>
                              <div className="text-[10px] opacity-80 pt-1">
                                CTA: {sideSlides[0]?.buttonText || "Shop Puma"}
                              </div>
                            </div>
                            {sideSlides[0]?.imageUrl && (
                              <img
                                src={sideSlides[0]?.imageUrl}
                                alt="Side Banner"
                                className="w-12 h-12 object-contain shrink-0 drop-shadow"
                              />
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => openEditBanner(sideSlides[0])}
                            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                            <span>Edit Selected Banner Content</span>
                          </button>
                        </div>
                      )}

                      {/* Other alternate side banners */}
                      {sideSlides.length > 1 && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-800">
                          <span className="text-[11px] font-bold text-slate-400 block">
                            Alternate Side Banners
                          </span>
                          {sideSlides.slice(1).map((sb) => (
                            <div
                              key={sb.id}
                              className="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between gap-2 text-xs"
                            >
                              <span className="font-semibold text-slate-300 truncate">{sb.title}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleToggleBannerActive(sb)}
                                  className="text-[10px] text-indigo-400 hover:underline font-bold"
                                >
                                  Activate
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEditBanner(sb)}
                                  className="p-1 text-slate-400 hover:text-white"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBanner(sb.id)}
                                  className="p-1 text-slate-400 hover:text-rose-400"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: PROMOTION BANNERS (User request: more promotion banner manage) */}
                  {sliderTab === "triple_promo" && !isAddingSlider && !editingSlider && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-300 block">
                            Promotional Banners ({promoSlides.length})
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Multi-column campaign promotion banners
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => openAddBanner("triple_promo")}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20 transition"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Promo Banner</span>
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {promoSlides.map((promo, idx) => (
                          <div
                            key={promo.id}
                            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2.5 hover:border-slate-700 transition"
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-lg bg-gradient-to-r ${
                                  promo.bgGradient || "from-slate-800 to-slate-900"
                                } flex items-center justify-center border border-slate-700 shrink-0 overflow-hidden`}
                              >
                                {promo.imageUrl ? (
                                  <img
                                    src={promo.imageUrl}
                                    alt={promo.title}
                                    className="w-full h-full object-contain p-0.5"
                                  />
                                ) : (
                                  <ImageIcon className="w-4 h-4 text-slate-400" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  {promo.badge && (
                                    <span className="text-[9px] font-bold bg-amber-400/20 text-amber-300 px-1 py-0.2 rounded border border-amber-400/30">
                                      {promo.badge}
                                    </span>
                                  )}
                                  <span className="font-bold text-xs text-white truncate">{promo.title}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {promo.subtitle || promo.buttonText || "Shop now"}
                                </div>
                              </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleReorderBanner(promo, "up", promoSlides)}
                                className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition"
                                title="Move up"
                              >
                                <MoveUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === promoSlides.length - 1}
                                onClick={() => handleReorderBanner(promo, "down", promoSlides)}
                                className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition"
                                title="Move down"
                              >
                                <MoveDown className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditBanner(promo)}
                                className="p-1 text-slate-400 hover:text-indigo-400 transition"
                                title="Edit promo banner"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBanner(promo.id)}
                                className="p-1 text-slate-400 hover:text-rose-400 transition"
                                title="Delete promo banner"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Backend Link helper */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Advanced slider controls:</span>
                    <Link
                      href="/admin/sliders"
                      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition"
                    >
                      <span>Sliders Dashboard</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Captcha */}
            <div className="overflow-hidden">
              <button
                onClick={() => toggleAccordion("captcha")}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition font-bold text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Captcha</span>
                </div>
                {activeAccordion === "captcha" ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {activeAccordion === "captcha" && (
                <div className="p-4 space-y-3 bg-slate-950/60 text-slate-300 border-t border-slate-800/80">
                  <label className="flex items-center justify-between text-xs font-medium cursor-pointer">
                    <span>Enable Google reCAPTCHA v3</span>
                    <input
                      type="checkbox"
                      checked={config.integrations.captchaEnabled}
                      onChange={(e) => handleIntegrationChange("captchaEnabled", e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Protects checkout forms, user registration, and reviews from spam bots.
                  </p>
                </div>
              )}
            </div>

            {/* 4. Microsoft UET Tag */}
            <div className="overflow-hidden">
              <button
                onClick={() => toggleAccordion("uet")}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition font-bold text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Tag className="w-4 h-4 text-teal-400" />
                  <span>Microsoft UET Tag</span>
                </div>
                {activeAccordion === "uet" ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {activeAccordion === "uet" && (
                <div className="p-4 space-y-2 bg-slate-950/60 text-slate-300 border-t border-slate-800/80">
                  <label className="block text-xs font-bold text-slate-400">Tag ID</label>
                  <input
                    type="text"
                    value={config.integrations.microsoftUetTag || ""}
                    onChange={(e) => handleIntegrationChange("microsoftUetTag", e.target.value)}
                    placeholder="e.g. TAG-98234-MS"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono"
                  />
                </div>
              )}
            </div>

            {/* 5. Meta Pixel */}
            <div className="overflow-hidden">
              <button
                onClick={() => toggleAccordion("pixel")}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition font-bold text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Code className="w-4 h-4 text-blue-400" />
                  <span>Meta Pixel</span>
                </div>
                {activeAccordion === "pixel" ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {activeAccordion === "pixel" && (
                <div className="p-4 space-y-2 bg-slate-950/60 text-slate-300 border-t border-slate-800/80">
                  <label className="block text-xs font-bold text-slate-400">Meta / Facebook Pixel ID</label>
                  <input
                    type="text"
                    value={config.integrations.metaPixelId || ""}
                    onChange={(e) => handleIntegrationChange("metaPixelId", e.target.value)}
                    placeholder="e.g. PIXEL-4492019"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono"
                  />
                </div>
              )}
            </div>

            {/* 6. Maintenance Mode Settings */}
            <div className="overflow-hidden">
              <button
                onClick={() => toggleAccordion("maintenance")}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition font-bold text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Maintenance Mode Settings</span>
                </div>
                {activeAccordion === "maintenance" ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {activeAccordion === "maintenance" && (
                <div className="p-4 space-y-3 bg-slate-950/60 text-slate-300 border-t border-slate-800/80">
                  <label className="flex items-center justify-between text-xs font-medium cursor-pointer">
                    <span>Enable Maintenance Mode</span>
                    <input
                      type="checkbox"
                      checked={config.integrations.maintenanceMode}
                      onChange={(e) => handleIntegrationChange("maintenanceMode", e.target.checked)}
                      className="rounded border-slate-700 text-rose-500 focus:ring-rose-500"
                    />
                  </label>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Notice Message for Visitors</label>
                    <textarea
                      rows={2}
                      value={config.integrations.maintenanceMessage || ""}
                      onChange={(e) => handleIntegrationChange("maintenanceMessage", e.target.value)}
                      placeholder="We are upgrading our servers..."
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 7. Home Page Settings (Sections Visibility & Reordering) */}
            <div className="overflow-hidden">
              <button
                onClick={() => toggleAccordion("home")}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition font-bold text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Home Page Settings</span>
                </div>
                {activeAccordion === "home" ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {activeAccordion === "home" && (
                <div className="p-4 space-y-3 bg-slate-950/60 text-slate-300 border-t border-slate-800/80">
                  <p className="text-[11px] text-slate-400">
                    Toggle sections on/off and reorder them on your storefront homepage:
                  </p>

                  <div className="space-y-1.5">
                    {config.sections.order.map((secKey, idx) => {
                      const enabled = config.sections[secKey as keyof typeof config.sections] as boolean;
                      const labelMap: Record<string, string> = {
                        heroSlider: "Hero Carousel Slider",
                        popularCategories: "Popular Categories Grid",
                        todaysDeals: "Today's Best Deals & Offers",
                        promoBanners: "Triple Promotional Banners",
                        winterWear: "Winter Wear Clearance Section",
                        recentlyViewed: "Recently Viewed Products",
                      };
                      return (
                        <div
                          key={secKey}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                        >
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={() =>
                                handleSectionToggle(secKey as keyof ThemeConfigRecord["sections"])
                              }
                              className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className={enabled ? "font-semibold text-white" : "text-slate-500 line-through"}>
                              {labelMap[secKey] || secKey}
                            </span>
                          </label>

                          <div className="flex items-center gap-1 text-slate-400">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveSection(idx, "up")}
                              className="p-1 hover:text-white disabled:opacity-30"
                              title="Move up"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === config.sections.order.length - 1}
                              onClick={() => moveSection(idx, "down")}
                              className="p-1 hover:text-white disabled:opacity-30"
                              title="Move down"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 8. Product Page Settings */}
            <div className="overflow-hidden">
              <button
                onClick={() => toggleAccordion("product")}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition font-bold text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-purple-400" />
                  <span>Product Page Settings</span>
                </div>
                {activeAccordion === "product" ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {activeAccordion === "product" && (
                <div className="p-4 space-y-2 bg-slate-950/60 text-slate-300 border-t border-slate-800/80">
                  <label className="flex items-center justify-between text-xs cursor-pointer">
                    <span>Show Star Ratings & Reviews</span>
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                  </label>
                  <label className="flex items-center justify-between text-xs cursor-pointer">
                    <span>Show Customer Q&A Tab</span>
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                  </label>
                  <label className="flex items-center justify-between text-xs cursor-pointer">
                    <span>Show Real-time Stock Badge</span>
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                  </label>
                </div>
              )}
            </div>

            {/* 9. Category Page Settings */}
            <div className="overflow-hidden">
              <button
                onClick={() => toggleAccordion("category")}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition font-bold text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span>Category Page Settings</span>
                </div>
                {activeAccordion === "category" ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {activeAccordion === "category" && (
                <div className="p-4 space-y-2 bg-slate-950/60 text-slate-300 border-t border-slate-800/80">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Products Grid Columns</label>
                    <select className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white">
                      <option value="4">4 Columns (Standard)</option>
                      <option value="3">3 Columns (Spacious)</option>
                      <option value="5">5 Columns (Compact)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT LIVE PREVIEW PANE: Interactive Real-time Frame */}
        <main className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div
            className={`h-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col transition-all duration-300 ${
              device === "desktop"
                ? "w-full max-w-7xl"
                : device === "tablet"
                ? "w-[768px]"
                : "w-[380px]"
            }`}
          >
            {/* Live Preview announcement bar simulation */}
            {config.design.announcementBar.enabled && (
              <div
                style={{
                  backgroundColor: config.design.announcementBar.bgColor,
                  color: config.design.announcementBar.textColor,
                }}
                className="py-1 px-4 text-xs font-medium text-center shrink-0"
              >
                {config.design.announcementBar.text}
              </div>
            )}

            {/* Embedded Live Iframe with Preview Parameters including Store Name */}
            <iframe
              key={iframeKey}
              src={`/?themePreview=${theme.id}&primary=${encodeURIComponent(
                config.design.primaryColor
              )}&accent=${encodeURIComponent(config.design.accentColor)}&header=${
                config.design.headerStyle
              }&storeName=${encodeURIComponent(config.design.storeName || "")}`}
              className="w-full flex-1 border-0"
              title="Shopify-like Theme Live Preview"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
