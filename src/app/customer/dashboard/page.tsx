import { CustomerDashboardView } from "@/modules/customer/components/CustomerDashboardView";

export const metadata = {
  title: "My Account & Orders | Tagateway Store",
  description: "View and manage your customer profile, order history, saved addresses, and payment preferences.",
};

export default function CustomerDashboardPage() {
  return <CustomerDashboardView />;
}
