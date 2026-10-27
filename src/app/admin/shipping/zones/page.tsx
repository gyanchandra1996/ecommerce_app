import { ShippingZonesView } from "@/modules/shipping/components/ShippingZonesView";

export const metadata = {
  title: "Shipping Zones & Rates | Admin Dashboard",
  description: "Manage regional delivery zones, base rates and per-kg weight tiers",
};

export default function ShippingZonesPage() {
  return <ShippingZonesView />;
}
