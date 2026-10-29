"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  Key,
  Shield,
  Smartphone,
  Copy,
  Check,
  Download,
  ExternalLink,
  Zap,
  Layers,
  ArrowLeft,
  Terminal,
  Code,
} from "lucide-react";

export default function SwaggerDocsPage() {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedAuth, setCopiedAuth] = useState(false);
  const [authorizedNotice, setAuthorizedNotice] = useState<string | null>(null);
  const swaggerInstanceRef = useRef<any>(null);

  const API_KEY = "gstore_mobile_dev_key_2026_x89f";

  const handleCopy = (text: string, type: "key" | "url" | "auth") => {
    navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else if (type === "url") {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedAuth(true);
      setTimeout(() => setCopiedAuth(false), 2000);
    }
  };

  const initSwagger = () => {
    if (typeof window !== "undefined" && (window as any).SwaggerUIBundle) {
      const ui = (window as any).SwaggerUIBundle({
        url: "/api/openapi.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [
          (window as any).SwaggerUIBundle.presets.apis,
          (window as any).SwaggerUIBundle.SwaggerUIStandalonePreset,
        ],
        layout: "BaseLayout",
        docExpansion: "list",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 2,
        showExtensions: true,
        showCommonExtensions: true,
        persistAuthorization: true,
      });

      swaggerInstanceRef.current = ui;

      // Automatically pre-authorize with the developer API key
      setTimeout(() => {
        try {
          ui.preauthorizeApiKey("ApiKeyAuth", API_KEY);
        } catch {}
      }, 800);
    }
  };

  const handleQuickAuthorize = () => {
    if (swaggerInstanceRef.current) {
      try {
        swaggerInstanceRef.current.preauthorizeApiKey("ApiKeyAuth", API_KEY);
        setAuthorizedNotice("Developer API Key applied to Swagger UI successfully!");
        setTimeout(() => setAuthorizedNotice(null), 3000);
      } catch (e: any) {
        setAuthorizedNotice("Please click the 'Authorize' button below and paste the key.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* External Swagger CSS */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css"
      />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="text-slate-400 hover:text-white transition flex items-center space-x-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </Link>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center space-x-2">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                G-Store
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold border border-blue-500/30">
                Swagger OpenAPI 3.0
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <a
              href="/api/openapi.json"
              target="_blank"
              download="openapi.json"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>OpenAPI JSON</span>
            </a>
            <button
              onClick={handleQuickAuthorize}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Auto-Authorize API Key</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile App Development Quick Info Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        {authorizedNotice && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{authorizedNotice}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <h1 className="text-lg font-black text-slate-900">
                  Mobile App Development Hub (Flutter / React Native / iOS / Android)
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Complete endpoints for catalog, product variants, cart, checkout, orders, banners, categories, and authentication.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Base URL:
              </span>
              <div className="flex items-center bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 font-mono text-xs text-slate-700">
                <span>/api</span>
                <button
                  onClick={() => handleCopy("/api", "url")}
                  className="ml-2 text-slate-400 hover:text-slate-700"
                  title="Copy Base URL"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Keys & Headers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Box 1: API Key */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-700 flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>Developer API Key</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800">
                <span className="truncate mr-2">{API_KEY}</span>
                <button
                  onClick={() => handleCopy(API_KEY, "key")}
                  className="text-slate-400 hover:text-blue-600 shrink-0"
                  title="Copy API Key"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                Pass as <code className="text-blue-600 font-bold">x-api-key</code> header in mobile app network requests.
              </p>
            </div>

            {/* Box 2: Test Accounts */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-700 flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-500" />
                  <span>Pre-Configured Test Accounts</span>
                </span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between bg-white px-2.5 py-1 rounded border border-slate-200">
                  <span className="text-slate-600 truncate font-mono">gyanchandranist@gmail.com</span>
                  <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-1 rounded">Customer</span>
                </div>
                <div className="flex items-center justify-between bg-white px-2.5 py-1 rounded border border-slate-200">
                  <span className="text-slate-600 truncate font-mono">admin@tagateway.com</span>
                  <span className="text-[9px] font-bold bg-purple-50 text-purple-700 px-1 rounded">Admin</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                Password for both: <code className="text-slate-800 font-bold">password123</code>
              </p>
            </div>

            {/* Box 3: Mobile Guest Cart */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-700 flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Mobile Session Persistence</span>
                </span>
              </div>
              <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800">
                <span className="truncate">x-session-id: uuid</span>
                <button
                  onClick={() => handleCopy("x-session-id: gst_mobile_app_123", "auth")}
                  className="text-slate-400 hover:text-blue-600 shrink-0 ml-2"
                  title="Copy Session Header"
                >
                  {copiedAuth ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                Send a unique device UUID to maintain guest carts across mobile app sessions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Swagger UI Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm mt-4 min-h-[600px]">
          <div id="swagger-ui" />
        </div>
      </div>

      {/* Load Swagger UI Scripts */}
      <Script
        src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"
        strategy="lazyOnload"
        onLoad={initSwagger}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"
        strategy="lazyOnload"
      />
    </div>
  );
}
