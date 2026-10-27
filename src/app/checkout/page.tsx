import React, { Suspense } from "react";
import { CheckoutPageView } from "@/modules/checkout/components/CheckoutPageView";

export const metadata = {
  title: "Secure Checkout | emox India",
  description: "Complete your order with flexible payment gateways, express shipping, and instant buyer protection across India.",
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading Secure Checkout...</p>
        </div>
      }
    >
      <CheckoutPageView />
    </Suspense>
  );
}
