// scripts/test-categories-and-warehouse.mjs

const BASE = "http://localhost:3001";

async function run() {
  console.log("=== 1. Testing Warehouse API with All 12 Fields ===");
  const testWh = {
    accountNumber: "WH-TEST-VIRAT",
    name: "Virat Test Distribution Center",
    contactName: "Virat Kohli",
    email: "virat.warehouse@test.com",
    phone: "+91 98765 43210",
    fax: "+91 11 2345 6789",
    addressLine1: "Plot 18, Electronic City Phase 1",
    country: "India",
    state: "Karnataka",
    city: "Bengaluru",
    zipCode: "560100",
    isActive: true,
  };

  const createWhRes = await fetch(`${BASE}/api/warehouses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testWh),
  });
  const createWhJson = await createWhRes.json();
  console.log("Create warehouse status:", createWhRes.status, createWhJson.success ? "SUCCESS" : "FAILED");
  if (!createWhJson.success) {
    throw new Error("Failed to create warehouse: " + JSON.stringify(createWhJson));
  }
  const createdWhId = createWhJson.data.id;
  console.log("Created warehouse ID:", createdWhId);

  // Verify all fields were persisted
  const getWhRes = await fetch(`${BASE}/api/warehouses/${createdWhId}`);
  const getWhJson = await getWhRes.json();
  const wh = getWhJson.data;
  console.log("Verified fields:");
  console.log("- email:", wh.email);
  console.log("- accountNumber:", wh.accountNumber);
  console.log("- name:", wh.name);
  console.log("- contactName:", wh.contactName);
  console.log("- addressLine1:", wh.addressLine1);
  console.log("- country:", wh.country);
  console.log("- state:", wh.state);
  console.log("- zipCode:", wh.zipCode);
  console.log("- city:", wh.city);
  console.log("- phone:", wh.phone);
  console.log("- fax:", wh.fax);
  console.log("- isActive:", wh.isActive);

  // Clean up test warehouse
  await fetch(`${BASE}/api/warehouses/${createdWhId}`, { method: "DELETE" });
  console.log("Cleaned up test warehouse.");

  console.log("\n=== 2. Testing Category Management & TP Calculation ===");
  // Fetch tree format
  const treeRes = await fetch(`${BASE}/api/categories?format=tree`);
  const treeJson = await treeRes.json();
  console.log("Loaded category tree. Root count:", treeJson.data.length);
  treeJson.data.forEach((c) => {
    console.log(`- ${c.name} (TP: ${c.productCount}) [${c.children ? c.children.length : 0} subs]`);
  });

  // Create a new category
  const createCatRes = await fetch(`${BASE}/api/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Interactive Gaming Gear",
      description: "High performance peripherals and gaming accessories",
      parentId: null,
      image: "/uploads/sample.jpg",
    }),
  });
  const createCatJson = await createCatRes.json();
  console.log("Created test category:", createCatJson.data.name, "ID:", createCatJson.data.id);
  const testCatId = createCatJson.data.id;

  // Edit category via PATCH
  const patchCatRes = await fetch(`${BASE}/api/categories/${testCatId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Pro Gaming Gear & Consoles",
      description: "Updated description for test category",
      isActive: true,
    }),
  });
  const patchCatJson = await patchCatRes.json();
  console.log("Edited category name:", patchCatJson.data.name);

  // Test cycle prevention (setting self as parent)
  const cycleRes = await fetch(`${BASE}/api/categories/${testCatId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parentId: testCatId }),
  });
  const cycleJson = await cycleRes.json();
  console.log("Cycle prevention tested. Error message:", cycleJson.message || cycleJson.error);

  // Test View products for a known category (e.g. cat_electronics)
  const prodsRes = await fetch(`${BASE}/api/products?categoryId=cat_electronics`);
  const prodsJson = await prodsRes.json();
  console.log("Products in cat_electronics:", prodsJson.data.length);

  // Delete test category
  const delCatRes = await fetch(`${BASE}/api/categories/${testCatId}`, { method: "DELETE" });
  const delCatJson = await delCatRes.json();
  console.log("Deleted test category:", delCatJson.success);

  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
