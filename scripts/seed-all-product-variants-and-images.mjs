// scripts/seed-all-product-variants-and-images.mjs
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "local-db.json");
const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

// 1. Update Menu Items so all 8 categories point to their dedicated /category/[slug] page
const categoryMenuMap = {
  "Electronics": "/category/electronics",
  "Fashion": "/category/fashion",
  "Women's": "/category/womens",
  "Kids' Fashion": "/category/kids-fashion",
  "Health & Beauty": "/category/health-beauty",
  "Pharmacy": "/category/pharmacy",
  "Groceries": "/category/groceries",
  "Luxury Item": "/category/luxury-item"
};

if (Array.isArray(db.menuItems)) {
  db.menuItems.forEach(item => {
    if (categoryMenuMap[item.label]) {
      item.url = categoryMenuMap[item.label];
    }
  });
}

// 2. Fix SVG placeholder images to high quality real WebP images
const svgToWebpMap = {
  "/uploads/prod_trench_1.svg": "/uploads/prod_trench_2.webp",
  "/uploads/prod_snail_1.svg": "/uploads/prod_snail_2.webp",
  "/uploads/prod_sunscreen_1.svg": "/uploads/prod_sunscreen_2.webp",
  "/uploads/prod_omega_1.svg": "/uploads/prod_omega_2.webp",
  "/uploads/prod_honey_1.svg": "/uploads/prod_honey_2.webp",
  "/uploads/prod_almonds_1.svg": "/uploads/prod_almonds_2.webp",
  "/uploads/prod_kidspuff_2.svg": "/uploads/prod_kidspuff_1.webp",
  "/uploads/prod_multi_2.svg": "/uploads/prod_multi_1.webp"
};

// Update assets in db.assets
if (Array.isArray(db.assets)) {
  db.assets.forEach(asset => {
    if (svgToWebpMap[asset.url]) {
      asset.url = svgToWebpMap[asset.url];
      asset.mimeType = "image/webp";
    }
  });
}

