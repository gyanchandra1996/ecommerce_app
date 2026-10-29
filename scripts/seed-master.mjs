// scripts/seed-master.mjs
import fs from "fs";
import path from "path";

const localDbPath = path.join(process.cwd(), "data", "local-db.json");
const masterSeedPath = path.join(process.cwd(), "data", "master-seed.json");

async function runMasterSeed() {
  console.log("=================================================");
  console.log("   G-STORE E-COMMERCE MASTER SEEDER INITIALIZER   ");
  console.log("=================================================\n");

  const dataDir = path.dirname(localDbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(masterSeedPath)) {
    console.error("Error: master-seed.json not found at:", masterSeedPath);
    process.exit(1);
  }

  console.log("Loading master seed dataset from:", masterSeedPath);
  const rawData = fs.readFileSync(masterSeedPath, "utf8");
  const seedData = JSON.parse(rawData);

  // Ensure all variants from products are also synced in root db.variants
  const allVariants = [];
  if (Array.isArray(seedData.products)) {
    seedData.products.forEach((p) => {
      if (Array.isArray(p.variants)) {
        allVariants.push(...p.variants);
      }
    });
  }
  seedData.variants = allVariants;

  // Write to data/local-db.json
  fs.writeFileSync(localDbPath, JSON.stringify(seedData, null, 2), "utf8");
  console.log("Successfully written to:", localDbPath);

  // Print Summary
  console.log("\n------------------ SEEDED DATA SUMMARY ------------------");
  console.log(`- Categories:          ${seedData.categories?.length || 0} departments`);
  console.log(`- Products:            ${seedData.products?.length || 0} flagship products`);
  console.log(`- Product Variants:    ${seedData.variants?.length || 0} active variants`);
  console.log(`- Asset Library:       ${seedData.assets?.length || 0} studio packshot media`);
  console.log(`- Users / Accounts:    ${seedData.users?.length || 0} admin & customer logins`);
  console.log(`- Sliders & Banners:   ${seedData.sliders?.length || 0} hero & promotional banners`);
  console.log(`- Header Menu Items:   ${seedData.menuItems?.length || 0} category navigation links`);
  console.log(`- Payment Gateways:    ${seedData.gateways?.length || 0} gateways (Razorpay, COD, etc.)`);
  console.log(`- Warehouses:          ${seedData.warehouses?.length || 0} fulfillment centers`);
  console.log(`- Shipping Providers:  ${seedData.shippingProviders?.length || 0} courier partners`);
  console.log(`- Promotional Coupons: ${seedData.coupons?.length || 0} active discount codes`);
  console.log("---------------------------------------------------------\n");

  console.log("Categories Seeded:");
  seedData.categories?.forEach((c, idx) => {
    console.log(`  ${idx + 1}. ${c.name} (Slug: ${c.slug}) -> /category/${c.slug}`);
  });

  console.log("\nKey User Logins:");
  console.log("  * Customer: gyanchandranist@gmail.com  (Password: password123)");
  console.log("  * Admin:    admin@tagateway.com        (Password: password123)");
  console.log("  * Admin:    gyan@gmail.com             (Password: password123)");

  console.log("\nDeveloper API Key (Mobile App / Swagger):");
  console.log("  * Header:   x-api-key: gstore_mobile_dev_key_2026_x89f");
  console.log("  * Swagger:  http://localhost:3000/docs");

  console.log("\nMaster Seeder Completed Successfully! Database is ready.");
}

runMasterSeed().catch((err) => {
  console.error("Master Seeder Failed:", err);
  process.exit(1);
});
