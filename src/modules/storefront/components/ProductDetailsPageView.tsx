"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Minus,
  Plus,
  ArrowLeft,
  Sparkles,
  Send,
  MessageSquare,
  HelpCircle,
  Tag,
  Boxes,
  Check,
} from "lucide-react";
import { StoreHeader } from "./StoreHeader";
import { StoreFooter } from "./StoreFooter";
import { useCart } from "@/modules/cart/context/CartContext";
import { StoreProduct } from "../types/storefront.types";

interface ReviewItem {
  id: string;
  userName: string;
  userEmail: string;
  rating: number;
  review: string;
  postedOn: string;
}

interface QnaItem {
  id: string;
  question: string;
  userName: string;
  userEmail: string;
  postedOn: string;
  answers?: {
    id: string;
    userName: string;
    answer: string;
    isOfficial: boolean;
    createdAt: string;
  }[];
}

interface Props {
  slug: string;
}

export function ProductDetailsPageView({ slug }: Props) {
  const router = useRouter();
  const { addItem, items: cart, adjustQuantity, removeItem, clearCart, setIsCartDrawerOpen } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Gallery
  const [activeImage, setActiveImage] = useState<string>("");

  // Variant selection
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  // Feedback notifications
  const [addedNotice, setAddedNotice] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Tabs: Details, Specs, Reviews, Q&A
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "reviews" | "qna">("description");

  // Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Q&A state
  const [qnaList, setQnaList] = useState<QnaItem[]>([]);
  const [loadingQna, setLoadingQna] = useState(false);
  const [qnaQuestion, setQnaQuestion] = useState("");
  const [qnaName, setQnaName] = useState("");
  const [qnaEmail, setQnaEmail] = useState("");
  const [qnaSubmitting, setQnaSubmitting] = useState(false);
  const [qnaSuccess, setQnaSuccess] = useState(false);

  // Related products
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  // 1. Fetch Product
  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      try {
        setLoading(true);
        setNotFound(false);
        const res = await fetch(`/api/products/${encodeURIComponent(slug)}`);
        const json = await res.json();

        if (!isMounted) return;

        if (json.success && json.data) {
          const prod = json.data;
          setProduct(prod);

          const defaultImg =
            prod.mainImage ||
            (prod.assets && prod.assets[0]?.url) ||
            "/placeholder-product.png";
          setActiveImage(defaultImg);

          // Track Recently Viewed
          try {
            const stored = localStorage.getItem("emox_recently_viewed");
            let list: any[] = stored ? JSON.parse(stored) : [];
            list = list.filter((p) => p.id !== prod.id && p.slug !== prod.slug);
            list.unshift({
              id: prod.id,
              name: prod.name,
              slug: prod.slug,
              price: prod.price,
              comparePrice: prod.comparePrice,
              rating: prod.rating || 4.5,
              reviewsCount: prod.reviewsCount || 0,
              brand: prod.brand,
              category: prod.categoryNames?.[0] || "General",
              image: defaultImg,
            });
            if (list.length > 10) list = list.slice(0, 10);
            localStorage.setItem("emox_recently_viewed", JSON.stringify(list));
            window.dispatchEvent(new Event("product_visited"));
          } catch {}

          // Initialize variant selection if variants exist
          if (prod.hasVariants && Array.isArray(prod.variants) && prod.variants.length > 0) {
            // Find first active variant with stock or first variant
            const firstVar =
              prod.variants.find((v: any) => v.isActive && v.currentStock > 0) ||
              prod.variants[0];
            if (firstVar && firstVar.attributes) {
              setSelectedAttributes(firstVar.attributes);
              if (firstVar.image) {
                setActiveImage(firstVar.image);
              }
            }
          }

          // Fetch related products
          const catId = prod.categoryIds?.[0];
          if (catId) {
            fetch(`/api/products?categoryId=${encodeURIComponent(catId)}`)
              .then((r) => r.json())
              .then((j) => {
                if (isMounted && j.data && Array.isArray(j.data)) {
                  setRelatedProducts(j.data.filter((p: any) => p.id !== prod.id).slice(0, 4));
                }
              })
              .catch(() => {});
          }

          // Fetch Reviews & QnA
          fetch(`/api/reviews?productId=${encodeURIComponent(prod.id)}`)
            .then((r) => r.json())
            .then((j) => {
              if (isMounted && j.data) setReviews(j.data);
            })
            .catch(() => {});

          fetch(`/api/qna?productId=${encodeURIComponent(prod.id)}`)
            .then((r) => r.json())
            .then((j) => {
              if (isMounted && j.data) setQnaList(j.data);
            })
            .catch(() => {});
        } else {
          setNotFound(true);
        }
      } catch (err) {
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Derive matching variant based on current attribute selections
  const matchingVariant = useMemo(() => {
    if (!product || !product.hasVariants || !Array.isArray(product.variants) || product.variants.length === 0) {
      return null;
    }
    const attrKeys = Object.keys(selectedAttributes);
    if (attrKeys.length === 0) return null;

    return (
      product.variants.find((v: any) => {
        if (!v.attributes) return false;
        return attrKeys.every((key) => v.attributes[key] === selectedAttributes[key]);
      }) || null
    );
  }, [product, selectedAttributes]);

  // Derived display values
  const currentPrice = matchingVariant ? matchingVariant.price : (product?.price ?? 0);
  const currentComparePrice = matchingVariant
    ? matchingVariant.comparePrice
    : product?.comparePrice;
  const currentSku = matchingVariant ? matchingVariant.sku : (product?.sku || "SKU-N/A");
  const currentStock = matchingVariant
    ? matchingVariant.currentStock
    : (product?.currentStock ?? 0);
  const isAvailable = matchingVariant
    ? matchingVariant.isActive && matchingVariant.currentStock > 0
    : (product?.status === "ACTIVE" && !product?.isSoldOut && (product?.currentStock ?? 0) > 0);

  const discountPercent =
    currentComparePrice && currentComparePrice > currentPrice
      ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
      : 0;

  // Handle attribute selection
  const handleSelectAttribute = (attrName: string, value: string) => {
    const updated = { ...selectedAttributes, [attrName]: value };
    setSelectedAttributes(updated);

    // If matching variant has a specific image, update active image
    if (product && Array.isArray(product.variants)) {
      const match = product.variants.find((v: any) => {
        if (!v.attributes) return false;
        return Object.entries(updated).every(([k, val]) => v.attributes[k] === val);
      });
      if (match?.image) {
        setActiveImage(match.image);
      }
    }
  };

  // Check if all required variant attributes are chosen
  const isAllAttributesSelected = useMemo(() => {
    if (!product?.hasVariants || !Array.isArray(product?.variantAttributes)) return true;
    return product.variantAttributes.every(
      (attr: any) => selectedAttributes[attr.name] && selectedAttributes[attr.name].trim() !== ""
    );
  }, [product, selectedAttributes]);

  // Add to Cart
  const handleAddToCart = () => {
    if (!product) return;

    if (product.hasVariants && !isAllAttributesSelected) {
      alert("Please select all variant options before adding this product to your cart.");
      return;
    }

    if (!isAvailable) {
      alert("Selected product / variant is currently out of stock.");
      return;
    }

    if (quantity > currentStock) {
      alert(`Only ${currentStock} units are available in stock.`);
      return;
    }

    addItem(product, quantity, matchingVariant);
    setAddedNotice(`Added ${quantity} unit(s) of "${product.name}" to your cart!`);
    setTimeout(() => setAddedNotice(null), 3500);
  };

  // Buy Now
  const handleBuyNow = () => {
    if (!product) return;
    if (product.hasVariants && !isAllAttributesSelected) {
      alert("Please select all variant options before proceeding to checkout.");
      return;
    }
    if (!isAvailable) {
      alert("Selected product / variant is currently out of stock.");
      return;
    }

    addItem(product, quantity, matchingVariant);
    router.push("/checkout");
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewEmail.trim() || !reviewText.trim()) return;

    try {
      setReviewSubmitting(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          itemNo: currentSku,
          productName: product.name,
          userName: reviewName.trim(),
          userEmail: reviewEmail.trim(),
          rating: reviewRating,
          review: reviewText.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setReviewSuccess(true);
        setReviewName("");
        setReviewEmail("");
        setReviewText("");
        // Reload reviews
        const rRes = await fetch(`/api/reviews?productId=${encodeURIComponent(product.id)}`);
        const rJson = await rRes.json();
        if (rJson.data) setReviews(rJson.data);
      }
    } catch {
      alert("Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Submit Q&A
  const handleSubmitQna = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qnaQuestion.trim() || !qnaName.trim() || !qnaEmail.trim()) return;

    try {
      setQnaSubmitting(true);
      const res = await fetch("/api/qna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          itemNo: currentSku,
          productName: product.name,
          userName: qnaName.trim(),
          userEmail: qnaEmail.trim(),
          question: qnaQuestion.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setQnaSuccess(true);
        setQnaQuestion("");
        setQnaName("");
        setQnaEmail("");
        // Reload QnA
        const qRes = await fetch(`/api/qna?productId=${encodeURIComponent(product.id)}`);
        const qJson = await qRes.json();
        if (qJson.data) setQnaList(qJson.data);
      }
    } catch {
      alert("Failed to post question.");
    } finally {
      setQnaSubmitting(false);
    }
  };

  // Share Link
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans">
        <StoreHeader cart={cart} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <h3 className="text-base font-bold text-slate-800">Loading Product Details...</h3>
          <p className="text-xs text-slate-500 mt-1">Fetching images, specifications and variant inventory.</p>
        </div>
        <StoreFooter />
      </div>
    );
  }

  // Not Found State
  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans">
        <StoreHeader cart={cart} />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Not Found</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            The requested product &quot;{slug}&quot; does not exist or may have been unlisted from the catalog.
          </p>
          <div className="flex items-center justify-center gap-3 pt-4">
            <Link
              href="/category/all"
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-sm"
            >
              Browse All Products
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

  // Derive thumbnail gallery
  const galleryImages: string[] = [];
  if (product.mainImage) galleryImages.push(product.mainImage);
  if (Array.isArray(product.assets)) {
    product.assets.forEach((a: any) => {
      if (a.url && !galleryImages.includes(a.url)) {
        galleryImages.push(a.url);
      }
    });
  }
  if (Array.isArray(product.variants)) {
    product.variants.forEach((v: any) => {
      if (v.image && !galleryImages.includes(v.image)) {
        galleryImages.push(v.image);
      }
    });
  }
  if (galleryImages.length === 0) {
    galleryImages.push("/placeholder-product.png");
  }

  const categoryName = product.categoryNames?.[0] || "Products";
  const categorySlug = product.categoryIds?.[0] || "all";

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notice */}
      {addedNotice && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{addedNotice}</span>
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="ml-2 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-[10px] font-bold uppercase tracking-wider"
          >
            View Cart
          </button>
        </div>
      )}

      {/* Header */}
      <StoreHeader cart={cart} />

      {/* Breadcrumb Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center space-x-2 text-xs text-slate-500 overflow-x-auto scrollbar-none">
          <Link href="/" className="hover:text-blue-600 transition flex items-center space-x-1 shrink-0">
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <Link href="/category/all" className="hover:text-blue-600 transition shrink-0">
            Categories
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <Link
            href={`/category/${categorySlug}`}
            className="hover:text-blue-600 transition font-semibold text-slate-700 shrink-0"
          >
            {categoryName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-slate-900 font-bold truncate max-w-[240px] sm:max-w-md">
            {product.name}
          </span>
        </div>
      </div>

      {/* Main Product Layout */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10 w-full">
        {/* Top Section: Gallery & Purchasing Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Column: Image Gallery (5 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Primary Large Image */}
            <div className="relative aspect-square bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-center overflow-hidden shadow-xs group">
              <Image
                src={activeImage || "/placeholder-product.png"}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                priority
                unoptimized
              />

              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-md">
                  {discountPercent}% OFF
                </div>
              )}

              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 flex items-center justify-center transition shadow-xs cursor-pointer ${
                    isWishlisted ? "text-rose-500" : "text-slate-600 hover:text-rose-500"
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-500" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 transition shadow-xs cursor-pointer"
                  title="Share link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {copiedLink && (
                <div className="absolute bottom-4 bg-slate-900/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                  Link copied to clipboard!
                </div>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-20 rounded-2xl bg-white border-2 overflow-hidden shrink-0 transition p-1.5 cursor-pointer ${
                      activeImage === img
                        ? "border-blue-600 ring-2 ring-blue-100 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Purchase Controls (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              {product.brand && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700">
                  <Tag className="w-3 h-3 text-blue-600" />
                  <span>{product.brand}</span>
                </div>
              )}

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* SKU & Ratings Row */}
              <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                <div className="flex items-center gap-1">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(product.rating || 4.5)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-slate-700 ml-1">
                    {(product.rating || 4.5).toFixed(1)}
                  </span>
                  <span className="text-slate-400">
                    ({reviews.length > 0 ? reviews.length : (product.reviewsCount || 14)} reviews)
                  </span>
                </div>

                <span className="text-slate-300">•</span>

                <div className="text-slate-500 font-mono text-[11px]">
                  SKU: <span className="font-bold text-slate-800">{currentSku}</span>
                </div>

                <span className="text-slate-300">•</span>

                {/* Stock status badge */}
                <div>
                  {isAvailable ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>In Stock ({currentStock} available)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                      <AlertCircle className="w-3 h-3 text-rose-600" />
                      <span>Out of Stock</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Price Presentation */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
                ₹{currentPrice.toFixed(2)}
              </span>

              {currentComparePrice && currentComparePrice > currentPrice && (
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg text-slate-400 line-through font-mono">
                    ₹{currentComparePrice.toFixed(2)}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-rose-100 text-rose-700">
                    Save ₹{(currentComparePrice - currentPrice).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Short Description */}
            {product.description && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                {product.description}
              </p>
            )}

            {/* PRODUCT VARIANTS SELECTION SECTION */}
            {product.hasVariants && Array.isArray(product.variantAttributes) && product.variantAttributes.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <h3 className="font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Boxes className="w-4 h-4 text-blue-600" />
                    <span>Select Variant Options</span>
                  </h3>
                  {matchingVariant && (
                    <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Matching Combination Selected</span>
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {product.variantAttributes.map((attr: any) => {
                    const currentSelectedVal = selectedAttributes[attr.name];

                    return (
                      <div key={attr.name} className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <label className="font-bold text-slate-800">
                            {attr.name}:{" "}
                            <span className="text-blue-600 font-extrabold ml-1">
                              {currentSelectedVal || "Please choose"}
                            </span>
                          </label>
                        </div>

                        {/* Chips / Swatches */}
                        <div className="flex flex-wrap gap-2">
                          {attr.values.map((val: string) => {
                            const isSelected = currentSelectedVal === val;

                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleSelectAttribute(attr.name, val)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                  isSelected
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 ring-2 ring-blue-600 ring-offset-2"
                                    : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                                <span>{val}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity and Action Buttons */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-4">
                <label className="text-xs font-bold text-slate-700 shrink-0">Quantity:</label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || !isAvailable}
                    className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 disabled:opacity-40 transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-xs font-black font-mono text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock || !isAvailable}
                    className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 disabled:opacity-40 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[11px] text-slate-400">
                  {currentStock > 0 ? `Max ${currentStock} units per order` : "Sold out"}
                </span>
              </div>

              {/* Buttons: Add to Cart and Buy Now */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!isAvailable}
                  className={`py-3.5 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md active:scale-98 cursor-pointer ${
                    isAvailable
                      ? "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isAvailable ? "Add to Cart" : "Currently Unavailable"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!isAvailable}
                  className={`py-3.5 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md active:scale-98 cursor-pointer ${
                    isAvailable
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
              <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                <Truck className="w-4 h-4 text-blue-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-800">Free Express Delivery</span>
                <span className="text-[9px] text-slate-400">Orders above ₹499</span>
              </div>
              <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                <RotateCcw className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-800">7-Day Free Returns</span>
                <span className="text-[9px] text-slate-400">Hassle-free guarantee</span>
              </div>
              <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-indigo-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-800">Genuine Guarantee</span>
                <span className="text-[9px] text-slate-400">100% Authentic Product</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Tabs (Description, Specifications, Reviews, Q&A) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-slate-200 px-6 flex items-center gap-6 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("description")}
              className={`py-4 text-xs font-bold border-b-2 transition shrink-0 cursor-pointer ${
                activeTab === "description"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Description & Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("specifications")}
              className={`py-4 text-xs font-bold border-b-2 transition shrink-0 cursor-pointer ${
                activeTab === "specifications"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Technical Specifications
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`py-4 text-xs font-bold border-b-2 transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === "reviews"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Customer Reviews</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 font-mono">
                {reviews.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("qna")}
              className={`py-4 text-xs font-bold border-b-2 transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === "qna"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Questions & Answers</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 font-mono">
                {qnaList.length}
              </span>
            </button>
          </div>

          {/* Tab Content Panes */}
          <div className="p-6 sm:p-8">
            {activeTab === "description" && (
              <div className="space-y-4 max-w-3xl">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Product Overview
                </h3>
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description ||
                    "This high-grade authentic item is carefully crafted with premium materials to guarantee industry-leading performance and long-lasting durability. Explore all available options and variant configurations above to suit your preferences."}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Category
                    </span>
                    <div className="font-bold text-xs text-slate-800">{categoryName}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Warehouse Location
                    </span>
                    <div className="font-bold text-xs text-slate-800">
                      {product.warehouse || "Central India Logistics Hub"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="max-w-2xl space-y-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">
                  Technical Specifications
                </h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-2 p-3 bg-slate-50">
                    <span className="text-slate-500 font-medium">Model / Item No.</span>
                    <span className="font-bold text-slate-900 font-mono">{currentSku}</span>
                  </div>
                  {product.upc && (
                    <div className="grid grid-cols-2 p-3 bg-white">
                      <span className="text-slate-500 font-medium">Universal Product Code (UPC)</span>
                      <span className="font-bold text-slate-900 font-mono">{product.upc}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 p-3 bg-slate-50">
                    <span className="text-slate-500 font-medium">Brand</span>
                    <span className="font-bold text-slate-900">{product.brand || "Authentic Store"}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-white">
                    <span className="text-slate-500 font-medium">Stock Status</span>
                    <span className="font-bold text-emerald-600">
                      {isAvailable ? `In Stock (${currentStock} units)` : "Sold Out"}
                    </span>
                  </div>
                  {matchingVariant && matchingVariant.attributes && (
                    Object.entries(matchingVariant.attributes).map(([attrK, attrV]) => (
                      <div key={attrK} className="grid grid-cols-2 p-3 bg-slate-50">
                        <span className="text-slate-500 font-medium">{attrK}</span>
                        <span className="font-bold text-blue-600">{String(attrV)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-8 max-w-3xl">
                {/* Write Review Form */}
                <form
                  onSubmit={handleSubmitReview}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
                >
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Write a Customer Review
                  </h4>

                  {reviewSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Thank you! Your verified review has been published.</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= reviewRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Your Name *"
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Your Email *"
                      required
                      value={reviewEmail}
                      onChange={(e) => setReviewEmail(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Share your experience with this product, its quality, sizing, and features..."
                    required
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{reviewSubmitting ? "Submitting..." : "Submit Review"}</span>
                  </button>
                </form>

                {/* Reviews List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Published Reviews ({reviews.length})
                  </h4>

                  {reviews.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      No customer reviews yet. Be the first to review this product!
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 space-y-4">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="pt-4 first:pt-0 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900">{rev.userName}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(rev.postedOn).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{rev.review}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "qna" && (
              <div className="space-y-8 max-w-3xl">
                {/* Ask Question Form */}
                <form
                  onSubmit={handleSubmitQna}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
                >
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Have a Question? Ask the Community & Verified Sellers
                  </h4>

                  {qnaSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Your question has been posted!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Your Name *"
                      required
                      value={qnaName}
                      onChange={(e) => setQnaName(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Your Email *"
                      required
                      value={qnaEmail}
                      onChange={(e) => setQnaEmail(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Type your question about specifications, compatibility, warranty or usage..."
                    required
                    value={qnaQuestion}
                    onChange={(e) => setQnaQuestion(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={qnaSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{qnaSubmitting ? "Posting..." : "Post Question"}</span>
                  </button>
                </form>

                {/* Q&A List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Community Questions ({qnaList.length})
                  </h4>

                  {qnaList.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      No questions asked yet. Ask the first question above!
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 space-y-4">
                      {qnaList.map((q) => (
                        <div key={q.id} className="pt-4 first:pt-0 space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="font-black text-blue-600 text-xs">Q:</span>
                            <div className="flex-1">
                              <p className="font-bold text-xs text-slate-900">{q.question}</p>
                              <span className="text-[10px] text-slate-400">
                                Asked by {q.userName} on {new Date(q.postedOn).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {q.answers && q.answers.length > 0 ? (
                            <div className="ml-4 pl-3 border-l-2 border-slate-200 space-y-2">
                              {q.answers.map((ans) => (
                                <div key={ans.id} className="text-xs space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-800">{ans.userName}</span>
                                    {ans.isOfficial && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800">
                                        Verified Staff
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-slate-600 leading-relaxed">{ans.answer}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="ml-4 text-[11px] text-slate-400 italic">
                              Awaiting verified answers from seller.
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-5 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Related Products in {categoryName}
                </h3>
                <p className="text-xs text-slate-500">Customers who viewed this item also explored</p>
              </div>
              <Link
                href={`/category/${categorySlug}`}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View Category Catalog →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => {
                const img =
                  rel.mainImage ||
                  (rel.assets && rel.assets[0]?.url) ||
                  "/placeholder-product.png";
                return (
                  <Link
                    key={rel.id}
                    href={`/products/${rel.slug || rel.id}`}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div className="relative aspect-square bg-slate-50 overflow-hidden p-3 flex items-center justify-center">
                      <Image
                        src={img}
                        alt={rel.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-contain group-hover:scale-105 transition-transform duration-300 p-2"
                        unoptimized
                      />
                    </div>
                    <div className="p-3.5 space-y-1.5">
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-2 group-hover:text-blue-600 transition">
                        {rel.name}
                      </h4>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-black text-xs font-mono text-slate-900">
                          ₹{rel.price?.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-bold text-blue-600">Details →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}
