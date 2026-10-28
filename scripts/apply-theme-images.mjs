// scripts/apply-theme-images.mjs
import fs from "fs";
import path from "path";

const artifactDir = "C:/Users/Gyan/.gemini/antigravity/brain/fd6ed13e-b2b7-4825-b0b6-a4b75bdded8f";
const uploadsDir = path.join(process.cwd(), "public", "uploads");
const dbPath = path.join(process.cwd(), "data", "local-db.json");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function findLatestArtifactImage(prefix) {
  if (!fs.existsSync(artifactDir)) return null;
  const files = fs.readdirSync(artifactDir).filter((f) => f.startsWith(prefix) && (f.endsWith(".jpg") || f.endsWith(".png") || f.endsWith(".webp")));
  if (files.length === 0) return null;
  // Sort descending by modified time or filename
  files.sort((a, b) => {
    const statA = fs.statSync(path.join(artifactDir, a));
    const statB = fs.statSync(path.join(artifactDir, b));
    return statB.mtimeMs - statA.mtimeMs;
  });
  return path.join(artifactDir, files[0]);
}

function copyImage(srcPath, destFilename) {
  if (!srcPath || !fs.existsSync(srcPath)) return null;
  const destPath = path.join(uploadsDir, destFilename);
  fs.copyFileSync(srcPath, destPath);
  return `/uploads/${destFilename}`;
}

async function downloadIfMissing(url, destFilename) {
  const destPath = path.join(uploadsDir, destFilename);
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length > 500) {
        fs.writeFileSync(destPath, buffer);
        return `/uploads/${destFilename}`;
      }
    }
  } catch (err) {
    console.error("Failed to download fallback image:", url, err.message);
  }
  return null;
}

