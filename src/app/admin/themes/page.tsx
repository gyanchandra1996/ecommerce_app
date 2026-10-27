import { ManageThemesView } from "@/modules/themes/components/ManageThemesView";

export const metadata = {
  title: "Themes | Admin Dashboard",
  description: "Shopify-like multi-theme manager: upload zip themes, preview, customize, and switch live themes.",
};

export default function ThemesPage() {
  return <ManageThemesView />;
}
