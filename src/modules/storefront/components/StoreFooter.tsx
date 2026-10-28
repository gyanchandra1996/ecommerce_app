"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Truck,
  ShieldCheck,
  CreditCard,
  Headphones,
} from "lucide-react";
import { SiteSettingsRecord } from "@/core/db/store";

interface Props {
  storeName?: string;
}

export function StoreFooter({ storeName }: Props = {}) {
  const [settings, setSettings] = useState<SiteSettingsRecord | null>(null);
  const [liveStoreName, setLiveStoreName] = useState(storeName || "");

  useEffect(() => {
    if (storeName) setLiveStoreName(storeName);
  }, [storeName]);

  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === "ANTIGRAVITY_UPDATE_STORE_NAME" && typeof e.data.storeName === "string") {
        setLiveStoreName(e.data.storeName);
      }
    };
    window.addEventListener("message", handleMsg);
    return () => window.removeEventListener("message", handleMsg);
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && json.data) {
          setSettings(json.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const themeName = liveStoreName || settings?.themeName || "emox";
  const aboutText =
    settings?.footerAboutText ||
    "Your premier Middle East destination for authentic electronics, global fashion, luxury goods, home decor and daily essentials.";
  const copyrightText =
    settings?.footerCopyrightText ||
    `© 2026 ${themeName} Technologies LLC. All rights reserved.`;

  const links = settings?.footerLinks || [];
  const shopLinks = links
    .filter((l) => l.section === "shop" && l.isActive !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const customerLinks = links
    .filter((l) => l.section === "customer_service" && l.isActive !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const aboutLinks = links
    .filter((l) => l.section === "about" && l.isActive !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const legalLinks = links
    .filter((l) => l.section === "legal" && l.isActive !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <footer className="bg-slate-900 text-slate-300 font-sans mt-12 border-t border-slate-800">
      {/* 4 Trust Badges matching top e-commerce standards */}
      <div className="border-b border-slate-800 bg-slate-950/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fast Delivery</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Express delivery across UAE &amp; GCC</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">100% Authentic</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Genuine brand warranty guaranteed</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Secure Payment</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">SSL encrypted card &amp; Apple Pay</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">24/7 Support</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Dedicated live agent assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Dynamic Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Dynamic Theme Brand Info & Slogan */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-1">
              <span className="text-3xl font-black text-white tracking-tight lowercase">
                {themeName}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mb-2"></span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {aboutText}
            </p>

            {/* Dynamic Social Links */}
            <div className="flex items-center space-x-3 pt-2">
              {settings?.socialLinks?.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  title="Facebook"
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {settings?.socialLinks?.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  title="Instagram"
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center transition"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {settings?.socialLinks?.twitter && (
                <a
                  href={settings.socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  title="Twitter / X"
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-sky-500 text-slate-300 hover:text-white flex items-center justify-center transition"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
              {settings?.socialLinks?.youtube && (
                <a
                  href={settings.socialLinks.youtube}
                  target="_blank"
                  rel="noreferrer"
                  title="YouTube"
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
              {settings?.socialLinks?.linkedin && (
                <a
                  href={settings.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  title="LinkedIn"
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-700 text-slate-300 hover:text-white flex items-center justify-center transition"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Column 1: Shop & Featured Links (Arranged from Settings) */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Shop &amp; Deals</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {shopLinks.map((link) => (
                <li key={link.id}>
                  <a href={link.url} className="hover:text-white transition">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Customer Service (Arranged from Settings) */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Customer Service</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {customerLinks.map((link) => (
                <li key={link.id}>
                  <a href={link.url} className="hover:text-white transition">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: About Brand (Arranged from Settings) */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">About {themeName}</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {aboutLinks.map((link) => (
                <li key={link.id}>
                  <a href={link.url} className="hover:text-white transition">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal & Consumer Rights (Arranged from Settings) */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Legal &amp; Rights</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {legalLinks.map((link) => (
                <li key={link.id}>
                  <a href={link.url} className="hover:text-white transition">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Dynamic Copyright */}
        <div className="pt-10 mt-10 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div suppressHydrationWarning>{copyrightText}</div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>{settings?.deliveryLocation || "India (₹)"}</span>
            <span>•</span>
            <span>English / हिन्दी</span>
            <span>•</span>
            <span>New Delhi, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
