import { ManageOrdersView } from "@/modules/orders/components/ManageOrdersView";

export const metadata = {
  title: "Pending Orders | Admin Dashboard",
  description: "View and process pending customer orders.",
};

export default function PendingOrdersPage() {
  return <ManageOrdersView initialStatus="Pending" title="Pending Orders" />;
}
