import { ManageGatewaysView } from "@/modules/gateways/components/ManageGatewaysView";

export const metadata = {
  title: "Payment Gateways | Admin Dashboard",
  description: "Manage Razorpay, PayPal, Paytm, AuthorizeNet, Stripe, COD payment gateways",
};

export default function GatewaysPage() {
  return <ManageGatewaysView />;
}
