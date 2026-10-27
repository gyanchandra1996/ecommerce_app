"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Ticket, Plus, Search, Trash2, Edit2, Check, X, Calendar, Percent } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  couponType: string;
  discountPercentage: number;
  discountAmount: number;
  minAmount: number;
  expiryDate?: string;
  usageLimit: number;
  usedCount: number;
  usageLimitPerCustomer: number;
  isActive: boolean;
}

export function ManageCouponsView() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/coupons");
      const json = await res.json();
      if (json.success && json.data) {
        setCoupons(json.data);
      }
    } catch (err) {
      console.error("Error fetching coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      if (res.ok) fetchCoupons();
    } catch (err) {
      console.error("Error toggling coupon:", err);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon ${code}?`)) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      if (res.ok) fetchCoupons();
    } catch (err) {
      console.error("Error deleting coupon:", err);
    }
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.couponType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header and Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Ticket className="w-5 h-5 text-emerald-600" />
            <span>Manage Coupons</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            <span className="text-emerald-600 font-medium">Marketing</span> /{" "}
            <span className="text-slate-400">Coupons</span>
          </p>
        </div>

        <Link
          href="/admin/coupons/create"
          className="h-8 px-3.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs flex items-center space-x-1.5 transition self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Coupon</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex justify-end">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search by coupon code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-3 pr-7 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Coupon Type</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min. Order</th>
                <th className="py-3 px-4">Usage (Used / Limit)</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading coupons...
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No coupons found. Click &quot;Add Coupon&quot; to create one.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {c.couponType}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {c.discountPercentage > 0
                        ? `${c.discountPercentage}%`
                        : c.discountAmount > 0
                        ? `$${c.discountAmount.toFixed(2)}`
                        : "Free Shipping"}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {c.minAmount > 0 ? `$${c.minAmount.toFixed(2)}` : "None"}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {c.usedCount} / {c.usageLimit > 0 ? c.usageLimit : "∞"}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {c.expiryDate || "Never"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`px-2.5 py-0.5 rounded text-[10px] font-semibold transition ${
                          c.isActive
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                        }`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id, c.code)}
                        className="p-1 text-slate-400 hover:text-red-600 transition"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
