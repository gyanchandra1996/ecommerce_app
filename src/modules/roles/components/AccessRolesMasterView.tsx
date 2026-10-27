"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Shield,
  Plus,
  Users,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Layers,
  UserCheck,
} from "lucide-react";
import { Role } from "../types/role.types";

export function AccessRolesMasterView() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    let isSubscribed = true;
    fetch("/api/roles")
      .then((res) => res.json())
      .then((json) => {
        if (isSubscribed && json.data) {
          setRoles(json.data);
        }
      })
      .catch(() => {
        if (isSubscribed) showNotification("error", "Failed to load roles.");
      })
      .finally(() => {
        if (isSubscribed) setLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleDelete = async (role: Role) => {
    if (role.isSystem) {
      showNotification("error", "System roles cannot be deleted.");
      return;
    }

    if (!confirm(`Are you sure you want to delete access group "${role.name}"?`)) {
      return;
    }

    setDeletingId(role.id);
    try {
      const res = await fetch(`/api/roles/${role.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to delete role");
      }
      showNotification("success", `Role "${role.name}" deleted.`);
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting role";
      showNotification("error", msg);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredRoles = useMemo(() => {
    if (!search.trim()) return roles;
    const q = search.toLowerCase();
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q)
    );
  }, [roles, search]);

  const activeCount = useMemo(() => {
    return roles.filter((r) => (r.status || "Active") === "Active").length;
  }, [roles]);

  const totalAssignedUsers = useMemo(() => {
    return roles.reduce((acc, r) => acc + (r.userCount || 0), 0);
  }, [roles]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-xl shadow-lg border flex items-center space-x-3 animate-in fade-in slide-in-from-top-4 duration-200 ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="text-xs font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header & Navigation */}
      <div>
        <nav className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1.5">
          <Link href="/admin/dashboard" className="hover:text-blue-600 transition">
            Dashboard
          </Link>
          <span>&gt;</span>
          <span className="hover:text-blue-600 transition">Masters</span>
          <span>&gt;</span>
          <span className="font-semibold text-slate-800">Access Mgmt Master</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Access Management &amp; Roles Master
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              System &amp; Custom Groups
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <Link
              href="/admin/roles/assign"
              className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-2xs transition"
            >
              <Users className="w-3.5 h-3.5 text-slate-600" />
              <span>Assign Employee Roles</span>
            </Link>

            <Link
              href="/admin/roles/create"
              className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Access Group</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Roles */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 border-l-4 border-l-purple-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              TOTAL ACCESS ROLES
            </span>
            <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">{roles.length}</div>
            <div className="mt-1 flex items-center space-x-1.5 text-xs font-medium text-purple-600">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              <span>Configured Groups</span>
            </div>
          </div>
        </div>

        {/* Active Roles */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              ACTIVE GROUPS
            </span>
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">{activeCount}</div>
            <div className="mt-1 flex items-center space-x-1.5 text-xs font-medium text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Operational</span>
            </div>
          </div>
        </div>

        {/* Assigned Users */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 border-l-4 border-l-cyan-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              TOTAL ASSIGNMENTS
            </span>
            <div className="w-9 h-9 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">{totalAssignedUsers}</div>
            <div className="mt-1 flex items-center space-x-1.5 text-xs font-medium text-cyan-600">
              <Users className="w-3 h-3" />
              <span>Employees Configured</span>
            </div>
          </div>
        </div>

        {/* Screens Protected */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 border-l-4 border-l-amber-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              PROTECTED SCREENS
            </span>
            <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">25+</div>
            <div className="mt-1 flex items-center space-x-1.5 text-xs font-medium text-amber-600">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Modules &amp; Screens</span>
            </div>
          </div>
        </div>
      </div>

      {/* Roles Master Panel */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Panel Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Configured Role Groups</h2>
              <p className="text-xs text-slate-500">
                Manage role access definitions, page privileges and employee mappings
              </p>
            </div>
          </div>

          <div className="relative min-w-[240px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search access groups..."
              className="w-full h-8.5 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400"
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          </div>
        </div>

        {/* Roles Grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full py-16 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
              <span>Loading access roles...</span>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400">
              No access roles found matching your query.
            </div>
          ) : (
            filteredRoles.map((role) => (
              <div
                key={role.id}
                className="rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 shadow-2xs p-4 flex flex-col justify-between transition group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900 tracking-tight">
                        {role.name}
                      </span>
                      {role.isSystem && (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                          <Lock className="w-2.5 h-2.5 mr-0.5" />
                          System
                        </span>
                      )}
                    </div>

                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {role.status || "Active"}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-500 leading-relaxed min-h-[36px]">
                    {role.description || "System configured security role group."}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-blue-200 bg-blue-50/50 text-blue-700">
                      <span>{role.screenPrivilegesCount || Object.keys(role.permissions || {}).length || 3} Screen Privileges</span>
                    </span>

                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-slate-200 bg-slate-50 text-slate-600">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{role.userCount || 0} Assigned</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/admin/roles/${role.id}/edit`}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Permissions</span>
                  </Link>

                  <div className="flex items-center space-x-2">
                    <Link
                      href="/admin/roles/assign"
                      title="Assign to employees"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition"
                    >
                      <Users className="w-3.5 h-3.5" />
                    </Link>

                    {!role.isSystem && (
                      <button
                        type="button"
                        onClick={() => handleDelete(role)}
                        disabled={deletingId === role.id}
                        title="Delete role"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      >
                        {deletingId === role.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
