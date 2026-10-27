"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Sliders,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  ExternalLink,
  Layers,
  ArrowRight,
  Sparkles,
  X,
  Save,
  Check,
  UploadCloud,
  Image as ImageIcon,
} from "lucide-react";
import { Slider } from "../types/slider.types";
import { AssetSelectorModal } from "@/modules/assets/components/AssetSelectorModal";
import { Asset } from "@/modules/assets/types/asset.types";

const GRADIENT_PRESETS = [
  { name: "Deep Navy (iPhone)", value: "from-[#091124] via-[#1a233d] to-[#0c142b]" },
  { name: "Slate Indigo (Galaxy)", value: "from-[#0f172a] via-[#1e1b4b] to-[#1e293b]" },
  { name: "Onyx Black (Sony)", value: "from-[#18181b] via-[#27272a] to-[#09090b]" },
  { name: "Sky Cyan (Puma)", value: "from-[#0284c7] via-[#0ea5e9] to-[#38bdf8]" },
  { name: "Berry Red (Vegetables)", value: "from-[#881337] via-[#9f1239] to-[#be123c]" },
  { name: "Soft Sky Blue (Samsung FE)", value: "from-[#bfdbfe] via-[#dbeafe] to-[#eff6ff]" },
  { name: "Flame Crimson (Emox Special)", value: "from-[#b91c1c] via-[#dc2626] to-[#ea580c]" },
];

