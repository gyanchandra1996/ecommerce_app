import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { ShippingService } from "@/core/shipping/shipping.service";
import { decryptCredentials } from "@/core/shipping/encryption";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shipment = await DatabaseStore.findShipmentByIdOrAwb(id);
    if (!shipment) {
      return new Response("Shipment not found", { status: 404 });
    }

    const order = shipment.orderId ? await DatabaseStore.findOrderById(shipment.orderId) : null;
    const provider = shipment.shippingProviderId
      ? await DatabaseStore.findShippingProviderById(shipment.shippingProviderId)
      : null;

    const adapter = ShippingService.getAdapter(
      provider?.code || shipment.shippingProviderCode || "custom",
      provider?.name || shipment.shippingProviderName
    );

    const creds = provider ? decryptCredentials(provider.credentials) : {};
    const settings = provider?.settings || {};

    const labelResult = await adapter.generateLabel(
      shipment.providerShipmentId || shipment.id,
      shipment.awbNumber || `AWB-${shipment.id}`,
      creds,
      settings
    );

    const accept = req.headers.get("accept") || "";
    if (accept.includes("application/json")) {
      return NextResponse.json({
        success: true,
        data: {
          shipmentId: shipment.id,
          awbNumber: shipment.awbNumber,
          labelUrl: labelResult.labelUrl,
          labelHtml: labelResult.labelHtml,
        },
      });
    }

    // Render full printable HTML page
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Shipping Label - AWB ${shipment.awbNumber || shipment.id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 24px; display: flex; flex-direction: column; align-items: center; }
    .label-container { background: #fff; width: 480px; border: 2px solid #0f172a; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
    .carrier-title { font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a; }
    .awb-badge { font-family: monospace; font-size: 14px; font-weight: bold; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; border: 1px solid #cbd5e1; }
    .barcode-sim { text-align: center; margin: 16px 0; padding: 12px 0; background: #fafafa; border: 1px dashed #cbd5e1; font-family: monospace; letter-spacing: 4px; font-size: 18px; font-weight: bold; }
    .address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; font-size: 12px; }
    .address-box { background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; }
    .address-title { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
    .details-row { border-top: 1px solid #e2e8f0; padding-top: 12px; display: flex; justify-content: space-between; font-size: 12px; color: #334155; }
    .print-btn { margin-top: 16px; padding: 10px 24px; background: #4f46e5; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
    @media print {
      body { background: #fff; padding: 0; }
      .print-btn { display: none; }
      .label-container { border: 2px solid #000; box-shadow: none; width: 100%; max-width: 500px; }
    }
  </style>
</head>
<body>
  <div class="label-container">
    <div class="header">
      <div>
        <div class="carrier-title">${shipment.carrier || provider?.name || "LOGISTICS EXPRESS"}</div>
        <small style="color: #64748b; font-size: 11px;">Standard Express Delivery</small>
      </div>
      <div class="awb-badge">AWB: ${shipment.awbNumber || "PENDING"}</div>
    </div>

    <div class="barcode-sim">
      ||| | ||||| || |||| ||| ||||||| | |||
      <div style="font-size: 12px; letter-spacing: 2px; margin-top: 4px;">*${shipment.awbNumber}*</div>
    </div>

    <div class="address-grid">
      <div class="address-box">
        <div class="address-title">SHIP FROM:</div>
        <strong>emox Store Hub</strong><br>
        Unit 14, Prime Industrial Area<br>
        Bandra West, Mumbai - 400050<br>
        Tel: +91 98200 12345
      </div>
      <div class="address-box">
        <div class="address-title">DELIVER TO:</div>
        <strong>${shipment.recipientName || order?.customerName || "Customer"}</strong><br>
        ${shipment.shippingAddress || order?.shippingAddress || "Customer Delivery Address"}<br>
        ${shipment.recipientPhone ? `Tel: ${shipment.recipientPhone}` : ""}
      </div>
    </div>

    <div class="details-row">
      <div><strong>Order:</strong> #${shipment.orderNumber || order?.orderNumber || "ORD"}</div>
      <div><strong>Payment:</strong> ${order?.gateway || "Prepaid"} (${order?.paymentStatus || "Paid"})</div>
      <div><strong>Weight:</strong> 0.85 kg</div>
    </div>
  </div>

  <button class="print-btn" onclick="window.print()">Print Shipping Label</button>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error: any) {
    return new Response(`Error generating shipping label: ${error.message}`, { status: 500 });
  }
}
