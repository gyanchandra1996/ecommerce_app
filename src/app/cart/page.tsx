import React, { Suspense } from "react";
import { CartPageView } from "@/modules/cart/components/CartPageView";

export const metadata = {
  title: "Shopping Cart | G-Store Online Shopping India",
  description: "View and manage items in your shopping cart, apply coupons, and proceed to secure checkout.",
};

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading Shopping Cart...</p>
        </div>
      }
    >
      <CartPageView />
    </Suspense>
  );
}
