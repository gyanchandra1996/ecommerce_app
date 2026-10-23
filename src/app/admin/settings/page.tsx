"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Code2,
  Mail,
  Truck,
  Settings as SettingsIcon,
  Search,
  ExternalLink,
} from "lucide-react";

export default function SettingsPage() {
  const [search, setSearch] = useState("");

  const sections = [
    {
      title: "Payment Gateway",
      icon: CreditCard,
      items: ["Manage Gateway", "View Statics", "Manage Rules"],
    },
    {
      title: "Api Settings",
      icon: Code2,
      items: [
        "Ship Station",
        "UPS Setting",
        "Google Merchant",
        "Meta Catalog",
        "Google Analytics",
        "Geoip settings",
        "Sellbrite",
      ],
    },
    {
      title: "Email Setting",
      icon: Mail,
      items: ["Mail Configuration", "Subscriber Page", "Mail Templates"],
    },
    {
      title: "Shipping",
      icon: Truck,
      items: ["Free Shipping", "Handling Charge"],
    },
    {
      title: "Other Settings",
      icon: SettingsIcon,
      items: [
        "All Setting",
        "Message Setting",
        "Q-tip Setting",
        "Site Notification",
        "Invoice Content Setting",
        "Themes",
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header matching Image 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">Settings/Settings</p>
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search here for all setting..."
            className="w-full h-9 pl-3 pr-8 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 absolute right-2.5 top-3 text-slate-400" />
        </div>
      </div>

      {/* Settings Grid Sections matching Image 3 */}
      <div className="space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const filteredItems = section.items.filter((item) =>
            item.toLowerCase().includes(search.toLowerCase())
          );

          if (search && filteredItems.length === 0) return null;

          return (
            <div
              key={section.title}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs"
            >
              <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center space-x-2">
                <Icon className="w-4 h-4 text-slate-700" />
                <h2 className="text-xs font-bold text-slate-800">{section.title}</h2>
              </div>

              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredItems.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => alert(`Configuring "${item}"`)}
                    className="flex items-center space-x-2 text-xs text-slate-700 hover:text-emerald-700 p-2 rounded-lg hover:bg-slate-50 transition text-left cursor-pointer group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
                    <span className="font-medium">{item}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
