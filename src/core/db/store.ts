import fs from "fs/promises";
import path from "path";
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

export interface ProductRecord {
  id: string;
  sku: string;
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
  createdAt: string;
  updatedAt: string;
  assetIds?: string[];
}

interface LocalDatabaseSchema {
  users: UserRecord[];
  assets: AssetRecord[];
  products: ProductRecord[];
  productAssets: { productId: string; assetId: string; isPrimary: boolean }[];
}

export class DatabaseStore {
  private static localDbFile = path.join(process.cwd(), "data", "local-db.json");
  private static isPgAvailable: boolean | null = null;
  private static checkedPg = false;

  private static async testPostgres(): Promise<boolean> {
    if (this.checkedPg && this.isPgAvailable !== null) {
      return this.isPgAvailable;
    }
    try {
      // Quick ping test
      await prisma.$queryRaw`SELECT 1`;
      this.isPgAvailable = true;
    } catch {
      this.isPgAvailable = false;
    }
    this.checkedPg = true;
    return this.isPgAvailable;
  }

  private static async readLocalDb(): Promise<LocalDatabaseSchema> {
    try {
      await fs.mkdir(path.dirname(this.localDbFile), { recursive: true });
      const data = await fs.readFile(this.localDbFile, "utf-8");
      return JSON.parse(data);
    } catch {
      const initial: LocalDatabaseSchema = {
        users: [],
        assets: [],
        products: [],
        productAssets: [],
      };
      await this.writeLocalDb(initial);
      return initial;
    }
  }

  private static async writeLocalDb(data: LocalDatabaseSchema): Promise<void> {
    await fs.mkdir(path.dirname(this.localDbFile), { recursive: true });
    await fs.writeFile(this.localDbFile, JSON.stringify(data, null, 2), "utf-8");
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
        // Fall back to local
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
              productAssets: {
                select: { id: true },
              },
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

  // ================= PRODUCTS (For asset integration) =================

  public static async getProductsWithAssets(): Promise<ProductRecord[]> {
    const db = await this.readLocalDb();
    return db.products.map((p) => {
      const pAssets = db.productAssets.filter((pa) => pa.productId === p.id).map((pa) => pa.assetId);
      return {
        ...p,
        assetIds: pAssets,
      };
    });
  }

  public static async attachAssetToProduct(productId: string, assetId: string, isPrimary = false): Promise<boolean> {
    const db = await this.readLocalDb();
    const exists = db.productAssets.some((pa) => pa.productId === productId && pa.assetId === assetId);
    if (!exists) {
      db.productAssets.push({ productId, assetId, isPrimary });
      await this.writeLocalDb(db);
    }
    return true;
  }

  public static async seedInitialData(): Promise<void> {
    const db = await this.readLocalDb();
    if (db.products.length === 0) {
      db.products = [
        {
          id: "prod_1",
          sku: "zolo3",
          name: "zoloChip",
          slug: "zolochip-pro",
          price: 29.99,
          currentStock: 50,
          minStock: 10,
          warehouse: "gyanwarehouse",
          status: "ACTIVE",
          isSoldOut: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "prod_2",
          sku: "zolo",
          name: "zoloChip Classic",
          slug: "zolochip-classic",
          price: 19.99,
          currentStock: 50,
          minStock: 11,
          warehouse: "gyanwarehouse",
          status: "ACTIVE",
          isSoldOut: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "prod_3",
          sku: "z2216",
          name: "wireless-earbuds-z2216",
          slug: "wireless-earbuds-z2216",
          price: 89.99,
          currentStock: 50,
          minStock: 200,
          warehouse: "gyanwarehouse",
          status: "ACTIVE",
          isSoldOut: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      await this.writeLocalDb(db);
    }
  }
}
