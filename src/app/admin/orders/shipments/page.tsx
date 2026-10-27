import { ShipmentsView } from "@/modules/orders/components/ShipmentsView";

export const metadata = {
  title: "Shipments & Fulfillment | Admin Dashboard",
  description: "Manage orders shipment status, assign logistics carriers, tracking numbers, and print packing slips.",
};

export default function ShipmentsPage() {
  return <ShipmentsView />;
}
