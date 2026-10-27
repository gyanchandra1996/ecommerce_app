"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  X,
  Save,
  Clock,
  DollarSign,
} from "lucide-react";
import { ShippingZoneRecord } from "@/core/db/store";

export function ShippingZonesView() {
  const [zones, setZones] = useState<ShippingZoneRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZoneRecord | null>(null);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"local" | "regional" | "national" | "special">("regional");
  const [formBaseRate, setFormBaseRate] = useState(50);
  const [formAddPerKg, setFormAddPerKg] = useState(25);
  const [formDays, setFormDays] = useState(3);
  const [formPincodes, setFormPincodes] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/shipping/zones");
      const json = await res.json();
      if (json.success) setZones(json.data);
    } catch {
      setErrorMsg("Failed to load shipping zones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const openAddModal = () => {
    setEditingZone(null);
    setFormName("");
    setFormType("regional");
    setFormBaseRate(50);
    setFormAddPerKg(25);
    setFormDays(3);
    setFormPincodes("");
    setFormActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (z: ShippingZoneRecord) => {
    setEditingZone(z);
    setFormName(z.name);
    setFormType(z.zoneType);
    setFormBaseRate(z.baseRate);
    setFormAddPerKg(z.additionalPerKg);
    setFormDays(z.estimatedDeliveryDays);
    setFormPincodes((z.pincodePrefixes || []).join(", "));
    setFormActive(z.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const prefixes = formPincodes
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      const payload = {
        id: editingZone?.id,
        name: formName,
        zoneType: formType,
        baseRate: Number(formBaseRate),
        additionalPerKg: Number(formAddPerKg),
        estimatedDeliveryDays: Number(formDays),
        pincodePrefixes: prefixes,
        isActive: formActive,
      };

      const endpoint = editingZone ? `/api/shipping/zones/${editingZone.id}` : "/api/shipping/zones";
      const method = editingZone ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setNotice(json.message);
        setTimeout(() => setNotice(null), 3000);
        setIsModalOpen(false);
        fetchZones();
      } else {
        setErrorMsg(json.error || "Failed to save zone");
      }
    } catch {
      setErrorMsg("An error occurred while saving shipping zone.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete shipping zone "${name}"?`)) return;
    try {
      const res = await fetch(`/api/shipping/zones/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setNotice(json.message);
        setTimeout(() => setNotice(null), 3000);
        fetchZones();
      }
    } catch {
      setErrorMsg("Failed to delete zone");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/shipping/providers"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <span>Shipping Zones and Rates</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure regional destination pricing, base tariffs and per-kg weight tiers.
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Shipping Zone</span>
        </button>
      </div>

      {notice && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Zones Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Geographic Delivery Zones ({zones.length})</h2>
          <span className="text-xs text-slate-500">Tiered rate calculations</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading zones...</span>
          </div>
        ) : zones.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <p className="font-semibold text-slate-700">No shipping zones created</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px]">
                  <th className="py-3 px-4">Zone Name & Type</th>
                  <th className="py-3 px-4">Pincode Prefixes</th>
                  <th className="py-3 px-4">Base Rate (0.5kg)</th>
                  <th className="py-3 px-4">Additional / kg</th>
                  <th className="py-3 px-4">Transit Time</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {zones.map((z) => (
                  <tr key={z.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{z.name}</span>
                      <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                        {z.zoneType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {z.pincodePrefixes && z.pincodePrefixes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {z.pincodePrefixes.map((p, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px]">
                              {p}*
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">All remaining regions</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      ${Number(z.baseRate).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      +${Number(z.additionalPerKg).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{z.estimatedDeliveryDays} days</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          z.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {z.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(z)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(z.id, z.name)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {editingZone ? "Edit Shipping Zone" : "Add Shipping Zone"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Zone Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Metro to Metro Express"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Zone Classification</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                >
                  <option value="local">Local (Same City)</option>
                  <option value="regional">Regional (Same State)</option>
                  <option value="national">National (Interstate)</option>
                  <option value="special">Special / Remote Area</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Base Rate ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formBaseRate}
                    onChange={(e) => setFormBaseRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Add per Kg ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formAddPerKg}
                    onChange={(e) => setFormAddPerKg(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Est. Delivery Days</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formDays}
                  onChange={(e) => setFormDays(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pincode Prefixes (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formPincodes}
                  onChange={(e) => setFormPincodes(e.target.value)}
                  placeholder="e.g. 110, 400, 560 (Leave empty for catch-all)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="activeCheck" className="font-semibold text-slate-700">
                  Zone is active
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold"
                >
                  {saving ? "Saving..." : "Save Zone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
