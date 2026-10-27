"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Shield,
  ShieldCheck,
  Plus,
  Trash2,
  Save,
  Check,
  Loader2,
  Users,
  Eye,
  Edit,
  Trash,
} from "lucide-react";
import { Role, ADMIN_PAGES, PermissionSet } from "../types/role.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRolesChanged: () => void;
}

export function ManageRolesModal({ isOpen, onClose, onRolesChanged }: Props) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New Role Form State
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  // Edit Permissions State
  const [editPermissions, setEditPermissions] = useState<Record<string, PermissionSet>>({});
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/roles");
      const json = await res.json();
      if (json.data) {
        setRoles(json.data);
        if (!selectedRole && json.data.length > 0) {
          selectRole(json.data[0]);
        }
      }
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRoles();
    }
  }, [isOpen]);

  const selectRole = (role: Role) => {
    setSelectedRole(role);
    setIsCreatingNew(false);
    setEditName(role.name);
    setEditDesc(role.description || "");

    // Populate permissions ensuring all pages exist in the map
    const perms: Record<string, PermissionSet> = {};
    ADMIN_PAGES.forEach((page) => {
      const raw = role.permissions?.[page.id] as any;
      perms[page.id] = {
        canView: !!(raw?.canView ?? raw?.view),
        canCreate: !!(raw?.canCreate ?? raw?.add),
        canEdit: !!(raw?.canEdit ?? raw?.edit),
        canDelete: !!(raw?.canDelete ?? raw?.delete),
      };
    });
    setEditPermissions(perms);
  };

  if (!isOpen) return null;

  const handleTogglePerm = (pageId: string, permKey: keyof PermissionSet) => {
    setEditPermissions((prev) => {
      const current = prev[pageId] || { canView: false, canCreate: false, canEdit: false, canDelete: false };
      const updated = { ...current, [permKey]: !current[permKey] };

      // If granting create/edit/delete, view is automatically granted
      if ((permKey === "canCreate" || permKey === "canEdit" || permKey === "canDelete") && updated[permKey]) {
        updated.canView = true;
      }
      // If unchecking view, uncheck create/edit/delete too
      if (permKey === "canView" && !updated.canView) {
        updated.canCreate = false;
        updated.canEdit = false;
        updated.canDelete = false;
      }

      return {
        ...prev,
        [pageId]: updated,
      };
    });
  };

  const handleToggleRow = (pageId: string, grant: boolean) => {
    setEditPermissions((prev) => ({
      ...prev,
      [pageId]: {
        canView: grant,
        canCreate: grant,
        canEdit: grant,
        canDelete: grant,
      },
    }));
  };

  const handleGrantAll = () => {
    const full: Record<string, PermissionSet> = {};
    ADMIN_PAGES.forEach((p) => {
      full[p.id] = { canView: true, canCreate: true, canEdit: true, canDelete: true };
    });
    setEditPermissions(full);
  };

  const handleClearAll = () => {
    const empty: Record<string, PermissionSet> = {};
    ADMIN_PAGES.forEach((p) => {
      empty[p.id] = { canView: false, canCreate: false, canEdit: false, canDelete: false };
    });
    setEditPermissions(empty);
  };

  const handleSaveRole = async () => {
    if (!selectedRole && !isCreatingNew) return;
    setSaving(true);

    try {
      if (isCreatingNew) {
        if (!newRoleName.trim()) {
          alert("Role name is required");
          setSaving(false);
          return;
        }

        const res = await fetch("/api/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newRoleName.trim(),
            description: newRoleDesc.trim(),
            permissions: editPermissions,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.message);

        setIsCreatingNew(false);
        setNewRoleName("");
        setNewRoleDesc("");
        await loadRoles();
        selectRole(json.data);
      } else if (selectedRole) {
        const res = await fetch(`/api/roles/${selectedRole.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editName,
            description: editDesc,
            permissions: editPermissions,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.message);

        await loadRoles();
        setSelectedRole(json.data);
      }

      onRolesChanged();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.isSystem) {
      alert("System default roles cannot be deleted.");
      return;
    }
    if (!confirm(`Delete role "${role.name}"? Users with this role should be reassigned.`)) return;

    try {
      await fetch(`/api/roles/${role.id}`, { method: "DELETE" });
      await loadRoles();
      onRolesChanged();
    } catch {
      alert("Error deleting role");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Roles & Page Permissions</h2>
              <p className="text-xs text-slate-500">
                Define role access levels: configure view, create, edit, and delete permissions per admin page
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body (2 Columns) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Left Column: Roles List */}
          <div className="md:col-span-4 p-4 flex flex-col bg-slate-50/40 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Configured Roles ({roles.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(true);
                  setSelectedRole(null);
                  setNewRoleName("");
                  setNewRoleDesc("");
                  handleGrantAll();
                }}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Role</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {roles.map((role) => {
                const isSelected = selectedRole?.id === role.id && !isCreatingNew;
                return (
                  <div
                    key={role.id}
                    onClick={() => selectRole(role)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500/20"
                        : "bg-white border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {role.name}
                        </span>
                        {role.isSystem && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded">
                            System
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {role.description || "Custom role"}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{role.userCount ?? 0}</span>
                      </span>

                      {!role.isSystem && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRole(role);
                          }}
                          className="text-slate-400 hover:text-red-600 p-1 transition"
                          title="Delete Role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Permission Matrix Grid */}
          <div className="md:col-span-8 p-6 flex flex-col overflow-y-auto">
            {isCreatingNew ? (
              <div className="space-y-4 mb-5 pb-5 border-b border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Create New Role
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Role Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder="e.g. Content Editor, Support Agent"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newRoleDesc}
                      onChange={(e) => setNewRoleDesc(e.target.value)}
                      placeholder="Purpose & scope of this role"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ) : selectedRole ? (
              <div className="mb-5 pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                    <span>{selectedRole.name}</span>
                    {selectedRole.isSystem && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded">
                        Built-in System Role
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedRole.description || "Configure access control policy for this role"}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleGrantAll}
                    className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            ) : null}

            {/* Permission Matrix Table */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold">
                    <th className="py-2.5 px-3">Page / Module</th>
                    <th className="py-2.5 px-3 text-center">View / Open</th>
                    <th className="py-2.5 px-3 text-center">Create / Add</th>
                    <th className="py-2.5 px-3 text-center">Edit / Update</th>
                    <th className="py-2.5 px-3 text-center">Delete</th>
                    <th className="py-2.5 px-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ADMIN_PAGES.map((page) => {
                    const perm = editPermissions[page.id] || {
                      canView: false,
                      canCreate: false,
                      canEdit: false,
                      canDelete: false,
                    };

                    const allChecked = perm.canView && perm.canCreate && perm.canEdit && perm.canDelete;

                    return (
                      <tr key={page.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-slate-800">{page.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{page.route}</p>
                        </td>

                        {/* View Checkbox */}
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={perm.canView}
                            onChange={() => handleTogglePerm(page.id, "canView")}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                          />
                        </td>

                        {/* Create Checkbox */}
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={perm.canCreate}
                            onChange={() => handleTogglePerm(page.id, "canCreate")}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                          />
                        </td>

                        {/* Edit Checkbox */}
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={perm.canEdit}
                            onChange={() => handleTogglePerm(page.id, "canEdit")}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                          />
                        </td>

                        {/* Delete Checkbox */}
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={perm.canDelete}
                            onChange={() => handleTogglePerm(page.id, "canDelete")}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                          />
                        </td>

                        {/* Row Quick Action */}
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleRow(page.id, !allChecked)}
                            className="text-[11px] text-slate-500 hover:text-emerald-700 font-medium"
                          >
                            {allChecked ? "Revoke All" : "Allow All"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Save Bar */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Changes take effect dynamically for assigned users.
              </p>

              <button
                type="button"
                onClick={handleSaveRole}
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Role & Permissions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
