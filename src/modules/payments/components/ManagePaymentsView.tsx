"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RotateCcw,
  Eye,
  ExternalLink,
  DollarSign,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileText,
} from "lucide-react";

interface PaymentItem {
  id: string;
  orderId: string;
  orderNumber?: string;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  paymentGateway: string;
  gatewayOrderId?: string;
  transactionId?: string;
  paymentMethod?: string;
  amount: number;
  currency: string;
  paymentStatus: "Pending" | "Processing" | "Paid" | "Failed" | "Cancelled" | "Refunded";
  gatewayResponse?: any;
  failureReason?: string;
  refundAmount?: number;
  refundReference?: string;
  refundReason?: string;
  refundedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentStats {
  totalRevenue: number;
  totalRefundedAmount: number;
  totalCount: number;
  paidCount: number;
  pendingCount: number;
  failedCount: number;
  refundedCount: number;
}

export function ManagePaymentsView() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    totalRefundedAmount: 0,
    totalCount: 0,
    paidCount: 0,
    pendingCount: 0,
    failedCount: 0,
    refundedCount: 0,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gatewayFilter, setGatewayFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 15;

  // Modals
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [refundPayment, setRefundPayment] = useState<PaymentItem | null>(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [relatedPayments, setRelatedPayments] = useState<PaymentItem[]>([]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);
      else if (activeTab !== "all") params.set("status", activeTab);
      if (gatewayFilter !== "all") params.set("gateway", gatewayFilter);
      if (fromDate) params.set("fromDate", fromDate);
      if (toDate) params.set("toDate", toDate);
      params.set("page", page.toString());
      params.set("limit", limit.toString());

      const res = await fetch(`/api/admin/payments?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setPayments(json.data || []);
        if (json.stats) setStats(json.stats);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages || 1);
        }
      }
    } catch (e) {
      console.error("Failed to load payments:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter, gatewayFilter, fromDate, toDate, activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPayments();
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setGatewayFilter("all");
    setFromDate("");
    setToDate("");
    setActiveTab("all");
    setPage(1);
  };

  const handleOpenDetails = async (payment: PaymentItem) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
    try {
      const res = await fetch(`/api/admin/payments/${payment.id}`);
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.payment) setSelectedPayment(json.data.payment);
        if (json.data.relatedPayments) setRelatedPayments(json.data.relatedPayments);
      }
    } catch {}
  };

  const handleOpenRefund = (payment: PaymentItem) => {
    setRefundPayment(payment);
    const maxRefundable = payment.amount - (payment.refundAmount || 0);
    setRefundAmount(maxRefundable.toFixed(2));
    setRefundReason("Customer requested return/cancellation");
    setRefundError(null);
    setIsRefundModalOpen(true);
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundPayment) return;
    setRefundSubmitting(true);
    setRefundError(null);

    try {
      const res = await fetch(`/api/admin/payments/${refundPayment.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refundAmount: Number(refundAmount),
          reason: refundReason,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to process refund.");
      }
      setIsRefundModalOpen(false);
      setRefundPayment(null);
      fetchPayments();
    } catch (err: any) {
      setRefundError(err.message || "An error occurred.");
    } finally {
      setRefundSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Paid</span>
          </span>
        );
      case "pending":
      case "processing":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending</span>
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Failed</span>
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <RotateCcw className="w-3 h-3 text-purple-600" />
            <span>Refunded</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <AlertCircle className="w-3 h-3 text-slate-500" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Payment Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dedicated database transactions, multiple gateway records, signature verification & audit history
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => fetchPayments()}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/gateways"
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Gateway Settings</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Settled</div>
          <div className="text-xl font-black text-slate-900 mt-1">
            ₹{stats.totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center space-x-1">
            <span>{stats.paidCount} paid transactions</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Transactions</div>
          <div className="text-xl font-black text-slate-900 mt-1">{stats.totalCount}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Across all gateways</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Pending / In-Flight</div>
          <div className="text-xl font-black text-amber-700 mt-1">{stats.pendingCount}</div>
          <div className="text-[11px] font-semibold text-amber-600 mt-1">Awaiting confirmation</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Failed / Cancelled</div>
          <div className="text-xl font-black text-rose-700 mt-1">{stats.failedCount}</div>
          <div className="text-[11px] font-semibold text-rose-500 mt-1">Retry available</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Total Refunded</div>
          <div className="text-xl font-black text-purple-700 mt-1">
            ₹{stats.totalRefundedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-semibold text-purple-600 mt-1">{stats.refundedCount} transactions</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold overflow-x-auto">
        {[
          { id: "all", label: "All Payments", count: stats.totalCount },
          { id: "paid", label: "Paid", count: stats.paidCount },
          { id: "pending", label: "Pending", count: stats.pendingCount },
          { id: "failed", label: "Failed", count: stats.failedCount },
          { id: "refunded", label: "Refunded", count: stats.refundedCount },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              setStatusFilter(tab.id);
              setPage(1);
            }}
            className={`py-2.5 px-4 border-b-2 font-bold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === tab.id
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab.id ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID, txn ID, customer..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Gateway selector */}
          <div>
            <select
              value={gatewayFilter}
              onChange={(e) => {
                setGatewayFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            >
              <option value="all">All Gateways</option>
              <option value="razorpay">Razorpay</option>
              <option value="paytm">Paytm</option>
              <option value="paypal">PayPal</option>
              <option value="stripe">Stripe</option>
              <option value="authorizenet">Authorize.Net</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-600"
              title="From Date"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center space-x-2">
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition shadow-2xs cursor-pointer"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Payment / Order</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Gateway / Method</th>
                <th className="py-3 px-4">Transaction Reference</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading payment transactions...</span>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No payment records found</p>
                    <p className="text-[11px] mt-1">Adjust your search parameters or date filters.</p>
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const maxRefundable = p.amount - (p.refundAmount || 0);
                  const isRefundable = p.paymentStatus.toLowerCase() === "paid" && maxRefundable > 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 font-mono text-[11px]">{p.id}</div>
                        <Link
                          href={`/admin/orders`}
                          className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center space-x-1 mt-0.5"
                        >
                          <span>Order #{p.orderNumber || p.orderId}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-blue-500" />
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{p.customerName || "Customer"}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{p.customerEmail || "N/A"}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center space-x-1 font-bold text-slate-800">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          <span>{p.paymentGateway}</span>
                        </div>
                        {p.paymentMethod && (
                          <div className="text-[10px] text-slate-500 mt-0.5">{p.paymentMethod}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-[11px] text-slate-700 truncate max-w-[160px]" title={p.transactionId || "Pending"}>
                          {p.transactionId || <span className="text-slate-400 italic">No txn id</span>}
                        </div>
                        {p.gatewayOrderId && (
                          <div className="font-mono text-[10px] text-slate-400 truncate max-w-[160px]" title={p.gatewayOrderId}>
                            Ref: {p.gatewayOrderId}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900">
                          {p.currency === "INR" ? "₹" : p.currency + " "}
                          {p.amount.toFixed(2)}
                        </div>
                        {p.refundAmount && p.refundAmount > 0 ? (
                          <div className="text-[10px] font-semibold text-purple-600">
                            -₹{p.refundAmount.toFixed(2)} refunded
                          </div>
                        ) : null}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(p.paymentStatus)}</td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        <div>{new Date(p.createdAt).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-400">{new Date(p.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(p)}
                            title="View Payment Details"
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isRefundable && (
                            <button
                              type="button"
                              onClick={() => handleOpenRefund(p)}
                              title="Process Refund"
                              className="px-2 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md transition cursor-pointer flex items-center space-x-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Refund</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              Showing page <span className="font-bold text-slate-900">{page}</span> of{" "}
              <span className="font-bold text-slate-900">{totalPages}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded bg-white border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded bg-white border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Payment Details & Gateway References */}
      {isDetailModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Payment Transaction Audit
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedPayment.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                <div className="text-[10px] font-bold uppercase text-slate-400">Order & Customer</div>
                <div>
                  <span className="text-slate-500">Order Ref:</span>{" "}
                  <span className="font-bold text-slate-800">#{selectedPayment.orderNumber || selectedPayment.orderId}</span>
                </div>
                <div>
                  <span className="text-slate-500">Customer:</span>{" "}
                  <span className="font-semibold text-slate-800">{selectedPayment.customerName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500">Email:</span>{" "}
                  <span className="font-medium text-slate-800">{selectedPayment.customerEmail || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500">Initiated:</span>{" "}
                  <span className="font-medium text-slate-800">
                    {new Date(selectedPayment.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                <div className="text-[10px] font-bold uppercase text-slate-400">Gateway Information</div>
                <div>
                  <span className="text-slate-500">Gateway:</span>{" "}
                  <span className="font-bold text-slate-800">{selectedPayment.paymentGateway}</span>
                </div>
                <div>
                  <span className="text-slate-500">Method:</span>{" "}
                  <span className="font-medium text-slate-800">{selectedPayment.paymentMethod || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500">Gateway Order ID:</span>{" "}
                  <span className="font-mono text-slate-800">{selectedPayment.gatewayOrderId || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500">Transaction ID:</span>{" "}
                  <span className="font-mono text-slate-800">{selectedPayment.transactionId || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Financial Status Summary */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Total Charged</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  {selectedPayment.currency === "INR" ? "₹" : selectedPayment.currency + " "}
                  {selectedPayment.amount.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 mb-1">Status</div>
                {getStatusBadge(selectedPayment.paymentStatus)}
              </div>
            </div>

            {/* Error or failure reason if present */}
            {selectedPayment.failureReason && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                <div className="font-bold flex items-center space-x-1.5 mb-1">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Gateway Failure Reason</span>
                </div>
                <div>{selectedPayment.failureReason}</div>
              </div>
            )}

            {/* Refund Information */}
            {selectedPayment.refundAmount && selectedPayment.refundAmount > 0 && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-purple-700" />
                  <span>Refund Issued: ₹{selectedPayment.refundAmount.toFixed(2)}</span>
                </div>
                {selectedPayment.refundReference && (
                  <div>
                    <span className="text-purple-600">Reference:</span> {selectedPayment.refundReference}
                  </div>
                )}
                {selectedPayment.refundReason && (
                  <div>
                    <span className="text-purple-600">Reason:</span> {selectedPayment.refundReason}
                  </div>
                )}
                {selectedPayment.refundedAt && (
                  <div>
                    <span className="text-purple-600">Timestamp:</span>{" "}
                    {new Date(selectedPayment.refundedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            {/* Other related payment attempts for this order */}
            {relatedPayments.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Payment History For This Order ({relatedPayments.length} other attempts)
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {relatedPayments.map((rp) => (
                    <div
                      key={rp.id}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(rp.paymentStatus)}
                        <span className="font-medium text-slate-800">{rp.paymentGateway}</span>
                        <span className="text-slate-400">({rp.id})</span>
                      </div>
                      <div className="text-right text-slate-500 text-[11px]">
                        ₹{rp.amount.toFixed(2)} • {new Date(rp.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sanitized Gateway Response */}
            {selectedPayment.gatewayResponse && (
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Sanitized Gateway Response Metadata
                </div>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl text-[11px] overflow-x-auto max-h-40 font-mono">
                  {JSON.stringify(selectedPayment.gatewayResponse, null, 2)}
                </pre>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Process Refund */}
      {isRefundModalOpen && refundPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Process Refund</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRefundModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Process a full or partial refund for transaction{" "}
              <span className="font-mono font-bold text-slate-900">{refundPayment.id}</span> (Order #
              {refundPayment.orderNumber || refundPayment.orderId}).
            </p>

            {refundError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
                {refundError}
              </div>
            )}

            <form onSubmit={handleProcessRefund} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Refund Amount ({refundPayment.currency}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  max={refundPayment.amount - (refundPayment.refundAmount || 0)}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Maximum refundable: ₹{(refundPayment.amount - (refundPayment.refundAmount || 0)).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Refund Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refundSubmitting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {refundSubmitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5" />
                  )}
                  <span>{refundSubmitting ? "Processing..." : "Confirm Refund"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
