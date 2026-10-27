import { ShippingProviderForm } from "@/modules/shipping/components/ShippingProviderForm";

export const metadata = {
  title: "Add Shipping Provider | Admin Dashboard",
  description: "Register a new carrier or custom shipping integration",
};

export default function CreateShippingProviderPage() {
  return <ShippingProviderForm />;
}
