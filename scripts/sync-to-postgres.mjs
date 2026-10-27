import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

async function sync() {
  console.log("Reading data/local-db.json...");
  const raw = await fs.readFile(path.join(process.cwd(), "data", "local-db.json"), "utf-8");
  const db = JSON.parse(raw);

  console.log(`Found in local-db.json:
- ${db.users?.length || 0} users
- ${db.categories?.length || 0} categories
- ${db.products?.length || 0} products
- ${db.assets?.length || 0} assets
- ${db.sliders?.length || 0} sliders
- ${db.menuItems?.length || 0} menu items
`);

  // 1. Sync Users
  console.log("Syncing users...");
  for (const u of db.users || []) {
    const roleValue = ["ADMIN", "MANAGER", "STAFF"].includes(u.role?.toUpperCase())
      ? u.role.toUpperCase()
      : "ADMIN";

    await prisma.user.upsert({
      where: { email: u.email.toLowerCase() },
      update: {
        name: u.name,
        role: roleValue,
        avatar: u.avatar || null,
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email.toLowerCase(),
        password: u.password || "$2a$10$w8TKnP5MszV7K30PknK65ecqQ.vO9nL86k1vP/o9n0bW0kYkH/06C",
        role: roleValue,
        avatar: u.avatar || null,
        createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
        updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
      },
    });
  }

  // 2. Sync Assets
  console.log("Syncing assets...");
  for (const a of db.assets || []) {
    const fileTypeVal = ["IMAGE", "VIDEO", "DOCUMENT", "AUDIO", "OTHER"].includes(a.fileType?.toUpperCase())
      ? a.fileType.toUpperCase()
      : "IMAGE";

    await prisma.asset.upsert({
      where: { id: a.id },
      update: {
        name: a.name,
        fileName: a.fileName || a.name,
        originalName: a.originalName || a.name,
        mimeType: a.mimeType || "image/jpeg",
        size: a.size || 0,
        url: a.url,
        fileType: fileTypeVal,
      },
      create: {
        id: a.id,
        name: a.name,
        fileName: a.fileName || a.name,
        originalName: a.originalName || a.name,
        mimeType: a.mimeType || "image/jpeg",
        size: a.size || 0,
        url: a.url,
        fileType: fileTypeVal,
        altText: a.altText || null,
        caption: a.caption || null,
        folder: a.folder || "default",
        tags: a.tags || [],
        createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
        updatedAt: a.updatedAt ? new Date(a.updatedAt) : new Date(),
      },
    });
  }

  // 3. Sync Categories (handle parents first, level 0 then level 1 then level 2)
  console.log("Syncing categories...");
  const sortedCategories = [...(db.categories || [])].sort((a, b) => (a.level || 0) - (b.level || 0));
  for (const c of sortedCategories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        description: c.description || null,
        image: c.image || null,
        level: typeof c.level === "number" ? c.level : 0,
        isActive: c.isActive !== false,
        displayOrder: c.displayOrder || 0,
      },
      create: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || null,
        image: c.image || null,
        parentId: c.parentId || null,
        level: typeof c.level === "number" ? c.level : 0,
        isActive: c.isActive !== false,
        displayOrder: c.displayOrder || 0,
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      },
    });
  }

  // 4. Sync Products
  console.log("Syncing products...");
  for (const p of db.products || []) {
    const statusVal = ["ACTIVE", "DRAFT", "ARCHIVED"].includes(p.status?.toUpperCase())
      ? p.status.toUpperCase()
      : "ACTIVE";

    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        price: Number(p.price) || 0,
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        currentStock: p.currentStock || 0,
        status: statusVal,
        mainImage: p.mainImage || null,
        rating: p.rating ? Number(p.rating) : null,
        reviewsCount: p.reviewsCount ? Number(p.reviewsCount) : 0,
        brand: p.brand || null,
      },
      create: {
        id: p.id,
        sku: p.sku,
        upc: p.upc || null,
        name: p.name,
        slug: p.slug,
        description: p.description || null,
        price: Number(p.price) || 0,
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        costPrice: p.costPrice ? Number(p.costPrice) : null,
        currentStock: p.currentStock || 0,
        minStock: p.minStock || 0,
        warehouse: p.warehouse || "gyanwarehouse",
        status: statusVal,
        isSoldOut: Boolean(p.isSoldOut),
        brand: p.brand || null,
        rating: p.rating ? Number(p.rating) : null,
        reviewsCount: p.reviewsCount ? Number(p.reviewsCount) : 0,
        mainImage: p.mainImage || null,
        googleMerchantSync: Boolean(p.googleMerchantSync),
        googleCategory: p.googleCategory || null,
        googleCondition: p.googleCondition || "new",
        googleBrand: p.googleBrand || null,
        googleGtin: p.googleGtin || null,
        googleMpn: p.googleMpn || null,
        googleSyncStatus: p.googleSyncStatus || "READY",
        googleLastSyncedAt: p.googleLastSyncedAt ? new Date(p.googleLastSyncedAt) : null,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      },
    });
  }

  // 5. Sync Sliders
  if (prisma.slider) {
    console.log("Syncing sliders...");
    for (const s of db.sliders || []) {
      await prisma.slider.upsert({
        where: { id: s.id },
        update: {
          title: s.title,
          subtitle: s.subtitle || null,
          description: s.description || null,
          badge: s.badge || null,
          tag: s.tag || null,
          buttonText: s.buttonText || "Shop Now",
          buttonLink: s.buttonLink || "/#deals",
          imageUrl: s.imageUrl || null,
          bgGradient: s.bgGradient || null,
          textColor: s.textColor || null,
          position: s.position || "main",
          displayOrder: s.displayOrder || 1,
          isActive: s.isActive !== false,
        },
        create: {
          id: s.id,
          title: s.title,
          subtitle: s.subtitle || null,
          description: s.description || null,
          badge: s.badge || null,
          tag: s.tag || null,
          buttonText: s.buttonText || "Shop Now",
          buttonLink: s.buttonLink || "/#deals",
          imageUrl: s.imageUrl || null,
          bgGradient: s.bgGradient || null,
          textColor: s.textColor || null,
          position: s.position || "main",
          displayOrder: s.displayOrder || 1,
          isActive: s.isActive !== false,
          createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
          updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date(),
        },
      });
    }
  }

  // 6. Sync Menu Items
  if (prisma.menuItem) {
    console.log("Syncing menu items...");
    for (const m of db.menuItems || []) {
      await prisma.menuItem.upsert({
        where: { id: m.id },
        update: {
          label: m.label,
          url: m.url,
          icon: m.icon || null,
          badge: m.badge || null,
          displayOrder: m.displayOrder || 1,
          isActive: m.isActive !== false,
          isHighlight: Boolean(m.isHighlight),
        },
        create: {
          id: m.id,
          label: m.label,
          url: m.url,
          icon: m.icon || null,
          badge: m.badge || null,
          displayOrder: m.displayOrder || 1,
          isActive: m.isActive !== false,
          isHighlight: Boolean(m.isHighlight),
          createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
          updatedAt: m.updatedAt ? new Date(m.updatedAt) : new Date(),
        },
      });
    }
  }

  // 7. Sync Product Assets
  console.log("Syncing product assets...");
  for (const pa of db.productAssets || []) {
    try {
      await prisma.productAsset.upsert({
        where: {
          productId_assetId: {
            productId: pa.productId,
            assetId: pa.assetId,
          },
        },
        update: {
          isPrimary: Boolean(pa.isPrimary),
          displayOrder: pa.displayOrder || 0,
        },
        create: {
          productId: pa.productId,
          assetId: pa.assetId,
          isPrimary: Boolean(pa.isPrimary),
          displayOrder: pa.displayOrder || 0,
        },
      });
    } catch {}
  }

  console.log("✅ Successfully synced all records to PostgreSQL!");
}

sync()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
