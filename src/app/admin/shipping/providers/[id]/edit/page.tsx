import { ShippingProviderForm } from "@/modules/shipping/components/ShippingProviderForm";

export const metadata = {
  title: "Edit Shipping Provider | Admin Dashboard",
  description: "Modify shipping provider settings, credentials and courier routing",
};

export default async function EditShippingProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ShippingProviderForm providerId={id} />;
}
