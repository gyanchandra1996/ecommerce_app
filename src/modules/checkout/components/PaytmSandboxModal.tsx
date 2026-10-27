"use strict";
"use client";

import React, { useState } from "react";
import {
  Wallet,
  Smartphone,
  CreditCard,
  Building2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
  Lock,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  orderNumber: string;
  amount: string;
  txnToken: string;
  mid: string;
  onSuccess: (txnId: string) => void;
  onFailure: (errorMessage: string) => void;
  onCancel: () => void;
}

export function PaytmSandboxModal({
  isOpen,
  orderNumber,
  amount,
  txnToken,
  mid,
  onSuccess,
  onFailure,
  onCancel,
}: Props) {
  const [selectedTab, setSelectedTab] = useState<"wallet" | "upi" | "card" | "netbanking">("wallet");
  const [walletPhone, setWalletPhone] = useState("7777777777");
  const [otp, setOtp] = useState("489871");
  const [upiVpa, setUpiVpa] = useState("7777777777@paytm");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [cardNumber, setCardNumber] = useState("4532 8888 9999 1234");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulatePayment = async (status: "TXN_SUCCESS" | "TXN_FAILURE") => {
    try {
      setIsProcessing(true);
      setErrorMsg(null);

      const generatedTxnId = "PTM_SANDBOX_" + Date.now() + "_" + Math.floor(1000 + Math.random() * 9000);

      // Verify on backend
      const res = await fetch("/api/payments/paytm/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          txnToken,
          paytmTxnId: generatedTxnId,
          status,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        if (status === "TXN_SUCCESS") {
          onSuccess(generatedTxnId);
        } else {
          onFailure("Payment transaction declined by user in test simulation.");
        }
      } else {
        if (status === "TXN_SUCCESS") {
          setErrorMsg(json.error || "Payment verification failed on server.");
        } else {
          onFailure(json.error || "Simulated payment failure.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to communicate with payment server.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-cyan-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-sky-700 font-black flex items-center justify-center text-sm shadow">
              Paytm
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-wide">Paytm Payments</span>
                <span className="text-[10px] bg-sky-800/60 text-sky-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Sandbox Staging
                </span>
              </div>
              <p className="text-[11px] text-sky-100">
                Order #{orderNumber} • ₹{Number(amount).toFixed(2)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MID & Info Banner */}
        <div className="bg-sky-50/70 border-b border-sky-100 px-6 py-2.5 flex items-center justify-between text-xs text-sky-900">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Merchant: <strong className="font-mono">{mid}</strong></span>
          </div>
          <div className="text-[11px] text-sky-700 font-bold">
            Amount: <span className="font-mono text-xs">₹{Number(amount).toFixed(2)}</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setSelectedTab("wallet")}
            className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition ${
              selectedTab === "wallet"
                ? "border-sky-600 text-sky-700 bg-white"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Paytm Wallet</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("upi")}
            className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition ${
              selectedTab === "upi"
                ? "border-sky-600 text-sky-700 bg-white"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>UPI</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("card")}
            className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition ${
              selectedTab === "card"
                ? "border-sky-600 text-sky-700 bg-white"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Card</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("netbanking")}
            className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition ${
              selectedTab === "netbanking"
                ? "border-sky-600 text-sky-700 bg-white"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Net Banking</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {selectedTab === "wallet" && (
            <div className="space-y-3">
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  <span>Sandbox Test Wallet Credentials:</span>
                </div>
                <div className="text-[11px] space-y-0.5 font-mono text-slate-700">
                  <div>Mobile Number: <strong>7777777777</strong></div>
                  <div>Test OTP: <strong>489871</strong></div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Registered Paytm Mobile Number
                </label>
                <input
                  type="text"
                  value={walletPhone}
                  onChange={(e) => setWalletPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  One-Time Password (OTP)
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono tracking-widest text-center text-sm font-bold"
                />
              </div>
            </div>
          )}

          {selectedTab === "upi" && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                Enter your test Virtual Payment Address (VPA) or test UPI handle.
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  UPI ID / VPA
                </label>
                <input
                  type="text"
                  value={upiVpa}
                  onChange={(e) => setUpiVpa(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  placeholder="e.g. 7777777777@paytm"
                />
              </div>
            </div>
          )}

          {selectedTab === "card" && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Card Number (Sandbox Test)
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-center"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    maxLength={3}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-center font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedTab === "netbanking" && (
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Select Indian Bank
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["HDFC Bank", "State Bank of India", "ICICI Bank", "Axis Bank", "Kotak Mahindra", "Punjab National"].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBank(b)}
                    className={`p-2.5 text-xs rounded-xl border text-left font-semibold transition cursor-pointer ${
                      selectedBank === b
                        ? "border-sky-600 bg-sky-50 text-sky-800 ring-1 ring-sky-600"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions: Success / Failure Simulation & Cancel */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleSimulatePayment("TXN_SUCCESS")}
              className="py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isProcessing ? "Verifying..." : `Pay ₹${Number(amount).toFixed(2)}`}</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleSimulatePayment("TXN_FAILURE")}
              className="py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Simulate Failure</span>
            </button>
          </div>

          <button
            type="button"
            disabled={isProcessing}
            onClick={onCancel}
            className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition text-center"
          >
            Cancel Payment & Return to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
