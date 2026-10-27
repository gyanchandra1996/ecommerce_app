// scripts/test-e2e.mjs
const BASE_URL = 'http://localhost:3001';

async function runTests() {
  console.log('--- STARTING ACCEPTANCE CRITERIA VERIFICATION ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message, extra) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`, extra ? JSON.stringify(extra) : '');
      failed++;
    }
  }

  // 1. Test Category Tree & Dropdown Data
  console.log('\n--- 1. Testing Category Hierarchy & Dropdown ---');
  const catTreeRes = await fetch(`${BASE_URL}/api/categories?format=tree`);
  const catTreeData = await catTreeRes.json();
  assert(catTreeRes.status === 200 && catTreeData.success, 'Categories API tree format returns 200 OK');
  
  const electronics = catTreeData.data.find(c => c.slug === 'electronics');
  assert(electronics !== undefined, 'Electronics parent category exists');
  const subcats = electronics?.children || electronics?.subcategories || [];
  const smartphones = subcats.find(c => c.name.toLowerCase().includes('smartphone') || c.slug.includes('smartphone'));
  assert(smartphones !== undefined, `Smartphone subcategory is nested under Electronics (found: ${smartphones?.name}, slug: ${smartphones?.slug})`);
  assert(Number(electronics?.productCount) > 0, `Electronics category has dynamic product count (${electronics?.productCount})`);

  // 2. Test Display Products by Selected Category
  console.log('\n--- 2. Testing Products by Category & Filtering ---');
  // 2a. Parent category products (includes subcategory products)
  const elecProdRes = await fetch(`${BASE_URL}/api/products?category=electronics`);
  const elecProdData = await elecProdRes.json();
  assert(elecProdRes.status === 200 && elecProdData.data.length > 0, `Electronics products fetched (${elecProdData.data.length} products)`);

  // 2b. Subcategory products
  const phoneProdRes = await fetch(`${BASE_URL}/api/products?category=${smartphones?.slug || 'smartphone-mvnih0uu'}`);
  const phoneProdData = await phoneProdRes.json();
  assert(phoneProdRes.status === 200 && phoneProdData.data.length > 0, `Smartphone products fetched (${phoneProdData.data.length} products)`);

  // 2c. Non-existent category returns 404
  const invalidCatRes = await fetch(`${BASE_URL}/api/categories/non-existent-category-slug-xyz`);
  assert(invalidCatRes.status === 404, 'Invalid category URL returns 404 status');

  // 3. Test Full Product Details Page API
  console.log('\n--- 3. Testing Full Product Details Page ---');
  const phoneSlug = 'samsung-galaxy-s24-ultra-titanium';
  const phoneRes = await fetch(`${BASE_URL}/api/products/${phoneSlug}`);
  const phoneData = await phoneRes.json();
  assert(phoneRes.status === 200 && phoneData.data, 'Product details fetched successfully by slug');
  assert(phoneData.data.hasVariants === true, 'Product hasVariants flag is true');
  assert(Array.isArray(phoneData.data.variants) && phoneData.data.variants.length > 0, `Product has ${phoneData.data.variants.length} active variants`);
  assert(Array.isArray(phoneData.data.variantAttributes) && phoneData.data.variantAttributes.length > 0, 'Product has variantAttributes options defined');

  // 4. Test Variant Details & Combinations
  console.log('\n--- 4. Testing Variant Combination Attributes ---');
  const sampleVariant = phoneData.data.variants[0];
  assert(sampleVariant.sku && sampleVariant.price > 0, `Variant has unique SKU (${sampleVariant.sku}) and valid price (${sampleVariant.price})`);
  assert(sampleVariant.attributes && Object.keys(sampleVariant.attributes).length > 0, `Variant has attributes (${JSON.stringify(sampleVariant.attributes)})`);
  assert(sampleVariant.currentStock >= 0, `Variant has stock tracking (${sampleVariant.currentStock} units)`);

  // 5. Test Product Without Variants
  console.log('\n--- 5. Testing Product Without Variants ---');
  const allProdsRes = await fetch(`${BASE_URL}/api/products`);
  const allProdsData = await allProdsRes.json();
  const simpleProd = allProdsData.data.find(p => !p.hasVariants || !p.variants || p.variants.length === 0);
  assert(simpleProd !== undefined, `Found simple product without variants: "${simpleProd?.name}"`);
  assert(simpleProd?.currentStock > 0, `Simple product has stock: ${simpleProd?.currentStock}`);

  // 6. Test Admin Variant Management: Create and Update with Variants
  console.log('\n--- 6. Testing Admin Variant Management ---');
  const testProdSku = 'TEST-VAR-PROD-' + Date.now();
  const createProdRes = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Variant Product ' + Date.now(),
      sku: testProdSku,
      price: 99.99,
      currentStock: 50,
      categoryIds: ['cat_electronics'],
      hasVariants: true,
      variantAttributes: [
        { name: 'Color', values: ['Red', 'Green'] },
        { name: 'Size', values: ['S', 'M'] }
      ],
      variants: [
        { sku: `${testProdSku}-RED-S`, price: 99.99, currentStock: 20, isActive: true, attributes: { Color: 'Red', Size: 'S' } },
        { sku: `${testProdSku}-RED-M`, price: 109.99, currentStock: 15, isActive: true, attributes: { Color: 'Red', Size: 'M' } },
        { sku: `${testProdSku}-GRN-S`, price: 99.99, currentStock: 10, isActive: true, attributes: { Color: 'Green', Size: 'S' } },
        { sku: `${testProdSku}-GRN-M`, price: 109.99, currentStock: 5, isActive: true, attributes: { Color: 'Green', Size: 'M' } }
      ]
    })
  });
  const createProdData = await createProdRes.json();
  assert(createProdRes.status === 200 || createProdRes.status === 201, 'Admin created product with variants');
  const createdProdId = createProdData.data?.id;
  assert(createdProdId !== undefined, `Created product ID: ${createdProdId}`);

  // Verify created variants in product details
  const fetchCreatedRes = await fetch(`${BASE_URL}/api/products/${createdProdId}`);
  const fetchCreatedData = await fetchCreatedRes.json();
  assert(fetchCreatedData.data?.variants?.length === 4, 'Created product contains 4 variants');

  // 7. Test Cart & Order Placement with Variant Stock Deduction
  console.log('\n--- 7. Testing Order Placement & Inventory Deduction ---');
  const targetVariant = fetchCreatedData.data.variants[0]; // Stock is 20
  const initialStock = targetVariant.currentStock;
  const orderQty = 3;

  const orderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderNumber: 'TEST-ORD-' + Date.now(),
      customerName: 'Test Customer',
      customerEmail: 'test.customer@example.com',
      customerPhone: '+91 9876543210',
      gateway: 'Cash on Delivery',
      gatewayCode: 'cod',
      paymentStatus: 'Pending',
      orderStatus: 'Processing',
      shippingAddress: '123 Test Street, Mumbai, Maharashtra, 400001, India',
      items: [
        {
          productId: createdProdId,
          variantId: targetVariant.id,
          variantAttributes: targetVariant.attributes,
          name: fetchCreatedData.data.name,
          sku: targetVariant.sku,
          price: targetVariant.price,
          quantity: orderQty
        }
      ]
    })
  });
  const orderData = await orderRes.json();
  assert((orderRes.status === 200 || orderRes.status === 201) && orderData.success, 'Order with variant placed successfully', orderData);

  // Verify variant stock was deducted by exactly orderQty
  const verifyProdRes = await fetch(`${BASE_URL}/api/products/${createdProdId}`);
  const verifyProdData = await verifyProdRes.json();
  const updatedVariant = verifyProdData.data.variants.find(v => v.id === targetVariant.id);
  assert(updatedVariant.currentStock === initialStock - orderQty, `Variant stock correctly decremented from ${initialStock} to ${updatedVariant.currentStock}`);

  // 8. Test Stock Protection: Rejecting Over-Stock Orders
  console.log('\n--- 8. Testing Out-of-Stock / Insufficient Stock Protection ---');
  const overStockOrderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Greedy Buyer',
      items: [
        {
          productId: createdProdId,
          variantId: targetVariant.id,
          name: fetchCreatedData.data.name,
          price: targetVariant.price,
          quantity: 99999 // Exceeds available stock
        }
      ]
    })
  });
  const overStockData = await overStockOrderRes.json();
  assert(overStockOrderRes.status === 500 && overStockData.error.includes('Insufficient stock'), 'Order exceeding available variant stock is rejected with error');

  // Cleanup test product
  await fetch(`${BASE_URL}/api/products/${createdProdId}`, { method: 'DELETE' });
  console.log(`[CLEANUP] Deleted test product ${createdProdId}`);

  console.log(`\n========================================`);
  console.log(`TOTAL PASSED: ${passed} | TOTAL FAILED: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
