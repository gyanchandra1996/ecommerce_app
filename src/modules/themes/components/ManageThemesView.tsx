"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Palette,
  Upload,
  Paintbrush,
  Eye,
  CheckCircle2,
  Trash2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  FileArchive,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface ThemeDesignSettings {
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
  zipFileName?: string;
  config: {
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
  };
  createdAt: string;
  updatedAt: string;
}

export function ManageThemesView() {
  const [themes, setThemes] = useState<ThemeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"installed" | "library">("installed");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadAuthor, setUploadAuthor] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Preview Modal State
  const [previewTheme, setPreviewTheme] = useState<ThemeRecord | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const fetchThemes = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch("/api/themes");
      const json = await res.json();
      if (json.success) {
        setThemes(json.data);
      } else {
        setErrorMsg(json.error || "Failed to load themes");
      }
    } catch {
      setErrorMsg("Error connecting to themes service");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleActivate = async (theme: ThemeRecord) => {
    try {
      const res = await fetch(`/api/themes/${theme.id}/activate`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        showNotification(json.message || `Theme "${theme.name}" activated! Frontend layout updated.`);
        fetchThemes();
      } else {
        alert(json.error || "Failed to activate theme");
      }
    } catch {
      alert("Error activating theme");
    }
  };

  const handleDelete = async (theme: ThemeRecord) => {
    if (!confirm(`Are you sure you want to delete theme "${theme.name}"?`)) return;
    try {
      const res = await fetch(`/api/themes/${theme.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showNotification(`Theme "${theme.name}" deleted successfully.`);
        fetchThemes();
      } else {
        alert(json.error || "Failed to delete theme");
      }
    } catch {
      alert("Error deleting theme");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (!f.name.toLowerCase().endsWith(".zip")) {
        alert("Please upload a valid .zip theme package");
        return;
      }
      setUploadFile(f);
      if (!uploadName) {
        setUploadName(f.name.replace(/\.zip$/i, "").replace(/[-_]/g, " "));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert("Please select a .zip theme archive");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("name", uploadName.trim());
      formData.append("author", uploadAuthor.trim() || "Third Party Author");
      formData.append("description", uploadDesc.trim());

      const res = await fetch("/api/themes/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        showNotification(json.message || `Theme "${uploadName}" uploaded successfully!`);
        setIsUploadModalOpen(false);
        setUploadFile(null);
        setUploadName("");
        setUploadAuthor("");
        setUploadDesc("");
        setActiveTab("library");
        fetchThemes();
      } else {
        alert(json.error || "Failed to upload theme");
      }
    } catch {
      alert("Error uploading theme file");
    } finally {
      setIsUploading(false);
    }
  };

  const activeTheme = themes.find((t) => t.isActive) || themes[0];

  return (
    <div className="space-y-6">
      {/* Header matching Screenshot 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-600" />
            <span>Theme</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            <span className="text-indigo-600 font-medium">Online Store</span> /{" "}
            <span className="text-slate-400">Themes & Layouts</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchThemes}
            className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition"
            title="Refresh Themes"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Theme</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tab Navigation matching Screenshot 2 */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("installed")}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "installed"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Installed Themes</span>
        </button>

        <button
          onClick={() => setActiveTab("library")}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "library"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Theme Library ({themes.length})</span>
        </button>
      </div>

      {/* TAB 1: INSTALLED THEMES (Featured Active Theme matching Screenshot 2) */}
      {activeTab === "installed" && (
        <div className="space-y-6">
          {activeTheme ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
              <div className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4">
                Current Live Theme
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Visual Thumbnail */}
                <div className="md:col-span-5 relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner group">
                  <Image
                    src={activeTheme.thumbnail}
                    alt={activeTheme.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white flex items-center gap-1 shadow">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Live on Storefront</span>
                    </span>
                  </div>
                </div>

                {/* Theme Details & Actions */}
                <div className="md:col-span-7 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-extrabold text-slate-900">{activeTheme.name}</h2>
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                          v{activeTheme.version}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        By <span className="font-semibold text-slate-700">{activeTheme.author}</span> • Last saved:{" "}
                        {new Date(activeTheme.updatedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-slate-300"
                        style={{ backgroundColor: activeTheme.config?.design?.primaryColor || "#2563eb" }}
                        title="Primary Color"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-slate-300"
                        style={{ backgroundColor: activeTheme.config?.design?.accentColor || "#f59e0b" }}
                        title="Accent Color"
                      />
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed">{activeTheme.description}</p>

                  {/* Highlights */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="text-[11px] text-slate-400 uppercase font-semibold block">Header Style</span>
                      <span className="text-xs font-bold text-slate-800 capitalize">
                        {activeTheme.config?.design?.headerStyle || "Modern"}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="text-[11px] text-slate-400 uppercase font-semibold block">Typography</span>
                      <span className="text-xs font-bold text-slate-800">
                        {activeTheme.config?.design?.fontFamily?.split(",")[0] || "Inter"}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="text-[11px] text-slate-400 uppercase font-semibold block">Announcement</span>
                      <span className="text-xs font-bold text-emerald-600">
                        {activeTheme.config?.design?.announcementBar?.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons matching Screenshot 2 */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                    <Link
                      href={`/admin/themes/customize?id=${activeTheme.id}`}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-sm hover:shadow"
                    >
                      <Paintbrush className="w-4 h-4" />
                      <span>Customize Theme</span>
                    </Link>

                    <button
                      onClick={() => setPreviewTheme(activeTheme)}
                      className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 bg-white text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Live Preview</span>
                    </button>

                    <Link
                      href="/"
                      target="_blank"
                      className="flex items-center gap-1.5 px-3 py-2.5 text-slate-500 hover:text-indigo-600 text-sm font-medium transition"
                    >
                      <span>Visit Live Store</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">Loading active theme...</div>
          )}

          {/* Quick theme switcher row */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-700 flex items-center justify-between">
              <span>Installed Themes Library</span>
              <button
                onClick={() => setActiveTab("library")}
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>View all themes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {themes.map((th) => (
                <div
                  key={th.id}
                  className={`bg-white rounded-xl border p-4 shadow-sm transition flex flex-col justify-between ${
                    th.isActive ? "border-indigo-500 ring-2 ring-indigo-50" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-slate-100 mb-3 border border-slate-200">
                      <Image src={th.thumbnail} alt={th.name} fill className="object-cover" unoptimized />
                      {th.isActive && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white shadow">
                          Current Live
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900 text-sm">{th.name}</h4>
                      <span className="text-[11px] font-mono text-slate-500">v{th.version}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{th.description}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    {th.isActive ? (
                      <Link
                        href={`/admin/themes/customize?id=${th.id}`}
                        className="flex-1 py-1.5 px-3 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold text-center hover:bg-indigo-100 transition"
                      >
                        Customize
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleActivate(th)}
                        className="flex-1 py-1.5 px-3 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => setPreviewTheme(th)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                      title="Preview theme"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THEME LIBRARY */}
      {activeTab === "library" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Manage your uploaded and pre-installed themes. Activating a theme changes the customer-facing
              design instantly while preserving your products, orders, and database contents.
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-black transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload ZIP</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map((th) => (
              <div
                key={th.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-slate-100 border-b border-slate-200 group">
                    <Image src={th.thumbnail} alt={th.name} fill className="object-cover" unoptimized />
                    {th.isActive ? (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-md flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleActivate(th)}
                          className="px-3.5 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold shadow hover:bg-slate-100"
                        >
                          Activate Now
                        </button>
                        <button
                          onClick={() => setPreviewTheme(th)}
                          className="px-3.5 py-1.5 bg-slate-900/90 text-white rounded-lg text-xs font-semibold shadow hover:bg-black"
                        >
                          Preview
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-900 text-base">{th.name}</h3>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        v{th.version}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">{th.description}</p>

                    <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
                      <span>Author: {th.author}</span>
                      {th.isSystem && (
                        <span className="flex items-center gap-1 text-indigo-600 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>System</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/themes/customize?id=${th.id}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1"
                    >
                      <Paintbrush className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Customize</span>
                    </Link>

                    <button
                      onClick={() => setPreviewTheme(th)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {!th.isActive && (
                      <button
                        onClick={() => handleActivate(th)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
                      >
                        Activate
                      </button>
                    )}

                    {!th.isSystem && !th.isActive && (
                      <button
                        onClick={() => handleDelete(th)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete uploaded theme"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UPLOAD THEME MODAL (Shopify ZIP upload matching requirement) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileArchive className="w-4 h-4 text-indigo-600" />
                <span>Upload New Theme (ZIP)</span>
              </h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
              {/* Drop area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-xl p-6 text-center cursor-pointer bg-indigo-50/30 transition flex flex-col items-center justify-center gap-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".zip"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                {uploadFile ? (
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">{uploadFile.name}</span>
                    <span className="text-xs text-slate-500">{(uploadFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                ) : (
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">Choose a .zip theme file</span>
                    <span className="text-xs text-slate-400">or click to browse your computer</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Theme Display Name</label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g. Minimalist Summer Edition"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Author / Studio</label>
                <input
                  type="text"
                  value={uploadAuthor}
                  onChange={(e) => setUploadAuthor(e.target.value)}
                  placeholder="e.g. DesignStudios"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="Short description of this theme package"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {isUploading ? "Uploading & Extracting..." : "Install Theme"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL SCREEN LIVE PREVIEW MODAL */}
      {previewTheme && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/90 backdrop-blur-md animate-in fade-in">
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="font-bold text-base">{previewTheme.name}</span>
              <span className="text-xs font-mono text-slate-400">v{previewTheme.version}</span>
              {previewTheme.isActive && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">
                  Active Live
                </span>
              )}
            </div>

            {/* Device switcher */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 rounded transition ${
                  previewDevice === "desktop" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
                title="Desktop View (100%)"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice("tablet")}
                className={`p-1.5 rounded transition ${
                  previewDevice === "tablet" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
                title="Tablet View (768px)"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={`p-1.5 rounded transition ${
                  previewDevice === "mobile" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
                title="Mobile View (375px)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/admin/themes/customize?id=${previewTheme.id}`}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <Paintbrush className="w-3.5 h-3.5" />
                <span>Customize</span>
              </Link>
              <button
                onClick={() => setPreviewTheme(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Frame container */}
          <div className="flex-1 overflow-auto flex justify-center p-4">
            <div
              className={`bg-white rounded-xl shadow-2xl transition-all duration-300 overflow-hidden border border-slate-700 ${
                previewDevice === "desktop"
                  ? "w-full max-w-6xl h-full"
                  : previewDevice === "tablet"
                  ? "w-[768px] h-full"
                  : "w-[380px] h-full"
              }`}
            >
              <iframe
                src={`/?themePreview=${previewTheme.id}`}
                className="w-full h-full border-0"
                title="Theme Live Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
