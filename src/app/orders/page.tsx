import { redirect } from "next/navigation";

export default function OrdersRedirectPage() {
  redirect("/customer/dashboard?tab=orders");
}
