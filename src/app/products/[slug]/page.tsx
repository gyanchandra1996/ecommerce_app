import React, { Suspense } from "react";
import { ProductDetailsPageView } from "@/modules/storefront/components/ProductDetailsPageView";
import { DatabaseStore } from "@/core/db/store";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await DatabaseStore.findProductById(slug);

  if (!product) {
    return {
      title: "Product Not Found | emox Online Shopping",
      description: "The requested product is not available.",
    };
  }

  const categoryName = product.categoryNames?.[0] || "Catalog";
  const desc =
    product.description ||
    `Shop ${product.name} on emox. Best deals, multiple options, authentic guarantee and fast shipping.`;

  return {
    title: `${product.name} | emox ${categoryName}`,
    description: desc.slice(0, 160),
    openGraph: {
      title: product.name,
      description: desc.slice(0, 160),
      images: product.mainImage ? [product.mainImage] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await DatabaseStore.findProductById(slug);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center font-sans">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading Product Specifications...</p>
        </div>
      }
    >
      <ProductDetailsPageView slug={slug} initialProduct={product} />
    </Suspense>
  );
}
