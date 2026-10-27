import { DatabaseStore } from "../src/core/db/store";
import { ShippingService } from "../src/core/shipping/shipping.service";
import { decryptCredentials, maskSensitiveCredentials } from "../src/core/shipping/encryption";

async function runTests() {
  console.log("=== STARTING COMPREHENSIVE SHIPPING MANAGEMENT MODULE VERIFICATION ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✕ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // TEST 1: Initial Seed Providers
    console.log("--- TEST 1: Shipping Providers Seeding & Verification ---");
    const initialProviders = await DatabaseStore.findShippingProviders();
    assert(initialProviders.length >= 3, `Found ${initialProviders.length} shipping providers in DB`);

    const shiprocket = await DatabaseStore.findShippingProviderByCode("shiprocket");
    assert(shiprocket !== null, "Shiprocket provider found in database");
    assert(shiprocket?.isEnabled === true, "Shiprocket is enabled by default");
    assert(shiprocket?.isDefault === true, "Shiprocket is default provider");

    const nimbuspost = await DatabaseStore.findShippingProviderByCode("nimbuspost");
    assert(nimbuspost !== null, "NimbusPost provider found in database");

    const delhivery = await DatabaseStore.findShippingProviderByCode("delhivery");
    assert(delhivery !== null, "Delhivery provider found in database");

    // TEST 2: Independent Configuration & Test Connection
    console.log("\n--- TEST 2: Independent Provider Configuration & Test Connection ---");
    const testSr = await ShippingService.testConnection("shiprocket");
    assert(testSr.success === true, `Shiprocket test connection: ${testSr.message}`);

    const testNp = await ShippingService.testConnection("nimbuspost");
    assert(testNp.success === true, `NimbusPost test connection: ${testNp.message}`);

    const testDel = await ShippingService.testConnection("delhivery");
    assert(testDel.success === true, `Delhivery test connection: ${testDel.message}`);

    // TEST 3: Security & Encryption of Credentials
    console.log("\n--- TEST 3: Credential Encryption & Masking at Rest ---");
    const rawSrCreds = decryptCredentials(shiprocket.credentials);
    assert(Boolean(rawSrCreds.apiKey || rawSrCreds.email), "Raw credentials successfully decrypted on backend");

    const maskedCreds = maskSensitiveCredentials(rawSrCreds);
    assert(maskedCreds.password ? maskedCreds.password.includes("••") : true, "Sensitive password masked for frontend presentation");
    assert(!JSON.stringify(maskedCreds).includes("demo_shiprocket_secret"), "Plaintext secret never leaked in masked presentation");

    // TEST 4: Default Provider Toggle & Mutual Exclusivity
    console.log("\n--- TEST 4: Default Provider Switching (Single Default Exclusivity) ---");
    await DatabaseStore.setDefaultShippingProvider(delhivery.id);
    const updatedDelhivery = await DatabaseStore.findShippingProviderById(delhivery.id);
    const refreshedSr = await DatabaseStore.findShippingProviderById(shiprocket.id);

    assert(updatedDelhivery?.isDefault === true, "Delhivery successfully set as new default provider");
    assert(refreshedSr?.isDefault === false, "Shiprocket automatically unset as default (single default enforced)");

    // Restore Shiprocket as default
    await DatabaseStore.setDefaultShippingProvider(shiprocket.id);

    // TEST 5: Enable/Disable Providers
    console.log("\n--- TEST 5: Enable and Disable Providers ---");
    await DatabaseStore.updateShippingProvider(nimbuspost.id, { isEnabled: false });
    const disabledNp = await DatabaseStore.findShippingProviderById(nimbuspost.id);
    assert(disabledNp?.isEnabled === false, "NimbusPost successfully disabled");

    const activeProviders = await DatabaseStore.findShippingProviders(true);
    assert(!activeProviders.some((p) => p.code === "nimbuspost"), "Disabled provider omitted from active providers list");

    // Re-enable
    await DatabaseStore.updateShippingProvider(nimbuspost.id, { isEnabled: true });
    const reEnabledNp = await DatabaseStore.findShippingProviderById(nimbuspost.id);
    assert(reEnabledNp?.isEnabled === true, "NimbusPost re-enabled successfully");

    // TEST 6: Modular Adapter Architecture & Custom Carrier Extensibility
    console.log("\n--- TEST 6: Adding New Custom Carrier Without Modifying Core Engine ---");
    const customCarrier = await DatabaseStore.createShippingProvider({
      name: "BlueDart Express Direct",
      code: "bluedart_direct",
      apiBaseUrl: "https://api.bluedart.com/v1",
      credentials: { apiKey: "bd_test_key_101", apiSecret: "bd_sec_999" },
      settings: { pickupLocation: "North Mumbai Hub", flatRate: 58.0 },
      isEnabled: true,
      isDefault: false,
      pickupLocation: "North Mumbai Hub",
    });
    assert(customCarrier !== null, "Custom provider created dynamically in database");

    const testCustom = await ShippingService.testConnection(customCarrier.id);
    assert(testCustom.success === true, `Custom provider dynamically resolved adapter: ${testCustom.message}`);

    // TEST 7: Rate Comparison Across Enabled Providers
    console.log("\n--- TEST 7: Rate Comparison & Calculation Across Providers ---");
    const rateComparison = await ShippingService.compareAllRates(
      { pincode: "400050" },
      { pincode: "110001" },
      { weightKg: 1.5 }
    );
    assert(rateComparison.length >= 3, `Calculated and compared rates across ${rateComparison.length} enabled providers`);
    assert(rateComparison[0].rate <= rateComparison[rateComparison.length - 1].rate, "Rates returned in ascending cost order (best rate first)");

    // TEST 8: Order Dispatch, Validation & Duplicate Prevention
    console.log("\n--- TEST 8: Order Dispatch Integration, Validation & Duplicate Protection ---");
    const orders = await DatabaseStore.findOrders();
    assert(orders.length > 0, `Found ${orders.length} existing orders to test dispatch against`);

    // Pick an order
    const testOrder = orders[0];

    // Ensure order is marked as Paid for dispatch
    await DatabaseStore.updateOrder(testOrder.id, { paymentStatus: "Paid" });

    // Cancel any existing active shipments for clean test
    const oldShipments = await DatabaseStore.findShipments({ orderId: testOrder.id });
    for (const os of oldShipments) {
      await DatabaseStore.updateShipment(os.id, { shipmentStatus: "Cancelled" });
    }

    // Dispatch order with Delhivery
    const dispatchResult = await ShippingService.dispatchOrder({
      orderId: testOrder.id,
      shippingProviderId: delhivery.id,
      weightKg: 1.2,
    });

    assert(Boolean(dispatchResult.shipment), "Shipment successfully created");
    assert(Boolean(dispatchResult.shipment.awbNumber), `AWB number generated: ${dispatchResult.shipment.awbNumber}`);
    assert(Boolean(dispatchResult.shipment.trackingUrl), `Tracking URL created: ${dispatchResult.shipment.trackingUrl}`);
    assert(dispatchResult.shipment.shippingProviderCode === "delhivery", "Shipment linked to selected provider (Delhivery)");

    // Check order tracking updated
    const refreshedOrder = await DatabaseStore.findOrderById(testOrder.id);
    assert(refreshedOrder?.trackingNumber === dispatchResult.shipment.awbNumber, "Order record updated with AWB tracking number");
    assert(refreshedOrder?.orderStatus === "Shipped", "Order status transitioned to 'Shipped'");

    // Test Duplicate Dispatch Prevention
    let duplicatePrevented = false;
    try {
      await ShippingService.dispatchOrder({
        orderId: testOrder.id,
        shippingProviderId: shiprocket.id,
      });
    } catch (err) {
      duplicatePrevented = true;
      assert(true, `Duplicate shipment creation prevented: ${err.message}`);
    }
    if (!duplicatePrevented) {
      assert(false, "Duplicate dispatch was NOT prevented!");
    }

    // TEST 9: Live Tracking Checkpoints & Label Generation
    console.log("\n--- TEST 9: Live Tracking Milestones & Printable Label ---");
    const tracking = await ShippingService.getTracking(dispatchResult.shipment.id);
    assert(Boolean(tracking.awbNumber), `Live tracking resolved for AWB ${tracking.awbNumber}`);
    assert(Array.isArray(tracking.activities) && tracking.activities.length > 0, `Tracking returned ${tracking.activities.length} transit milestones`);

    const label = await ShippingService.getAdapter(delhivery.code).generateLabel(
      dispatchResult.shipment.providerShipmentId,
      dispatchResult.shipment.awbNumber,
      {},
      delhivery.settings
    );
    assert(Boolean(label.labelUrl), `Label URL generated: ${label.labelUrl}`);
    assert(Boolean(label.labelHtml), "Printable HTML label template generated successfully");

    // TEST 10: History Preserved when Provider Disabled / Deleted
    console.log("\n--- TEST 10: Shipment History Preservation upon Provider Deletion/Disabling ---");
    const deleteAttempt = await DatabaseStore.deleteShippingProvider(delhivery.id);
    assert(deleteAttempt.success === true, "Delete provider request processed safely");

    // Verify shipment still exists
    const preservedShipment = await DatabaseStore.findShipmentById(dispatchResult.shipment.id);
    assert(preservedShipment !== null, "Shipment record remains fully intact in database");
    assert(preservedShipment?.awbNumber === dispatchResult.shipment.awbNumber, "AWB number and historical data preserved");

    // Clean up custom carrier
    await DatabaseStore.deleteShippingProvider(customCarrier.id);

    // Re-enable Delhivery
    await DatabaseStore.updateShippingProvider(delhivery.id, { isEnabled: true });

    // TEST 11: Shipping Settings & Zones Persistence
    console.log("\n--- TEST 11: Shipping Settings and Zones Management ---");
    const settings = await DatabaseStore.getShippingSettings();
    assert(Boolean(settings.senderAddress?.city), `Warehouse origin city configured: ${settings.senderAddress?.city}`);

    const zones = await DatabaseStore.getShippingZones();
    assert(zones.length >= 4, `Configured ${zones.length} delivery pricing zones`);

    console.log(`\n=== FINAL VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED ===\n`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error("FATAL ERROR IN VERIFICATION:", err);
    process.exit(1);
  }
}

runTests();
