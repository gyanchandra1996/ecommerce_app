"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Folder,
  Layers,
  Package,
  ExternalLink,
  Search,
  Edit3,
  Calendar,
  Warehouse,
  Tag,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { CategoryRecord } from "@/core/db/store";
import Link from "next/link";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryRecord | null;
  allCategories: CategoryRecord[];
  onEditCategory?: (category: CategoryRecord) => void;
}

interface ProductItem {
  id: string;
  name?: string;
  title?: string;
  slug?: string;
  sku?: string;
  price?: number;
  currentStock?: number;
  stockQuantity?: number;
  mainImage?: string;
  warehouse?: string;
  warehouseName?: string;
  brand?: string;
  manufacturerName?: string;
  status?: string;
}

export function ViewCategoryModal({
  isOpen,
  onClose,
  category,
  allCategories,
  onEditCategory,
}: Props) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    if (isOpen && category?.id) {
      setLoadingProducts(true);
      fetch(`/api/products?categoryId=${encodeURIComponent(category.id)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.data && Array.isArray(json.data)) {
            setProducts(json.data);
          } else {
            setProducts([]);
          }
        })
        .catch(() => {
          setProducts([]);
        })
        .finally(() => {
          setLoadingProducts(false);
        });
    } else {
      setProducts([]);
    }
  }, [isOpen, category?.id]);

  if (!isOpen || !category) return null;

  // Compute breadcrumb path: e.g. Electronics > Smartphone
  const buildBreadcrumbs = (): string[] => {
    const chain: string[] = [category.name];
    let currentParentId = category.parentId;
    const visited = new Set<string>();

    while (currentParentId && !visited.has(currentParentId)) {
      visited.add(currentParentId);
      const parent = allCategories.find((c) => c.id === currentParentId);
      if (parent) {
        chain.unshift(parent.name);
        currentParentId = parent.parentId;
      } else {
        break;
      }
    }
    return chain;
  };

  const breadcrumbs = buildBreadcrumbs();

  const filteredProducts = products.filter((p) => {
    const name = p.name || p.title || "";
    const sku = p.sku || "";
    const brand = p.brand || p.manufacturerName || "";
    const q = productSearch.toLowerCase();
    return name.toLowerCase().includes(q) || sku.toLowerCase().includes(q) || brand.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center space-x-3 min-w-0">
            {category.image ? (
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 shrink-0 overflow-hidden shadow-2xs">
                <img src={category.image} alt={category.name} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                <Folder className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-800 truncate">{category.name}</h2>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    category.isActive !== false
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {category.isActive !== false ? "Active" : "Disabled"}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-mono mt-0.5">
                <span>slug: /{category.slug}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onEditCategory && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditCategory(category);
                }}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Breadcrumbs Path */}
          <div className="flex items-center flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <span className="text-slate-500 font-medium">Hierarchy Path:</span>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <span
                  className={`px-2 py-0.5 rounded-md ${
                    idx === breadcrumbs.length - 1
                      ? "bg-emerald-600 text-white font-semibold shadow-2xs"
                      : "bg-white text-slate-700 font-medium border border-slate-200"
                  }`}
                >
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <div className="flex items-center justify-between text-emerald-700">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Total Products (TP)</span>
                <Package className="w-4 h-4" />
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-800">
                {category.productCount ?? products.length}
              </div>
              <p className="text-[10px] text-emerald-600 mt-0.5">Assigned & subcategory items</p>
            </div>

            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50">
              <div className="flex items-center justify-between text-blue-700">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Hierarchy Level</span>
                <Layers className="w-4 h-4" />
              </div>
              <div className="mt-2 text-base font-bold text-blue-900">
                {category.level === 0 ? "Root Level" : `Subcategory (L${category.level})`}
              </div>
              <p className="text-[10px] text-blue-600 mt-0.5">Depth level {category.level || 0}</p>
            </div>

            <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50">
              <div className="flex items-center justify-between text-purple-700">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Subcategories</span>
                <Folder className="w-4 h-4" />
              </div>
              <div className="mt-2 text-2xl font-black text-purple-800">
                {category.children ? category.children.length : 0}
              </div>
              <p className="text-[10px] text-purple-600 mt-0.5">Direct child categories</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Status</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-base font-bold text-slate-800">
                {category.isActive !== false ? "Active" : "Disabled"}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Catalog visibility</p>
            </div>
          </div>

          {/* Description */}
          {category.description && (
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <h4 className="text-xs font-bold text-slate-700 mb-1">Description</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{category.description}</p>
            </div>
          )}

          {/* Mapped Products List */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>Mapped Products ({products.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Products directly belonging to this category or its subcategories
                </p>
              </div>

              {products.length > 0 && (
                <div className="relative w-full sm:w-60">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products in category..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                </div>
              )}
            </div>

            {loadingProducts ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">Loading category products...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-500 space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Package className="w-5 h-5" />
                </div>
                <p className="font-semibold text-slate-700">No products found in this category</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  {productSearch
                    ? "No products matched your search term."
                    : "No products have been assigned to this category yet. You can assign products from the Product Management screen."}
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const pName = p.name || p.title || "Unnamed Product";
                  const pStock = p.currentStock ?? p.stockQuantity ?? 0;
                  const pWarehouse = p.warehouseName || p.warehouse || "Default Fulfillment";
                  const pSlug = p.slug || p.id;

                  return (
                    <div
                      key={p.id}
                      className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition"
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-lg border border-slate-200 bg-white p-1 shrink-0 overflow-hidden flex items-center justify-center">
                          {p.mainImage ? (
                            <img src={p.mainImage} alt={pName} className="w-full h-full object-contain" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-semibold text-slate-800 truncate" title={pName}>
                            {pName}
                          </h4>
                          <div className="flex items-center flex-wrap gap-2 text-[11px] text-slate-500 mt-0.5">
                            {p.sku && <span className="font-mono bg-slate-100 px-1 rounded">SKU: {p.sku}</span>}
                            {p.brand && <span>Brand: {p.brand}</span>}
                            <span className="flex items-center gap-1 text-slate-600">
                              <Warehouse className="w-3 h-3 text-indigo-500" />
                              <span className="truncate max-w-[150px]">{pWarehouse}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stock & Price */}
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-slate-800">
                          ${typeof p.price === "number" ? p.price.toFixed(2) : p.price}
                        </div>
                        <div className="text-[11px] mt-0.5">
                          <span
                            className={`font-semibold ${
                              pStock > 10
                                ? "text-emerald-600"
                                : pStock > 0
                                ? "text-amber-600"
                                : "text-red-500"
                            }`}
                          >
                            {pStock} in stock
                          </span>
                        </div>
                      </div>

                      {/* View Action Link */}
                      <div className="shrink-0">
                        <Link
                          href={`/products/${pSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                          title="Open live product page"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">ID: {category.id}</div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
