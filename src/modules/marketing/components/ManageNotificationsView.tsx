"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Send,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Radio,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Power,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  ArrowDown,
  Layers,
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  category: "deal" | "offer" | "order" | "system";
  badge?: string;
  icon?: string;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  isRead?: boolean;
  isActive?: boolean;
}

interface NotificationSettings {
  notificationsEnabled: boolean;
  allowDeals: boolean;
  allowOffers: boolean;
  allowOrders: boolean;
  allowSystem: boolean;
  updatedAt: string;
}

const PRESET_TEMPLATES = [
  {
    label: "🔥 50% OFF Mega Sale",
    title: "🔥 Flash Deal: 50% OFF Mega Festive Sale",
    body: "Huge discounts on top electronics, sneakers & fashion. Grab yours now!",
    category: "deal" as const,
    badge: "50% OFF",
    icon: "🔥",
    actionUrl: "/(tabs)/deals",
  },
  {
    label: "🎁 Flat ₹200 OFF Coupon",
    title: "🎁 Special Offer: Flat ₹200 OFF on Orders Above ₹999",
    body: "Use promo code FESTIVE200 at checkout. Valid till tonight midnight!",
    category: "offer" as const,
    badge: "FLAT ₹200",
    icon: "🎁",
    actionUrl: "/(tabs)/cart",
  },
  {
    label: "⚡ Nike Sneakers Drop",
    title: "⚡ Trending Deal: Nike Air Max 270 React In Stock",
    body: "Exclusive price drop on popular running shoes. Limited stocks left!",
    category: "deal" as const,
    badge: "TRENDING",
    icon: "⚡",
    actionUrl: "/products/prod_nike_af1",
  },
  {
    label: "📦 Free Express Delivery",
    title: "📦 Free Express Delivery All Over India",
    body: "Enjoy ₹0 shipping charges on all orders today. Secured with Razorpay.",
    category: "system" as const,
    badge: "FREE SHIPPING",
    icon: "📦",
    actionUrl: "/(tabs)",
  },
];

