import { Suspense } from "react";
import { ThemeCustomizerView } from "@/modules/themes/components/ThemeCustomizerView";

export const metadata = {
  title: "Theme Editor & Live Preview | Admin",
  description: "Shopify-like split editor with live desktop, tablet, and mobile preview pane.",
};

export default function ThemeCustomizePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading editor...</div>}>
      <ThemeCustomizerView />
    </Suspense>
  );
}
