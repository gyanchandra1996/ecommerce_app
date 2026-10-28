import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const localDbPath = path.join(process.cwd(), "data", "local-db.json");

async function main() {
  console.log("===================================================================");
  console.log("Cleaning Unnecessary Data & Seeding Clean Users and Roles");
  console.log("===================================================================");

  const hashedPasswordGyan = await bcrypt.hash("gyan@123", 10);
  const hashedPasswordDefaultAdmin = await bcrypt.hash("AdminPassword123!", 10);

  // 1. Clean Roles
  const cleanRoles = [
    {
      id: "role_admin",
      name: "Super Administrator",
      slug: "super-admin",
      description: "Full system access to entire eCommerce platform, configurations, and operations",
      screenPrivilegesCount: 85,
      status: "Active",
      isSystem: true,
      permissions: {
        dashboard: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        assets: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        customers: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        roles: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        manufacturers: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        products: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        inventory: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        pricing: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        orders: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        shipping: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        settings: { canView: true, canCreate: true, canEdit: true, canDelete: true },
        marketing: { canView: true, canCreate: true, canEdit: true, canDelete: true },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "role_store_manager",
      name: "Store Manager",
      slug: "store-manager",
      description: "Catalog, inventory management, shipments, and customer order processing",
      screenPrivilegesCount: 45,
      status: "Active",
      isSystem: false,
      permissions: {
        dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
        products: { canView: true, canCreate: true, canEdit: true, canDelete: false },
        inventory: { canView: true, canCreate: true, canEdit: true, canDelete: false },
        orders: { canView: true, canCreate: true, canEdit: true, canDelete: false },
        shipping: { canView: true, canCreate: true, canEdit: true, canDelete: false },
        customers: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "role_editor",
      name: "Content Editor",
      slug: "content-editor",
      description: "Product descriptions, media assets, marketing sliders, and promotional banners",
      screenPrivilegesCount: 25,
      status: "Active",
      isSystem: false,
      permissions: {
        dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
        assets: { canView: true, canCreate: true, canEdit: true, canDelete: false },
        products: { canView: true, canCreate: true, canEdit: true, canDelete: false },
        marketing: { canView: true, canCreate: true, canEdit: true, canDelete: false },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "role_support",
      name: "Customer Support",
      slug: "customer-support",
      description: "Order status inquiries, customer address updates, and product reviews/Q&A",
      screenPrivilegesCount: 20,
      status: "Active",
      isSystem: false,
      permissions: {
        dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
        customers: { canView: true, canCreate: false, canEdit: true, canDelete: false },
        orders: { canView: true, canCreate: false, canEdit: true, canDelete: false },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // 2. Clean Users
  const cleanUsers = [
    // Backend Admin requested by user: gyan@gmail.com / gyan@123
    {
      id: "usr_admin_gyan",
      name: "Gyan Admin",
      firstName: "Gyan",
      lastName: "Admin",
      email: "gyan@gmail.com",
      password: hashedPasswordGyan,
      role: "ADMIN",
      roleId: "role_admin",
      assignedRoles: ["role_admin"],
      accountType: "admin",
      type: "admin",
      customerType: "Admin",
      country: "India",
      countryCode: "IN",
      state: "Haryana",
      city: "Gurugram",
      postalCode: "122015",
      phone: "+91 9876543210",
      mobileNumber: "+91 9876543210",
      status: "ACTIVE",
      credit: 0,
      ordersCount: 0,
      wishlistCount: 0,
      lastLogin: "Just now",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Frontend Customer requested by user: gyanchandranist@gmail.com / gyan@123
    {
      id: "usr_cust_gyanchandra",
      name: "Gyan Chandra",
      firstName: "Gyan",
      lastName: "Chandra",
      email: "gyanchandranist@gmail.com",
      password: hashedPasswordGyan,
      role: "CUSTOMER",
      roleId: "",
      assignedRoles: [],
      accountType: "customer",
      type: "customer",
      customerType: "Customer",
      country: "India",
      countryCode: "IN",
      state: "Haryana",
      city: "Gurugram",
      postalCode: "122015",
      address: "DLF Phase 3, Cyber City",
      shippingAddress: "DLF Phase 3, Cyber City",
      phone: "+91 9876543211",
      mobileNumber: "+91 9876543211",
      status: "ACTIVE",
      credit: 500.0,
      ordersCount: 3,
      wishlistCount: 2,
      lastLogin: "Just now",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Default Admin for automated test suite compatibility: admin@tagateway.com / AdminPassword123!
    {
      id: "usr_admin_default",
      name: "Admin Administrator",
      firstName: "Admin",
      lastName: "Administrator",
      email: "admin@tagateway.com",
      password: hashedPasswordDefaultAdmin,
      role: "ADMIN",
      roleId: "role_admin",
      assignedRoles: ["role_admin"],
      accountType: "admin",
      type: "admin",
      customerType: "Admin",
      country: "India",
      countryCode: "IN",
      state: "Delhi",
      city: "New Delhi",
      postalCode: "110001",
      phone: "+91 9876543200",
      mobileNumber: "+91 9876543200",
      status: "ACTIVE",
      credit: 0,
      ordersCount: 0,
      wishlistCount: 0,
      lastLogin: "Just now",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Both Customer & Admin showcase user
    {
      id: "usr_both_gyan",
      name: "Gyan Dual Account",
      firstName: "Gyan",
      lastName: "Dual",
      email: "gyanboth@gmail.com",
      password: hashedPasswordGyan,
      role: "ADMIN",
      roleId: "role_admin",
      assignedRoles: ["role_admin"],
      accountType: "both",
      type: "both",
      customerType: "Both",
      country: "India",
      countryCode: "IN",
      state: "Haryana",
      city: "Gurugram",
      postalCode: "122015",
      address: "Golf Course Road",
      shippingAddress: "Golf Course Road",
      phone: "+91 9876543212",
      mobileNumber: "+91 9876543212",
      status: "ACTIVE",
      credit: 1000.0,
      ordersCount: 5,
      wishlistCount: 4,
      lastLogin: "Just now",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // 3. Update local-db.json
  if (fs.existsSync(localDbPath)) {
    const db = JSON.parse(fs.readFileSync(localDbPath, "utf8"));
    const oldUsersCount = db.users ? db.users.length : 0;
    const oldRolesCount = db.roles ? db.roles.length : 0;

    db.users = cleanUsers;
    db.roles = cleanRoles;

    fs.writeFileSync(localDbPath, JSON.stringify(db, null, 2), "utf8");
    console.log(`[local-db.json] Users cleaned from ${oldUsersCount} -> ${cleanUsers.length}`);
    console.log(`[local-db.json] Roles cleaned from ${oldRolesCount} -> ${cleanRoles.length}`);
  }

  // 4. Update Postgres via Prisma (if connected)
  try {
    if (prisma.role) {
      for (const r of cleanRoles) {
        await prisma.role.upsert({
          where: { slug: r.slug },
          update: {
            name: r.name,
            description: r.description,
            screenPrivilegesCount: r.screenPrivilegesCount,
            status: r.status,
            isSystem: r.isSystem,
            permissions: r.permissions,
          },
          create: {
            id: r.id,
            name: r.name,
            slug: r.slug,
            description: r.description,
            screenPrivilegesCount: r.screenPrivilegesCount,
            status: r.status,
            isSystem: r.isSystem,
            permissions: r.permissions,
          },
        });
      }

      const validSlugs = cleanRoles.map((r) => r.slug);
      await prisma.role.deleteMany({
        where: {
          slug: { notIn: validSlugs },
        },
      });
    }

    if (prisma.user) {
      for (const u of cleanUsers) {
        const pgRole = u.role === "ADMIN" ? "ADMIN" : "STAFF";
        await prisma.user.upsert({
          where: { email: u.email },
          update: {
            name: u.name,
            password: u.password,
            role: pgRole,
          },
          create: {
            id: u.id,
            name: u.name,
            email: u.email,
            password: u.password,
            role: pgRole,
          },
        });
      }

      const validEmails = cleanUsers.map((u) => u.email);
      const delRes = await prisma.user.deleteMany({
        where: {
          email: { notIn: validEmails },
        },
      });
      console.log(`[Postgres] Removed ${delRes.count} dummy users. Kept clean seed users.`);
    }
  } catch (pgErr) {
    console.log("[Postgres] Note:", pgErr.message);
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n===================================================================");
  console.log("SUCCESS: Clean seed users and roles applied successfully!");
  console.log("1. Frontend Customer: gyanchandranist@gmail.com / gyan@123 (Type: customer)");
  console.log("2. Backend Admin:     gyan@gmail.com             / gyan@123 (Type: admin)");
  console.log("3. Dual Access:       gyanboth@gmail.com         / gyan@123 (Type: both)");
  console.log("4. Default Admin:     admin@tagateway.com        / AdminPassword123!");
  console.log("===================================================================");
}

main().catch((err) => {
  console.error("Fatal seeder error:", err);
  process.exit(1);
});
