// scripts/test-swagger-and-categories.mjs
import fs from "fs";

async function runTests() {
  const db = JSON.parse(fs.readFileSync("./data/local-db.json", "utf8"));
  console.log("=== DB Verification ===");
  console.log("Categories count:", db.categories.length);
  console.log("Menu items count:", db.menuItems.length);
  console.log("Menu category URLs:", db.menuItems.filter(m => !m.isHighlight).map(m => `${m.label} -> ${m.url}`));
  console.log("Products count:", db.products.length);
  console.log("Variants count in db.variants:", (db.variants || []).length);

  // Check SVG placeholders
  const svgProducts = db.products.filter(p => p.mainImage && p.mainImage.endsWith(".svg"));
  console.log("Products with .svg mainImage:", svgProducts.length);

  // Sample product variants
  const p1 = db.products[0];
  console.log("\nSample Product 1:", p1.name);
  console.log("Image:", p1.mainImage);
  console.log("hasVariants:", p1.hasVariants);
  console.log("variantAttributes:", JSON.stringify(p1.variantAttributes));
  console.log("variant count on product:", p1.variants ? p1.variants.length : 0);
  if (p1.variants && p1.variants.length > 0) {
    console.log("First variant:", p1.variants[0]);
  }

  const pFashion = db.products.find(p => p.categoryIds && p.categoryIds.includes("cat_fashion"));
  if (pFashion) {
    console.log("\nSample Fashion Product:", pFashion.name);
    console.log("Image:", pFashion.mainImage);
    console.log("variantAttributes:", JSON.stringify(pFashion.variantAttributes));
    console.log("First variant:", pFashion.variants ? pFashion.variants[0] : null);
  }

  // Check OpenAPI JSON route file exists
  console.log("\nOpenAPI spec route exists:", fs.existsSync("./src/app/api/openapi.json/route.ts"));
  console.log("Swagger UI page exists:", fs.existsSync("./src/app/docs/page.tsx"));
}

runTests();
