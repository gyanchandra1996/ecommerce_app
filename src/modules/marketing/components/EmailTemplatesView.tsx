"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Search,
  Edit2,
  X,
  Check,
  Eye,
  Code,
  FileText,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Tag,
} from "lucide-react";
import { EmailTemplateRecord } from "@/core/db/store";

export function EmailTemplatesView() {
  const [templates, setTemplates] = useState<EmailTemplateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplateRecord | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [previewMode, setPreviewMode] = useState<"html" | "preview">("preview");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ success: boolean; text: string } | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/email-templates${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      const json = await res.json();
      if (json.success && json.data) {
        setTemplates(json.data);
      }
    } catch (err: any) {
      console.error("Failed to load email templates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [search]);

  const openEditModal = (tpl: EmailTemplateRecord) => {
    setEditingTemplate(tpl);
    setTitle(tpl.title);
    setSubject(tpl.subject);
    setBodyHtml(tpl.bodyHtml);
    setBodyText(tpl.bodyText || "");
    setIsActive(tpl.isActive !== false);
    setPreviewMode("preview");
    setSaveMessage(null);
    setIsModalOpen(true);
  };

  const handleInsertVariable = (v: string) => {
    setBodyHtml((prev) => prev + ` {${v}} `);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    try {
      setSaving(true);
      setSaveMessage(null);

      const res = await fetch(`/api/email-templates/${editingTemplate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subject,
          bodyHtml,
          bodyText,
          isActive,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update email template");
      }

      setSaveMessage({ success: true, text: "Email template updated successfully." });
      fetchTemplates();
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1000);
    } catch (err: any) {
      setSaveMessage({ success: false, text: err.message || "Failed to save template." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 font-medium mb-1">
            Home / Marketing / <span className="text-slate-800 font-semibold">Manage Emails</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Mail className="w-7 h-7 text-indigo-600" />
            Manage Emails
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Customize transactional notifications, order alerts, registration welcomes, and dispatch emails
          </p>
        </div>
      </div>

      {/* Search Bar matching Screenshot 1 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email templates..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>
        <button
          onClick={fetchTemplates}
          title="Refresh"
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Email Templates Table (Matching Screenshot 1) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4 w-1/4">Title</th>
                <th className="py-3 px-4 w-1/2">Subject</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading email templates...
                  </td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No email templates found.
                  </td>
                </tr>
              ) : (
                templates.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>{tpl.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block ml-6">
                        {tpl.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {tpl.subject}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          tpl.isActive !== false
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {tpl.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(tpl)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 font-semibold border border-indigo-200 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Template Modal */}
      {isModalOpen && editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Edit Email Template: {editingTemplate.title}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Template Code: <span className="font-mono text-indigo-600">{editingTemplate.code}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {saveMessage && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                    saveMessage.success
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-red-50 text-red-800 border-red-200"
                  }`}
                >
                  {saveMessage.success ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>{saveMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Template Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Subject Line <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Dynamic Placeholders */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Available Dynamic Variables (Click to append):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(editingTemplate.variables || ["userName", "orderNumber", "trackingNumber", "storeName"]).map((v) => (
                    <button
                      type="button"
                      key={v}
                      onClick={() => handleInsertVariable(v)}
                      className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-mono text-[11px] border border-indigo-200 transition"
                    >
                      +{`{${v}}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* HTML / Preview Tabs */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">Email Body (HTML)</label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setPreviewMode("preview")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition ${
                        previewMode === "preview"
                          ? "bg-white text-indigo-600 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      Visual Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode("html")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition ${
                        previewMode === "html"
                          ? "bg-white text-indigo-600 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Code className="w-3 h-3" />
                      HTML Source
                    </button>
                  </div>
                </div>

                {previewMode === "html" ? (
                  <textarea
                    rows={12}
                    value={bodyHtml}
                    onChange={(e) => setBodyHtml(e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-[11px] leading-relaxed bg-slate-50"
                  />
                ) : (
                  <div
                    className="w-full min-h-[260px] p-4 rounded-lg border border-slate-200 bg-white overflow-y-auto"
                    dangerouslySetInnerHTML={{
                      __html: bodyHtml
                        .replace(/{userName}/g, "John Doe")
                        .replace(/{orderNumber}/g, "tags102")
                        .replace(/{trackingNumber}/g, "AWB-987456")
                        .replace(/{totalPrice}/g, "$129.99")
                        .replace(/{carrier}/g, "BlueDart Express")
                        .replace(/{storeName}/g, "emox Store")
                        .replace(/{pickupWarehouse}/g, "gyanwarehouse"),
                    }}
                  />
                )}
              </div>

              {/* Status Toggle */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="tplIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="tplIsActive" className="font-semibold text-slate-700">
                  Active (Template is enabled for automated platform dispatches)
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
