"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Mail,
  Phone,
  Calendar,
  Search,
  Check,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Save,
  RotateCcw,
  User,
  ShieldCheck,
} from "lucide-react";
import { Role, RoleEmployee } from "../types/role.types";

interface Props {
  employeeId: string;
}

export function ManageEmployeeRolesView({ employeeId }: Props) {
  const [customer, setCustomer] = useState<RoleEmployee | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleNames, setSelectedRoleNames] = useState<string[]>([]);
  const [initialRoleNames, setInitialRoleNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch(`/api/roles/employees/${employeeId}`).then((r) => r.json()),
      fetch("/api/roles").then((r) => r.json()),
    ])
      .then(([custJson, rolesJson]) => {
        if (!isMounted) return;
        if (custJson.data) {
          setCustomer(custJson.data);
          const assigned = custJson.data.assignedRoles || (custJson.data.roleId ? [custJson.data.roleId] : []);
          setSelectedRoleNames(assigned);
          setInitialRoleNames(assigned);
        }
        if (rolesJson.data) {
          setRoles(rolesJson.data);
        }
      })
      .catch(() => {
        if (isMounted) showNotification("error", "Failed to load customer access data.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [employeeId]);

  const toggleRole = (roleName: string) => {
    setSelectedRoleNames((prev) => {
      const exists = prev.some((r) => r.toLowerCase() === roleName.toLowerCase());
      if (exists) {
        return prev.filter((r) => r.toLowerCase() !== roleName.toLowerCase());
      } else {
        return [...prev, roleName];
      }
    });
  };

  const handleReset = () => {
    setSelectedRoleNames(initialRoleNames);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/roles/employees/${employeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedRoles: selectedRoleNames }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to save role assignments");
      }

      setInitialRoleNames(selectedRoleNames);
      if (customer) {
        setCustomer({ ...customer, assignedRoles: selectedRoleNames });
      }
      showNotification("success", `Updated role assignments for ${customer?.name || customer?.email || "customer"}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving role assignments";
      showNotification("error", msg);
    } finally {
      setSaving(false);
    }
  };

  const isDirty = useMemo(() => {
    if (selectedRoleNames.length !== initialRoleNames.length) return true;
    const sortedA = [...selectedRoleNames].sort();
    const sortedB = [...initialRoleNames].sort();
    return sortedA.some((val, idx) => val !== sortedB[idx]);
  }, [selectedRoleNames, initialRoleNames]);

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

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm text-slate-500 font-medium">Loading customer access details...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Customer account not found</h2>
        <p className="text-xs text-slate-500">The requested customer could not be located in the system.</p>
        <Link
          href="/admin/roles/assign"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assign Customer Role</span>
        </Link>
      </div>
    );
  }

  const phone = customer.mobileNumber || customer.phone || "Not specified";

  return (
    <div className="space-y-6 pb-20">
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

      {/* Breadcrumbs & Header */}
      <div>
        <nav className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1.5">
          <Link href="/admin/dashboard" className="hover:text-blue-600 transition">
            Dashboard
          </Link>
          <span>&gt;</span>
          <Link href="/admin/roles" className="hover:text-blue-600 transition">
            Access Management
          </Link>
          <span>&gt;</span>
          <Link href="/admin/roles/assign" className="hover:text-blue-600 transition">
            Assign Customer Role
          </Link>
          <span>&gt;</span>
          <span className="font-semibold text-slate-800">{customer.name || customer.email}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Manage Customer Access & Roles
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Assign or revoke security roles and permissions for this customer
            </p>
          </div>

          <Link
            href="/admin/roles/assign"
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Directory</span>
          </Link>
        </div>
      </div>

      {/* Top Customer Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 border-l-4 border-l-emerald-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              {(customer.name || customer.email).substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">
                  {customer.name || "Customer Account"}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    customer.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {customer.status || "ACTIVE"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                <span className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{customer.email}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{phone}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Type: {customer.customerType || customer.accountType || "Customer"}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start md:self-auto">
            <span className="text-xs text-slate-500 font-medium">Assigned Roles:</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {selectedRoleNames.length} Selected
            </span>
          </div>
        </div>
      </div>

      {/* Role Selection & Permission Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Available Security Roles</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select roles to grant this customer access to admin modules or privileged actions
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter roles by name or module..."
              className="w-full h-8.5 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          </div>
        </div>

        {/* Roles Grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoles.map((r) => {
            const isSelected = selectedRoleNames.some(
              (name) => name.toLowerCase() === r.name.toLowerCase()
            );

            return (
              <div
                key={r.id}
                onClick={() => toggleRole(r.name)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-emerald-50/60 border-emerald-400 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                          isSelected
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="font-bold text-xs text-slate-800">{r.name}</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600 uppercase font-mono">
                      {r.slug}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                    {r.description || "Grants configured module permissions to the assigned customer."}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Status: {r.status || "Active"}</span>
                  <span className="font-semibold text-emerald-700">
                    {isSelected ? "Assigned" : "Click to Assign"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Save Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 py-3 px-6 shadow-lg flex items-center justify-between">
        <div className="text-xs text-slate-500">
          {isDirty ? (
            <span className="text-amber-600 font-semibold flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>You have unsaved changes in role assignments.</span>
            </span>
          ) : (
            <span>All role changes are synchronized.</span>
          )}
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty || saving}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition disabled:opacity-40"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Role Assignment</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Named alias
export const ManageCustomerRolesView = ManageEmployeeRolesView;
