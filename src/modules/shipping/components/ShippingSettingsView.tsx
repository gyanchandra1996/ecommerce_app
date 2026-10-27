"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building,
  Mail,
  Phone,
  MapPin,
  Package,
  ArrowLeft,
} from "lucide-react";
import { ShippingSettingsRecord } from "@/core/db/store";

export function ShippingSettingsView() {
  const [settings, setSettings] = useState<ShippingSettingsRecord | null>(null);
  const [providers, setProviders] = useState<{ id: string; name: string; code: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resSet, resProv] = await Promise.all([
        fetch("/api/shipping/settings"),
        fetch("/api/shipping/providers"),
      ]);
      const jsonSet = await resSet.json();
      const jsonProv = await resProv.json();

      if (jsonSet.success) setSettings(jsonSet.data);
      if (jsonProv.success) setProviders(jsonProv.data);
    } catch {
      setErrorMsg("Failed to load shipping settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);
      setErrorMsg(null);
      const res = await fetch("/api/shipping/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        setNotice("Shipping settings updated successfully!");
        setTimeout(() => setNotice(null), 3500);
      } else {
        setErrorMsg(json.error || "Failed to update settings");
      }
    } catch {
      setErrorMsg("An error occurred while saving settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span>Loading shipping configuration...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/shipping/providers"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              <span>Shipping & Logistics Settings</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Default courier assignment, warehouse origin address, package dimensions and delivery rules.
            </p>
          </div>
        </div>
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

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Card 1: Defaults */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Truck className="w-4 h-4 text-indigo-600" />
            <span>Default Carrier & Thresholds</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default Shipping Provider
              </label>
              <select
                value={settings.defaultProviderCode}
                onChange={(e) => setSettings({ ...settings, defaultProviderCode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.code}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default Package Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={settings.defaultWeightKg}
                onChange={(e) => setSettings({ ...settings, defaultWeightKg: parseFloat(e.target.value) || 0.5 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Free Shipping Order Threshold ($)
              </label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                COD Extra Surcharge ($)
              </label>
              <input
                type="number"
                value={settings.codExtraCharge}
                onChange={(e) => setSettings({ ...settings, codExtraCharge: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Warehouse / Origin Address */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-indigo-600" />
            <span>Store Dispatch Origin / Warehouse Address</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company / Hub Name</label>
              <input
                type="text"
                value={settings.senderAddress?.companyName || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    senderAddress: { ...settings.senderAddress, companyName: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Person Name</label>
              <input
                type="text"
                value={settings.senderAddress?.contactName || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    senderAddress: { ...settings.senderAddress, contactName: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                value={settings.senderAddress?.addressLine || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    senderAddress: { ...settings.senderAddress, addressLine: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={settings.senderAddress?.city || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    senderAddress: { ...settings.senderAddress, city: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">State / Province</label>
              <input
                type="text"
                value={settings.senderAddress?.state || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    senderAddress: { ...settings.senderAddress, state: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Postal Code (Pincode)</label>
              <input
                type="text"
                value={settings.senderAddress?.postalCode || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    senderAddress: { ...settings.senderAddress, postalCode: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={settings.senderAddress?.phone || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    senderAddress: { ...settings.senderAddress, phone: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Shipping Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
