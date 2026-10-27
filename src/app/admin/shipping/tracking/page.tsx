import { ShipmentsTrackingView } from "@/modules/shipping/components/ShipmentsTrackingView";

export const metadata = {
  title: "Shipments & Tracking | Admin Dashboard",
  description: "Live package fulfillment, carrier manifests, AWB numbers and printable shipping labels",
};

export default function ShipmentsTrackingPage() {
  return <ShipmentsTrackingView />;
}
