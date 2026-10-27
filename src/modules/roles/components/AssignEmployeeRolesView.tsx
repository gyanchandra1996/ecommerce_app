"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Search,
  ArrowLeft,
  User,
  History,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  X,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { RoleEmployee } from "../types/role.types";

interface CustomerRoleStats {
  totalEmployees: number;
  rolesConfigured: number;
  unassigned: number;
  availableRoles: number;
}

export function AssignEmployeeRolesView() {
  const [customers, setCustomers] = useState<RoleEmployee[]>([]);
  const [stats, setStats] = useState<CustomerRoleStats>({
    totalEmployees: 0,
    rolesConfigured: 0,
    unassigned: 0,
    availableRoles: 9,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "assigned" | "unassigned">("all");
  const [search, setSearch] = useState("");
  const [selectedHistoryCustomer, setSelectedHistoryCustomer] = useState<RoleEmployee | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/roles/employees")
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.data) {
          setCustomers(json.data.employees || []);
          if (json.data.stats) {
            setStats(json.data.stats);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const isAssigned = (cust.assignedRoles && cust.assignedRoles.length > 0) || !!cust.roleId;
      if (activeTab === "assigned" && !isAssigned) return false;
      if (activeTab === "unassigned" && isAssigned) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = cust.name.toLowerCase().includes(q);
        const matchEmail = cust.email.toLowerCase().includes(q);
        const matchPhone = (cust.mobileNumber || cust.phone || "").toLowerCase().includes(q);
        const matchRole = (cust.assignedRoles || []).some((r) => r.toLowerCase().includes(q));
        return matchName || matchEmail || matchPhone || matchRole;
      }

      return true;
    });
  }, [customers, activeTab, search]);

  const assignedCount = useMemo(() => {
    return customers.filter((c) => (c.assignedRoles && c.assignedRoles.length > 0) || !!c.roleId).length;
  }, [customers]);

  const unassignedCount = useMemo(() => {
    return customers.filter((c) => (!c.assignedRoles || c.assignedRoles.length === 0) && !c.roleId).length;
  }, [customers]);

  return (
    <div className="space-y-6">
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
          <span className="font-semibold text-slate-800">Assign Customer Role</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Assign Customer Role
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Customer Access Control
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/admin/customers"
              className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold transition"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Customer Directory</span>
            </Link>
            <Link
              href="/admin/roles"
              className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-black text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Access Groups</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TOTAL CUSTOMERS */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 border-l-4 border-l-cyan-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              TOTAL CUSTOMERS
            </span>
            <div className="w-9 h-9 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">
              {stats.totalEmployees || customers.length || 0}
            </div>
            <div className="mt-1 flex items-center space-x-1.5 text-xs font-medium text-cyan-600">
              <Users className="w-3 h-3" />
              <span>Registered Accounts</span>
            </div>
          </div>
        </div>

        {/* Card 2: ROLES CONFIGURED */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              ROLES CONFIGURED
            </span>
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">
              {stats.rolesConfigured || assignedCount || 0}
            </div>
            <div className="mt-1 flex items-center space-x-1.5 text-xs font-medium text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Custom Security Roles</span>
            </div>
          </div>
        </div>

        {/* Card 3: UNASSIGNED */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 border-l-4 border-l-amber-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              UNASSIGNED (STANDARD)
            </span>
            <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">
              {stats.unassigned || unassignedCount || 0}
            </div>
            <div className="mt-1 flex items-center space-x-1.5 text-xs font-medium text-amber-600">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Standard Customer Access</span>
            </div>
          </div>
        </div>

        {/* Card 4: AVAILABLE ROLES */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 border-l-4 border-l-purple-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              AVAILABLE ROLES
            </span>
            <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">{stats.availableRoles || 9}</div>
            <div className="mt-1 flex items-center space-x-1.5 text-xs font-medium text-purple-600">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              <span>System Security Groups</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Card Header & Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">Customer Role Assignment Directory</h2>
                <span className="text-xs text-slate-500 font-medium">
                  {customers.length} total accounts
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign custom security roles and access groups to customer accounts
              </p>
            </div>
          </div>

          {/* Filter Pills & Search Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium self-start sm:self-auto">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === "all"
                    ? "bg-emerald-600 text-white font-semibold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({customers.length})
              </button>
              <button
                onClick={() => setActiveTab("assigned")}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === "assigned"
                    ? "bg-emerald-600 text-white font-semibold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Custom Roles ({assignedCount})
              </button>
              <button
                onClick={() => setActiveTab("unassigned")}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === "unassigned"
                    ? "bg-emerald-600 text-white font-semibold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Standard ({unassignedCount})
              </button>
            </div>

            <div className="relative min-w-[240px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, or mobile..."
                className="w-full h-8.5 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Customer Roles Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">CUSTOMER DETAILS</th>
                <th className="py-3 px-4">MOBILE NUMBER</th>
                <th className="py-3 px-4">ACCOUNT & STATUS</th>
                <th className="py-3 px-4">CURRENT ACCESS GROUPS</th>
                <th className="py-3 px-4 text-center w-40">MANAGE ROLE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading customer role directory...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No customers found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust, index) => {
                  const assigned = cust.assignedRoles || (cust.roleId ? [cust.roleId] : []);
                  const isAssigned = assigned.length > 0;
                  const phone = cust.mobileNumber || cust.phone;

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Index */}
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-400">
                        {index + 1}
                      </td>

                      {/* CUSTOMER DETAILS */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {cust.name ? cust.name.substring(0, 2).toUpperCase() : cust.email.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-slate-800 text-xs">
                                {cust.name || "Customer"}
                              </span>
                              {cust.role === "ADMIN" && (
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                              {cust.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* MOBILE NUMBER */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {phone ? (
                          <div className="flex items-center space-x-1.5 text-slate-700 font-mono text-[11px]">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* ACCOUNT & STATUS */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              cust.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {cust.status || "ACTIVE"}
                          </span>
                          <span className="text-[11px] text-slate-600 font-medium">
                            {cust.customerType || cust.accountType || "Customer"}
                          </span>
                        </div>
                      </td>

                      {/* CURRENT ACCESS GROUPS */}
                      <td className="py-3.5 px-4">
                        {isAssigned ? (
                          <div className="flex flex-wrap gap-1.5 max-w-sm">
                            {assigned.map((roleName) => (
                              <span
                                key={roleName}
                                className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                              >
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                <span>{roleName}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-slate-400 italic text-[11px]">
                            <Shield className="w-3 h-3" />
                            <span>Standard Customer Access</span>
                          </span>
                        )}
                      </td>

                      {/* MANAGE ROLE BUTTON */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          <Link
                            href={`/admin/roles/assign/${cust.id}`}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-2xs cursor-pointer"
                          >
                            <Shield className="w-3 h-3" />
                            <span>Assign Role</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => setSelectedHistoryCustomer(cust)}
                            title="View Role Audit Trail"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role History Audit Modal */}
      {selectedHistoryCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Customer Role History</h2>
                  <p className="text-xs text-slate-500">{selectedHistoryCustomer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedHistoryCustomer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5"></div>
                  <div>
                    <span className="font-bold text-slate-800 block">Current Role Assignment</span>
                    <p className="text-slate-600 mt-0.5">
                      {selectedHistoryCustomer.assignedRoles?.join(", ") ||
                        selectedHistoryCustomer.roleId ||
                        "Standard Customer (Default)"}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Status: {selectedHistoryCustomer.status || "ACTIVE"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                  <div>
                    <span className="font-bold text-slate-800 block">Account Created</span>
                    <p className="text-slate-600 mt-0.5">
                      {selectedHistoryCustomer.createdAt
                        ? new Date(selectedHistoryCustomer.createdAt).toLocaleDateString()
                        : "Account initialized"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedHistoryCustomer(null)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Named alias
export const AssignCustomerRolesView = AssignEmployeeRolesView;