export function ManageNotificationsView() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    notificationsEnabled: true,
    allowDeals: true,
    allowOffers: true,
    allowOrders: true,
    allowSystem: true,
    updatedAt: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isPushingAll, setIsPushingAll] = useState(false);
  const [isTogglingMaster, setIsTogglingMaster] = useState(false);
  const [pushingRowId, setPushingRowId] = useState<string | null>(null);
  const [togglingRowId, setTogglingRowId] = useState<string | null>(null);
  const [deletingRowId, setDeletingRowId] = useState<string | null>(null);
  const [registeredDevices, setRegisteredDevices] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ success: boolean; text: string } | null>(null);

  const composerRef = useRef<HTMLDivElement>(null);

  // Form State
  const [title, setTitle] = useState("🔥 Flash Deal: 50% OFF Festive Mega Sale");
  const [body, setBody] = useState("Limited time offer on smartphones and sneakers. Grab yours before stocks run out!");
  const [category, setCategory] = useState<"deal" | "offer" | "order" | "system">("deal");
  const [badge, setBadge] = useState("50% OFF");
  const [icon, setIcon] = useState("🔥");
  const [actionUrl, setActionUrl] = useState("/(tabs)/deals");
  const [actionText, setActionText] = useState("View Deal");
  const [formIsActive, setFormIsActive] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setNotifications(json.data);
      }
      if (json.settings) {
        setSettings(json.settings);
      }

      // Fetch active device count
      const devRes = await fetch("/api/notifications/register");
      const devJson = await devRes.json();
      if (devJson.success && typeof devJson.totalRegistered === "number") {
        setRegisteredDevices(devJson.totalRegistered);
      }
    } catch (e) {
      console.error("Failed to load notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleApplyPreset = (t: typeof PRESET_TEMPLATES[0]) => {
    setTitle(t.title);
    setBody(t.body);
    setCategory(t.category);
    setBadge(t.badge);
    setIcon(t.icon);
    setActionUrl(t.actionUrl);
  };

  const scrollToComposer = () => {
    if (composerRef.current) {
      composerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // 1. Toggle Master Push Notifications ON / OFF (Backend global switch)
  const handleToggleMasterNotifications = async () => {
    try {
      setIsTogglingMaster(true);
      setStatusMessage(null);
      const nextState = !settings.notificationsEnabled;

      const res = await fetch("/api/notifications/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationsEnabled: nextState }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setSettings(json.data);
        setStatusMessage({
          success: true,
          text: nextState
            ? "✅ Push Notifications turned ON globally! Mobile devices will receive alerts."
            : "⏸️ Push Notifications turned OFF globally! Push alerts are now paused across the backend.",
        });
      } else {
        setStatusMessage({ success: false, text: json.error || "Failed to update notification settings." });
      }
    } catch (err: any) {
      setStatusMessage({ success: false, text: err.message || "Failed to toggle master switch." });
    } finally {
      setIsTogglingMaster(false);
    }
  };

  // 2. Toggle Individual Notification ON / OFF (Row switch)
  const handleToggleNotificationStatus = async (notif: NotificationItem) => {
    try {
      setTogglingRowId(notif.id);
      setStatusMessage(null);
      const nextActive = notif.isActive === false ? true : false;

      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: notif.id,
          isActive: nextActive,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setNotifications((prev) =>
          prev.map((item) => (item.id === notif.id ? { ...item, isActive: nextActive } : item))
        );
        setStatusMessage({
          success: true,
          text: `Notification "${notif.title.substring(0, 25)}..." is now turned ${nextActive ? "ON (Active)" : "OFF (Inactive)"}.`,
        });
      } else {
        setStatusMessage({ success: false, text: json.error || "Failed to toggle status." });
      }
    } catch (err: any) {
      setStatusMessage({ success: false, text: err.message || "Failed to update notification." });
    } finally {
      setTogglingRowId(null);
    }
  };

  // 3. Delete Notification
  const handleDeleteNotification = async (notifId: string) => {
    if (!window.confirm("Are you sure you want to remove this notification?")) return;
    try {
      setDeletingRowId(notifId);
      setStatusMessage(null);

      const res = await fetch(`/api/notifications?id=${encodeURIComponent(notifId)}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (json.success) {
        setNotifications((prev) => prev.filter((item) => item.id !== notifId));
        setSelectedIds((prev) => prev.filter((id) => id !== notifId));
        setStatusMessage({ success: true, text: "Notification deleted successfully." });
      } else {
        setStatusMessage({ success: false, text: json.error || "Failed to delete notification." });
      }
    } catch (err: any) {
      setStatusMessage({ success: false, text: err.message || "Failed to delete notification." });
    } finally {
      setDeletingRowId(null);
    }
  };

  // 4. Send or Save New Notification
  const handleCreateNotification = async (broadcastPush: boolean) => {
    if (!title.trim()) {
      setStatusMessage({ success: false, text: "Notification title is required." });
      return;
    }

    try {
      setIsSending(true);
      setStatusMessage(null);

      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          category,
          badge,
          icon,
          actionUrl,
          actionText,
          isActive: formIsActive,
          broadcastPush,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMessage({
          success: true,
          text: json.message || "Notification created successfully!",
        });
        fetchNotifications();
      } else {
        setStatusMessage({ success: false, text: json.error || "Failed to create notification." });
      }
    } catch (err: any) {
      setStatusMessage({ success: false, text: err.message || "Network error while saving notification." });
    } finally {
      setIsSending(false);
    }
  };

  // 5. Broadcast All Active Notifications
  const handlePushAllNotifications = async () => {
    if (!settings.notificationsEnabled) {
      setStatusMessage({
        success: false,
        text: "Cannot broadcast: Push notifications are currently turned OFF globally. Turn Master Switch ON first.",
      });
      return;
    }

    try {
      setIsPushingAll(true);
      setStatusMessage(null);

      const res = await fetch("/api/notifications/broadcast-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMessage({
          success: true,
          text: `✅ ${json.message || `All active notifications pushed to mobile devices!`}`,
        });
        fetchNotifications();
      } else {
        setStatusMessage({ success: false, text: json.error || "Failed to broadcast notifications." });
      }
    } catch (err: any) {
      setStatusMessage({ success: false, text: err.message || "Error broadcasting notifications." });
    } finally {
      setIsPushingAll(false);
    }
  };

  // 6. Push Selected Notifications
  const handlePushSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsPushingAll(true);
      setStatusMessage(null);

      const res = await fetch("/api/notifications/broadcast-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: selectedIds, force: true }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMessage({
          success: true,
          text: `✅ Successfully pushed ${selectedIds.length} selected notifications to mobile devices!`,
        });
        setSelectedIds([]);
        fetchNotifications();
      } else {
        setStatusMessage({ success: false, text: json.error || "Failed to push selected notifications." });
      }
    } catch (err: any) {
      setStatusMessage({ success: false, text: err.message || "Error pushing selected notifications." });
    } finally {
      setIsPushingAll(false);
    }
  };

  // 7. Re-push Single Notification
  const handlePushSingleRow = async (notifId: string) => {
    try {
      setPushingRowId(notifId);
      setStatusMessage(null);

      const res = await fetch("/api/notifications/broadcast-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [notifId], force: true }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMessage({
          success: true,
          text: "Notification pushed to mobile app successfully!",
        });
      } else {
        setStatusMessage({ success: false, text: json.error || "Failed to push notification." });
      }
    } catch (err: any) {
      setStatusMessage({ success: false, text: err.message || "Error pushing notification." });
    } finally {
      setPushingRowId(null);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner with MASTER ON/OFF SWITCH & ADD NEW ACTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-6 rounded-2xl text-white shadow-xl shadow-blue-500/10">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">
              <Bell className="w-5 h-5 text-white" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Mobile App Push Center
            </span>

            {/* Devices Pill */}
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {registeredDevices} Mobile Devices Registered
            </span>

            {/* Master Status Badge */}
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border flex items-center gap-1.5 ${
                settings.notificationsEnabled
                  ? "bg-emerald-500/30 text-emerald-200 border-emerald-400/40"
                  : "bg-amber-500/30 text-amber-200 border-amber-400/40"
              }`}
            >
              <Power className="w-3 h-3" />
              Backend Push Service: {settings.notificationsEnabled ? "ACTIVE (ON)" : "PAUSED (OFF)"}
            </span>
          </div>

          <h1 className="text-2xl font-black">Mobile Push & In-App Notifications</h1>
          <p className="text-blue-100 text-xs mt-1 max-w-xl">
            Broadcast flash deals, discount vouchers, and system notices. Turn push alerts ON or OFF globally, or toggle specific notifications anytime.
          </p>
        </div>

        {/* Master Controls & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* MASTER ON/OFF TOGGLE BUTTON */}
          <button
            type="button"
            onClick={handleToggleMasterNotifications}
            disabled={isTogglingMaster}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all border shadow-lg ${
              settings.notificationsEnabled
                ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400/40 shadow-emerald-600/30"
                : "bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-400/40 shadow-black/40"
            }`}
            title="Click to toggle push notifications ON or OFF globally"
          >
            {settings.notificationsEnabled ? (
              <>
                <ToggleRight className="w-5 h-5 text-emerald-200" />
                <span>Push Service: ON</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5 text-amber-400" />
                <span>Push Service: OFF (Paused)</span>
              </>
            )}
          </button>

          {/* Quick Scroll to Add New Notification */}
          <button
            type="button"
            onClick={scrollToComposer}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-900 hover:bg-blue-50 active:scale-95 font-extrabold rounded-xl text-xs transition-all shadow-lg"
          >
            <Plus className="w-4 h-4 text-blue-600 font-black" />
            + Add New Notification
          </button>

          {/* Broadcast All */}
          <button
            type="button"
            onClick={handlePushAllNotifications}
            disabled={isPushingAll || notifications.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-teal-500/25 disabled:opacity-60"
          >
            <Radio className={`w-4 h-4 ${isPushingAll ? "animate-spin" : "animate-pulse"}`} />
            {isPushingAll ? "Pushing..." : `📢 Broadcast All (${notifications.filter((n) => n.isActive !== false).length})`}
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchNotifications}
            className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Global Status Message */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 shadow-sm ${
            statusMessage.success
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Notice if Master Switch is OFF */}
      {!settings.notificationsEnabled && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Push Notifications are currently PAUSED (OFF) globally.</span>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Saved notifications remain in database, but loud mobile push alerts are suppressed. Click &quot;Push Service: OFF&quot; above to re-activate.
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleMasterNotifications}
            disabled={isTogglingMaster}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition-all"
          >
            Turn ON
          </button>
        </div>
      )}

      {/* Main Grid: Add New Form + Phone Preview */}
      <div ref={composerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-800 text-base">Add New Notification</h2>
                <p className="text-xs text-slate-500">Create, customize, and broadcast a deal or system notice to mobile apps.</p>
              </div>
            </div>

            {/* Form Status Toggle (ON / OFF for new item) */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">Status:</span>
              <button
                type="button"
                onClick={() => setFormIsActive(!formIsActive)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold transition-all border ${
                  formIsActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : "bg-slate-100 text-slate-500 border-slate-300"
                }`}
              >
                {formIsActive ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Active (ON)
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Draft (OFF)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Quick 1-Click Templates
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(tmpl)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-xs font-medium text-slate-700 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Notification Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🔥 Flash Deal: 50% OFF Nike Shoes"
                className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Message Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                placeholder="Write offer details, promo codes, or urgency messages..."
                className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Row: Category + Badge + Icon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="deal">🔥 Deals</option>
                  <option value="offer">🎁 Offers & Coupons</option>
                  <option value="order">📦 Order Updates</option>
                  <option value="system">🔔 System Alerts</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. 50% OFF, FLAT ₹200"
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emoji Icon</label>
                <div className="flex gap-1.5 items-center flex-wrap">
                  {["🔥", "🎁", "⚡", "🏷️", "📦", "🔔", "🚀", "💎"].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setIcon(em)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm border transition-all ${
                        icon === em ? "border-blue-600 bg-blue-50 scale-110 shadow-sm" : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action URL & Action Text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Action Link (Deep Link)</label>
                <select
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="/(tabs)/deals">/(tabs)/deals - Hot Deals Tab</option>
                  <option value="/(tabs)/cart">/(tabs)/cart - Customer Cart</option>
                  <option value="/(tabs)">/(tabs) - Home Storefront</option>
                  <option value="/orders">/orders - Customer Orders</option>
                  <option value="/(tabs)/wishlist">/(tabs)/wishlist - Saved Items</option>
                  <option value="/products/prod_s24_ultra">/products/prod_s24_ultra - Galaxy S24 Ultra</option>
                  <option value="/products/prod_nike_af1">/products/prod_nike_af1 - Air Max Shoe</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Button Text</label>
                <input
                  type="text"
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder="e.g. View Deal, Claim Now"
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Action Buttons: Broadcast Push OR Save In-App */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleCreateNotification(true)}
                disabled={isSending}
                className="py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {isSending ? "Dispatching..." : "Send & Broadcast Push Alert"}
              </button>

              <button
                type="button"
                onClick={() => handleCreateNotification(false)}
                disabled={isSending}
                className="py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Layers className="w-4 h-4 text-slate-500" />
                Save Without Loud Push
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Smartphone Preview (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-6 text-white shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
          <div className="text-center mb-4">
            <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider">
              Live Phone Preview
            </span>
            <p className="text-slate-400 text-xs mt-1">This is how your alert appears in the mobile app</p>
          </div>

          {/* Smartphone Mockup */}
          <div className="w-full max-w-[310px] bg-slate-900 border-4 border-slate-700 rounded-[32px] p-3 shadow-2xl relative">
            {/* Top Speaker / Notch */}
            <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3" />

            {/* Mock Header */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="text-xs font-black text-white">e-Shop</span>
              <div className="relative">
                <Bell className="w-4 h-4 text-slate-300" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-slate-900" />
              </div>
            </div>

            {/* Floating Banner Mock */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3 shadow-lg mb-4 animate-in slide-in-from-top duration-300">
              <div className="flex items-start gap-2.5">
                <span className="text-xl">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-black text-white truncate">{title || "Deal Title"}</span>
                    {badge && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-500 text-white shrink-0">
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-300 line-clamp-2 leading-relaxed">
                    {body || "Offer message will show here..."}
                  </p>
                  <div className="mt-2 text-[9px] font-bold text-blue-400 flex items-center gap-1">
                    <span>{actionText || "View Deal"}</span>
                    <span>&rarr;</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Store Feed Mock */}
            <div className="space-y-2 opacity-30 pointer-events-none">
              <div className="h-20 bg-slate-800 rounded-xl" />
              <div className="h-10 bg-slate-800 rounded-xl" />
              <div className="h-10 bg-slate-800 rounded-xl" />
            </div>

            {/* Home indicator bar */}
            <div className="w-20 h-1 bg-slate-600 rounded-full mx-auto mt-4" />
          </div>
        </div>
      </div>

      {/* History Table with Row-Level ON / OFF Switch */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-800 text-sm">Manage & Broadcast Notifications</h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
              {notifications.length} Total ({notifications.filter((n) => n.isActive !== false).length} Active)
            </span>
          </div>

          {/* Table Actions: Push Selected + Add New */}
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handlePushSelected}
                disabled={isPushingAll}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                Push Selected ({selectedIds.length})
              </button>
            )}

            <button
              type="button"
              onClick={scrollToComposer}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 font-bold" />
              New
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3 w-8">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    {selectedIds.length > 0 && selectedIds.length === notifications.length ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-2.5 px-3">Notification</th>
                <th className="py-2.5 px-3 text-center">Status (ON/OFF)</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Badge</th>
                <th className="py-2.5 px-3">Action Target</th>
                <th className="py-2.5 px-3">Created</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {notifications.map((n) => {
                const isSelected = selectedIds.includes(n.id);
                const isActive = n.isActive !== false;
                const isTogglingThis = togglingRowId === n.id;
                const isDeletingThis = deletingRowId === n.id;

                return (
                  <tr
                    key={n.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isSelected ? "bg-blue-50/40" : ""
                    } ${!isActive ? "opacity-60 bg-slate-50/50" : ""}`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => toggleSelectOne(n.id)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Notification Title & Body */}
                    <td className="py-3 px-3 max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{n.icon || "🔔"}</span>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 truncate">{n.title}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{n.body}</div>
                        </div>
                      </div>
                    </td>

                    {/* STATUS TOGGLE (ON / OFF SWITCH) */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleNotificationStatus(n)}
                        disabled={isTogglingThis}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all border ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200"
                        }`}
                        title={isActive ? "Click to turn OFF (Mute this notification)" : "Click to turn ON (Activate)"}
                      >
                        {isTogglingThis ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
                        ) : isActive ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            ON
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            OFF
                          </>
                        )}
                      </button>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {n.category}
                      </span>
                    </td>

                    {/* Badge */}
                    <td className="py-3 px-3">
                      {n.badge ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-700">
                          {n.badge}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Action Target */}
                    <td className="py-3 px-3">
                      <span className="font-mono text-[10px] text-slate-500">{n.actionUrl || "-"}</span>
                    </td>

                    {/* Created Time */}
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(n.createdAt).toLocaleDateString()}{" "}
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>

                    {/* Actions: Re-Push + Delete */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handlePushSingleRow(n.id)}
                          disabled={pushingRowId === n.id}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-[11px] font-bold text-slate-700 hover:text-blue-600 transition-all inline-flex items-center gap-1 disabled:opacity-50"
                          title="Re-push to active mobile devices"
                        >
                          <Radio className={`w-3 h-3 ${pushingRowId === n.id ? "animate-spin" : ""}`} />
                          {pushingRowId === n.id ? "Pushing..." : "Push"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteNotification(n.id)}
                          disabled={isDeletingThis}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
