import fs from "fs";
import path from "path";

const storePath = path.resolve("src/core/db/store.ts");
let content = fs.readFileSync(storePath, "utf8");

// 1. Interfaces
const interfacesToAdd = `
export interface ShippingProviderRecord {
  id: string;
  name: string;
  code: string; // shiprocket, nimbuspost, delhivery, or custom
  apiBaseUrl: string;
  credentials: Record<string, any> | string;
  settings: Record<string, any>;
  isEnabled: boolean;
  isDefault: boolean;
  pickupLocation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentRecord {
  id: string;
  orderId: string;
  orderNumber?: string;
  shippingProviderId?: string;
  shippingProviderName?: string;
  shippingProviderCode?: string;
  providerShipmentId?: string;
  awbNumber?: string;
  trackingUrl?: string;
  shippingCharge: number;
  shipmentStatus:
    | "Pending"
    | "Ready to Ship"
    | "Shipped"
    | "In Transit"
    | "Out for Delivery"
    | "Delivered"
    | "Cancelled"
    | "Returned";
  shippingLabelPath?: string;
  recipientName?: string;
  recipientPhone?: string;
  shippingAddress?: string;
  carrier?: string;
  shippedAt?: string;
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingSettingsRecord {
  defaultProviderId?: string;
  defaultProviderCode?: string;
  autoDispatch: boolean;
  allowManualDispatch: boolean;
  freeShippingThreshold: number;
  defaultWeightKg: number;
  senderAddress: {
    contactName: string;
    companyName: string;
    addressLine: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
  };
  trackingNotificationEmail: boolean;
  trackingNotificationSms: boolean;
  codAvailability: boolean;
  codExtraCharge: number;
  updatedAt: string;
}

export interface ShippingZoneRecord {
  id: string;
  name: string;
  zoneType: "local" | "regional" | "national" | "special";
  pincodePrefixes: string[];
  baseRate: number;
  additionalPerKg: number;
  estimatedDeliveryDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
`;

if (!content.includes("interface ShippingProviderRecord")) {
  const targetTheme = "export interface ThemeDesignSettings {";
  content = content.replace(targetTheme, `${interfacesToAdd}\n${targetTheme}`);
}

// 2. Schema properties
if (!content.includes("shippingProviders?: ShippingProviderRecord[]")) {
  const targetSchema = "gateways?: PaymentGatewayRecord[];";
  const replacementSchema = `gateways?: PaymentGatewayRecord[];
  shippingProviders?: ShippingProviderRecord[];
  shipments?: ShipmentRecord[];
  shippingSettings?: ShippingSettingsRecord;
  shippingZones?: ShippingZoneRecord[];`;
  content = content.replace(targetSchema, replacementSchema);
}

// 3. readLocalDb defaults
const targetRead = "gateways: parsed.gateways || [],";
const replacementRead = `gateways: parsed.gateways || [],
        shippingProviders: parsed.shippingProviders || [],
        shipments: parsed.shipments || [],
        shippingSettings: parsed.shippingSettings || null,
        shippingZones: parsed.shippingZones || [],`;

// Replace in both places in readLocalDb
content = content.split(targetRead).join(replacementRead);

