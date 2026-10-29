"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Users,
  Factory,
  Package,
  Boxes,
  DollarSign,
  ShoppingCart,
  Megaphone,
  Settings,
  ChevronDown,
  ChevronRight,
  Circle,
  X,
  ShieldCheck,
  Palette,
  CreditCard,
  Truck,
} from "lucide-react";
import { PermissionSet, PageModuleId } from "@/modules/roles/types/role.types";

interface Props {
  isOpen: boolean;
  onCloseMobile: () => void;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  permissions?: Record<string, PermissionSet>;
}

interface MenuItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  moduleId?: PageModuleId;
  hasChildren?: boolean;
  subKey?: string;
  children?: { title: string; href: string; moduleId?: PageModuleId }[];
}

export function AdminSidebar({
  isOpen,
  onCloseMobile,
  userName = "Admin admin",
  userEmail = "",
  userRole = "Administrator",
  permissions,
}: Props) {
  const pathname = usePathname();

  // Determine which submenus should be open by default based on current route
  const isProductsRoute =
    pathname.startsWith("/admin/products") ||
    pathname.startsWith("/admin/categories") ||
    pathname.startsWith("/admin/discounts") ||
    pathname.startsWith("/admin/reviews") ||
    pathname.startsWith("/admin/qna") ||
    pathname.startsWith("/admin/wishlist");

  const isOrdersRoute =
    pathname.startsWith("/admin/orders") ||
    pathname.startsWith("/admin/shipments");

  const isMarketingRoute =
    pathname.startsWith("/admin/sliders") ||
    pathname.startsWith("/admin/menu") ||
    pathname.startsWith("/admin/coupons") ||
    pathname.startsWith("/admin/marketing");

  const isShippingRoute = pathname.startsWith("/admin/shipping");

  const isAccessRoute = pathname.startsWith("/admin/roles");

  const isInventoryRoute =
    pathname.startsWith("/admin/inventory") ||
    pathname.startsWith("/admin/warehouses");

  const isSettingsRoute = pathname.startsWith("/admin/settings");

  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    products: isProductsRoute,
    inventory: isInventoryRoute,
    orders: isOrdersRoute,
    shipping: isShippingRoute,
    marketing: isMarketingRoute,
    settings: isSettingsRoute,
    accessMgmt: isAccessRoute,
  });

  // Keep submenus synchronized when route changes
  React.useEffect(() => {
    setOpenSubmenus((prev) => ({
      ...prev,
      products: prev.products || isProductsRoute,
      inventory: prev.inventory || isInventoryRoute,
      orders: prev.orders || isOrdersRoute,
      shipping: prev.shipping || isShippingRoute,
      marketing: prev.marketing || isMarketingRoute,
      settings: prev.settings || isSettingsRoute,
      accessMgmt: prev.accessMgmt || isAccessRoute,
    }));
  }, [pathname, isProductsRoute, isInventoryRoute, isOrdersRoute, isShippingRoute, isMarketingRoute, isSettingsRoute, isAccessRoute]);

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const rawMenuItems: MenuItem[] = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      moduleId: "dashboard",
    },
    {
      title: "Assets",
      href: "/admin/assets",
      icon: ImageIcon,
      moduleId: "assets",
    },
    {
      title: "Customers",
      href: "/admin/customers",
      icon: Users,
      moduleId: "customers",
    },
    {
      title: "Access Management",
      icon: ShieldCheck,
      hasChildren: true,
      subKey: "accessMgmt",
      moduleId: "accessMgmt",
      children: [
        { title: "Assign Customer Role", href: "/admin/roles/assign", moduleId: "roles" },
        { title: "Access Groups", href: "/admin/roles", moduleId: "roles" },
        { title: "Create Role", href: "/admin/roles/create", moduleId: "roles" },
      ],
    },
    {
      title: "Manufacturers",
      href: "/admin/manufacturers",
      icon: Factory,
      moduleId: "manufacturers",
    },
    {
      title: "Products",
      icon: Package,
      hasChildren: true,
      subKey: "products",
      moduleId: "products",
      children: [
        { title: "Products", href: "/admin/products", moduleId: "products" },
        { title: "Categories", href: "/admin/categories", moduleId: "categories" },
        { title: "Discounts", href: "/admin/discounts", moduleId: "discounts" },
        { title: "Reviews", href: "/admin/reviews", moduleId: "reviews" },
        { title: "Customer Q&A", href: "/admin/qna", moduleId: "qna" },
        { title: "Wishlists", href: "/admin/wishlist", moduleId: "wishlist" },
      ],
    },
    {
      title: "Inventory",
      icon: Boxes,
      hasChildren: true,
      subKey: "inventory",
      moduleId: "inventory",
      children: [
        { title: "Warehouses", href: "/admin/warehouses", moduleId: "inventory" },
        { title: "Warehouse Stock", href: "/admin/inventory", moduleId: "inventory" },
      ],
    },
    {
      title: "Pricing",
      href: "/admin/pricing",
      icon: DollarSign,
      moduleId: "pricing",
    },
    {
      title: "Orders",
      icon: ShoppingCart,
      hasChildren: true,
      subKey: "orders",
      moduleId: "orders",
      children: [
        { title: "All Orders", href: "/admin/orders", moduleId: "orders" },
        { title: "Add Order", href: "/admin/orders/create", moduleId: "orders" },
        { title: "Pending Orders", href: "/admin/orders/pending", moduleId: "orders" },
        { title: "Shipments", href: "/admin/shipments", moduleId: "orders" },
        { title: "Payment Records", href: "/admin/payments", moduleId: "orders" },
      ],
    },
    {
      title: "Payments",
      href: "/admin/payments",
      icon: CreditCard,
      moduleId: "payments" as PageModuleId,
    },
    {
      title: "Shipping Management",
      icon: Truck,
      hasChildren: true,
      subKey: "shipping",
      moduleId: "shipping" as PageModuleId,
      children: [
        { title: "Shipping Providers", href: "/admin/shipping/providers" },
        { title: "Add Shipping Provider", href: "/admin/shipping/providers/create" },
        { title: "Shipping Settings", href: "/admin/shipping/settings" },
        { title: "Shipping Zones and Rates", href: "/admin/shipping/zones" },
        { title: "Shipments and Tracking", href: "/admin/shipping/tracking" },
      ],
    },
    {
      title: "Marketing",
      icon: Megaphone,
      hasChildren: true,
      subKey: "marketing",
      moduleId: "marketing",
      children: [
        { title: "Sliders & Banners", href: "/admin/sliders", moduleId: "sliders" },
        { title: "Navigation Menu", href: "/admin/menu", moduleId: "menu" },
        { title: "Coupons", href: "/admin/coupons", moduleId: "coupons" },
        { title: "Manage Emails", href: "/admin/marketing/emails", moduleId: "marketing" },
      ],
    },
    {
      title: "Themes & Layout",
      href: "/admin/themes",
      icon: Palette,
      moduleId: "themes",
    },
    {
      title: "Payment Gateways",
      href: "/admin/gateways",
      icon: CreditCard,
      moduleId: "gateways",
    },
    {
      title: "Settings",
      icon: Settings,
      hasChildren: true,
      subKey: "settings",
      moduleId: "settings",
      children: [
        { title: "Store Settings", href: "/admin/settings", moduleId: "settings" },
        { title: "Asset Storage Settings", href: "/admin/settings/storage", moduleId: "settings" },
        { title: "Mail Configuration", href: "/admin/settings/mail", moduleId: "settings" },
        { title: "Email Templates", href: "/admin/marketing/emails", moduleId: "settings" },
      ],
    },
  ];

  // Filter items based on RBAC permissions if provided
  const menuItems = rawMenuItems
    .filter((item) => {
      if (!permissions || Object.keys(permissions).length === 0) return true;
      if (item.moduleId && permissions[item.moduleId]) {
        const p = permissions[item.moduleId] as any;
        return p.view !== false && p.canView !== false;
      }
      return true;
    })
    .map((item) => {
      if (item.children && permissions && Object.keys(permissions).length > 0) {
        const filteredChildren = item.children.filter((child) => {
          if (child.moduleId && permissions[child.moduleId]) {
            const cp = permissions[child.moduleId] as any;
            return cp.view !== false && cp.canView !== false;
          }
          return true;
        });
        return { ...item, children: filteredChildren };
      }
      return item;
    })
    .filter((item) => !item.hasChildren || (item.children && item.children.length > 0));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-56 bg-[#1a222f] text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* User Info Header matching image */}
        <div className="p-4 bg-[#141b25] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-md">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h2 className="text-xs font-bold text-white truncate">{userName}</h2>
              {userEmail && (
                <p className="text-[10px] text-slate-400 truncate font-mono select-all" title={userEmail}>
                  {userEmail}
                </p>
              )}
              <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 mt-0.5">
                <Circle className="w-1.5 h-1.5 fill-emerald-500 text-emerald-500" />
                <span className="font-semibold uppercase tracking-wider">{userRole}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 custom-scrollbar text-xs">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href &&
              (item.href === "/admin/dashboard"
                ? pathname === "/admin/dashboard"
                : pathname.startsWith(item.href));

            if (item.hasChildren && item.children) {
              const isOpenSub = openSubmenus[item.subKey || ""];
              const hasActiveChild = item.children.some(
                (child) => pathname === child.href || pathname.startsWith(child.href)
              );

              return (
                <div key={item.title}>
                  <button
                    type="button"
                    onClick={() => toggleSubmenu(item.subKey || "")}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition group ${
                      hasActiveChild
                        ? "text-emerald-400 bg-[#222d3d]/70 font-medium"
                        : "text-slate-300 hover:bg-[#222d3d] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`w-4 h-4 ${
                          hasActiveChild ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400"
                        }`}
                      />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    {isOpenSub ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>

                  {isOpenSub && (
                    <div className="pl-9 pr-2 py-1 space-y-1 bg-[#141b25]/50 rounded mt-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.title}
                          href={child.href}
                          onClick={() => onCloseMobile()}
                          className={`block py-1.5 px-2 rounded text-[11px] transition ${
                            pathname === child.href
                              ? "text-emerald-400 font-semibold bg-[#222d3d]"
                              : "text-slate-400 hover:text-white hover:bg-[#222d3d]/50"
                          }`}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.title}
                href={item.href || "#"}
                onClick={() => onCloseMobile()}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded transition ${
                  isActive
                    ? "bg-emerald-600 text-white font-semibold shadow-xs"
                    : "text-slate-300 hover:bg-[#222d3d] hover:text-white"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-400"
                  }`}
                />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
