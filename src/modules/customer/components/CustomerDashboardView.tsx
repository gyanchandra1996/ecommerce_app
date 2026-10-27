"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  ShoppingBag,
  ShoppingCart,
  MapPin,
  CreditCard,
  KeyRound,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  LogOut,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
  Building,
  X,
  ArrowLeft,
  Home,
  Copy,
} from "lucide-react";
import { DynamicAddressForm, AddressFormData } from "./DynamicAddressForm";
import { StoreHeader } from "@/modules/storefront/components/StoreHeader";
import { StoreFooter } from "@/modules/storefront/components/StoreFooter";
import { useCart } from "@/modules/cart/context/CartContext";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  mobileNumber?: string;
  countryCode?: string;
  credit: number;
  addresses: any[];
}

interface OrderData {
  id: string;
  orderNumber: string;
  orderDate: string;
  gateway: string;
  paymentStatus: string;
  orderStatus: string;
  totalPrice: number;
  subtotal: number;
  shippingCost: number;
  shippingAddress?: string;
  items: any[];
  trackingNumber?: string;
  carrier?: string;
  shipmentStatus?: string;
  shippedAt?: string;
  estimatedDelivery?: string;
}

export function CustomerDashboardView() {
  const router = useRouter();
  const { totalCount: cartCount } = useCart();

  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "profile" | "payments">("orders");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // Track Shipment Modal State
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<OrderData | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState(false);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressModalType, setAddressModalType] = useState<"billing" | "shipping">("shipping");
  const [currentAddressFormData, setCurrentAddressFormData] = useState<AddressFormData | null>(null);

  // Edit Profile Form State
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fetchProfileAndOrders = async () => {
    try {
      setLoading(true);
      const [profRes, ordRes] = await Promise.all([
        fetch("/api/customer/profile"),
        fetch("/api/customer/orders"),
      ]);

      const profJson = await profRes.json();
      const ordJson = await ordRes.json();

      if (profRes.ok && profJson.success && profJson.data) {
        setProfile(profJson.data);
        setEditName(profJson.data.name || "");
        setEditPhone(profJson.data.phone || profJson.data.mobileNumber || "");
      } else {
        // Not authenticated, redirect to login
        router.push("/login?callbackUrl=/customer/dashboard");
        return;
      }

      if (ordRes.ok && ordJson.success) {
        setOrders(ordJson.data || []);
      }
    } catch (err) {
      console.error("Failed to load customer dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndOrders();
  }, []);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, phone: editPhone }),
      });
      const json = await res.json();
      if (json.success) {
        showNotice("Profile details updated successfully!");
        fetchProfileAndOrders();
      } else {
        alert(json.error || "Failed to update profile");
      }
    } catch {
      alert("Error updating profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (json.success) {
        showNotice("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setPasswordError(json.error || "Failed to change password.");
      }
    } catch {
      setPasswordError("Error connecting to server.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAddressFormData) return;

    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile?.id,
          customerEmail: profile?.email,
          type: currentAddressFormData.type || addressModalType,
          name: currentAddressFormData.name,
          company: currentAddressFormData.company,
          addressLine1: currentAddressFormData.streetAddress,
          addressLine2: currentAddressFormData.apartment,
          country: currentAddressFormData.country,
          state: currentAddressFormData.state,
          city: currentAddressFormData.city,
          postalCode: currentAddressFormData.postalCode,
          phone: currentAddressFormData.phone,
          isDefault: currentAddressFormData.isDefault ?? true,
          status: "Active",
        }),
      });

      const json = await res.json();
      if (json.success) {
        showNotice("Address saved successfully!");
        setIsAddressModalOpen(false);
        fetchProfileAndOrders();
      } else {
        alert(json.error || "Failed to save address");
      }
    } catch {
      alert("Error saving address");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showNotice("Address deleted.");
        fetchProfileAndOrders();
      } else {
        alert(json.error || "Failed to delete address");
      }
    } catch {
      alert("Error deleting address");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <StoreHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-xs font-semibold">Loading customer account...</span>
        </div>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <StoreHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 font-sans space-y-6">
        {/* Breadcrumb Navigation & Quick Return Links */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/70">
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-indigo-600 flex items-center gap-1 transition">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <Link href="/shop" className="hover:text-indigo-600 transition">
              Shop
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-800 font-semibold">Customer Dashboard</span>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Continue Shopping</span>
            </Link>

            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold transition shadow-xs relative"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Top Banner & Profile Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              {profile?.name ? profile.name.slice(0, 2).toUpperCase() : "CU"}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{profile?.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                  Verified Customer
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile?.email}</span>
                </span>
                {profile?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{profile.phone}</span>
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons: Back to Shop, Cart, Stats & Sign Out */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Prominent Back to Shop Button */}
            <Link
              href="/shop"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-indigo-600/20"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Back to Shop</span>
            </Link>

            {/* Prominent View Cart Button */}
            <Link
              href="/cart"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition shadow-2xs border border-slate-300 relative"
            >
              <ShoppingCart className="w-4 h-4 text-slate-600" />
              <span>View Cart</span>
              {cartCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Total Orders counter */}
            <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block leading-tight">Total Orders</span>
              <span className="text-base font-black text-slate-800 leading-tight">{orders.length}</span>
            </div>

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-bold transition border border-transparent hover:border-rose-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

      {notice && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs sm:text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("orders")}
          className={`py-3 px-2 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "orders"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Order History ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("addresses")}
          className={`py-3 px-2 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "addresses"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({profile?.addresses?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`py-3 px-2 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "profile"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Settings</span>
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`py-3 px-2 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "payments"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Methods</span>
        </button>
      </div>

      {/* TAB 1: ORDER HISTORY */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No orders yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore our catalog of latest electronics, winter wear, and deals to place your first order.
              </p>
              <Link
                href="/#deals"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
              >
                <span>Start Shopping</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">#{ord.orderNumber}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.orderStatus === "Delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : ord.orderStatus === "Shipped"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {ord.orderStatus}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Placed on {new Date(ord.orderDate).toLocaleDateString()} via {ord.gateway}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Total Amount</span>
                      <span className="font-mono font-extrabold text-base text-indigo-600">
                        ${Number(ord.totalPrice).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    {ord.items?.map((it: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                            {it.quantity}x
                          </span>
                          <span className="font-semibold text-slate-800">{it.name}</span>
                        </div>
                        <span className="font-mono text-slate-600 font-medium">
                          ${(Number(it.price) * Number(it.quantity)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery & Shipment summary */}
                  <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-100">
                    <div className="flex items-start gap-2.5">
                      <Truck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-700 block text-[11px]">
                          Delivery Address & Shipment:
                        </span>
                        <span className="text-slate-500">{ord.shippingAddress || "Standard Ground Delivery"}</span>
                        {ord.carrier && (
                          <span className="text-[11px] text-slate-600 block mt-0.5">
                            Carrier: <strong>{ord.carrier}</strong>
                            {ord.trackingNumber && (
                              <span className="ml-2 font-mono text-indigo-600 font-semibold">
                                AWB: {ord.trackingNumber}
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTrackingOrder(ord)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition border border-indigo-200/60 shrink-0 shadow-2xs"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Track Shipment</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SAVED ADDRESSES (Billing & Shipping separated matching Requirement #13) */}
      {activeTab === "addresses" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Manage your saved billing and shipping addresses for one-click checkout.
            </p>
            <button
              onClick={() => {
                setAddressModalType("shipping");
                setIsAddressModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile?.addresses && profile.addresses.length > 0 ? (
              profile.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm space-y-3 relative flex flex-col justify-between ${
                    addr.isDefault ? "border-indigo-500 ring-2 ring-indigo-50" : "border-slate-200"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {addr.type === "billing" ? "Billing Address" : "Shipping Address"}
                      </span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 leading-relaxed">
                      <p className="font-bold text-slate-900 text-sm">{addr.name}</p>
                      {addr.company && <p className="text-slate-500">{addr.company}</p>}
                      <p>{addr.addressLine1}</p>
                      {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                      <p>
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p className="font-semibold text-slate-700">{addr.country}</p>
                      <p className="text-slate-500 pt-1">{addr.phone}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-10 text-center text-slate-400 text-xs">
                No addresses saved yet. Click &quot;Add New Address&quot; above to create one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PROFILE SETTINGS & CHANGE PASSWORD */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Personal Information</span>
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ""}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg cursor-not-allowed text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Email address cannot be changed.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+971 50 123 4567"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
              >
                {isUpdatingProfile ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>Change Password</span>
            </h2>

            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition"
              >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENT INFORMATION */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>Supported Payment Options</span>
          </h2>

          <p className="text-xs text-slate-500">
            Our store supports secure, tokenized payments through top payment gateways managed securely by
            our infrastructure.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 text-xs block">Credit / Debit Cards</span>
              <span className="text-[11px] text-slate-500">VISA, Mastercard, AMEX, RuPay, Discover</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 text-xs block">Instant UPI & Wallets</span>
              <span className="text-[11px] text-slate-500">Razorpay, Paytm QR, Apple Pay, Google Pay</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 text-xs block">Cash On Delivery (COD)</span>
              <span className="text-[11px] text-slate-500">Pay cash directly upon delivery to courier</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT ADDRESS WITH ZIP AUTOFILL */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Add Saved Address</span>
              </h2>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="flex-1 overflow-y-auto p-6 space-y-4">
              <DynamicAddressForm
                initialData={{
                  name: profile?.name || "",
                  phone: profile?.phone || profile?.mobileNumber || "",
                  type: addressModalType,
                }}
                onChange={(data) => setCurrentAddressFormData(data)}
                showTypeSelector={true}
                showDefaultToggle={true}
              />

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRACK SHIPMENT FOR CUSTOMER */}
      {selectedTrackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-slate-800 text-sm">
                  Track Order #{selectedTrackingOrder.orderNumber}
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelectedTrackingOrder(null);
                  setCopiedTrackingId(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-700">
              {/* Carrier & AWB header */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Logistics Carrier</span>
                  <span className="font-bold text-slate-900">{selectedTrackingOrder.carrier || "BlueDart Express"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tracking Number (AWB)</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-indigo-600">
                      {selectedTrackingOrder.trackingNumber || `AWB-${selectedTrackingOrder.orderNumber}`}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          selectedTrackingOrder.trackingNumber || `AWB-${selectedTrackingOrder.orderNumber}`
                        );
                        setCopiedTrackingId(true);
                        setTimeout(() => setCopiedTrackingId(false), 2000);
                      }}
                      className="text-slate-400 hover:text-slate-700"
                      title="Copy Tracking ID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {copiedTrackingId && <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>}
                  </div>
                </div>
                {selectedTrackingOrder.estimatedDelivery && (
                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px]">
                    <span className="text-slate-500">Estimated Delivery:</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(selectedTrackingOrder.estimatedDelivery).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Visual Shipment Timeline */}
              <div className="space-y-4 pt-1">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Shipment Progress</h4>

                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {/* Step 1: Placed */}
                  <div className="flex items-start gap-3 relative">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">Order Confirmed & Placed</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(selectedTrackingOrder.orderDate).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Step 2: Processing */}
                  <div className="flex items-start gap-3 relative">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">Packed & Ready for Dispatch</span>
                      <span className="text-[11px] text-slate-500">Warehouse Fulfillment Center</span>
                    </div>
                  </div>

                  {/* Step 3: In Transit */}
                  {(() => {
                    const isShipped = ["Shipped", "In Transit", "Out for Delivery", "Delivered"].includes(
                      selectedTrackingOrder.shipmentStatus || selectedTrackingOrder.orderStatus
                    );
                    return (
                      <div className="flex items-start gap-3 relative">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                            isShipped ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-400"
                          }`}
                        >
                          <Truck className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className={`font-bold block text-xs ${isShipped ? "text-slate-900" : "text-slate-400"}`}>
                            In Transit with Carrier ({selectedTrackingOrder.carrier || "Courier"})
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {isShipped ? "Package has departed facility" : "Courier handover in progress"}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Step 4: Delivered */}
                  {(() => {
                    const isDelivered =
                      (selectedTrackingOrder.shipmentStatus || selectedTrackingOrder.orderStatus) === "Delivered";
                    return (
                      <div className="flex items-start gap-3 relative">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                            isDelivered ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-400"
                          }`}
                        >
                          <Package className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className={`font-bold block text-xs ${isDelivered ? "text-slate-900" : "text-slate-400"}`}>
                            Delivered
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {isDelivered ? "Delivered to recipient" : "Expected in 2-3 business days"}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Delivery destination */}
              <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-700 block text-[11px]">Delivering to:</span>
                  <span className="text-slate-500 text-[11px]">
                    {selectedTrackingOrder.shippingAddress || "Customer address"}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTrackingOrder(null)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                >
                  Close Tracking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>

      <StoreFooter />
    </div>
  );
}
