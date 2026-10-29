"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  MapPin,
  ShoppingCart,
  User,
  ChevronDown,
  ChevronRight,
  Gift,
  Radio,
  Menu,
  X,
  Sparkles,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Lock,
  Layers,
  Folder,
} from "lucide-react";
import { CartItem } from "../types/storefront.types";
import { useCart } from "@/modules/cart/context/CartContext";

interface Props {
  cart?: CartItem[];
  onUpdateCartQuantity?: (productId: string, delta: number) => void;
  onRemoveFromCart?: (productId: string) => void;
  onSearch?: (query: string) => void;
  onClearCart?: () => void;
  storeName?: string;
}

interface DynamicMenuItem {
  id: string;
  label: string;
  url: string;
  badge?: string;
  isHighlight?: boolean;
}

export interface HeaderCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  level: number;
  isActive: boolean;
  productCount?: number;
  children?: HeaderCategory[];
  subcategories?: HeaderCategory[];
}

export function StoreHeader({
  cart,
  onUpdateCartQuantity,
  onRemoveFromCart,
  onSearch,
  onClearCart,
  storeName,
}: Props) {
  const cartContext = useCart();
  const effectiveCart = cart ?? cartContext.items;
  const effectiveUpdateCart = onUpdateCartQuantity ?? cartContext.adjustQuantity;
  const effectiveRemove = onRemoveFromCart ?? cartContext.removeItem;
  const effectiveClear = onClearCart ?? cartContext.clearCart;

  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [categories, setCategories] = useState<HeaderCategory[]>([]);
  const [activeHoverCategory, setActiveHoverCategory] = useState<HeaderCategory | null>(null);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [menuItems, setMenuItems] = useState<DynamicMenuItem[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [themeName, setThemeName] = useState(storeName || "G-store");

  useEffect(() => {
    if (storeName) {
      setThemeName(storeName);
    }
  }, [storeName]);

  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === "ANTIGRAVITY_UPDATE_STORE_NAME" && typeof e.data.storeName === "string") {
        setThemeName(e.data.storeName);
      }
    };
    window.addEventListener("message", handleMsg);
    return () => window.removeEventListener("message", handleMsg);
  }, []);
  const [deliveryLocation, setDeliveryLocation] = useState("Delivering to India");
  const [currencyCode, setCurrencyCode] = useState("INR");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    discountAmount: number;
    freeShipping: boolean;
    finalTotal: number;
    coupon?: any;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponApplying, setCouponApplying] = useState(false);

  // Multiple Payment Gateways & Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [gateways, setGateways] = useState<any[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<any>(null);
  const [checkoutName, setCheckoutName] = useState("Gyanchandra");
  const [checkoutEmail, setCheckoutEmail] = useState("gyanwork1996@gmail.com");
  const [checkoutPhone, setCheckoutPhone] = useState("+91 98765 43210");
  const [checkoutAddress, setCheckoutAddress] = useState("Bandra West, Hill Road, Suite 402, Mumbai, Maharashtra 400050");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Click outside and keyboard accessibility listeners
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(e.target as Node)
      ) {
        setIsCategoryMenuOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCategoryMenuOpen(false);
        setIsUserMenuOpen(false);
        setIsMobileCategoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Check logged-in customer for the storefront header
    fetch("/api/auth/me?portal=customer")
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.data?.user) {
          setCurrentUser(json.data.user);
          if (json.data.user.name) setCheckoutName(json.data.user.name);
          if (json.data.user.email) setCheckoutEmail(json.data.user.email);
        }
      })
      .catch(() => {});

    // Check if an authenticated administrator session is active
    fetch("/api/auth/me?portal=admin")
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.data?.user) {
          const u = json.data.user;
          const isAdmin =
            u.type === "admin" ||
            u.accountType === "admin" ||
            u.role === "ADMIN" ||
            (u.role !== "CUSTOMER" && u.type !== "customer");
          if (isAdmin) {
            setIsAdminUser(true);
          }
        }
      })
      .catch(() => {});

    // Fetch dynamic category tree from backend database
    fetch("/api/categories?format=tree")
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.data && Array.isArray(json.data)) {
          const activeOnly = json.data.filter((c: HeaderCategory) => c.isActive !== false);
          setCategories(activeOnly);
          // Set initial hover category to first category with subcategories or first category
          const firstWithSubs = activeOnly.find((c: HeaderCategory) => (c.subcategories && c.subcategories.length > 0) || (c.children && c.children.length > 0));
          setActiveHoverCategory(firstWithSubs || activeOnly[0] || null);
        }
      })
      .catch(() => {});

    fetch("/api/menu")
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.data && Array.isArray(json.data)) {
          setMenuItems(json.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsMenuLoading(false);
      });

    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && json.data) {
          if (!storeName && json.data.themeName) setThemeName(json.data.themeName);
          if (json.data.deliveryLocation) setDeliveryLocation(json.data.deliveryLocation);
          if (json.data.defaultCurrency) {
            setCurrencyCode(json.data.defaultCurrency);
          }
        }
      })
      .catch(() => {});

    // Fetch enabled payment gateways from backend
    fetch("/api/gateways?activeOnly=true")
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && Array.isArray(json.data)) {
          setGateways(json.data);
          const def = json.data.find((g: any) => g.isDefault) || json.data[0];
          if (def) setSelectedGateway(def);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const totalCartCount = effectiveCart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalAmount = effectiveCart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    const dealsElem = document.getElementById("deals");
    if (dealsElem) {
      dealsElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-2xs font-sans">
        {/* Top Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo dynamically using Theme Name */}
          <Link href="/" className="flex items-center space-x-1 shrink-0 group">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition lowercase">
              {themeName}
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-600 mb-2"></span>
          </Link>

          {/* Search Bar matching Image */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-2xl relative flex items-center"
          >
            <div className="relative w-full flex items-center">
              <Sparkles className="w-4 h-4 text-blue-500 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for any product or brand"
                className="w-full h-10.5 pl-10 pr-12 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400 font-medium"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-full bg-[#0284c7] hover:bg-blue-600 text-white flex items-center justify-center absolute right-1.5 transition cursor-pointer shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Right Action Icons: Delivery, Country, Cart, Sign In */}
          <div className="flex items-center space-x-4 sm:space-x-6 shrink-0 text-slate-700">
            {/* Delivery Location dynamically from Settings */}
            <div className="hidden lg:flex items-center space-x-2 text-left cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition">
                <MapPin className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
              </div>
              <div className="text-[11px] leading-tight">
                <div className="text-slate-400">{deliveryLocation}</div>
                <div className="font-bold text-slate-800">Update Location</div>
              </div>
            </div>

            {/* Country Selector: Indian Flag + Dynamic Currency */}
            <div className="hidden md:flex items-center space-x-1.5 text-xs font-bold text-slate-800 cursor-pointer hover:text-blue-600 transition">
              {/* Indian Tricolor Flag */}
              <div className="w-5 h-3.5 rounded-xs overflow-hidden flex flex-col border border-black/10 shadow-2xs">
                <div className="flex-1 bg-[#FF9933]" />
                <div className="flex-1 bg-[#FFFFFF] flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-[#000080]" />
                </div>
                <div className="flex-1 bg-[#138808]" />
              </div>
              <span>{currencyCode === "INR" ? "INR (₹)" : currencyCode}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {/* Cart Button with badge counter */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center space-x-1.5 text-xs font-bold hover:text-blue-600 transition relative cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-slate-700" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
            </button>

            {/* Sign In / Account Link & Dropdown */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 hover:text-blue-600 transition cursor-pointer"
                  title={currentUser.email || currentUser.name}
                >
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                    {currentUser.email ? currentUser.email[0].toUpperCase() : (currentUser.name ? currentUser.name[0].toUpperCase() : "U")}
                  </div>
                  <span className="hidden md:inline max-w-[150px] lg:max-w-[180px] truncate text-slate-800 font-semibold" title={currentUser.email || currentUser.name}>
                    {currentUser.email || currentUser.name || "Account"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-bold text-xs text-slate-900 truncate">{currentUser.name || "Customer Account"}</div>
                      <div className="text-[11px] font-medium text-blue-600 truncate">{currentUser.email}</div>
                    </div>

                    <Link
                      href="/customer/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-medium"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Customer Dashboard</span>
                    </Link>

                    <Link
                      href="/customer/dashboard?tab=orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-medium"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      href="/customer/dashboard?tab=addresses"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-medium"
                    >
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Saved Addresses</span>
                    </Link>

                    {/* Admin Console link: only visible to authenticated admins */}
                    {isAdminUser && (
                      <Link
                        href="/admin/assets"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-xs text-blue-600 hover:bg-blue-50 font-bold border-t border-slate-100"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={async () => {
                        setIsUserMenuOpen(false);
                        await fetch("/api/auth/logout?portal=customer", { method: "POST" });
                        setCurrentUser(null);
                        window.location.href = "/";
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium border-t border-slate-100 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="flex items-center space-x-1.5 text-xs font-bold hover:text-blue-600 transition"
                >
                  <User className="w-4 h-4 text-slate-700" />
                  <span>Sign In</span>
                </Link>
                <span className="text-slate-300">|</span>
                <Link
                  href="/register"
                  className="text-xs font-bold text-blue-600 hover:underline transition hidden sm:inline"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Admin Shortcut - Only shown to authenticated admins, strictly hidden from customers */}
            {isAdminUser && (
              <Link
                href="/admin/sliders"
                title="Admin Slider & Roles Manager"
                className="hidden xl:inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
              >
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>

        {/* Secondary Category Navigation Bar dynamically loaded from Backend */}
        <div className="border-t border-slate-100 bg-white relative z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs font-semibold py-1.5 gap-4">
            {/* Left: All Categories Dropdown - Isolated from scrolling container so it never gets clipped! */}
            <div className="relative shrink-0" ref={categoryMenuRef}>
              <button
                type="button"
                id="all-categories-button"
                aria-expanded={isCategoryMenuOpen}
                aria-haspopup="true"
                onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition font-bold cursor-pointer select-none ${
                  isCategoryMenuOpen
                    ? "bg-blue-50 text-blue-600 shadow-xs"
                    : "text-slate-800 hover:text-blue-600 hover:bg-slate-50"
                }`}
              >
                <Menu className="w-3.5 h-3.5" />
                <span>All Categories</span>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                    isCategoryMenuOpen ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </button>

              {/* Multi-Tier Flyout Dropdown Menu */}
              {isCategoryMenuOpen && (
                <div
                  className="absolute left-0 top-full mt-2 w-[520px] max-w-[94vw] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex animate-in fade-in zoom-in-95 duration-150"
                  role="menu"
                  aria-labelledby="all-categories-button"
                >
                  {/* Left Column: Root / Parent Categories */}
                  <div className="w-1/2 border-r border-slate-100 max-h-[440px] overflow-y-auto py-2">
                    <Link
                      href="/category/all"
                      onClick={() => setIsCategoryMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-xs text-blue-600 hover:bg-blue-50/60 font-bold border-b border-slate-100 transition"
                    >
                      <div className="flex items-center space-x-2">
                        <Layers className="w-3.5 h-3.5" />
                        <span>All Categories</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                    </Link>

                    {categories.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">Loading categories...</div>
                    ) : (
                      categories.map((cat) => {
                        const hasSubs =
                          (cat.subcategories && cat.subcategories.length > 0) ||
                          (cat.children && cat.children.length > 0);
                        const isHovered = activeHoverCategory?.id === cat.id;

                        return (
                          <div
                            key={cat.id}
                            onMouseEnter={() => setActiveHoverCategory(cat)}
                            className={`flex items-center justify-between px-4 py-2.5 text-xs transition cursor-pointer ${
                              isHovered
                                ? "bg-blue-50/80 text-blue-700 font-bold border-l-2 border-blue-600"
                                : "text-slate-700 hover:bg-slate-50 font-medium"
                            }`}
                          >
                            <Link
                              href={`/category/${cat.slug}`}
                              onClick={() => setIsCategoryMenuOpen(false)}
                              className="flex-1 truncate pr-2 hover:underline flex items-center space-x-2"
                            >
                              <span>{cat.name}</span>
                            </Link>

                            <div className="flex items-center space-x-1.5 shrink-0">
                              {cat.productCount !== undefined && cat.productCount > 0 && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500 font-mono">
                                  {cat.productCount}
                                </span>
                              )}
                              {hasSubs && (
                                <ChevronRight
                                  className={`w-3.5 h-3.5 ${
                                    isHovered ? "text-blue-600" : "text-slate-400"
                                  }`}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Right Column: Subcategories & Fast Navigation */}
                  <div className="w-1/2 p-4 bg-slate-50/60 max-h-[440px] overflow-y-auto flex flex-col justify-between">
                    {activeHoverCategory ? (
                      <div className="space-y-3">
                        <div className="pb-2.5 border-b border-slate-200">
                          <div className="flex items-center justify-between">
                            <h4 className="font-black text-xs text-slate-900 truncate">
                              {activeHoverCategory.name}
                            </h4>
                            <Link
                              href={`/category/${activeHoverCategory.slug}`}
                              onClick={() => setIsCategoryMenuOpen(false)}
                              className="text-[11px] font-bold text-blue-600 hover:underline shrink-0"
                            >
                              View All →
                            </Link>
                          </div>
                          {activeHoverCategory.description && (
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                              {activeHoverCategory.description}
                            </p>
                          )}
                        </div>

                        {/* Nested Subcategories List */}
                        {(() => {
                          const subList =
                            (activeHoverCategory.subcategories && activeHoverCategory.subcategories.length > 0)
                              ? activeHoverCategory.subcategories
                              : (activeHoverCategory.children && activeHoverCategory.children.length > 0)
                              ? activeHoverCategory.children
                              : [];

                          if (subList.length > 0) {
                            return (
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                  Subcategories ({subList.length})
                                </span>
                                <div className="space-y-1">
                                  {subList.map((sub) => (
                                    <Link
                                      key={sub.id}
                                      href={`/category/${sub.slug}`}
                                      onClick={() => setIsCategoryMenuOpen(false)}
                                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-700 bg-white hover:bg-blue-50/80 hover:text-blue-600 border border-slate-200/60 hover:border-blue-200 transition shadow-2xs group"
                                    >
                                      <span className="font-semibold group-hover:translate-x-0.5 transition-transform truncate">
                                        {sub.name}
                                      </span>
                                      {sub.productCount !== undefined && sub.productCount > 0 && (
                                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-700 font-mono">
                                          {sub.productCount}
                                        </span>
                                      )}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                              <Folder className="w-8 h-8 text-slate-300 mx-auto" />
                              <p className="text-[11px] text-slate-500">No subcategories under {activeHoverCategory.name}</p>
                              <Link
                                href={`/category/${activeHoverCategory.slug}`}
                                onClick={() => setIsCategoryMenuOpen(false)}
                                className="inline-block px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-xs"
                              >
                                Browse {activeHoverCategory.name}
                              </Link>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                        <Folder className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="text-xs">Hover over a category to view subcategories</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Middle: Horizontal 8 Category Links dynamically linked to category pages */}
            <div className="flex-1 overflow-x-auto scrollbar-none flex items-center space-x-6 whitespace-nowrap text-slate-600 font-medium">
              {isMenuLoading && categories.length === 0 ? (
                <div className="flex items-center space-x-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (() => {
                  // Standard 8 Categories fallback
                  const default8: { id: string; label: string; url: string; badge?: string }[] = [
                    { id: "cat_electronics", label: "Electronics", url: "/category/electronics" },
                    { id: "cat_fashion", label: "Fashion", url: "/category/fashion" },
                    { id: "cat_womens", label: "Women's", url: "/category/womens" },
                    { id: "cat_kids_fashion", label: "Kids' Fashion", url: "/category/kids-fashion" },
                    { id: "cat_health_beauty", label: "Health & Beauty", url: "/category/health-beauty" },
                    { id: "cat_pharmacy", label: "Pharmacy", url: "/category/pharmacy" },
                    { id: "cat_groceries", label: "Groceries", url: "/category/groceries" },
                    { id: "cat_luxury_item", label: "Luxury Item", url: "/category/luxury-item" },
                  ];

                  const itemsToRender =
                    menuItems.filter((item) => !item.isHighlight).length > 0
                      ? menuItems
                          .filter((item) => !item.isHighlight)
                          .map((item) => {
                            let targetUrl = item.url;
                            if (!targetUrl || targetUrl === "/#deals" || targetUrl === "#") {
                              const matchCat = categories.find(
                                (c) => c.name.toLowerCase() === item.label.toLowerCase()
                              );
                              if (matchCat) {
                                targetUrl = `/category/${matchCat.slug}`;
                              }
                            }
                            return { ...item, url: targetUrl };
                          })
                      : categories.length > 0
                      ? categories.slice(0, 8).map((cat) => ({
                          id: cat.id,
                          label: cat.name,
                          url: `/category/${cat.slug}`,
                          badge: undefined,
                        }))
                      : default8;

                  return itemsToRender.map((item) => {
                    const isActive = pathname === item.url;
                    return (
                      <Link
                        key={item.id}
                        href={item.url}
                        className={`transition flex items-center space-x-1 py-1 ${
                          isActive
                            ? "text-blue-600 font-bold border-b-2 border-blue-600"
                            : "hover:text-blue-600 text-slate-700"
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  });
                })()}
            </div>

            {/* Right: Highlighted Links (e.g. Best Deals & Live) */}
            <div className="flex items-center space-x-4 shrink-0 font-bold">
              {menuItems
                .filter((item) => item.isHighlight)
                .map((item) => {
                  const rawLabel = item.label || "";
                  const displayLabel = rawLabel.toLowerCase().includes("emox")
                    ? rawLabel.replace(/emox/gi, themeName || "Store")
                    : rawLabel;
                  const isLive = displayLabel.toLowerCase().includes("live");

                  return (
                    <Link
                      key={item.id}
                      href={item.url.startsWith("/") ? item.url : `/${item.url}`}
                      className={`flex items-center space-x-1.5 transition ${
                        isLive
                          ? "text-slate-800 hover:text-red-600"
                          : "text-blue-600 hover:text-blue-700"
                      }`}
                    >
                      {isLive ? (
                        <>
                          <span>{displayLabel}</span>
                          <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                        </>
                      ) : (
                        <>
                          <Gift className="w-3.5 h-3.5" />
                          <span>{displayLabel}</span>
                        </>
                      )}
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Shopping Cart ({totalCartCount})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {effectiveCart.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Your cart is empty</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Explore today&apos;s best deals and add items to your cart.
                  </p>
                </div>
              ) : (
                effectiveCart.map((item) => {
                  const itemKey = item.id || `${item.productId}_${item.variantId || "novar"}`;
                  return (
                    <div
                      key={itemKey}
                      className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-lg bg-white shrink-0 border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.name}
                        </h4>

                        {/* Variant Attributes */}
                        {item.variantAttributes && Object.keys(item.variantAttributes).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {Object.entries(item.variantAttributes).map(([k, v]) => (
                              <span
                                key={k}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700 font-medium"
                              >
                                {k}: {String(v)}
                              </span>
                            ))}
                          </div>
                        )}

                        {item.sku && (
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            SKU: {item.sku}
                          </span>
                        )}

                        <div className="text-xs font-bold text-blue-600 mt-1">
                          ₹{item.price.toFixed(2)}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            type="button"
                            onClick={() => effectiveUpdateCart(itemKey, -1)}
                            className="w-5 h-5 rounded bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-800 w-5 text-center font-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => effectiveUpdateCart(itemKey, 1)}
                            className="w-5 h-5 rounded bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => effectiveRemove(itemKey)}
                        className="text-slate-400 hover:text-red-600 p-1 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer */}
            {effectiveCart.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-white space-y-3">
                {/* Coupon Code Section */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. WELCOME10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-slate-300 uppercase font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                    <button
                      type="button"
                      disabled={couponApplying || !couponCode.trim()}
                      onClick={async () => {
                        setCouponError(null);
                        try {
                          setCouponApplying(true);
                          const res = await fetch("/api/coupons/apply", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              code: couponCode.trim(),
                              subtotal: cartTotalAmount,
                            }),
                          });
                          const json = await res.json();
                          if (!res.ok || !json.success) {
                            setCouponError(json.error || "Invalid coupon code");
                            setAppliedCoupon(null);
                          } else {
                            setAppliedCoupon(json.data);
                          }
                        } catch {
                          setCouponError("Failed to apply coupon");
                        } finally {
                          setCouponApplying(false);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-md transition"
                    >
                      {couponApplying ? "..." : "Apply"}
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-[10px] text-red-600 font-medium">{couponError}</p>
                  )}

                  {appliedCoupon && (
                    <div className="text-[10px] text-emerald-700 font-semibold flex items-center justify-between">
                      <span>✓ Coupon &quot;{appliedCoupon.coupon?.code}&quot; applied</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCode("");
                        }}
                        className="text-slate-400 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold">₹{cartTotalAmount.toFixed(2)}</span>
                  </div>

                  {appliedCoupon && appliedCoupon.discountAmount > 0 && (
                    <div className="flex items-center justify-between text-rose-600 font-semibold">
                      <span>Discount ({appliedCoupon.coupon?.code}):</span>
                      <span className="font-mono">-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm pt-1 border-t border-slate-100 font-bold text-slate-900">
                    <span>Total Amount:</span>
                    <span className="font-black text-base text-blue-600 font-mono">
                      ₹
                      {appliedCoupon
                        ? appliedCoupon.finalTotal.toFixed(2)
                        : cartTotalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400">
                  Taxes and shipping calculated at checkout.
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/cart"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-slate-600" />
                    <span>View Cart</span>
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <span>Checkout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FRONTEND CHECKOUT MODAL: Multiple Payment Gateway Integration */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Secure Checkout</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm">
              {/* Order Summary */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                <span className="font-bold text-slate-700 block uppercase text-[10px] tracking-wider">
                  Order Summary ({totalCartCount} items)
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold text-slate-800">₹{cartTotalAmount.toFixed(2)}</span>
                </div>
                {appliedCoupon && appliedCoupon.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span>Coupon Discount</span>
                    <span className="font-semibold">-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-600">
                  <span>Express Delivery</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Payable Total:</span>
                  <span className="font-black text-blue-600 font-mono">
                    ₹{appliedCoupon ? appliedCoupon.finalTotal.toFixed(2) : cartTotalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Delivery Address</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={checkoutName}
                    onChange={(e) => setCheckoutName(e.target.value)}
                    placeholder="Full Name"
                    className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="tel"
                    value={checkoutPhone}
                    onChange={(e) => setCheckoutPhone(e.target.value)}
                    placeholder="Phone"
                    className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <input
                  type="text"
                  value={checkoutAddress}
                  onChange={(e) => setCheckoutAddress(e.target.value)}
                  placeholder="Street, Building, Unit, City, Country"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Multiple Payment Gateways (Only enabled gateways displayed, default pre-selected) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Select Payment Method (Backend Enabled Gateways)</span>
                </span>

                <div className="space-y-2">
                  {gateways.length === 0 ? (
                    <div className="p-3 bg-slate-50 text-slate-500 rounded-lg text-xs text-center">
                      Loading payment methods...
                    </div>
                  ) : (
                    gateways.map((gw) => {
                      const isSelected = selectedGateway?.id === gw.id;
                      return (
                        <div
                          key={gw.id}
                          onClick={() => setSelectedGateway(gw)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="checkout_payment_gateway"
                              checked={isSelected}
                              onChange={() => setSelectedGateway(gw)}
                              className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-800 text-xs">{gw.name}</span>
                                {gw.isDefault && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {gw.cardTypes?.slice(0, 4).map((c: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium"
                                  >
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            {gw.isCreditCard ? (
                              <span className="text-[10px] text-emerald-600 font-semibold">Instant Pay</span>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-medium">Standard</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Complete Order Button */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isPlacingOrder || !selectedGateway || effectiveCart.length === 0}
                  onClick={async () => {
                    try {
                      setIsPlacingOrder(true);
                      const finalTotal = appliedCoupon ? appliedCoupon.finalTotal : cartTotalAmount;
                      const orderNumber = "tags" + Math.floor(100 + Math.random() * 900);

                      const res = await fetch("/api/orders", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          orderNumber,
                          customerName: checkoutName,
                          customerEmail: checkoutEmail,
                          customerPhone: checkoutPhone,
                          shippingAddress: checkoutAddress,
                          gateway: selectedGateway?.name || "Credit Card",
                          gatewayCode: selectedGateway?.code || "authorizenet",
                          paymentStatus: selectedGateway?.code === "cod" ? "Pending" : "Paid",
                          orderStatus: "Pending",
                          subtotal: cartTotalAmount,
                          shippingCost: 0,
                          couponCode: appliedCoupon?.coupon?.code,
                          couponDiscount: appliedCoupon?.discountAmount || 0,
                          totalPrice: finalTotal,
                          items: effectiveCart.map((it) => ({
                            productId: it.productId,
                            name: it.name,
                            price: it.price,
                            quantity: it.quantity,
                            imageUrl: it.image,
                          })),
                        }),
                      });

                      const json = await res.json();
                      if (json.success) {
                        setPlacedOrder(json.data);
                        setIsCheckoutOpen(false);
                        effectiveClear();
                      } else {
                        alert(json.error || "Failed to process order");
                      }
                    } catch {
                      alert("Error creating order");
                    } finally {
                      setIsPlacingOrder(false);
                    }
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isPlacingOrder
                      ? "Processing Secure Payment..."
                      : `Pay ₹${appliedCoupon ? appliedCoupon.finalTotal.toFixed(2) : cartTotalAmount.toFixed(2)} with ${selectedGateway?.name || "Payment Gateway"}`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDER CONFIRMATION MODAL */}
      {placedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900">Order Placed Successfully!</h2>
              <p className="text-xs text-slate-500 mt-1">
                Thank you for your purchase. Your order has been registered in the database.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Number:</span>
                <span className="font-mono font-bold text-slate-800">#{placedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Order Amount:</span>
                <span className="font-bold text-blue-600">₹{Number(placedOrder.totalPrice).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-semibold text-slate-700">{placedOrder.gateway}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Status:</span>
                <span className="font-semibold text-emerald-600">{placedOrder.paymentStatus}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPlacedOrder(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Continue Shopping
              </button>
              {isAdminUser ? (
                <Link
                  href="/admin/orders"
                  onClick={() => setPlacedOrder(null)}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition text-center"
                >
                  View in Admin
                </Link>
              ) : (
                <Link
                  href="/customer/dashboard?tab=orders"
                  onClick={() => setPlacedOrder(null)}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition text-center"
                >
                  View My Order
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
