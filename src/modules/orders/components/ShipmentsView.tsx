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
  User,
  ExternalLink,
  Edit,
  Printer,
  Copy,
  ChevronRight,
  Filter,
  Plus,
  ArrowRight,
  X,
  FileText,
  DollarSign,
  ShieldCheck,
} from "lucide-react";

interface OrderItem {
  id: string;
  itemNo: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  orderDate: string;
  gateway: string;
  paymentStatus: "Paid" | "Pending" | "Failed" | "Cancelled";
  orderStatus: "Cancelled By System" | "Paid" | "Delivered" | "Pending" | "Shipped" | "Processing";
  totalPrice: number;
  subtotal: number;
  shippingCost: number;
  shippingAddress?: string;
  shippingAddressDetail?: any;
  billingAddressDetail?: any;
  items: OrderItem[];
  trackingNumber?: string;
  carrier?: string;
  shipmentStatus?: "Pending" | "Ready to Ship" | "Shipped" | "In Transit" | "Out for Delivery" | "Delivered" | "Returned";
  shippedAt?: string;
  estimatedDelivery?: string;
}

const CARRIERS = [
  "BlueDart Express",
  "Delhivery",
  "FedEx",
  "DHL Express",
  "DTDC Express",
  "India Post Speed Post",
  "Ecom Express",
  "Shadowfax",
  "UPS",
  "Standard Ground Delivery",
];

