import { Suspense } from "react";
import { StorefrontHomePage } from "@/modules/storefront/components/StorefrontHomePage";
import { DatabaseStore } from "@/core/db/store";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await DatabaseStore.getSettings();
    const storeName = settings?.themeName || "G-store";
    const title = settings?.siteTitle || `${storeName} | Online Shopping for Electronics, Fashion, Deals & More in India`;
    return {
      title,
      description: settings?.footerAboutText || "Shop top brands, smartphones, sneakers, fresh groceries and best daily deals with express delivery across India.",
    };
  } catch {
    return {
      title: "G-store | Online Shopping for Electronics, Fashion, Deals & More in India",
      description: "Shop top brands, smartphones, sneakers, fresh groceries and best daily deals with express delivery across India.",
    };
  }
}

export default async function HomePage() {
  const settings = await DatabaseStore.getSettings().catch(() => null);
  const activeTheme = await DatabaseStore.getActiveTheme().catch(() => null);
  const storeName = settings?.themeName || activeTheme?.config?.design?.storeName || "G-store";

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-500">
            Loading {storeName} Storefront...
          </p>
        </div>
      }
    >
      <StorefrontHomePage initialStoreName={storeName} />
    </Suspense>
  );
}
