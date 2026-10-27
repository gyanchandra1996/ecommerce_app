"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  Boxes,
  Users,
  ShoppingCart,
  Upload,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const [assetCount, setAssetCount] = useState(0);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    fetch("/api/assets?pageSize=1")
      .then((res) => res.json())
      .then((json) => {
        if (json.pagination) setAssetCount(json.pagination.total);
      })
      .catch(() => {});

    fetch("/api/products")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setProductCount(json.data.length);
      })
      .catch(() => {});
  }, []);

  const stats = [
    {
      title: "Media Assets",
      value: assetCount,
      change: "+12 this week",
      icon: ImageIcon,
      href: "/admin/assets",
      color: "bg-emerald-600",
    },
    {
      title: "Active Products",
      value: productCount,
      change: "All warehouses",
      icon: Boxes,
      href: "/admin/inventory",
      color: "bg-blue-600",
    },
    {
      title: "Registered Admins",
      value: 2,
      change: "Active staff",
      icon: Users,
      href: "/admin/customers",
      color: "bg-indigo-600",
    },
    {
      title: "Completed Orders",
      value: 124,
      change: "+8.4% growth",
      icon: ShoppingCart,
      href: "/admin/inventory",
      color: "bg-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">Welcome to emox E-Commerce Management</p>
        </div>

        <Link
          href="/admin/assets"
          className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Media Assets</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-slate-300 transition flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
                <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{stat.change}</span>
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl ${stat.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Action Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">Media Library & Asset Management</h2>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-xl">
            Upload images, videos, catalogs and attach them directly to your store inventory and products.
          </p>
        </div>
        <Link
          href="/admin/assets"
          className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold transition flex items-center space-x-1.5 shrink-0 shadow-sm"
        >
          <span>Open Media Library</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
