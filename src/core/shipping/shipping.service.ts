import { DatabaseStore, ShippingProviderRecord, ShipmentRecord } from "../db/store";
import { decryptCredentials } from "./encryption";
import { EmailService } from "../mail/email.service";
import {
  ShippingAdapter,
  ShippingRateEstimate,
  ShipmentDispatchResult,
  TrackingResult,
} from "./types";
import { ShiprocketAdapter } from "./adapters/shiprocket.adapter";
import { NimbusPostAdapter } from "./adapters/nimbuspost.adapter";
import { DelhiveryAdapter } from "./adapters/delhivery.adapter";
import { CustomCarrierAdapter } from "./adapters/custom.adapter";

export class ShippingService {
  private static adapters: Map<string, ShippingAdapter> = new Map([
    ["shiprocket", new ShiprocketAdapter()],
    ["nimbuspost", new NimbusPostAdapter()],
    ["delhivery", new DelhiveryAdapter()],
  ]);

  /**
   * Register a new adapter dynamically
   */
  public static registerAdapter(adapter: ShippingAdapter): void {
    this.adapters.set(adapter.code.toLowerCase(), adapter);
  }

  /**
   * Resolve an adapter for a provider code
   */
  public static getAdapter(code: string, name?: string): ShippingAdapter {
    const key = (code || "").toLowerCase().trim();
    if (this.adapters.has(key)) {
      return this.adapters.get(key)!;
    }
    // Dynamic fallback for custom/manual providers added by admin
    return new CustomCarrierAdapter(key, name || key.toUpperCase());
  }

  /**
   * Test connection to a shipping provider
   */
  public static async testConnection(
    providerIdOrCode: string,
    overrideCredentials?: Record<string, any>,
    overrideSettings?: Record<string, any>,
    overrideBaseUrl?: string
  ): Promise<{ success: boolean; message: string; details?: any }> {
    const provider =
      (await DatabaseStore.findShippingProviderById(providerIdOrCode)) ||
      (await DatabaseStore.findShippingProviderByCode(providerIdOrCode));

    const code = provider ? provider.code : providerIdOrCode;
    const name = provider ? provider.name : providerIdOrCode;
    const baseUrl = overrideBaseUrl || provider?.apiBaseUrl;

    const creds: Record<string, any> =
      overrideCredentials || (provider ? decryptCredentials(provider.credentials) : {}) || {};
    const settings: Record<string, any> = overrideSettings || provider?.settings || {};

    const adapter = this.getAdapter(code, name);
    return adapter.testConnection(creds, settings, baseUrl);
  }

  /**
   * Calculate shipping rate for a single provider
   */
  public static async calculateRate(
    providerIdOrCode: string,
    origin: { pincode: string; city?: string; state?: string },
    destination: { pincode: string; city?: string; state?: string },
    packageDetails: {
      weightKg: number;
      lengthCm?: number;
      widthCm?: number;
      heightCm?: number;
      declaredValue?: number;
      isCod?: boolean;
    }
  ): Promise<ShippingRateEstimate> {
    const provider =
      (await DatabaseStore.findShippingProviderById(providerIdOrCode)) ||
      (await DatabaseStore.findShippingProviderByCode(providerIdOrCode));

    if (!provider) {
      throw new Error(`Shipping provider '${providerIdOrCode}' not found`);
    }

    if (!provider.isEnabled) {
      throw new Error(`Shipping provider '${provider.name}' is currently disabled`);
    }

    const adapter = this.getAdapter(provider.code, provider.name);
    const creds = decryptCredentials(provider.credentials);
    const settings = provider.settings || {};

    return adapter.calculateRate(origin, destination, packageDetails, creds, settings, provider.apiBaseUrl);
  }

  /**
   * Compare rates across all enabled shipping providers
   */
  public static async compareAllRates(
    origin: { pincode: string; city?: string; state?: string },
    destination: { pincode: string; city?: string; state?: string },
    packageDetails: {
      weightKg: number;
      lengthCm?: number;
      widthCm?: number;
      heightCm?: number;
      declaredValue?: number;
      isCod?: boolean;
    }
  ): Promise<ShippingRateEstimate[]> {
    const providers = await DatabaseStore.findShippingProviders(true); // active only
    const estimates: ShippingRateEstimate[] = [];

    for (const p of providers) {
      try {
        const adapter = this.getAdapter(p.code, p.name);
        const creds = decryptCredentials(p.credentials);
        const est = await adapter.calculateRate(
          origin,
          destination,
          packageDetails,
          creds,
          p.settings || {},
          p.apiBaseUrl
        );
        estimates.push(est);
      } catch (err) {
        console.warn(`Rate calculation failed for ${p.name}:`, err);
      }
    }

    // Sort cheapest first
    return estimates.sort((a, b) => a.rate - b.rate);
  }

