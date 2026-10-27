async function runTests() {
  console.log("=== Starting End-to-End Storefront & Requirements Verification ===");

  // 1. Customer Registration with all 10 Fields
  console.log("\n2. Testing Customer Registration with 10 Fields & Autofill:");
  const testCustomerEmail = `test_customer_${Date.now()}@example.com`;
  const registerPayload = {
    name: "Ahmad Al Mansoori",
    email: testCustomerEmail,
    mobileNumber: "+971 55 987 6543",
    countryCode: "AE",
    password: "Password@123",
    confirmPassword: "Password@123",
    country: "United Arab Emirates",
    state: "Dubai",
    city: "Dubai",
    postalCode: "12345",
    streetAddress: "Sheikh Zayed Road, Floor 14",
    apartment: "Penthouse 1402",
  };

  const regRes = await fetch("http://localhost:3001/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registerPayload),
  });

  const regJson = await regRes.json();
  if (!regRes.ok || !regJson.success) {
    throw new Error(`Registration failed: ${regJson.error || JSON.stringify(regJson)}`);
  }
  console.log(`  ✓ Registered customer: ${regJson.data.user.name} (${regJson.data.user.email})`);
  console.log(`  ✓ User Role assigned: ${regJson.data.user.role}`);

  // Extract auth cookie
  const cookieHeader = regRes.headers.get("set-cookie");
  const authHeaders = cookieHeader
    ? { "Content-Type": "application/json", Cookie: cookieHeader }
    : { "Content-Type": "application/json" };

  // 3. Customer Profile & Auto-Created Default Addresses
  console.log("\n3. Testing Customer Profile & Default Billing/Shipping Addresses:");
  const profRes = await fetch("http://localhost:3001/api/customer/profile", {
    headers: authHeaders,
  });
  const profJson = await profRes.json();
  console.log("Profile response:", profJson);
  if (!profRes.ok || !profJson.success) {
    throw new Error(`Profile fetch failed: ${profJson.error}`);
  }
  console.log(`  ✓ Retrieved customer profile for ${profJson.data.email}`);
  console.log(`  ✓ Saved Addresses count: ${profJson.data.addresses.length}`);
  for (const addr of profJson.data.addresses) {
    console.log(`    - [${addr.type.toUpperCase()}] ${addr.streetAddress}, ${addr.city}, ${addr.state} ${addr.postalCode} (Default: ${addr.isDefault})`);
  }

  // 4. Coupon Validation & Application
  console.log("\n4. Testing Coupon Engine Application & Calculations:");
  const couponRes = await fetch("http://localhost:3001/api/coupons/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: "WELCOME10",
      subtotal: 500,
      shippingCost: 15,
    }),
  });
  const couponJson = await couponRes.json();
  if (!couponRes.ok || !couponJson.success) {
    throw new Error(`Coupon apply failed: ${couponJson.error}`);
  }
  console.log(`  ✓ Applied Coupon: ${couponJson.data.coupon.code} (${couponJson.data.coupon.discountType})`);
  console.log(`  ✓ Subtotal: 500 AED -> Discount Amount: ${couponJson.data.discountAmount} AED`);
  console.log(`  ✓ Free Shipping Granted: ${couponJson.data.freeShipping}`);
  console.log(`  ✓ Final Calculated Subtotal: ${couponJson.data.finalTotal} AED`);

  // 5. Checkout & Order Placement with Multiple Gateway Selection
  console.log("\n5. Testing Checkout Order Placement with Razorpay/Gateway:");
  const orderNumber = "tags" + Math.floor(1000 + Math.random() * 9000);
  const orderPayload = {
    orderNumber,
    customerName: regJson.data.user.name,
    customerEmail: regJson.data.user.email,
    customerPhone: "+971 55 987 6543",
    customerId: regJson.data.user.id,
    gateway: "Razorpay",
    gatewayCode: "razorpay",
    paymentStatus: "Paid",
    orderStatus: "Processing",
    subtotal: 500,
    shippingCost: 0,
    taxAmount: 22.5,
    couponCode: "WELCOME10",
    couponDiscount: 50,
    totalPrice: 472.5,
    shippingAddress: "Sheikh Zayed Road, Floor 14, Penthouse 1402, Dubai, Dubai, United Arab Emirates",
    billingAddress: "Sheikh Zayed Road, Floor 14, Penthouse 1402, Dubai, Dubai, United Arab Emirates",
    shippingAddressDetail: {
      name: regJson.data.user.name,
      country: "United Arab Emirates",
      countryCode: "AE",
      state: "Dubai",
      city: "Dubai",
      postalCode: "12345",
      streetAddress: "Sheikh Zayed Road, Floor 14",
      apartment: "Penthouse 1402",
      phone: "+971 55 987 6543",
      type: "shipping",
    },
    billingAddressDetail: {
      name: regJson.data.user.name,
      country: "United Arab Emirates",
      countryCode: "AE",
      state: "Dubai",
      city: "Dubai",
      postalCode: "12345",
      streetAddress: "Sheikh Zayed Road, Floor 14",
      apartment: "Penthouse 1402",
      phone: "+971 55 987 6543",
      type: "billing",
    },
    items: [
      {
        productId: "prod_1",
        name: "Sony WH-1000XM5 Wireless Headphones",
        price: 500,
        quantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        itemNo: "SKU-SNY-01",
      },
    ],
    createdBy: regJson.data.user.name,
  };

  const orderRes = await fetch("http://localhost:3001/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderPayload),
  });

  const orderJson = await orderRes.json();
  if (!orderRes.ok || !orderJson.success) {
    throw new Error(`Order placement failed: ${orderJson.error}`);
  }
  console.log(`  ✓ Successfully placed order #${orderJson.data.orderNumber} (ID: ${orderJson.data.id})`);
  console.log(`  ✓ Gateway recorded: ${orderJson.data.gateway} (${orderJson.data.gatewayCode})`);
  console.log(`  ✓ Total Price: ${orderJson.data.totalPrice} AED`);
  console.log(`  ✓ Items Count: ${orderJson.data.items.length}`);

  // 6. Order Confirmation Receipt Lookup
  console.log("\n6. Testing Order Confirmation Receipt Lookup (/api/orders/[id]):");
  const receiptRes = await fetch(`http://localhost:3001/api/orders/${orderNumber}`);
  const receiptJson = await receiptRes.json();
  if (!receiptRes.ok || !receiptJson.success) {
    throw new Error(`Order lookup by orderNumber failed: ${receiptJson.error}`);
  }
  console.log(`  ✓ Retrieved Order Receipt for #${receiptJson.data.orderNumber}`);
  console.log(`  ✓ Delivery Address: ${receiptJson.data.shippingAddress}`);
  console.log(`  ✓ Payment Status: ${receiptJson.data.paymentStatus}`);

  // 7. Customer Dashboard Orders Filter
  console.log("\n7. Testing Customer Dashboard Orders Query:");
  const custOrdersRes = await fetch("http://localhost:3001/api/customer/orders", {
    headers: authHeaders,
  });
  const custOrdersJson = await custOrdersRes.json();
  if (!custOrdersRes.ok || !custOrdersJson.success) {
    throw new Error(`Customer orders query failed: ${custOrdersJson.error}`);
  }
  console.log(`  ✓ Customer Dashboard retrieved ${custOrdersJson.data.length} orders for customer`);
  console.log(`  ✓ Found order #${custOrdersJson.data[0].orderNumber} in customer history`);

  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
