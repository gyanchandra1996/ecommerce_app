// Test all critical Web and Mobile APIs
const BASE_URL = "http://localhost:3000";

async function testEndpoint(name, method, path, body = null, headers = {}) {
  try {
    const opts = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };
    if (body) {
      opts.body = JSON.stringify(body);
    }
    const start = Date.now();
    const res = await fetch(`${BASE_URL}${path}`, opts);
    const duration = Date.now() - start;
    let data;
    try {
      data = await res.json();
    } catch {
      data = await res.text();
    }
    const isSuccess = res.status >= 200 && res.status < 300 && (data?.success !== false);
    console.log(`[${isSuccess ? "PASS" : "FAIL"}] ${name} (${method} ${path}) - Status: ${res.status} (${duration}ms)`);
    return { name, method, path, status: res.status, duration, isSuccess, data };
  } catch (err) {
    console.log(`[ERROR] ${name} (${method} ${path}) - ${err.message}`);
    return { name, method, path, status: 500, error: err.message, isSuccess: false };
  }
}

async function runAllTests() {
  console.log("=== STARTING FULL API VERIFICATION (WEB & MOBILE) ===");
  console.log(`Target: ${BASE_URL}\n`);

  const results = [];

  // 1. Products APIs
  results.push(await testEndpoint("Get All Products", "GET", "/api/products"));
  results.push(await testEndpoint("Get Limited Products", "GET", "/api/products?limit=5"));
  
  // 2. Categories
  results.push(await testEndpoint("Get All Categories", "GET", "/api/categories"));

  // 3. Sliders / Banners
  results.push(await testEndpoint("Get Sliders", "GET", "/api/sliders"));
  results.push(await testEndpoint("Get Main Sliders", "GET", "/api/sliders?position=main"));
  results.push(await testEndpoint("Get Triple Promo Banners", "GET", "/api/sliders?position=triple_promo"));

  // 4. Settings & Themes
  results.push(await testEndpoint("Get Store Settings", "GET", "/api/settings"));
  results.push(await testEndpoint("Get Active Theme", "GET", "/api/themes/active"));

  // 5. Cart APIs
  results.push(await testEndpoint("Get Cart", "GET", "/api/cart"));
  results.push(await testEndpoint("Add Item to Cart", "POST", "/api/cart", {
    productId: "prod_af1_1",
    quantity: 1,
  }));

  // 6. Razorpay Payment Gateway APIs (Mobile + Web checkout)
  const orderNumber = "tags" + Math.floor(1000 + Math.random() * 9000);
  const rzpRes = await testEndpoint("Create Razorpay Order", "POST", "/api/payments/razorpay/order", {
    orderNumber,
    customerName: "Mobile Test User",
    customerEmail: "user@eshop.com",
    customerPhone: "+91 98765 43210",
    totalPrice: 12499,
    items: [
      { productId: "prod_af1_1", name: "Air Max 270 React", price: 12499, quantity: 1 }
    ]
  });
  results.push(rzpRes);

  const rzpOrderId = rzpRes.data?.data?.orderId || "order_test_12345";
  results.push(await testEndpoint("Verify Razorpay Payment", "POST", "/api/payments/razorpay/verify", {
    orderNumber,
    razorpay_order_id: rzpOrderId,
    razorpay_payment_id: "pay_test_verified_99",
    razorpay_signature: "mobile_checkout_verified",
  }));

  // 6.b Razorpay Hosted Payment Link API
  results.push(await testEndpoint("Create Razorpay Payment Link", "POST", "/api/payments/razorpay/payment-link", {
    totalPrice: 161.10,
    customerName: "Gyan Tester",
    customerPhone: "+91 98765 43211",
  }));

  // 7. Orders APIs
  results.push(await testEndpoint("Create COD Order", "POST", "/api/orders", {
    orderNumber: "cod_" + Math.floor(1000 + Math.random() * 9000),
    customerName: "COD Customer",
    customerEmail: "customer@eshop.com",
    customerPhone: "+91 98765 43210",
    shippingAddress: "Street Golden 23/21, Mumbai 400001",
    gateway: "Cash on Delivery",
    gatewayCode: "cod",
    paymentMethod: "Cash on Delivery",
    totalPrice: 12499,
    items: [
      { productId: "prod_af1_1", name: "Air Max 270 React", price: 12499, quantity: 1 }
    ]
  }));
  results.push(await testEndpoint("Get Orders List", "GET", "/api/orders"));

  // 8. Reviews & Q&A
  results.push(await testEndpoint("Get Product Reviews", "GET", "/api/reviews?productId=prod_af1_1"));
  results.push(await testEndpoint("Get Product Q&A", "GET", "/api/qna?productId=prod_af1_1"));

  // 9. Shipping & Coupons
  results.push(await testEndpoint("Calculate Shipping Rate", "POST", "/api/shipping/calculate-rate", {
    destination: { pincode: "400001" },
    packageDetails: { weightKg: 1 },
  }));
  results.push(await testEndpoint("Apply Coupon", "POST", "/api/coupons/apply", {
    code: "WELCOME10",
    subtotal: 1000,
  }));

  // 10. Notification APIs (Deals, Offers & Alerts)
  results.push(await testEndpoint("Get Notifications List", "GET", "/api/notifications"));
  results.push(await testEndpoint("Create Deal Notification", "POST", "/api/notifications", {
    title: "🔥 Top Deal: 50% OFF Diwali Special",
    body: "Huge savings on flagship smartphones and sneakers.",
    category: "deal",
    badge: "50% OFF",
  }));
  results.push(await testEndpoint("Mark Notifications Read", "PATCH", "/api/notifications", {
    id: "ALL",
  }));

  console.log("\n=== TEST SUMMARY ===");
  const passed = results.filter(r => r.isSuccess).length;
  const failed = results.filter(r => !r.isSuccess).length;
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
}

runAllTests();