export function ManageSlidersView() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "main" | "side" | "triple_promo">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("");
  const [tag, setTag] = useState("");
  const [buttonText, setButtonText] = useState("Shop Now");
  const [buttonLink, setButtonLink] = useState("/#deals");
  const [imageUrl, setImageUrl] = useState("");
  const [bgGradient, setBgGradient] = useState("from-[#091124] via-[#1a233d] to-[#0c142b]");
  const [textColor, setTextColor] = useState("text-white");
  const [position, setPosition] = useState<"main" | "side" | "triple_promo">("main");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchSliders = () => {
    fetch("/api/sliders?all=true")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setSliders(json.data);
        }
      })
      .catch(() => {
        showNotification("error", "Failed to load sliders from backend.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const openAddModal = () => {
    setEditingSlider(null);
    setTitle("");
    setSubtitle("");
    setDescription("");
    setBadge("");
    setTag("");
    setButtonText("Shop Now");
    setButtonLink("/#deals");
    setImageUrl("");
    setBgGradient("from-[#091124] via-[#1a233d] to-[#0c142b]");
    setTextColor("text-white");
    setPosition("main");
    setDisplayOrder(sliders.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (s: Slider) => {
    setEditingSlider(s);
    setTitle(s.title);
    setSubtitle(s.subtitle || "");
    setDescription(s.description || "");
    setBadge(s.badge || "");
    setTag(s.tag || "");
    setButtonText(s.buttonText || "Shop Now");
    setButtonLink(s.buttonLink || "/#deals");
    setImageUrl(s.imageUrl || "");
    setBgGradient(s.bgGradient || "from-[#091124] via-[#1a233d] to-[#0c142b]");
    setTextColor(s.textColor || "text-white");
    setPosition(s.position);
    setDisplayOrder(s.displayOrder || 1);
    setIsActive(s.isActive !== false);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (slider: Slider) => {
    const updatedStatus = !slider.isActive;
    try {
      const res = await fetch(`/api/sliders/${slider.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: updatedStatus }),
      });
      if (res.ok) {
        setSliders((prev) =>
          prev.map((s) => (s.id === slider.id ? { ...s, isActive: updatedStatus } : s))
        );
        showNotification("success", `Slider "${slider.title}" ${updatedStatus ? "activated" : "deactivated"}.`);
      }
    } catch {
      showNotification("error", "Failed to update slider status.");
    }
  };

  const handleDelete = async (slider: Slider) => {
    if (!confirm(`Are you sure you want to delete "${slider.title}"?`)) return;

    try {
      const res = await fetch(`/api/sliders/${slider.id}`, { method: "DELETE" });
      if (res.ok) {
        setSliders((prev) => prev.filter((s) => s.id !== slider.id));
        showNotification("success", `Slider "${slider.title}" removed.`);
      }
    } catch {
      showNotification("error", "Failed to delete slider.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showNotification("error", "Title is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        badge: badge.trim(),
        tag: tag.trim(),
        buttonText: buttonText.trim(),
        buttonLink: buttonLink.trim(),
        imageUrl: imageUrl.trim(),
        bgGradient,
        textColor,
        position,
        displayOrder: Number(displayOrder),
        isActive,
      };

      const url = editingSlider ? `/api/sliders/${editingSlider.id}` : "/api/sliders";
      const method = editingSlider ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to save slider.");

      showNotification("success", `Slider "${title}" saved successfully.`);
      setIsModalOpen(false);
      fetchSliders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving slider";
      showNotification("error", msg);
    } finally {
      setSaving(false);
    }
  };

  const filteredSliders = useMemo(() => {
    if (activeTab === "all") return sliders;
    return sliders.filter((s) => s.position === activeTab);
  }, [sliders, activeTab]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-xl shadow-lg border flex items-center space-x-3 animate-in fade-in slide-in-from-top-4 duration-200 ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="text-xs font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <nav className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Link href="/admin/dashboard" className="hover:text-blue-600 transition">
              Dashboard
            </Link>
            <span>&gt;</span>
            <span className="font-semibold text-slate-800">Sliders &amp; Promo Banners</span>
          </nav>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Manage Sliders &amp; Hero Banners
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              Frontend Customization
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Live Frontend</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Slider</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100/80 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          All Sliders ({sliders.length})
        </button>
        <button
          onClick={() => setActiveTab("main")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "main" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Main Hero Slider ({sliders.filter((s) => s.position === "main").length})
        </button>
        <button
          onClick={() => setActiveTab("side")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "side" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Side Promo Banner ({sliders.filter((s) => s.position === "side").length})
        </button>
        <button
          onClick={() => setActiveTab("triple_promo")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "triple_promo" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Triple Feature Banners ({sliders.filter((s) => s.position === "triple_promo").length})
        </button>
      </div>

      {/* Sliders Grid / Live Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-blue-600 mb-2" />
            <span>Loading sliders...</span>
          </div>
        ) : filteredSliders.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            No sliders found in this category.
          </div>
        ) : (
          filteredSliders.map((slider) => (
            <div
              key={slider.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between group hover:border-slate-300 transition"
            >
              {/* Preview Banner Box */}
              <div
                className={`p-5 bg-gradient-to-r ${slider.bgGradient || "from-slate-900 to-slate-800"} ${
                  slider.textColor || "text-white"
                } relative min-h-[170px] flex flex-col justify-between overflow-hidden`}
              >
                {/* Background image if available */}
                {slider.imageUrl && (
                  <img
                    src={slider.imageUrl}
                    alt={slider.title}
                    className="absolute right-2 bottom-0 w-28 h-28 object-contain opacity-90 drop-shadow-md pointer-events-none group-hover:scale-105 transition-transform duration-300"
                  />
                )}

                <div>
                  <div className="flex items-center justify-between relative z-10">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 backdrop-blur-md uppercase tracking-wider">
                      {slider.position.replace("_", " ")}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        slider.isActive ? "bg-emerald-500 text-white" : "bg-slate-500 text-slate-200"
                      }`}
                    >
                      {slider.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {slider.tag && (
                    <span className="text-[10px] font-medium opacity-80 mt-1 block">
                      {slider.tag}
                    </span>
                  )}
                  <h3 className="text-base font-black tracking-tight mt-1 line-clamp-1 relative z-10 max-w-[70%]">
                    {slider.title}
                  </h3>
                  {slider.subtitle && (
                    <p className="text-xs font-semibold opacity-90 line-clamp-1 max-w-[70%]">
                      {slider.subtitle}
                    </p>
                  )}
                </div>

                <div className="relative z-10 mt-3 flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white text-slate-900 shadow-xs">
                    {slider.buttonText || "Shop Now"}
                  </span>
                  {slider.badge && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-400 text-slate-900">
                      {slider.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-3.5 bg-white flex items-center justify-between text-xs border-t border-slate-100">
                <div className="space-y-0.5 text-slate-500 text-[11px]">
                  <div>Order: <span className="font-semibold text-slate-700">{slider.displayOrder}</span></div>
                  <div className="truncate max-w-[180px]">{slider.buttonLink}</div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(slider)}
                    title={slider.isActive ? "Deactivate" : "Activate"}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                      slider.isActive
                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {slider.isActive ? "Disable" : "Enable"}
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(slider)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(slider)}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Slider Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  {editingSlider ? "Edit Slider Banner" : "Create New Slider Banner"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {/* Position & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    Slider Placement *
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as any)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="main">Main Hero Slider (Left Carousel)</option>
                    <option value="side">Side Promo Banner (Right Card)</option>
                    <option value="triple_promo">Triple Feature Promo Cards</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    min={1}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    Banner Title * (e.g. iPhone 16 Pro Max)
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter main headline"
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    Subtitle / Pricing Tag (e.g. From $ 50,769*)
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Secondary headline or price offer"
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief highlights or offer details"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Tag & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    Small Tag (e.g. *Incl. All Offers / FREE DELIVERY)
                  </label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="Small top tag"
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    Discount Badge (e.g. 50% SAVE / SAMSUNG)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Pill badge text"
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Button & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Shop Now"
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    Button Destination URL
                  </label>
                  <input
                    type="text"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    placeholder="/#deals or /categories/electronics"
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Banner / Product Image from Asset Library */}
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                  Product / Promo Image (Transparent PNG or photo)
                </label>
                {imageUrl ? (
                  <div className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-700 p-1 flex items-center justify-center overflow-hidden shrink-0">
                      <img src={imageUrl} alt="Banner preview" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{imageUrl}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Attached from Asset Library</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setIsAssetModalOpen(true)}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition cursor-pointer"
                        >
                          Change from Assets
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageUrl("")}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsAssetModalOpen(true)}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition flex flex-col items-center justify-center space-y-1"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <p className="font-bold text-slate-800">Select Banner Image from Assets / Upload</p>
                    <p className="text-[11px] text-slate-500">
                      Choose an image from your media library or upload a new file directly
                    </p>
                  </div>
                )}
              </div>

              {/* Background Gradient Preset Picker */}
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                  Background Style Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                  {GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setBgGradient(preset.value);
                        if (preset.value.includes("bfdbfe")) {
                          setTextColor("text-slate-900");
                        } else {
                          setTextColor("text-white");
                        }
                      }}
                      className={`p-2 rounded-lg border text-left text-[11px] font-semibold transition ${
                        bgGradient === preset.value
                          ? "border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`h-4 rounded bg-gradient-to-r ${preset.value} mb-1 border border-black/10`} />
                      <span className="truncate block">{preset.name}</span>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={bgGradient}
                  onChange={(e) => setBgGradient(e.target.value)}
                  placeholder="Tailwind gradient classes"
                  className="w-full h-8 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px]"
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="sliderActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <label htmlFor="sliderActiveToggle" className="font-semibold text-slate-800 cursor-pointer">
                  Publish &amp; display this banner on the live storefront
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition flex items-center space-x-1.5"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Banner</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Centralized Asset Selector Modal for Banner */}
      {isAssetModalOpen && (
        <AssetSelectorModal
          isOpen={isAssetModalOpen}
          onClose={() => setIsAssetModalOpen(false)}
          selectedAssetIds={[]}
          onConfirmSelection={(selectedAssets) => {
            if (selectedAssets && selectedAssets.length > 0) {
              setImageUrl(selectedAssets[0].url);
            }
          }}
          multiSelect={false}
        />
      )}
    </div>
  );
}
