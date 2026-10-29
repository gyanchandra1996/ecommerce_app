"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Globe,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Clock,
  Mail,
  Sliders,
  Save,
  Check,
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Info,
  ExternalLink,
  MessageSquare,
  Star,
  Layers,
  Sparkles,
  KeyRound,
  LogIn,
} from "lucide-react";
import { SiteSettingsRecord, FooterLinkItem, SocialAuthSettings } from "@/core/db/store";

export function AllSettingsView() {
  const [settings, setSettings] = useState<SiteSettingsRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Top Tabs
  const [activeMainTab, setActiveMainTab] = useState<
    "config" | "social" | "qna" | "reviews" | "oauth"
  >("config");

  // OAuth Settings State (Stored in Setting table with context = "auth_oauth")
  const [oauthSettings, setOauthSettings] = useState<SocialAuthSettings | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [oauthSaving, setOauthSaving] = useState(false);

  // Secondary Configuration Pill Tabs (matching screenshot)
  const [activeSubTab, setActiveSubTab] = useState<
    | "general"
    | "footer_nav"
    | "auto_cancel"
    | "rma"
    | "share"
    | "handling"
    | "other"
    | "checkout"
  >("general");

  // Add / Edit Footer Link Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<FooterLinkItem | null>(null);
  const [linkFormData, setLinkFormData] = useState({
    label: "",
    url: "",
    section: "shop" as "shop" | "customer_service" | "about" | "legal",
    displayOrder: 1,
    isActive: true,
  });

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (json.success && json.data) {
        setSettings(json.data);
      }
    } catch {
      showNotification("error", "Failed to load site settings.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOauthSettings = async () => {
    try {
      setOauthLoading(true);
      const res = await fetch("/api/settings/auth/oauth");
      const json = await res.json();
      if (json.success && json.data) {
        setOauthSettings(json.data);
      }
    } catch {
      showNotification("error", "Failed to load OAuth settings.");
    } finally {
      setOauthLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchOauthSettings();
  }, []);

  const handleSaveOauth = async () => {
    if (!oauthSettings) return;
    try {
      setOauthSaving(true);
      const res = await fetch("/api/settings/auth/oauth", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(oauthSettings),
      });
      const json = await res.json();
      if (json.success) {
        showNotification("success", "OAuth and Social Login settings saved to Setting table (context: auth_oauth)!");
      } else {
        showNotification("error", json.error || "Failed to save OAuth settings.");
      }
    } catch {
      showNotification("error", "Failed to save OAuth settings.");
    } finally {
      setOauthSaving(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        setSettings(json.data);
        showNotification("success", "Settings saved successfully!");
      } else {
        showNotification("error", json.error || "Failed to save settings.");
      }
    } catch {
      showNotification("error", "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // Arrange / Reorder Footer Links
  const moveLink = (index: number, direction: "up" | "down") => {
    if (!settings) return;
    const links = [...settings.footerLinks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    // Swap items
    const temp = links[index];
    links[index] = links[targetIndex];
    links[targetIndex] = temp;

    // Update display orders based on new positions
    links.forEach((l, idx) => {
      l.displayOrder = idx + 1;
    });

    setSettings({
      ...settings,
      footerLinks: links,
    });
  };

  const openAddLinkModal = () => {
    if (!settings) return;
    setEditingLink(null);
    setLinkFormData({
      label: "",
      url: "/#deals",
      section: "shop",
      displayOrder: (settings.footerLinks?.length || 0) + 1,
      isActive: true,
    });
    setIsLinkModalOpen(true);
  };

  const openEditLinkModal = (link: FooterLinkItem) => {
    setEditingLink(link);
    setLinkFormData({
      label: link.label,
      url: link.url,
      section: link.section,
      displayOrder: link.displayOrder,
      isActive: link.isActive,
    });
    setIsLinkModalOpen(true);
  };

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    if (!linkFormData.label.trim() || !linkFormData.url.trim()) {
      showNotification("error", "Label and URL are required.");
      return;
    }

    let updatedLinks = [...settings.footerLinks];
    if (editingLink) {
      updatedLinks = updatedLinks.map((l) =>
        l.id === editingLink.id ? { ...l, ...linkFormData } : l
      );
    } else {
      updatedLinks.push({
        id: "fl_" + Math.random().toString(36).substring(2, 8),
        ...linkFormData,
      });
    }

    setSettings({
      ...settings,
      footerLinks: updatedLinks,
    });
    setIsLinkModalOpen(false);
    showNotification("success", `Footer link ${editingLink ? "updated" : "added"}. Click Save to apply.`);
  };

  const handleDeleteLink = (id: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      footerLinks: settings.footerLinks.filter((l) => l.id !== id),
    });
    showNotification("success", "Link removed. Click Save to apply.");
  };

  if (loading || !settings) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Loading All Settings...
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-16 font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-xl text-white font-medium text-xs animate-in slide-in-from-top-3 ${
            notification.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {notification.type === "success" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">All Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">Settings/All Settings</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Preview Storefront</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Primary Top Tab Bar matching screenshot */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="flex items-center border-b border-slate-100 px-4 pt-3 overflow-x-auto scrollbar-none gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveMainTab("config")}
            className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeMainTab === "config"
                ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Configuration Settings
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab("social")}
            className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeMainTab === "social"
                ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Social Pages
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab("qna")}
            className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeMainTab === "qna"
                ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            User Q&amp;A Configuration
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab("reviews")}
            className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeMainTab === "reviews"
                ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Review Configuration
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMainTab("oauth");
              if (!oauthSettings) fetchOauthSettings();
            }}
            className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
              activeMainTab === "oauth"
                ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-blue-600" />
            <span>OAuth &amp; Social Login</span>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold ml-1">
              context: auth_oauth
            </span>
          </button>
        </div>

        {/* ================= TAB 1: CONFIGURATION SETTINGS ================= */}
        {activeMainTab === "config" && (
          <div className="p-5 space-y-6">
            {/* Secondary Pill Tabs matching screenshot */}
            <div className="flex items-center flex-wrap gap-2 text-[11px] font-black uppercase tracking-wider border-b border-slate-100 pb-4">
              <button
                type="button"
                onClick={() => setActiveSubTab("general")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeSubTab === "general"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                GENERAL SETTINGS
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab("footer_nav")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1 ${
                  activeSubTab === "footer_nav"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>DYNAMIC FOOTER &amp; ARRANGE</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab("auto_cancel")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeSubTab === "auto_cancel"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                AUTO CANCEL
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab("rma")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeSubTab === "rma"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                MERCHANDISE RETURN (RMA) OPTIONS
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab("share")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeSubTab === "share"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                SHARE PRODUCT
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab("handling")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeSubTab === "handling"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                HANDLING CHARGE
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab("other")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeSubTab === "other"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                OTHER SETTINGS
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab("checkout")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeSubTab === "checkout"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                CHECKOUT SETTINGS
              </button>
            </div>

            {/* Sub-Tab: GENERAL SETTINGS matching screenshot 3-column grid */}
            {activeSubTab === "general" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                  {/* Dynamic Theme Name (user requirement) */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Storefront Theme / Brand Name :*
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.themeName}
                      onChange={(e) => setSettings({ ...settings, themeName: e.target.value })}
                      placeholder="e.g. emox, Tagateway, etc."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Controls the top navigation logo and brand header across the storefront
                    </span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Storefront Page Title :*
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.siteTitle}
                      onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Tagline / Slogan :
                    </label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Row 2 */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Number of Mails for Execution :*
                    </label>
                    <input
                      type="number"
                      value={settings.numberOfMailsForExecution}
                      onChange={(e) => setSettings({ ...settings, numberOfMailsForExecution: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Select Time Zone :*
                    </label>
                    <select
                      value={settings.timeZone}
                      onChange={(e) => setSettings({ ...settings, timeZone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="America/New_York">America/New_York</option>
                      <option value="Asia/Dubai">Asia/Dubai (UAE Standard Time)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC (Universal)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Default Currency :*
                    </label>
                    <select
                      value={settings.defaultCurrency}
                      onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                    >
                      <option value="AED">AED (United Arab Emirates Dirham)</option>
                      <option value="USD">USD (United States Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="SAR">SAR (Saudi Riyal)</option>
                      <option value="INR">INR (Indian Rupee)</option>
                    </select>
                  </div>

                  {/* Row 3 */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Frequency for Review Feed Cron (in days):*
                    </label>
                    <input
                      type="number"
                      value={settings.reviewFeedCronDays}
                      onChange={(e) => setSettings({ ...settings, reviewFeedCronDays: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Frequency for Google Merchant Cron :*
                    </label>
                    <input
                      type="number"
                      value={settings.googleMerchantCronDays}
                      onChange={(e) => setSettings({ ...settings, googleMerchantCronDays: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Frequency for Mail Per Execution :*
                    </label>
                    <input
                      type="number"
                      value={settings.mailPerExecutionFrequency}
                      onChange={(e) => setSettings({ ...settings, mailPerExecutionFrequency: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Row 4 */}
                  <div>
                    <label className="font-semibold text-slate-700 flex items-center justify-between mb-1">
                      <span>Number of Unpaid Order Email (one everyday) :*</span>
                      <Info className="w-3.5 h-3.5 text-blue-500" />
                    </label>
                    <input
                      type="number"
                      value={settings.unpaidOrderEmailDailyCount}
                      onChange={(e) => setSettings({ ...settings, unpaidOrderEmailDailyCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 flex items-center justify-between mb-1">
                      <span>Unique Title:*</span>
                      <Info className="w-3.5 h-3.5 text-blue-500" />
                    </label>
                    <input
                      type="text"
                      value={settings.uniqueTitle}
                      onChange={(e) => setSettings({ ...settings, uniqueTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Number of Sms for Execution :*
                    </label>
                    <input
                      type="number"
                      value={settings.numberOfSmsForExecution}
                      onChange={(e) => setSettings({ ...settings, numberOfSmsForExecution: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Row 5 */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Order Prefix :*
                    </label>
                    <input
                      type="text"
                      value={settings.orderPrefix}
                      onChange={(e) => setSettings({ ...settings, orderPrefix: e.target.value })}
                      placeholder="e.g. tags, emox"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Unpaid Order Email Time Lapse (in minutes) :*
                    </label>
                    <input
                      type="number"
                      value={settings.unpaidOrderEmailTimeLapseMinutes}
                      onChange={(e) => setSettings({ ...settings, unpaidOrderEmailTimeLapseMinutes: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 flex items-center justify-between mb-1">
                      <span>Alternate Title:</span>
                      <Info className="w-3.5 h-3.5 text-blue-500" />
                    </label>
                    <input
                      type="text"
                      value={settings.alternateTitle}
                      onChange={(e) => setSettings({ ...settings, alternateTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Row 6: Toggles & Location */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Header Delivery Location Text :
                    </label>
                    <input
                      type="text"
                      value={settings.deliveryLocation}
                      onChange={(e) => setSettings({ ...settings, deliveryLocation: e.target.value })}
                      placeholder="e.g. Delivering to Dubai"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Support Contact Email :
                    </label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Support Phone Number :
                    </label>
                    <input
                      type="text"
                      value={settings.supportPhone}
                      onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="pt-4 border-t border-slate-100 flex items-center space-x-8">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailVerificationEnabled}
                      onChange={(e) => setSettings({ ...settings, emailVerificationEnabled: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Email Verification Enable</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.debugModeEnabled}
                      onChange={(e) => setSettings({ ...settings, debugModeEnabled: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Debug Mode Enable</span>
                  </label>
                </div>
              </div>
            )}

            {/* Sub-Tab: DYNAMIC FOOTER & ARRANGE (User Requirement) */}
            {activeSubTab === "footer_nav" && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 flex items-start space-x-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Dynamic Footer Arrangement:</strong> Manage footer text and customize links under each column. You can reorder links using the <strong>Move Up (↑) / Move Down (↓)</strong> buttons.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Footer Brand About Text :*
                    </label>
                    <textarea
                      rows={3}
                      value={settings.footerAboutText}
                      onChange={(e) => setSettings({ ...settings, footerAboutText: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Footer Copyright Text :*
                    </label>
                    <textarea
                      rows={3}
                      value={settings.footerCopyrightText}
                      onChange={(e) => setSettings({ ...settings, footerCopyrightText: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                {/* Footer Links Arrangement Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Footer Navigation Links &amp; Columns
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Arrange columns and link display priority on the live storefront footer
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={openAddLinkModal}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Footer Link</span>
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4 w-28 text-center">Arrange</th>
                          <th className="py-2.5 px-4">Link Label</th>
                          <th className="py-2.5 px-4">Target Route / URL</th>
                          <th className="py-2.5 px-4">Column Section</th>
                          <th className="py-2.5 px-4 text-center">Status</th>
                          <th className="py-2.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {settings.footerLinks.map((link, idx) => (
                          <tr key={link.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-2 px-4 text-center">
                              <div className="inline-flex items-center space-x-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => moveLink(idx, "up")}
                                  title="Move Up"
                                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === settings.footerLinks.length - 1}
                                  onClick={() => moveLink(idx, "down")}
                                  title="Move Down"
                                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="py-2 px-4 font-bold text-slate-800">
                              {link.label}
                            </td>
                            <td className="py-2 px-4 font-mono text-[11px] text-blue-600">
                              {link.url}
                            </td>
                            <td className="py-2 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                                {link.section.replace("_", " ")}
                              </span>
                            </td>
                            <td className="py-2 px-4 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  link.isActive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {link.isActive ? "Active" : "Hidden"}
                              </span>
                            </td>
                            <td className="py-2 px-4 text-right">
                              <div className="flex items-center justify-end space-x-1">
                                <button
                                  type="button"
                                  onClick={() => openEditLinkModal(link)}
                                  className="p-1 rounded text-slate-500 hover:text-blue-600 transition"
                                >
                                  Edit
                                </button>
                                <span className="text-slate-200">|</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLink(link.id)}
                                  className="p-1 rounded text-slate-400 hover:text-red-600 transition"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab: AUTO CANCEL */}
            {activeSubTab === "auto_cancel" && (
              <div className="space-y-4 max-w-xl text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Auto Cancel Unpaid Orders After (in Days) :*
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={settings.autoCancelDays}
                    onChange={(e) => setSettings({ ...settings, autoCancelDays: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Pending unpaid orders older than this period will be marked as Cancelled automatically
                  </span>
                </div>
              </div>
            )}

            {/* Sub-Tab: MERCHANDISE RETURN (RMA) OPTIONS */}
            {activeSubTab === "rma" && (
              <div className="space-y-4 max-w-xl text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800">Return &amp; Refund Policy Rules</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span>Allow customer to request return within 14 days of delivery</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span>Require customer to upload photo proof before RMA submission</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span>Notify warehouse manager upon return request creation</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab: SHARE PRODUCT */}
            {activeSubTab === "share" && (
              <div className="space-y-4 max-w-xl text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800">Product Social Sharing Toggles</h4>
                  <div className="space-y-2.5">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span>Enable WhatsApp Quick Share on Product Pages</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span>Enable Facebook &amp; Messenger Share</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span>Enable Twitter / X Share</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab: HANDLING CHARGE */}
            {activeSubTab === "handling" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Standard Handling &amp; Packaging Fee ({settings.defaultCurrency}) :*
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={settings.handlingCharge}
                    onChange={(e) => setSettings({ ...settings, handlingCharge: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Free Shipping Minimum Threshold ({settings.defaultCurrency}) :*
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={settings.freeShippingThreshold}
                    onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Sub-Tab: OTHER SETTINGS */}
            {activeSubTab === "other" && (
              <div className="space-y-4 max-w-xl text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800">Advanced Storefront Engine Options</h4>
                  <div className="space-y-2.5">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span>Enable instant search autocomplete dropdown</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span>Auto-apply active coupon discount codes at checkout</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span>Display real-time stock availability countdown badge</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab: CHECKOUT SETTINGS */}
            {activeSubTab === "checkout" && (
              <div className="space-y-4 max-w-xl text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800">Checkout Flow Settings</h4>
                  <div className="space-y-2.5">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span>Allow Guest Checkout without forcing login</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span>Allow Cash on Delivery (COD) payment option</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span>Send SMS delivery tracking link upon shipment dispatch</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: SOCIAL PAGES ================= */}
        {activeMainTab === "social" && (
          <div className="p-5 space-y-5 text-xs max-w-2xl">
            <h3 className="font-bold text-slate-900 text-sm">Social Media Channels</h3>
            <p className="text-slate-500 text-[11px]">
              These profile links appear directly in your storefront footer and contact pages.
            </p>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Facebook URL</label>
                <input
                  type="url"
                  value={settings.socialLinks?.facebook || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, facebook: e.target.value },
                    })
                  }
                  placeholder="https://facebook.com/yourbrand"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Instagram URL</label>
                <input
                  type="url"
                  value={settings.socialLinks?.instagram || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, instagram: e.target.value },
                    })
                  }
                  placeholder="https://instagram.com/yourbrand"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Twitter / X URL</label>
                <input
                  type="url"
                  value={settings.socialLinks?.twitter || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, twitter: e.target.value },
                    })
                  }
                  placeholder="https://x.com/yourbrand"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">YouTube Channel URL</label>
                <input
                  type="url"
                  value={settings.socialLinks?.youtube || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, youtube: e.target.value },
                    })
                  }
                  placeholder="https://youtube.com/@yourbrand"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={settings.socialLinks?.linkedin || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, linkedin: e.target.value },
                    })
                  }
                  placeholder="https://linkedin.com/company/yourbrand"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: USER Q&A ================= */}
        {activeMainTab === "qna" && (
          <div className="p-5 space-y-4 text-xs max-w-xl">
            <h3 className="font-bold text-slate-900 text-sm">Product Q&amp;A Community Rules</h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>Require admin approval before question is published</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>Allow verified buyers to reply to questions</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>Email customer when their question is answered</span>
              </label>
            </div>
          </div>
        )}

        {/* ================= TAB 4: REVIEWS ================= */}
        {activeMainTab === "reviews" && (
          <div className="p-5 space-y-4 text-xs max-w-xl">
            <h3 className="font-bold text-slate-900 text-sm">Product Customer Reviews Configuration</h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>Only allow customers who purchased this item to write reviews</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>Allow customers to upload review photos</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>Auto-approve 4-star and 5-star verified reviews</span>
              </label>
            </div>
          </div>
        )}

        {/* ================= TAB 5: OAUTH & SOCIAL LOGIN (context: "auth_oauth") ================= */}
        {activeMainTab === "oauth" && (
          <div className="p-6 space-y-6 text-xs max-w-4xl">
            {/* Context Badge Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-900">
                    OAuth &amp; Social Authentication Config
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-600 text-white rounded-md shadow-xs">
                    context = &quot;auth_oauth&quot;
                  </span>
                </div>
                <p className="text-[11px] text-blue-700">
                  Settings are loaded and persisted dynamically from the <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold">setting</code> database table using the unique <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold">context</code> column.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveOauth}
                disabled={oauthSaving || oauthLoading}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition disabled:opacity-50 cursor-pointer shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>{oauthSaving ? "Saving..." : "Save OAuth Settings"}</span>
              </button>
            </div>

            {oauthLoading ? (
              <div className="py-12 text-center text-slate-400">Loading OAuth configuration...</div>
            ) : oauthSettings ? (
              <div className="space-y-6">
                {/* 1. Google OAuth Provider Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Google Sign-In</h4>
                        <p className="text-[11px] text-slate-500">
                          One-click Google authentication for storefront login and checkout
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={oauthSettings.google?.enabled ?? true}
                        onChange={(e) =>
                          setOauthSettings({
                            ...oauthSettings,
                            google: { ...oauthSettings.google, enabled: e.target.checked },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      <span className="ml-2.5 font-bold text-slate-700">
                        {oauthSettings.google?.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </label>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Google Client ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={oauthSettings.google?.clientId || ""}
                          onChange={(e) =>
                            setOauthSettings({
                              ...oauthSettings,
                              google: { ...oauthSettings.google, clientId: e.target.value },
                            })
                          }
                          placeholder="e.g. 123456789-xxxx.apps.googleusercontent.com"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Google Client Secret <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={oauthSettings.google?.clientSecret || ""}
                          onChange={(e) =>
                            setOauthSettings({
                              ...oauthSettings,
                              google: { ...oauthSettings.google, clientSecret: e.target.value },
                            })
                          }
                          placeholder="GOCSPX-••••••••••••••••••••"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Authorized Redirect URI (Copy to Google Cloud Console)
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={typeof window !== "undefined" ? `${window.location.origin}/api/auth/oauth/google/callback` : "/api/auth/oauth/google/callback"}
                        className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-mono text-[11px] select-all cursor-text"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. GitHub OAuth Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">GitHub Authentication</h4>
                        <p className="text-[11px] text-slate-500">Allow users to sign in with their developer GitHub profile</p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={oauthSettings.github?.enabled ?? false}
                        onChange={(e) =>
                          setOauthSettings({
                            ...oauthSettings,
                            github: { ...oauthSettings.github, enabled: e.target.checked },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      <span className="ml-2.5 font-bold text-slate-700">
                        {oauthSettings.github?.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </label>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">GitHub Client ID</label>
                        <input
                          type="text"
                          value={oauthSettings.github?.clientId || ""}
                          onChange={(e) =>
                            setOauthSettings({
                              ...oauthSettings,
                              github: { ...oauthSettings.github, clientId: e.target.value },
                            })
                          }
                          placeholder="Ov23..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">GitHub Client Secret</label>
                        <input
                          type="password"
                          value={oauthSettings.github?.clientSecret || ""}
                          onChange={(e) =>
                            setOauthSettings({
                              ...oauthSettings,
                              github: { ...oauthSettings.github, clientSecret: e.target.value },
                            })
                          }
                          placeholder="••••••••••••••••••••"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Facebook OAuth Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Facebook Login</h4>
                        <p className="text-[11px] text-slate-500">Enable social login via Meta / Facebook accounts</p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={oauthSettings.facebook?.enabled ?? false}
                        onChange={(e) =>
                          setOauthSettings({
                            ...oauthSettings,
                            facebook: { ...oauthSettings.facebook, enabled: e.target.checked },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      <span className="ml-2.5 font-bold text-slate-700">
                        {oauthSettings.facebook?.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </label>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Facebook App ID</label>
                        <input
                          type="text"
                          value={oauthSettings.facebook?.clientId || ""}
                          onChange={(e) =>
                            setOauthSettings({
                              ...oauthSettings,
                              facebook: { ...oauthSettings.facebook, clientId: e.target.value },
                            })
                          }
                          placeholder="e.g. 1092837465..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Facebook App Secret</label>
                        <input
                          type="password"
                          value={oauthSettings.facebook?.appSecret || ""}
                          onChange={(e) =>
                            setOauthSettings({
                              ...oauthSettings,
                              facebook: { ...oauthSettings.facebook, appSecret: e.target.value },
                            })
                          }
                          placeholder="••••••••••••••••••••"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Add / Edit Footer Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">
                {editingLink ? "Edit Footer Link" : "Add Footer Link"}
              </h3>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLink} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Link Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={linkFormData.label}
                  onChange={(e) => setLinkFormData({ ...linkFormData, label: e.target.value })}
                  placeholder="e.g. Track Order, Privacy Policy"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Route / URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={linkFormData.url}
                  onChange={(e) => setLinkFormData({ ...linkFormData, url: e.target.value })}
                  placeholder="e.g. /#deals, /contact, /privacy"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Column Section
                </label>
                <select
                  value={linkFormData.section}
                  onChange={(e) => setLinkFormData({ ...linkFormData, section: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="shop">Shop &amp; Deals Column</option>
                  <option value="customer_service">Customer Service Column</option>
                  <option value="about">About &amp; Company Column</option>
                  <option value="legal">Legal &amp; Consumer Rights Column</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="link_active"
                  checked={linkFormData.isActive}
                  onChange={(e) => setLinkFormData({ ...linkFormData, isActive: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <label htmlFor="link_active" className="font-semibold text-slate-700 cursor-pointer">
                  Show link in storefront footer
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  {editingLink ? "Apply Changes" : "Add Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