export function ShipmentsView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState("All");
  const [carrierFilter, setCarrierFilter] = useState("All");

  // Modal: Update Shipment
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editCarrier, setEditCarrier] = useState("");
  const [editTrackingNumber, setEditTrackingNumber] = useState("");
  const [editShipmentStatus, setEditShipmentStatus] = useState<string>("Shipped");
  const [editEstimatedDelivery, setEditEstimatedDelivery] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isSavingShipment, setIsSavingShipment] = useState(false);

  // Modal: Packing Slip / Shipping Label
  const [packingSlipOrder, setPackingSlipOrder] = useState<Order | null>(null);

  // Alerts
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (shipmentStatusFilter !== "All") params.append("shipmentStatus", shipmentStatusFilter);
      if (carrierFilter !== "All") params.append("carrier", carrierFilter);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOrders(json.data);
      }
    } catch (err) {
      console.error("Failed to load shipments:", err);
      setErrorMsg("Failed to load shipments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [shipmentStatusFilter, carrierFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchShipments();
  };

  const handleResetFilters = () => {
    setSearch("");
    setShipmentStatusFilter("All");
    setCarrierFilter("All");
  };

  // Open Update Shipment Modal
  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setEditCarrier(order.carrier || "BlueDart Express");
    setEditTrackingNumber(order.trackingNumber || "");
    setEditShipmentStatus(order.shipmentStatus || (order.orderStatus === "Delivered" ? "Delivered" : "Shipped"));
    setEditEstimatedDelivery(
      order.estimatedDelivery
        ? order.estimatedDelivery.slice(0, 10)
        : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    );
    setEditNotes("");
  };

  // Generate random tracking number
  const generateTrackingNumber = () => {
    const prefix = (editCarrier.slice(0, 3).toUpperCase() || "TRK");
    const randNum = Math.floor(100000000 + Math.random() * 900000000);
    setEditTrackingNumber(`${prefix}-${randNum}`);
  };

  // Save Shipment Updates
  const handleSaveShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      setIsSavingShipment(true);
      setErrorMsg(null);

      // Determine new orderStatus matching shipment
      let newOrderStatus = editingOrder.orderStatus;
      if (editShipmentStatus === "Delivered") {
        newOrderStatus = "Delivered";
      } else if (["Shipped", "In Transit", "Out for Delivery"].includes(editShipmentStatus)) {
        newOrderStatus = "Shipped";
      }

      const payload = {
        carrier: editCarrier.trim(),
        trackingNumber: editTrackingNumber.trim(),
        shipmentStatus: editShipmentStatus,
        orderStatus: newOrderStatus,
        estimatedDelivery: editEstimatedDelivery ? new Date(editEstimatedDelivery).toISOString() : undefined,
        shippedAt: editingOrder.shippedAt || (["Shipped", "In Transit"].includes(editShipmentStatus) ? new Date().toISOString() : undefined),
        notes: editNotes ? `Shipment updated: ${editNotes}` : `Shipment marked as ${editShipmentStatus}`,
        performedBy: "Admin",
      };

      const res = await fetch(`/api/orders/${editingOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setNotice(`Shipment updated successfully for Order #${editingOrder.orderNumber}`);
        setTimeout(() => setNotice(null), 3500);
        setEditingOrder(null);
        fetchShipments();
      } else {
        setErrorMsg(json.error || "Failed to update shipment");
      }
    } catch {
      setErrorMsg("An error occurred while updating shipment details");
    } finally {
      setIsSavingShipment(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick stats calculation
  const totalShipments = orders.length;
  const pendingDispatch = orders.filter(
    (o) => !o.shipmentStatus || o.shipmentStatus === "Pending" || o.shipmentStatus === "Ready to Ship"
  ).length;
  const inTransit = orders.filter(
    (o) => o.shipmentStatus === "Shipped" || o.shipmentStatus === "In Transit"
  ).length;
  const outForDelivery = orders.filter((o) => o.shipmentStatus === "Out for Delivery").length;
  const delivered = orders.filter((o) => o.shipmentStatus === "Delivered").length;

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            <span>Shipments & Logistics Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            <Link href="/admin/orders" className="text-indigo-600 font-medium hover:underline">
              Orders
            </Link>{" "}
            / <span className="text-slate-400">Shipments</span>
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
            href="/admin/orders/create"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Order</span>
          </Link>
        </div>
      </div>

      {notice && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-xs sm:text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Shipments</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-800">{totalShipments}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">All</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-amber-200/80 bg-amber-50/20 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">Pending Dispatch</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-900">{pendingDispatch}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-blue-200/80 bg-blue-50/20 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">In Transit</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-blue-900">{inTransit}</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-purple-200/80 bg-purple-50/20 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block">Out for Delivery</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-purple-900">{outForDelivery}</span>
            <Package className="w-4 h-4 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200/80 bg-emerald-50/20 p-4 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Delivered</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-900">{delivered}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 space-y-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Search Shipments</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Order #, Customer, Tracking ID, City..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Shipment Status</label>
            <select
              value={shipmentStatusFilter}
              onChange={(e) => setShipmentStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Dispatch</option>
              <option value="Ready to Ship">Ready to Ship</option>
              <option value="Shipped">Shipped</option>
              <option value="In Transit">In Transit</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Returned">Returned</option>
            </select>
          </div>

          {/* Carrier */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Logistics Carrier</label>
            <select
              value={carrierFilter}
              onChange={(e) => setCarrierFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Carriers</option>
              {CARRIERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
          >
            Reset Filters
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Apply Search</span>
          </button>
        </div>
      </form>

      {/* Shipments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800">Shipments Queue ({orders.length})</h2>
          </div>
          <span className="text-xs text-slate-500">Live order fulfillment status</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading shipments...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <Truck className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">No shipments found</p>
            <p className="text-slate-400">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px]">
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Carrier & Tracking</th>
                  <th className="py-3 px-4">Shipment Status</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => {
                  const status = ord.shipmentStatus || (ord.orderStatus === "Delivered" ? "Delivered" : ord.orderStatus === "Shipped" ? "Shipped" : "Pending");
                  const carrier = ord.carrier || "Standard Carrier";
                  const tracking = ord.trackingNumber;

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                      {/* Order info */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>#{ord.orderNumber}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              ord.paymentStatus === "Paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {ord.paymentStatus}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {new Date(ord.orderDate).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Recipient */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">{ord.customerName}</span>
                        {ord.customerPhone && (
                          <span className="text-[11px] text-slate-500 block">{ord.customerPhone}</span>
                        )}
                        {ord.customerEmail && (
                          <span className="text-[11px] text-slate-400 block truncate max-w-[150px]">
                            {ord.customerEmail}
                          </span>
                        )}
                      </td>

                      {/* Destination */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="flex items-start gap-1 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="text-[11px] line-clamp-2">
                            {ord.shippingAddress || "Not provided"}
                          </span>
                        </div>
                      </td>

                      {/* Carrier & Tracking */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block text-[11px]">{carrier}</span>
                        {tracking ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[11px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-medium">
                              {tracking}
                            </span>
                            <button
                              onClick={() => copyToClipboard(tracking, ord.id)}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copy Tracking ID"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {copiedId === ord.id && (
                              <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No tracking ID yet</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            status === "Delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : status === "Shipped" || status === "In Transit"
                              ? "bg-blue-100 text-blue-800"
                              : status === "Out for Delivery"
                              ? "bg-purple-100 text-purple-800"
                              : status === "Ready to Ship"
                              ? "bg-indigo-100 text-indigo-800"
                              : status === "Returned"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{status}</span>
                        </span>

                        {ord.estimatedDelivery && (
                          <span className="text-[10px] text-slate-400 block mt-1">
                            Est: {new Date(ord.estimatedDelivery).toLocaleDateString()}
                          </span>
                        )}
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700 block">
                          {ord.items?.length || 0} items
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          ${Number(ord.totalPrice).toFixed(2)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(ord)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Update Shipment & Tracking"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setPackingSlipOrder(ord)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            title="Print Packing Slip & Shipping Label"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: UPDATE SHIPMENT */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>Update Shipment for #{editingOrder.orderNumber}</span>
              </h2>
              <button
                onClick={() => setEditingOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShipment} className="p-6 space-y-4 text-xs sm:text-sm">
              {/* Carrier Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Logistics Carrier *</label>
                <select
                  value={editCarrier}
                  onChange={(e) => setEditCarrier(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                >
                  {CARRIERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="Custom">Other Carrier...</option>
                </select>
                {editCarrier === "Custom" && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom carrier name"
                    onChange={(e) => setEditCarrier(e.target.value)}
                    className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                )}
              </div>

              {/* Tracking ID */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">Tracking Number / AWB</label>
                  <button
                    type="button"
                    onClick={generateTrackingNumber}
                    className="text-xs text-indigo-600 hover:underline font-semibold"
                  >
                    Auto-Generate AWB
                  </button>
                </div>
                <input
                  type="text"
                  value={editTrackingNumber}
                  onChange={(e) => setEditTrackingNumber(e.target.value)}
                  placeholder="e.g. BD-982341920 or DEL-881290"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                />
              </div>

              {/* Shipment Status */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shipment Status *</label>
                <select
                  value={editShipmentStatus}
                  onChange={(e) => setEditShipmentStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                >
                  <option value="Pending">Pending Dispatch</option>
                  <option value="Ready to Ship">Ready to Ship</option>
                  <option value="Shipped">Shipped</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>

              {/* Estimated Delivery Date */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimated Delivery Date</label>
                <input
                  type="date"
                  value={editEstimatedDelivery}
                  onChange={(e) => setEditEstimatedDelivery(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              {/* Shipment Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Remarks (Optional)</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Handed over to courier hub at 2:30 PM"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingShipment}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSavingShipment ? "Saving..." : "Save Shipment Details"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE PACKING SLIP & SHIPPING LABEL */}
      {packingSlipOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-slate-800 text-sm">
                  Packing Slip & Shipping Label — #{packingSlipOrder.orderNumber}
                </h2>
              </div>
              <button
                onClick={() => setPackingSlipOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Content */}
            <div id="printable-slip" className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700 font-sans">
              {/* Shipping Label Box */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-black text-slate-900 text-base tracking-wider">EXPRESS SHIPPING LABEL</h3>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Carrier: {packingSlipOrder.carrier || "BlueDart Express"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold bg-white px-2.5 py-1 rounded border border-slate-300 inline-block">
                      AWB: {packingSlipOrder.trackingNumber || `AWB-${packingSlipOrder.orderNumber}`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[10px] block">SHIP FROM:</span>
                    <p className="font-bold text-slate-800">emox Logistics Hub</p>
                    <p className="text-slate-600">Unit 14, Prime Industrial Area</p>
                    <p className="text-slate-600">Bandra West, Mumbai, MH 400050</p>
                    <p className="text-slate-600">Phone: +91 1800-123-4567</p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[10px] block">DELIVER TO:</span>
                    <p className="font-black text-slate-900 text-sm">{packingSlipOrder.customerName}</p>
                    <p className="text-slate-700 font-medium">{packingSlipOrder.shippingAddress || "Customer Address"}</p>
                    {packingSlipOrder.customerPhone && (
                      <p className="text-slate-700 font-bold mt-1">Tel: {packingSlipOrder.customerPhone}</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span>Payment: <strong className="uppercase">{packingSlipOrder.gateway} ({packingSlipOrder.paymentStatus})</strong></span>
                  <span>Total Amount: <strong>${Number(packingSlipOrder.totalPrice).toFixed(2)}</strong></span>
                </div>
              </div>

              {/* Packing Slip Items Table */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">Order Packing Items</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 text-[11px]">
                        <th className="py-2 px-3">Item #</th>
                        <th className="py-2 px-3">Product Name</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Unit Price</th>
                        <th className="py-2 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {packingSlipOrder.items?.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-mono text-slate-500">{it.itemNo || "ITEM-" + (idx + 1)}</td>
                          <td className="py-2 px-3 font-semibold text-slate-800">{it.name}</td>
                          <td className="py-2 px-3 text-center font-bold">{it.quantity}</td>
                          <td className="py-2 px-3 text-right">${Number(it.price).toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-medium">
                            ${(Number(it.price) * Number(it.quantity)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <div className="w-56 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span>${Number(packingSlipOrder.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping Fee:</span>
                      <span>${Number(packingSlipOrder.shippingCost).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                      <span>Total:</span>
                      <span>${Number(packingSlipOrder.totalPrice).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Print Action */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs text-slate-500">Press Print to generate paper slip</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPackingSlipOrder(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 text-xs font-semibold hover:bg-white"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Packing Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
