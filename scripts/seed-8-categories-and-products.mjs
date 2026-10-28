// scripts/seed-8-categories-and-products.mjs
import fs from "fs";
import path from "path";

const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Download helper with local fallback if network fails
async function saveImageLocally(url, filename, fallbackSvgContent) {
  const filePath = path.join(uploadsDir, filename);
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length > 500) {
        fs.writeFileSync(filePath, buffer);
        return {
          filename,
          url: `/uploads/${filename}`,
          size: buffer.length,
          mimeType: "image/webp",
        };
      }
    }
  } catch (err) {
    // network issue, use fallback
  }

  // Fallback SVG or minimal webp
  const svgFilename = filename.replace(/\.(webp|jfif|jpg|png)$/, ".svg");
  const svgPath = path.join(uploadsDir, svgFilename);
  const content =
    fallbackSvgContent ||
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="#f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="bold" fill="#64748b">${filename}</text></svg>`;
  fs.writeFileSync(svgPath, Buffer.from(content));
  const stats = fs.statSync(svgPath);
  return {
    filename: svgFilename,
    url: `/uploads/${svgFilename}`,
    size: stats.size,
    mimeType: "image/svg+xml",
  };
}

// 8 Categories specified in user screenshot
const CATEGORIES_DATA = [
  {
    id: "cat_electronics",
    name: "Electronics",
    slug: "electronics",
    description: "Smartphones, Laptops, Audio, Displays & Smart Accessories",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
    imageFile: "category_electronics.webp",
  },
  {
    id: "cat_fashion",
    name: "Fashion",
    slug: "fashion",
    description: "Men's Apparel, Denim Jackets, Sneakers & Streetwear",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    imageFile: "category_fashion.webp",
  },
  {
    id: "cat_womens",
    name: "Women's",
    slug: "womens",
    description: "Dresses, Trench Coats, Silk Blouses & Leather Handbags",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
    imageFile: "category_womens.webp",
  },
  {
    id: "cat_kids_fashion",
    name: "Kids' Fashion",
    slug: "kids-fashion",
    description: "Kids' Hoodies, Winter Puffers, Party Dresses & Sneakers",
    imageUrl: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=400&q=80",
    imageFile: "category_kids_fashion.webp",
  },
  {
    id: "cat_health_beauty",
    name: "Health & Beauty",
    slug: "health-beauty",
    description: "Skincare Serums, Barrier Moisturizers, Sunscreens & Hair Oils",
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80",
    imageFile: "category_health_beauty.webp",
  },
  {
    id: "cat_pharmacy",
    name: "Pharmacy",
    slug: "pharmacy",
    description: "Daily Multivitamins, Omega-3 Fish Oil, Whey Protein & First Aid",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
    imageFile: "category_pharmacy.webp",
  },
  {
    id: "cat_groceries",
    name: "Groceries",
    slug: "groceries",
    description: "Organic Honey, Cold Pressed Olive Oil, Espresso Beans & Dates",
    imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80",
    imageFile: "category_groceries.webp",
  },
  {
    id: "cat_luxury_item",
    name: "Luxury Item",
    slug: "luxury-item",
    description: "Automatic Chronographs, Italian Leather Bags & 18K Solid Gold",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80",
    imageFile: "category_luxury_item.webp",
  },
];

