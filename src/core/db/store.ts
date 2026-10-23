import fs from "fs/promises";
import path from "path";
import os from "os";
import { prisma } from "./prisma";
import { AssetType } from "../storage/file-storage";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "MANAGER" | "STAFF";
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssetRecord {
  id: string;
  name: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string | null;
  fileType: AssetType;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  altText?: string | null;
  caption?: string | null;
  folder?: string | null;
  tags: string[];
  uploaderId?: string | null;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
}

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  level: number; // 0: Root, 1: Subcategory, 2: Sub-subcategory
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  productCount?: number; // TP: X
  children?: CategoryRecord[];
}

export interface ProductRecord {
  id: string;
  sku: string;
  upc?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  comparePrice?: number | null;
  costPrice?: number | null;
  currentStock: number;
  minStock: number;
  warehouse?: string | null;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  isSoldOut: boolean;
  brand?: string | null;

  // Google Merchant Center Integration
  googleMerchantSync: boolean;
  googleCategory?: string | null;
  googleCondition?: string | null;
  googleBrand?: string | null;
  googleGtin?: string | null;
  googleMpn?: string | null;
  googleSyncStatus?: "READY" | "SYNCED" | "FAILED";
  googleLastSyncedAt?: string | null;

  createdAt: string;
  updatedAt: string;

  // Populated relations
  categoryIds?: string[];
  categoryNames?: string[];
  assetIds?: string[];
  mainImage?: string | null;
  assets?: { id: string; url: string; name: string; isPrimary: boolean }[];
}

interface LocalDatabaseSchema {
  users: UserRecord[];
  assets: AssetRecord[];
  categories: CategoryRecord[];
  products: ProductRecord[];
  productCategories: { productId: string; categoryId: string; isMain: boolean }[];
  productAssets: { productId: string; assetId: string; isPrimary: boolean; displayOrder?: number }[];
}

export class DatabaseStore {
  private static localDbFile = path.join(process.cwd(), "data", "local-db.json");
  private static isPgAvailable: boolean | null = null;
  private static checkedPg = false;
  private static memoryCache: LocalDatabaseSchema | null = null;

  private static getResolvedDbPath(): string {
    return this.localDbFile;
  }

  private static async testPostgres(): Promise<boolean> {
    if (this.checkedPg && this.isPgAvailable !== null) {
      return this.isPgAvailable;
    }
    try {
      await prisma.$queryRaw`SELECT 1`;
      this.isPgAvailable = true;
    } catch {
      this.isPgAvailable = false;
    }
    this.checkedPg = true;
    return this.isPgAvailable;
  }

  private static async readLocalDb(): Promise<LocalDatabaseSchema> {
    if (this.memoryCache) {
      return this.memoryCache;
    }

    // Try reading primary data/local-db.json
    try {
      const data = await fs.readFile(this.localDbFile, "utf-8");
      const parsed = JSON.parse(data);
      this.memoryCache = {
        users: parsed.users || [],
        assets: parsed.assets || [],
        categories: parsed.categories || [],
        products: parsed.products || [],
        productCategories: parsed.productCategories || [],
        productAssets: parsed.productAssets || [],
      };
      return this.memoryCache;
    } catch {
      // Try temp dir fallback if primary failed
      try {
        const tmpFile = path.join(os.tmpdir(), "ecommerce-local-db.json");
        const data = await fs.readFile(tmpFile, "utf-8");
        const parsed = JSON.parse(data);
        this.memoryCache = {
          users: parsed.users || [],
          assets: parsed.assets || [],
          categories: parsed.categories || [],
          products: parsed.products || [],
          productCategories: parsed.productCategories || [],
          productAssets: parsed.productAssets || [],
        };
        return this.memoryCache;
      } catch {
        // Fallback to initial empty or seed state in memory
        const initial: LocalDatabaseSchema = {
          users: [],
          assets: [],
          categories: [],
          products: [],
          productCategories: [],
          productAssets: [],
        };
        this.memoryCache = initial;
        await this.writeLocalDb(initial);
        return initial;
      }
    }
  }