  /**
   * Create and dispatch shipment for an order
   */
  public static async dispatchOrder(params: {
    orderId: string;
    shippingProviderId?: string;
    weightKg?: number;
    carrierService?: string;
    customAwb?: string;
    notes?: string;
  }): Promise<{ shipment: ShipmentRecord; trackingUrl?: string }> {
    const order = await DatabaseStore.findOrderById(params.orderId);
    if (!order) {
      throw new Error(`Order #${params.orderId} not found`);
    }

    // 1. Payment / COD Validation
    const isPaid = order.paymentStatus === "Paid";
    const isCod =
      order.gateway?.toLowerCase().includes("cod") ||
      order.gateway?.toLowerCase().includes("cash");

    if (!isPaid && !isCod) {
      throw new Error(
        `Cannot dispatch shipment: Order payment status is '${order.paymentStatus}' and payment method is not Cash on Delivery (COD). Please confirm payment first.`
      );
    }

    // 2. Prevent duplicate shipment creation
    const existingShipments = await DatabaseStore.findShipments({ orderId: order.id });
    const activeShipment = existingShipments.find(
      (s) => !["Cancelled", "Returned"].includes(s.shipmentStatus)
    );
    if (activeShipment) {
      throw new Error(
        `A shipment has already been created for order #${order.orderNumber} (AWB: ${activeShipment.awbNumber}, Status: ${activeShipment.shipmentStatus}). Duplicate shipments are prevented.`
      );
    }

    // 3. Resolve shipping provider
    let provider: ShippingProviderRecord | null = null;
    if (params.shippingProviderId) {
      provider =
        (await DatabaseStore.findShippingProviderById(params.shippingProviderId)) ||
        (await DatabaseStore.findShippingProviderByCode(params.shippingProviderId));
    }

    if (!provider) {
      // Pick default provider
      const providers = await DatabaseStore.findShippingProviders(true);
      provider = providers.find((p) => p.isDefault) || providers[0] || null;
    }

    if (!provider) {
      throw new Error("No active shipping provider is configured or enabled.");
    }

    if (!provider.isEnabled) {
      throw new Error(
        `Shipping provider '${provider.name}' is disabled and cannot be used for new dispatches.`
      );
    }

    // 4. Invoke provider adapter
    const adapter = this.getAdapter(provider.code, provider.name);
    const creds = decryptCredentials(provider.credentials);
    const settings = {
      ...(provider.settings || {}),
      defaultCourier: params.carrierService || provider.settings?.defaultCourier,
    };

    const dispatchResult: ShipmentDispatchResult = await adapter.createShipment(
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        shippingAddress: order.shippingAddress || "",
        shippingAddressDetail: (order as any).shippingAddressDetail,
        items: order.items || [],
        totalPrice: order.totalPrice,
        paymentStatus: order.paymentStatus,
        gateway: order.gateway,
        weightKg: params.weightKg || 1.0,
      },
      creds,
      settings,
      provider.apiBaseUrl
    );

    const finalAwb = params.customAwb?.trim() || dispatchResult.awbNumber;

    // Resolve assigned fulfillment warehouse
    const warehouses = await DatabaseStore.findWarehouses();
    const assignedWarehouse = order.warehouseId
      ? warehouses.find((w) => w.id === order.warehouseId)
      : warehouses[0] || null;

    const pickupAddress = assignedWarehouse
      ? `${assignedWarehouse.name}, ${assignedWarehouse.address || assignedWarehouse.addressLine1 || ""}, ${assignedWarehouse.city || ""}, ${assignedWarehouse.state || ""} ${assignedWarehouse.zipCode || ""}`.replace(/,\s*,/g, ",").trim()
      : "Main Warehouse Hub";

