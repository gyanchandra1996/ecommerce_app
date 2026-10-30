"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Send,
  Sparkles,
  Smartphone,
  Tag,
  CheckCircle2,
  Clock,
  Layers,
  Flame,
  Gift,
  Package,
  AlertTriangle,
  RefreshCw,
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
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Form State
  const [title, setTitle] = useState("🔥 Flash Deal: 50% OFF Festive Mega Sale");
  const [body, setBody] = useState("Limited time offer on smartphones and sneakers. Grab yours before stocks run out!");
  const [category, setCategory] = useState<"deal" | "offer" | "order" | "system">("deal");
  const [badge, setBadge] = useState("50% OFF");
  const [icon, setIcon] = useState("🔥");
  const [actionUrl, setActionUrl] = useState("/(tabs)/deals");
  const [actionText, setActionText] = useState("View Deal");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setNotifications(json.data);
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

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
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
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMessage({
          success: true,
          text: `Notification dispatched successfully! (Push broadcasted to ${json.pushSentCount || 0} active devices)`,
        });
        fetchNotifications();
      } else {
        setStatusMessage({ success: false, text: json.error || "Failed to send notification." });
      }
    } catch (err: any) {
      setStatusMessage({ success: false, text: err.message || "Network error while sending notification." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-6 rounded-2xl text-white shadow-xl shadow-blue-500/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">
              <Bell className="w-5 h-5 text-white" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Mobile App Marketing
            </span>
          </div>
          <h1 className="text-2xl font-black">Mobile Push & In-App Notifications</h1>
          <p className="text-blue-100 text-xs mt-1 max-w-xl">
            Send real-time deals, discount offers, and announcements directly to users&apos; mobile devices. Notifications instantly show as floating banners and update the header notification bell.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchNotifications}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Grid: Form + Phone Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Send className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-slate-800 text-base">Compose Notification</h2>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Quick Deal Templates
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

          <form onSubmit={handleSendNotification} className="space-y-4">
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
                <div className="flex gap-1.5 items-center">
                  {["🔥", "🎁", "⚡", "🏷️", "📦", "🔔"].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setIcon(em)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-all ${
                        icon === em ? "border-blue-600 bg-blue-50 scale-105" : "border-slate-200 hover:bg-slate-50"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Action Link</label>
                <select
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="/(tabs)/deals">/(tabs)/deals - Hot Deals Tab</option>
                  <option value="/(tabs)/cart">/(tabs)/cart - Customer Cart</option>
                  <option value="/(tabs)">/(tabs) - Home Storefront</option>
                  <option value="/orders">/orders - Customer Orders</option>
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

            {/* Status Message */}
            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  statusMessage.success
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {statusMessage.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              {isSending ? "Broadcasting to Mobile App..." : "Send Broadcast Notification to Mobile"}
            </button>
          </form>
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

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-800 text-sm">Notification Broadcast History</h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {notifications.length} Sent Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Notification</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Badge</th>
                <th className="py-2.5 px-3">Action Target</th>
                <th className="py-2.5 px-3">Sent Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {notifications.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{n.icon || "🔔"}</span>
                      <div>
                        <div className="font-bold text-slate-800">{n.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{n.body}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {n.category}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {n.badge ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-700">
                        {n.badge}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[10px] text-slate-500">{n.actionUrl || "-"}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px]">
                    {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
