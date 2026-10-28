import fs from "fs";

const BASE_URL = "http://localhost:3001";

async function main() {
  console.log("===================================================================");
  console.log("Starting End-to-End HTTP API & Role Authorization Tests");
  console.log(`Target: ${BASE_URL}`);
  console.log("===================================================================");

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${testName}`);
    }
  }

  // 1. Test registration with malicious admin escalation payload
  const testEmail = `cust_${Date.now()}@example.com`;
  const regPayload = {
    name: "Test Customer One",
    email: testEmail,
    password: "Password123!",
    confirmPassword: "Password123!",
    role: "ADMIN", // Attacker trying to elevate role
    accountType: "admin",
    type: "admin",
  };

  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(regPayload),
  });

  const regJson = await regRes.json();
  const regCookies = regRes.headers.get("set-cookie") || "";

  assert(regRes.status === 201, "Registration returns 201 Created");
  assert(regJson.data?.user?.role === "CUSTOMER", "Registered user role is forced to 'CUSTOMER'");
  assert(regJson.data?.user?.type === "customer", "Registered user type is forced to 'customer'");
  assert(regCookies.includes("customer_token"), "Registration sets customer_token cookie");
  assert(!regCookies.includes("admin_token="), "Registration does NOT set admin_token cookie");

  // Extract customer token
  const customerTokenMatch = regCookies.match(/customer_token=([^;]+)/);
  const customerToken = customerTokenMatch ? customerTokenMatch[1] : "";
  const customerCookieHeader = `customer_token=${customerToken}`;

  // 2. Test: Customer cannot login through Admin Portal (403 Forbidden)
  const adminLoginAttempt = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "Password123!",
      portal: "admin",
    }),
  });

  const adminLoginJson = await adminLoginAttempt.json();
  assert(adminLoginAttempt.status === 403, "Customer account attempting admin login receives 403 Forbidden");
  assert(
    adminLoginJson.error?.includes("Access Denied") || adminLoginJson.message?.includes("Access Denied"),
    "403 error explicitly denies customer access to Administrator Console"
  );

  // 3. Test: Backend Authorization on Admin APIs when called by Customer
  const custOnCustApi = await fetch(`${BASE_URL}/api/customers`, {
    headers: { Cookie: customerCookieHeader },
  });
  assert(custOnCustApi.status === 403 || custOnCustApi.status === 401, "Customer cannot access /api/customers (returns 401/403)");

  const custOnAdminPayments = await fetch(`${BASE_URL}/api/admin/payments`, {
    headers: { Cookie: customerCookieHeader },
  });
  assert(custOnAdminPayments.status === 403 || custOnAdminPayments.status === 401, "Customer cannot access /api/admin/payments (returns 401/403)");

  const custOnAdminMe = await fetch(`${BASE_URL}/api/auth/me?portal=admin`, {
    headers: { Cookie: customerCookieHeader },
  });
  assert(custOnAdminMe.status === 401, "Customer checking admin session (/api/auth/me?portal=admin) returns 401 Unauthorized");

  // 4. Test: Customer accessing customer session (/api/auth/me?portal=customer)
  const custOnCustMe = await fetch(`${BASE_URL}/api/auth/me?portal=customer`, {
    headers: { Cookie: customerCookieHeader },
  });
  const custMeJson = await custOnCustMe.json();
  assert(custOnCustMe.status === 200, "Customer checking customer session returns 200 OK");
  assert(custMeJson.data?.user?.email === testEmail, "Customer session returns customer email address for header display");

  // 5. Test: Admin Login & Session
  // Let's find an existing admin or create one in the db
  const db = JSON.parse(fs.readFileSync("data/local-db.json", "utf8"));
  let adminRecord = (db.users || []).find((u) => u.email === "admin@tagateway.com");

  if (adminRecord) {
    console.log(`Using admin account: ${adminRecord.email}`);
    const adminPassword = "AdminPassword123!";

    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: adminRecord.email,
        password: adminPassword,
        portal: "admin",
      }),
    });

    const adminLoginJson = await adminLoginRes.json();
    const adminCookies = adminLoginRes.headers.get("set-cookie") || "";

    assert(adminLoginRes.status === 200, "Admin login returns 200 OK");
    assert(adminLoginJson.data?.user?.role === "ADMIN", "Admin user role is 'ADMIN'");
    assert(adminLoginJson.data?.user?.type === "admin", "Admin user type is 'admin'");
    assert(adminCookies.includes("admin_token"), "Admin login sets admin_token cookie");

    const adminTokenMatch = adminCookies.match(/admin_token=([^;]+)/);
    const adminToken = adminTokenMatch ? adminTokenMatch[1] : "";
    const adminCookieHeader = `admin_token=${adminToken}`;

    // 6. Test: Admin accessing protected admin endpoints
    const adminOnAdminMe = await fetch(`${BASE_URL}/api/auth/me?portal=admin`, {
      headers: { Cookie: adminCookieHeader },
    });
    const adminMeJson = await adminOnAdminMe.json();
    assert(adminOnAdminMe.status === 200, "Admin session check returns 200 OK");
    assert(adminMeJson.data?.user?.type === "admin", "Admin session check verifies type === 'admin'");

    const adminOnPayments = await fetch(`${BASE_URL}/api/admin/payments`, {
      headers: { Cookie: adminCookieHeader },
    });
    assert(adminOnPayments.status === 200, "Admin can successfully access /api/admin/payments");

    const adminOnCustomers = await fetch(`${BASE_URL}/api/customers`, {
      headers: { Cookie: adminCookieHeader },
    });
    assert(adminOnCustomers.status === 200, "Admin can successfully access /api/customers");

    // 7. Test: Independent Dual-Session (Coexistence of Customer & Admin)
    const dualCookieHeader = `admin_token=${adminToken}; customer_token=${customerToken}`;
    const dualCustomerCheck = await fetch(`${BASE_URL}/api/auth/me?portal=customer`, {
      headers: { Cookie: dualCookieHeader },
    });
    const dualCustomerJson = await dualCustomerCheck.json();
    assert(dualCustomerJson.data?.user?.email === testEmail, "Dual session: portal=customer returns customer user");

    const dualAdminCheck = await fetch(`${BASE_URL}/api/auth/me?portal=admin`, {
      headers: { Cookie: dualCookieHeader },
    });
    const dualAdminJson = await dualAdminCheck.json();
    assert(dualAdminJson.data?.user?.email === adminRecord.email, "Dual session: portal=admin returns admin user");

    // 8. Test: Customer Logout does not affect Admin Session
    const custLogoutRes = await fetch(`${BASE_URL}/api/auth/logout?portal=customer`, {
      method: "POST",
      headers: { Cookie: dualCookieHeader },
    });
    const custLogoutCookies = custLogoutRes.headers.get("set-cookie") || "";
    assert(custLogoutCookies.includes("customer_token=;"), "Customer logout clears customer_token cookie");
    assert(!custLogoutCookies.includes("admin_token=;"), "Customer logout preserves admin_token cookie");
  }

  // Cleanup test user
  const cleanDb = JSON.parse(fs.readFileSync("data/local-db.json", "utf8"));
  cleanDb.users = (cleanDb.users || []).filter((u) => u.email !== testEmail);
  fs.writeFileSync("data/local-db.json", JSON.stringify(cleanDb, null, 2), "utf8");

  console.log("===================================================================");
  console.log(`Results: ${passed}/${total} checks passed (${Math.round((passed / total) * 100)}%)`);
  console.log("===================================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