    // 5. Save shipment record in database
    const newShipment = await DatabaseStore.createShipment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      warehouseId: assignedWarehouse?.id,
      pickupAddress,
      deliveryAddress: order.shippingAddress,
      shippingProviderId: provider.id,
      shippingProviderName: provider.name,
      shippingProviderCode: provider.code,
      providerShipmentId: dispatchResult.providerShipmentId,
      awbNumber: finalAwb,
      trackingUrl: dispatchResult.trackingUrl,
      shippingCharge: dispatchResult.shippingCharge ?? order.shippingCost ?? 0,
      shipmentStatus: "Ready to Ship",
      shippingLabelPath: dispatchResult.shippingLabelPath,
      recipientName: order.customerName,
      recipientPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      carrier: dispatchResult.carrier || provider.name,
      shippedAt: new Date().toISOString(),
    });

    // 6. Update order status and tracking
    await DatabaseStore.updateOrder(order.id, {
      orderStatus: "Shipped",
      shipmentStatus: "Ready to Ship",
      trackingNumber: finalAwb,
      carrier: dispatchResult.carrier || provider.name,
      shippedAt: new Date().toISOString(),
    });

    // 7. Deduct/dispatch reserved stock in Warehouse Inventory
    if (order.items && order.items.length > 0) {
      const dispatchItems = order.items
        .filter((it: any) => Boolean(it.productId))
        .map((it: any) => ({
          productId: it.productId!,
          quantity: it.quantity,
          warehouseId: assignedWarehouse?.id,
        }));
      if (dispatchItems.length > 0) {
        await DatabaseStore.dispatchStock(newShipment.id, order.id, dispatchItems);
      }
    }

    // 8. Trigger Order Dispatched Email
    if (order.customerEmail) {
      EmailService.sendOrderDispatchedEmail(
        {
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
        },
        {
          trackingNumber: finalAwb,
          shippingProviderName: dispatchResult.carrier || provider.name,
          trackingUrl: dispatchResult.trackingUrl || `https://track.example.com/${finalAwb}`,
        },
        {
          name: assignedWarehouse?.name || "Main Fulfillment Hub",
          city: assignedWarehouse?.city,
        }
      ).catch((e: any) => console.error("Failed to trigger order dispatched email:", e));
    }

    return {
      shipment: newShipment,
      trackingUrl: dispatchResult.trackingUrl,
    };
  }

  /**
   * Live tracking retrieval
   */
  public static async getTracking(shipmentIdOrAwb: string): Promise<TrackingResult> {
    const shipment = await DatabaseStore.findShipmentByIdOrAwb(shipmentIdOrAwb);
    if (!shipment) {
      throw new Error(`Shipment '${shipmentIdOrAwb}' not found`);
    }

    const provider = shipment.shippingProviderId
      ? await DatabaseStore.findShippingProviderById(shipment.shippingProviderId)
      : null;

    const code = provider?.code || shipment.shippingProviderCode || "custom";
    const name = provider?.name || shipment.shippingProviderName || "Carrier";
    const adapter = this.getAdapter(code, name);
    const creds = provider ? decryptCredentials(provider.credentials) : {};
    const settings = provider?.settings || {};

    const tracking = await adapter.trackShipment(
      shipment.awbNumber || "",
      creds,
      settings,
      provider?.apiBaseUrl
    );

    // Sync status if changed
    if (tracking.status && tracking.status !== shipment.shipmentStatus) {
      await DatabaseStore.updateShipment(shipment.id, {
        shipmentStatus: tracking.status as any,
        deliveredAt: tracking.deliveredAt,
      });
    }

    return tracking;
  }

  /**
   * Cancel shipment
   */
  public static async cancelShipment(
    shipmentId: string
  ): Promise<{ success: boolean; message: string }> {
    const shipment = await DatabaseStore.findShipmentById(shipmentId);
    if (!shipment) {
      throw new Error(`Shipment '${shipmentId}' not found`);
    }

    if (shipment.shipmentStatus === "Delivered") {
      throw new Error("Cannot cancel a shipment that has already been delivered.");
    }

    const provider = shipment.shippingProviderId
      ? await DatabaseStore.findShippingProviderById(shipment.shippingProviderId)
      : null;

    const code = provider?.code || shipment.shippingProviderCode || "custom";
    const adapter = this.getAdapter(code, provider?.name);
    const creds = provider ? decryptCredentials(provider.credentials) : {};

    const res = await adapter.cancelShipment(
      shipment.providerShipmentId || "",
      shipment.awbNumber || "",
      creds,
      provider?.settings || {},
      provider?.apiBaseUrl
    );

    await DatabaseStore.updateShipment(shipment.id, {
      shipmentStatus: "Cancelled",
    });

    // Also update order shipmentStatus
    if (shipment.orderId) {
      await DatabaseStore.updateOrder(shipment.orderId, {
        shipmentStatus: "Pending",
      });
    }

    return res;
  }
}