async function run() {
  console.log("=== APPLYING THEME IMAGES TO STOREFRONT ===");

  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

  // 1. Map Category Images
  const categoryMap = [
    { id: "cat_electronics", prefix: "theme_cat_electronics", dest: "category_electronics.webp", name: "Electronics" },
    { id: "cat_fashion", prefix: "theme_cat_fashion", dest: "category_fashion.webp", name: "Fashion" },
    { id: "cat_womens", prefix: "theme_cat_womens", dest: "category_womens.webp", name: "Women's" },
    { id: "cat_kids_fashion", prefix: "theme_cat_kids_fashion", dest: "category_kids_fashion.webp", name: "Kids' Fashion" },
    { id: "cat_health_beauty", prefix: "theme_cat_health_beauty", dest: "category_health_beauty.webp", name: "Health & Beauty" },
    { id: "cat_pharmacy", prefix: "theme_cat_pharmacy", dest: "category_pharmacy.webp", name: "Pharmacy" },
    {
      id: "cat_groceries",
      prefix: "theme_cat_groceries",
      dest: "category_groceries.webp",
      name: "Groceries",
      fallbackUrl: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "cat_luxury_item",
      prefix: "theme_cat_luxury_item",
      dest: "category_luxury_item.webp",
      name: "Luxury Item",
      fallbackUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80",
    },
  ];

  for (const item of categoryMap) {
    const src = findLatestArtifactImage(item.prefix);
    let url = null;
    if (src) {
      url = copyImage(src, item.dest);
    } else if (item.fallbackUrl) {
      url = await downloadIfMissing(item.fallbackUrl, item.dest);
    }

    if (url) {
      const cat = db.categories.find((c) => c.id === item.id);
      if (cat) {
        cat.image = url;
        console.log(`[Category] Updated ${item.name} -> ${url}`);
      }
      // Register or update in db.assets
      const assetId = `ast_${item.id}_theme`;
      const existingAsset = db.assets.find((a) => a.id === assetId || a.fileUrl === url);
      const stat = fs.statSync(path.join(uploadsDir, item.dest));
      const assetData = {
        id: assetId,
        name: `${item.name} - Studio Category Icon`,
        originalName: item.dest,
        fileUrl: url,
        url: url,
        fileType: "image",
        mimeType: "image/webp",
        fileSize: stat.size,
        dimensions: { width: 1024, height: 1024 },
        storageProvider: "local",
        storageKey: `uploads/${item.dest}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (existingAsset) {
        Object.assign(existingAsset, assetData);
      } else {
        db.assets.push(assetData);
      }
    } else {
      console.log(`[Category] Pending image for ${item.name} (${item.prefix})`);
    }
  }

  // 2. Map Showcase Deal Products
  const productMap = [
    {
      id: "prod_s24_ultra",
      prefix: "theme_prod_s24_ultra",
      dest: "prod_s24_ultra_deal.webp",
      name: "Samsung Galaxy S24 Ultra 12+GB Titanium Gray",
      price: 999.99,
      comparePrice: 1299.0,
      rating: 4.8,
      reviewsCount: 1200,
    },
    {
      id: "prod_nike_jordan_hoodie",
      prefix: "theme_prod_blue_hoodie",
      dest: "prod_blue_hoodie_deal.webp",
      name: "Nike Jordan Brooklyn Fleece Men's Pullover Hoodie",
      price: 45.0,
      comparePrice: 75.0,
      rating: 4.5,
      reviewsCount: 569,
    },
    {
      id: "prod_nike_af1",
      prefix: "theme_prod_running_shoe",
      dest: "prod_running_shoe_deal.webp",
      name: "Nike Invincible 3 Premium Running Sneaker",
      fallbackUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
      price: 190.0,
      comparePrice: 240.0,
      rating: 4.2,
      reviewsCount: 157,
    },
    {
      id: "prod_18k_gold_necklace",
      prefix: "theme_prod_diamond_box",
      dest: "prod_diamond_jewelry_deal.webp",
      name: "Diamond Stud Earrings (1/3 ct. t.w.) in 14K White Gold",
      price: 299.0,
      comparePrice: 450.0,
      rating: 4.7,
      reviewsCount: 1100,
    },
    {
      id: "prod_leather_crossbody_bag",
      prefix: "theme_cat_womens",
      dest: "prod_blush_handbag_deal.webp",
      name: "Italian Calfskin Leather Crossbody Saddle Bag",
      price: 245.0,
      comparePrice: 380.0,
      rating: 4.9,
      reviewsCount: 230,
    },
  ];

  for (const item of productMap) {
    const src = findLatestArtifactImage(item.prefix);
    let url = null;
    if (src) {
      url = copyImage(src, item.dest);
    } else if (item.fallbackUrl) {
      url = await downloadIfMissing(item.fallbackUrl, item.dest);
    }

    if (url) {
      const prod = db.products.find((p) => p.id === item.id);
      if (prod) {
        prod.mainImage = url;
        if (item.name) prod.name = item.name;
        if (item.price) prod.price = item.price;
        if (item.comparePrice) prod.comparePrice = item.comparePrice;
        if (item.rating) prod.rating = item.rating;
        if (item.reviewsCount) prod.reviewsCount = item.reviewsCount;
        console.log(`[Product] Updated ${prod.name} -> ${url}`);
      }
      const assetId = `ast_${item.id}_deal_theme`;
      const existingAsset = db.assets.find((a) => a.id === assetId || a.fileUrl === url);
      const stat = fs.statSync(path.join(uploadsDir, item.dest));
      const assetData = {
        id: assetId,
        name: `${item.name} - Deal Studio Shot`,
        originalName: item.dest,
        fileUrl: url,
        url: url,
        fileType: "image",
        mimeType: "image/webp",
        fileSize: stat.size,
        dimensions: { width: 1024, height: 1024 },
        storageProvider: "local",
        storageKey: `uploads/${item.dest}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (existingAsset) {
        Object.assign(existingAsset, assetData);
      } else {
        db.assets.push(assetData);
      }

      // Add to productAssets as primary
      db.productAssets = db.productAssets.filter((pa) => pa.productId !== item.id || pa.assetId !== assetId);
      db.productAssets.unshift({
        productId: item.id,
        assetId: assetId,
        isPrimary: true,
      });
      if (prod) {
        if (!prod.assetIds) prod.assetIds = [];
        if (!prod.assetIds.includes(assetId)) {
          prod.assetIds.unshift(assetId);
        }
      }
    } else {
      console.log(`[Product] Pending image for ${item.name} (${item.prefix})`);
    }
  }

  // Ensure these 5 showcase products are placed at the beginning of db.products for "Todays Best Deals"
  const dealIds = productMap.map((p) => p.id);
  const dealProducts = db.products.filter((p) => dealIds.includes(p.id));
  // Sort according to dealIds order
  dealProducts.sort((a, b) => dealIds.indexOf(a.id) - dealIds.indexOf(b.id));
  const otherProducts = db.products.filter((p) => !dealIds.includes(p.id));
  db.products = [...dealProducts, ...otherProducts];

  // 3. Map Hero Sliders and Triple Promo Banners
  const sliderMap = [
    {
      position: "main",
      titleMatch: "iPhone 16",
      prefix: "theme_banner_iphone16",
      dest: "hero_iphone16_banner.webp",
      title: "iPhone 16 Pro Max",
      subtitle: "From $ 50,769*",
      description: "A18 chip, Superfast, Supersmart History, Biggest Price Drop",
    },
    {
      position: "side",
      titleMatch: "SALE UP TO 50%",
      prefix: "theme_banner_running_sale",
      dest: "hero_running_sale_banner.webp",
      title: "SALE UP TO 50% OFF",
      subtitle: "Puma Nitro Pro Velocity",
      description: "High-cushion responsive running gear",
    },
    {
      position: "triple_promo",
      titleMatch: "VEGETABLE",
      prefix: "theme_banner_fresh_vegetables",
      dest: "promo_fresh_vegetables.webp",
      title: "FRESH AND HEALTHY VEGETABLE",
      badge: "50% SAVE",
      tag: "FREE DELIVERY",
      subtitle: "Farm-fresh organic greens, crisp carrots & tomatoes delivered daily",
    },
    {
      position: "triple_promo",
      titleMatch: "S24 FE",
      prefix: "theme_banner_s24fe",
      dest: "promo_s24fe.webp",
      fallbackUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80",
      title: "Galaxy S24 FE",
      badge: "SAMSUNG",
      tag: "GALAXY AI IS HERE",
      subtitle: "Galaxy AI ✨ is here",
    },
    {
      position: "triple_promo",
      titleMatch: "Mountain|Pantry|Special|Value|Organic",
      prefix: "theme_banner_gourmet_pantry",
      dest: "promo_gourmet_pantry.webp",
      fallbackUrl: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=600&q=80",
      title: "Organic Mountain Delights",
      badge: "Limited Stock",
      tag: "EXCLUSIVE SPECIAL OFFER",
      subtitle: "Organic mountain honey, pantry spices & dates sets",
    },
  ];

  if (!db.sliders) db.sliders = [];

  for (const item of sliderMap) {
    const src = findLatestArtifactImage(item.prefix);
    let url = null;
    if (src) {
      url = copyImage(src, item.dest);
    } else if (item.fallbackUrl) {
      url = await downloadIfMissing(item.fallbackUrl, item.dest);
    }

    if (url) {
      let slider = db.sliders.find((s) => s.position === item.position && new RegExp(item.titleMatch, "i").test(s.title));
      if (!slider) {
        slider = {
          id: `sl_${item.dest.replace(".webp", "")}`,
          title: item.title,
          subtitle: item.subtitle,
          description: item.description,
          badge: item.badge,
          tag: item.tag,
          imageUrl: url,
          position: item.position,
          buttonText: "Shop now",
          buttonLink: "#deals",
          isActive: true,
          displayOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.sliders.push(slider);
      } else {
        slider.imageUrl = url;
        if (item.title) slider.title = item.title;
        if (item.subtitle) slider.subtitle = item.subtitle;
        if (item.description) slider.description = item.description;
        slider.updatedAt = new Date().toISOString();
      }
      console.log(`[Slider] Updated ${item.title} (${item.position}) -> ${url}`);
    } else {
      console.log(`[Slider] Pending image for ${item.title} (${item.prefix})`);
    }
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
  console.log("=== LOCAL DB UPDATED WITH THEME IMAGES ===");
}

run().catch(console.error);
