import { ManageMenuView } from "@/modules/menu/components/ManageMenuView";

export const metadata = {
  title: "Navigation Menu Manager | Admin",
  description: "Customize storefront navigation bar links, category menus, and highlight badges.",
};

export default function MenuManagerPage() {
  return <ManageMenuView />;
}
