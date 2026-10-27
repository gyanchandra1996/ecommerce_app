import { DatabaseStore } from "../src/core/db/store";
import { lookupPostalCode, validatePostalCode } from "../src/core/utils/postal-autofill";
import { MODULE_HIERARCHY } from "../src/modules/roles/types/role.types";

async function runVerification() {
  console.log("=== Starting Customer Management & Role Permissions Verification ===");

  // Test 1: Indian Postal Autofill Engine
  console.log("\n[Test 1] Testing Indian PIN Code Validation and Autofill...");
  const pin1 = lookupPostalCode("IN", "400001");
  console.log("PIN 400001 lookup:", pin1);
  if (!pin1.success || pin1.city !== "Mumbai" || pin1.state !== "Maharashtra") {
    throw new Error("PIN 400001 lookup failed!");
  }

  const pin2 = lookupPostalCode("IN", "110001");
  console.log("PIN 110001 lookup:", pin2);
  if (!pin2.success || pin2.city !== "New Delhi" || pin2.state !== "Delhi") {
    throw new Error("PIN 110001 lookup failed!");
  }

  const pin3 = lookupPostalCode("IN", "560001");
  console.log("PIN 560001 lookup:", pin3);
  if (!pin3.success || pin3.city !== "Bengaluru" || pin3.state !== "Karnataka") {
    throw new Error("PIN 560001 lookup failed!");
  }

  const valRes = validatePostalCode("IN", "400001");
  console.log("PIN 400001 validation:", valRes);
  if (!valRes.valid) throw new Error("PIN 400001 validation should be valid!");

  const valInvalid = validatePostalCode("IN", "99999"); // 5 digits
  console.log("PIN 99999 validation (should be invalid):", valInvalid);
  if (valInvalid.valid) throw new Error("PIN 99999 should be invalid!");

  // Test 2: Customer Creation with Addresses Table Persistence
  console.log("\n[Test 2] Testing Customer Creation with Billing & Shipping Addresses in Addresses Table...");
  const testEmail = `test_customer_${Date.now()}@example.in`;
  const createdCustomer = await DatabaseStore.createCustomer({
    name: "Arjun Mehta",
    firstName: "Arjun",
    lastName: "Mehta",
    email: testEmail,
    mobileNumber: "+91 98200 12345",
    country: "India",
    countryCode: "IN",
    state: "Maharashtra",
    city: "Mumbai",
    postalCode: "400001",
    streetAddress: "Flat 402, Sea Green Apartments, Colaba",
    apartment: "Opposite Taj Hotel",
    accountType: "customer",
    customerType: "VIP",
    credit: 500,
    status: "ACTIVE",
    shippingAddressDetail: {
      name: "Arjun Mehta",
      addressLine1: "Flat 402, Sea Green Apartments, Colaba",
      addressLine2: "Opposite Taj Hotel",
      country: "India",
      state: "Maharashtra",
      city: "Mumbai",
      postalCode: "400001",
      phone: "+91 98200 12345",
      type: "shipping",
      isDefault: true,
    },
    billingAddressDetail: {
      name: "Arjun Mehta (Billing)",
      addressLine1: "Mehta Enterprises, Nariman Point",
      addressLine2: "12th Floor, Maker Chambers",
      country: "India",
      state: "Maharashtra",
      city: "Mumbai",
      postalCode: "400021",
      phone: "+91 98200 12345",
      type: "billing",
      isDefault: true,
    },
  });

  console.log("Created Customer:", {
    id: createdCustomer.id,
    name: createdCustomer.name,
    email: createdCustomer.email,
    mobileNumber: createdCustomer.mobileNumber,
    credit: createdCustomer.credit,
    status: createdCustomer.status,
  });

  // Verify Addresses in db.addresses
  const savedAddresses = await DatabaseStore.findAddresses({ userId: createdCustomer.id });
  console.log("Saved Addresses Count in db.addresses:", savedAddresses.length);
  const shipping = savedAddresses.find((a) => a.type === "shipping");
  const billing = savedAddresses.find((a) => a.type === "billing");

  if (!shipping || shipping.postalCode !== "400001" || shipping.city !== "Mumbai") {
    throw new Error("Shipping address was not persisted properly in addresses table!");
  }
  if (!billing || billing.postalCode !== "400021") {
    throw new Error("Billing address was not persisted properly in addresses table!");
  }
  console.log("Addresses successfully verified in dedicated database table!");

  // Test 3: Customer Lookup and Search
  console.log("\n[Test 3] Testing Customer Directory Lookup & Filtering...");
  const customerById = await DatabaseStore.findCustomerById(createdCustomer.id);
  console.log("Customer fetched by ID with attached addresses:", {
    id: customerById?.id,
    email: customerById?.email,
    addressesCount: customerById?.addresses?.length,
    ordersCount: customerById?.ordersCount,
  });
  if (!customerById || (customerById.addresses?.length || 0) < 2) {
    throw new Error("Customer lookup by ID failed to attach addresses!");
  }

  // Search by name and mobile
  const searchByName = await DatabaseStore.findCustomers({ search: "Arjun" });
  console.log("Search by 'Arjun' result count:", searchByName.length);
  if (!searchByName.some((c) => c.email === testEmail)) {
    throw new Error("Search by name failed!");
  }

  const searchByMobile = await DatabaseStore.findCustomers({ search: "98200" });
  console.log("Search by mobile '98200' result count:", searchByMobile.length);
  if (!searchByMobile.some((c) => c.email === testEmail)) {
    throw new Error("Search by mobile number failed!");
  }

  // Test 4: Customer Status Toggle & Customer Role Assignment
  console.log("\n[Test 4] Testing Customer Status Toggle & Customer Role Assignment...");
  const updatedCustomer = await DatabaseStore.updateCustomer(createdCustomer.id, {
    status: "INACTIVE",
  });
  console.log("Updated Customer Status:", updatedCustomer?.status);
  if (updatedCustomer?.status !== "INACTIVE") throw new Error("Status update to INACTIVE failed!");

  // Assign Customer Role
  const roleUpdate = await DatabaseStore.updateEmployeeRoles(createdCustomer.id, ["Catalog Manager", "VIP Customer"]);
  console.log("Assigned Customer Roles:", roleUpdate?.assignedRoles);
  if (!roleUpdate?.assignedRoles?.includes("VIP Customer")) {
    throw new Error("Customer role assignment failed!");
  }

  const roleCustomers = await DatabaseStore.findRoleEmployees();
  console.log("Role Customers Directory Stats:", roleCustomers.stats);
  const foundInRoleDirectory = roleCustomers.employees.find((e) => e.email === testEmail);
  if (!foundInRoleDirectory) {
    throw new Error("Customer not found in Customer Role Assignment directory!");
  }
  console.log("Customer found in Role Assignment directory with assigned roles:", foundInRoleDirectory.assignedRoles);

  // Test 5: Verify Sidebar Navigation Permissions Structure
  console.log("\n[Test 5] Testing Sidebar Navigation Permissions Structure...");
  console.log("MODULE_HIERARCHY Module Count:", MODULE_HIERARCHY.length);
  const moduleIds = MODULE_HIERARCHY.map((m) => m.id);
  console.log("Module IDs in Hierarchy:", moduleIds);

  const expectedSidebarModules = [
    "dashboard",
    "assets",
    "customers",
    "accessMgmt",
    "manufacturers",
    "products",
    "inventory",
    "pricing",
    "orders",
    "marketing",
    "themes",
    "gateways",
    "settings",
  ];

  for (const exp of expectedSidebarModules) {
    if (!moduleIds.includes(exp)) {
      throw new Error(`Expected sidebar module '${exp}' is missing from MODULE_HIERARCHY!`);
    }
  }

  const allScreens = MODULE_HIERARCHY.flatMap((m) => m.subModules.flatMap((s) => s.screens));
  console.log("Total Sidebar Screens/Pages configured for granular permissions:", allScreens.length);
  const productsScreen = allScreens.find((s) => s.name === "Manage Products");
  console.log("Products Screen Actions:", productsScreen?.actions);
  if (!productsScreen?.actions.includes("create") || !productsScreen?.actions.includes("delete")) {
    throw new Error("Products screen missing standard CRUD actions!");
  }

  const customersScreen = allScreens.find((s) => s.name === "Manage Customers");
  console.log("Customers Screen Actions:", customersScreen?.actions);
  if (!customersScreen?.actions.includes("approve") || !customersScreen?.actions.includes("export")) {
    throw new Error("Customers screen missing approve or export actions!");
  }

  console.log("\n=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ===");
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
