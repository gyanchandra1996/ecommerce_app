"use client";

import React, { useState, useEffect } from "react";
import {
  Warehouse as WarehouseIcon,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Building,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { WarehouseRecord } from "@/core/db/store";
import { COUNTRIES } from "@/core/utils/postal-autofill";

export function ManageWarehousesView() {
  const [warehouses, setWarehouses] = useState<WarehouseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    accountNumber: "",
    contactName: "",
    email: "",
    phone: "",
    fax: "",
    address: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "United States",
    zipCode: "",
    shipstationWarehouse: "",
    sellbriteWarehouse: "",
    isActive: true,
  });

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/warehouses");
      const json = await res.json();
      if (json.success && json.data) {
        setWarehouses(json.data);
      }
    } catch (err) {
      console.error("Failed to load warehouses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const openCreateModal = () => {
    setEditingWarehouse(null);
    setFormData({
      name: "",
      accountNumber: "WH-" + Math.floor(10 + Math.random() * 90),
      contactName: "",
      email: "",
      phone: "",
      fax: "",
      address: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "United States",
      zipCode: "",
      shipstationWarehouse: "",
      sellbriteWarehouse: "",
      isActive: true,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (wh: WarehouseRecord) => {
    setEditingWarehouse(wh);
    setFormData({
      name: wh.name || "",
      accountNumber: wh.accountNumber || "",
      contactName: wh.contactName || "",
      email: wh.email || "",
      phone: wh.phone || "",
      fax: wh.fax || "",
      address: wh.address || wh.addressLine1 || "",
      addressLine1: wh.addressLine1 || wh.address || "",
      addressLine2: wh.addressLine2 || "",
      city: wh.city || "",
      state: wh.state || "",
      country: wh.country || "United States",
      zipCode: wh.zipCode || "",
      shipstationWarehouse: wh.shipstationWarehouse || "",
      sellbriteWarehouse: wh.sellbriteWarehouse || "",
      isActive: wh.isActive !== false,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalError("Warehouse Name is required.");
      return;
    }

    try {
      setSaving(true);
      setModalError(null);

      const url = editingWarehouse ? `/api/warehouses/${editingWarehouse.id}` : "/api/warehouses";
      const method = editingWarehouse ? "PUT" : "POST";

      const payload = {
        ...formData,
        address: formData.addressLine1 || formData.address,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save warehouse.");
      }

      setActionMessage({
        type: "success",
        text: editingWarehouse ? "Warehouse updated successfully." : "Warehouse created successfully.",
      });
      setIsModalOpen(false);
      fetchWarehouses();
    } catch (err: any) {
      setModalError(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete warehouse "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/warehouses/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error || "Cannot delete warehouse.");
        return;
      }

      setActionMessage({ type: "success", text: `Warehouse "${name}" removed successfully.` });
      fetchWarehouses();
    } catch (err: any) {
      alert(err.message || "Failed to delete warehouse.");
    }
  };

  const filteredWarehouses = warehouses.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      (w.accountNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (w.contactName || "").toLowerCase().includes(search.toLowerCase()) ||
      (w.city || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && w.isActive !== false) ||
      (statusFilter === "INACTIVE" && w.isActive === false);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 font-medium mb-1">
            Home / Inventory / <span className="text-slate-800 font-semibold">Warehouses</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <WarehouseIcon className="w-7 h-7 text-indigo-600" />
            Warehouse Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage multi-warehouse fulfillment hubs, stock locations, and shipping integration mappings
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add Warehouse
        </button>
      </div>

      {actionMessage && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between ${
            actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, name, city, contact..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                statusFilter === st
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
          <button
            onClick={fetchWarehouses}
            title="Refresh"
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Warehouses Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Account / Code</th>
                <th className="py-3 px-4">Warehouse Name</th>
                <th className="py-3 px-4">Manager / Contact</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Integrations</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading warehouses...
                  </td>
                </tr>
              ) : filteredWarehouses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <WarehouseIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No warehouses found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredWarehouses.map((wh) => (
                  <tr key={wh.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {wh.accountNumber || "—"}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{wh.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{wh.contactName || "—"}</td>
                    <td className="py-3.5 px-4 text-slate-500 space-y-0.5">
                      {wh.email && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{wh.email}</span>
                        </div>
                      )}
                      {wh.phone && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{wh.phone}</span>
                        </div>
                      )}
                      {!wh.email && !wh.phone && "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>
                          {[wh.city, wh.state, wh.country].filter(Boolean).join(", ") || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {wh.shipstationWarehouse && (
                          <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-medium border border-sky-200">
                            SS: {wh.shipstationWarehouse}
                          </span>
                        )}
                        {wh.sellbriteWarehouse && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-medium border border-purple-200">
                            SB: {wh.sellbriteWarehouse}
                          </span>
                        )}
                        {!wh.shipstationWarehouse && !wh.sellbriteWarehouse && (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          wh.isActive !== false
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {wh.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(wh)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                          title="Edit Warehouse"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(wh.id, wh.name)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete Warehouse"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Warehouse Modal (Matching User Screenshot: Warehouse Create[Virat]) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <WarehouseIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800 tracking-tight">
                    {editingWarehouse ? "Warehouse Edit[Virat]" : "Warehouse Create[Virat]"}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Fulfillment location details and multi-channel mappings
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Matching Exact Screenshot Order */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-3.5 text-xs">
              {modalError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* 1. Email Address:* */}
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:items-center gap-1.5 sm:gap-4">
                <label className="text-slate-600 font-medium sm:text-right">
                  Email Address:<span className="text-red-500">*</span>
                </label>
                <div className="sm:col-span-2">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. warehouse@tagateway.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs shadow-2xs"
                  />
                </div>
              </div>

              {/* 2. Account Number:* */}
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:items-center gap-1.5 sm:gap-4">
                <label className="text-slate-600 font-medium sm:text-right">
                  Account Number:<span className="text-red-500">*</span>
                </label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="e.g. WH-89"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs shadow-2xs"
                  />
                </div>
              </div>

              {/* 3. Warehouse Name:* */}
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:items-center gap-1.5 sm:gap-4">
                <label className="text-slate-600 font-medium sm:text-right">
                  Warehouse Name:<span className="text-red-500">*</span>
                </label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dallas Distribution Hub"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs shadow-2xs"
                  />
                </div>
              </div>

              {/* 4. Contact Name:* */}
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:items-center gap-1.5 sm:gap-4">
                <label className="text-slate-600 font-medium sm:text-right">
                  Contact Name:<span className="text-red-500">*</span>
                </label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs shadow-2xs"
                  />
                </div>
              </div>

              {/* 5. Address Line1:* */}
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:items-start gap-1.5 sm:gap-4">
                <label className="text-slate-600 font-medium sm:text-right sm:pt-2">
                  Address Line1:<span className="text-red-500">*</span>
                </label>
                <div className="sm:col-span-2">
                  <textarea
                    rows={2}
                    required
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value, address: e.target.value })}
                    placeholder="e.g. 123 Logistics Way, Dock 4"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs shadow-2xs resize-none"
                  />
                </div>
              </div>

              {/* 6. Country:* */}
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:items-center gap-1.5 sm:gap-4">
                <label className="text-slate-600 font-medium sm:text-right">
                  Country:<span className="text-red-500">*</span>
                </label>
                <div className="sm:col-span-2">
                  <select
                    required
                    value={formData.country}
                    onChange={(e) => {
                      const newCountry = e.target.value;
                      const cObj = COUNTRIES.find((c) => c.name.toLowerCase() === newCountry.toLowerCase());
                      const defaultState = cObj && cObj.states.length > 0 ? cObj.states[0] : "";
                      setFormData({ ...formData, country: newCountry, state: defaultState });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs shadow-2xs"
                  >
                    <option value="">Select Country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 7. ZipCode:* */}
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:items-center gap-1.5 sm:gap-4">
                <label className="text-slate-600 font-medium sm:text-right">
                  ZipCode:<span className="text-red-500">*</span>
                </label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="e.g. 110001 or 94103"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs shadow-2xs"
                  />
                </div>
              </div>

              {/* 8. State:* */}
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:items-center gap-1.5 sm:gap-4">
                <label className="text-slate-600 font-medium sm:text-right">
                  State:<span className="text-red-500">*</span>
                </label>
                <div className="sm:col-span-2">
                  {(() => {
                    const cObj = COUNTRIES.find(
                      (c) => c.name.toLowerCase() === (formData.country || "").toLowerCase()
                    );
                    const states = cObj?.states || [];
                    if (states.length > 0) {
                      return (
                        <select
                          required
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs shadow-2xs"
                        >
                          <option value="">Select State</option>
                          {states.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      );
                    }
                    return (
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="Select State or type province"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs shadow-2xs"
                      />
                    );
                  })()}
                </div>
              </div>

              {/* 9. City:* */}
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:items-center gap-1.5 sm:gap-4">
                <label className="text-slate-600 font-medium sm:text-right">
                  City:<span className="text-red-500">*</span>
                </label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. New Delhi or Dallas"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs shadow-2xs"
                  />
                </div>
              </div>

              {/* 10. Phone:* */}
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:items-center gap-1.5 sm:gap-4">
                <label className="text-slate-600 font-medium sm:text-right">
                  Phone:<span className="text-red-500">*</span>
                </label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs shadow-2xs"
                  />
                </div>
              </div>

              {/* 11. Fax:* */}
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:items-center gap-1.5 sm:gap-4">
                <label className="text-slate-600 font-medium sm:text-right">
                  Fax:<span className="text-red-500">*</span>
                </label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={formData.fax}
                    onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                    placeholder="e.g. (555) 019-2835"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs shadow-2xs"
                  />
                </div>
              </div>

              {/* 12. Status:* */}
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:items-center gap-1.5 sm:gap-4">
                <label className="text-slate-600 font-medium sm:text-right">
                  Status:<span className="text-red-500">*</span>
                </label>
                <div className="sm:col-span-2">
                  <select
                    required
                    value={formData.isActive ? "Active" : "Inactive"}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "Active" })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs shadow-2xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center gap-1.5 disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {editingWarehouse ? "Save Warehouse" : "Create Warehouse"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
