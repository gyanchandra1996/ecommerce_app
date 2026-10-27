"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { StoreHeader } from "@/modules/storefront/components/StoreHeader";
import { StoreFooter } from "@/modules/storefront/components/StoreFooter";
import { useCart } from "@/modules/cart/context/CartContext";

export function CartPageView() {
  const {
    items,
    totalCount,
    subtotal,
    shippingFee,
    taxAmount,
    discountAmount,
    grandTotal,
    coupon,
    couponError,
    couponLoading,
    adjustQuantity,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [inputCouponCode, setInputCouponCode] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const freeShippingTarget = 499;
  const remainingForFreeShipping = Math.max(0, freeShippingTarget - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingTarget) * 100);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCouponCode.trim()) return;
    const res = await applyCoupon(inputCouponCode);
    if (res.success) {
      setSuccessMsg(`Coupon "${inputCouponCode.toUpperCase()}" applied successfully!`);
      setInputCouponCode("");
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <StoreHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-6 font-medium">
          <Link href="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Shopping Cart</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span>Shopping Cart</span>
              <span className="text-xs sm:text-sm font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">
                {totalCount} {totalCount === 1 ? "Item" : "Items"}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review your selected items, apply promotional discounts, and proceed to checkout.
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 sm:p-16 text-center max-w-xl mx-auto shadow-xs">
            <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
              Your shopping cart is empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
              Looks like you haven&apos;t added any items to your shopping cart yet. Discover trending
              electronics, fashion apparel, home appliances, and exclusive discount deals today!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/category"
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
              >
                <span>Browse Categories</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Return to Storefront
              </Link>
            </div>
          </div>
        ) : (
          /* Cart Content Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free Shipping Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Truck className="w-4 h-4 text-blue-600" />
                    {remainingForFreeShipping === 0 || coupon?.freeShipping ? (
                      <span className="text-emerald-700 font-bold">
                        🎉 Congratulations! You have qualified for FREE Express Delivery!
                      </span>
                    ) : (
                      <span>
                        Add{" "}
                        <strong className="text-blue-600 font-bold">
                          ₹{remainingForFreeShipping.toFixed(2)}
                        </strong>{" "}
                        more to qualify for <strong>FREE Express Delivery</strong>!
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    Target: ₹{freeShippingTarget}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      progressPercent >= 100 || coupon?.freeShipping ? "bg-emerald-500" : "bg-blue-600"
                    }`}
                    style={{
                      width: coupon?.freeShipping ? "100%" : `${progressPercent}%`,
                    }}
                  />
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-6">Product Details</div>
                  <div className="col-span-2 text-center">Unit Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const lineSubtotal = (Number(item.price) || 0) * item.quantity;
                    const itemKey = item.id || `${item.productId}_${item.variantId || "base"}`;
                    return (
                      <div
                        key={itemKey}
                        className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center hover:bg-slate-50/50 transition"
                      >
                        {/* Image + Title */}
                        <div className="sm:col-span-6 flex items-center gap-4">
                          <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            <Image
                              src={
                                item.image ||
                                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
                              }
                              alt={item.name}
                              fill
                              sizes="(max-width: 640px) 80px, 88px"
                              className="object-cover"
                            />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                              {item.name}
                            </h3>
                            {item.variantAttributes && Object.keys(item.variantAttributes).length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {Object.entries(item.variantAttributes).map(([k, val]) => (
                                  <span
                                    key={k}
                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200"
                                  >
                                    {k}: {val}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="text-[11px] text-slate-400 font-mono">
                              SKU: {item.sku || item.productId.slice(0, 8).toUpperCase()}
                            </div>
                            <div className="sm:hidden text-xs font-bold text-blue-600">
                              ₹{item.price.toFixed(2)}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id || item.productId)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 pt-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>

                        {/* Unit Price */}
                        <div className="hidden sm:block sm:col-span-2 text-center">
                          <span className="text-xs font-bold text-slate-800 font-mono">
                            ₹{item.price.toFixed(2)}
                          </span>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="sm:col-span-2 flex items-center sm:justify-center">
                          <div className="inline-flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => adjustQuantity(item.id || item.productId, -1)}
                              className="w-7 h-7 rounded-md bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer shadow-2xs"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-black text-slate-900 font-mono">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => adjustQuantity(item.id || item.productId, 1)}
                              className="w-7 h-7 rounded-md bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer shadow-2xs"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Subtotal & Desktop Remove */}
                        <div className="sm:col-span-2 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                          <span className="sm:hidden text-xs text-slate-500 font-medium">
                            Subtotal:
                          </span>
                          <span className="text-sm font-black text-slate-900 font-mono">
                            ₹{lineSubtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <Link
                    href="/category"
                    className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Continue Shopping</span>
                  </Link>

                  <div className="text-xs text-slate-500 font-medium">
                    Stock reservation active for 15 minutes
                  </div>
                </div>
              </div>

              {/* Guarantees / Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-2xs">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Secure Checkout</h4>
                    <p className="text-[11px] text-slate-500">256-Bit SSL Encrypted</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-2xs">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Express Delivery</h4>
                    <p className="text-[11px] text-slate-500">Fast doorstep shipping</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-2xs">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Easy 14-Day Returns</h4>
                    <p className="text-[11px] text-slate-500">Hassle-free money back</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Coupon (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Coupon Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-slate-900">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Promotional Coupon</h3>
                </div>

                {coupon ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Code &quot;{coupon.code}&quot; Active</span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      {coupon.discountType === "PERCENTAGE" && `Saved ₹${coupon.discountAmount.toFixed(2)}`}
                      {coupon.discountType === "FIXED_AMOUNT" && `Flat ₹${coupon.discountAmount.toFixed(2)} discount`}
                      {coupon.freeShipping && " + Free Express Shipping"}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="ENTER COUPON CODE"
                        value={inputCouponCode}
                        onChange={(e) => setInputCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 uppercase font-mono font-bold text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={couponLoading || !inputCouponCode.trim()}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition cursor-pointer shrink-0 shadow-2xs"
                      >
                        {couponLoading ? "Checking..." : "Apply"}
                      </button>
                    </div>

                    {couponError && (
                      <div className="flex items-center gap-1 text-[11px] font-medium text-rose-600">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{couponError}</span>
                      </div>
                    )}

                    {successMsg && (
                      <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{successMsg}</span>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400">
                      Try codes: <strong className="font-mono text-slate-600">WELCOME10</strong> or{" "}
                      <strong className="font-mono text-slate-600">SAVE50</strong>
                    </div>
                  </form>
                )}
              </div>

              {/* Order Summary Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                  Order Summary
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Items Subtotal:</span>
                    <span className="font-bold font-mono text-slate-900">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700 font-semibold">
                      <span>Coupon Discount ({coupon?.code}):</span>
                      <span className="font-bold font-mono">-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <span>Estimated Shipping:</span>
                      <HelpCircle className="w-3 h-3 text-slate-400" />
                    </span>
                    <span className="font-bold font-mono">
                      {shippingFee === 0 ? (
                        <span className="text-emerald-600 font-black">FREE</span>
                      ) : (
                        `₹${shippingFee.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <span>Estimated GST (18%):</span>
                      <HelpCircle className="w-3 h-3 text-slate-400" />
                    </span>
                    <span className="font-bold font-mono text-slate-900">
                      ₹{taxAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-slate-900 block">Total Amount:</span>
                      <span className="text-[10px] text-slate-400">Includes all taxes and duties</span>
                    </div>
                    <span className="text-xl font-black text-blue-600 font-mono">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-[11px] text-center text-slate-400 pt-1">
                  You will review your shipping address and payment gateway on the next step.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}
