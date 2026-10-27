import { Suspense } from "react";
import { StorefrontHomePage } from "@/modules/storefront/components/StorefrontHomePage";

export const metadata = {
  title: "emox | Online Shopping for Electronics, Fashion, Deals & More in India",
  description: "Shop top brands, smartphones, sneakers, fresh groceries and best daily deals with express delivery across India.",
};

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading emox Storefront...</p>
        </div>
      }
    >
      <StorefrontHomePage />
    </Suspense>
  );
}
