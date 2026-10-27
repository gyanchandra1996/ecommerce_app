import {
  ShippingAdapter,
  ShippingRateEstimate,
  ShipmentDispatchResult,
  TrackingResult,
} from "../types";

export class CustomCarrierAdapter implements ShippingAdapter {
  public code: string;
  public name: string;

  constructor(code = "custom", name = "Custom / Manual Carrier") {
    this.code = code;
    this.name = name;
  }

  public async testConnection(
    credentials: Record<string, any>,
    settings: Record<string, any>,
    apiBaseUrl?: string
  ): Promise<{ success: boolean; message: string; details?: any }> {
    return {
      success: true,
      message: `Configured adapter for ${this.name} verified successfully.`,
      details: {
        baseUrl: apiBaseUrl || "Manual / Custom API",
        providerCode: this.code,
        pickupLocation: settings.pickupLocation || "Store Hub",
        status: "ACTIVE",
      },
    };
  }

  public async calculateRate(
    origin: { pincode: string },
    destination: { pincode: string },
    packageDetails: { weightKg: number; isCod?: boolean },
    credentials: Record<string, any>,
    settings: Record<string, any>
  ): Promise<ShippingRateEstimate> {
    const baseRate = Number(settings.flatRate) || 50.0;
    const codCharge = packageDetails.isCod ? Number(settings.codCharge || 30.0) : 0;
    return {
      rate: baseRate + codCharge,
      currency: "INR",
      carrierService: settings.carrierName || this.name,
      estimatedDays: 3,
      providerCode: this.code,
      providerName: this.name,
    };
  }

  public async createShipment(
    order: {
      orderId: string;
      orderNumber: string;
      customerName: string;
      shippingAddress: string;
      shippingAddressDetail?: any;
      items: Array<{ name: string; quantity: number; price: number }>;
      totalPrice: number;
      paymentStatus: string;
      gateway: string;
      weightKg?: number;
    },
    credentials: Record<string, any>,
    settings: Record<string, any>
  ): Promise<ShipmentDispatchResult> {
    const prefix = (this.code.slice(0, 3) || "GEN").toUpperCase();
    const awbNumber = `${prefix}-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const providerShipmentId = `MANUAL-${order.orderNumber}`;
    const customTracking = settings.trackingUrlTemplate
      ? settings.trackingUrlTemplate.replace("{awb}", awbNumber)
      : `/admin/shipping/tracking?search=${awbNumber}`;

    return {
      providerShipmentId,
      awbNumber,
      trackingUrl: customTracking,
      shippingCharge: Number(settings.flatRate) || 50.0,
      status: "Ready to Ship",
      carrier: settings.carrierName || this.name,
      shippingLabelPath: `/api/shipping/shipments/${providerShipmentId}/label`,
    };
  }

  public async generateLabel(
    providerShipmentId: string,
    awbNumber: string,
    credentials: Record<string, any>,
    settings: Record<string, any>
  ): Promise<{ labelUrl: string; labelHtml?: string }> {
    return {
      labelUrl: `/api/shipping/shipments/${awbNumber}/label`,
      labelHtml: `
        <div style="font-family: Arial, sans-serif; border: 2px solid #333; padding: 15px; max-width: 450px;">
          <h3 style="margin: 0 0 10px 0;">${this.name.toUpperCase()}</h3>
          <p><strong>AWB Number:</strong> ${awbNumber}</p>
          <p><strong>Shipment ID:</strong> ${providerShipmentId}</p>
          <p><strong>Dispatch Hub:</strong> ${settings.pickupLocation || "Main Warehouse"}</p>
        </div>
      `,
    };
  }

  public async trackShipment(
    awbNumber: string,
    credentials: Record<string, any>,
    settings: Record<string, any>
  ): Promise<TrackingResult> {
    const now = new Date().toISOString();
    return {
      awbNumber,
      status: "Dispatched",
      currentLocation: settings.pickupLocation || "Local Hub",
      activities: [
        {
          status: "Dispatched",
          location: settings.pickupLocation || "Local Hub",
          timestamp: now,
          activity: "Package dispatched via carrier",
        },
      ],
    };
  }

  public async cancelShipment(
    providerShipmentId: string,
    awbNumber: string,
    credentials: Record<string, any>
  ): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: `Shipment ${awbNumber} cancelled.`,
    };
  }
}
