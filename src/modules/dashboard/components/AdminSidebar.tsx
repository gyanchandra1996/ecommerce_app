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
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onCloseMobile: () => void;
  userName?: string;
  userRole?: string;
}

export function AdminSidebar({
  isOpen,
  onCloseMobile,
  userName = "Admin admin",
  userRole = "Admin",
}: Props) {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    products: false,
    orders: false,
    marketing: false,
  });

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Assets",
      href: "/admin/assets",
      icon: ImageIcon,
    },
    {
      title: "Customers",
      href: "/admin/customers",
      icon: Users,
    },
    {
      title: "Manufacturers",
      href: "/admin/manufacturers",
      icon: Factory,
    },
    {
      title: "Products",
      icon: Package,
      hasChildren: true,
      subKey: "products",
      children: [
        { title: "Manage Products", href: "/admin/products" },
        { title: "Manage Categories", href: "/admin/categories" },
        { title: "Manage Discount", href: "/admin/discounts" },
        { title: "Manage Review", href: "/admin/reviews" },
        { title: "Manage Q&A", href: "/admin/qna" },
        { title: "Manage Wishlist", href: "/admin/wishlist" },
      ],
    },
    {
      title: "Manage Inventory",
      href: "/admin/inventory",
      icon: Boxes,
    },
    {
      title: "Manage Pricing",
      href: "/admin/pricing",
      icon: DollarSign,
    },
    {
      title: "Orders",
      icon: ShoppingCart,
      hasChildren: true,
      subKey: "orders",
      children: [
        { title: "All Orders", href: "/admin/orders" },
        { title: "Pending Orders", href: "/admin/orders/pending" },
        { title: "Shipments", href: "/admin/orders/shipments" },
      ],
    },
    {
      title: "Marketing",
      icon: Megaphone,
      hasChildren: true,
      subKey: "marketing",
      children: [
        { title: "Coupons", href: "/admin/coupons" },
        { title: "Email Campaigns", href: "/admin/campaigns" },
      ],
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

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
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                <span>{userRole}</span>
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
            const isActive = item.href && pathname.startsWith(item.href);

            if (item.hasChildren && item.children) {
              const isOpenSub = openSubmenus[item.subKey || ""];
              return (
                <div key={item.title}>
                  <button
                    type="button"
                    onClick={() => toggleSubmenu(item.subKey || "")}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded text-slate-300 hover:bg-[#222d3d] hover:text-white transition group"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
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
