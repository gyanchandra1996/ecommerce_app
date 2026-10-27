"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Truck,
  Search,
  RotateCcw,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  ExternalLink,
  Edit,
  Printer,
  Copy,
  ChevronRight,
  X,
  FileText,
  Ban,
  Activity,
  Send,
} from "lucide-react";
import { ShipmentRecord } from "@/core/db/store";
import { TrackingResult } from "@/core/shipping/types";

export function ShipmentsTrackingView() {
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Live Tracking Modal
  const [trackingModalData, setTrackingModalData] = useState<TrackingResult | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentRecord | null>(null);

  // Manual Edit Modal
  const [editingShipment, setEditingShipment] = useState<ShipmentRecord | null>(null);
  const [editStatus, setEditStatus] = useState("Shipped");
  const [editAwb, setEditAwb] = useState("");
  const [editCarrier, setEditCarrier] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Alerts
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "All") params.append("status", statusFilter);

      const res = await fetch(`/api/shipping/shipments?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setShipments(json.data);
      }
    } catch {
      setErrorMsg("Failed to load shipments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchShipments();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Live Tracking
  const handleLiveTrack = async (shipment: ShipmentRecord) => {
    setSelectedShipment(shipment);
    setTrackingLoading(true);
    setTrackingModalData(null);
    try {
      const res = await fetch(`/api/shipping/shipments/${shipment.id}/track`);
      const json = await res.json();
      if (json.success && json.data) {
        setTrackingModalData(json.data);
      } else {
        setErrorMsg(json.error || "Failed to load live tracking");
      }
    } catch {
      setErrorMsg("Error communicating with tracking adapter");
    } finally {
      setTrackingLoading(false);
    }
  };

  // Cancel Shipment
  const handleCancelShipment = async (shipment: ShipmentRecord) => {
    if (!confirm(`Cancel shipment #${shipment.awbNumber || shipment.id} with carrier?`)) return;
    try {
      const res = await fetch(`/api/shipping/shipments/${shipment.id}/cancel`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        setNotice(json.message || "Shipment cancelled successfully.");
        setTimeout(() => setNotice(null), 3500);
        fetchShipments();
      } else {
        setErrorMsg(json.error || "Failed to cancel shipment");
      }
    } catch {
      setErrorMsg("Error requesting shipment cancellation");
    }
  };

  // Open Edit Modal
  const openEditModal = (shipment: ShipmentRecord) => {
    setEditingShipment(shipment);
    setEditStatus(shipment.shipmentStatus);
    setEditAwb(shipment.awbNumber || "");
    setEditCarrier(shipment.carrier || "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShipment) return;
    try {
      setIsSaving(true);
      const res = await fetch(`/api/shipping/shipments/${editingShipment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipmentStatus: editStatus,
          awbNumber: editAwb.trim(),
          carrier: editCarrier.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNotice("Shipment details updated successfully!");
        setTimeout(() => setNotice(null), 3000);
        setEditingShipment(null);
        fetchShipments();
      } else {
        setErrorMsg(json.error || "Failed to update shipment");
      }
    } catch {
      setErrorMsg("Error updating shipment");
    } finally {
      setIsSaving(false);
    }
  };

  // KPIs
  const totalShipments = shipments.length;
  const inTransitCount = shipments.filter(
    (s) => s.shipmentStatus === "In Transit" || s.shipmentStatus === "Shipped"
  ).length;
  const deliveredCount = shipments.filter((s) => s.shipmentStatus === "Delivered").length;
  const readyCount = shipments.filter(
    (s) => s.shipmentStatus === "Pending" || s.shipmentStatus === "Ready to Ship"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            <span>Shipments & Logistics Tracking</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time package manifests, AWB numbers, live carrier checkpoints and label printing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchShipments}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/shipping/providers"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Shipping Providers</span>
          </Link>
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

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Shipments</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{totalShipments}</div>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 bg-amber-50/20 p-4">
          <span className="text-[11px] font-semibold text-amber-700 uppercase">Ready / Pending</span>
          <div className="text-2xl font-black text-amber-900 mt-1">{readyCount}</div>
        </div>

        <div className="bg-white rounded-xl border border-blue-200 bg-blue-50/20 p-4">
          <span className="text-[11px] font-semibold text-blue-700 uppercase">In Transit</span>
          <div className="text-2xl font-black text-blue-900 mt-1">{inTransitCount}</div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200 bg-emerald-50/20 p-4">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase">Delivered</span>
          <div className="text-2xl font-black text-emerald-900 mt-1">{deliveredCount}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <form onSubmit={handleSearchSubmit} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Search Shipments</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Order #, AWB Number, Recipient, Carrier..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
            >
              <option value="All">All Statuses</option>
              <option value="Ready to Ship">Ready to Ship</option>
              <option value="Shipped">Shipped</option>
              <option value="In Transit">In Transit</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </form>

      {/* Shipments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800">Shipment Records ({shipments.length})</h2>
          </div>
          <span className="text-xs text-slate-500">Linked directly to Orders table</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading shipments...</span>
          </div>
        ) : shipments.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <Truck className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">No shipments found</p>
            <p className="text-slate-400">Shipments are automatically generated when an order is dispatched.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px]">
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Carrier & Provider</th>
                  <th className="py-3 px-4">AWB / Waybill</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Charge</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    {/* Order ID */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-indigo-600">
                        #{s.orderNumber || s.orderId}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Recipient */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <span className="font-semibold text-slate-800 block truncate">
                        {s.recipientName || "Customer"}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate block">
                        {s.shippingAddress || "Address on File"}
                      </span>
                    </td>

                    {/* Carrier & Provider */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{s.carrier || "Standard Carrier"}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {s.shippingProviderName || s.shippingProviderCode || "Manual Carrier"}
                      </span>
                    </td>

                    {/* AWB Number */}
                    <td className="py-3.5 px-4">
                      {s.awbNumber ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {s.awbNumber}
                          </span>
                          <button
                            onClick={() => copyToClipboard(s.awbNumber!, s.id)}
                            className="text-slate-400 hover:text-slate-700"
                            title="Copy AWB"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          {copiedId === s.id && (
                            <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No AWB yet</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          s.shipmentStatus === "Delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : s.shipmentStatus === "Cancelled"
                            ? "bg-rose-100 text-rose-800"
                            : s.shipmentStatus === "In Transit" || s.shipmentStatus === "Shipped"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{s.shipmentStatus}</span>
                      </span>
                    </td>

                    {/* Shipping Charge */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      ${Number(s.shippingCharge || 0).toFixed(2)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Live Track */}
                        <button
                          onClick={() => handleLiveTrack(s)}
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[11px] font-semibold transition flex items-center gap-1"
                          title="Live Tracking Milestones"
                        >
                          <Activity className="w-3 h-3 text-indigo-600" />
                          <span>Track</span>
                        </button>

                        {/* Print Label */}
                        <a
                          href={`/api/shipping/shipments/${s.id}/label`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          title="Print Shipping Label"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </a>

                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          title="Update Manual Details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Cancel */}
                        {s.shipmentStatus !== "Cancelled" && s.shipmentStatus !== "Delivered" && (
                          <button
                            onClick={() => handleCancelShipment(s)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Cancel Shipment"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: LIVE TRACKING */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Tracking for #{selectedShipment.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedShipment(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {trackingLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>Fetching live carrier checkpoints...</span>
                </div>
              ) : trackingModalData ? (
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-700 uppercase">AWB NUMBER</span>
                      <div className="font-mono text-sm font-black text-slate-900">
                        {trackingModalData.awbNumber}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white">
                      {trackingModalData.status}
                    </span>
                  </div>

                  {trackingModalData.currentLocation && (
                    <div className="text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Last Location: <strong>{trackingModalData.currentLocation}</strong></span>
                    </div>
                  )}

                  {/* Milestones Timeline */}
                  <div>
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-3">
                      Transit Checkpoints ({trackingModalData.activities?.length || 0})
                    </h4>
                    <div className="space-y-3 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {trackingModalData.activities?.map((act, i) => (
                        <div key={i} className="relative">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white absolute -left-6 top-1" />
                          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">{act.status}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(act.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-slate-600 mt-1">{act.activity}</p>
                            <span className="text-[10px] text-slate-400 block mt-1">
                              Location: {act.location}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  No live tracking events recorded yet.
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedShipment(null)}
                className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT SHIPMENT */}
      {editingShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                Update Shipment for #{editingShipment.orderNumber}
              </h3>
              <button onClick={() => setEditingShipment(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Carrier Name</label>
                <input
                  type="text"
                  value={editCarrier}
                  onChange={(e) => setEditCarrier(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">AWB / Tracking Number</label>
                <input
                  type="text"
                  value={editAwb}
                  onChange={(e) => setEditAwb(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shipment Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                >
                  <option value="Ready to Ship">Ready to Ship</option>
                  <option value="Shipped">Shipped</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingShipment(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold"
                >
                  {isSaving ? "Saving..." : "Save Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