// 5 Products for each of the 8 categories (40 Products total) with multiple images
const PRODUCTS_DATA = [
  // 1. Electronics (5 products)
  {
    id: "prod_s24_ultra",
    name: "Samsung Galaxy S24 Ultra 12+GB Titanium Gray",
    slug: "samsung-galaxy-s24-ultra-titanium",
    sku: "SAM-S24U-TI",
    categoryId: "cat_electronics",
    price: 1169.1,
    comparePrice: 1299.0,
    costPrice: 850.0,
    currentStock: 44,
    warehouseId: "wh_samsung_1",
    manufacturerId: "mfg_samsung",
    brand: "Samsung",
    images: [
      { url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80", file: "prod_s24_1.webp" },
      { url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80", file: "prod_s24_2.webp" },
      { url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80", file: "prod_s24_3.webp" },
    ],
  },
  {
    id: "prod_iphone_15_pro",
    name: "Apple iPhone 15 Pro Max Titanium Natural (256GB)",
    slug: "apple-iphone-15-pro-max-titanium",
    sku: "APL-IPH15PM-NAT",
    categoryId: "cat_electronics",
    price: 1199.0,
    comparePrice: 1299.0,
    costPrice: 900.0,
    currentStock: 35,
    warehouseId: "wh_samsung_1",
    manufacturerId: "mfg_samsung",
    brand: "Apple",
    images: [
      { url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80", file: "prod_iph15_1.webp" },
      { url: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80", file: "prod_iph15_2.webp" },
      { url: "https://images.unsplash.com/photo-1530319067432-f2a729c03db5?auto=format&fit=crop&w=600&q=80", file: "prod_iph15_3.webp" },
    ],
  },
  {
    id: "prod_sony_xm5",
    name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    slug: "sony-wh-1000xm5-wireless-headphones",
    sku: "SNY-WH1000XM5-BLK",
    categoryId: "cat_electronics",
    price: 399.0,
    comparePrice: 449.0,
    costPrice: 280.0,
    currentStock: 50,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "Sony",
    images: [
      { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80", file: "prod_sonyxm5_1.webp" },
      { url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=80", file: "prod_sonyxm5_2.webp" },
    ],
  },
  {
    id: "prod_macbook_pro_16",
    name: "Apple MacBook Pro 16-inch M3 Max Space Black",
    slug: "apple-macbook-pro-16-m3-max",
    sku: "APL-MBP16-M3MAX",
    categoryId: "cat_electronics",
    price: 3499.0,
    comparePrice: 3699.0,
    costPrice: 2600.0,
    currentStock: 18,
    warehouseId: "wh_samsung_1",
    manufacturerId: "mfg_samsung",
    brand: "Apple",
    images: [
      { url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80", file: "prod_mbp16_1.webp" },
      { url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80", file: "prod_mbp16_2.webp" },
    ],
  },
  {
    id: "prod_dell_monitor_4k",
    name: "Dell UltraSharp 32-inch 4K UHD USB-C Hub Monitor",
    slug: "dell-ultrasharp-32-4k-uhd-monitor",
    sku: "DEL-U3223QE-4K",
    categoryId: "cat_electronics",
    price: 849.0,
    comparePrice: 949.0,
    costPrice: 620.0,
    currentStock: 25,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "Dell",
    images: [
      { url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80", file: "prod_dell32_1.webp" },
      { url: "https://images.unsplash.com/photo-1547119957-637f8679db1e?auto=format&fit=crop&w=600&q=80", file: "prod_dell32_2.webp" },
    ],
  },

  // 2. Fashion (5 products)
  {
    id: "prod_nike_jordan_hoodie",
    name: "Nike Jordan Brooklyn Fleece Men's Pullover Hoodie",
    slug: "nike-jordan-brooklyn-fleece-hoodie",
    sku: "NKE-JRD-HOOD-BLK",
    categoryId: "cat_fashion",
    price: 75.0,
    comparePrice: 90.0,
    costPrice: 42.0,
    currentStock: 65,
    warehouseId: "wh_nike_1",
    manufacturerId: "mfg_nike",
    brand: "Nike",
    images: [
      { url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80", file: "prod_jordan_1.webp" },
      { url: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=600&q=80", file: "prod_jordan_2.webp" },
    ],
  },
  {
    id: "prod_denim_jacket",
    name: "Classic Denim Trucker Jacket in Vintage Washed Blue",
    slug: "classic-denim-trucker-jacket",
    sku: "FSH-DNM-JCKT-BLU",
    categoryId: "cat_fashion",
    price: 110.0,
    comparePrice: 135.0,
    costPrice: 65.0,
    currentStock: 40,
    warehouseId: "wh_nike_2",
    manufacturerId: "mfg_nike",
    brand: "Levi's",
    images: [
      { url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80", file: "prod_denim_1.webp" },
      { url: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=600&q=80", file: "prod_denim_2.webp" },
    ],
  },
  {
    id: "prod_nike_af1",
    name: "Nike Air Force 1 '07 Leather Sneakers White",
    slug: "nike-air-force-1-07-white",
    sku: "NKE-AF1-07-WHT",
    categoryId: "cat_fashion",
    price: 115.0,
    comparePrice: 130.0,
    costPrice: 70.0,
    currentStock: 80,
    warehouseId: "wh_nike_1",
    manufacturerId: "mfg_nike",
    brand: "Nike",
    images: [
      { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", file: "prod_af1_1.webp" },
      { url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80", file: "prod_af1_2.webp" },
    ],
  },
  {
    id: "prod_oxford_shirt",
    name: "Men's Slim Fit Stretch Cotton Oxford Button-Down Shirt",
    slug: "mens-slim-fit-oxford-shirt",
    sku: "FSH-OXF-SHRT-WHT",
    categoryId: "cat_fashion",
    price: 55.0,
    comparePrice: 70.0,
    costPrice: 28.0,
    currentStock: 55,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "Ralph Lauren",
    images: [
      { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80", file: "prod_oxford_1.webp" },
      { url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80", file: "prod_oxford_2.webp" },
    ],
  },
  {
    id: "prod_chino_pants",
    name: "Tailored Fit Wool Blend Chino Trousers Charcoal",
    slug: "tailored-fit-chino-trousers-charcoal",
    sku: "FSH-CHNO-TRSR-CHR",
    categoryId: "cat_fashion",
    price: 85.0,
    comparePrice: 105.0,
    costPrice: 45.0,
    currentStock: 48,
    warehouseId: "wh_nike_2",
    manufacturerId: "mfg_nike",
    brand: "Banana Republic",
    images: [
      { url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80", file: "prod_chino_1.webp" },
      { url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80", file: "prod_chino_2.webp" },
    ],
  },

  // 3. Women's (5 products)
  {
    id: "prod_floral_wrap_dress",
    name: "Women's Floral Print Wrap Maxi Dress in Emerald",
    slug: "womens-floral-print-wrap-maxi-dress",
    sku: "WMN-FLR-WRAP-DRES",
    categoryId: "cat_womens",
    price: 95.0,
    comparePrice: 120.0,
    costPrice: 50.0,
    currentStock: 38,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "Zara",
    images: [
      { url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80", file: "prod_floral_1.webp" },
      { url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80", file: "prod_floral_2.webp" },
    ],
  },
  {
    id: "prod_cashmere_trench_coat",
    name: "Oversized Cashmere Blend Double-Breasted Trench Coat",
    slug: "oversized-cashmere-blend-trench-coat",
    sku: "WMN-TRNCH-COAT-CAM",
    categoryId: "cat_womens",
    price: 245.0,
    comparePrice: 295.0,
    costPrice: 140.0,
    currentStock: 22,
    warehouseId: "wh_nike_1",
    manufacturerId: "mfg_nike",
    brand: "Mango",
    images: [
      { url: "https://images.unsplash.com/photo-1539533018447-63fcce667823?auto=format&fit=crop&w=600&q=80", file: "prod_trench_1.webp" },
      { url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80", file: "prod_trench_2.webp" },
    ],
  },
  {
    id: "prod_wide_leg_trousers",
    name: "High-Waist Wide-Leg Pleated Tailored Trousers",
    slug: "high-waist-wide-leg-pleated-trousers",
    sku: "WMN-HIGH-PANTS-BEG",
    categoryId: "cat_womens",
    price: 78.0,
    comparePrice: 95.0,
    costPrice: 38.0,
    currentStock: 45,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "Massimo Dutti",
    images: [
      { url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80", file: "prod_widepants_1.webp" },
      { url: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=600&q=80", file: "prod_widepants_2.webp" },
    ],
  },
  {
    id: "prod_leather_crossbody_bag",
    name: "Italian Grain Leather Crossbody Saddle Handbag",
    slug: "italian-leather-crossbody-saddle-bag",
    sku: "WMN-LTHR-BAG-BRN",
    categoryId: "cat_womens",
    price: 185.0,
    comparePrice: 225.0,
    costPrice: 95.0,
    currentStock: 30,
    warehouseId: "wh_nike_2",
    manufacturerId: "mfg_nike",
    brand: "Coach",
    images: [
      { url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80", file: "prod_saddlebag_1.webp" },
      { url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80", file: "prod_saddlebag_2.webp" },
    ],
  },
  {
    id: "prod_mulberry_silk_blouse",
    name: "Pure Mulberry Silk Button-Down Long Sleeve Blouse",
    slug: "pure-mulberry-silk-button-down-blouse",
    sku: "WMN-SILK-BLOUSE-IVR",
    categoryId: "cat_womens",
    price: 125.0,
    comparePrice: 155.0,
    costPrice: 65.0,
    currentStock: 32,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "Lilysilk",
    images: [
      { url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80", file: "prod_silkblouse_1.webp" },
      { url: "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=600&q=80", file: "prod_silkblouse_2.webp" },
    ],
  },

  // 4. Kids' Fashion (5 products)
  {
    id: "prod_kids_hoodie_tracksuit",
    name: "Kids' Organic Cotton Graphic Hoodie & Jogger Tracksuit",
    slug: "kids-organic-cotton-hoodie-tracksuit",
    sku: "KID-ORG-TRACK-BLU",
    categoryId: "cat_kids_fashion",
    price: 49.0,
    comparePrice: 65.0,
    costPrice: 24.0,
    currentStock: 50,
    warehouseId: "wh_nike_1",
    manufacturerId: "mfg_nike",
    brand: "Nike Kids",
    images: [
      { url: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80", file: "prod_kidstrack_1.webp" },
      { url: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=600&q=80", file: "prod_kidstrack_2.webp" },
    ],
  },
  {
    id: "prod_kids_puffer_jacket",
    name: "Boys' Waterproof Colorblock Insulated Winter Puffer Jacket",
    slug: "boys-waterproof-winter-puffer-jacket",
    sku: "KID-BOY-PUFF-YEL",
    categoryId: "cat_kids_fashion",
    price: 79.0,
    comparePrice: 99.0,
    costPrice: 40.0,
    currentStock: 35,
    warehouseId: "wh_nike_2",
    manufacturerId: "mfg_nike",
    brand: "The North Face Kids",
    images: [
      { url: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=600&q=80", file: "prod_kidspuff_1.webp" },
      { url: "https://images.unsplash.com/photo-1471286174890-9c112ffca56a?auto=format&fit=crop&w=600&q=80", file: "prod_kidspuff_2.webp" },
    ],
  },
  {
    id: "prod_girls_tulle_dress",
    name: "Girls' Pastel Tulle Party Dress with Embroidered Bow",
    slug: "girls-pastel-tulle-party-dress",
    sku: "KID-GRL-DRES-PNK",
    categoryId: "cat_kids_fashion",
    price: 52.0,
    comparePrice: 68.0,
    costPrice: 26.0,
    currentStock: 42,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "H&M Kids",
    images: [
      { url: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80", file: "prod_tulledress_1.webp" },
      { url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80", file: "prod_tulledress_2.webp" },
    ],
  },
  {
    id: "prod_toddler_canvas_sneakers",
    name: "Toddlers' Slip-On Breathable Canvas Sneakers",
    slug: "toddlers-slip-on-canvas-sneakers",
    sku: "KID-CNVS-SNKR-RED",
    categoryId: "cat_kids_fashion",
    price: 38.0,
    comparePrice: 48.0,
    costPrice: 18.0,
    currentStock: 60,
    warehouseId: "wh_nike_1",
    manufacturerId: "mfg_nike",
    brand: "Vans Kids",
    images: [
      { url: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80", file: "prod_kidssneaker_1.webp" },
      { url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80", file: "prod_kidssneaker_2.webp" },
    ],
  },
  {
    id: "prod_kids_denim_dungarees",
    name: "Kids' Classic Denim Dungarees Adjustable Overalls",
    slug: "kids-classic-denim-dungarees-overalls",
    sku: "KID-DNM-DUNG-IND",
    categoryId: "cat_kids_fashion",
    price: 45.0,
    comparePrice: 58.0,
    costPrice: 22.0,
    currentStock: 48,
    warehouseId: "wh_nike_2",
    manufacturerId: "mfg_nike",
    brand: "Gap Kids",
    images: [
      { url: "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=600&q=80", file: "prod_dungarees_1.webp" },
      { url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80", file: "prod_dungarees_2.webp" },
    ],
  },

  // 5. Health & Beauty (5 products)
  {
    id: "prod_snail_mucin_essence",
    name: "Advanced Snail 96 Mucin Power Repairing Essence (100ml)",
    slug: "advanced-snail-96-mucin-essence",
    sku: "HLT-SNAL-ESNC-100",
    categoryId: "cat_health_beauty",
    price: 24.0,
    comparePrice: 30.0,
    costPrice: 12.0,
    currentStock: 90,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "COSRX",
    images: [
      { url: "https://images.unsplash.com/photo-1608248597359-bb436d400e95?auto=format&fit=crop&w=600&q=80", file: "prod_snail_1.webp" },
      { url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80", file: "prod_snail_2.webp" },
    ],
  },
  {
    id: "prod_vitaminc_serum",
    name: "Vitamin C 20% + Ferulic Brightening Facial Glow Serum",
    slug: "vitamin-c-20-ferulic-brightening-serum",
    sku: "HLT-VITC-SRUM-30M",
    categoryId: "cat_health_beauty",
    price: 32.0,
    comparePrice: 42.0,
    costPrice: 15.0,
    currentStock: 75,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "The Ordinary",
    images: [
      { url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80", file: "prod_vitc_1.webp" },
      { url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80", file: "prod_vitc_2.webp" },
    ],
  },
  {
    id: "prod_ceramide_barrier_cream",
    name: "Deep Hydration Ceramide & Hyaluronic Barrier Moisturizer",
    slug: "deep-hydration-ceramide-barrier-cream",
    sku: "HLT-CERM-MSTR-50G",
    categoryId: "cat_health_beauty",
    price: 28.0,
    comparePrice: 36.0,
    costPrice: 14.0,
    currentStock: 85,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "CeraVe",
    images: [
      { url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80", file: "prod_ceramide_1.webp" },
      { url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80", file: "prod_ceramide_2.webp" },
    ],
  },
  {
    id: "prod_argan_hair_oil",
    name: "Moroccan 100% Pure Organic Argan Oil Hair Treatment",
    slug: "moroccan-organic-argan-hair-oil",
    sku: "HLT-ARGN-HAIR-100",
    categoryId: "cat_health_beauty",
    price: 36.0,
    comparePrice: 45.0,
    costPrice: 18.0,
    currentStock: 65,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "Moroccanoil",
    images: [
      { url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80", file: "prod_argan_1.webp" },
      { url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80", file: "prod_argan_2.webp" },
    ],
  },
  {
    id: "prod_mineral_sunscreen_spf50",
    name: "Invisible Sheer Mineral Sunscreen SPF 50+ PA++++",
    slug: "invisible-sheer-mineral-sunscreen-spf50",
    sku: "HLT-MNRL-SUNS-50M",
    categoryId: "cat_health_beauty",
    price: 26.0,
    comparePrice: 34.0,
    costPrice: 13.0,
    currentStock: 95,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "La Roche-Posay",
    images: [
      { url: "https://images.unsplash.com/photo-1556228722-d0b719468925?auto=format&fit=crop&w=600&q=80", file: "prod_sunscreen_1.webp" },
      { url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80", file: "prod_sunscreen_2.webp" },
    ],
  },

  // 6. Pharmacy (5 products)
  {
    id: "prod_multivitamin_tabs",
    name: "Daily Essential Multivitamins & Minerals Complex (60 Tabs)",
    slug: "daily-essential-multivitamins-minerals-60tabs",
    sku: "PHR-MLTI-VITA-60T",
    categoryId: "cat_pharmacy",
    price: 22.0,
    comparePrice: 28.0,
    costPrice: 10.0,
    currentStock: 110,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "Centrum",
    images: [
      { url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80", file: "prod_multi_1.webp" },
      { url: "https://images.unsplash.com/photo-1576073719676-aa955fc6b889?auto=format&fit=crop&w=600&q=80", file: "prod_multi_2.webp" },
    ],
  },
  {
    id: "prod_omega3_fish_oil",
    name: "Triple Strength Wild Alaskan Omega-3 Fish Oil Softgels",
    slug: "triple-strength-wild-alaskan-omega-3",
    sku: "PHR-OMGA-FISH-120",
    categoryId: "cat_pharmacy",
    price: 34.0,
    comparePrice: 42.0,
    costPrice: 16.0,
    currentStock: 80,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "Nature's Bounty",
    images: [
      { url: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=600&q=80", file: "prod_omega_1.webp" },
      { url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80", file: "prod_omega_2.webp" },
    ],
  },
  {
    id: "prod_whey_isolate_vanilla",
    name: "100% Grass-Fed Whey Isolate Protein Powder Vanilla (1kg)",
    slug: "100-grass-fed-whey-isolate-vanilla-1kg",
    sku: "PHR-WHEY-ISOL-1KG",
    categoryId: "cat_pharmacy",
    price: 68.0,
    comparePrice: 82.0,
    costPrice: 38.0,
    currentStock: 50,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "Optimum Nutrition",
    images: [
      { url: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=600&q=80", file: "prod_whey_1.webp" },
      { url: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=600&q=80", file: "prod_whey_2.webp" },
    ],
  },
  {
    id: "prod_family_firstaid_kit",
    name: "All-in-One Family Emergency Medical First Aid Box (120 Pcs)",
    slug: "all-in-one-family-emergency-first-aid-kit",
    sku: "PHR-FRST-AID-120P",
    categoryId: "cat_pharmacy",
    price: 39.0,
    comparePrice: 49.0,
    costPrice: 20.0,
    currentStock: 65,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "Johnson & Johnson",
    images: [
      { url: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=600&q=80", file: "prod_firstaid_1.webp" },
      { url: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80", file: "prod_firstaid_2.webp" },
    ],
  },
  {
    id: "prod_vitaminc_effervescent",
    name: "Immune Defence Vitamin C 1000mg + Zinc Effervescent Tablets",
    slug: "vitamin-c-1000mg-zinc-effervescent-tablets",
    sku: "PHR-EFFR-VITC-20T",
    categoryId: "cat_pharmacy",
    price: 15.0,
    comparePrice: 19.0,
    costPrice: 7.0,
    currentStock: 120,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "Berocca",
    images: [
      { url: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=600&q=80", file: "prod_vitceff_1.webp" },
      { url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=600&q=80", file: "prod_vitceff_2.webp" },
    ],
  },

  // 7. Groceries (5 products)
  {
    id: "prod_himalayan_honey",
    name: "Raw Himalayan Wild Forest Honey (500g Glass Jar)",
    slug: "raw-himalayan-wild-forest-honey-500g",
    sku: "GRO-HMLY-HONY-500",
    categoryId: "cat_groceries",
    price: 18.0,
    comparePrice: 24.0,
    costPrice: 8.5,
    currentStock: 95,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "Organic India",
    images: [
      { url: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80", file: "prod_honey_1.webp" },
      { url: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=600&q=80", file: "prod_honey_2.webp" },
    ],
  },
  {
    id: "prod_evoo_olive_oil",
    name: "Cold-Pressed First Cold Extraction Extra Virgin Olive Oil (1L)",
    slug: "extra-virgin-olive-oil-cold-pressed-1l",
    sku: "GRO-EVOO-OLIV-1LTR",
    categoryId: "cat_groceries",
    price: 26.0,
    comparePrice: 32.0,
    costPrice: 14.0,
    currentStock: 75,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "Bertolli",
    images: [
      { url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80", file: "prod_olive_1.webp" },
      { url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80", file: "prod_olive_2.webp" },
    ],
  },
  {
    id: "prod_arabica_coffee_beans",
    name: "Artisanal Whole Bean Single Origin Arabica Espresso (1kg)",
    slug: "single-origin-arabica-coffee-beans-1kg",
    sku: "GRO-ARBC-COFF-1KG",
    categoryId: "cat_groceries",
    price: 32.0,
    comparePrice: 38.0,
    costPrice: 17.0,
    currentStock: 60,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "Lavazza",
    images: [
      { url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80", file: "prod_coffee_1.webp" },
      { url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80", file: "prod_coffee_2.webp" },
    ],
  },
  {
    id: "prod_medjool_dates",
    name: "Royal Medjool Jumbo Sweet Organic Dates Box (800g)",
    slug: "royal-medjool-jumbo-sweet-dates-800g",
    sku: "GRO-MDJL-DATE-800",
    categoryId: "cat_groceries",
    price: 21.0,
    comparePrice: 27.0,
    costPrice: 11.0,
    currentStock: 85,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "Bateel",
    images: [
      { url: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80", file: "prod_dates_1.webp" },
      { url: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=600&q=80", file: "prod_dates_2.webp" },
    ],
  },
  {
    id: "prod_roasted_almonds",
    name: "California Roasted & Lightly Salted Premium Almonds (500g)",
    slug: "california-roasted-salted-almonds-500g",
    sku: "GRO-ALMD-ROAS-500",
    categoryId: "cat_groceries",
    price: 16.0,
    comparePrice: 20.0,
    costPrice: 8.0,
    currentStock: 100,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "Blue Diamond",
    images: [
      { url: "https://images.unsplash.com/photo-1508061252966-f72fb98abc22?auto=format&fit=crop&w=600&q=80", file: "prod_almonds_1.webp" },
      { url: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=600&q=80", file: "prod_almonds_2.webp" },
    ],
  },

  // 8. Luxury Item (5 products)
  {
    id: "prod_swiss_watch",
    name: "Swiss Heritage Automatic Chronograph Stainless Steel Watch",
    slug: "swiss-heritage-automatic-chronograph-watch",
    sku: "LUX-SWIS-CHRN-WTCH",
    categoryId: "cat_luxury_item",
    price: 2450.0,
    comparePrice: 2800.0,
    costPrice: 1600.0,
    currentStock: 15,
    warehouseId: "wh_samsung_1",
    manufacturerId: "mfg_samsung",
    brand: "TAG Heuer",
    images: [
      { url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80", file: "prod_watch_1.webp" },
      { url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80", file: "prod_watch_2.webp" },
    ],
  },
  {
    id: "prod_leather_duffle_bag",
    name: "Italian Full Grain Vachetta Leather Weekender Duffle Bag",
    slug: "italian-full-grain-leather-weekender-bag",
    sku: "LUX-ITLN-DUFF-LEAT",
    categoryId: "cat_luxury_item",
    price: 680.0,
    comparePrice: 790.0,
    costPrice: 380.0,
    currentStock: 20,
    warehouseId: "wh_nike_1",
    manufacturerId: "mfg_nike",
    brand: "Bottega",
    images: [
      { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80", file: "prod_duffle_1.webp" },
      { url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80", file: "prod_duffle_2.webp" },
    ],
  },
  {
    id: "prod_18k_gold_necklace",
    name: "18K Solid Yellow Gold Beveled Cable Chain Necklace (5mm)",
    slug: "18k-solid-gold-beveled-cable-chain-necklace",
    sku: "LUX-18KG-GOLD-CHAI",
    categoryId: "cat_luxury_item",
    price: 1250.0,
    comparePrice: 1450.0,
    costPrice: 950.0,
    currentStock: 12,
    warehouseId: "wh_samsung_1",
    manufacturerId: "mfg_samsung",
    brand: "Tiffany & Co.",
    images: [
      { url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80", file: "prod_goldchain_1.webp" },
      { url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80", file: "prod_goldchain_2.webp" },
    ],
  },
  {
    id: "prod_titanium_sunglasses",
    name: "Handcrafted Polarized Titanium Aviator Sunglasses in Gold",
    slug: "handcrafted-polarized-titanium-aviator-sunglasses",
    sku: "LUX-TITN-AVTR-GOLD",
    categoryId: "cat_luxury_item",
    price: 360.0,
    comparePrice: 420.0,
    costPrice: 190.0,
    currentStock: 28,
    warehouseId: "wh_avery_1",
    manufacturerId: "mfg_avery",
    brand: "DITA",
    images: [
      { url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80", file: "prod_aviators_1.webp" },
      { url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80", file: "prod_aviators_2.webp" },
    ],
  },
  {
    id: "prod_mulberry_silk_scarf",
    name: "Pure Mulberry Jacquard Silk Monogram Embroidered Scarf",
    slug: "pure-mulberry-jacquard-silk-embroidered-scarf",
    sku: "LUX-SILK-SCRF-MONO",
    categoryId: "cat_luxury_item",
    price: 285.0,
    comparePrice: 340.0,
    costPrice: 130.0,
    currentStock: 24,
    warehouseId: "wh_nike_2",
    manufacturerId: "mfg_nike",
    brand: "Burberry",
    images: [
      { url: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=600&q=80", file: "prod_silkscarf_1.webp" },
      { url: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=600&q=80", file: "prod_silkscarf_2.webp" },
    ],
  },
];

async function run() {
  console.log("=== STARTING 8 CATEGORIES & PRODUCT SEEDING WITH LOCAL ASSETS ===");
  const dbPath = path.join(process.cwd(), "data", "local-db.json");
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

  if (!db.assets) db.assets = [];
  if (!db.categories) db.categories = [];
  if (!db.products) db.products = [];
  if (!db.productAssets) db.productAssets = [];
  if (!db.productCategories) db.productCategories = [];

  const assetMap = new Map();
  db.assets.forEach((a) => assetMap.set(a.id, a));

  // Helper to upsert asset
  function registerAsset(id, name, filename, url, size, mimeType = "image/webp") {
    let asset = assetMap.get(id);
    if (!asset) {
      asset = {
        id,
        name,
        fileName: filename,
        originalName: name,
        mimeType,
        size,
        url,
        thumbnailUrl: url,
        fileType: "IMAGE",
        altText: name,
        caption: name,
        folder: "catalog",
        tags: ["catalog", "product"],
        uploaderId: "admin",
        storageProvider: "local",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        productCount: 0,
      };
      db.assets.unshift(asset);
      assetMap.set(id, asset);
    } else {
      asset.url = url;
      asset.fileName = filename;
      asset.size = size;
      asset.mimeType = mimeType;
      asset.storageProvider = "local";
      asset.updatedAt = new Date().toISOString();
    }
    return asset;
  }

  // 1. Process 8 Categories
  console.log("\n1. Processing 8 Categories & Downloading Category Images locally...");
  const targetCategoryIds = new Set(CATEGORIES_DATA.map((c) => c.id));

  for (let i = 0; i < CATEGORIES_DATA.length; i++) {
    const cData = CATEGORIES_DATA[i];
    console.log(`- Downloading category image for "${cData.name}"...`);
    const downloaded = await saveImageLocally(cData.imageUrl, cData.imageFile);

    const assetId = `ast_cat_${cData.slug.replace(/[^a-z0-9]/g, "_")}`;
    registerAsset(assetId, `${cData.name} Category Banner`, downloaded.filename, downloaded.url, downloaded.size, downloaded.mimeType);

    let catIndex = db.categories.findIndex((c) => c.id === cData.id || c.slug === cData.slug);
    if (catIndex === -1) {
      db.categories.push({
        id: cData.id,
        name: cData.name,
        slug: cData.slug,
        description: cData.description,
        image: downloaded.url,
        parentId: null,
        level: 0,
        isActive: true,
        displayOrder: i + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        productCount: 5,
        children: [],
      });
    } else {
      db.categories[catIndex] = {
        ...db.categories[catIndex],
        id: cData.id,
        name: cData.name,
        slug: cData.slug,
        description: cData.description,
        image: downloaded.url,
        parentId: null,
        level: 0,
        isActive: true,
        displayOrder: i + 1,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  // Subordinate or keep existing subcategories under electronics/fashion cleanly
  db.categories.forEach((c) => {
    if (c.id === "cat_6avp2l850") {
      c.parentId = "cat_electronics";
      c.level = 1;
    }
    if (c.id === "cat_sneakers" || c.id === "cat_sportshoes") {
      c.parentId = "cat_fashion";
      c.level = 1;
    }
  });

  // Filter out unwanted redundant lowercase test categories like 'other', 'grocery' if they have 0 products
  db.categories = db.categories.filter((c) => {
    if (c.id === "cat_other" || c.id === "cat_grocery" || c.id === "cat_homedecor" || c.id === "cat_luxury") {
      return false; // cleaned up
    }
    return true;
  });

  console.log("Current active root categories in db:", db.categories.filter((c) => !c.parentId).map((c) => c.name));

  // 2. Process Products: 5 per category = 40 products, each with MULTIPLE images
  console.log("\n2. Processing 40 Products (5 per category) & Downloading Multiple Images locally...");

  for (const pData of PRODUCTS_DATA) {
    const pAssetIds = [];
    let primaryImageUrl = "";

    // Download multiple images for this product
    for (let imgIndex = 0; imgIndex < pData.images.length; imgIndex++) {
      const imgInfo = pData.images[imgIndex];
      const downloadedImg = await saveImageLocally(imgInfo.url, imgInfo.file);
      const assetId = `ast_${pData.id}_${imgIndex + 1}`;
      registerAsset(
        assetId,
        `${pData.name} - View ${imgIndex + 1}`,
        downloadedImg.filename,
        downloadedImg.url,
        downloadedImg.size,
        downloadedImg.mimeType
      );
      pAssetIds.push(assetId);

      if (imgIndex === 0) {
        primaryImageUrl = downloadedImg.url;
      }
    }

    // Upsert product in db.products
    let pIdx = db.products.findIndex((p) => p.id === pData.id || p.sku === pData.sku);
    const catObj = db.categories.find((c) => c.id === pData.categoryId);
    const catName = catObj ? catObj.name : "Catalog";

    const productRecord = {
      id: pData.id,
      name: pData.name,
      slug: pData.slug,
      sku: pData.sku,
      description: `${pData.name} with premium build, authentic warranty, and express fulfillment.`,
      price: pData.price,
      comparePrice: pData.comparePrice,
      costPrice: pData.costPrice,
      currentStock: pData.currentStock,
      minStock: 5,
      status: "ACTIVE",
      isSoldOut: false,
      brand: pData.brand,
      warehouseId: pData.warehouseId,
      warehouse: pData.warehouseId === "wh_samsung_1" ? "Samsung Silicon Valley Center" : pData.warehouseId === "wh_nike_1" ? "Nike Oregon Hub" : "Avery Dennison",
      manufacturerId: pData.manufacturerId,
      manufacturerName: pData.manufacturerId === "mfg_samsung" ? "Samsung Electronics" : pData.manufacturerId === "mfg_nike" ? "Nike Global Operations" : "Avery Dennison",
      categoryIds: [pData.categoryId],
      categoryNames: [catName],
      assetIds: pAssetIds,
      mainImage: primaryImageUrl,
      rating: 4.8,
      reviewsCount: 120,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (pIdx === -1) {
      db.products.push(productRecord);
    } else {
      db.products[pIdx] = {
        ...db.products[pIdx],
        ...productRecord,
      };
    }

    // Map in db.productCategories
    db.productCategories = db.productCategories.filter((pc) => pc.productId !== pData.id);
    db.productCategories.push({
      productId: pData.id,
      categoryId: pData.categoryId,
    });

    // Map in db.productAssets
    db.productAssets = db.productAssets.filter((pa) => pa.productId !== pData.id);
    pAssetIds.forEach((aId, idx) => {
      db.productAssets.push({
        productId: pData.id,
        assetId: aId,
        isPrimary: idx === 0,
      });
    });
  }

  // Ensure ONLY the 40 clean products are in the catalog so each of the 8 categories has exactly 5 products
  const activeProductIds = new Set(PRODUCTS_DATA.map((p) => p.id));
  db.products = db.products.filter((p) => activeProductIds.has(p.id));
  db.productCategories = db.productCategories.filter((pc) => activeProductIds.has(pc.productId));
  db.productAssets = db.productAssets.filter((pa) => activeProductIds.has(pa.productId));

  // Initialize and populate warehouse inventory for each product
  if (!Array.isArray(db.warehouseInventory)) db.warehouseInventory = [];
  db.warehouseInventory = db.warehouseInventory.filter((wi) => activeProductIds.has(wi.productId));
  for (const pData of PRODUCTS_DATA) {
    const invId = `winv_${pData.id}_${pData.warehouseId}`;
    const whName =
      pData.warehouseId === "wh_samsung_1"
        ? "Samsung Silicon Valley Center"
        : pData.warehouseId === "wh_nike_1"
        ? "Nike Oregon Hub"
        : "Avery Dennison";
    const existingInvIndex = db.warehouseInventory.findIndex(
      (wi) => wi.productId === pData.id && wi.warehouseId === pData.warehouseId
    );
    const invRecord = {
      id: invId,
      productId: pData.id,
      warehouseId: pData.warehouseId,
      productName: pData.name,
      productSku: pData.sku,
      warehouseName: whName,
      availableQuantity: pData.currentStock,
      reservedQuantity: 0,
      reorderLevel: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (existingInvIndex === -1) {
      db.warehouseInventory.push(invRecord);
    } else {
      db.warehouseInventory[existingInvIndex] = {
        ...db.warehouseInventory[existingInvIndex],
        ...invRecord,
      };
    }
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
  console.log("\n=== LOCAL DB SUCCESSFULLY UPDATED! ===");

  // Output stats
  console.log("Total Root Categories:", db.categories.filter((c) => !c.parentId).length);
  db.categories
    .filter((c) => !c.parentId)
    .forEach((cat) => {
      const pCount = db.productCategories.filter((pc) => pc.categoryId === cat.id).length;
      console.log(`- ${cat.name} (ID: ${cat.id}): ${pCount} products, image: ${cat.image}`);
    });
  console.log("Total Products in Catalog:", db.products.length);
  console.log("Total Assets in Library:", db.assets.length);
}

run().catch(console.error);