// 4. Methods
const methodsToAdd = `
  // ================= SHIPPING PROVIDERS & SHIPMENTS =================
  public static async findShippingProviders(activeOnly = false): Promise<ShippingProviderRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    let list = db.shippingProviders || [];
    if (activeOnly) {
      list = list.filter((p) => p.isEnabled);
    }
    return list;
  }

  public static async findShippingProviderById(id: string): Promise<ShippingProviderRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return (
      (db.shippingProviders || []).find(
        (p) => p.id === id || p.code.toLowerCase() === id.toLowerCase()
      ) || null
    );
  }

  public static async findShippingProviderByCode(code: string): Promise<ShippingProviderRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return (
      (db.shippingProviders || []).find(
        (p) => p.code.toLowerCase() === code.toLowerCase()
      ) || null
    );
  }

  public static async createShippingProvider(
    data: Omit<ShippingProviderRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<ShippingProviderRecord> {
    const db = await this.readLocalDb();
    if (!db.shippingProviders) db.shippingProviders = [];

    if (data.isDefault) {
      db.shippingProviders.forEach((p) => {
        p.isDefault = false;
      });
    }

    const newProvider: ShippingProviderRecord = {
      id: "sp_" + Math.random().toString(36).substring(2, 9),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.shippingProviders.push(newProvider);
    await this.writeLocalDb(db);
    return newProvider;
  }

  public static async updateShippingProvider(
    id: string,
    data: Partial<Omit<ShippingProviderRecord, "id" | "createdAt" | "updatedAt">>
  ): Promise<ShippingProviderRecord | null> {
    const db = await this.readLocalDb();
    if (!db.shippingProviders) db.shippingProviders = [];
    const index = db.shippingProviders.findIndex((p) => p.id === id || p.code.toLowerCase() === id.toLowerCase());
    if (index === -1) return null;

    if (data.isDefault) {
      db.shippingProviders.forEach((p) => {
        p.isDefault = false;
      });
    }

    db.shippingProviders[index] = {
      ...db.shippingProviders[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.writeLocalDb(db);
    return db.shippingProviders[index];
  }

  public static async setDefaultShippingProvider(id: string): Promise<ShippingProviderRecord | null> {
    const db = await this.readLocalDb();
    if (!db.shippingProviders) return null;
    const target = db.shippingProviders.find((p) => p.id === id || p.code.toLowerCase() === id.toLowerCase());
    if (!target) return null;

    db.shippingProviders.forEach((p) => {
      p.isDefault = p.id === target.id;
      p.updatedAt = new Date().toISOString();
    });

    await this.writeLocalDb(db);
    return target;
  }

  public static async deleteShippingProvider(id: string): Promise<{ success: boolean; message?: string }> {
    const db = await this.readLocalDb();
    if (!db.shippingProviders) return { success: false, message: "No shipping providers found" };
    
    // Check if shipments exist for this provider
    const hasShipments = (db.shipments || []).some((s) => s.shippingProviderId === id);
    if (hasShipments) {
      // Disabling instead of deleting preserves existing shipment history and tracking!
      const target = db.shippingProviders.find((p) => p.id === id);
      if (target) {
        target.isEnabled = false;
        target.updatedAt = new Date().toISOString();
        await this.writeLocalDb(db);
        return {
          success: true,
          message: "Provider has linked shipment records. It has been disabled to preserve historical tracking records.",
        };
      }
    }

    db.shippingProviders = db.shippingProviders.filter((p) => p.id !== id);
    await this.writeLocalDb(db);
    return { success: true };
  }

  // ================= SHIPMENTS =================
  public static async findShipments(filter?: {
    orderId?: string;
    search?: string;
    status?: string;
    providerId?: string;
  }): Promise<ShipmentRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    let list = db.shipments || [];

    if (filter?.orderId) {
      list = list.filter((s) => s.orderId === filter.orderId || s.orderNumber === filter.orderId);
    }
    if (filter?.status && filter.status !== "All") {
      list = list.filter((s) => s.shipmentStatus?.toLowerCase() === filter.status?.toLowerCase());
    }
    if (filter?.providerId && filter.providerId !== "All") {
      list = list.filter(
        (s) =>
          s.shippingProviderId === filter.providerId ||
          s.shippingProviderCode?.toLowerCase() === filter.providerId?.toLowerCase()
      );
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.awbNumber?.toLowerCase().includes(q) ||
          s.orderNumber?.toLowerCase().includes(q) ||
          s.recipientName?.toLowerCase().includes(q) ||
          s.shippingAddress?.toLowerCase().includes(q) ||
          s.carrier?.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static async findShipmentById(id: string): Promise<ShipmentRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return (db.shipments || []).find((s) => s.id === id) || null;
  }

  public static async findShipmentByIdOrAwb(idOrAwb: string): Promise<ShipmentRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return (
      (db.shipments || []).find(
        (s) => s.id === idOrAwb || s.awbNumber?.toLowerCase() === idOrAwb.toLowerCase()
      ) || null
    );
  }

  public static async createShipment(
    data: Omit<ShipmentRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<ShipmentRecord> {
    const db = await this.readLocalDb();
    if (!db.shipments) db.shipments = [];

    const newShipment: ShipmentRecord = {
      id: "shp_" + Math.random().toString(36).substring(2, 9),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.shipments.push(newShipment);
    await this.writeLocalDb(db);
    return newShipment;
  }

  public static async updateShipment(
    id: string,
    updates: Partial<ShipmentRecord>
  ): Promise<ShipmentRecord | null> {
    const db = await this.readLocalDb();
    if (!db.shipments) db.shipments = [];
    const index = db.shipments.findIndex(
      (s) => s.id === id || s.awbNumber?.toLowerCase() === id.toLowerCase()
    );
    if (index === -1) return null;

    db.shipments[index] = {
      ...db.shipments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.writeLocalDb(db);
    return db.shipments[index];
  }

  // ================= SHIPPING SETTINGS & ZONES =================
  public static async getShippingSettings(): Promise<ShippingSettingsRecord> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    if (!db.shippingSettings) {
      return {
        defaultProviderCode: "shiprocket",
        autoDispatch: false,
        allowManualDispatch: true,
        freeShippingThreshold: 500,
        defaultWeightKg: 0.5,
        senderAddress: {
          contactName: "Logistics Manager",
          companyName: "emox Store Hub",
          addressLine: "Unit 14, Prime Industrial Area",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400050",
          country: "India",
          phone: "+91 98200 12345",
          email: "dispatch@store.com",
        },
        trackingNotificationEmail: true,
        trackingNotificationSms: true,
        codAvailability: true,
        codExtraCharge: 40,
        updatedAt: new Date().toISOString(),
      };
    }
    return db.shippingSettings;
  }

  public static async updateShippingSettings(
    updates: Partial<ShippingSettingsRecord>
  ): Promise<ShippingSettingsRecord> {
    const db = await this.readLocalDb();
    const current = await this.getShippingSettings();
    const updated: ShippingSettingsRecord = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    db.shippingSettings = updated;
    await this.writeLocalDb(db);
    return updated;
  }

  public static async getShippingZones(): Promise<ShippingZoneRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return db.shippingZones || [];
  }

  public static async saveShippingZone(data: Partial<ShippingZoneRecord>): Promise<ShippingZoneRecord> {
    const db = await this.readLocalDb();
    if (!db.shippingZones) db.shippingZones = [];

    if (data.id) {
      const idx = db.shippingZones.findIndex((z) => z.id === data.id);
      if (idx !== -1) {
        db.shippingZones[idx] = {
          ...db.shippingZones[idx],
          ...data,
          updatedAt: new Date().toISOString(),
        } as ShippingZoneRecord;
        await this.writeLocalDb(db);
        return db.shippingZones[idx];
      }
    }

    const newZone: ShippingZoneRecord = {
      id: "zone_" + Math.random().toString(36).substring(2, 9),
      name: data.name || "Standard Zone",
      zoneType: data.zoneType || "regional",
      pincodePrefixes: data.pincodePrefixes || [],
      baseRate: Number(data.baseRate) || 50,
      additionalPerKg: Number(data.additionalPerKg) || 25,
      estimatedDeliveryDays: Number(data.estimatedDeliveryDays) || 3,
      isActive: data.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.shippingZones.push(newZone);
    await this.writeLocalDb(db);
    return newZone;
  }

  public static async deleteShippingZone(id: string): Promise<boolean> {
    const db = await this.readLocalDb();
    if (!db.shippingZones) return false;
    db.shippingZones = db.shippingZones.filter((z) => z.id !== id);
    await this.writeLocalDb(db);
    return true;
  }
`;

