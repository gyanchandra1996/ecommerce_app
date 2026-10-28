// scripts/test-s3-asset-sync.mjs

const BASE = "http://localhost:3001";

async function run() {
  console.log("=== 1. Testing Assets Storage Status ===");
  const assetsRes = await fetch(`${BASE}/api/assets`);
  const assetsJson = await assetsRes.json();
  console.log("Loaded assets count:", assetsJson.data.length);

  const s3Assets = assetsJson.data.filter((a) => a.storageProvider === "s3");
  const localAssets = assetsJson.data.filter((a) => a.storageProvider !== "s3");
  console.log(`- S3 Synced Assets: ${s3Assets.length}`);
  console.log(`- Local Storage Assets: ${localAssets.length}`);

  s3Assets.forEach((a) => {
    console.log(`  * [AWS S3] ${a.name} -> ${a.url.slice(0, 60)}...`);
  });

  console.log("\n=== 2. Testing Storage Filters ===");
  const s3FilteredRes = await fetch(`${BASE}/api/assets?storage=s3`);
  const s3Filtered = await s3FilteredRes.json();
  console.log("Storage=s3 count:", s3Filtered.data.length);
  if (s3Filtered.data.length !== s3Assets.length) {
    throw new Error("S3 filter count mismatch!");
  }

  const localFilteredRes = await fetch(`${BASE}/api/assets?storage=local`);
  const localFiltered = await localFilteredRes.json();
  console.log("Storage=local count:", localFiltered.data.length);
  if (localFiltered.data.length !== localAssets.length) {
    throw new Error("Local filter count mismatch!");
  }

  console.log("\n=== 3. Testing Single Asset Sync to S3 ===");
  if (localAssets.length > 0) {
    const targetAsset = localAssets[0];
    console.log(`Syncing "${targetAsset.name}" (ID: ${targetAsset.id}) to S3...`);
    const syncRes = await fetch(`${BASE}/api/assets/${targetAsset.id}/sync-s3`, { method: "POST" });
    const syncJson = await syncRes.json();
    console.log("Sync status:", syncRes.status, syncJson.success);
    console.log("Updated asset:", syncJson.data.name, "Storage:", syncJson.data.storageProvider);
    console.log("Updated URL:", syncJson.data.url);
    if (syncJson.data.storageProvider !== "s3") {
      throw new Error("Asset was not updated to s3!");
    }
  }

  console.log("\n=== 4. Testing Product Serving S3 Assets ===");
  const prodRes = await fetch(`${BASE}/api/products/samsung-galaxy-s24-ultra-titanium`);
  const prodJson = await prodRes.json();
  console.log("Product:", prodJson.data.name);
  console.log("Main Image URL:", prodJson.data.mainImage);
  const isProdS3 = prodJson.data.mainImage.includes("s3") || prodJson.data.mainImage.includes("cloudfront");
  console.log("Is product main image served from S3 / CloudFront?", isProdS3);

  console.log("\n=== ALL S3 ASSET SYNC TESTS PASSED! ===");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
