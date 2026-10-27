import fs from "fs";
import path from "path";

const storePath = path.resolve("src/core/db/store.ts");
let content = fs.readFileSync(storePath, "utf8");

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
          trackingUrl:
            prov === "shiprocket"
              ? "https://shiprocket.co/tracking/" + awb
              : "https://www.delhivery.com/track/package/" + awb,
          shippingCharge: o.shippingCost || 45,
          shipmentStatus: o.orderStatus === "Delivered" ? "Delivered" : "Shipped",
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
  const lastIfIdx = content.lastIndexOf("if (hasChanges) {");
  if (lastIfIdx !== -1) {
    content = content.slice(0, lastIfIdx) + seedToAdd + "\n\n    " + content.slice(lastIfIdx);
    fs.writeFileSync(storePath, content, "utf8");
    console.log("Seed section injected successfully!");
  } else {
    console.error("Could not find last if (hasChanges)");
  }
} else {
  console.log("Seed section already present");
}
