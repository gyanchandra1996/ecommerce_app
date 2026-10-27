"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Search, Image as ImageIcon, Check, ChevronDown, Package } from "lucide-react";

interface WishlistItem {
  id: string;
  itemNo: string;
  name: string;
  productImage?: string;
  totalQuantity: number;
  wishlistCount: number;
}

export function ManageWishlistView() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/wishlist${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      const json = await res.json();
      if (json.success && json.data) {
        setItems(json.data);
      }
    } catch (err) {
      console.error("Error fetching wishlist items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [search]);

  return (
    <div className="space-y-5">
      {/* Header and Breadcrumb matching Screenshot 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Heart className="w-5 h-5 text-emerald-600" />
            <span>Manage Wishlist</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            <span className="text-emerald-600 font-medium">Products</span> /{" "}
            <span className="text-slate-400">Manage Wishlist</span>
          </p>
        </div>
      </div>

      {/* Top Search Bar matching Screenshot 3 */}
      <div className="flex justify-end">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-3 pr-7 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
        </div>
      </div>

      {/* Main Wishlist Table matching Screenshot 3 */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Item No.</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Product Image</th>
                <th className="py-3 px-4 text-center">Total Quantity</th>
                <th className="py-3 px-4 text-center">Wishlist</th>
                <th className="py-3 px-4 text-right">Manage Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading wishlist records...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No wishlist items found.
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50/70 transition">
                    {/* Item No. */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                      {it.itemNo}
                    </td>

                    {/* Name (underlined style matching screenshot) */}
                    <td className="py-3.5 px-4 font-medium text-slate-800 underline cursor-pointer hover:text-blue-600 max-w-[220px] truncate">
                      {it.name}
                    </td>

                    {/* Product Image Frame matching Screenshot 3 */}
                    <td className="py-3.5 px-4">
                      <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-1">
                        {it.productImage ? (
                          <img
                            src={it.productImage}
                            alt={it.name}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-[8px] text-slate-400 text-center font-bold">
                            <ImageIcon className="w-4 h-4 mb-0.5 text-slate-300" />
                            <span>NO IMAGE AVAILABLE</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Total Quantity */}
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700">
                      {it.totalQuantity}
                    </td>

                    {/* Wishlist Count */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                      {it.wishlistCount}
                    </td>

                    {/* Manage Quantity -> Actions Dropdown Button matching Screenshot 3 */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href="/admin/inventory"
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded shadow-xs transition"
                      >
                        <span>Actions</span>
                        <ChevronDown className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination matching Screenshot 3 */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            Showing 1 to {items.length} of {items.length} entries
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <button className="px-2 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50">
                Previous
              </button>
              <button className="px-2.5 py-1 rounded bg-teal-600 text-white font-bold">
                1
              </button>
              <button className="px-2 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50">
                Next
              </button>
            </div>

            <div className="flex items-center space-x-1.5">
              <span>Show</span>
              <select className="h-7 px-2 border border-slate-300 rounded bg-white text-xs">
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span>entries</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
