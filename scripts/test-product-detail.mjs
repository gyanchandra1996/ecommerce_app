const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3001";

async function testProductPages() {
  console.log("=================================================");
  console.log("Testing Product Detail Pages & Slug Resolution");
  console.log("=================================================");

  const slugsToTest = [
    "samsung-galaxy-s24-ultra-titanium",
    "nike-jordan-brooklyn-fleece-hoodie",
    "beanless-bag-inflatable-lounge-chair-grey",
    "diamond-stud-earrings-14k-white-gold",
    "nike-invincible-3-premium",
  ];

  let passed = 0;
  let failed = 0;

  for (const slug of slugsToTest) {
    // 1. Test API endpoint
    const apiRes = await fetch(`${BASE_URL}/api/products/${encodeURIComponent(slug)}`);
    const apiData = await apiRes.json();
    if (apiRes.status === 200 && apiData.success && apiData.data) {
      console.log(`✅ API /api/products/${slug}: Found "${apiData.data.name}"`);
      passed++;
    } else {
      console.error(`❌ API /api/products/${slug}: Failed (${apiRes.status})`);
      failed++;
    }

    // 2. Test Frontend SSR HTML Page
    const pageRes = await fetch(`${BASE_URL}/products/${encodeURIComponent(slug)}`);
    const pageHtml = await pageRes.text();
    if (pageRes.status === 200 && !pageHtml.includes("Product Not Found")) {
      console.log(`✅ Page /products/${slug}: 200 OK (Rendered successfully)`);
      passed++;
    } else {
      console.error(`❌ Page /products/${slug}: Failed (Status: ${pageRes.status})`);
      failed++;
    }
  }

  console.log("\n=================================================");
  console.log(`Results: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) process.exit(1);
}

testProductPages().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
