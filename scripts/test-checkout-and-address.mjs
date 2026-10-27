import crypto from "crypto";

const BASE_URL = "http://localhost:3001";

async function runAllTests() {
  console.log("======================================================================");
  console.log("   COMPREHENSIVE TEST SUITE: RAZORPAY, PAYTM, AND SAVED ADDRESSES   ");
  console.log("======================================================================\n");

  let testPassedCount = 0;
  let testFailedCount = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`  ❌ FAILED: ${message}`);
      testFailedCount++;
      throw new Error(`Assertion failed: ${message}`);
    } else {
      console.log(`  ✓ PASSED: ${message}`);
      testPassedCount++;
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Payment Gateways Endpoint & Security (No Secret Keys Exposed)
  // -------------------------------------------------------------
  console.log("\n--- TEST 1: Gateways API Security (Storefront activeOnly=true) ---");
  const gwRes = await fetch(`${BASE_URL}/api/gateways?activeOnly=true`);
  const gwJson = await gwRes.json();
  assert(gwRes.ok && gwJson.success, "Gateways API responds with success");
  assert(Array.isArray(gwJson.data) && gwJson.data.length > 0, "Returns active payment gateways");

  const rzpGw = gwJson.data.find((g) => g.code === "razorpay");
  const ptmGw = gwJson.data.find((g) => g.code === "paytm");

  assert(Boolean(rzpGw), "Razorpay gateway is present and active");
  assert(Boolean(ptmGw), "Paytm gateway is present and active");

  // Verify secret keys are NOT exposed
  assert(!rzpGw.credentials?.keySecret, "Razorpay keySecret is NOT exposed in frontend credentials");
  assert(Boolean(rzpGw.credentials?.keyId), "Razorpay public keyId is provided for Checkout SDK");
  assert(!ptmGw.credentials?.merchantKey, "Paytm merchantKey is NOT exposed in frontend credentials");
  assert(Boolean(ptmGw.credentials?.merchantId), "Paytm merchantId is safely provided");

  // -------------------------------------------------------------
  // TEST 2: Customer Registration & Auto-Created Default Addresses
  // -------------------------------------------------------------
  console.log("\n--- TEST 2: Customer Registration & Address Association ---");
  const timestamp = Date.now();
  const testCustomer = {
    name: "Vikram Malhotra",
    email: `vikram_${timestamp}@example.com`,
    password: "Password@123",
    confirmPassword: "Password@123",
    mobileNumber: "+91 9876543210",
    country: "India",
    countryCode: "IN",
    state: "Maharashtra",
    city: "Mumbai",
    postalCode: "400001",
    streetAddress: "Flat 502, Marine Vista, Marine Drive",
    apartment: "Opposite Sea Face",
    role: "CUSTOMER",
    accountType: "customer",
  };

  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testCustomer),
  });
  const regJson = await regRes.json();
  assert(regRes.ok && regJson.success, "Customer registered successfully");
  const registeredUser = regJson.data.user;

  // Extract auth cookie
  const cookieHeader = regRes.headers.get("set-cookie");
  const authHeaders = cookieHeader
    ? { "Content-Type": "application/json", Cookie: cookieHeader }
    : { "Content-Type": "application/json" };

  // Fetch customer profile & saved addresses
  const profRes = await fetch(`${BASE_URL}/api/customer/profile`, { headers: authHeaders });
  const profJson = await profRes.json();
  assert(profRes.ok && profJson.success, "Customer profile retrieved");
  assert(profJson.data.addresses?.length >= 2, "Default shipping and billing addresses auto-created on registration");

  const initialShipAddr = profJson.data.addresses.find((a) => a.type === "shipping");
  const initialBillAddr = profJson.data.addresses.find((a) => a.type === "billing");
  assert(Boolean(initialShipAddr), "Found initial shipping address");
  assert(Boolean(initialBillAddr), "Found initial billing address");
  assert(initialShipAddr.isDefault === true, "Initial shipping address is marked as default");

  // -------------------------------------------------------------
  // TEST 3: Add New Address & Manage Saved Addresses (No Duplicates)
  // -------------------------------------------------------------
  console.log("\n--- TEST 3: Add New Address via /api/addresses ---");
  const newAddressPayload = {
    name: "Vikram Malhotra (Office)",
    company: "Malhotra Enterprises",
    addressLine1: "Tower B, Level 12, Bandra Kurla Complex",
    addressLine2: "G Block, BKC",
    country: "India",
    countryCode: "IN",
    state: "Maharashtra",
    city: "Mumbai",
    postalCode: "400051",
    phone: "+91 9876543210",
    type: "shipping",
    isDefault: false,
  };

  const addAddrRes = await fetch(`${BASE_URL}/api/addresses`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(newAddressPayload),
  });
  const addAddrJson = await addAddrRes.json();
  assert(addAddrRes.ok && addAddrJson.success, "New address added successfully");
  const createdAddressId = addAddrJson.data.id;
  assert(Boolean(createdAddressId), `New address received ID: ${createdAddressId}`);

  // -------------------------------------------------------------
  // TEST 4: Edit Saved Address (In-Place Update, No Duplicates)
  // -------------------------------------------------------------
  console.log("\n--- TEST 4: Edit Saved Address via PATCH /api/addresses/[id] ---");
  const updateAddressPayload = {
    name: "Vikram Malhotra (Updated BKC Office)",
    addressLine1: "Tower B, Level 14 (Updated Floor), BKC",
    postalCode: "400051",
    phone: "+91 9988776655",
  };

  const editAddrRes = await fetch(`${BASE_URL}/api/addresses/${createdAddressId}`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify(updateAddressPayload),
  });
  const editAddrJson = await editAddrRes.json();
  assert(editAddrRes.ok && editAddrJson.success, "Address updated successfully");
  assert(editAddrJson.data.id === createdAddressId, "Address ID remained the same (in-place update, not duplicated)");
  assert(editAddrJson.data.name === "Vikram Malhotra (Updated BKC Office)", "Name field updated correctly");
  assert(editAddrJson.data.addressLine1.includes("Level 14"), "Street address updated correctly");

  // Verify total address count increased by only 1 (not duplicated)
  const verifyListRes = await fetch(`${BASE_URL}/api/addresses`, { headers: authHeaders });
  const verifyListJson = await verifyListRes.json();
  const userAddresses = verifyListJson.data.filter((a) => a.userId === registeredUser.id);
  assert(userAddresses.length === 3, "Customer has exactly 3 addresses (2 initial + 1 edited, no duplicate)");

  // -------------------------------------------------------------
  // TEST 5: Address Ownership Validation (Security)
  // -------------------------------------------------------------
  console.log("\n--- TEST 5: Address Ownership Security Validation ---");
  // Register another customer
  const attackerCustomer = {
    name: "Intruder User",
    email: `intruder_${timestamp}@example.com`,
    password: "Password@123",
    confirmPassword: "Password@123",
    mobileNumber: "+91 8888888888",
    country: "India",
    state: "Delhi",
    city: "New Delhi",
    postalCode: "110001",
    streetAddress: "Connaught Place",
    role: "CUSTOMER",
    accountType: "customer",
  };
  const attackerRegRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(attackerCustomer),
  });
  const attackerCookie = attackerRegRes.headers.get("set-cookie");
  const attackerAuthHeaders = { "Content-Type": "application/json", Cookie: attackerCookie };

  // Attempt to edit Vikram's address using Intruder's credentials
  const hackEditRes = await fetch(`${BASE_URL}/api/addresses/${createdAddressId}`, {
    method: "PATCH",
    headers: attackerAuthHeaders,
    body: JSON.stringify({ name: "Hacked Name" }),
  });
  assert(hackEditRes.status === 403, "Forbidden (403) returned when unauthorized user attempts to edit another customer's address");

  // Attempt to delete Vikram's address using Intruder's credentials
  const hackDelRes = await fetch(`${BASE_URL}/api/addresses/${createdAddressId}`, {
    method: "DELETE",
    headers: attackerAuthHeaders,
  });
  assert(hackDelRes.status === 400 || hackDelRes.status === 403, "Permission error returned when unauthorized user attempts to delete another customer's address");

  // -------------------------------------------------------------
  // TEST 6: Razorpay Sandbox Order Creation & Parameter Passing
  // -------------------------------------------------------------
  console.log("\n--- TEST 6: Razorpay Sandbox Order Creation (/api/payments/razorpay/order) ---");
  const rzpOrderNumber = "tags" + Math.floor(10000 + Math.random() * 90000);
  const rzpOrderPayload = {
    orderNumber: rzpOrderNumber,
    customerName: testCustomer.name,
    customerEmail: testCustomer.email,
    customerPhone: testCustomer.mobileNumber,
    customerId: registeredUser.id,
    subtotal: 999,
    shippingCost: 0,
    taxAmount: 179.82,
    totalPrice: 1178.82,
    shippingAddress: "Flat 502, Marine Vista, Marine Drive, Mumbai, Maharashtra 400001, India",
    billingAddress: "Flat 502, Marine Vista, Marine Drive, Mumbai, Maharashtra 400001, India",
    items: [
      {
        productId: "prod_1",
        name: "Test Smart ANC Headphones",
        price: 999,
        quantity: 1,
        sku: "SKU-TEST-01",
      },
    ],
  };

  const rzpInitRes = await fetch(`${BASE_URL}/api/payments/razorpay/order`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(rzpOrderPayload),
  });
  const rzpInitJson = await rzpInitRes.json();

  assert(rzpInitRes.ok && rzpInitJson.success, "Razorpay backend order creation succeeds with 200 OK");
  assert(Boolean(rzpInitJson.data?.orderId), `Received Razorpay Order ID: ${rzpInitJson.data?.orderId}`);
  assert(rzpInitJson.data?.orderId.startsWith("order_"), "Valid Razorpay order prefix 'order_' verified");
  assert(rzpInitJson.data?.currency === "INR", "Razorpay order currency is INR");
  assert(rzpInitJson.data?.amount === 117882, "Razorpay amount correctly converted to paise (1178.82 -> 117882)");
  assert(rzpInitJson.data?.keyId === "rzp_test_NLu5aZN42kk6pl", "Razorpay test Key ID passed correctly to frontend");

  // Verify order in database is saved as "Pending" (not marked as paid prematurely)
  const checkPendingOrderRes = await fetch(`${BASE_URL}/api/orders/${rzpOrderNumber}`);
  const checkPendingOrderJson = await checkPendingOrderRes.json();
  assert(checkPendingOrderJson.data?.paymentStatus === "Pending", "Order paymentStatus is properly set to 'Pending' before verification");
  assert(checkPendingOrderJson.data?.gatewayOrderId === rzpInitJson.data?.orderId, "Gateway order ID stored with order");

  // -------------------------------------------------------------
  // TEST 7: Razorpay Payment Verification (HMAC-SHA256 Signature)
  // -------------------------------------------------------------
  console.log("\n--- TEST 7: Razorpay Signature Verification (/api/payments/razorpay/verify) ---");
  const testRazorpayPaymentId = "pay_test_" + Date.now();
  const keySecret = "DE937YVS3AcBIQ16zjKi6qBX";

  // A. Test invalid / tampered signature rejection
  const invalidVerifyRes = await fetch(`${BASE_URL}/api/payments/razorpay/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderNumber: rzpOrderNumber,
      razorpay_order_id: rzpInitJson.data.orderId,
      razorpay_payment_id: testRazorpayPaymentId,
      razorpay_signature: "invalid_tampered_signature_hash_12345",
    }),
  });
  const invalidVerifyJson = await invalidVerifyRes.json();
  assert(!invalidVerifyRes.ok && !invalidVerifyJson.success, "Tampered payment signature correctly rejected by backend");

  // B. Test authentic HMAC-SHA256 signature verification
  const validSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${rzpInitJson.data.orderId}|${testRazorpayPaymentId}`)
    .digest("hex");

  const validVerifyRes = await fetch(`${BASE_URL}/api/payments/razorpay/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderNumber: rzpOrderNumber,
      razorpay_order_id: rzpInitJson.data.orderId,
      razorpay_payment_id: testRazorpayPaymentId,
      razorpay_signature: validSignature,
    }),
  });
  const validVerifyJson = await validVerifyRes.json();
  assert(validVerifyRes.ok && validVerifyJson.success, "Valid Razorpay payment verified successfully on backend");
  assert(validVerifyJson.data?.paymentStatus === "Paid", "Order marked as 'Paid' after successful signature verification");
  assert(validVerifyJson.data?.paymentTransactionId === testRazorpayPaymentId, "Payment transaction ID saved in database");
  assert(Boolean(validVerifyJson.data?.paidAt), "paidAt timestamp recorded");

  // -------------------------------------------------------------
  // TEST 8: Paytm Staging / Sandbox Checkout Initiation & Verification
  // -------------------------------------------------------------
  console.log("\n--- TEST 8: Paytm Staging Initiation (/api/payments/paytm/initiate) ---");
  const ptmOrderNumber = "tags" + Math.floor(10000 + Math.random() * 90000);
  const ptmOrderPayload = {
    orderNumber: ptmOrderNumber,
    customerName: testCustomer.name,
    customerEmail: testCustomer.email,
    customerPhone: testCustomer.mobileNumber,
    customerId: registeredUser.id,
    subtotal: 500,
    shippingCost: 49,
    taxAmount: 90,
    totalPrice: 639,
    shippingAddress: "Tower B, Level 14, BKC, Mumbai, Maharashtra 400051, India",
    billingAddress: "Tower B, Level 14, BKC, Mumbai, Maharashtra 400051, India",
    items: [
      {
        productId: "prod_2",
        name: "Wireless Ergonomic Mouse",
        price: 500,
        quantity: 1,
        sku: "SKU-TEST-02",
      },
    ],
  };

  const ptmInitRes = await fetch(`${BASE_URL}/api/payments/paytm/initiate`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(ptmOrderPayload),
  });
  const ptmInitJson = await ptmInitRes.json();

  assert(ptmInitRes.ok && ptmInitJson.success, "Paytm transaction initiated successfully");
  assert(Boolean(ptmInitJson.data?.txnToken), `Paytm txnToken generated: ${ptmInitJson.data?.txnToken}`);
  assert(Boolean(ptmInitJson.data?.mid), `Paytm Merchant ID provided: ${ptmInitJson.data?.mid}`);
  assert(ptmInitJson.data?.amount === "639.00", "Paytm order amount verified");
  assert(
    ptmInitJson.data?.mode === "checkoutjs" || ptmInitJson.data?.mode === "sandbox_modal",
    `Paytm checkout integration mode is '${ptmInitJson.data?.mode}'`
  );

  console.log("\n--- TEST 9: Paytm Transaction Verification (/api/payments/paytm/verify) ---");
  const ptmTxnId = "PTM_TXN_TEST_" + Date.now();
  const ptmVerifyRes = await fetch(`${BASE_URL}/api/payments/paytm/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderNumber: ptmOrderNumber,
      txnToken: ptmInitJson.data.txnToken,
      paytmTxnId: ptmTxnId,
      status: "TXN_SUCCESS",
    }),
  });
  const ptmVerifyJson = await ptmVerifyRes.json();
  assert(ptmVerifyRes.ok && ptmVerifyJson.success, "Paytm transaction verified successfully on backend");
  assert(ptmVerifyJson.data?.paymentStatus === "Paid", "Paytm order paymentStatus updated to 'Paid'");
  assert(ptmVerifyJson.data?.paymentTransactionId === ptmTxnId, "Paytm transaction ID stored with order");

  // -------------------------------------------------------------
  // TEST 10: Payment Cancellation & Failure Handling
  // -------------------------------------------------------------
  console.log("\n--- TEST 10: Payment Cancellation Flow (/api/payments/cancel) ---");
  const cancelOrderNumber = "tags" + Math.floor(10000 + Math.random() * 90000);
  // Create order
  await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      orderNumber: cancelOrderNumber,
      customerName: testCustomer.name,
      customerEmail: testCustomer.email,
      items: [{ name: "Item", price: 100, quantity: 1 }],
      totalPrice: 100,
      paymentStatus: "Pending",
      gateway: "Razorpay",
      gatewayCode: "razorpay",
    }),
  });

  const cancelRes = await fetch(`${BASE_URL}/api/payments/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderNumber: cancelOrderNumber,
      gateway: "Razorpay",
      reason: "User closed modal window",
    }),
  });
  const cancelJson = await cancelRes.json();
  assert(cancelRes.ok && cancelJson.success, "Payment cancellation registered successfully");
  assert(cancelJson.data?.paymentStatus === "Cancelled", "Order paymentStatus properly updated to 'Cancelled'");

  // -------------------------------------------------------------
  // TEST 11: Order Address Snapshot Preservation
  // -------------------------------------------------------------
  console.log("\n--- TEST 11: Historical Order Address Snapshot Retention ---");
  const receiptRes = await fetch(`${BASE_URL}/api/orders/${rzpOrderNumber}`);
  const receiptJson = await receiptRes.json();
  assert(receiptRes.ok && receiptJson.success, "Retrieved order receipt");
  assert(
    receiptJson.data?.shippingAddress.includes("Marine Vista"),
    "Historical order retained its original shipping address snapshot"
  );

  // -------------------------------------------------------------
  // TEST 12: Delete Saved Address
  // -------------------------------------------------------------
  console.log("\n--- TEST 12: Delete Saved Address via DELETE /api/addresses/[id] ---");
  const delRes = await fetch(`${BASE_URL}/api/addresses/${createdAddressId}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  const delJson = await delRes.json();
  assert(delRes.ok && delJson.success, "Saved address deleted successfully by owner");

  // Verify it is gone
  const afterDelRes = await fetch(`${BASE_URL}/api/addresses/${createdAddressId}`, {
    headers: authHeaders,
  });
  assert(afterDelRes.status === 404, "Deleted address no longer found (404)");

  console.log("\n======================================================================");
  console.log(`   ALL TESTS COMPLETED! Passed: ${testPassedCount}, Failed: ${testFailedCount}`);
  console.log("======================================================================\n");

  if (testFailedCount > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error("Test execution aborted with error:", err);
  process.exit(1);
});
