"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/modules/dashboard/components/AdminSidebar";
import { AdminHeader } from "@/modules/dashboard/components/AdminHeader";
import { AdminFooter } from "@/modules/dashboard/components/AdminFooter";
import { PermissionSet } from "@/modules/roles/types/role.types";

interface UserProfile {
  name: string;
  email: string;
  role: string;
  permissions?: Record<string, PermissionSet>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserProfile>({
    name: "Administrator",
    email: "admin@tagateway.com",
    role: "Administrator",
  });

  useEffect(() => {
    if (pathname === "/admin/login") return;

    fetch("/api/auth/me?portal=admin")
      .then((res) => {
        if (!res.ok) {
          window.location.href = `/admin/login?callbackUrl=${encodeURIComponent(pathname)}`;
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json?.data?.user) {
          const u = json.data.user;
          // Security Guard: Strict Customer Rejection from Backend
          const isPureCustomer =
            (u.type === "customer" || u.accountType === "customer" || u.role === "CUSTOMER") &&
            u.type !== "both" &&
            u.accountType !== "both" &&
            u.role !== "ADMIN";

          if (isPureCustomer) {
            window.location.href = "/admin/login?error=customer_denied";
            return;
          }

          const displayRole =
            u.type === "both"
              ? "Super Admin (Dual)"
              : u.role === "ADMIN" || u.type === "admin"
              ? "Administrator"
              : u.role || "Administrator";

          setUser({
            name: u.name || "Administrator",
            email: u.email || "",
            role: displayRole,
            permissions: u.permissions,
          });
        } else {
          window.location.href = `/admin/login?callbackUrl=${encodeURIComponent(pathname)}`;
        }
      })
      .catch(() => {});
  }, [pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col font-sans">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        userName={user.name}
        userEmail={user.email}
        userRole={user.role}
        permissions={user.permissions}
      />

      {/* Main Content Area (offset by sidebar width on lg screens) */}
      <div className="flex-1 flex flex-col lg:pl-56 transition-all duration-200">
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userName={user.name}
          userEmail={user.email}
          userRole={user.role}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">{children}</main>

        <AdminFooter />
      </div>
    </div>
  );
}
