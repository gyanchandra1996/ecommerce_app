import React, { Suspense } from "react";
import { CategoryListingView } from "@/modules/storefront/components/CategoryListingView";

export const metadata = {
  title: "Category Catalog | emox India",
  description: "Browse wide range of products, electronics, fashion, groceries and daily deals on emox India.",
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading Catalog...</p>
        </div>
      }
    >
      <CategoryListingView initialCategorySlug={slug} />
    </Suspense>
  );
}
