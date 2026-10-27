import { AddOrderView } from "@/modules/orders/components/AddOrderView";

export const metadata = {
  title: "Add Order | Admin Dashboard",
  description: "Create order manually with customer selection, item details, billing and shipping address modals, and payment gateways.",
};

export default function AddOrderPage() {
  return <AddOrderView />;
}
