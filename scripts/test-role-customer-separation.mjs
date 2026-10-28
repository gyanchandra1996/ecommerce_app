const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3001";

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

async function runTests() {
  console.log("===================================================================");
  console.log("Testing Customer/Admin Separation, Role Assignment & Seeders");
  console.log("===================================================================");

  // -------------------------------------------------------------
  // Test 1: Frontend Customer gyanchandranist@gmail.com
  // -------------------------------------------------------------
  console.log("\n[Test 1] Testing Customer: gyanchandranist@gmail.com");
  const custLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "gyanchandranist@gmail.com",
      password: "gyan@123",
      portal: "customer",
    }),
  });
  const custLoginData = await custLoginRes.json();
  assert(custLoginRes.status === 200, "Customer can log into storefront portal (200 OK)");
  assert(custLoginData.data?.user?.type === "customer", "Customer type is 'customer'");
  assert(custLoginData.data?.user?.role === "CUSTOMER", "Customer role is 'CUSTOMER'");

  const custAdminBlockRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "gyanchandranist@gmail.com",
      password: "gyan@123",
      portal: "admin",
    }),
  });
  assert(custAdminBlockRes.status === 403, "Customer blocked from Admin Portal (403 Forbidden)");

  // -------------------------------------------------------------
  // Test 2: Backend Admin gyan@gmail.com
  // -------------------------------------------------------------
  console.log("\n[Test 2] Testing Admin: gyan@gmail.com");
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "gyan@gmail.com",
      password: "gyan@123",
      portal: "admin",
    }),
  });
  const adminLoginData = await adminLoginRes.json();
  const adminCookie = adminLoginRes.headers.get("set-cookie") || "";
  assert(adminLoginRes.status === 200, "Admin can log into Admin Portal (200 OK)");
  assert(adminLoginData.data?.user?.type === "admin", "Admin type is 'admin'");
  assert(adminLoginData.data?.user?.role === "ADMIN", "Admin role is 'ADMIN'");

  const adminCustBlockRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "gyan@gmail.com",
      password: "gyan@123",
      portal: "customer",
    }),
  });
  assert(adminCustBlockRes.status === 403, "Pure admin blocked from Customer Storefront (403 Forbidden)");

  // -------------------------------------------------------------
  // Test 3: Dual Account gyanboth@gmail.com
  // -------------------------------------------------------------
  console.log("\n[Test 3] Testing Dual Account: gyanboth@gmail.com");
  const bothCustRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "gyanboth@gmail.com",
      password: "gyan@123",
      portal: "customer",
    }),
  });
  assert(bothCustRes.status === 200, "Dual account can log into Customer Storefront (200 OK)");

  const bothAdminRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "gyanboth@gmail.com",
      password: "gyan@123",
      portal: "admin",
    }),
  });
  assert(bothAdminRes.status === 200, "Dual account can log into Admin Portal (200 OK)");

  // -------------------------------------------------------------
  // Test 4: Default Admin Compatibility admin@tagateway.com
  // -------------------------------------------------------------
  console.log("\n[Test 4] Testing Default Admin: admin@tagateway.com");
  const defAdminRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@tagateway.com",
      password: "AdminPassword123!",
      portal: "admin",
    }),
  });
  assert(defAdminRes.status === 200, "Default test suite admin logs into Admin Portal (200 OK)");

  // -------------------------------------------------------------
  // Test 5: Backend Customer Creation with Role Enforcement
  // -------------------------------------------------------------
  console.log("\n[Test 5] Testing Backend Customer Creation");
  const testPlainCustEmail = `test.cust.${Date.now()}@example.com`;
  const createCustRes = await fetch(`${BASE_URL}/api/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      name: "Plain Customer Test",
      email: testPlainCustEmail,
      customerType: "Customer",
      roleId: "role_admin", // Attempt to assign role to plain customer
    }),
  });
  const createCustData = await createCustRes.json();
  assert(createCustRes.status === 201, "Created customer from admin API (201 Created)");
  assert(createCustData.data?.type === "customer", "Type is forced to 'customer'");
  assert(createCustData.data?.role === "CUSTOMER", "Role is forced to 'CUSTOMER'");
  assert(!createCustData.data?.roleId, "Role ID is cleared for Customer type");

  // Create an Admin user from backend customer management
  const testAdminCustEmail = `test.admin.${Date.now()}@example.com`;
  const createAdminRes = await fetch(`${BASE_URL}/api/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      name: "Staff Admin Test",
      email: testAdminCustEmail,
      customerType: "Admin",
      roleId: "role_store_manager",
    }),
  });
  const createAdminData = await createAdminRes.json();
  assert(createAdminRes.status === 201, "Created admin user from backend (201 Created)");
  assert(createAdminData.data?.type === "admin", "Type is 'admin'");
  assert(createAdminData.data?.role === "ADMIN", "Role is 'ADMIN'");
  assert(createAdminData.data?.roleId === "role_store_manager", "Assigned role is retained for Admin type");

  // -------------------------------------------------------------
  // Test 6: Public Storefront Registration Role Tampering Defense
  // -------------------------------------------------------------
  console.log("\n[Test 6] Testing Public Storefront Registration Tampering Defense");
  const testRegEmail = `tamper.${Date.now()}@example.com`;
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Tamper Attacker",
      email: testRegEmail,
      password: "Password123!",
      confirmPassword: "Password123!",
      role: "ADMIN",
      type: "admin",
      accountType: "admin",
    }),
  });
  const regData = await regRes.json();
  assert(regRes.status === 200 || regRes.status === 201, "Registration succeeds (200/201 OK)");
  assert(regData.data?.user?.type === "customer", "Registered user type forced to 'customer'");
  assert(regData.data?.user?.role === "CUSTOMER", "Registered user role forced to 'CUSTOMER'");

  const regAdminBlockRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testRegEmail,
      password: "Password123!",
      portal: "admin",
    }),
  });
  assert(regAdminBlockRes.status === 403, "Publicly registered user cannot log into admin portal (403 Forbidden)");

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n===================================================================");
  console.log(`Results: ${passed} PASSED, ${failed} FAILED`);
  console.log("===================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
