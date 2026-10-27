import { ShipmentsTrackingView } from "@/modules/shipping/components/ShipmentsTrackingView";

export const metadata = {
  title: "Shipments & Fulfillment | Admin Dashboard",
  description: "Manage orders shipment status, assign logistics carriers, tracking numbers, and print packing slips.",
};

export default function AdminShipmentsPage() {
  return <ShipmentsTrackingView />;
}
