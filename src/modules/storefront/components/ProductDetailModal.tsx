"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  Heart,
  ShoppingBag,
  Check,
  MessageSquare,
  HelpCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  PlusCircle,
  Send,
  AlertCircle,
  Play,
} from "lucide-react";
import { StoreProduct } from "../types/storefront.types";

interface Props {
  product: StoreProduct | null;
  onClose: () => void;
  onAddToCart: (product: StoreProduct, qty: number) => void;
}

interface ReviewItem {
  id: string;
  userName: string;
  userEmail: string;
  rating: number;
  review: string;
  postedOn: string;
  media?: { id: string; url: string; type: "IMAGE" | "VIDEO"; name?: string }[];
  comments?: { id: string; userName: string; comment: string; isAdmin?: boolean; createdAt: string }[];
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

export function ProductDetailModal({ product, onClose, onAddToCart }: Props) {
  const [activeTab, setActiveTab] = useState<"details" | "reviews" | "qna">("details");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(1);
  const [added, setAdded] = useState(false);

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

  useEffect(() => {
    if (!product) return;

    // Track into Recently Viewed Products
    try {
      const stored = localStorage.getItem("emox_recently_viewed");
      let list: StoreProduct[] = stored ? JSON.parse(stored) : [];
      list = list.filter((p) => p.id !== product.id);
      list.unshift(product);
      if (list.length > 10) list = list.slice(0, 10);
      localStorage.setItem("emox_recently_viewed", JSON.stringify(list));
      window.dispatchEvent(new Event("product_visited"));
    } catch {}

    // Fetch product reviews & Q&A
    fetchReviews();
    fetchQna();
  }, [product?.id]);

  const fetchReviews = async () => {
    if (!product) return;
    try {
      setLoadingReviews(true);
      const res = await fetch(`/api/reviews?productId=${encodeURIComponent(product.id)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setReviews(json.data);
      }
    } catch {
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchQna = async () => {
    if (!product) return;
    try {
      setLoadingQna(true);
      const res = await fetch(`/api/qna?productId=${encodeURIComponent(product.id)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setQnaList(json.data);
      }
    } catch {
    } finally {
      setLoadingQna(false);
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;
    try {
      setIsWishlisted(!isWishlisted);
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, userId: "store_user" }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setWishlistCount(json.data.count);
      }
    } catch {
      setIsWishlisted(!isWishlisted);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewText.trim()) return;

    try {
      setReviewSubmitting(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          itemNo: product.slug || product.id,
          productName: product.name,
          userName: reviewName.trim() || "Verified Buyer",
          userEmail: reviewEmail.trim() || "customer@example.com",
          rating: reviewRating,
          review: reviewText.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setReviewSuccess(true);
        setReviewText("");
        fetchReviews();
        setTimeout(() => setReviewSuccess(false), 3000);
      }
    } catch {
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleQnaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !qnaQuestion.trim()) return;

    try {
      setQnaSubmitting(true);
      const res = await fetch("/api/qna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          itemNo: product.slug || product.id,
          productName: product.name,
          userName: qnaName.trim() || "Shopper",
          userEmail: qnaEmail.trim() || "shopper@example.com",
          question: qnaQuestion.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setQnaSuccess(true);
        setQnaQuestion("");
        fetchQna();
        setTimeout(() => setQnaSuccess(false), 3000);
      }
    } catch {
    } finally {
      setQnaSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {product.category || "Emox Store"}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">SKU: {product.slug}</span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Top Product Hero */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Image Frame */}
            <div className="relative aspect-square bg-[#f8fafc] rounded-2xl border border-slate-100 p-6 flex items-center justify-center overflow-hidden">
              {product.isSoldOut ? (
                <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-white shadow-xs">
                  Sold Out
                </span>
              ) : product.discountPercent ? (
                <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-600 text-white shadow-xs">
                  -{product.discountPercent}% OFF
                </span>
              ) : null}

              <button
                type="button"
                onClick={toggleWishlist}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center hover:scale-110 transition cursor-pointer z-10"
                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  className={`w-4 h-4 transition ${
                    isWishlisted ? "fill-red-500 text-red-500" : "text-slate-400"
                  }`}
                />
              </button>

              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>

            {/* Info & Buy Box */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {product.name}
                </h2>
                <p className="text-xs text-slate-400 mt-1">Brand: {product.brand || "Emox Collection"}</p>
              </div>

              {/* Rating stars */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200 fill-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">{product.rating}</span>
                <span className="text-xs text-slate-400">
                  ({reviews.length > 0 ? reviews.length : product.reviewsCount} customer reviews)
                </span>
              </div>

              {/* Price row */}
              <div className="pt-2 flex items-baseline space-x-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  ₹{product.price.toFixed(2)}
                </span>
                {product.comparePrice && (
                  <span className="text-sm text-slate-400 line-through font-mono">
                    ₹{product.comparePrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Quantity & Add to Cart */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 font-mono text-xs font-bold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={product.isSoldOut}
                    onClick={() => {
                      if (!product.isSoldOut) {
                        onAddToCart(product, quantity);
                        setAdded(true);
                        setTimeout(() => setAdded(false), 1500);
                      }
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-sm ${
                      product.isSoldOut
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : added
                        ? "bg-emerald-600 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                    }`}
                  >
                    {product.isSoldOut ? (
                      <span>Sold Out</span>
                    ) : added ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added {quantity} to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-slate-500 text-center">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center">
                    <Truck className="w-3.5 h-3.5 text-slate-600 mb-1" />
                    <span>Free UAE Delivery</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mb-1" />
                    <span>100% Genuine</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center">
                    <RotateCcw className="w-3.5 h-3.5 text-blue-600 mb-1" />
                    <span>7 Days Return</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation: Details / Reviews / Q&A */}
          <div className="border-b border-slate-200 flex items-center space-x-6 pt-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-2.5 transition border-b-2 flex items-center space-x-1.5 ${
                activeTab === "details"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Product Details</span>
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-2.5 transition border-b-2 flex items-center space-x-1.5 ${
                activeTab === "reviews"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Customer Reviews ({reviews.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("qna")}
              className={`pb-2.5 transition border-b-2 flex items-center space-x-1.5 ${
                activeTab === "qna"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Questions &amp; Answers ({qnaList.length})</span>
            </button>
          </div>

          {/* Tab 1: Details */}
          {activeTab === "details" && (
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Experience premium performance with the official {product.name}. Designed with
                cutting-edge engineering to offer high durability, ergonomic comfort, and peak reliability.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>Authentic guaranteed by authorized regional distributors</li>
                <li>Comprehensive manufacturer quality certification</li>
                <li>Shipped directly from verified high-speed fulfillment warehouses</li>
              </ul>
            </div>
          )}

          {/* Tab 2: Reviews & Ratings */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {/* Write a Review Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Write a Customer Review</span>
                </h4>

                {reviewSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center space-x-1.5 animate-in fade-in">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Your review was submitted successfully and is live!</span>
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-700">Your Rating:</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="hover:scale-110 transition"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= reviewRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300 fill-slate-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={reviewEmail}
                      onChange={(e) => setReviewEmail(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <textarea
                    rows={2}
                    required
                    placeholder="How was your experience with this product?"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center space-x-1.5 transition self-end"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{reviewSubmitting ? "Submitting..." : "Post Review"}</span>
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Customer Feedback ({reviews.length})
                </h4>

                {reviews.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    No reviews yet. Be the first to review this product above!
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900">{rev.userName}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Verified Buyer
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{rev.postedOn}</span>
                        </div>

                        <div className="flex items-center text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200 fill-slate-200"
                              }`}
                            />
                          ))}
                        </div>

                        <p className="text-slate-700 leading-relaxed">{rev.review}</p>
                        {rev.media && rev.media.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {rev.media.map((m: any, idx: number) => (
                              <div key={m.id || idx} className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                                {m.type === "VIDEO" ? (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                                    <Play className="w-3.5 h-3.5 fill-white" />
                                  </div>
                                ) : (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {rev.comments && rev.comments.length > 0 && (
                          <div className="pt-2 pl-3 border-l-2 border-slate-200 space-y-1.5 text-[11px]">
                            {rev.comments.map((c: any) => (
                              <div key={c.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="flex items-center justify-between font-semibold text-slate-800">
                                  <span>
                                    {c.userName}{" "}
                                    {c.isAdmin && (
                                      <span className="text-[9px] text-emerald-700 font-bold ml-1 bg-emerald-100 px-1 py-0.2 rounded">
                                        Store Team
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    {new Date(c.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-slate-600 mt-0.5">{c.comment}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Questions & Answers */}
          {activeTab === "qna" && (
            <div className="space-y-6">
              {/* Ask Question Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ask a Question</span>
                </h4>

                {qnaSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center space-x-1.5 animate-in fade-in">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Your question has been posted and will receive an official answer!</span>
                  </div>
                )}

                <form onSubmit={handleQnaSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={qnaName}
                      onChange={(e) => setQnaName(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={qnaEmail}
                      onChange={(e) => setQnaEmail(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <textarea
                    rows={2}
                    required
                    placeholder="Have a question about specifications, size, or compatibility?"
                    value={qnaQuestion}
                    onChange={(e) => setQnaQuestion(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />

                  <button
                    type="submit"
                    disabled={qnaSubmitting}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center space-x-1.5 transition self-end"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{qnaSubmitting ? "Submitting..." : "Ask Question"}</span>
                  </button>
                </form>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Community Questions ({qnaList.length})
                </h4>

                {qnaList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    No questions asked yet. Feel free to ask a question above!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {qnaList.map((q) => (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-xl border border-slate-200 text-xs space-y-2 bg-white"
                      >
                        <div className="flex items-start justify-between">
                          <p className="font-bold text-slate-900 flex items-start gap-1.5">
                            <span className="text-blue-600 font-black">Q:</span>
                            <span>{q.question}</span>
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                            {q.postedOn}
                          </span>
                        </div>

                        {q.answers && q.answers.length > 0 ? (
                          <div className="pl-4 border-l-2 border-emerald-500 space-y-1.5 pt-1">
                            {q.answers.map((ans) => (
                              <div key={ans.id} className="space-y-0.5">
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-semibold text-slate-800">{ans.userName}</span>
                                  {ans.isOfficial && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                      Official Reply
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-600">{ans.answer}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic pl-4">
                            Waiting for official response from the store team.
                          </p>
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
    </div>
  );
}
