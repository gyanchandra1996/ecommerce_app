"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Minus,
  Search,
  Factory,
  Warehouse as WarehouseIcon,
  Trash2,
  Edit2,
  X,
  Check,
  Building,
} from "lucide-react";

interface Warehouse {
  id: string;
  accountNumber: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  isActive: boolean;
  manufacturerId?: string;
}

interface Manufacturer {
  id: string;
  accountNumber: string;
  name: string;
  contactName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  warehouses?: Warehouse[];
}

export function ManageManufacturersView() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Warehouse Modal State
  const [isWhModalOpen, setIsWhModalOpen] = useState(false);
  const [selectedMfgId, setSelectedMfgId] = useState<string | null>(null);
  const [whSaving, setWhSaving] = useState(false);
  const [whFormData, setWhFormData] = useState({
    name: "",
    accountNumber: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "United States",
    zipCode: "",
  });

  const fetchManufacturers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/manufacturers${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      const json = await res.json();
      if (json.success && json.data) {
        setManufacturers(json.data);
        // By default expand the first manufacturer if not set
        if (json.data.length > 0 && Object.keys(expandedRows).length === 0) {
          setExpandedRows({ [json.data[0].id]: true });
        }
      }
    } catch (err) {
      console.error("Error fetching manufacturers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManufacturers();
  }, [search]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openAddWarehouseModal = (mfgId: string) => {
    setSelectedMfgId(mfgId);
    setWhFormData({
      name: "",
      accountNumber: "WH-" + Math.floor(10 + Math.random() * 90),
      contactName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "United States",
      zipCode: "",
    });
    setIsWhModalOpen(true);
  };

  const handleWarehouseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMfgId || !whFormData.name.trim()) return;

    try {
      setWhSaving(true);
      const res = await fetch("/api/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...whFormData,
          manufacturerId: selectedMfgId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsWhModalOpen(false);
        // ensure parent row is expanded
        setExpandedRows((prev) => ({ ...prev, [selectedMfgId]: true }));
        fetchManufacturers();
      }
    } catch (err) {
      console.error("Error adding warehouse:", err);
    } finally {
      setWhSaving(false);
    }
  };

  const handleDeleteManufacturer = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete manufacturer "${name}" and all its warehouses?`)) return;
    try {
      const res = await fetch(`/api/manufacturers/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchManufacturers();
      }
    } catch (err) {
      console.error("Error deleting manufacturer:", err);
    }
  };

  const handleDeleteWarehouse = async (whId: string) => {
    if (!confirm("Are you sure you want to delete this warehouse?")) return;
    try {
      const res = await fetch(`/api/warehouses/${whId}`, { method: "DELETE" });
      if (res.ok) {
        fetchManufacturers();
      }
    } catch (err) {
      console.error("Error deleting warehouse:", err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Breadcrumb matching Screenshot 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Factory className="w-5 h-5 text-emerald-600" />
            <span>Manage Manufacturer</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            <span className="text-emerald-600 font-medium">Inventory</span> /{" "}
            <span className="text-slate-400">Manage Manufacturer</span>
          </p>
        </div>

        {/* Top Controls: Search and Add Manufacturer */}
        <div className="flex items-center space-x-3">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <Link
            href="/admin/manufacturers/create"
            className="h-8 px-3.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm flex items-center space-x-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Manufacturer</span>
          </Link>
        </div>
      </div>

      {/* Main Table matching Screenshot 2 */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center"></th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4">Mfg&apos;s Name</th>
                <th className="py-3 px-4">Contact Name</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading manufacturers...
                  </td>
                </tr>
              ) : manufacturers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No manufacturers found. Click &quot;Add Manufacturer&quot; to create one.
                  </td>
                </tr>
              ) : (
                manufacturers.map((mfg) => {
                  const isExpanded = !!expandedRows[mfg.id];
                  const whList = mfg.warehouses || [];

                  return (
                    <React.Fragment key={mfg.id}>
                      <tr className="hover:bg-slate-50/60 transition group">
                        {/* Expand / Collapse Button matching screenshot */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => toggleRow(mfg.id)}
                            className="w-5 h-5 rounded flex items-center justify-center border border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition"
                            title={isExpanded ? "Collapse" : "Expand Warehouses"}
                          >
                            {isExpanded ? (
                              <Minus className="w-3 h-3 stroke-[2.5]" />
                            ) : (
                              <Plus className="w-3 h-3 stroke-[2.5]" />
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-4 font-mono font-medium text-slate-800">
                          {mfg.accountNumber}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {mfg.name}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {mfg.contactName}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          {mfg.phone || "-"}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {mfg.email}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              mfg.isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {mfg.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openAddWarehouseModal(mfg.id)}
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition"
                            >
                              + Add Warehouse
                            </button>
                            <button
                              onClick={() => handleDeleteManufacturer(mfg.id, mfg.name)}
                              className="p-1 text-slate-400 hover:text-red-600 transition"
                              title="Delete Manufacturer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Nested Warehouses Row matching Screenshot 2 */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70">
                          <td colSpan={8} className="p-4 pl-12 border-b border-slate-200/80">
                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
                              {/* Sub-header with Title and Add New Warehouse button */}
                              <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                  <WarehouseIcon className="w-4 h-4 text-slate-500" />
                                  <span>Warehouses ({whList.length})</span>
                                </h3>

                                <button
                                  onClick={() => openAddWarehouseModal(mfg.id)}
                                  className="h-7 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-sm flex items-center space-x-1 transition"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add New Warehouse</span>
                                </button>
                              </div>

                              {/* Warehouse Table matching Screenshot 2 */}
                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="bg-slate-100/70 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                                      <th className="py-2.5 px-3">Account</th>
                                      <th className="py-2.5 px-3">Warehouse</th>
                                      <th className="py-2.5 px-3">Contact Name</th>
                                      <th className="py-2.5 px-3">Email</th>
                                      <th className="py-2.5 px-3 text-right">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 text-xs">
                                    {whList.length === 0 ? (
                                      <tr>
                                        <td colSpan={5} className="py-4 text-center text-slate-400 text-xs">
                                          No warehouses assigned yet. Click &quot;Add New Warehouse&quot; to create one.
                                        </td>
                                      </tr>
                                    ) : (
                                      whList.map((wh) => (
                                        <tr key={wh.id} className="hover:bg-slate-50 transition">
                                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                                            {wh.accountNumber}
                                          </td>
                                          <td className="py-2.5 px-3 font-medium text-slate-800">
                                            {wh.name}
                                          </td>
                                          <td className="py-2.5 px-3 text-slate-600">
                                            {wh.contactName || "-"}
                                          </td>
                                          <td className="py-2.5 px-3 text-slate-600">
                                            {wh.email || "-"}
                                          </td>
                                          <td className="py-2.5 px-3 text-right">
                                            <button
                                              onClick={() => handleDeleteWarehouse(wh.id)}
                                              className="p-1 text-slate-400 hover:text-red-600 transition"
                                              title="Delete Warehouse"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Warehouse Modal matching Screenshot 2 */}
      {isWhModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>Add New Warehouse</span>
              </h3>
              <button
                onClick={() => setIsWhModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWarehouseSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Warehouse Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={whFormData.name}
                    onChange={(e) => setWhFormData({ ...whFormData, name: e.target.value })}
                    placeholder="e.g. Central Depot"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={whFormData.accountNumber}
                    onChange={(e) => setWhFormData({ ...whFormData, accountNumber: e.target.value })}
                    placeholder="e.g. WH-11"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={whFormData.contactName}
                    onChange={(e) => setWhFormData({ ...whFormData, contactName: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={whFormData.email}
                    onChange={(e) => setWhFormData({ ...whFormData, email: e.target.value })}
                    placeholder="e.g. wh@domain.com"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={whFormData.phone}
                    onChange={(e) => setWhFormData({ ...whFormData, phone: e.target.value })}
                    placeholder="e.g. 555-0199"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={whFormData.city}
                    onChange={(e) => setWhFormData({ ...whFormData, city: e.target.value })}
                    placeholder="e.g. Mentor"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={whFormData.address}
                  onChange={(e) => setWhFormData({ ...whFormData, address: e.target.value })}
                  placeholder="e.g. 8080 Norton Pkwy"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsWhModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={whSaving}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md flex items-center space-x-1.5 transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{whSaving ? "Saving..." : "Add Warehouse"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
