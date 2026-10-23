"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Download,
  Upload,
  Tag,
  Plus,
  RotateCcw,
  Search,
  ChevronDown,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { ProductRecord, CategoryRecord } from "@/core/db/store";
import { ProductFormModal } from "@/modules/products/components/ProductFormModal";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);

  // Open Actions Dropdown row tracker
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedStatus !== "All") params.set("status", selectedStatus);
      if (selectedCategoryId !== "all") params.set("categoryId", selectedCategoryId);

      const [pRes, cRes] = await Promise.all([
        fetch(`/api/products?${params.toString()}`),
        fetch(`/api/categories?format=flat`),
      ]);

      const [pJson, cJson] = await Promise.all([pRes.json(), cRes.json()]);

      if (pJson.data) setProducts(pJson.data);
      if (cJson.data) setCategories(cJson.data);
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  }, [search, selectedStatus, selectedCategoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedStatus("All");
    setSelectedCategoryId("all");
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (prod: ProductRecord) => {
    setEditingProduct(prod);
    setIsFormModalOpen(true);
    setOpenActionId(null);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete product "${name}"?`)) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      loadData();
    } catch {
      alert("Failed to delete product.");
    }
  };

  const handleSyncGoogleMerchant = async (prod: ProductRecord) => {
    try {
      const res = await fetch("/api/products/google-merchant/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: prod.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.message || "Google Merchant sync failed.");
      } else {
        alert(json.message || `Product "${prod.name}" synced to Google Merchant.`);
        loadData();
      }
    } catch {
      alert("Error syncing to Google Merchant.");
    }
    setOpenActionId(null);
  };

  const handleExportProducts = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["SKU,Name,Price,Stock,Status,Categories,GoogleMerchantSync"]
        .concat(
          products.map(
            (p) =>
              `"${p.sku}","${p.name}",${p.price},${p.currentStock},"${p.status}","${p.categoryNames?.join(" | ")}",${p.googleMerchantSync}`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `products_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Header matching Image 2 */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Manage Products</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            <span className="text-emerald-600 font-medium">Products</span> / Manage Products
          </p>
        </div>

        {/* Action Buttons Toolbar matching Image 2 */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportProducts}
            className="h-8 px-3 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Products</span>
          </button>

          <button
            type="button"
            onClick={() => alert("Upload Products CSV file wizard")}
            className="h-8 px-3 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Products</span>
          </button>

          <button
            type="button"
            onClick={() => alert("Configure Cross Promotions")}
            className="h-8 px-3 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Cross Promotions</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-8 px-3.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-md flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Products</span>
          </button>

          <button
            type="button"
            onClick={() => alert("Add Product Combination matrix")}
            className="h-8 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Add Combination</span>
          </button>
        </div>
      </div>

      {/* Filter Row matching Image 2 */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-8 px-3 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer min-w-[120px]"
          >
            <option value="All">All</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Category Dropdown Filter */}
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="h-8 px-3 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">Filter by categories (All)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.level > 0 ? `↳ ${c.name}` : c.name}
              </option>
            ))}
          </select>

          {/* Reset Filter Button */}
          <button
            type="button"
            onClick={handleResetFilters}
            title="Reset Filters"
            className="w-8 h-8 rounded-md bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search Input matching Image 2 */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="h-8 pl-3 pr-7 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48 sm:w-60"
          />
          <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Products Table matching Image 2 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3 w-24">Status</th>
              <th className="p-3 w-28">Image</th>
              <th className="p-3 w-44">Item No</th>
              <th className="p-3 w-48">Name</th>
              <th className="p-3">Main Category</th>
              <th className="p-3 text-right w-36">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-400">
                  Loading catalog products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-400">
                  No products found. Click &quot;+ Add Products&quot; to create one.
                </td>
              </tr>
            ) : (
              products.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition group">
                  {/* Status Badge */}
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white">
                      {item.status.toLowerCase()}
                    </span>
                  </td>

                  {/* Image Column: Thumbnail or "NO IMAGE AVAILABLE" */}
                  <td className="p-3">
                    {item.mainImage ? (
                      <div className="w-16 h-16 rounded border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.mainImage}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 p-1 text-center">
                        <ImageIcon className="w-5 h-5 text-slate-300" />
                        <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-tighter leading-tight mt-0.5">
                          NO IMAGE AVAILABLE
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Item No (SKU + UPC) */}
                  <td className="p-3">
                    <p className="font-semibold text-blue-600 hover:underline cursor-pointer">
                      {item.sku}
                    </p>
                    {item.upc && (
                      <p className="text-[11px] font-mono text-slate-700 mt-0.5 font-bold">
                        {item.upc}
                      </p>
                    )}
                  </td>

                  {/* Product Name */}
                  <td className="p-3">
                    <p className="font-medium text-slate-800 hover:text-emerald-700 cursor-pointer">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      ${item.price.toFixed(2)} USD • Stock: {item.currentStock}
                    </p>
                  </td>

                  {/* Main Category Column matching Image 2 */}
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.categoryNames && item.categoryNames.length > 0 ? (
                        item.categoryNames.map((catName, idx) => (
                          <span
                            key={idx}
                            className="text-xs text-blue-600 font-medium hover:underline cursor-pointer"
                          >
                            {catName}
                            {idx < item.categoryNames!.length - 1 && " , "}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">other</span>
                      )}
                    </div>

                    {/* Google Merchant Sync Indicator */}
                    {item.googleMerchantSync && (
                      <div className="mt-1 flex items-center space-x-1 text-[10px] text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Google Merchant: {item.googleSyncStatus || "SYNCED"}</span>
                      </div>
                    )}
                  </td>

                  {/* Actions Dropdown Button matching Image 2 */}
                  <td className="p-3 text-right relative">
                    <div className="inline-block text-left">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenActionId(openActionId === item.id ? null : item.id)
                        }
                        className="h-7 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded flex items-center space-x-1 transition shadow-xs cursor-pointer"
                      >
                        <span>Actions</span>
                        <ChevronDown className="w-3 h-3 ml-0.5" />
                      </button>

                      {/* Dropdown Menu */}
                      {openActionId === item.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-left">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="w-full px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Edit Product</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSyncGoogleMerchant(item)}
                            className="w-full px-3.5 py-1.5 text-xs text-blue-600 hover:bg-blue-50 flex items-center space-x-2 transition cursor-pointer font-medium"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                            <span>Sync to Google Merchant</span>
                          </button>

                          <a
                            href="/api/products/google-merchant/feed"
                            target="_blank"
                            rel="noreferrer"
                            className="w-full px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 flex items-center space-x-2 transition cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                            <span>View Google Feed XML</span>
                          </a>

                          <div className="my-1 border-t border-slate-100" />

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(item.id, item.name)}
                            className="w-full px-3.5 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            <span>Delete Product</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Product Add / Edit Modal with Asset Selector and Google Merchant */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        product={editingProduct}
        onProductSaved={() => {
          loadData();
        }}
      />
    </div>
  );
}
