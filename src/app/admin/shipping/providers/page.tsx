import { ShippingProvidersView } from "@/modules/shipping/components/ShippingProvidersView";

export const metadata = {
  title: "Shipping Providers | Admin Dashboard",
  description: "Configure dynamic shipping integrations (Shiprocket, NimbusPost, Delhivery, etc.)",
};

export default function ShippingProvidersPage() {
  return <ShippingProvidersView />;
}
