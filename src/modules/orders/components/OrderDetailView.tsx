"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Truck,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  User,
  CheckCircle2,
  Clock,
  Printer,
  ExternalLink,
  Send,
  AlertCircle,
  Copy,
  Activity,
  Ban,
} from "lucide-react";
import { OrderRecord, ShipmentRecord, ShippingProviderRecord } from "@/core/db/store";

interface Props {
  order: OrderRecord;
  shipments: ShipmentRecord[];
  providers: ShippingProviderRecord[];
}

export function OrderDetailView({ order, shipments: initialShipments, providers }: Props) {
  const [shipments, setShipments] = useState<ShipmentRecord[]>(initialShipments);
  const [selectedProviderId, setSelectedProviderId] = useState(
    providers.find((p) => p.isDefault)?.id || providers[0]?.id || ""
  );
  const [weightKg, setWeightKg] = useState(0.85);
  const [customAwb, setCustomAwb] = useState("");
  const [isDispatching, setIsDispatching] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedAwb, setCopiedAwb] = useState<string | null>(null);

  // Rate estimate
  const [rateEstimate, setRateEstimate] = useState<number | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  // Live tracking modal
  const [trackingData, setTrackingData] = useState<any | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const isPaid = order.paymentStatus === "Paid";
  const isCod = order.gateway?.toLowerCase().includes("cod") || order.gateway?.toLowerCase().includes("cash");
  const canDispatch = isPaid || isCod;

  const handleEstimateRate = async () => {
    if (!selectedProviderId) return;
    try {
      setIsEstimating(true);
      const res = await fetch("/api/shipping/calculate-rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: selectedProviderId,
          destination: { pincode: (order as any).shippingAddressDetail?.postalCode || "110001" },
          packageDetails: { weightKg, isCod },
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setRateEstimate(json.data.rate);
      }
    } catch {
      // ignore
    } finally {
      setIsEstimating(false);
    }
  };

  const handleCreateShipment = async () => {
    try {
      setIsDispatching(true);
      setErrorMsg(null);
      setNotice(null);

      const res = await fetch("/api/shipping/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          shippingProviderId: selectedProviderId,
          weightKg,
          customAwb: customAwb.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setNotice(`Shipment dispatched successfully via ${json.data.carrier}! AWB: ${json.data.awbNumber}`);
        setShipments([json.data, ...shipments]);
      } else {
        setErrorMsg(json.error || "Failed to create shipment");
      }
    } catch {
      setErrorMsg("An unexpected error occurred while dispatching shipment.");
    } finally {
      setIsDispatching(false);
    }
  };

  const handleLiveTrack = async (shipmentId: string) => {
    setTrackingLoading(true);
    setTrackingData(null);
    try {
      const res = await fetch(`/api/shipping/shipments/${shipmentId}/track`);
      const json = await res.json();
      if (json.success) {
        setTrackingData(json.data);
      } else {
        setErrorMsg(json.error || "Failed to fetch live tracking");
      }
    } catch {
      setErrorMsg("Error fetching tracking");
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleCancelShipment = async (shipmentId: string) => {
    if (!confirm("Are you sure you want to cancel this shipment?")) return;
    try {
      const res = await fetch(`/api/shipping/shipments/${shipmentId}/cancel`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        setNotice(json.message);
        setShipments(
          shipments.map((s) => (s.id === shipmentId ? { ...s, shipmentStatus: "Cancelled" as any } : s))
        );
      } else {
        setErrorMsg(json.error || "Failed to cancel shipment");
      }
    } catch {
      setErrorMsg("Error cancelling shipment");
    }
  };

  const copyAwb = (awb: string) => {
    navigator.clipboard.writeText(awb);
    setCopiedAwb(awb);
    setTimeout(() => setCopiedAwb(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-xs">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Order #{order.orderNumber}
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  order.paymentStatus === "Paid"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {order.paymentStatus}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  order.orderStatus === "Delivered"
                    ? "bg-emerald-100 text-emerald-800"
                    : order.orderStatus === "Shipped"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {order.orderStatus}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Placed on {new Date(order.orderDate).toLocaleString()} • Payment via {order.gateway}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {shipments[0] && (
            <a
              href={`/api/shipping/shipments/${shipments[0].id}/label`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Shipping Label</span>
            </a>
          )}
          <Link
            href="/admin/shipping/tracking"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>All Shipments</span>
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

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer & Items (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" />
                <span>Ordered Items ({order.items?.length || 0})</span>
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items?.map((it, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {it.imageUrl ? (
                        <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{it.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Item #: {it.itemNo || "ITEM-" + (idx + 1)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold font-mono text-slate-900">${(it.price * it.quantity).toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400">
                      ${it.price.toFixed(2)} × {it.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-medium">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee:</span>
                <span className="font-mono font-medium">${order.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="font-mono">${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Destination */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Customer & Delivery Destination</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Customer Name</span>
                <p className="font-bold text-slate-800 text-xs mt-0.5">{order.customerName}</p>
                {order.customerEmail && <p className="text-slate-500 mt-0.5">{order.customerEmail}</p>}
                {order.customerPhone && <p className="text-slate-500 mt-0.5">Tel: {order.customerPhone}</p>}
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Shipping Address</span>
                <p className="text-slate-700 font-medium mt-0.5">{order.shippingAddress || "Not specified"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Dispatch & Shipment History */}
        <div className="space-y-6">
          {/* Dispatch Box */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>Dispatch & Carrier Fulfillment</span>
              </h2>
            </div>

            {!canDispatch ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Awaiting Payment / COD Confirmation</span>
                </div>
                <p className="text-[11px] text-amber-700">
                  Per compliance rules, shipments cannot be created until the order is marked as Paid or confirmed as Cash on Delivery (COD).
                </p>
              </div>
            ) : shipments.some((s) => !["Cancelled", "Returned"].includes(s.shipmentStatus)) ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">Shipment Active</span>
                  <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">
                    {shipments[0]?.shipmentStatus}
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>AWB: {shipments[0]?.awbNumber}</span>
                  <button onClick={() => copyAwb(shipments[0]?.awbNumber || "")} title="Copy AWB">
                    <Copy className="w-3 h-3 text-slate-400" />
                  </button>
                  {copiedAwb && <span className="text-[10px] text-emerald-700 font-bold">Copied!</span>}
                </div>
                <p className="text-[11px] text-slate-600">
                  Carrier: <strong>{shipments[0]?.carrier}</strong> via {shipments[0]?.shippingProviderName}
                </p>

                <div className="flex items-center gap-2 pt-2 border-t border-emerald-200">
                  <button
                    onClick={() => handleLiveTrack(shipments[0].id)}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-center text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <Activity className="w-3 h-3" />
                    <span>Live Tracking</span>
                  </button>
                  <a
                    href={`/api/shipping/shipments/${shipments[0].id}/label`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 rounded transition"
                    title="Print Label"
                  >
                    <Printer className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Provider Select */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Shipping Provider <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedProviderId}
                    onChange={(e) => setSelectedProviderId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                  >
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code}) {p.isDefault ? "— Default" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Weight */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Package Weight (kg)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      value={weightKg}
                      onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0.5)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleEstimateRate}
                      disabled={isEstimating}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs whitespace-nowrap"
                    >
                      {isEstimating ? "Checking..." : "Check Rate"}
                    </button>
                  </div>
                  {rateEstimate !== null && (
                    <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                      Estimated Shipping Tariff: ${rateEstimate.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Optional Custom AWB */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Custom AWB / Waybill (Optional)
                  </label>
                  <input
                    type="text"
                    value={customAwb}
                    onChange={(e) => setCustomAwb(e.target.value)}
                    placeholder="Auto-generated if left blank"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>

                {/* Create Shipment Button */}
                <button
                  type="button"
                  onClick={handleCreateShipment}
                  disabled={isDispatching}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isDispatching ? "Dispatching Order..." : "Create Shipment & Generate AWB"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Shipment History */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Shipment History ({shipments.length})</span>
            </h2>

            {shipments.length === 0 ? (
              <p className="text-slate-400 italic text-[11px]">No shipments dispatched yet.</p>
            ) : (
              <div className="space-y-2.5">
                {shipments.map((s) => (
                  <div key={s.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800">{s.awbNumber || "Pending"}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.shipmentStatus === "Cancelled"
                            ? "bg-rose-100 text-rose-800"
                            : s.shipmentStatus === "Delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {s.shipmentStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Carrier: {s.carrier} ({s.shippingProviderName})
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[10px]">
                      <span className="text-slate-400">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        {s.shipmentStatus !== "Cancelled" && (
                          <button
                            onClick={() => handleCancelShipment(s.id)}
                            className="text-rose-600 hover:underline font-semibold"
                          >
                            Cancel
                          </button>
                        )}
                        <a
                          href={`/api/shipping/shipments/${s.id}/label`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline font-semibold"
                        >
                          Print Label
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Tracking Modal */}
      {trackingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-xs">Live Tracking Checkpoints</h3>
              <button onClick={() => setTrackingData(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center bg-indigo-50 p-2.5 rounded border border-indigo-100">
                <span className="font-mono font-bold text-slate-900">{trackingData.awbNumber}</span>
                <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold text-[10px]">
                  {trackingData.status}
                </span>
              </div>
              <div className="space-y-2">
                {trackingData.activities?.map((act: any, i: number) => (
                  <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px]">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{act.status}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {new Date(act.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{act.activity}</p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{act.location}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
