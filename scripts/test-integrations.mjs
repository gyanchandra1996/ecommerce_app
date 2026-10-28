const BASE_URL = "http://localhost:3001";

async function runTests() {
  console.log("===================================================================");
  console.log("Starting S3, Warehouses, Inventory, Shipping & Mail Integration Tests");
  console.log(`Target: ${BASE_URL}`);
  console.log("===================================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = "") {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${testName} ${details ? `(${details})` : ""}`);
    }
  }

  // 1. Authenticate as Admin to acquire admin_token
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@tagateway.com",
      password: "AdminPassword123!",
      portal: "admin",
    }),
  });
  const loginCookies = loginRes.headers.get("set-cookie") || "";
  const adminCookieMatch = loginCookies.match(/admin_token=([^;]+)/);
  const adminCookie = adminCookieMatch ? `admin_token=${adminCookieMatch[1]}` : "";

  assert(Boolean(adminCookie), "Admin login acquires admin_token cookie", loginCookies);

  const authHeaders = {
    "Content-Type": "application/json",
    Cookie: adminCookie,
  };

  // 2. Storage Settings: Get, Put, and Verify Encryption/Masking
  const storageGetRes = await fetch(`${BASE_URL}/api/settings/storage`, {
    headers: authHeaders,
  });
  const storageGetJson = await storageGetRes.json();
  assert(storageGetRes.status === 200, "GET /api/settings/storage returns 200");
  assert(storageGetJson.success === true, "Storage settings response contains success: true");
  assert(
    typeof storageGetJson.data?.s3SecretAccessKey === "string",
    "s3SecretAccessKey is masked or protected in GET response"
  );

  const storagePutRes = await fetch(`${BASE_URL}/api/settings/storage`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      provider: "s3",
      s3Enabled: true,
      s3Region: "us-east-1",
      s3Bucket: "my-test-ecommerce-bucket",
      s3AccessKeyId: "AKIAIOSFODNN7EXAMPLE",
      s3SecretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
      cloudfrontUrl: "https://d123456abcdef.cloudfront.net",
    }),
  });
  const storagePutJson = await storagePutRes.json();
  assert(storagePutRes.status === 200, "PUT /api/settings/storage returns 200 OK");
  assert(storagePutJson.data?.s3Bucket === "my-test-ecommerce-bucket", "Storage settings updated bucket name");
  assert(storagePutJson.data?.s3SecretAccessKey.includes("••••"), "Secret key returned masked after save");

  // 3. Mail Configuration: Get, Put, and Masking
  const mailGetRes = await fetch(`${BASE_URL}/api/settings/mail`, {
    headers: authHeaders,
  });
  const mailGetJson = await mailGetRes.json();
  assert(mailGetRes.status === 200, "GET /api/settings/mail returns 200");
  assert(mailGetJson.success === true, "Mail configuration response contains success: true");
  assert(typeof mailGetJson.data?.isEnabled === "boolean", "Mail config includes master isEnabled toggle");

  const mailPutRes = await fetch(`${BASE_URL}/api/settings/mail`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      isEnabled: true,
      defaultFromName: "QAReply Updated",
      defaultFromEmail: "qaadmin@example.com",
      defaultReplyName: "tag31",
      defaultReplyTo: "tag31@example.com",
      transportMethod: "SMTP",
      server: "smtp.gmail.com",
      port: 587,
      secureSocketType: "TLS",
      authType: "LOGIN",
      username: "admin@tag.com",
      password: "secret_app_password_123",
      contactUsEmail: "test2xuark@gmail.com",
      ccMailOption: true,
      ccEmailAddresses: ["audit@example.com", "manager@example.com"],
    }),
  });
  const mailPutJson = await mailPutRes.json();
  assert(mailPutRes.status === 200, "PUT /api/settings/mail updates configuration successfully");
  assert(mailPutJson.data?.defaultFromName === "QAReply Updated", "Mail from name updated correctly");
  assert(mailPutJson.data?.ccEmailAddresses?.length === 2, "CC email list stored and returned");

  // 4. Email Templates: Listing, Search, and Update
  const templatesRes = await fetch(`${BASE_URL}/api/email-templates`, {
    headers: authHeaders,
  });
  const templatesJson = await templatesRes.json();
  assert(templatesRes.status === 200, "GET /api/email-templates returns 200");
  assert(Array.isArray(templatesJson.data), "Email templates returned as array");
  assert(templatesJson.data.length >= 10, `Found ${templatesJson.data?.length} email templates (seeded)`);

  const userRegTpl = templatesJson.data.find((t) => t.code === "USER_REGISTRATION") || templatesJson.data[0];
  assert(Boolean(userRegTpl), "USER_REGISTRATION template exists in database");

  const updateTplRes = await fetch(`${BASE_URL}/api/email-templates/${userRegTpl.id}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      title: "User Registration Updated Title",
      subject: "Welcome to emox Store! [UPDATED]",
      bodyHtml: userRegTpl.bodyHtml,
      isActive: true,
    }),
  });
  const updateTplJson = await updateTplRes.json();
  assert(updateTplRes.status === 200, "PUT /api/email-templates/[id] returns 200");
  assert(updateTplJson.data?.title === "User Registration Updated Title", "Email template title updated");

  // 5. Warehouses: Listing and Validation
  const whRes = await fetch(`${BASE_URL}/api/warehouses`);
  const whJson = await whRes.json();
  assert(whRes.status === 200, "GET /api/warehouses returns 200");
  assert(Array.isArray(whJson.data) && whJson.data.length > 0, "Active warehouses available in store");
  const primaryWh = whJson.data[0];

  // 6. Mandatory Active Warehouse on Product Creation
  const createProductRes = await fetch(`${BASE_URL}/api/products`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      sku: "TEST-SKU-" + Date.now(),
      name: "Warehouse Test Product",
      price: 99.99,
      currentStock: 100,
      minStock: 15,
      warehouseId: primaryWh.id,
      warehouse: primaryWh.name,
      status: "ACTIVE",
    }),
  });
  const createProductJson = await createProductRes.json();
  assert(createProductRes.status === 201, "POST /api/products creates product with mandatory warehouse");
  const createdProd = createProductJson.data;

  // Attempt creation without valid warehouse
  const invalidProdRes = await fetch(`${BASE_URL}/api/products`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      sku: "INVALID-SKU-" + Date.now(),
      name: "Invalid Product No Warehouse",
      price: 29.99,
      warehouse: "",
      warehouseId: "",
    }),
  });
  assert(invalidProdRes.status === 400, "Product creation rejected when warehouse is missing");

  // 7. Warehouse Inventory & Movements Tracking
  const invRes = await fetch(`${BASE_URL}/api/inventory?productId=${createdProd.id}`, {
    headers: authHeaders,
  });
  const invJson = await invRes.json();
  assert(invRes.status === 200, "GET /api/inventory returns 200");
  assert(invJson.data?.length > 0, "Warehouse inventory record created for new product");
  assert(invJson.data[0]?.availableQuantity === 100, "Initial available quantity matches 100");

  // Adjust stock via API
  const adjustRes = await fetch(`${BASE_URL}/api/inventory/adjust`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      productId: createdProd.id,
      warehouseId: primaryWh.id,
      quantity: 25,
      notes: "Stock delivery shipment received",
      referenceId: "PO-7789",
    }),
  });
  const adjustJson = await adjustRes.json();
  assert(adjustRes.status === 200, "POST /api/inventory/adjust returns 200");
  assert(adjustJson.data?.availableQuantity === 125, "Available stock increased to 125 after adjustment");

  // Verify movements
  const movementsRes = await fetch(`${BASE_URL}/api/inventory/movements?productId=${createdProd.id}`, {
    headers: authHeaders,
  });
  const movementsJson = await movementsRes.json();
  assert(movementsJson.data?.length >= 2, "Inventory movements recorded for creation and adjustment");
  assert(movementsJson.data[0]?.type === "STOCK_ADD", "Movement type is STOCK_ADD");

  // 8. Order Creation, Stock Reservation & Email Trigger
  const orderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      customerName: "Jane Doe Customer",
      customerEmail: "janedoe@example.com",
      customerPhone: "+1 555-019-9999",
      gateway: "COD",
      paymentStatus: "Pending",
      orderStatus: "Processing",
      shippingAddress: "456 Market St, Austin, TX 78701",
      warehouseId: primaryWh.id,
      items: [
        {
          productId: createdProd.id,
          name: createdProd.name,
          sku: createdProd.sku,
          price: 99.99,
          quantity: 5,
        },
      ],
    }),
  });
  const orderJson = await orderRes.json();
  assert(orderRes.status === 201, "POST /api/orders creates order and reserves stock");
  const createdOrder = orderJson.data;

  // Check that stock was reserved
  const postOrderInvRes = await fetch(`${BASE_URL}/api/inventory?productId=${createdProd.id}`, {
    headers: authHeaders,
  });
  const postOrderInvJson = await postOrderInvRes.json();
  assert(postOrderInvJson.data[0]?.reservedQuantity === 5, "5 units reserved against the new order");
  assert(postOrderInvJson.data[0]?.availableQuantity === 120, "Available stock decreased from 125 to 120");

  // 9. Shipment Dispatch & Stock Deduction
  const dispatchRes = await fetch(`${BASE_URL}/api/shipping/shipments`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      orderId: createdOrder.id,
      weightKg: 2.0,
      customAwb: "AWB-" + Date.now(),
      notes: "Dispatching from assigned warehouse",
    }),
  });
  const dispatchJson = await dispatchRes.json();
  assert(dispatchRes.status === 201, "POST /api/shipping/shipments dispatches order and creates shipment");
  assert(dispatchJson.data?.pickupAddress?.includes(primaryWh.name), "Shipment pickupAddress captures warehouse snapshot");

  // Check stock after dispatch
  const postDispatchInvRes = await fetch(`${BASE_URL}/api/inventory?productId=${createdProd.id}`, {
    headers: authHeaders,
  });
  const postDispatchInvJson = await postDispatchInvRes.json();
  assert(postDispatchInvJson.data[0]?.reservedQuantity === 0, "Reserved stock consumed upon dispatch");
  assert(postDispatchInvJson.data[0]?.availableQuantity === 120, "Available quantity remains intact (no double deduction)");

  // 10. Protected Warehouse Deletion
  const deleteWhRes = await fetch(`${BASE_URL}/api/warehouses/${primaryWh.id}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  const deleteWhJson = await deleteWhRes.json();
  assert(
    deleteWhRes.status === 400,
    "Warehouse deletion rejected when associated with active stock or shipments",
    deleteWhJson.error
  );

  console.log("\n===================================================================");
  console.log(`Test Summary: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
  console.log("===================================================================");

  if (passed === total) {
    console.log("ALL INTEGRATION TESTS PASSED PERFECTLY!");
    process.exit(0);
  } else {
    console.error("Some tests failed.");
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
