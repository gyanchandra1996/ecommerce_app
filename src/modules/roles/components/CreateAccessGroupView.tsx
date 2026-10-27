"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Search,
  Eye,
  Plus,
  Edit,
  Trash2,
  Check,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Folder,
  LayoutDashboard,
  Boxes,
  ShoppingBag,
  Shield,
  ImageIcon,
  Users,
  ShieldCheck,
  Factory,
  Package,
  DollarSign,
  ShoppingCart,
  Megaphone,
  Palette,
  CreditCard,
  Settings,
  Download,
  SlidersHorizontal,
  CheckSquare,
  Square,
  Sparkles,
} from "lucide-react";
import {
  MODULE_HIERARCHY,
  ModuleDefinition,
  SubModuleDefinition,
  ScreenDefinition,
  PermissionActionType,
  Role,
} from "../types/role.types";

interface Props {
  roleId?: string; // If editing an existing role
}

// Icon resolver helper
function getModuleIcon(name: string) {
  switch (name) {
    case "LayoutDashboard":
      return LayoutDashboard;
    case "ImageIcon":
      return ImageIcon;
    case "Users":
      return Users;
    case "ShieldCheck":
      return ShieldCheck;
    case "Factory":
      return Factory;
    case "Package":
      return Package;
    case "Boxes":
      return Boxes;
    case "DollarSign":
      return DollarSign;
    case "ShoppingCart":
      return ShoppingCart;
    case "Megaphone":
      return Megaphone;
    case "Palette":
      return Palette;
    case "CreditCard":
      return CreditCard;
    case "Settings":
      return Settings;
    default:
      return Folder;
  }
}

