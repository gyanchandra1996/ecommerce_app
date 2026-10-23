"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Upload,
  Download,
  RotateCcw,
  Search,
  AlertTriangle,
  Package,
} from "lucide-react";

interface ProductItem {
  id: string;
  sku: string;
  name: string;
  currentStock: number;
  minStock: number;
  warehouse: string;
  status: string;
  isSoldOut: boolean;
  assetIds?: string[];
}

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "low" | "none" | "soldout">("all");
  const [displaySoldOut, setDisplaySoldOut] = useState(true);
  const [displayInactive, setDisplayInactive] = useState(false);
  const [search, setSearch] = useState("");
  const [warehouse, setWarehouse] = useState("all");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setProducts(json.data);
      })
      .catch(() => {});
  }, []);

  const filteredProducts = products.filter((p) => {
    if (!displaySoldOut && p.isSoldOut) return false;
    if (warehouse !== "all" && p.warehouse !== warehouse) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (activeTab === "low") return p.currentStock <= p.minStock && p.currentStock > 0;
    if (activeTab === "none") return p.currentStock === 0;
    if (activeTab === "soldout") return p.isSoldOut;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header and Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Manage Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            <span className="text-emerald-600 font-medium">Inventory</span> / Manage Inventory
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 cursor-pointer select-none text-xs text-slate-600">
            <span>Display Sold Out:</span>
            <div
              onClick={() => setDisplaySoldOut(!displaySoldOut)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                displaySoldOut ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  displaySoldOut ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
          </label>

          <button className="h-8 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md flex items-center space-x-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Inventory</span>
          </button>
          <button className="h-8 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md flex items-center space-x-1.5 transition">
            <Download className="w-3.5 h-3.5" />
            <span>Download Inventory</span>
          </button>
        </div>
      </div>

      {/* Sellbrite Alert Banner matching Image 2 */}
      <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-center space-x-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          Use Sellbrite as primary inventory mode is enabled. Please use Sellbrite for updating inventory or change mode from{" "}
          <Link href="/admin/settings" className="font-semibold underline text-amber-800">
            Sellbrite setting
          </Link>.
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button className="h-8 px-3 text-xs font-medium bg-emerald-600 text-white rounded-md flex items-center space-x-1">
            <span>Filter by categories</span>
          </button>
          <button
            onClick={() => {
              setSearch("");
              setWarehouse("all");
              setActiveTab("all");
            }}
            title="Reset filters"
            className="w-8 h-8 rounded-md bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 cursor-pointer select-none text-xs text-slate-600">
            <span>Display Inactive</span>
            <div
              onClick={() => setDisplayInactive(!displayInactive)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                displayInactive ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  displayInactive ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
          </label>

          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="h-8 pl-3 pr-7 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44"
            />
            <Search className="w-3.5 h-3.5 absolute right-2 top-2.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Warehouse Selector */}
      <div className="w-64">
        <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
          Warehouse
        </label>
        <select
          value={warehouse}
          onChange={(e) => setWarehouse(e.target.value)}
          className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="all">All Warehouses</option>
          <option value="gyanwarehouse">gyanwarehouse</option>
        </select>
      </div>

      {/* Tabs matching Image 2 */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-2 px-3 text-xs font-semibold transition border-b-2 ${
            activeTab === "all"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          All ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("low")}
          className={`pb-2 px-3 text-xs font-semibold transition border-b-2 ${
            activeTab === "low"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Low Inventory (0)
        </button>
        <button
          onClick={() => setActiveTab("none")}
          className={`pb-2 px-3 text-xs font-semibold transition border-b-2 ${
            activeTab === "none"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          No Inventory (0)
        </button>
        <button
          onClick={() => setActiveTab("soldout")}
          className={`pb-2 px-3 text-xs font-semibold transition border-b-2 ${
            activeTab === "soldout"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Sold Out/Inactive ({products.filter((p) => p.isSoldOut).length})
        </button>
      </div>

      {/* Inventory Data Table matching Image 2 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3">Item No.</th>
              <th className="p-3">Product Status</th>
              <th className="p-3">Name</th>
              <th className="p-3">Warehouse</th>
              <th className="p-3">Mini stock</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Current Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition">
                <td className="p-3 font-mono font-medium text-slate-800">{item.sku}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-600 text-white">
                    Active
                  </span>
                </td>
                <td className="p-3 font-medium text-slate-800 flex items-center space-x-1.5">
                  <span>{item.name}</span>
                  {Boolean(item.assetIds && item.assetIds.length > 0) && (
                    <span
                      title={`${item.assetIds?.length} media asset(s) linked`}
                      className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px]"
                    >
                      {item.assetIds?.length} media
                    </span>
                  )}
                </td>
                <td className="p-3 text-slate-600">{item.warehouse || "gyanwarehouse"}</td>
                <td className="p-3 text-slate-600">{item.minStock}</td>
                <td className="p-3">
                  {item.isSoldOut ? (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500 text-white">
                      Sold Out
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white">
                      Available
                    </span>
                  )}
                </td>
                <td className="p-3 text-right font-semibold text-slate-800 font-mono">
                  {item.currentStock}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
