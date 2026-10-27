"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Shield,
  Search,
  RotateCcw,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";
import { Customer } from "@/modules/customers/types/customer.types";
import { CustomerTable } from "@/modules/customers/components/CustomerTable";
import { AddCustomerModal } from "@/modules/customers/components/AddCustomerModal";
import { ManageRolesModal } from "@/modules/roles/components/ManageRolesModal";
import { CreditModal } from "@/modules/customers/components/CreditModal";
import { CustomerDetailModal } from "@/modules/customers/components/CustomerDetailModal";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState("all");
  const [selectedCustomerType, setSelectedCustomerType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);

  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [creditCustomer, setCreditCustomer] = useState<Customer | null>(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewCustomer, setPreviewCustomer] = useState<Customer | null>(null);
  const [pendingApprovalCount, setPendingApprovalCount] = useState<number>(0);

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedAccountType && selectedAccountType !== "all") {
        params.set("accountType", selectedAccountType);
      }
      if (selectedCustomerType && selectedCustomerType !== "all") {
        params.set("customerType", selectedCustomerType);
      }
      if (selectedStatus && selectedStatus !== "all") {
        params.set("status", selectedStatus);
      }

      const res = await fetch(`/api/customers?${params.toString()}`);
      const json = await res.json();
      if (json.data) {
        const list = Array.isArray(json.data) ? json.data : (json.data.items || []);
        setCustomers(list);
        if (typeof json.data.pendingCount === "number") {
          setPendingApprovalCount(json.data.pendingCount);
        }
      }
    } catch {
      // error fetching customers
    } finally {
      setLoading(false);
    }
  }, [search, selectedAccountType, selectedCustomerType, selectedStatus]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedAccountType("all");
    setSelectedCustomerType("all");
    setSelectedStatus("all");
  };

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setIsAddModalOpen(true);
  };

  const handleOpenCredit = (c: Customer) => {
    setCreditCustomer(c);
    setIsCreditModalOpen(true);
  };

  const handlePreview = (c: Customer) => {
    setPreviewCustomer(c);
    setIsPreviewModalOpen(true);
  };

  const handleToggleDeactivate = async (customer: Customer) => {
    const nextStatus = customer.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        showNotification(
          `Customer ${customer.email} marked as ${nextStatus === "ACTIVE" ? "Active" : "Inactive"}.`
        );
        loadCustomers();
      }
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to delete customer account "${email}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification(`Customer account "${email}" deleted successfully.`);
        loadCustomers();
      } else {
        const json = await res.json();
        alert(json.message || "Failed to delete customer.");
      }
    } catch {
      alert("Failed to delete customer.");
    }
  };

  // Compute pending approval count (e.g. inactive or pending guest accounts)
  const pendingCount = customers.filter(
    (c) => c.status === "INACTIVE" || c.customerType === "Customer (Guest)"
  ).length;

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header matching Image 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <span className="hover:text-slate-700 cursor-pointer">Customers</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Manage Customers</span>
          </div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <span>Customer Directory</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
              {customers.length} Accounts
            </span>
          </h1>
        </div>

        {/* Action Controls matching Image 4: Pending Badge, Manage Role, Add + */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Customers Pending Approval Badge */}
          <div className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Customers Pending Approval:</span>
            <span className="font-bold text-amber-300 ml-0.5">{pendingApprovalCount}</span>
          </div>

          {/* Assign Customer Role Separate Page matching user request */}
          <Link
            href="/admin/roles/assign"
            className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center space-x-1.5 transition shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Assign Customer Role</span>
          </Link>

          {/* Manage Role Button (Modal) */}
          <button
            type="button"
            onClick={() => setIsRolesModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold flex items-center space-x-1.5 transition shadow-2xs"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Access Groups</span>
          </button>

          {/* Add + Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Account Type Filter */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Account Type
            </label>
            <select
              value={selectedAccountType}
              onChange={(e) => setSelectedAccountType(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All</option>
              <option value="admin">admin</option>
              <option value="customer">customer</option>
              <option value="manager">manager</option>
              <option value="staff">staff</option>
            </select>
          </div>

          {/* Customer Type Filter */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Customer Type
            </label>
            <select
              value={selectedCustomerType}
              onChange={(e) => setSelectedCustomerType(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All</option>
              <option value="Customer">Customer</option>
              <option value="Customer (Guest)">Customer (Guest)</option>
              <option value="Wholesale">Wholesale</option>
              <option value="VIP">VIP</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          {/* Search Input & Reset Button */}
          <div className="sm:col-span-6">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Search by Name, Email, or Mobile (+91)
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") loadCustomers();
                  }}
                  placeholder="e.g. Vikram, 98765, rahul@example.com..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={() => loadCustomers()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition"
              >
                Search
              </button>

              <button
                type="button"
                onClick={handleResetFilters}
                title="Reset Filters"
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Directory Table */}
      <CustomerTable
        customers={customers}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onOpenCredit={handleOpenCredit}
        onToggleDeactivate={handleToggleDeactivate}
        onPreview={handlePreview}
      />

      {/* Add / Edit Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCustomer(null);
        }}
        customer={editingCustomer}
        onCustomerSaved={loadCustomers}
      />

      {/* Manage Roles & Granular Permissions Matrix Modal */}
      <ManageRolesModal
        isOpen={isRolesModalOpen}
        onClose={() => setIsRolesModalOpen(false)}
        onRolesChanged={loadCustomers}
      />

      {/* Manage Store Credit Modal */}
      <CreditModal
        isOpen={isCreditModalOpen}
        onClose={() => {
          setIsCreditModalOpen(false);
          setCreditCustomer(null);
        }}
        customer={creditCustomer}
        onCreditUpdated={() => {
          showNotification("Store credit updated successfully.");
          loadCustomers();
        }}
      />

      {/* Customer Details Preview Modal */}
      <CustomerDetailModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewCustomer(null);
        }}
        customer={previewCustomer}
        onEdit={handleOpenEdit}
      />
    </div>
  );
}