export function CreateAccessGroupView({ roleId }: Props) {
  const router = useRouter();

  // Basic Details State
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Tree & Permissions State: Map of screenId -> { [action]: boolean }
  const [permissions, setPermissions] = useState<Record<string, Record<PermissionActionType, boolean>>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    dashboard: true,
    assets: true,
    customers: true,
    accessMgmt: true,
    products: true,
    orders: true,
    marketing: false,
    settings: false,
  });

  // Filter controls
  const [search, setSearch] = useState("");
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // If roleId is present, load existing role
  useEffect(() => {
    if (!roleId) return;
    let isMounted = true;
    setLoadingRole(true);
    fetch(`/api/roles/${roleId}`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted || !json.data) return;
        const r: Role = json.data;
        setGroupName(r.name);
        setDescription(r.description || "");
        setIsActive((r.status || "Active") === "Active");

        // Normalize permissions
        const initialPerms: Record<string, Record<PermissionActionType, boolean>> = {};
        if (r.permissions) {
          Object.entries(r.permissions).forEach(([key, val]) => {
            const p = val as Record<string, boolean>;
            initialPerms[key] = {
              view: !!(p.view ?? p.canView),
              create: !!(p.create ?? p.add ?? p.canCreate),
              edit: !!(p.edit ?? p.canEdit),
              delete: !!(p.delete ?? p.canDelete),
              approve: !!p.approve,
              export: !!p.export,
              manage_settings: !!p.manage_settings,
              add: !!(p.create ?? p.add ?? p.canCreate),
              report: !!p.report,
              openScreen: !!p.openScreen,
            };
          });
        }
        setPermissions(initialPerms);
      })
      .catch(() => {
        if (isMounted) showNotification("error", "Failed to load role details.");
      })
      .finally(() => {
        if (isMounted) setLoadingRole(false);
      });

    return () => {
      isMounted = false;
    };
  }, [roleId]);

  // Toggle single action on a screen
  const handleToggleAction = (screenId: string, action: PermissionActionType) => {
    setPermissions((prev) => {
      const current = prev[screenId] || {
        view: false,
        create: false,
        edit: false,
        delete: false,
        approve: false,
        export: false,
        manage_settings: false,
        add: false,
        report: false,
        openScreen: false,
      };

      const updated = { ...current, [action]: !current[action] };

      // Normalization: if granting mutation, grant view automatically
      if (action !== "view" && updated[action]) {
        updated.view = true;
      }
      // If revoking view, revoke mutations
      if (action === "view" && !updated.view) {
        updated.create = false;
        updated.add = false;
        updated.edit = false;
        updated.delete = false;
        updated.approve = false;
        updated.export = false;
        updated.manage_settings = false;
      }

      return { ...prev, [screenId]: updated };
    });
  };

  // Check if screen has any permission granted
  const isScreenSelected = (screenId: string) => {
    const p = permissions[screenId];
    if (!p) return false;
    return !!(p.view || p.create || p.edit || p.delete || p.approve || p.export || p.manage_settings || p.add);
  };

  // Toggle all permissions for a screen (Select All per Page)
  const handleToggleScreen = (screen: ScreenDefinition) => {
    const isCurrentlySelected = isScreenSelected(screen.id);
    setPermissions((prev) => {
      const updated: Record<string, boolean> = { ...(prev[screen.id] || {}) };
      screen.actions.forEach((act) => {
        updated[act] = !isCurrentlySelected;
      });
      return { ...prev, [screen.id]: updated as Record<PermissionActionType, boolean> };
    });
  };

  // Toggle all permissions in a submodule
  const handleToggleSubModule = (subModule: SubModuleDefinition) => {
    const allSelected = subModule.screens.every((s) => isScreenSelected(s.id));
    setPermissions((prev) => {
      const next = { ...prev };
      subModule.screens.forEach((screen) => {
        const screenPerm: Record<PermissionActionType, boolean> = {
          view: !allSelected,
          create: !allSelected,
          edit: !allSelected,
          delete: !allSelected,
          approve: !allSelected,
          export: !allSelected,
          manage_settings: !allSelected,
          add: !allSelected,
          report: !allSelected,
          openScreen: !allSelected,
        };
        next[screen.id] = screenPerm;
      });
      return next;
    });
  };

  // Toggle all permissions in a module
  const handleToggleModule = (moduleDef: ModuleDefinition) => {
    const allScreens = moduleDef.subModules.flatMap((s) => s.screens);
    const allSelected = allScreens.every((s) => isScreenSelected(s.id));
    setPermissions((prev) => {
      const next = { ...prev };
      allScreens.forEach((screen) => {
        const screenPerm: Record<PermissionActionType, boolean> = {
          view: !allSelected,
          create: !allSelected,
          edit: !allSelected,
          delete: !allSelected,
          approve: !allSelected,
          export: !allSelected,
          manage_settings: !allSelected,
          add: !allSelected,
          report: !allSelected,
          openScreen: !allSelected,
        };
        next[screen.id] = screenPerm;
      });
      return next;
    });
  };

  // All screens in the hierarchy
  const allSystemScreens = useMemo(() => {
    return MODULE_HIERARCHY.flatMap((m) => m.subModules.flatMap((s) => s.screens));
  }, []);

  // Global Select All / Clear All
  const areAllPermissionsSelected = useMemo(() => {
    if (allSystemScreens.length === 0) return false;
    return allSystemScreens.every((s) => isScreenSelected(s.id));
  }, [allSystemScreens, permissions]);

  const handleGlobalSelectAll = (select: boolean) => {
    setPermissions(() => {
      const next: Record<string, Record<PermissionActionType, boolean>> = {};
      allSystemScreens.forEach((screen) => {
        const screenPerm: Record<PermissionActionType, boolean> = {
          view: select,
          create: select,
          edit: select,
          delete: select,
          approve: select,
          export: select,
          manage_settings: select,
          add: select,
          report: select,
          openScreen: select,
        };
        next[screen.id] = screenPerm;
      });
      return next;
    });
  };

  // Preset Handlers for Inherited Roles
  const applyPreset = (presetType: "admin" | "manager" | "support" | "readonly") => {
    const next: Record<string, Record<PermissionActionType, boolean>> = {};

    allSystemScreens.forEach((screen) => {
      if (presetType === "admin") {
        next[screen.id] = {
          view: true,
          create: true,
          edit: true,
          delete: true,
          approve: true,
          export: true,
          manage_settings: true,
          add: true,
          report: true,
          openScreen: true,
        };
      } else if (presetType === "manager") {
        const isManagerModule = ["products", "categories", "discounts", "inventory", "pricing", "orders", "marketing"].some(
          (m) => screen.id.includes(m) || screen.route?.includes(m)
        );
        next[screen.id] = {
          view: true,
          create: isManagerModule,
          edit: isManagerModule,
          delete: isManagerModule,
          approve: isManagerModule,
          export: true,
          manage_settings: false,
          add: isManagerModule,
          report: true,
          openScreen: true,
        };
      } else if (presetType === "support") {
        const isSupport = ["customers", "orders", "reviews", "qna"].some(
          (m) => screen.id.includes(m) || screen.route?.includes(m)
        );
        next[screen.id] = {
          view: isSupport,
          create: false,
          edit: isSupport,
          delete: false,
          approve: isSupport,
          export: isSupport,
          manage_settings: false,
          add: false,
          report: false,
          openScreen: isSupport,
        };
      } else if (presetType === "readonly") {
        next[screen.id] = {
          view: true,
          create: false,
          edit: false,
          delete: false,
          approve: false,
          export: true,
          manage_settings: false,
          add: false,
          report: true,
          openScreen: true,
        };
      }
    });

    setPermissions(next);
    showNotification("success", `Applied ${presetType.toUpperCase()} permission template.`);
  };

  const expandAll = () => {
    const exp: Record<string, boolean> = {};
    MODULE_HIERARCHY.forEach((m) => (exp[m.id] = true));
    setExpandedModules(exp);
  };

  const collapseAll = () => {
    setExpandedModules({});
  };

  const totalSelectedScreens = useMemo(() => {
    return allSystemScreens.filter((s) => isScreenSelected(s.id)).length;
  }, [allSystemScreens, permissions]);

  // Filter modules based on search and showSelectedOnly
  const filteredModules = useMemo(() => {
    return MODULE_HIERARCHY.map((mod) => {
      const matchingSubmodules = mod.subModules
        .map((sub) => {
          const matchingScreens = sub.screens.filter((scr) => {
            if (showSelectedOnly && !isScreenSelected(scr.id)) return false;
            if (search.trim()) {
              const q = search.toLowerCase();
              const matchName = scr.name.toLowerCase().includes(q);
              const matchSub = sub.name.toLowerCase().includes(q);
              const matchMod = mod.name.toLowerCase().includes(q);
              return matchName || matchSub || matchMod;
            }
            return true;
          });
          return { ...sub, screens: matchingScreens };
        })
        .filter((sub) => sub.screens.length > 0);

      return { ...mod, subModules: matchingSubmodules };
    }).filter((mod) => mod.subModules.length > 0);
  }, [search, showSelectedOnly, permissions]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) {
      showNotification("error", "Role / Group Name is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: groupName.trim(),
        description: description.trim(),
        status: isActive ? "Active" : "Inactive",
        screenPrivilegesCount: totalSelectedScreens,
        permissions,
      };

      const url = roleId ? `/api/roles/${roleId}` : "/api/roles";
      const method = roleId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to save role");
      }

      showNotification("success", `Role "${groupName}" saved successfully.`);
      setTimeout(() => {
        router.push("/admin/roles");
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving role";
      showNotification("error", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-xl shadow-lg border flex items-center space-x-3 animate-in fade-in slide-in-from-top-4 duration-200 ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="text-xs font-medium">{notification.message}</span>
        </div>
      )}

      {/* Breadcrumbs & Header */}
      <div>
        <nav className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1.5">
          <Link href="/admin/dashboard" className="hover:text-blue-600 transition">
            Dashboard
          </Link>
          <span>&gt;</span>
          <Link href="/admin/roles" className="hover:text-blue-600 transition">
            Access Management
          </Link>
          <span>&gt;</span>
          <span className="font-semibold text-slate-800">
            {roleId ? "Edit Access Group" : "Create Security Role"}
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <span>{roleId ? "Edit Role & Sidebar Page Permissions" : "Create Security Role & Sidebar Permissions"}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                Sidebar Navigation Structure
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure granular View, Create, Edit, Delete, Approve, Export, and Settings permissions for every admin module
            </p>
          </div>

          <Link
            href="/admin/roles"
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Roles</span>
          </Link>
        </div>
      </div>

      {/* Role Details Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Role Identification</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role / Group Name *
            </label>
            <input
              type="text"
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Catalog Manager, Customer Support, Store Admin"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of privileges and responsibilities"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role Status
            </label>
            <div className="flex items-center space-x-4 pt-1.5">
              <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="radio"
                  name="isActive"
                  checked={isActive}
                  onChange={() => setIsActive(true)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>Active</span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="radio"
                  name="isActive"
                  checked={!isActive}
                  onChange={() => setIsActive(false)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>Inactive</span>
              </label>
            </div>
          </div>
        </div>

        {/* Permission Templates / Quick Presets */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-600 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Permission Presets:</span>
            </span>
            <button
              type="button"
              onClick={() => applyPreset("admin")}
              className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-md transition"
            >
              Full Administrator
            </button>
            <button
              type="button"
              onClick={() => applyPreset("manager")}
              className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 rounded-md transition"
            >
              Store &amp; Catalog Manager
            </button>
            <button
              type="button"
              onClick={() => applyPreset("support")}
              className="px-2.5 py-1 text-[11px] font-semibold bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 rounded-md transition"
            >
              Customer Support
            </button>
            <button
              type="button"
              onClick={() => applyPreset("readonly")}
              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md transition"
            >
              Read-Only
            </button>
          </div>

          {/* Global Select All / Clear All Buttons */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleGlobalSelectAll(true)}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition flex items-center space-x-1"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Select All Permissions</span>
            </button>
            <button
              type="button"
              onClick={() => handleGlobalSelectAll(false)}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition flex items-center space-x-1"
            >
              <Square className="w-3.5 h-3.5 text-slate-400" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Permissions Tree Matrix */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-800">
              Admin Sidebar Navigation Modules
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-700 text-white font-mono">
              {totalSelectedScreens} / {allSystemScreens.length} Pages Configured
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search modules or pages..."
                className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            </div>

            {/* Show Selected Only */}
            <label className="flex items-center space-x-1.5 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showSelectedOnly}
                onChange={(e) => setShowSelectedOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
              />
              <span>Show selected only</span>
            </label>

            {/* Expand / Collapse buttons */}
            <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
              <button
                type="button"
                onClick={expandAll}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                Expand All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={collapseAll}
                className="text-xs text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Tree Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-2.5 px-4 w-12 text-center">#</th>
                <th className="py-2.5 px-4 w-5/12">SIDEBAR MENU / PAGE</th>
                <th className="py-2.5 px-4">GRANULAR PERMISSION ACTIONS</th>
                <th className="py-2.5 px-4 text-center w-28">QUICK TOGGLE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredModules.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    No matching modules found.
                  </td>
                </tr>
              ) : (
                filteredModules.map((moduleDef, mIdx) => {
                  const isExpanded = expandedModules[moduleDef.id] ?? true;
                  const ModuleIcon = getModuleIcon(moduleDef.iconName);
                  const allScreensInModule = moduleDef.subModules.flatMap((s) => s.screens);
                  const isModuleSelected = allScreensInModule.every((s) => isScreenSelected(s.id));
                  const isModulePartial =
                    !isModuleSelected && allScreensInModule.some((s) => isScreenSelected(s.id));

                  return (
                    <React.Fragment key={moduleDef.id}>
                      {/* Module Header Row */}
                      <tr className="bg-slate-50/60 hover:bg-slate-100/70 transition-colors border-t border-slate-200">
                        {/* Index */}
                        <td className="py-3 px-4 text-center font-bold text-slate-500">
                          {mIdx + 1}
                        </td>

                        {/* Module Header Details */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2.5">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedModules((prev) => ({
                                  ...prev,
                                  [moduleDef.id]: !prev[moduleDef.id],
                                }))
                              }
                              className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>

                            <input
                              type="checkbox"
                              checked={isModuleSelected}
                              ref={(el) => {
                                if (el) el.indeterminate = isModulePartial;
                              }}
                              onChange={() => handleToggleModule(moduleDef)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                            />

                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center ${moduleDef.color} shadow-2xs`}
                            >
                              <ModuleIcon className="w-4 h-4" />
                            </div>

                            <span className="font-bold text-sm text-slate-900">
                              {moduleDef.name}
                            </span>

                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                              {moduleDef.badgeText}
                            </span>
                          </div>
                        </td>

                        {/* Module Info */}
                        <td className="py-3 px-4 text-slate-500 text-xs italic">
                          {moduleDef.infoText}
                        </td>

                        {/* Module Select All button */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleModule(moduleDef)}
                            className="px-2 py-1 text-[11px] font-semibold bg-white border border-slate-300 hover:bg-slate-50 rounded text-slate-700 transition"
                          >
                            {isModuleSelected ? "Deselect" : "Select All"}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Screens */}
                      {isExpanded &&
                        moduleDef.subModules.map((subModule) =>
                          subModule.screens.map((screen) => {
                            const screenPerm = permissions[screen.id] || ({} as Partial<Record<PermissionActionType, boolean>>);
                            const isScrSelected = isScreenSelected(screen.id);

                            return (
                              <tr
                                key={screen.id}
                                className="bg-white hover:bg-emerald-50/20 transition-colors border-b border-slate-100"
                              >
                                <td></td>

                                {/* Screen Name */}
                                <td className="py-2.5 px-4 pl-14">
                                  <div className="flex items-center space-x-2.5">
                                    <span className="text-slate-300 font-mono text-sm">└─</span>
                                    <input
                                      type="checkbox"
                                      checked={isScrSelected}
                                      onChange={() => handleToggleScreen(screen)}
                                      className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                                    />
                                    <span className="text-xs font-bold text-slate-800">
                                      {screen.name}
                                    </span>
                                    {screen.route && (
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        ({screen.route})
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Granular Permission Actions Badges */}
                                <td className="py-2.5 px-4">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {/* View Action */}
                                    {screen.actions.includes("view") && (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleAction(screen.id, "view")}
                                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold border transition cursor-pointer select-none ${
                                          screenPerm.view
                                            ? "bg-blue-600 text-white border-blue-700 shadow-2xs"
                                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                        }`}
                                      >
                                        <Eye className="w-3 h-3" />
                                        <span>View</span>
                                      </button>
                                    )}

                                    {/* Create Action */}
                                    {(screen.actions.includes("create") || screen.actions.includes("add")) && (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleAction(screen.id, "create")}
                                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold border transition cursor-pointer select-none ${
                                          screenPerm.create || screenPerm.add
                                            ? "bg-emerald-600 text-white border-emerald-700 shadow-2xs"
                                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                        }`}
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Create</span>
                                      </button>
                                    )}

                                    {/* Edit Action */}
                                    {screen.actions.includes("edit") && (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleAction(screen.id, "edit")}
                                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold border transition cursor-pointer select-none ${
                                          screenPerm.edit
                                            ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                        }`}
                                      >
                                        <Edit className="w-3 h-3" />
                                        <span>Edit</span>
                                      </button>
                                    )}

                                    {/* Delete Action */}
                                    {screen.actions.includes("delete") && (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleAction(screen.id, "delete")}
                                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold border transition cursor-pointer select-none ${
                                          screenPerm.delete
                                            ? "bg-rose-600 text-white border-rose-700 shadow-2xs"
                                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                        }`}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        <span>Delete</span>
                                      </button>
                                    )}

                                    {/* Approve Action */}
                                    {screen.actions.includes("approve") && (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleAction(screen.id, "approve")}
                                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold border transition cursor-pointer select-none ${
                                          screenPerm.approve
                                            ? "bg-indigo-600 text-white border-indigo-700 shadow-2xs"
                                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                        }`}
                                      >
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>Approve</span>
                                      </button>
                                    )}

                                    {/* Export Action */}
                                    {screen.actions.includes("export") && (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleAction(screen.id, "export")}
                                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold border transition cursor-pointer select-none ${
                                          screenPerm.export
                                            ? "bg-teal-600 text-white border-teal-700 shadow-2xs"
                                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                        }`}
                                      >
                                        <Download className="w-3 h-3" />
                                        <span>Export</span>
                                      </button>
                                    )}

                                    {/* Manage Settings Action */}
                                    {screen.actions.includes("manage_settings") && (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleAction(screen.id, "manage_settings")}
                                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold border transition cursor-pointer select-none ${
                                          screenPerm.manage_settings
                                            ? "bg-purple-600 text-white border-purple-700 shadow-2xs"
                                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                        }`}
                                      >
                                        <Settings className="w-3 h-3" />
                                        <span>Manage Settings</span>
                                      </button>
                                    )}
                                  </div>
                                </td>

                                {/* Page Select All Button */}
                                <td className="py-2.5 px-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleScreen(screen)}
                                    className="px-2 py-1 text-[10px] font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                                  >
                                    {isScrSelected ? "Clear" : "All"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Save Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 py-3 px-6 shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-slate-600">
          <span className="font-bold text-slate-800">Summary:</span>
          <span>
            {totalSelectedScreens} of {allSystemScreens.length} sidebar pages granted
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/roles"
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{roleId ? "Save Role Changes" : "Create Security Role"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
