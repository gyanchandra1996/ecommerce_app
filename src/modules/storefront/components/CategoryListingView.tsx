"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Filter,
  ChevronRight,
  Star,
  ShoppingCart,
  CheckCircle2,
  Package,
  Layers,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Folder,
  Boxes,
} from "lucide-react";
import { StoreHeader } from "./StoreHeader";
import { StoreFooter } from "./StoreFooter";
import { CartItem, StoreProduct } from "../types/storefront.types";
import { useCart } from "@/modules/cart/context/CartContext";

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  level?: number;
  productCount?: number;
  children?: CategoryData[];
  subcategories?: CategoryData[];
}

interface Props {
  initialCategorySlug?: string;
}

export function CategoryListingView({ initialCategorySlug }: Props) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [currentCategory, setCurrentCategory] = useState<CategoryData | null>(null);
  const [subcategories, setSubcategories] = useState<CategoryData[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Cart
  const { items: cart, addItem, adjustQuantity, removeItem, clearCart, setIsCartDrawerOpen } = useCart();
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubcatSlug, setSelectedSubcatSlug] = useState<string>("");
  const [priceRange, setPriceRange] = useState<number>(2000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "rating" | "newest">("featured");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Load Categories Tree and Products
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setNotFound(false);

        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories?format=tree"),
          fetch("/api/products"),
        ]);

        const catJson = await catRes.json();
        const prodJson = await prodRes.json();

        if (!isMounted) return;

        const allCats: CategoryData[] = catJson.data || [];
        setCategories(allCats);

        // Find active category by slug or handle "all"
        if (!initialCategorySlug || initialCategorySlug === "all") {
          setCurrentCategory({
            id: "all",
            name: "All Categories",
            slug: "all",
            description: "Browse the complete catalog of active products across all departments.",
            children: allCats,
            subcategories: allCats,
          });
          setSubcategories(allCats);
        } else {
          // Recursive find in category tree
          const findInTree = (list: CategoryData[]): CategoryData | null => {
            for (const c of list) {
              if (
                c.slug.toLowerCase() === initialCategorySlug.toLowerCase() ||
                c.id.toLowerCase() === initialCategorySlug.toLowerCase()
              ) {
                return c;
              }
              const subs =
                (c.subcategories && c.subcategories.length > 0)
                  ? c.subcategories
                  : (c.children && c.children.length > 0)
                  ? c.children
                  : [];
              if (subs.length > 0) {
                const sub = findInTree(subs);
                if (sub) return sub;
              }
            }
            return null;
          };

          const foundCat = findInTree(allCats);

          if (foundCat) {
            setCurrentCategory(foundCat);
            const subs =
              (foundCat.subcategories && foundCat.subcategories.length > 0)
                ? foundCat.subcategories
                : (foundCat.children && foundCat.children.length > 0)
                ? foundCat.children
                : [];
            setSubcategories(subs);
          } else {
            setNotFound(true);
          }
        }

        if (prodJson.success && Array.isArray(prodJson.data)) {
          setProducts(prodJson.data);
        }
      } catch (err) {
        console.error("Failed to load category products", err);
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [initialCategorySlug]);

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has variants, direct user to product details page to select options
    if (product.hasVariants) {
      window.location.href = `/products/${product.slug || product.id}`;
      return;
    }

    addItem(product, 1);
    setAddedNotice(`Added "${product.name}" to your cart!`);
    setTimeout(() => setAddedNotice(null), 3000);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    adjustQuantity(productId, delta);
  };

  const handleRemoveFromCart = (productId: string) => {
    removeItem(productId);
  };

  // Derive unique brands
  const brands = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map((p) => p.brand || p.googleBrand)
          .filter(Boolean)
      )
    );
  }, [products]);

  // Derive all category IDs in current category family
  const familyCatIds = useMemo(() => {
    if (!currentCategory || currentCategory.slug === "all") return null;

    const ids = new Set<string>([currentCategory.id, currentCategory.slug]);
    const addDescendants = (cats: CategoryData[]) => {
      cats.forEach((c) => {
        ids.add(c.id);
        ids.add(c.slug);
        const subs =
          (c.subcategories && c.subcategories.length > 0)
            ? c.subcategories
            : (c.children && c.children.length > 0)
            ? c.children
            : [];
        if (subs.length > 0) addDescendants(subs);
      });
    };

    if (subcategories.length > 0) {
      addDescendants(subcategories);
    }
    return ids;
  }, [currentCategory, subcategories]);

  // Filtered Products
  const filtered = useMemo(() => {
    return products.filter((p) => {
      // 1. Only published & active products
      if (p.status && p.status !== "ACTIVE") return false;

      // 2. Category match
      if (currentCategory && currentCategory.slug !== "all") {
        if (selectedSubcatSlug) {
          // Strict subcategory filter
          const subMatch =
            (p.categoryIds && (p.categoryIds.includes(selectedSubcatSlug))) ||
            (p.categoryNames &&
              p.categoryNames.some(
                (cn: string) => cn.toLowerCase() === selectedSubcatSlug.toLowerCase()
              ));
          if (!subMatch) return false;
        } else if (familyCatIds) {
          // Parent or any child subcategory match
          const inFamily =
            (p.categoryIds && p.categoryIds.some((cid: string) => familyCatIds.has(cid))) ||
            (p.categoryNames &&
              p.categoryNames.some(
                (cn: string) =>
                  cn.toLowerCase() === currentCategory.name.toLowerCase() ||
                  subcategories.some((sub) => cn.toLowerCase() === sub.name.toLowerCase())
              ));
          if (!inFamily) return false;
        }
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchSku = p.sku?.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        const matchBrand = p.brand?.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchDesc && !matchBrand) return false;
      }

      // 4. Price range
      if (p.price > priceRange) return false;

      // 5. In Stock Only
      if (inStockOnly && (p.currentStock <= 0 || p.isSoldOut)) return false;

      // 6. Brand
      if (selectedBrand !== "All") {
        const b = p.brand || p.googleBrand;
        if (b !== selectedBrand) return false;
      }

      // 7. Rating
      if (minRating > 0 && (p.rating || 4.5) < minRating) return false;

      return true;
    });
  }, [
    products,
    currentCategory,
    selectedSubcatSlug,
    familyCatIds,
    subcategories,
    searchQuery,
    priceRange,
    inStockOnly,
    selectedBrand,
    minRating,
  ]);

  // Sorting
  const sortedProducts = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "newest") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return 0; // featured
    });
  }, [filtered, sortBy]);

  const paginatedProducts = sortedProducts.slice(0, page * pageSize);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedSubcatSlug("");
    setPriceRange(2000);
    setInStockOnly(false);
    setSelectedBrand("All");
    setMinRating(0);
    setSortBy("featured");
    setPage(1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans">
        <StoreHeader cart={cart} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <h3 className="text-base font-bold text-slate-800">Loading Category Catalog...</h3>
          <p className="text-xs text-slate-500 mt-1">Fetching active products, variants, and filters.</p>
        </div>
        <StoreFooter />
      </div>
    );
  }

  // Not Found State for Invalid Category URLs
  if (notFound) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans">
        <StoreHeader cart={cart} />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Category Not Found</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            The category &quot;{initialCategorySlug}&quot; could not be found. It may have been renamed, moved, or deactivated.
          </p>
          <div className="flex items-center justify-center gap-3 pt-4">
            <Link
              href="/category/all"
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-sm"
            >
              Browse All Categories
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
            >
              Return to Storefront
            </Link>
          </div>
        </main>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notice */}
      {addedNotice && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{addedNotice}</span>
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="ml-2 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer"
          >
            View Cart
          </button>
        </div>
      )}

      {/* Header */}
      <StoreHeader
        cart={cart}
        onUpdateCartQuantity={handleUpdateCartQuantity}
        onRemoveFromCart={handleRemoveFromCart}
        onSearch={(q) => setSearchQuery(q)}
        onClearCart={() => clearCart()}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Dynamic Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto scrollbar-none py-1">
          <Link href="/" className="hover:text-blue-600 transition shrink-0">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link href="/category/all" className="hover:text-blue-600 transition shrink-0">
            Categories
          </Link>
          {currentCategory && currentCategory.slug !== "all" && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <Link
                href={`/category/${currentCategory.slug}`}
                className={`transition font-semibold shrink-0 ${
                  selectedSubcatSlug ? "hover:text-blue-600 text-slate-600" : "text-slate-900 font-bold"
                }`}
              >
                {currentCategory.name}
              </Link>
            </>
          )}
          {selectedSubcatSlug && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-bold text-slate-900 truncate shrink-0">
                {subcategories.find((s) => s.slug === selectedSubcatSlug)?.name || selectedSubcatSlug}
              </span>
            </>
          )}
        </div>

        {/* Dynamic Category Hero Banner */}
        {currentCategory && (
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl z-10 text-center sm:text-left">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30 inline-block">
                {currentCategory.slug === "all" ? "Full Catalog" : "Department Collection"}
              </span>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{currentCategory.name}</h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                {currentCategory.description ||
                  `Explore genuine items, top customer rated deals, and express delivery across ${currentCategory.name}.`}
              </p>

              {/* Subcategories Filter Chips */}
              {subcategories.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubcatSlug("");
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedSubcatSlug === ""
                        ? "bg-white text-slate-900 shadow-sm"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    All {currentCategory.name} ({sortedProducts.length})
                  </button>
                  {subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        setSelectedSubcatSlug(sub.slug);
                        setPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        selectedSubcatSlug === sub.slug
                          ? "bg-blue-600 text-white shadow-sm ring-2 ring-white"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                    >
                      <span>{sub.name}</span>
                      {sub.productCount !== undefined && sub.productCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
                          {sub.productCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {currentCategory.image && (
              <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border border-white/20 shadow-lg shrink-0">
                <Image
                  src={currentCategory.image}
                  alt={currentCategory.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
          </div>
        )}

        {/* 2-Column Catalog Layout: Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT FILTER SIDEBAR (3 cols) */}
          <aside className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Filter className="w-4 h-4 text-blue-600" />
                <span>Filters & Refinements</span>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Keyword Search */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Search Products</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Keyword, SKU, or name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Categories Tree Navigation */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Browse Departments</label>
              <div className="space-y-1 max-h-60 overflow-y-auto text-xs">
                <Link
                  href="/category/all"
                  className={`block px-3 py-1.5 rounded-xl transition ${
                    currentCategory?.slug === "all"
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50 font-medium"
                  }`}
                >
                  All Products
                </Link>
                {categories.map((c) => {
                  const isActive = currentCategory?.id === c.id || currentCategory?.slug === c.slug;
                  return (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-xl transition ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-slate-600 hover:bg-slate-50 font-medium"
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                      {c.productCount !== undefined && c.productCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500 font-mono">
                          {c.productCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700">Max Price</label>
                <span className="font-mono font-bold text-blue-600">₹{priceRange}</span>
              </div>
              <input
                type="range"
                min="10"
                max="2500"
                step="25"
                value={priceRange}
                onChange={(e) => {
                  setPriceRange(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>₹10</span>
                <span>₹2500</span>
              </div>
            </div>

            {/* In Stock Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Brand Filter */}
            {brands.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="All">All Brands</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Minimum Rating */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">Minimum Rating</label>
              <div className="space-y-1 text-xs">
                {[4, 3, 0].map((star) => (
                  <label key={star} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="minRating"
                      checked={minRating === star}
                      onChange={() => {
                        setMinRating(star);
                        setPage(1);
                      }}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      {star === 0 ? (
                        "Any Rating"
                      ) : (
                        <>
                          <span>{star} Stars & above</span>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        </>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* RIGHT PRODUCT GRID (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            {/* Control Bar: Product Counts and Sorting */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
              <div className="text-xs text-slate-600 font-medium">
                Showing <span className="font-bold text-slate-900">{paginatedProducts.length}</span> of{" "}
                <span className="font-bold text-slate-900">{sortedProducts.length}</span> active products
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="featured">Featured Deals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {sortedProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <Package className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">No products match your criteria</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try broadening your price range, clearing search terms, or resetting category filters.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedProducts.map((prod) => {
                  const image =
                    prod.mainImage ||
                    prod.image ||
                    (prod.assets && prod.assets[0]?.url) ||
                    "/placeholder-product.png";
                  const comparePrice = prod.comparePrice || prod.price * 1.25;
                  const discountPct = Math.round(((comparePrice - prod.price) / comparePrice) * 100);
                  const inStock = prod.currentStock > 0 && !prod.isSoldOut;

                  return (
                    <div
                      key={prod.id}
                      className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                      {/* Product Image Linking directly to Full Details Page (NO MODAL) */}
                      <Link
                        href={`/products/${prod.slug || prod.id}`}
                        className="relative aspect-square bg-slate-50 overflow-hidden p-6 flex items-center justify-center cursor-pointer"
                      >
                        <Image
                          src={image}
                          alt={prod.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-contain group-hover:scale-105 transition-transform duration-300 p-4"
                          unoptimized
                        />

                        {discountPct > 0 && (
                          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white shadow-xs">
                            {discountPct}% OFF
                          </div>
                        )}

                        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                          {inStock ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              In Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                              Sold Out
                            </span>
                          )}

                          {prod.hasVariants && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-800 flex items-center gap-1">
                              <Boxes className="w-2.5 h-2.5" />
                              <span>Options</span>
                            </span>
                          )}
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          {prod.brand && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              {prod.brand}
                            </span>
                          )}

                          <Link
                            href={`/products/${prod.slug || prod.id}`}
                            className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 hover:text-blue-600 transition block"
                          >
                            {prod.name}
                          </Link>

                          {/* Star Ratings */}
                          <div className="flex items-center gap-1.5 text-xs">
                            <div className="flex items-center text-amber-400">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= Math.round(prod.rating || 4.5)
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">
                              ({prod.reviewsCount || 12})
                            </span>
                          </div>
                        </div>

                        {/* Price & Action Button */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-black text-base text-slate-900 font-mono">
                                ₹{prod.price.toFixed(2)}
                              </span>
                              {comparePrice > prod.price && (
                                <span className="text-xs text-slate-400 line-through font-mono">
                                  ₹{comparePrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>

                          {prod.hasVariants ? (
                            <Link
                              href={`/products/${prod.slug || prod.id}`}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-xs transition shadow-2xs flex items-center gap-1"
                            >
                              <span>Options</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => handleAddToCart(prod, e)}
                              disabled={!inStock}
                              className="p-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white shadow-2xs transition active:scale-95 disabled:opacity-40 cursor-pointer"
                              title="Add to cart"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination / Load More */}
            {sortedProducts.length > paginatedProducts.length && (
              <div className="pt-6 text-center">
                <button
                  type="button"
                  onClick={() => setPage(page + 1)}
                  className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl shadow-xs transition cursor-pointer"
                >
                  Load More Products ({sortedProducts.length - paginatedProducts.length} remaining)
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
