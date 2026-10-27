"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  Truck,
  CreditCard,
  MapPin,
  Calendar,
  ArrowRight,
  Printer,
  ChevronRight,
  ShieldCheck,
  User,
} from "lucide-react";
import { StoreHeader } from "@/modules/storefront/components/StoreHeader";
import { StoreFooter } from "@/modules/storefront/components/StoreFooter";

interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderDate: string;
  gateway: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  couponCode?: string;
  couponDiscount?: number;
  totalPrice: number;
  shippingAddress: string;
  billingAddress?: string;
  items: Array<{
    id: string;
    productId?: string;
    itemNo?: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    variantAttributes?: Record<string, any>;
  }>;
}

export default function OrderSuccessPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadOrder() {
      if (!orderNumber) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${orderNumber}`);
        const json = await res.json();
        if (isMounted) {
          if (res.ok && json.success && json.data) {
            setOrder(json.data);
          } else {
            setError(json.error || "Order not found");
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to load order receipt");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [orderNumber]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <StoreHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-base font-bold text-slate-800">Generating Order Confirmation...</h2>
            <p className="text-xs text-slate-500 mt-1">Please wait a moment.</p>
          </div>
        ) : error || !order ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Order Confirmed</h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-6">
              Your order #{orderNumber} has been received and is being processed by our fulfillment team.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/customer/dashboard"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Go to Customer Dashboard
              </Link>
              <Link
                href="/"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Back to Storefront
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Confirmation Hero */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Order Confirmed & Payment Verified
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 mb-1 tracking-tight">
                Thank you for your order, {order.customerName.split(" ")[0]}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                We have received your order and sent a detailed invoice receipt to{" "}
                <strong className="text-slate-800">{order.customerEmail}</strong>.
              </p>

              {/* Order Meta Pills */}
              <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Order Number</span>
                  <span className="text-xs sm:text-sm font-black text-blue-600 font-mono block mt-0.5">
                    #{order.orderNumber}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Order Date</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">
                    {new Date(order.orderDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Payment Method</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5 truncate">
                    {order.gateway}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Due / Paid</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 font-mono block mt-0.5">
                    ₹{order.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery & Billing Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Delivery Address</span>
                </div>
                <div className="text-xs text-slate-700 leading-relaxed pt-1">
                  <div className="font-bold text-slate-900">{order.customerName}</div>
                  <div className="text-slate-600 mt-0.5">{order.shippingAddress}</div>
                  {order.customerPhone && (
                    <div className="text-slate-500 text-[11px] mt-1 font-mono">{order.customerPhone}</div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Payment Status</span>
                </div>
                <div className="text-xs text-slate-700 space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Gateway:</span>
                    <span className="font-bold text-slate-900">{order.gateway}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Payment Status:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Fulfillment Status:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Ordered Items ({order.items?.length || 0})
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">Invoice #{order.orderNumber}</span>
              </div>

              <div className="divide-y divide-slate-100">
                {(order.items || []).map((it, idx) => (
                  <div key={idx} className="p-4 sm:p-5 flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                      <Image
                        src={it.imageUrl || "/placeholder-product.png"}
                        alt={it.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{it.name}</h4>
                      {it.variantAttributes && Object.keys(it.variantAttributes).length > 0 && (
                        <div className="text-[10px] text-purple-700 font-semibold truncate">
                          {Object.entries(it.variantAttributes)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" • ")}
                        </div>
                      )}
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {it.itemNo || `SKU-${idx + 1}`} • Qty: {it.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-900 font-mono">
                        ₹{(it.price * it.quantity).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">₹{it.price.toFixed(2)} each</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Financial Calculation */}
              <div className="p-6 bg-slate-50/60 border-t border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{order.subtotal.toFixed(2)}
                  </span>
                </div>

                {order.couponDiscount && order.couponDiscount > 0 ? (
                  <div className="flex items-center justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount ({order.couponCode || "PROMO"}):</span>
                    <span className="font-mono font-bold">-₹{order.couponDiscount.toFixed(2)}</span>
                  </div>
                ) : null}

                <div className="flex items-center justify-between text-slate-600">
                  <span>Shipping Cost:</span>
                  <span className="font-mono font-bold">
                    {order.shippingCost === 0 ? "FREE" : `₹${order.shippingCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Estimated GST (18%):</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{order.taxAmount.toFixed(2)}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-sm">
                  <span className="font-black text-slate-900">Total Order Amount:</span>
                  <span className="font-black text-blue-600 text-lg font-mono">
                    ₹{order.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Invoice Receipt</span>
              </button>

              <div className="flex items-center gap-3">
                <Link
                  href="/customer/dashboard"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>View Customer Dashboard</span>
                </Link>
                <Link
                  href="/category"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-2"
                >
                  <span>Continue Shopping</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}
