"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Search,
  Check,
  RefreshCw,
  Percent,
  Sliders,
  Filter,
  Save,
  AlertCircle,
  Package,
} from "lucide-react";

interface ProductPricingItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  comparePrice?: number | null;
  mainImage?: string | null;
  categoryIds?: string[];
  updatedAt: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface PricingSettings {
  strikeThroughPricing: boolean;
  priceSync: boolean;
  priceRounding: boolean;
  defaultAdjustmentType: "%" | "$";
  defaultAdjustmentValue: number;
}

export function ManagePricingView() {
  const [products, setProducts] = useState<ProductPricingItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [settings, setSettings] = useState<PricingSettings>({
    strikeThroughPricing: true,
    priceSync: true,
    priceRounding: false,
    defaultAdjustmentType: "%",
    defaultAdjustmentValue: 10,
  });

  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");

  // Editable price buffer { [id]: { actualPrice: number, specialPrice: number } }
  const [priceEdits, setPriceEdits] = useState<
    Record<string, { actualPrice: number; specialPrice: number; modified: boolean }>
  >({});

  const fetchPricingData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pricing");
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.settings) setSettings(json.data.settings);
        if (json.data.categories) setCategories(json.data.categories);
        if (json.data.products) {
          setProducts(json.data.products);
          // Initialize edits
          const edits: Record<string, { actualPrice: number; specialPrice: number; modified: boolean }> = {};
          json.data.products.forEach((p: ProductPricingItem) => {
            const actual = p.comparePrice && p.comparePrice > p.price ? p.comparePrice : p.price;
            const special = p.comparePrice && p.comparePrice > p.price ? p.price : 0;
            edits[p.id] = {
              actualPrice: actual,
              specialPrice: special,
              modified: false,
            };
          });
          setPriceEdits(edits);
        }
      }
    } catch (err) {
      console.error("Error fetching pricing data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingData();
  }, []);

  const handleToggleSetting = async (key: keyof PricingSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    try {
      await fetch("/api/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: updated[key] }),
      });
      showNotification("Pricing setting updated.");
    } catch (err) {
      console.error("Error updating setting:", err);
    }
  };

  const handlePriceChange = (
    id: string,
    field: "actualPrice" | "specialPrice",
    val: number
  ) => {
    setPriceEdits((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: val,
        modified: true,
      },
    }));
  };

  const handleQuickSaveRow = async (id: string) => {
    const edit = priceEdits[id];
    if (!edit) return;

    try {
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "batch",
          updates: [
            {
              id,
              actualPrice: edit.actualPrice,
              specialPrice: edit.specialPrice > 0 ? edit.specialPrice : undefined,
            },
          ],
        }),
      });

      if (res.ok) {
        setPriceEdits((prev) => ({
          ...prev,
          [id]: { ...prev[id], modified: false },
        }));
        showNotification("Price updated successfully.");
      }
    } catch (err) {
      console.error("Error saving price:", err);
    }
  };

  const handleSaveAll = async () => {
    const modifiedItems = Object.entries(priceEdits)
      .filter(([_, v]) => v.modified)
      .map(([id, v]) => ({
        id,
        actualPrice: v.actualPrice,
        specialPrice: v.specialPrice > 0 ? v.specialPrice : undefined,
      }));

    if (modifiedItems.length === 0) {
      showNotification("No price changes to save.");
      return;
    }

    try {
      setSavingAll(true);
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "batch", updates: modifiedItems }),
      });
      if (res.ok) {
        showNotification(`Saved ${modifiedItems.length} price changes.`);
        fetchPricingData();
      }
    } catch (err) {
      console.error("Error saving all prices:", err);
    } finally {
      setSavingAll(false);
    }
  };

  const handleApplyAdjustment = async () => {
    try {
      setAdjusting(true);
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adjust",
          adjustmentType: settings.defaultAdjustmentType,
          adjustmentValue: settings.defaultAdjustmentValue,
          categoryId: selectedCategory,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showNotification(
          `Applied ${settings.defaultAdjustmentValue}${settings.defaultAdjustmentType} price adjustment to ${json.data.count} products.`
        );
        fetchPricingData();
      }
    } catch (err) {
      console.error("Error applying price adjustment:", err);
    } finally {
      setAdjusting(false);
    }
  };

  const showNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const filteredProducts = products.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      if (!p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (selectedCategory !== "all") {
      if (!p.categoryIds || !p.categoryIds.includes(selectedCategory)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header and Breadcrumb matching Screenshot 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>Manage Pricing</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            <span className="text-emerald-600 font-medium">Product</span> /{" "}
            <span className="text-slate-400">Manage Pricing</span>
          </p>
        </div>

        {statusMessage && (
          <div className="p-2.5 px-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Top Controls Bar (Switches & Price Adjustment) matching Screenshot 5 */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Global Switches matching Screenshot 5 */}
          <div className="flex flex-wrap items-center gap-6">
            {/* Strike-Through Pricing */}
            <label className="flex items-center space-x-2.5 cursor-pointer select-none text-xs font-semibold text-slate-700">
              <span>Strike-Through Pricing:</span>
              <button
                type="button"
                onClick={() => handleToggleSetting("strikeThroughPricing")}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.strikeThroughPricing ? "bg-emerald-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    settings.strikeThroughPricing ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </label>

            {/* Price Sync */}
            <label className="flex items-center space-x-2.5 cursor-pointer select-none text-xs font-semibold text-slate-700">
              <span>Price Sync:</span>
              <button
                type="button"
                onClick={() => handleToggleSetting("priceSync")}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.priceSync ? "bg-emerald-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    settings.priceSync ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </label>

            {/* Price Rounding */}
            <label className="flex items-center space-x-2.5 cursor-pointer select-none text-xs font-semibold text-slate-700">
              <span>Price Rounding:</span>
              <button
                type="button"
                onClick={() => handleToggleSetting("priceRounding")}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.priceRounding ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    settings.priceRounding ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Price Adjustment Controls matching Screenshot 5 */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-700">Price Adjustment:</span>
            <select
              value={settings.defaultAdjustmentType}
              onChange={(e) =>
                setSettings({ ...settings, defaultAdjustmentType: e.target.value as "%" | "$" })
              }
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="%">%</option>
              <option value="$">$</option>
            </select>
            <input
              type="number"
              value={settings.defaultAdjustmentValue}
              onChange={(e) =>
                setSettings({ ...settings, defaultAdjustmentValue: Number(e.target.value) })
              }
              className="w-16 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleApplyAdjustment}
              disabled={adjusting}
              className="h-8 px-3.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-md shadow-xs flex items-center space-x-1.5 transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{adjusting ? "Applying..." : "Apply"}</span>
            </button>
          </div>
        </div>

        {/* Filter Bar: Category Selector, Search & Save All Changes */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search Item No or Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={savingAll}
            className="h-8 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-md shadow-xs flex items-center space-x-1.5 transition self-end sm:self-auto"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingAll ? "Saving..." : "Save All Changes"}</span>
          </button>
        </div>
      </div>

      {/* Editable Pricing Table matching Screenshot 5 */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Item No *</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Actual Price</th>
                <th className="py-3 px-4">Special Price</th>
                <th className="py-3 px-4">Modified Date</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading pricing records...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No products match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const edit = priceEdits[p.id] || {
                    actualPrice: p.price,
                    specialPrice: p.comparePrice || 0,
                    modified: false,
                  };

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50 transition ${
                        edit.modified ? "bg-amber-50/50" : ""
                      }`}
                    >
                      {/* Item No (SKU) */}
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {p.sku}
                      </td>

                      {/* Product Name with Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {p.mainImage ? (
                              <img
                                src={p.mainImage}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <span className="font-medium text-slate-800 line-clamp-1 max-w-[220px]">
                            {p.name}
                          </span>
                        </div>
                      </td>

                      {/* Actual Price Input */}
                      <td className="py-3 px-4">
                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-2 text-slate-400 text-xs">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={edit.actualPrice}
                            onChange={(e) =>
                              handlePriceChange(p.id, "actualPrice", Number(e.target.value))
                            }
                            className="w-full pl-6 pr-2 py-1.5 text-xs rounded-md border border-slate-300 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </td>

                      {/* Special Price Input */}
                      <td className="py-3 px-4">
                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-2 text-slate-400 text-xs">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={edit.specialPrice || ""}
                            placeholder="Optional"
                            onChange={(e) =>
                              handlePriceChange(p.id, "specialPrice", Number(e.target.value))
                            }
                            className="w-full pl-6 pr-2 py-1.5 text-xs rounded-md border border-slate-300 font-mono font-semibold text-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </td>

                      {/* Modified Date */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "-"}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleQuickSaveRow(p.id)}
                          className={`px-3 py-1 text-xs font-semibold rounded-md shadow-xs transition flex items-center space-x-1 mx-auto ${
                            edit.modified
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                          title="Save Price"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
