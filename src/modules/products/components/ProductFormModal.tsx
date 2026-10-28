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
  Boxes,
  Copy,
  Tag,
} from "lucide-react";
import { ProductRecord, CategoryRecord, ProductVariantRecord, VariantAttributeOption } from "@/core/db/store";
import { Asset } from "@/modules/assets/types/asset.types";
import { AssetSelectorModal } from "@/modules/assets/components/AssetSelectorModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductRecord | null;
  onProductSaved: () => void;
}

export function ProductFormModal({ isOpen, onClose, product, onProductSaved }: Props) {
  const [activeTab, setActiveTab] = useState<"general" | "categories" | "media" | "variants" | "google">("general");

  // Form State
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [upc, setUpc] = useState("");
  const [price, setPrice] = useState("0");
  const [comparePrice, setComparePrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [currentStock, setCurrentStock] = useState("50");
  const [minStock, setMinStock] = useState("10");
  const [warehouse, setWarehouse] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [manufacturerId, setManufacturerId] = useState("");
  const [activeWarehouses, setActiveWarehouses] = useState<Array<{ id: string; name: string }>>([]);
  const [activeManufacturers, setActiveManufacturers] = useState<Array<{ id: string; name: string }>>([]);
  const [status, setStatus] = useState<"ACTIVE" | "DRAFT" | "ARCHIVED">("ACTIVE");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");

  // Product Variants State
  const [hasVariants, setHasVariants] = useState(false);
  const [variantAttributes, setVariantAttributes] = useState<VariantAttributeOption[]>([]);
  const [variants, setVariants] = useState<Array<{
    id?: string;
    sku: string;
    price: number;
    comparePrice?: number | null;
    costPrice?: number | null;
    currentStock: number;
    isActive: boolean;
    image?: string | null;
    attributes: Record<string, string>;
  }>>([]);
  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrValues, setNewAttrValues] = useState("");

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

  // Load Categories, Warehouses, and Manufacturers
  useEffect(() => {
    if (isOpen) {
      fetch("/api/categories?format=flat")
        .then((res) => res.json())
        .then((json) => {
          if (json.data) setAllCategories(json.data);
        })
        .catch(() => {});

      // Fetch active warehouses for mandatory selection
      fetch("/api/warehouses")
        .then((res) => res.json())
        .then((json) => {
          if (json.data && Array.isArray(json.data)) {
            const activeList = json.data.filter((w: any) => w.isActive !== false);
            setActiveWarehouses(activeList);
            if (!product && activeList.length > 0) {
              setWarehouseId(activeList[0].id);
              setWarehouse(activeList[0].name);
            }
          }
        })
        .catch(() => {});

      // Fetch active manufacturers
      fetch("/api/manufacturers")
        .then((res) => res.json())
        .then((json) => {
          if (json.data && Array.isArray(json.data)) {
            const activeList = json.data.filter((m: any) => m.isActive !== false);
            setActiveManufacturers(activeList);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, product]);

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
      setWarehouse(product.warehouse || "");
      setWarehouseId(product.warehouseId || "");
      setManufacturerId((product as any).manufacturerId || "");
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

      // Load variants
      setHasVariants(Boolean(product.hasVariants || (product.variants && product.variants.length > 0)));
      setVariantAttributes(product.variantAttributes || []);
      setVariants(
        (product.variants || []).map((v) => ({
          id: v.id,
          sku: v.sku,
          price: Number(v.price),
          comparePrice: v.comparePrice !== undefined && v.comparePrice !== null ? Number(v.comparePrice) : null,
          costPrice: v.costPrice !== undefined && v.costPrice !== null ? Number(v.costPrice) : null,
          currentStock: Number(v.currentStock) || 0,
          isActive: v.isActive !== false,
          image: v.image || null,
          attributes: v.attributes || {},
        }))
      );
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
      setWarehouse(activeWarehouses[0]?.name || "gyanwarehouse");
      setWarehouseId(activeWarehouses[0]?.id || "");
      setManufacturerId("");
      setStatus("ACTIVE");
      setBrand("emox");
      setDescription("");
      setSelectedCategoryIds(["cat_other"]);
      setSelectedAssets([]);
      setGoogleMerchantSync(true);
      setGoogleCategory("Apparel & Accessories > Clothing");
      setGoogleCondition("new");
      setGoogleBrand("emox");
      setGoogleGtin("");
      setGoogleMpn("");

      // Reset variants
      setHasVariants(false);
      setVariantAttributes([]);
      setVariants([]);
      setNewAttrName("");
      setNewAttrValues("");
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleToggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleAddAttribute = () => {
    const trimmedName = newAttrName.trim();
    if (!trimmedName) return;

    if (variantAttributes.some((a) => a.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError(`Option "${trimmedName}" already exists.`);
      return;
    }

    const values = newAttrValues
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    setVariantAttributes([...variantAttributes, { name: trimmedName, values }]);
    setNewAttrName("");
    setNewAttrValues("");
    setError(null);
  };

  const handleRemoveAttribute = (nameToRemove: string) => {
    setVariantAttributes(variantAttributes.filter((a) => a.name !== nameToRemove));
    setVariants((prev) =>
      prev.map((v) => {
        const nextAttrs = { ...v.attributes };
        delete nextAttrs[nameToRemove];
        return { ...v, attributes: nextAttrs };
      })
    );
  };

  const handleAddValueToAttr = (attrName: string, val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    setVariantAttributes((prev) =>
      prev.map((a) => {
        if (a.name === attrName && !a.values.includes(trimmed)) {
          return { ...a, values: [...a.values, trimmed] };
        }
        return a;
      })
    );
  };

  const handleRemoveValueFromAttr = (attrName: string, valToRemove: string) => {
    setVariantAttributes((prev) =>
      prev.map((a) => {
        if (a.name === attrName) {
          return { ...a, values: a.values.filter((v) => v !== valToRemove) };
        }
        return a;
      })
    );
  };

  const generateCombinations = () => {
    const validAttrs = variantAttributes.filter((a) => a.name && a.values.length > 0);
    if (validAttrs.length === 0) {
      setError("Please add at least one option (e.g. Size or Color) with values before generating combinations.");
      return;
    }

    let combos: Record<string, string>[] = [{}];
    for (const attr of validAttrs) {
      const nextCombos: Record<string, string>[] = [];
      for (const combo of combos) {
        for (const val of attr.values) {
          nextCombos.push({ ...combo, [attr.name]: val });
        }
      }
      combos = nextCombos;
    }

    const updatedVariants = combos.map((combo) => {
      const existing = variants.find((v) => {
        const keys = Object.keys(combo);
        return (
          keys.every((k) => v.attributes[k] === combo[k]) &&
          Object.keys(v.attributes).length === keys.length
        );
      });

      if (existing) {
        return existing;
      }

      const slugSuffix = Object.values(combo)
        .join("-")
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, "");

      const baseSku = sku.trim() || "ITEM";
      const variantSku = `${baseSku}-${slugSuffix}`;

      return {
        sku: variantSku,
        price: parseFloat(price) || 0,
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        currentStock: parseInt(currentStock, 10) || 10,
        isActive: true,
        image: selectedAssets[0]?.url || null,
        attributes: combo,
      };
    });

    setVariants(updatedVariants);
    setError(null);
  };

  const handleUpdateVariant = (index: number, field: string, value: unknown) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleDeleteVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCustomVariant = () => {
    const baseSku = sku.trim() || "ITEM";
    const defaultAttrs: Record<string, string> = {};
    variantAttributes.forEach((a) => {
      if (a.values[0]) defaultAttrs[a.name] = a.values[0];
    });
    setVariants((prev) => [
      ...prev,
      {
        sku: `${baseSku}-VAR${prev.length + 1}`,
        price: parseFloat(price) || 0,
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        currentStock: 10,
        isActive: true,
        image: selectedAssets[0]?.url || null,
        attributes: defaultAttrs,
      },
    ]);
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

    // Validate Variants if enabled
    if (hasVariants && variants.length > 0) {
      const hasEmptySku = variants.some((v) => !v.sku || !v.sku.trim());
      if (hasEmptySku) {
        setError("All variants must have a SKU.");
        setActiveTab("variants");
        setSaving(false);
        return;
      }
      const skus = variants.map((v) => v.sku.trim().toLowerCase());
      if (new Set(skus).size !== skus.length) {
        setError("Variant SKUs must be unique.");
        setActiveTab("variants");
        setSaving(false);
        return;
      }
      const comboKeys = variants.map((v) =>
        Object.entries(v.attributes)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, val]) => `${k}:${val}`)
          .join("|")
      );
      if (new Set(comboKeys).size !== comboKeys.length) {
        setError("Duplicate variant combinations found. Each variant combination must be unique.");
        setActiveTab("variants");
        setSaving(false);
        return;
      }
      const hasNegativeStock = variants.some((v) => Number(v.currentStock) < 0);
      if (hasNegativeStock) {
        setError("Variant stock cannot be negative.");
        setActiveTab("variants");
        setSaving(false);
        return;
      }
    }

    // Mandatory Warehouse Check
    if (!warehouseId && !warehouse) {
      setError("Fulfillment Warehouse is mandatory. Please select an active warehouse.");
      setActiveTab("general");
      setSaving(false);
      return;
    }

    const primaryAsset = selectedAssets.find((a) => a.isPrimary) || selectedAssets[0];

    const selectedWh = activeWarehouses.find((w) => w.id === warehouseId);
    const finalWarehouseName = selectedWh ? selectedWh.name : warehouse || "gyanwarehouse";

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
      warehouse: finalWarehouseName,
      warehouseId: warehouseId || activeWarehouses[0]?.id,
      manufacturerId: manufacturerId || undefined,
      status,
      brand,
      categoryIds: selectedCategoryIds,
      assetIds: selectedAssets.map((a) => a.id),
      primaryAssetId: primaryAsset?.id,

      // Product Variants
      hasVariants,
      variantAttributes: hasVariants ? variantAttributes : [],
      variants: hasVariants
        ? variants.map((v) => ({
            id: v.id,
            sku: v.sku.trim(),
            price: Number(v.price) || 0,
            comparePrice: v.comparePrice !== undefined && v.comparePrice !== null ? Number(v.comparePrice) : null,
            costPrice: v.costPrice !== undefined && v.costPrice !== null ? Number(v.costPrice) : null,
            currentStock: Math.max(0, Number(v.currentStock) || 0),
            isActive: Boolean(v.isActive),
            image: v.image ? v.image.trim() : null,
            attributes: v.attributes || {},
          }))
        : [],

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
              onClick={() => setActiveTab("variants")}
              className={`py-3 px-3 border-b-2 transition flex items-center space-x-1.5 ${
                activeTab === "variants"
                  ? "border-emerald-600 text-emerald-700 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Variants</span>
              {hasVariants && variants.length > 0 && (
                <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {variants.length}
                </span>
              )}
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

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                      placeholder="e.g. emox, Apple, Nike"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Manufacturer
                    </label>
                    <select
                      value={manufacturerId}
                      onChange={(e) => setManufacturerId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                    >
                      <option value="">-- None / Select Manufacturer --</option>
                      {activeManufacturers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fulfillment Warehouse <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={warehouseId}
                      onChange={(e) => {
                        setWarehouseId(e.target.value);
                        const match = activeWarehouses.find((w) => w.id === e.target.value);
                        if (match) setWarehouse(match.name);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-800"
                    >
                      <option value="">-- Select Active Warehouse * --</option>
                      {activeWarehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
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

                {/* Primary Image / Thumbnail Selection via Asset Modal */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Primary Product Thumbnail / Main Image
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAssetSelectorOpen(true)}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{selectedAssets.length > 0 ? "Change / Add Media" : "Select from Assets"}</span>
                    </button>
                  </div>

                  {selectedAssets.length > 0 && selectedAssets.find((a) => a.isPrimary) ? (
                    <div className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedAssets.find((a) => a.isPrimary)!.url}
                          alt="Primary product preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {selectedAssets.find((a) => a.isPrimary)!.name}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Primary Storefront Image ({selectedAssets.length} total attached assets)
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            type="button"
                            onClick={() => setIsAssetSelectorOpen(true)}
                            className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
                          >
                            Open Asset Modal
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab("media")}
                            className="px-2.5 py-1 rounded text-[11px] font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                          >
                            Manage Gallery ({selectedAssets.length})
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsAssetSelectorOpen(true)}
                      className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition flex items-center justify-center space-x-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800">Select or Upload Product Image</p>
                        <p className="text-[10px] text-slate-500">
                          Click to open the Asset Modal to pick an existing image or upload a new one
                        </p>
                      </div>
                    </div>
                  )}
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
                        Publish your products to Google Shopping, Free Listings, and Google Ads feeds directly from emox.
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
                          placeholder={brand || "emox"}
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

            {/* TAB 5: Product Variants */}
            {activeTab === "variants" && (
              <div className="space-y-6">
                {/* Enable Variants Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                      <Boxes className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">
                        Product Variants
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Enable variants if this product has multiple options like Size, Color, or Storage capacity.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer select-none shrink-0">
                    <div
                      onClick={() => {
                        const next = !hasVariants;
                        setHasVariants(next);
                        if (next && variantAttributes.length === 0) {
                          setVariantAttributes([{ name: "Size", values: ["S", "M", "L"] }]);
                        }
                      }}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        hasVariants ? "bg-emerald-600" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          hasVariants ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </label>
                </div>

                {hasVariants && (
                  <>
                    {/* Step 1: Manage Attributes & Options */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Step 1: Define Options & Attributes</h4>
                          <p className="text-[11px] text-slate-500">
                            Specify option names (e.g., Color, Size, Storage) and their possible values.
                          </p>
                        </div>
                      </div>

                      {/* Existing Attributes List */}
                      {variantAttributes.length > 0 && (
                        <div className="space-y-3">
                          {variantAttributes.map((attr, attrIdx) => (
                            <div key={attr.name || attrIdx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                                  {attr.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAttribute(attr.name)}
                                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Remove Option
                                </button>
                              </div>
                              {/* Values tags */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                {attr.values.map((val) => (
                                  <span
                                    key={val}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-slate-300 text-slate-700 shadow-2xs"
                                  >
                                    {val}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveValueFromAttr(attr.name, val)}
                                      className="text-slate-400 hover:text-red-500 ml-0.5"
                                    >
                                      &times;
                                    </button>
                                  </span>
                                ))}
                                {/* Inline add value */}
                                <input
                                  type="text"
                                  placeholder="+ Add value & press Enter"
                                  className="text-xs px-2.5 py-1 rounded border border-dashed border-slate-300 focus:outline-none focus:border-emerald-500 bg-white"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      const target = e.currentTarget;
                                      handleAddValueToAttr(attr.name, target.value);
                                      target.value = "";
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add New Attribute Row */}
                      <div className="pt-2 flex flex-col sm:flex-row gap-2 items-start sm:items-end">
                        <div className="w-full sm:w-1/3">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Option Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Color, Size, Storage, Weight"
                            value={newAttrName}
                            onChange={(e) => setNewAttrName(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="w-full sm:flex-1">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Option Values (comma-separated)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. S, M, L, XL or Black, White, Blue"
                            value={newAttrValues}
                            onChange={(e) => setNewAttrValues(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddAttribute}
                          className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg flex items-center gap-1 shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Option
                        </button>
                      </div>
                    </div>

                    {/* Step 2: Generate Combinations & Manage Matrix */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">
                            Step 2: Variant Combinations ({variants.length})
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Manage unique SKUs, separate pricing, stock quantity, and images for each combination.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={generateCombinations}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-2xs flex items-center gap-1.5 transition"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Generate Combinations
                          </button>
                          <button
                            type="button"
                            onClick={handleAddCustomVariant}
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 flex items-center gap-1 transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Single
                          </button>
                        </div>
                      </div>

                      {variants.length === 0 ? (
                        <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                          <Boxes className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-semibold text-slate-600">No variant combinations generated yet</p>
                          <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
                            Define your options above and click &quot;Generate Combinations&quot; to automatically build all product variants.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/60">
                                <th className="py-2.5 px-2 w-10 text-center">Active</th>
                                <th className="py-2.5 px-3 min-w-[140px]">Variant Combination</th>
                                <th className="py-2.5 px-3 min-w-[130px]">SKU *</th>
                                <th className="py-2.5 px-3 min-w-[90px]">Price ($) *</th>
                                <th className="py-2.5 px-3 min-w-[90px]">Compare ($)</th>
                                <th className="py-2.5 px-3 min-w-[80px]">Stock *</th>
                                <th className="py-2.5 px-3 min-w-[160px]">Image URL</th>
                                <th className="py-2.5 px-2 w-10 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {variants.map((v, idx) => (
                                <tr key={v.id || idx} className={`hover:bg-slate-50/50 ${!v.isActive ? "opacity-60 bg-slate-50/30" : ""}`}>
                                  <td className="py-2 px-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={v.isActive}
                                      onChange={(e) => handleUpdateVariant(idx, "isActive", e.target.checked)}
                                      className="rounded text-emerald-600 focus:ring-emerald-500"
                                    />
                                  </td>
                                  <td className="py-2 px-3">
                                    <div className="flex flex-wrap gap-1 items-center">
                                      {Object.entries(v.attributes).length > 0 ? (
                                        Object.entries(v.attributes).map(([k, val]) => (
                                          <span
                                            key={k}
                                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200"
                                          >
                                            {k}: {val}
                                          </span>
                                        ))
                                      ) : (
                                        <span className="text-[11px] text-slate-400 italic">Default</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-2 px-3">
                                    <input
                                      type="text"
                                      value={v.sku}
                                      onChange={(e) => handleUpdateVariant(idx, "sku", e.target.value)}
                                      className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                  </td>
                                  <td className="py-2 px-3">
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={v.price}
                                      onChange={(e) => handleUpdateVariant(idx, "price", parseFloat(e.target.value) || 0)}
                                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                  </td>
                                  <td className="py-2 px-3">
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      placeholder="None"
                                      value={v.comparePrice ?? ""}
                                      onChange={(e) =>
                                        handleUpdateVariant(
                                          idx,
                                          "comparePrice",
                                          e.target.value ? parseFloat(e.target.value) : null
                                        )
                                      }
                                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                  </td>
                                  <td className="py-2 px-3">
                                    <input
                                      type="number"
                                      min="0"
                                      value={v.currentStock}
                                      onChange={(e) => handleUpdateVariant(idx, "currentStock", parseInt(e.target.value, 10) || 0)}
                                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                                    />
                                  </td>
                                  <td className="py-2 px-3">
                                    <div className="flex items-center gap-1.5">
                                      {v.image && (
                                        <img
                                          src={v.image}
                                          alt="variant thumbnail"
                                          className="w-6 h-6 rounded object-cover border border-slate-200 shrink-0"
                                        />
                                      )}
                                      <input
                                        type="text"
                                        placeholder="Image URL"
                                        value={v.image || ""}
                                        onChange={(e) => handleUpdateVariant(idx, "image", e.target.value || null)}
                                        className="w-full px-2 py-1 text-[11px] rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </div>
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteVariant(idx)}
                                      className="text-slate-400 hover:text-red-500 p-1"
                                      title="Delete variant"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
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
