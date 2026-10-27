"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  RotateCcw,
  Eye,
  Trash2,
  Calendar,
  CreditCard,
  Package,
  User,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  X,
  Plus,
  Send,
  Printer,
  ExternalLink,
  Activity,
  AlertCircle,
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
  orderStatus: "Cancelled By System" | "Paid" | "Delivered" | "Pending" | "Shipped";
  totalPrice: number;
  subtotal: number;
  shippingCost: number;
  shippingAddress?: string;
  trackingNumber?: string;
  carrier?: string;
  shipmentStatus?: string;
  shippedAt?: string;
  items: OrderItem[];
}

interface ManageOrdersProps {
  initialStatus?: string;
  title?: string;
}

export function ManageOrdersView({ initialStatus = "All", title = "Manage Order" }: ManageOrdersProps = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State matching Screenshot 4
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [fromOrderNo, setFromOrderNo] = useState("");
  const [toOrderNo, setToOrderNo] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [gatewayFilter, setGatewayFilter] = useState("All");
  const [search, setSearch] = useState("");

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Shipping Providers & Dispatch state
  const [shippingProviders, setShippingProviders] = useState<{ id: string; name: string; code: string; isDefault: boolean }[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [dispatchWeightKg, setDispatchWeightKg] = useState(0.8);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/shipping/providers?activeOnly=true")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setShippingProviders(json.data);
          const def = json.data.find((p: any) => p.isDefault) || json.data[0];
          if (def) setSelectedProviderId(def.id);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateShipment = async (order: Order) => {
    try {
      setIsDispatching(true);
      setDispatchError(null);
      setDispatchSuccess(null);

      const res = await fetch("/api/shipping/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          shippingProviderId: selectedProviderId,
          weightKg: dispatchWeightKg,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setDispatchSuccess(`Shipment created with ${json.data.carrier}! AWB: ${json.data.awbNumber}`);
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                orderStatus: "Shipped",
                shipmentStatus: "Ready to Ship",
                trackingNumber: json.data.awbNumber,
                carrier: json.data.carrier,
              }
            : null
        );
        fetchOrders();
      } else {
        setDispatchError(json.error || "Failed to create shipment");
      }
    } catch {
      setDispatchError("Network error while creating shipment");
    } finally {
      setIsDispatching(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (gatewayFilter !== "All") params.append("gateway", gatewayFilter);
      if (fromOrderNo.trim()) params.append("fromOrderNo", fromOrderNo.trim());
      if (toOrderNo.trim()) params.append("toOrderNo", toOrderNo.trim());
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/orders?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setOrders(json.data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, gatewayFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleResetFilters = () => {
    setStatusFilter("All");
    setFromOrderNo("");
    setToOrderNo("");
    setFromDate("");
    setToDate("");
    setGatewayFilter("All");
    setSearch("");
    setTimeout(() => {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((j) => {
          if (j.data) setOrders(j.data);
        });
    }, 50);
  };

  const handleStatusChange = async (orderId: string, newStatus: Order["orderStatus"]) => {
    try {
      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
      );

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      if (!res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      fetchOrders();
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to delete order #${orderNumber}?`)) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  };

  const getStatusBadge = (status: Order["orderStatus"]) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Delivered":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Shipped":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Cancelled By System":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const formatElapsed = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 365) return `${Math.floor(diffDays / 365)} years ago`;
      if (diffDays > 30) return `${Math.floor(diffDays / 30)} months ago`;
      if (diffDays > 0) return `${diffDays} days ago`;
      if (diffHours > 0) return `${diffHours} hours ago`;
      return "just now";
    } catch {
      return "recently";
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Breadcrumb matching Screenshot 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            <span>{title}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            <span className="text-emerald-600 font-medium">Order</span> /{" "}
            <span className="text-slate-400">{title}</span>
          </p>
        </div>

        <Link
          href="/admin/orders/create"
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Order</span>
        </Link>
      </div>

      {/* Top Filter Card matching Screenshot 4 */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Status Dropdown */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Cancelled By System">Cancelled By System</option>
              <option value="Paid">Paid</option>
              <option value="Delivered">Delivered</option>
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
            </select>
          </div>

          {/* Order Number Range */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Order Number (From / To)</label>
            <div className="flex items-center space-x-1.5">
              <input
                type="text"
                placeholder="From"
                value={fromOrderNo}
                onChange={(e) => setFromOrderNo(e.target.value)}
                className="w-1/2 px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-slate-400">-</span>
              <input
                type="text"
                placeholder="To"
                value={toOrderNo}
                onChange={(e) => setToOrderNo(e.target.value)}
                className="w-1/2 px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Date Range (From / To)</label>
            <div className="flex items-center space-x-1.5">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-1/2 px-2 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-slate-400">-</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-1/2 px-2 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Gateway */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Gateway</label>
            <select
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="All">All Gateways</option>
              <option value="PayPal">PayPal</option>
              <option value="Stripe">Stripe</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Authorize.net">Authorize.net</option>
              <option value="COD">Cash on Delivery</option>
            </select>
          </div>
        </div>

        {/* Search Bar & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search by Order #, Customer Name, or Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-8 px-3.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md shadow-xs flex items-center space-x-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="submit"
              className="h-8 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs flex items-center space-x-1.5 transition"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </form>

      {/* Orders Table matching Screenshot 4 */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Products</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No orders match the selected filters.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                    {/* Order Number & Relative Elapsed Date */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">
                        #{ord.orderNumber}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {new Date(ord.orderDate).toLocaleDateString()} •{" "}
                        <span className="text-slate-400">{formatElapsed(ord.orderDate)}</span>
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{ord.customerName}</div>
                      {ord.customerEmail && (
                        <div className="text-[11px] text-slate-500">{ord.customerEmail}</div>
                      )}
                      {ord.customerPhone && (
                        <div className="text-[10px] text-slate-400 font-mono">{ord.customerPhone}</div>
                      )}
                    </td>

                    {/* Products thumbnail + SKU + name + qty */}
                    <td className="py-3.5 px-4 min-w-[220px]">
                      <div className="space-y-1.5">
                        {ord.items.map((it) => (
                          <div key={it.id} className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {it.imageUrl ? (
                                <img
                                  src={it.imageUrl}
                                  alt={it.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-slate-800 truncate max-w-[160px]">
                                {it.name}
                              </p>
                              <div className="text-[10px] text-slate-500 font-mono flex items-center space-x-1">
                                <span>{it.itemNo}</span>
                                <span>•</span>
                                <span className="font-semibold text-emerald-700">${it.price.toFixed(2)}</span>
                                <span>•</span>
                                <span className="bg-slate-100 px-1 rounded text-slate-600">x{it.quantity}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Payment Gateway & Status */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {ord.gateway}
                      </span>
                      <div className="text-[10px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                        {ord.paymentStatus}
                      </div>
                    </td>

                    {/* Interactive Inline Status Dropdown matching Screenshot 4 */}
                    <td className="py-3.5 px-4">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) =>
                          handleStatusChange(ord.id, e.target.value as Order["orderStatus"])
                        }
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md border shadow-xs focus:outline-none transition cursor-pointer ${getStatusBadge(
                          ord.orderStatus
                        )}`}
                      >
                        <option value="Paid">Paid</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Cancelled By System">Cancelled By System</option>
                      </select>
                    </td>

                    {/* Total Price */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        ${ord.totalPrice.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {ord.items.length} item{ord.items.length !== 1 ? "s" : ""}
                      </div>
                    </td>

                    {/* Actions: View Details / Delete */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded transition"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(ord.id, ord.orderNumber)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Order Details #{selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {/* Order Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Date</span>
                  <div className="font-medium text-slate-800 mt-0.5">
                    {new Date(selectedOrder.orderDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Status</span>
                  <div className="font-semibold text-emerald-700 mt-0.5">
                    {selectedOrder.orderStatus}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Payment</span>
                  <div className="font-medium text-slate-800 mt-0.5">{selectedOrder.gateway}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total</span>
                  <div className="font-bold text-slate-900 font-mono mt-0.5">
                    ${selectedOrder.totalPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Customer & Shipping */}
              <div className="space-y-1 p-3 border border-slate-200 rounded-lg">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Customer & Shipping Info</span>
                </h4>
                <p className="text-slate-700 font-semibold">{selectedOrder.customerName}</p>
                {selectedOrder.customerEmail && (
                  <p className="text-slate-500">Email: {selectedOrder.customerEmail}</p>
                )}
                {selectedOrder.customerPhone && (
                  <p className="text-slate-500">Phone: {selectedOrder.customerPhone}</p>
                )}
                {selectedOrder.shippingAddress && (
                  <p className="text-slate-600 flex items-start gap-1 pt-1 border-t border-slate-100 mt-2">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                    <span>{selectedOrder.shippingAddress}</span>
                  </p>
                )}
              </div>

              {/* Items Breakdown */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Ordered Items ({selectedOrder.items.length})
                </h4>
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
                  {selectedOrder.items.map((it) => (
                    <div key={it.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {it.imageUrl ? (
                            <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{it.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Item No: {it.itemNo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-mono text-slate-900">${(it.price * it.quantity).toFixed(2)}</p>
                        <p className="text-[10px] text-slate-400">
                          ${it.price.toFixed(2)} x {it.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculation */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium">${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Cost</span>
                  <span className="font-mono font-medium">${selectedOrder.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-sm pt-1.5 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="font-mono">${selectedOrder.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping & Dispatch Section */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Truck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Shipping & Fulfillment</span>
                  </h4>
                  {selectedOrder.trackingNumber ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      {selectedOrder.shipmentStatus || "Dispatched"}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Unfulfilled
                    </span>
                  )}
                </div>

                {dispatchSuccess && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{dispatchSuccess}</span>
                  </div>
                )}

                {dispatchError && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-800 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{dispatchError}</span>
                  </div>
                )}

                {selectedOrder.trackingNumber ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Carrier:</span>
                      <strong className="text-slate-800">{selectedOrder.carrier || "Standard Carrier"}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">AWB Number:</span>
                      <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {selectedOrder.trackingNumber}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                      <a
                        href={`/api/shipping/shipments/${selectedOrder.trackingNumber}/label`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3 text-slate-500" />
                        <span>Print Label</span>
                      </a>

                      <Link
                        href={`/admin/shipping/tracking?search=${selectedOrder.trackingNumber}`}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-semibold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Track Order</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                          Select Carrier
                        </label>
                        <select
                          value={selectedProviderId}
                          onChange={(e) => setSelectedProviderId(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                        >
                          {shippingProviders.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} {p.isDefault ? "(Default)" : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={dispatchWeightKg}
                          onChange={(e) => setDispatchWeightKg(parseFloat(e.target.value) || 0.5)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCreateShipment(selectedOrder)}
                      disabled={isDispatching}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isDispatching ? "Dispatching..." : "Create Shipment & Generate AWB"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
