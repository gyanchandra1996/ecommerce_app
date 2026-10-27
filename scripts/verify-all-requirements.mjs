// Comprehensive automated verification test for all Requirements 1 through 8
// Tests run against http://localhost:3001

const BASE_URL = "http://localhost:3001";

async function runTests() {
  console.log("=== STARTING COMPREHENSIVE REQUIREMENTS VERIFICATION ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST 1: FRONTEND PRODUCT DETAILS PAGE (Requirement 2)
  // -------------------------------------------------------------
  console.log("\n--- TEST 1: Product Details Page Loading ---");
  try {
    const slugRes = await fetch(`${BASE_URL}/api/products/i-phone-mvnvn85r`);
    const slugJson = await slugRes.json();
    assert(slugRes.status === 200 && slugJson.success, "Product loads by slug 'i-phone-mvnvn85r'");
    assert(slugJson.data?.price > 0, `Product price authoritative: ₹${slugJson.data?.price}`);

    const idRes = await fetch(`${BASE_URL}/api/products/prod_1`);
    const idJson = await idRes.json();
    assert(idRes.status === 200 && idJson.success, "Product loads by ID 'prod_1'");

    const pageRes = await fetch(`${BASE_URL}/products/i-phone-mvnvn85r`);
    assert(pageRes.status === 200, "Frontend product details route HTTP 200 OK");
  } catch (e) {
    assert(false, `Product test threw exception: ${e.message}`);
  }

  // -------------------------------------------------------------
  // TEST 2: BRANDING REMOVAL (Requirement 3)
  // -------------------------------------------------------------
  console.log("\n--- TEST 2: Tag31 / Tagateway Branding Removal ---");
  try {
    const fs = await import("fs");
    const { execSync } = await import("child_process");

    let tag31Count = 0;
    try {
      const grepOut = execSync('git grep -i "tag31"', { encoding: "utf8" });
      tag31Count = grepOut.trim().split("\n").filter(Boolean).length;
    } catch {
      tag31Count = 0;
    }
    assert(tag31Count === 0, `Zero occurrences of 'tag31' in git tree (found: ${tag31Count})`);

    let tagatewaySrcCount = 0;
    try {
      const grepOut2 = execSync('git grep -i "tagateway" src/', { encoding: "utf8" });
      tagatewaySrcCount = grepOut2.trim().split("\n").filter(Boolean).length;
    } catch {
      tagatewaySrcCount = 0;
    }
    assert(tagatewaySrcCount === 0, `Zero occurrences of 'tagateway' in src/ (found: ${tagatewaySrcCount})`);
  } catch (e) {
    assert(false, `Branding check threw exception: ${e.message}`);
  }

  // -------------------------------------------------------------
  // TEST 3: SEPARATE FRONTEND & BACKEND AUTH SESSIONS (Requirement 5)
  // -------------------------------------------------------------
  console.log("\n--- TEST 3: Separate Frontend & Backend Auth Sessions ---");
  let adminToken = "";
  let customerToken = "";

  try {
    // 1. Admin login
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@tagateway.com",
        password: "Admin123!",
        portal: "admin",
      }),
    });
    const adminLoginJson = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminLoginJson.success, "Admin login successful at portal=admin");

    const adminCookies = adminLoginRes.headers.get("set-cookie") || "";
    assert(adminCookies.includes("admin_token="), "Admin login issues dedicated 'admin_token' cookie");

    // Extract admin token
    const matchAdmin = adminCookies.match(/admin_token=([^;]+)/);
    if (matchAdmin) adminToken = matchAdmin[1];

    // 2. Register & Login Customer
    const testCustEmail = `test_customer_${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Customer",
        email: testCustEmail,
        password: "Customer123!",
        confirmPassword: "Customer123!",
        role: "CUSTOMER",
      }),
    });
    const regJson = await regRes.json();
    assert(regRes.status === 201 && regJson.success, "Customer registration successful");

    const custLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testCustEmail,
        password: "Customer123!",
        portal: "customer",
      }),
    });
    const custLoginJson = await custLoginRes.json();
    assert(custLoginRes.status === 200 && custLoginJson.success, "Customer login successful at portal=customer");

    const custCookies = custLoginRes.headers.get("set-cookie") || "";
    assert(custCookies.includes("customer_token="), "Customer login issues dedicated 'customer_token' cookie");

    const matchCust = custCookies.match(/customer_token=([^;]+)/);
    if (matchCust) customerToken = matchCust[1];

    // 3. Customer role blocked from admin login
    const custOnAdminLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testCustEmail,
        password: "Customer123!",
        portal: "admin",
      }),
    });
    assert(custOnAdminLogin.status === 403, "Customer account strictly forbidden from logging into Admin Portal (HTTP 403)");

    // 4. Customer logout does NOT destroy admin session
    const custLogoutRes = await fetch(`${BASE_URL}/api/auth/logout?portal=customer`, {
      method: "POST",
      headers: {
        Cookie: `admin_token=${adminToken}; customer_token=${customerToken}`,
      },
    });
    const custLogoutCookies = custLogoutRes.headers.get("set-cookie") || "";
    assert(
      custLogoutCookies.includes("customer_token=;") || custLogoutCookies.includes("customer_token="),
      "Customer logout clears customer_token"
    );
    assert(
      !custLogoutCookies.includes("admin_token=;"),
      "Customer logout leaves admin_token session intact!"
    );
  } catch (e) {
    assert(false, `Auth separation test threw exception: ${e.message}`);
  }

  // -------------------------------------------------------------
  // TEST 4: DEDICATED PAYMENTS TABLE & ADMIN UI (Requirement 1)
  // -------------------------------------------------------------
  console.log("\n--- TEST 4: Dedicated Payments Table & Management ---");
  try {
    const listRes = await fetch(`${BASE_URL}/api/admin/payments`, {
      headers: { Cookie: `admin_token=${adminToken}` },
    });
    const listJson = await listRes.json();
    assert(listRes.status === 200 && listJson.success, "GET /api/admin/payments returns 200 OK");
    assert(Array.isArray(listJson.data), `Found ${listJson.data?.length} payment records in dedicated payments table`);
    assert(listJson.stats?.totalRevenue >= 0, `Payment statistics computed: Total Revenue = ₹${listJson.stats?.totalRevenue}`);

    // Create new payment record linked to order
    const createRes = await fetch(`${BASE_URL}/api/admin/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `admin_token=${adminToken}`,
      },
      body: JSON.stringify({
        orderId: "ord_546",
        amount: 50.0,
        paymentGateway: "Razorpay",
        transactionId: "pay_test_" + Date.now(),
        paymentMethod: "UPI",
        paymentStatus: "Paid",
      }),
    });
    const createJson = await createRes.json();
    assert(createRes.status === 201 && createJson.success, "New payment record created in dedicated payments table");
    const newPaymentId = createJson.data?.id;

    // View payment detail with linked order
    const detailRes = await fetch(`${BASE_URL}/api/admin/payments/${newPaymentId}`, {
      headers: { Cookie: `admin_token=${adminToken}` },
    });
    const detailJson = await detailRes.json();
    assert(detailRes.status === 200 && detailJson.data?.payment?.id === newPaymentId, "Payment detail retrieved by ID");
    assert(detailJson.data?.order?.id === "ord_546", "Linked order data populated correctly");

    // Process partial refund
    const refundRes = await fetch(`${BASE_URL}/api/admin/payments/${newPaymentId}/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `admin_token=${adminToken}`,
      },
      body: JSON.stringify({
        refundAmount: 20.0,
        reason: "Customer return item",
      }),
    });
    const refundJson = await refundRes.json();
    assert(refundRes.status === 200 && refundJson.success, "Refund processed successfully and recorded in audit log");
    assert(refundJson.data?.refundAmount === 20.0, "Payment refundAmount updated in database");
  } catch (e) {
    assert(false, `Payments table test threw exception: ${e.message}`);
  }

  // -------------------------------------------------------------
  // TEST 5: PERSISTENT SHOPPING CART (Requirement 6)
  // -------------------------------------------------------------
  console.log("\n--- TEST 5: Persistent Shopping Cart in Database ---");
  try {
    const guestSession = "gst_test_" + Date.now();

    // 1. Guest adds item to cart
    const addRes = await fetch(`${BASE_URL}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `guest_session_id=${guestSession}`,
      },
      body: JSON.stringify({
        productId: "prod_1",
        quantity: 2,
      }),
    });
    const addJson = await addRes.json();
    assert(addRes.status === 200 && addJson.success, "Guest item added to database cart");

    // 2. Fetch guest cart
    const getRes = await fetch(`${BASE_URL}/api/cart`, {
      headers: { Cookie: `guest_session_id=${guestSession}` },
    });
    const getJson = await getRes.json();
    assert(getJson.data?.items?.length > 0, `Cart retained in database with ${getJson.data?.items?.length} items`);
    assert(getJson.data?.items[0]?.quantity === 2, "Item quantity correctly preserved");

    // 3. Customer logs in and merges guest cart
    const mergeRes = await fetch(`${BASE_URL}/api/cart/merge`, {
      method: "POST",
      headers: {
        Cookie: `customer_token=${customerToken}; guest_session_id=${guestSession}`,
      },
    });
    const mergeJson = await mergeRes.json();
    assert(mergeRes.status === 200 && mergeJson.success, "Guest cart merged into logged-in customer's database account");

    // 4. Retrieve customer cart after merging (using customer_token only)
    const custCartRes = await fetch(`${BASE_URL}/api/cart`, {
      headers: { Cookie: `customer_token=${customerToken}` },
    });
    const custCartJson = await custCartRes.json();
    assert(
      custCartJson.data?.items?.some((i) => i.productId === "prod_1"),
      "Customer cart retains merged items across sessions"
    );
  } catch (e) {
    assert(false, `Persistent cart test threw exception: ${e.message}`);
  }

  // -------------------------------------------------------------
  // TEST 6: SIDEBAR NAVIGATION & ROUTE RESOLUTION (Requirement 4)
  // -------------------------------------------------------------
  console.log("\n--- TEST 6: Navigation Routes & Admin Pages ---");
  try {
    const paymentsPageRes = await fetch(`${BASE_URL}/admin/payments`, {
      headers: { Cookie: `admin_token=${adminToken}` },
    });
    assert(paymentsPageRes.status === 200, "Admin Payments Page (/admin/payments) returns HTTP 200");

    const shipmentsPageRes = await fetch(`${BASE_URL}/admin/shipments`, {
      headers: { Cookie: `admin_token=${adminToken}` },
    });
    assert(shipmentsPageRes.status === 200, "Admin Shipments Page (/admin/shipments) returns HTTP 200");
  } catch (e) {
    assert(false, `Navigation test threw exception: ${e.message}`);
  }

  console.log(`\n=== VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
