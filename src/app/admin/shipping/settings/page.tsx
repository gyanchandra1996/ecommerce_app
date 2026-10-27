import { ShippingSettingsView } from "@/modules/shipping/components/ShippingSettingsView";

export const metadata = {
  title: "Shipping Settings | Admin Dashboard",
  description: "Configure default carriers, warehouse dispatch address and free shipping rules",
};

export default function ShippingSettingsPage() {
  return <ShippingSettingsView />;
}