if (!content.includes("// ================= SHIPPING PROVIDERS & SHIPMENTS =================")) {
  const targetThemeMethods = "  // ================= THEMES & PREVIEWS =================";
  content = content.replace(targetThemeMethods, `${methodsToAdd}\n${targetThemeMethods}`);
}

// 5. Seed logic
const seedToAdd = `
    // 20. Seed Shipping Providers (Shiprocket, NimbusPost, Delhivery)
    if (!db.shippingProviders || db.shippingProviders.length === 0) {
      db.shippingProviders = [
        {
          id: "sp_shiprocket",
          name: "Shiprocket",
          code: "shiprocket",
          apiBaseUrl: "https://apiv2.shiprocket.in/v1/external",
          credentials: {
            email: "merchant@ecommerce.com",
            password: "demo_shiprocket_secret",
            apiKey: "sr_live_api_token_7721",
          },
          settings: {
            pickupLocation: "Primary Warehouse Mumbai (Hub 1)",
            defaultCourier: "BlueDart Express Air",
            autoLabelGenerate: true,
          },
          isEnabled: true,
          isDefault: true,
          pickupLocation: "Primary Warehouse Mumbai",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "sp_nimbuspost",
          name: "NimbusPost",
          code: "nimbuspost",
          apiBaseUrl: "https://api.nimbuspost.com/v1",
          credentials: {
            email: "logistics@ecommerce.com",
            apiKey: "np_live_token_884920",
          },
          settings: {
            pickupLocation: "Bandra Warehouse Hub",
            defaultCourier: "NimbusPost Priority Network",
            autoLabelGenerate: false,
          },
          isEnabled: true,
          isDefault: false,
          pickupLocation: "Bandra Warehouse Hub",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "sp_delhivery",
          name: "Delhivery",
          code: "delhivery",
          apiBaseUrl: "https://track.delhivery.com/api/",
          credentials: {
            apiToken: "delhivery_api_token_live_992",
            clientId: "DELHIVERY_MERCHANT_101",
          },
          settings: {
            pickupLocation: "Delhivery Central Hub Mumbai",
            expressDelivery: true,
            autoLabelGenerate: true,
          },
          isEnabled: true,
          isDefault: false,
          pickupLocation: "Delhivery Central Hub Mumbai",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      hasChanges = true;
    }

    // 21. Seed Shipping Settings
    if (!db.shippingSettings) {
      db.shippingSettings = {
        defaultProviderCode: "shiprocket",
        autoDispatch: false,
        allowManualDispatch: true,
        freeShippingThreshold: 500,
        defaultWeightKg: 0.5,
        senderAddress: {
          contactName: "Logistics Manager",
          companyName: "emox Store Logistics",
          addressLine: "Unit 14, Prime Industrial Area, Bandra West",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400050",
          country: "India",
          phone: "+91 98200 12345",
          email: "dispatch@store.com",
        },
        trackingNotificationEmail: true,
        trackingNotificationSms: true,
        codAvailability: true,
        codExtraCharge: 40,
        updatedAt: new Date().toISOString(),
      };
      hasChanges = true;
    }

    // 22. Seed Shipping Zones
    if (!db.shippingZones || db.shippingZones.length === 0) {
      db.shippingZones = [
        {
          id: "zone_local",
          name: "Intra-City Local (Mumbai MMR)",
          zoneType: "local",
          pincodePrefixes: ["400", "401"],
          baseRate: 35,
          additionalPerKg: 15,
          estimatedDeliveryDays: 1,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "zone_regional",
          name: "Regional (Maharashtra & Goa)",
          zoneType: "regional",
          pincodePrefixes: ["41", "42", "43", "44", "403"],
          baseRate: 48,
          additionalPerKg: 20,
          estimatedDeliveryDays: 2,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "zone_metro",
          name: "Metro to Metro (Delhi, BLR, HYD, MAA, CCU)",
          zoneType: "national",
          pincodePrefixes: ["110", "560", "500", "600", "700"],
          baseRate: 65,
          additionalPerKg: 25,
          estimatedDeliveryDays: 3,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "zone_roi",
          name: "Rest of India (Tier 2/3 Cities)",
          zoneType: "national",
          pincodePrefixes: [],
          baseRate: 85,
          additionalPerKg: 35,
          estimatedDeliveryDays: 4,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      hasChanges = true;
    }

    // 23. Seed Shipments for existing orders if empty
    if (!db.shipments || db.shipments.length === 0) {
      db.shipments = (db.orders || []).slice(0, 5).map((o, idx) => {
        const prov = idx % 2 === 0 ? "shiprocket" : "delhivery";
        const awb = prov === "shiprocket" ? "SR-88921" + idx : "DEL-77291" + idx;
        return {
          id: "shp_" + o.id,
          orderId: o.id,
          orderNumber: o.orderNumber,
          shippingProviderId: prov === "shiprocket" ? "sp_shiprocket" : "sp_delhivery",
          shippingProviderName: prov === "shiprocket" ? "Shiprocket" : "Delhivery",
          shippingProviderCode: prov,
          providerShipmentId: "PRV-SHP-" + (1000 + idx),
          awbNumber: o.trackingNumber || awb,
          trackingUrl: prov === "shiprocket" ? "https://shiprocket.co/tracking/" + awb : "https://www.delhivery.com/track/package/" + awb,
          shippingCharge: o.shippingCost || 45,
          shipmentStatus: (o.orderStatus === "Delivered" ? "Delivered" : "Shipped") as any,
          recipientName: o.customerName,
          shippingAddress: o.shippingAddress,
          carrier: o.carrier || (prov === "shiprocket" ? "BlueDart Express" : "Delhivery Surface"),
          shippedAt: o.shippedAt || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
      hasChanges = true;
    }
`;

if (!content.includes("// 20. Seed Shipping Providers")) {
  const targetEnd = `    if (hasChanges) {
      await this.writeLocalDb(db);
    }`;
  content = content.replace(targetEnd, `${seedToAdd}\n${targetEnd}`);
}

fs.writeFileSync(storePath, content, "utf8");
console.log("Successfully patched store.ts with shipping providers and shipments!");
