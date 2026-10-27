import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DatabaseStore } from "@/core/db/store";
import { OrderDetailView } from "@/modules/orders/components/OrderDetailView";

export const metadata = {
  title: "Order Details | Admin Dashboard",
  description: "View order breakdown, customer destination, fulfillment and shipping provider dispatch.",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await DatabaseStore.findOrderById(id);

  if (!order) {
    notFound();
  }

  const shipments = await DatabaseStore.findShipments({ orderId: order.id });
  const providers = await DatabaseStore.findShippingProviders(true);

  return (
    <OrderDetailView
      order={order}
      shipments={shipments}
      providers={providers}
    />
  );
}