// 3. Define Variant Templates by Category or Product Type
function generateVariantsForProduct(product) {
  const pId = product.id;
  const pName = product.name;
  const pPrice = Number(product.price) || 99;
  const pCompare = Number(product.comparePrice) || Math.round(pPrice * 1.25);
  const pCost = Number((pPrice * 0.65).toFixed(2));
  const mainImg = product.mainImage || (product.assets && product.assets[0]?.url) || "/uploads/prod_s24_ultra_deal.webp";
  const secImg = (product.assets && product.assets[1]?.url) || mainImg;

  let attributesDef = [];
  let variantCombinations = [];

  // Categorize product based on categoryIds or keywords
  const cat = (product.categoryIds && product.categoryIds[0]) || "";
  const nameLower = pName.toLowerCase();

  if (cat === "cat_electronics" || nameLower.includes("phone") || nameLower.includes("s24") || nameLower.includes("macbook") || nameLower.includes("monitor") || nameLower.includes("headphones")) {
    if (nameLower.includes("phone") || nameLower.includes("s24") || nameLower.includes("iphone")) {
      attributesDef = [
        { name: "Storage", values: ["256 GB", "512 GB", "1 TB"] },
        { name: "Color", values: ["Titanium Gray", "Titanium Black", "Titanium Violet"] }
      ];
      const storageOffsets = { "256 GB": 0, "512 GB": 150, "1 TB": 350 };
      const colors = ["Titanium Gray", "Titanium Black", "Titanium Violet"];
      attributesDef[0].values.forEach(storage => {
        colors.forEach((col, idx) => {
          const colCode = col.split(" ")[1]?.substring(0, 3).toUpperCase() || "GRY";
          const stCode = storage.replace(" ", "");
          const vPrice = Number((pPrice + storageOffsets[storage]).toFixed(2));
          const vComp = Number((pCompare + storageOffsets[storage] * 1.2).toFixed(2));
          variantCombinations.push({
            id: `var_${pId}_${stCode}_${colCode}`.toLowerCase(),
            sku: `${product.sku}-${stCode}-${colCode}`,
            price: vPrice,
            comparePrice: vComp,
            costPrice: Number((vPrice * 0.65).toFixed(2)),
            currentStock: 25 + idx * 5,
            image: idx === 0 ? mainImg : secImg,
            attributes: { "Storage": storage, "Color": col }
          });
        });
      });
    } else if (nameLower.includes("macbook")) {
      attributesDef = [
        { name: "Memory", values: ["36GB Unified", "48GB Unified", "96GB Unified"] },
        { name: "Color", values: ["Space Black", "Silver"] }
      ];
      const memOffsets = { "36GB Unified": 0, "48GB Unified": 300, "96GB Unified": 700 };
      attributesDef[0].values.forEach(mem => {
        ["Space Black", "Silver"].forEach((col, idx) => {
          const memCode = mem.split("GB")[0] + "G";
          const colCode = col.substring(0, 3).toUpperCase();
          const vPrice = Number((pPrice + memOffsets[mem]).toFixed(2));
          variantCombinations.push({
            id: `var_${pId}_${memCode}_${colCode}`.toLowerCase(),
            sku: `${product.sku}-${memCode}-${colCode}`,
            price: vPrice,
            comparePrice: Number((vPrice * 1.15).toFixed(2)),
            costPrice: Number((vPrice * 0.7).toFixed(2)),
            currentStock: 20 + idx * 4,
            image: idx === 0 ? mainImg : secImg,
            attributes: { "Memory": mem, "Color": col }
          });
        });
      });
    } else {
      // Headphones / Monitors
      attributesDef = [
        { name: "Color", values: ["Midnight Black", "Silver Platinum", "Midnight Blue"] }
      ];
      attributesDef[0].values.forEach((col, idx) => {
        const colCode = col.split(" ")[1]?.substring(0, 3).toUpperCase() || col.substring(0, 3).toUpperCase();
        variantCombinations.push({
          id: `var_${pId}_${colCode}`.toLowerCase(),
          sku: `${product.sku}-${colCode}`,
          price: pPrice,
          comparePrice: pCompare,
          costPrice: pCost,
          currentStock: 30 + idx * 5,
          image: idx === 0 ? mainImg : secImg,
          attributes: { "Color": col }
        });
      });
    }
  } else if (cat === "cat_fashion" || cat === "cat_womens" || cat === "cat_kids_fashion") {
    // Apparel or Shoes
    if (nameLower.includes("sneaker") || nameLower.includes("shoe")) {
      attributesDef = [
        { name: "Size", values: ["US 8", "US 9", "US 10", "US 11"] },
        { name: "Color", values: ["Triple White", "Laser Orange / Black", "Obsidian Blue"] }
      ];
      attributesDef[0].values.forEach(sz => {
        const szCode = sz.replace(" ", "");
        ["Triple White", "Laser Orange / Black", "Obsidian Blue"].forEach((col, idx) => {
          const colCode = col.substring(0, 3).toUpperCase();
          variantCombinations.push({
            id: `var_${pId}_${szCode}_${colCode}`.toLowerCase(),
            sku: `${product.sku}-${szCode}-${colCode}`,
            price: pPrice,
            comparePrice: pCompare,
            costPrice: pCost,
            currentStock: 20 + idx * 5,
            image: idx === 0 ? mainImg : secImg,
            attributes: { "Size": sz, "Color": col }
          });
        });
      });
    } else {
      // Clothing: Dresses, Hoodies, Jackets, Pants
      attributesDef = [
        { name: "Size", values: ["S", "M", "L", "XL"] },
        { name: "Color", values: ["Classic Navy", "Heather Charcoal", "Emerald Green"] }
      ];
      attributesDef[0].values.forEach(sz => {
        ["Classic Navy", "Heather Charcoal", "Emerald Green"].forEach((col, idx) => {
          const colCode = col.split(" ")[0].substring(0, 3).toUpperCase();
          variantCombinations.push({
            id: `var_${pId}_${sz}_${colCode}`.toLowerCase(),
            sku: `${product.sku}-${sz}-${colCode}`,
            price: pPrice,
            comparePrice: pCompare,
            costPrice: pCost,
            currentStock: 25 + idx * 4,
            image: idx === 0 ? mainImg : secImg,
            attributes: { "Size": sz, "Color": col }
          });
        });
      });
    }
  } else if (cat === "cat_health_beauty" || cat === "cat_pharmacy") {
    // Serums, Vitamins, Powders, Creams
    if (nameLower.includes("powder") || nameLower.includes("whey")) {
      attributesDef = [
        { name: "Weight", values: ["1 kg (2.2 lbs)", "2.5 kg (5.5 lbs)"] },
        { name: "Flavor", values: ["French Vanilla", "Rich Chocolate Cream", "Strawberry Shortcake"] }
      ];
      const weightOffsets = { "1 kg (2.2 lbs)": 0, "2.5 kg (5.5 lbs)": 45.00 };
      attributesDef[0].values.forEach(wt => {
        const wtCode = wt.startsWith("1") ? "1KG" : "2.5KG";
        attributesDef[1].values.forEach((flv, idx) => {
          const flvCode = flv.split(" ")[0].substring(0, 3).toUpperCase();
          const vPrice = Number((pPrice + weightOffsets[wt]).toFixed(2));
          variantCombinations.push({
            id: `var_${pId}_${wtCode}_${flvCode}`.toLowerCase(),
            sku: `${product.sku}-${wtCode}-${flvCode}`,
            price: vPrice,
            comparePrice: Number((vPrice * 1.2).toFixed(2)),
            costPrice: Number((vPrice * 0.6).toFixed(2)),
            currentStock: 35 + idx * 5,
            image: idx === 0 ? mainImg : secImg,
            attributes: { "Weight": wt, "Flavor": flv }
          });
        });
      });
    } else {
      // Bottles, Serums, Supplements
      attributesDef = [
        { name: "Pack Size", values: ["Single Pack (60 Days)", "Twin Pack (120 Days - 15% OFF)"] }
      ];
      const sizeOffsets = { "Single Pack (60 Days)": 0, "Twin Pack (120 Days - 15% OFF)": pPrice * 0.7 };
      attributesDef[0].values.forEach((sz, idx) => {
        const szCode = idx === 0 ? "SINGLE" : "TWIN";
        const vPrice = Number((pPrice + sizeOffsets[sz]).toFixed(2));
        variantCombinations.push({
          id: `var_${pId}_${szCode}`.toLowerCase(),
          sku: `${product.sku}-${szCode}`,
          price: vPrice,
          comparePrice: Number((vPrice * 1.25).toFixed(2)),
          costPrice: Number((vPrice * 0.6).toFixed(2)),
          currentStock: 40 + idx * 10,
          image: idx === 0 ? mainImg : secImg,
          attributes: { "Pack Size": sz }
        });
      });
    }
  } else if (cat === "cat_groceries") {
    // Honey, Olive Oil, Coffee, Dates, Almonds
    attributesDef = [
      { name: "Pack Size", values: ["500g Jar", "1kg Economy Pack", "2kg Family Pack"] }
    ];
    const packOffsets = { "500g Jar": 0, "1kg Economy Pack": pPrice * 0.85, "2kg Family Pack": pPrice * 1.6 };
    attributesDef[0].values.forEach((pack, idx) => {
      const pCode = pack.split(" ")[0].toUpperCase();
      const vPrice = Number((pPrice + packOffsets[pack]).toFixed(2));
      variantCombinations.push({
        id: `var_${pId}_${pCode}`.toLowerCase(),
        sku: `${product.sku}-${pCode}`,
        price: vPrice,
        comparePrice: Number((vPrice * 1.2).toFixed(2)),
        costPrice: Number((vPrice * 0.6).toFixed(2)),
        currentStock: 50 + idx * 10,
        image: idx === 0 ? mainImg : secImg,
        attributes: { "Pack Size": pack }
      });
    });
  } else {
    // Luxury Item (Watches, Duffle, Sunglasses, Jewelry, Scarves)
    if (nameLower.includes("watch")) {
      attributesDef = [
        { name: "Dial Finish", values: ["Sunburst Silver", "Midnight Navy", "Onyx Black"] },
        { name: "Strap", values: ["Stainless Steel Bracelet", "Alligator Leather"] }
      ];
      attributesDef[0].values.forEach(dial => {
        const dialCode = dial.split(" ")[1]?.substring(0, 3).toUpperCase() || "SLV";
        attributesDef[1].values.forEach((strap, idx) => {
          const strapCode = strap.startsWith("Stainless") ? "STEEL" : "LTHR";
          const strapOffset = strap.startsWith("Stainless") ? 0 : 50;
          const vPrice = Number((pPrice + strapOffset).toFixed(2));
          variantCombinations.push({
            id: `var_${pId}_${dialCode}_${strapCode}`.toLowerCase(),
            sku: `${product.sku}-${dialCode}-${strapCode}`,
            price: vPrice,
            comparePrice: Number((vPrice * 1.25).toFixed(2)),
            costPrice: Number((vPrice * 0.65).toFixed(2)),
            currentStock: 12 + idx * 3,
            image: idx === 0 ? mainImg : secImg,
            attributes: { "Dial Finish": dial, "Strap": strap }
          });
        });
      });
    } else if (nameLower.includes("earring") || nameLower.includes("necklace") || nameLower.includes("gold")) {
      attributesDef = [
        { name: "Metal Type", values: ["14K White Gold", "18K Yellow Gold", "Platinum 950"] }
      ];
      const metalOffsets = { "14K White Gold": 0, "18K Yellow Gold": 120, "Platinum 950": 280 };
      attributesDef[0].values.forEach((metal, idx) => {
        const mCode = metal.split(" ")[1]?.substring(0, 3).toUpperCase() || "GLD";
        const vPrice = Number((pPrice + metalOffsets[metal]).toFixed(2));
        variantCombinations.push({
          id: `var_${pId}_${mCode}`.toLowerCase(),
          sku: `${product.sku}-${mCode}`,
          price: vPrice,
          comparePrice: Number((vPrice * 1.3).toFixed(2)),
          costPrice: Number((vPrice * 0.7).toFixed(2)),
          currentStock: 15 + idx * 2,
          image: idx === 0 ? mainImg : secImg,
          attributes: { "Metal Type": metal }
        });
      });
    } else {
      // Leather Bag, Sunglasses, Silk Scarf
      attributesDef = [
        { name: "Color", values: ["Cognac Brown", "Saffiano Black", "Burgundy Red"] }
      ];
      attributesDef[0].values.forEach((col, idx) => {
        const colCode = col.split(" ")[0].substring(0, 3).toUpperCase();
        variantCombinations.push({
          id: `var_${pId}_${colCode}`.toLowerCase(),
          sku: `${product.sku}-${colCode}`,
          price: pPrice,
          comparePrice: pCompare,
          costPrice: pCost,
          currentStock: 18 + idx * 4,
          image: idx === 0 ? mainImg : secImg,
          attributes: { "Color": col }
        });
      });
    }
  }

  // Format full ProductVariantRecords
  const now = new Date().toISOString();
  const variants = variantCombinations.map(vc => ({
    id: vc.id,
    productId: pId,
    sku: vc.sku,
    price: vc.price,
    comparePrice: vc.comparePrice,
    costPrice: vc.costPrice,
    currentStock: vc.currentStock,
    isActive: true,
    image: vc.image,
    attributes: vc.attributes,
    createdAt: now,
    updatedAt: now
  }));

  return { attributesDef, variants };
}

// 4. Update all 40 products in db.products
if (!Array.isArray(db.variants)) {
  db.variants = [];
}
// Clear old variants
db.variants = [];

let totalCreatedVariants = 0;

db.products.forEach(product => {
  // Fix svg images
  if (product.mainImage && svgToWebpMap[product.mainImage]) {
    product.mainImage = svgToWebpMap[product.mainImage];
  }
  if (Array.isArray(product.assets)) {
    product.assets.forEach(a => {
      if (svgToWebpMap[a.url]) {
        a.url = svgToWebpMap[a.url];
      }
    });
  }

  const { attributesDef, variants } = generateVariantsForProduct(product);
  product.hasVariants = true;
  product.variantAttributes = attributesDef;
  product.variants = variants;

  // Add into global db.variants
  variants.forEach(v => db.variants.push(v));
  totalCreatedVariants += variants.length;
});

// Write back to local-db.json
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");

console.log("Successfully updated database!");
console.log(`- Updated ${db.menuItems.length} menu items with /category/[slug] paths.`);
console.log(`- Replaced SVG placeholder images with real studio WebP packshots.`);
console.log(`- Created ${totalCreatedVariants} rich variants across all ${db.products.length} products.`);
