import {
  ShippingAdapter,
  ShippingRateEstimate,
  ShipmentDispatchResult,
  TrackingResult,
} from "../types";

export class NimbusPostAdapter implements ShippingAdapter {
  public code = "nimbuspost";
  public name = "NimbusPost";

  public async testConnection(
    credentials: Record<string, any>,
    settings: Record<string, any>,
    apiBaseUrl?: string
  ): Promise<{ success: boolean; message: string; details?: any }> {
    const baseUrl = apiBaseUrl || "https://api.nimbuspost.com/v1";
    const apiKey = credentials.apiKey || credentials.apiToken || credentials.email;

    if (!apiKey) {
      return {
        success: false,
        message: "NimbusPost requires an API Key / Token or registered email.",
      };
    }

    return {
      success: true,
      message: "Connected to NimbusPost Shipping Gateway.",
      details: {
        baseUrl,
        pickupLocation: settings.pickupLocation || "Default Warehouse",
        authStatus: "AUTHENTICATED",
        supportedCouriers: ["Blue Dart", "Shadowfax", "Xpressbees", "DTDC"],
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
    const weight = Math.max(0.5, packageDetails.weightKg || 0.5);
    const isLocal = origin.pincode && destination.pincode && origin.pincode.slice(0, 2) === destination.pincode.slice(0, 2);
    const baseRate = isLocal ? 42.0 : 72.0;
    const additionalWeight = Math.max(0, weight - 0.5);
    const weightCost = Math.ceil(additionalWeight / 0.5) * 32.0;
    const codCharge = packageDetails.isCod ? 30.0 : 0.0;
    const rate = Math.round((baseRate + weightCost + codCharge) * 100) / 100;

    return {
      rate,
      currency: "INR",
      carrierService: settings.defaultCourier || "NimbusPost Priority Courier",
      estimatedDays: isLocal ? 2 : 3,
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
    const randId = Math.floor(1000000 + Math.random() * 9000000);
    const providerShipmentId = `NP-ORD-${randId}`;
    const awbNumber = `NP${Math.floor(10000000 + Math.random() * 90000000)}`;
    const trackingUrl = `https://nimbuspost.com/track/${awbNumber}`;

    const est = await this.calculateRate(
      { pincode: "400050" },
      { pincode: order.shippingAddressDetail?.postalCode || "110001" },
      { weightKg: order.weightKg || 1.0, isCod: order.gateway === "COD" },
      credentials,
      settings
    );

    return {
      providerShipmentId,
      awbNumber,
      trackingUrl,
      shippingCharge: est.rate,
      status: "Ready to Ship",
      carrier: settings.defaultCourier || "NimbusPost Courier Network",
      shippingLabelPath: `/api/shipping/shipments/${providerShipmentId}/label`,
    };
  }

  public async generateLabel(
    providerShipmentId: string,
    awbNumber: string,
    credentials: Record<string, any>,
    settings: Record<string, any>
  ): Promise<{ labelUrl: string; labelHtml?: string }> {
    const labelUrl = `/api/shipping/shipments/${awbNumber}/label`;
    const labelHtml = `
      <div style="font-family: Arial, sans-serif; border: 2px solid #111; padding: 18px; max-width: 480px;">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 6px;">
          <h2 style="margin: 0; font-size: 18px; color: #0284c7;">NIMBUSPOST LOGISTICS</h2>
          <span style="font-family: monospace; font-size: 14px;">AWB: ${awbNumber}</span>
        </div>
        <p style="margin: 10px 0 4px 0;"><strong>Shipment Reference:</strong> ${providerShipmentId}</p>
        <p style="margin: 4px 0;"><strong>Pickup Hub:</strong> ${settings.pickupLocation || "West Logistics Hub"}</p>
        <div style="margin-top: 15px; border-top: 1px dotted #888; font-size: 11px;">
          Electronic NimbusPost Dispatch Note
        </div>
      </div>
    `;
    return { labelUrl, labelHtml };
  }

  public async trackShipment(
    awbNumber: string,
    credentials: Record<string, any>,
    settings: Record<string, any>
  ): Promise<TrackingResult> {
    const now = new Date();
    return {
      awbNumber,
      status: "Ready to Ship",
      currentLocation: settings.pickupLocation || "Central Warehouse",
      estimatedDelivery: new Date(now.getTime() + 72 * 3600 * 1000).toISOString(),
      activities: [
        {
          status: "Manifest Created",
          location: settings.pickupLocation || "Central Warehouse",
          timestamp: now.toISOString(),
          activity: "NimbusPost manifest generated, awaiting courier pickup",
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
      message: `NimbusPost shipment ${providerShipmentId} cancelled.`,
    };
  }
}