  private static async writeLocalDb(data: LocalDatabaseSchema): Promise<void> {
    this.memoryCache = data;

    // 1. Try writing to primary cwd data folder
    try {
      await fs.mkdir(path.dirname(this.localDbFile), { recursive: true });
      await fs.writeFile(this.localDbFile, JSON.stringify(data, null, 2), "utf-8");
      return;
    } catch {
      // If permission denied in Docker container, fallback to /tmp
      try {
        const tmpFile = path.join(os.tmpdir(), "ecommerce-local-db.json");
        await fs.writeFile(tmpFile, JSON.stringify(data, null, 2), "utf-8");
      } catch {
        // Kept in memoryCache safely
      }
    }
  }

  // ================= USERS =================

  public static async findUserByEmail(email: string): Promise<UserRecord | null> {
    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const u = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!u) return null;
        return {
          ...u,
          createdAt: u.createdAt.toISOString(),
          updatedAt: u.updatedAt.toISOString(),
        };
      } catch {
        // Fall back
      }
    }
    const db = await this.readLocalDb();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public static async findUserById(id: string): Promise<UserRecord | null> {
    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const u = await prisma.user.findUnique({ where: { id } });
        if (!u) return null;
        return {
          ...u,
          createdAt: u.createdAt.toISOString(),
          updatedAt: u.updatedAt.toISOString(),
        };
      } catch {
        // Fall back
      }
    }
    const db = await this.readLocalDb();
    return db.users.find((u) => u.id === id) || null;
  }

  public static async createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: "ADMIN" | "MANAGER" | "STAFF";
  }): Promise<UserRecord> {
    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const created = await prisma.user.create({
          data: {
            name: data.name,
            email: data.email.toLowerCase(),
            password: data.password,
            role: data.role || "ADMIN",
          },
        });
        return {
          ...created,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        };
      } catch {
        // fall back
      }
    }

    const db = await this.readLocalDb();
    const newUser: UserRecord = {
      id: "usr_" + Math.random().toString(36).substring(2, 11),
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      role: data.role || "ADMIN",
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    await this.writeLocalDb(db);
    return newUser;
  }

  // ================= ASSETS =================

  public static async findAssets(params: {
    search?: string;
    fileType?: string;
    folder?: string;
    sort?: "recent" | "oldest" | "name_asc" | "name_desc" | "size_desc";
    page?: number;
    pageSize?: number;
  }): Promise<{ items: AssetRecord[]; total: number }> {
    const { search = "", fileType = "all", sort = "recent", page = 1, pageSize = 24 } = params;

    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const where: Record<string, unknown> = {};
        if (fileType && fileType !== "all") {
          where.fileType = fileType.toUpperCase();
        }
        if (search) {
          where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { originalName: { contains: search, mode: "insensitive" } },
          ];
        }

        let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
        if (sort === "oldest") orderBy = { createdAt: "asc" };
        else if (sort === "name_asc") orderBy = { name: "asc" };
        else if (sort === "name_desc") orderBy = { name: "desc" };
        else if (sort === "size_desc") orderBy = { size: "desc" };

        const [items, total] = await Promise.all([
          prisma.asset.findMany({
            where,
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
              productAssets: { select: { id: true } },
            },
          }),
          prisma.asset.count({ where }),
        ]);

        return {
          items: items.map((a) => ({
            ...a,
            fileType: a.fileType as AssetType,
            createdAt: a.createdAt.toISOString(),
            updatedAt: a.updatedAt.toISOString(),
            productCount: a.productAssets.length,
          })),
          total,
        };
      } catch {
        // Fall back
      }
    }

    const db = await this.readLocalDb();
    let filtered = [...db.assets];

    if (fileType && fileType !== "all") {
      filtered = filtered.filter((a) => a.fileType.toLowerCase() === fileType.toLowerCase());
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.originalName.toLowerCase().includes(q) ||
          a.fileName.toLowerCase().includes(q)
      );
    }

    if (sort === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === "name_asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "name_desc") {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sort === "size_desc") {
      filtered.sort((a, b) => b.size - a.size);
    }

    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    return {
      items: paginated.map((item) => ({
        ...item,
        productCount: db.productAssets.filter((pa) => pa.assetId === item.id).length,
      })),
      total,
    };
  }

  public static async findAssetById(id: string): Promise<AssetRecord | null> {
    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const item = await prisma.asset.findUnique({
          where: { id },
          include: { productAssets: { select: { id: true, productId: true } } },
        });
        if (!item) return null;
        return {
          ...item,
          fileType: item.fileType as AssetType,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
          productCount: item.productAssets.length,
        };
      } catch {
        // fall back
      }
    }

    const db = await this.readLocalDb();
    const item = db.assets.find((a) => a.id === id);
    if (!item) return null;
    return {
      ...item,
      productCount: db.productAssets.filter((pa) => pa.assetId === id).length,
    };
  }

  public static async createAsset(data: {
    name: string;
    fileName: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    fileType: AssetType;
    thumbnailUrl?: string;
    altText?: string;
    caption?: string;
    uploaderId?: string;
    tags?: string[];
  }): Promise<AssetRecord> {
    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const created = await prisma.asset.create({
          data: {
            name: data.name,
            fileName: data.fileName,
            originalName: data.originalName,
            mimeType: data.mimeType,
            size: data.size,
            url: data.url,
            fileType: data.fileType,
            thumbnailUrl: data.thumbnailUrl,
            altText: data.altText,
            caption: data.caption,
            uploaderId: data.uploaderId,
            tags: data.tags || [],
          },
        });
        return {
          ...created,
          fileType: created.fileType as AssetType,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
          productCount: 0,
        };
      } catch {
        // fall back
      }
    }

    const db = await this.readLocalDb();
    const newAsset: AssetRecord = {
      id: "ast_" + Math.random().toString(36).substring(2, 11),
      name: data.name,
      fileName: data.fileName,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
      url: data.url,
      thumbnailUrl: data.thumbnailUrl || null,
      fileType: data.fileType,
      altText: data.altText || null,
      caption: data.caption || null,
      folder: "default",
      tags: data.tags || [],
      uploaderId: data.uploaderId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      productCount: 0,
    };

    db.assets.unshift(newAsset);
    await this.writeLocalDb(db);
    return newAsset;
  }

  public static async updateAsset(
    id: string,
    data: Partial<Pick<AssetRecord, "name" | "altText" | "caption" | "tags">>
  ): Promise<AssetRecord | null> {
    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const updated = await prisma.asset.update({
          where: { id },
          data: {
            name: data.name,
            altText: data.altText,
            caption: data.caption,
            tags: data.tags,
          },
        });
        return {
          ...updated,
          fileType: updated.fileType as AssetType,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        };
      } catch {
        // fall back
      }
    }

    const db = await this.readLocalDb();
    const index = db.assets.findIndex((a) => a.id === id);
    if (index === -1) return null;

    db.assets[index] = {
      ...db.assets[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await this.writeLocalDb(db);
    return db.assets[index];
  }

  public static async deleteAsset(id: string): Promise<AssetRecord | null> {
    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const item = await prisma.asset.delete({ where: { id } });
        return {
          ...item,
          fileType: item.fileType as AssetType,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        };
      } catch {
        // fall back
      }
    }

    const db = await this.readLocalDb();
    const index = db.assets.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const [deleted] = db.assets.splice(index, 1);
    db.productAssets = db.productAssets.filter((pa) => pa.assetId !== id);
    await this.writeLocalDb(db);
    return deleted;
  }

  public static async deleteManyAssets(ids: string[]): Promise<number> {
    if (!ids.length) return 0;
    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const res = await prisma.asset.deleteMany({
          where: { id: { in: ids } },
        });
        return res.count;
      } catch {
        // fall back
      }
    }

    const db = await this.readLocalDb();
    const countBefore = db.assets.length;
    db.assets = db.assets.filter((a) => !ids.includes(a.id));
    db.productAssets = db.productAssets.filter((pa) => !ids.includes(pa.assetId));
    await this.writeLocalDb(db);
    return countBefore - db.assets.length;
  }

  // ================= CATEGORIES (Hierarchical: Category > Subcategory > Subcategory) =================

  public static async findCategories(search?: string): Promise<CategoryRecord[]> {
    await this.seedInitialData();
    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const items = await prisma.category.findMany({
          where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
          orderBy: [{ level: "asc" }, { displayOrder: "asc" }, { name: "asc" }],
          include: {
            productCategories: { select: { id: true } },
          },
        });
        return items.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
          productCount: c.productCategories.length,
        }));
      } catch {
        // fall back
      }
    }

    const db = await this.readLocalDb();
    let list = [...(db.categories || [])];

    if (search?.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }

    return list.map((c) => {
      const count = (db.productCategories || []).filter((pc) => pc.categoryId === c.id).length;
      return {
        ...c,
        productCount: count,
      };
    });
  }

  public static async findCategoryTree(search?: string): Promise<CategoryRecord[]> {
    const flat = await this.findCategories(search);
    if (search?.trim()) return flat; // Flattened when actively searching

    const roots: CategoryRecord[] = [];
    const map = new Map<string, CategoryRecord>();

    flat.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    map.forEach((cat) => {
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId)!.children!.push(cat);
      } else {
        roots.push(cat);
      }
    });

    return roots;
  }

  public static async createCategory(data: {
    name: string;
    description?: string;
    parentId?: string | null;
  }): Promise<CategoryRecord> {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + "-" + Date.now().toString(36);

    let level = 0;
    if (data.parentId) {
      const parent = await this.findCategoryById(data.parentId);
      if (parent) {
        level = Math.min(2, (parent.level || 0) + 1);
      }
    }

    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const created = await prisma.category.create({
          data: {
            name: data.name,
            slug,
            description: data.description,
            parentId: data.parentId || null,
            level,
          },
        });
        return {
          ...created,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
          productCount: 0,
        };
      } catch {
        // fall back
      }
    }

    const db = await this.readLocalDb();
    const newCategory: CategoryRecord = {
      id: "cat_" + Math.random().toString(36).substring(2, 11),
      name: data.name,
      slug,
      description: data.description || null,
      parentId: data.parentId || null,
      level,
      isActive: true,
      displayOrder: (db.categories || []).length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      productCount: 0,
      children: [],
    };

    if (!db.categories) db.categories = [];
    db.categories.push(newCategory);
    await this.writeLocalDb(db);
    return newCategory;
  }

  public static async findCategoryById(id: string): Promise<CategoryRecord | null> {
    const db = await this.readLocalDb();
    return (db.categories || []).find((c) => c.id === id) || null;
  }

  public static async updateCategory(
    id: string,
    data: Partial<Pick<CategoryRecord, "name" | "description" | "parentId" | "isActive">>
  ): Promise<CategoryRecord | null> {
    const db = await this.readLocalDb();
    const idx = (db.categories || []).findIndex((c) => c.id === id);
    if (idx === -1) return null;

    let level = db.categories[idx].level;
    if (data.parentId !== undefined) {
      if (data.parentId) {
        const parent = db.categories.find((c) => c.id === data.parentId);
        level = parent ? Math.min(2, parent.level + 1) : 0;
      } else {
        level = 0;
      }
    }

    db.categories[idx] = {
      ...db.categories[idx],
      ...data,
      level,
      updatedAt: new Date().toISOString(),
    };

    await this.writeLocalDb(db);
    return db.categories[idx];
  }

  public static async deleteCategory(id: string): Promise<boolean> {
    const db = await this.readLocalDb();
    if (!db.categories) return false;

    // Remove category and child subcategories recursively
    const idsToRemove = new Set<string>([id]);
    let addedMore = true;
    while (addedMore) {
      addedMore = false;
      db.categories.forEach((c) => {
        if (c.parentId && idsToRemove.has(c.parentId) && !idsToRemove.has(c.id)) {
          idsToRemove.add(c.id);
          addedMore = true;
        }
      });
    }

    db.categories = db.categories.filter((c) => !idsToRemove.has(c.id));
    db.productCategories = (db.productCategories || []).filter((pc) => !idsToRemove.has(pc.categoryId));

    await this.writeLocalDb(db);
    return true;
  }

  // ================= PRODUCTS (With Google Merchant & Asset Links) =================

  public static async findProducts(params: {
    search?: string;
    categoryId?: string;
    status?: string;
    warehouse?: string;
  } = {}): Promise<ProductRecord[]> {
    await this.seedInitialData();
    const { search = "", categoryId, status, warehouse } = params;

    const db = await this.readLocalDb();
    let list = [...(db.products || [])];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.upc && p.upc.toLowerCase().includes(q))
      );
    }

    if (status && status !== "All") {
      list = list.filter((p) => p.status.toLowerCase() === status.toLowerCase());
    }

    if (warehouse && warehouse !== "all") {
      list = list.filter((p) => p.warehouse === warehouse);
    }

    if (categoryId && categoryId !== "all") {
      const matchingProductIds = new Set(
        (db.productCategories || [])
          .filter((pc) => pc.categoryId === categoryId)
          .map((pc) => pc.productId)
      );
      list = list.filter((p) => matchingProductIds.has(p.id));
    }

    // Populate relations (Categories, Assets, Main Image)
    const categoryMap = new Map((db.categories || []).map((c) => [c.id, c.name]));
    const assetMap = new Map((db.assets || []).map((a) => [a.id, a]));

    return list.map((p) => {
      // Find attached categories
      const pCatLinks = (db.productCategories || []).filter((pc) => pc.productId === p.id);
      const catIds = pCatLinks.map((pc) => pc.categoryId);
      const catNames = catIds.map((cid) => categoryMap.get(cid) || cid);

      // Find attached assets
      const pAssetLinks = (db.productAssets || []).filter((pa) => pa.productId === p.id);
      const pAssets = pAssetLinks
        .map((pa) => {
          const a = assetMap.get(pa.assetId);
          if (!a) return null;
          return {
            id: a.id,
            url: a.url,
            name: a.name,
            isPrimary: Boolean(pa.isPrimary),
          };
        })
        .filter(Boolean) as { id: string; url: string; name: string; isPrimary: boolean }[];

      const primaryAsset = pAssets.find((a) => a.isPrimary) || pAssets[0];

      return {
        ...p,
        categoryIds: catIds,
        categoryNames: catNames.length > 0 ? catNames : ["other"],
        assetIds: pAssetLinks.map((pa) => pa.assetId),
        assets: pAssets,
        mainImage: primaryAsset ? primaryAsset.url : null,
      };
    });
  }

  public static async findProductById(id: string): Promise<ProductRecord | null> {
    const products = await this.findProducts();
    return products.find((p) => p.id === id) || null;
  }

  public static async createProduct(data: {
    sku: string;
    upc?: string;
    name: string;
    description?: string;
    price: number;
    comparePrice?: number;
    costPrice?: number;
    currentStock?: number;
    minStock?: number;
    warehouse?: string;
    status?: "ACTIVE" | "DRAFT" | "ARCHIVED";
    brand?: string;
    categoryIds?: string[];
    assetIds?: string[];
    primaryAssetId?: string;

    // Google Merchant Fields
    googleMerchantSync?: boolean;
    googleCategory?: string;
    googleCondition?: string;
    googleBrand?: string;
    googleGtin?: string;
    googleMpn?: string;
  }): Promise<ProductRecord> {
    const db = await this.readLocalDb();
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);

    const newProd: ProductRecord = {
      id: "prod_" + Math.random().toString(36).substring(2, 11),
      sku: data.sku,
      upc: data.upc || null,
      name: data.name,
      slug,
      description: data.description || null,
      price: Number(data.price) || 0,
      comparePrice: data.comparePrice ? Number(data.comparePrice) : null,
      costPrice: data.costPrice ? Number(data.costPrice) : null,
      currentStock: data.currentStock !== undefined ? Number(data.currentStock) : 10,
      minStock: data.minStock !== undefined ? Number(data.minStock) : 5,
      warehouse: data.warehouse || "gyanwarehouse",
      status: data.status || "ACTIVE",
      isSoldOut: Number(data.currentStock) === 0,
      brand: data.brand || null,

      googleMerchantSync: Boolean(data.googleMerchantSync),
      googleCategory: data.googleCategory || null,
      googleCondition: data.googleCondition || "new",
      googleBrand: data.googleBrand || data.brand || null,
      googleGtin: data.googleGtin || data.upc || null,
      googleMpn: data.googleMpn || data.sku || null,
      googleSyncStatus: data.googleMerchantSync ? "READY" : undefined,
      googleLastSyncedAt: data.googleMerchantSync ? new Date().toISOString() : null,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!db.products) db.products = [];
    db.products.unshift(newProd);

    // Link Categories
    if (data.categoryIds && data.categoryIds.length) {
      if (!db.productCategories) db.productCategories = [];
      data.categoryIds.forEach((catId, idx) => {
        db.productCategories.push({
          productId: newProd.id,
          categoryId: catId,
          isMain: idx === 0,
        });
      });
    }

    // Link Assets
    if (data.assetIds && data.assetIds.length) {
      if (!db.productAssets) db.productAssets = [];
      data.assetIds.forEach((astId) => {
        db.productAssets.push({
          productId: newProd.id,
          assetId: astId,
          isPrimary: astId === data.primaryAssetId || (!data.primaryAssetId && astId === data.assetIds![0]),
        });
      });
    }

    await this.writeLocalDb(db);
    return (await this.findProductById(newProd.id))!;
  }

  public static async updateProduct(
    id: string,
    data: Partial<ProductRecord> & {
      categoryIds?: string[];
      assetIds?: string[];
      primaryAssetId?: string;
    }
  ): Promise<ProductRecord | null> {
    const db = await this.readLocalDb();
    const idx = (db.products || []).findIndex((p) => p.id === id);
    if (idx === -1) return null;

    db.products[idx] = {
      ...db.products[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // Update categories
    if (data.categoryIds !== undefined) {
      db.productCategories = (db.productCategories || []).filter((pc) => pc.productId !== id);
      data.categoryIds.forEach((catId, i) => {
        db.productCategories.push({
          productId: id,
          categoryId: catId,
          isMain: i === 0,
        });
      });
    }

    // Update assets
    if (data.assetIds !== undefined) {
      db.productAssets = (db.productAssets || []).filter((pa) => pa.productId !== id);
      data.assetIds.forEach((astId) => {
        db.productAssets.push({
          productId: id,
          assetId: astId,
          isPrimary: astId === data.primaryAssetId || (!data.primaryAssetId && astId === data.assetIds![0]),
        });
      });
    }

    await this.writeLocalDb(db);
    return this.findProductById(id);
  }

  public static async deleteProduct(id: string): Promise<boolean> {
    const db = await this.readLocalDb();
    if (!db.products) return false;

    db.products = db.products.filter((p) => p.id !== id);
    db.productCategories = (db.productCategories || []).filter((pc) => pc.productId !== id);
    db.productAssets = (db.productAssets || []).filter((pa) => pa.productId !== id);

    await this.writeLocalDb(db);
    return true;
  }

  // ================= GOOGLE MERCHANT FEED GENERATOR =================

  public static async generateGoogleMerchantFeed(): Promise<{
    title: string;
    link: string;
    items: Array<{
      id: string;
      title: string;
      description: string;
      link: string;
      image_link: string;
      availability: string;
      price: string;
      google_product_category: string;
      brand: string;
      gtin: string;
      mpn: string;
      condition: string;
    }>;
  }> {
    const products = await this.findProducts();
    const syncable = products.filter((p) => p.googleMerchantSync);

    return {
      title: "Tagateway Google Merchant Product Feed",
      link: "https://tag31.tagateway.com",
      items: syncable.map((p) => ({
        id: p.sku,
        title: p.name,
        description: p.description || p.name,
        link: `https://tag31.tagateway.com/product/${p.slug}`,
        image_link: p.mainImage || "https://tag31.tagateway.com/uploads/photo.jpeg",
        availability: p.currentStock > 0 && !p.isSoldOut ? "in_stock" : "out_of_stock",
        price: `${p.price.toFixed(2)} USD`,
        google_product_category: p.googleCategory || "Apparel & Accessories > Clothing",
        brand: p.googleBrand || p.brand || "Tagateway",
        gtin: p.googleGtin || p.upc || "",
        mpn: p.googleMpn || p.sku,
        condition: p.googleCondition || "new",
      })),
    };
  }

  // ================= INITIAL SEED DATA (Matches user screenshots!) =================

  public static async seedInitialData(): Promise<void> {
    const db = await this.readLocalDb();

    // 1. Seed Categories matching Image 3 if empty
    if (!db.categories || db.categories.length === 0) {
      db.categories = [
        {
          id: "cat_root_1",
          name: "yatdfya wdyawcd yatwdc aywdcw aywtdca wydtacwd ...",
          slug: "yatdfya-root",
          level: 0,
          isActive: true,
          displayOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "cat_root_us1",
          name: "us1",
          slug: "us1",
          level: 0,
          isActive: true,
          displayOrder: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "cat_sub_laptops",
          name: "laptops",
          slug: "us1-laptops",
          parentId: "cat_root_us1",
          level: 1,
          isActive: true,
          displayOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "cat_sub_gaming_laptops",
          name: "gaming-laptops",
          slug: "us1-laptops-gaming",
          parentId: "cat_sub_laptops",
          level: 2,
          isActive: true,
          displayOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "cat_root_uk1",
          name: "uk1",
          slug: "uk1",
          level: 0,
          isActive: true,
          displayOrder: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "cat_root_microsoft",
          name: "microsoft",
          slug: "microsoft",
          level: 0,
          isActive: true,
          displayOrder: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "cat_root_multisite",
          name: "multisite",
          slug: "multisite",
          level: 0,
          isActive: true,
          displayOrder: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "cat_other",
          name: "other",
          slug: "other",
          level: 0,
          isActive: true,
          displayOrder: 6,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "cat_grocery",
          name: "grocery",
          slug: "grocery",
          level: 0,
          isActive: true,
          displayOrder: 7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "cat_sportshoes",
          name: "sportshoes",
          slug: "sportshoes",
          level: 0,
          isActive: true,
          displayOrder: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    // 2. Seed Products matching Image 2 (`mar2832023`, `t210`, `l2150`) if needed
    if (!db.products || db.products.length <= 3) {
      db.products = [
        {
          id: "prod_mar2832023",
          sku: "mar2832023",
          upc: "UPC:992817264101",
          name: "mar2832023",
          slug: "mar2832023",
          description: "Festival ceremonial showpiece crafted with intricate detailing",
          price: 149.99,
          comparePrice: 199.99,
          costPrice: 90.0,
          currentStock: 25,
          minStock: 5,
          warehouse: "gyanwarehouse",
          status: "ACTIVE",
          isSoldOut: false,
          brand: "Heritage Art",
          googleMerchantSync: true,
          googleCategory: "Home & Garden > Decor > Statues",
          googleCondition: "new",
          googleBrand: "Heritage Art",
          googleGtin: "992817264101",
          googleMpn: "MAR2832023",
          googleSyncStatus: "SYNCED",
          googleLastSyncedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "prod_t210",
          sku: "t210",
          upc: "UPC:854632148711",
          name: "tablet-t210",
          slug: "tablet-t210",
          description: "Compact 8-inch Android tablet with vibrant HD display and quad-core CPU",
          price: 199.99,
          comparePrice: 249.99,
          costPrice: 130.0,
          currentStock: 50,
          minStock: 10,
          warehouse: "gyanwarehouse",
          status: "ACTIVE",
          isSoldOut: false,
          brand: "Tagateway Tech",
          googleMerchantSync: true,
          googleCategory: "Electronics > Computers > Tablets",
          googleCondition: "new",
          googleBrand: "Tagateway",
          googleGtin: "854632148711",
          googleMpn: "T210-TAB",
          googleSyncStatus: "READY",
          googleLastSyncedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "prod_l2150",
          sku: "l2150",
          upc: "UPC:854632148716",
          name: "laptop-l2150",
          slug: "laptop-l2150",
          description: "Ultra-slim 15.6 inch high efficiency productivity laptop",
          price: 699.99,
          comparePrice: 849.99,
          costPrice: 500.0,
          currentStock: 30,
          minStock: 8,
          warehouse: "gyanwarehouse",
          status: "ACTIVE",
          isSoldOut: false,
          brand: "Tagateway Tech",
          googleMerchantSync: true,
          googleCategory: "Electronics > Computers > Laptops",
          googleCondition: "new",
          googleBrand: "Tagateway",
          googleGtin: "854632148716",
          googleMpn: "L2150-PRO",
          googleSyncStatus: "SYNCED",
          googleLastSyncedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "prod_zolo3",
          sku: "zolo3",
          upc: "UPC:712938471101",
          name: "zoloChip",
          slug: "zolochip-pro",
          description: "High performance custom computing controller chip",
          price: 29.99,
          comparePrice: 39.99,
          costPrice: 15.0,
          currentStock: 50,
          minStock: 10,
          warehouse: "gyanwarehouse",
          status: "ACTIVE",
          isSoldOut: false,
          brand: "Zolo Micro",
          googleMerchantSync: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      // Seed product category associations matching Image 2 ("other , grocery , sportshoes")
      if (!db.productCategories) db.productCategories = [];
      const defaultCatIds = ["cat_other", "cat_grocery", "cat_sportshoes"];
      ["prod_mar2832023", "prod_t210", "prod_l2150"].forEach((pid) => {
        defaultCatIds.forEach((cid, idx) => {
          if (!db.productCategories.some((pc) => pc.productId === pid && pc.categoryId === cid)) {
            db.productCategories.push({ productId: pid, categoryId: cid, isMain: idx === 0 });
          }
        });
      });
      // Link us1 to t210 and l2150
      if (!db.productCategories.some((pc) => pc.productId === "prod_t210" && pc.categoryId === "cat_root_us1")) {
        db.productCategories.push({ productId: "prod_t210", categoryId: "cat_root_us1", isMain: false });
      }
      if (!db.productCategories.some((pc) => pc.productId === "prod_l2150" && pc.categoryId === "cat_root_us1")) {
        db.productCategories.push({ productId: "prod_l2150", categoryId: "cat_root_us1", isMain: false });
      }
      if (!db.productCategories.some((pc) => pc.productId === "prod_mar2832023" && pc.categoryId === "cat_root_1")) {
        db.productCategories.push({ productId: "prod_mar2832023", categoryId: "cat_root_1", isMain: false });
      }
    }

    await this.writeLocalDb(db);
  }
}
