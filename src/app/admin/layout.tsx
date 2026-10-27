"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/modules/dashboard/components/AdminSidebar";
import { AdminHeader } from "@/modules/dashboard/components/AdminHeader";
import { AdminFooter } from "@/modules/dashboard/components/AdminFooter";
import { PermissionSet } from "@/modules/roles/types/role.types";

interface UserProfile {
  name: string;
  role: string;
  permissions?: Record<string, PermissionSet>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserProfile>({
    name: "Admin admin",
    role: "Admin",
  });

  useEffect(() => {
    if (pathname === "/admin/login") return;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data?.user) {
          setUser({
            name: json.data.user.name || "Admin admin",
            role: json.data.user.role || "Admin",
            permissions: json.data.user.permissions,
          });
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
        userRole={user.role}
        permissions={user.permissions}
      />

      {/* Main Content Area (offset by sidebar width on lg screens) */}
      <div className="flex-1 flex flex-col lg:pl-56 transition-all duration-200">
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userName={user.name}
          userRole={user.role}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">{children}</main>

        <AdminFooter />
      </div>
    </div>
  );
}
