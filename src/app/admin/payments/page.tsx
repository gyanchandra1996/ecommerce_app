import { Metadata } from "next";
import { ManagePaymentsView } from "@/modules/payments/components/ManagePaymentsView";

export const metadata: Metadata = {
  title: "Payments Management | emox Admin",
  description: "View and manage payment transactions, gateways, refunds, and order payment histories.",
};

export default function AdminPaymentsPage() {
  return <ManagePaymentsView />;
}
