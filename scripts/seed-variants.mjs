import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "local-db.json");
const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

// 1. Ensure category hierarchy
const smartphone = db.categories.find(c => c.id === "cat_6avp2l850" || c.slug.includes("smartphone"));
if (smartphone) {
  smartphone.parentId = "cat_electronics";
  smartphone.level = 1;
}

const sneakers = db.categories.find(c => c.id === "cat_sneakers");
if (sneakers) {
  sneakers.parentId = "cat_fashion";
  sneakers.level = 1;
}

const sportshoes = db.categories.find(c => c.id === "cat_sportshoes");
if (sportshoes) {
  sportshoes.parentId = "cat_fashion";
  sportshoes.level = 1;
}

// 2. Ensure productCategories are synced
if (!db.productCategories) db.productCategories = [];
const existingProdCats = new Set(db.productCategories.map(pc => `${pc.productId}_${pc.categoryId}`));

const productCategoryMappings = {
  prod_1: ["cat_electronics", "cat_6avp2l850"],
  prod_2: ["cat_electronics"],
  prod_3: ["cat_electronics"],
  prod_4: ["cat_electronics", "cat_6avp2l850"],
  prod_5: ["cat_electronics"],
  prod_s24_ultra: ["cat_electronics", "cat_6avp2l850"],
  prod_nike_hoodie: ["cat_fashion"],
  prod_beanless_bag: ["cat_homedecor"],
  prod_diamond_earrings: ["cat_luxury"],
  prod_nike_invincible: ["cat_fashion", "cat_sneakers"],
  prod_winter_parka: ["cat_fashion"],
  prod_wool_sweater: ["cat_fashion"],
  prod_fleece_sweatpants: ["cat_fashion"],
  prod_winter_puffer: ["cat_fashion"]
};

for (const [pId, catIds] of Object.entries(productCategoryMappings)) {
  const prod = db.products.find(p => p.id === pId);
  if (prod) {
    prod.categoryIds = catIds;
  }
  catIds.forEach((cId, idx) => {
    const key = `${pId}_${cId}`;
    if (!existingProdCats.has(key)) {
      db.productCategories.push({
        productId: pId,
        categoryId: cId,
        isMain: idx === 0
      });
      existingProdCats.add(key);
    }
  });
}

// 3. Setup variants
if (!db.variants) db.variants = [];

// Samsung S24 Ultra variants
const s24 = db.products.find(p => p.id === "prod_s24_ultra");
if (s24) {
  s24.hasVariants = true;
  s24.variantAttributes = [
    { name: "Storage", values: ["256 GB", "512 GB", "1 TB"] },
    { name: "Color", values: ["Titanium Gray", "Titanium Black", "Titanium Violet"] }
  ];

  // Remove existing variants for s24
  db.variants = db.variants.filter(v => v.productId !== s24.id);

  const storages = [
    { val: "256 GB", price: 1169.10, comparePrice: 1299.00 },
    { val: "512 GB", price: 1299.00, comparePrice: 1419.00 },
    { val: "1 TB", price: 1499.00, comparePrice: 1659.00 }
  ];
  const colors = ["Titanium Gray", "Titanium Black", "Titanium Violet"];

  storages.forEach(st => {
    colors.forEach(col => {
      const colCode = col.split(" ")[1]?.substring(0, 3).toUpperCase() || "GRY";
      const stCode = st.val.replace(" ", "");
      db.variants.push({
        id: `var_s24_${stCode}_${colCode}`.toLowerCase(),
        productId: s24.id,
        sku: `SAM-S24U-${stCode}-${colCode}`,
        price: st.price,
        comparePrice: st.comparePrice,
        costPrice: Number((st.price * 0.7).toFixed(2)),
        currentStock: 25,
        isActive: true,
        image: s24.mainImage || null,
        attributes: {
          "Storage": st.val,
          "Color": col
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  });
}

// Nike Hoodie variants
const hoodie = db.products.find(p => p.id === "prod_nike_hoodie");
if (hoodie) {
  hoodie.hasVariants = true;
  hoodie.variantAttributes = [
    { name: "Color", values: ["Black", "Carbon Heather", "Midnight Navy"] },
    { name: "Size", values: ["S", "M", "L", "XL"] }
  ];

  db.variants = db.variants.filter(v => v.productId !== hoodie.id);

  const hColors = ["Black", "Carbon Heather", "Midnight Navy"];
  const hSizes = ["S", "M", "L", "XL"];

  hColors.forEach(col => {
    hSizes.forEach(sz => {
      const colCode = col.split(" ")[0].substring(0, 3).toUpperCase();
      db.variants.push({
        id: `var_hoodie_${colCode}_${sz}`.toLowerCase(),
        productId: hoodie.id,
        sku: `NIKE-HD-${colCode}-${sz}`,
        price: 67.50,
        comparePrice: 85.00,
        costPrice: 35.00,
        currentStock: 30,
        isActive: true,
        image: hoodie.mainImage || null,
        attributes: {
          "Color": col,
          "Size": sz
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  });
}

// Nike Sneaker variants
const sneaker = db.products.find(p => p.id === "prod_nike_invincible");
if (sneaker) {
  sneaker.hasVariants = true;
  sneaker.variantAttributes = [
    { name: "Color", values: ["Laser Orange", "White/Obsidian"] },
    { name: "Size", values: ["8", "9", "10", "11"] }
  ];

  db.variants = db.variants.filter(v => v.productId !== sneaker.id);

  ["Laser Orange", "White/Obsidian"].forEach(col => {
    ["8", "9", "10", "11"].forEach(sz => {
      const colCode = col.substring(0, 3).toUpperCase();
      db.variants.push({
        id: `var_snk_${colCode}_${sz}`.toLowerCase(),
        productId: sneaker.id,
        sku: `NIKE-INV-${colCode}-${sz}`,
        price: 216.00,
        comparePrice: 240.00,
        costPrice: 120.00,
        currentStock: 15,
        isActive: true,
        image: sneaker.mainImage || null,
        attributes: {
          "Color": col,
          "Size": sz
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  });
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
console.log("SUCCESS! Total variants:", db.variants.length, "Total productCategories:", db.productCategories.length);
