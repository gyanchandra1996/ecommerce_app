"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Package,
  Layers,
  Image as ImageIcon,
  Check,
  Star,
  Trash2,
  Loader2,
  ExternalLink,
  Plus,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { ProductRecord, CategoryRecord } from "@/core/db/store";
import { Asset } from "@/modules/assets/types/asset.types";
import { AssetSelectorModal } from "@/modules/assets/components/AssetSelectorModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductRecord | null;
  onProductSaved: () => void;
}

export function ProductFormModal({ isOpen, onClose, product, onProductSaved }: Props) {
  const [activeTab, setActiveTab] = useState<"general" | "categories" | "media" | "google">("general");

  // Form State
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [upc, setUpc] = useState("");
  const [price, setPrice] = useState("0");
  const [comparePrice, setComparePrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [currentStock, setCurrentStock] = useState("50");
  const [minStock, setMinStock] = useState("10");
  const [warehouse, setWarehouse] = useState("gyanwarehouse");
  const [status, setStatus] = useState<"ACTIVE" | "DRAFT" | "ARCHIVED">("ACTIVE");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");

  // Categories Selection State
  const [allCategories, setAllCategories] = useState<CategoryRecord[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Media Selection State
  const [selectedAssets, setSelectedAssets] = useState<Array<{ id: string; url: string; name: string; isPrimary: boolean }>>([]);
  const [isAssetSelectorOpen, setIsAssetSelectorOpen] = useState(false);

  // Google Merchant State
  const [googleMerchantSync, setGoogleMerchantSync] = useState(false);
  const [googleCategory, setGoogleCategory] = useState("Apparel & Accessories > Clothing");
  const [googleCondition, setGoogleCondition] = useState("new");
  const [googleBrand, setGoogleBrand] = useState("");
  const [googleGtin, setGoogleGtin] = useState("");
  const [googleMpn, setGoogleMpn] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Categories
  useEffect(() => {
    if (isOpen) {
      fetch("/api/categories?format=flat")
        .then((res) => res.json())
        .then((json) => {
          if (json.data) setAllCategories(json.data);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Populate Form if Editing
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setSku(product.sku || "");
      setUpc(product.upc || "");
      setPrice(product.price ? product.price.toString() : "0");
      setComparePrice(product.comparePrice ? product.comparePrice.toString() : "");
      setCostPrice(product.costPrice ? product.costPrice.toString() : "");
      setCurrentStock(product.currentStock !== undefined ? product.currentStock.toString() : "50");
      setMinStock(product.minStock !== undefined ? product.minStock.toString() : "10");
      setWarehouse(product.warehouse || "gyanwarehouse");
      setStatus(product.status || "ACTIVE");
      setBrand(product.brand || "");
      setDescription(product.description || "");

      setSelectedCategoryIds(product.categoryIds || []);

      if (product.assets && product.assets.length > 0) {
        setSelectedAssets(product.assets);
      } else if (product.mainImage) {
        setSelectedAssets([{ id: "temp", url: product.mainImage, name: "Product Image", isPrimary: true }]);
      } else {
        setSelectedAssets([]);
      }

      setGoogleMerchantSync(Boolean(product.googleMerchantSync));
      setGoogleCategory(product.googleCategory || "Apparel & Accessories > Clothing");
      setGoogleCondition(product.googleCondition || "new");
      setGoogleBrand(product.googleBrand || product.brand || "");
      setGoogleGtin(product.googleGtin || product.upc || "");
      setGoogleMpn(product.googleMpn || product.sku || "");
    } else {
      // Reset defaults
      setName("");
      setSku("item-" + Math.floor(100000 + Math.random() * 900000));
      setUpc("UPC:" + Math.floor(100000000000 + Math.random() * 900000000000));
      setPrice("49.99");
      setComparePrice("69.99");
      setCostPrice("25.00");
      setCurrentStock("50");
      setMinStock("10");
      setWarehouse("gyanwarehouse");
      setStatus("ACTIVE");
      setBrand("Tagateway");
      setDescription("");
      setSelectedCategoryIds(["cat_other"]);
      setSelectedAssets([]);
      setGoogleMerchantSync(true);
      setGoogleCategory("Apparel & Accessories > Clothing");
      setGoogleCondition("new");
      setGoogleBrand("Tagateway");
      setGoogleGtin("");
      setGoogleMpn("");
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleToggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleAssetsChosen = (assets: Asset[]) => {
    const formatted = assets.map((a, idx) => ({
      id: a.id,
      url: a.url,
      name: a.name,
      isPrimary: selectedAssets.length === 0 ? idx === 0 : false,
    }));

    // Merge without duplicates
    setSelectedAssets((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const newItems = formatted.filter((f) => !existingIds.has(f.id));
      const combined = [...prev, ...newItems];
      if (combined.length > 0 && !combined.some((c) => c.isPrimary)) {
        combined[0].isPrimary = true;
      }
      return combined;
    });
  };

  const handleSetPrimaryAsset = (assetId: string) => {
    setSelectedAssets((prev) =>
      prev.map((a) => ({ ...a, isPrimary: a.id === assetId }))
    );
  };

  const handleRemoveAsset = (assetId: string) => {
    setSelectedAssets((prev) => {
      const remaining = prev.filter((a) => a.id !== assetId);
      if (remaining.length > 0 && !remaining.some((r) => r.isPrimary)) {
        remaining[0].isPrimary = true;
      }
      return remaining;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim()) {
      setError("Item No. / SKU and Product Name are required.");
      return;
    }

    setSaving(true);
    setError(null);

    const primaryAsset = selectedAssets.find((a) => a.isPrimary) || selectedAssets[0];

    const payload = {
      sku: sku.trim(),
      upc: upc.trim(),
      name: name.trim(),
      description,
      price: parseFloat(price) || 0,
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      costPrice: costPrice ? parseFloat(costPrice) : null,
      currentStock: parseInt(currentStock, 10) || 0,
      minStock: parseInt(minStock, 10) || 0,
      warehouse,
      status,
      brand,
      categoryIds: selectedCategoryIds,
      assetIds: selectedAssets.map((a) => a.id),
      primaryAssetId: primaryAsset?.id,

      // Google Merchant Center Fields
      googleMerchantSync,
      googleCategory,
      googleCondition,
      googleBrand: googleBrand || brand,
      googleGtin: googleGtin || upc,
      googleMpn: googleMpn || sku,
    };

    try {
      const url = product ? `/api/products/${product.id}` : `/api/products`;
      const method = product ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to save product.");
      }

      onProductSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  {product ? `Edit Product: ${product.name}` : "Add New Product"}
                </h2>
                <p className="text-xs text-slate-500">
                  Configure inventory, hierarchical categories, media assets, and Google Merchant Center sync
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/40 px-6 gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`py-3 px-3 border-b-2 transition ${
                activeTab === "general"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              General Information
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("categories")}
              className={`py-3 px-3 border-b-2 transition flex items-center space-x-1.5 ${
                activeTab === "categories"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Categories ({selectedCategoryIds.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("media")}
              className={`py-3 px-3 border-b-2 transition flex items-center space-x-1.5 ${
                activeTab === "media"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Product Media ({selectedAssets.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("google")}
              className={`py-3 px-3 border-b-2 transition flex items-center space-x-1.5 ${
                activeTab === "google"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Google Merchant Center</span>
              {googleMerchantSync && (
                <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.2 rounded font-bold">
                  ACTIVE
                </span>
              )}
            </button>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Modal Form Body */}
          <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            {/* TAB 1: General Info */}
            {activeTab === "general" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. tablet-t210, laptop-l2150"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Item No. / SKU *
                    </label>
                    <input
                      type="text"
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="e.g. t210, mar2832023"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      UPC / Barcode (GTIN)
                    </label>
                    <input
                      type="text"
                      value={upc}
                      onChange={(e) => setUpc(e.target.value)}
                      placeholder="e.g. UPC:854632148711"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Tagateway Tech, Apple, Nike"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Warehouse
                    </label>
                    <select
                      value={warehouse}
                      onChange={(e) => setWarehouse(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                    >
                      <option value="gyanwarehouse">gyanwarehouse</option>
                      <option value="main-distribution">main-distribution</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Selling Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Compare at Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={comparePrice}
                      onChange={(e) => setComparePrice(e.target.value)}
                      placeholder="Original/MSRP price"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Product Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as "ACTIVE" | "DRAFT" | "ARCHIVED")}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="DRAFT">Draft</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Current Stock Count
                    </label>
                    <input
                      type="number"
                      value={currentStock}
                      onChange={(e) => setCurrentStock(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Minimum Stock Alert (Mini stock)
                    </label>
                    <input
                      type="number"
                      value={minStock}
                      onChange={(e) => setMinStock(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Product details, specs, package contents..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Categories Hierarchy (Category, Subcategory, Subcategory) */}
            {activeTab === "categories" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">Hierarchical Category Mapping</p>
                  <p className="mt-0.5 text-slate-500">
                    Assign this product to Categories, Subcategories, and Sub-subcategories. Selected categories will display on the product table (e.g. <code>other, grocery, sportshoes</code>).
                  </p>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-white divide-y divide-slate-100">
                  {allCategories.map((cat) => {
                    const isChecked = selectedCategoryIds.includes(cat.id);
                    return (
                      <label
                        key={cat.id}
                        className="py-2 px-2 flex items-center justify-between hover:bg-slate-50 rounded-lg cursor-pointer transition select-none"
                        style={{ paddingLeft: `${(cat.level || 0) * 20 + 8}px` }}
                      >
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleCategory(cat.id)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                          />
                          <span
                            className={`text-xs ${
                              cat.level === 0
                                ? "font-bold text-slate-800"
                                : cat.level === 1
                                ? "font-medium text-slate-700"
                                : "text-slate-600"
                            }`}
                          >
                            {cat.level > 0 && <span className="text-slate-400 mr-1.5">↳</span>}
                            {cat.name}
                          </span>
                        </div>

                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                          {cat.level === 0 ? "Root Category" : cat.level === 1 ? "Subcategory" : "Sub-subcategory"}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: Media Selection via Modal */}
            {activeTab === "media" && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Media Assets for this Product</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select high-resolution product photos, 360 views, or demo videos from your media library.
                    </p>
                  </div>

                  {/* USER REQUIREMENT: "when we add product image, we can open modal asset modal, then select image" */}
                  <button
                    type="button"
                    onClick={() => setIsAssetSelectorOpen(true)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition flex items-center space-x-2 shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Open Asset Modal</span>
                  </button>
                </div>

                {selectedAssets.length === 0 ? (
                  <div
                    onClick={() => setIsAssetSelectorOpen(true)}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-10 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition"
                  >
                    <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">No images or media selected yet</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Click here to open the Asset Management Modal and attach images
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {selectedAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className={`relative rounded-xl border bg-white overflow-hidden p-2 flex flex-col group ${
                          asset.isPrimary
                            ? "border-emerald-600 ring-2 ring-emerald-500/20 shadow-md"
                            : "border-slate-200"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden mb-2 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={asset.url}
                            alt=""
                            className="max-h-full max-w-full object-contain"
                          />
                          {asset.isPrimary && (
                            <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center space-x-1">
                              <Star className="w-2.5 h-2.5 fill-white" />
                              <span>PRIMARY</span>
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] font-medium text-slate-700 truncate mb-2">
                          {asset.name}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                          {!asset.isPrimary ? (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryAsset(asset.id)}
                              className="text-[10px] text-emerald-700 hover:underline font-semibold"
                            >
                              Make Primary
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center">
                              <Check className="w-3 h-3 mr-0.5" /> Main Image
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveAsset(asset.id)}
                            className="text-slate-400 hover:text-red-600 p-1 transition"
                            title="Remove from product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: Google Merchant Center Functionality */}
            {activeTab === "google" && (
              <div className="space-y-5">
                {/* Integration Header Card */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                      G
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                        <span>Google Merchant Center Feed Sync</span>
                        {googleMerchantSync ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            Enabled
                          </span>
                        ) : (
                          <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                            Disabled
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        Publish your products to Google Shopping, Free Listings, and Google Ads feeds directly from Tagateway.
                      </p>
                    </div>
                  </div>

                  {/* Switch */}
                  <label className="flex items-center space-x-2 cursor-pointer select-none shrink-0">
                    <div
                      onClick={() => setGoogleMerchantSync(!googleMerchantSync)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        googleMerchantSync ? "bg-blue-600" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          googleMerchantSync ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </label>
                </div>

                {googleMerchantSync && (
                  <div className="space-y-4 p-4 rounded-xl border border-slate-200 bg-white">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Google Product Category (GPC) *
                      </label>
                      <input
                        type="text"
                        value={googleCategory}
                        onChange={(e) => setGoogleCategory(e.target.value)}
                        placeholder="e.g. Apparel & Accessories > Clothing > Shirts & Tops"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Standard taxonomy used by Google algorithms to categorize search queries.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Condition
                        </label>
                        <select
                          value={googleCondition}
                          onChange={(e) => setGoogleCondition(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        >
                          <option value="new">New (Brand New Factory Sealed)</option>
                          <option value="refurbished">Refurbished</option>
                          <option value="used">Used</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Google Brand
                        </label>
                        <input
                          type="text"
                          value={googleBrand}
                          onChange={(e) => setGoogleBrand(e.target.value)}
                          placeholder={brand || "Tagateway"}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          GTIN (UPC / EAN / ISBN)
                        </label>
                        <input
                          type="text"
                          value={googleGtin}
                          onChange={(e) => setGoogleGtin(e.target.value)}
                          placeholder={upc || "854632148711"}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          MPN (Manufacturer Part Number)
                        </label>
                        <input
                          type="text"
                          value={googleMpn}
                          onChange={(e) => setGoogleMpn(e.target.value)}
                          placeholder={sku || "SKU-PROD-01"}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href="/api/products/google-merchant/feed"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center space-x-1"
                      >
                        <span>Preview Google Merchant XML Feed</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <span className="text-[11px] text-slate-400 font-mono">
                        Target Country: US / Global
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Modal Bottom Action Bar */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              {product ? `Editing SKU: ${product.sku}` : "Creating new catalog item"}
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="product-form"
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Product...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save & Publish Product</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Selector Modal (User requirement: "when we add product image, we can open modal asset modal, then select image") */}
      <AssetSelectorModal
        isOpen={isAssetSelectorOpen}
        onClose={() => setIsAssetSelectorOpen(false)}
        selectedAssetIds={selectedAssets.map((a) => a.id)}
        onConfirmSelection={handleAssetsChosen}
        multiSelect={true}
      />
    </>
  );
}
