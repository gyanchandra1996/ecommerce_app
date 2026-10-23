"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  ExternalLink,
  ChevronDown,
  LogOut,
  User,
  Shield,
  Check,
} from "lucide-react";

interface Props {
  onToggleSidebar: () => void;
  userName?: string;
  userRole?: string;
}

export function AdminHeader({
  onToggleSidebar,
  userName = "Admin admin",
  userRole = "Admin",
}: Props) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200/80 px-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left section: Hamburger button & Global Search */}
      <div className="flex items-center space-x-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onToggleSidebar}
          title="Toggle Navigation Menu"
          className="w-9 h-9 rounded bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white flex items-center justify-center transition shadow-xs cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-xs sm:max-w-md">
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search for something..."
            className="w-full h-8 pl-3 pr-8 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400"
          />
          <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Right section: Quick links, View site, User Profile */}
      <div className="flex items-center space-x-4 sm:space-x-5 shrink-0">
        {/* Quick Links with Badge 0 matching screenshot */}
        <div className="relative flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 cursor-pointer text-xs">
          <span className="hidden sm:inline font-medium">Quick Links</span>
          <div className="relative">
            <Bell className="w-4 h-4 text-slate-500" />
            <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              0
            </span>
          </div>
        </div>

        {/* View Site matching screenshot */}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="hidden md:flex items-center space-x-1 text-xs text-slate-600 hover:text-emerald-600 transition"
        >
          <span>View Site</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>

        {/* User Dropdown matching screenshot */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition cursor-pointer select-none"
          >
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold border border-slate-300">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline">{userName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800 truncate">{userName}</p>
                <p className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  <span>{userRole} Account</span>
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 transition flex items-center space-x-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
