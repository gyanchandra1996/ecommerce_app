"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Send,
  Lock,
  Server,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  Shield,
  HelpCircle,
  Check,
  X,
} from "lucide-react";

export function MailConfigurationView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ success: boolean; message: string } | null>(null);

  // Form State matching Screenshot 2
  const [isEnabled, setIsEnabled] = useState(true);
  const [defaultFromName, setDefaultFromName] = useState("QAReply");
  const [defaultFromEmail, setDefaultFromEmail] = useState("qaadmin@example.com");
  const [defaultReplyName, setDefaultReplyName] = useState("tag31");
  const [defaultReplyTo, setDefaultReplyTo] = useState("tag31@example.com");
  const [transportMethod, setTransportMethod] = useState<"SMTP" | "SENDMAIL" | "SES" | "SIMULATED">("SENDMAIL");
  const [server, setServer] = useState("smtp.gmail.com");
  const [port, setPort] = useState(25);
  const [secureSocketType, setSecureSocketType] = useState<"TLS" | "SSL" | "NONE">("TLS");
  const [authType, setAuthType] = useState<"LOGIN" | "PLAIN" | "CRAM-MD5">("LOGIN");
  const [username, setUsername] = useState("admin@tag.com");
  const [password, setPassword] = useState("");
  const [contactUsEmail, setContactUsEmail] = useState("test2xuark@gmail.com");
  const [ccMailOption, setCcMailOption] = useState(true);
  const [ccEmailList, setCcEmailList] = useState<string[]>(["dup@example.com", "cc2@example.com"]);
  const [newCcEmail, setNewCcEmail] = useState("");

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings/mail");
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setIsEnabled(Boolean(d.isEnabled));
        setDefaultFromName(d.defaultFromName || "QAReply");
        setDefaultFromEmail(d.defaultFromEmail || "qaadmin@example.com");
        setDefaultReplyName(d.defaultReplyName || "");
        setDefaultReplyTo(d.defaultReplyTo || "");
        setTransportMethod(d.transportMethod || "SMTP");
        setServer(d.server || "smtp.gmail.com");
        setPort(d.port || 25);
        setSecureSocketType(d.secureSocketType || "TLS");
        setAuthType(d.authType || "LOGIN");
        setUsername(d.username || "");
        setPassword(d.password || "");
        setContactUsEmail(d.contactUsEmail || "");
        setCcMailOption(Boolean(d.ccMailOption));
        setCcEmailList(Array.isArray(d.ccEmailAddresses) ? d.ccEmailAddresses : []);
      }
    } catch (err: any) {
      console.error("Failed to load mail configuration:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleAddCcEmail = () => {
    const trimmed = newCcEmail.trim().toLowerCase();
    if (trimmed && trimmed.includes("@") && !ccEmailList.includes(trimmed)) {
      setCcEmailList([...ccEmailList, trimmed]);
      setNewCcEmail("");
    }
  };

  const handleRemoveCcEmail = (email: string) => {
    setCcEmailList(ccEmailList.filter((e) => e !== email));
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await fetch("/api/settings/mail/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultFromName,
          defaultFromEmail,
          transportMethod,
          server,
          port,
          secureSocketType,
          authType,
          username,
          password,
          contactUsEmail,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setTestResult({ success: true, message: json.message || "Mail server verified successfully." });
      } else {
        setTestResult({ success: false, message: json.error || "Failed to establish mail connection." });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || "Failed to reach mail test endpoint." });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveMessage(null);
      const res = await fetch("/api/settings/mail", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isEnabled,
          defaultFromName,
          defaultFromEmail,
          defaultReplyName,
          defaultReplyTo,
          transportMethod,
          server,
          port: Number(port),
          secureSocketType,
          authType,
          username,
          password,
          contactUsEmail,
          ccMailOption,
          ccEmailAddresses: ccEmailList,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSaveMessage({ success: true, message: "Mail configuration updated successfully." });
        if (json.data?.password) {
          setPassword(json.data.password);
        }
      } else {
        setSaveMessage({ success: false, message: json.error || "Failed to save mail settings." });
      }
    } catch (err: any) {
      setSaveMessage({ success: false, message: err.message || "Failed to save mail settings." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
        Loading mail configuration...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <div className="text-xs text-slate-500 font-medium mb-1">
          Home / Settings / <span className="text-slate-800 font-semibold">Mail Configuration</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Mail className="w-7 h-7 text-indigo-600" />
          Mail Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure outgoing email delivery, SMTP credentials, reply addresses, and master mail dispatch toggle
        </p>
      </div>

      {saveMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
            saveMessage.success
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {saveMessage.success ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{saveMessage.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Master Mail Enable / Disable Switch */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Master Mail Dispatch</span>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                  isEnabled
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {isEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              When disabled, system emails (user registrations, order confirmations, dispatch notices) are safely suppressed.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Sender & Reply Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-600" />
            Sender & Reply-To Defaults
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default &quot;From&quot; Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={defaultFromName}
                onChange={(e) => setDefaultFromName(e.target.value)}
                placeholder="e.g. QAReply"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default &quot;From&quot; Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={defaultFromEmail}
                onChange={(e) => setDefaultFromEmail(e.target.value)}
                placeholder="e.g. qaadmin@example.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default &quot;Reply&quot; Name
              </label>
              <input
                type="text"
                value={defaultReplyName}
                onChange={(e) => setDefaultReplyName(e.target.value)}
                placeholder="e.g. tag31"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default &quot;Reply-To&quot; Email
              </label>
              <input
                type="email"
                value={defaultReplyTo}
                onChange={(e) => setDefaultReplyTo(e.target.value)}
                placeholder="e.g. tag31@example.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              Contact Us Inquiries Email
            </label>
            <input
              type="email"
              value={contactUsEmail}
              onChange={(e) => setContactUsEmail(e.target.value)}
              placeholder="e.g. test2xuark@gmail.com"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Mail Transport & Server Credentials (Matching Screenshot 2) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-600" />
              Transport & Mail Server Connection
            </h2>
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" /> Encrypted credentials
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Transport Method <span className="text-red-500">*</span>
              </label>
              <select
                value={transportMethod}
                onChange={(e) => setTransportMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="SENDMAIL">SENDMAIL</option>
                <option value="SMTP">SMTP</option>
                <option value="SES">Amazon SES</option>
                <option value="SIMULATED">SIMULATED (Console Log)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mail Server Host <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={server}
                onChange={(e) => setServer(e.target.value)}
                placeholder="e.g. smtp.gmail.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Port <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                placeholder="e.g. 25, 587, 465"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Secure Sockets Layer
              </label>
              <select
                value={secureSocketType}
                onChange={(e) => setSecureSocketType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="TLS">TLS</option>
                <option value="SSL">SSL</option>
                <option value="NONE">NONE</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                SMTP Authentication Type
              </label>
              <select
                value={authType}
                onChange={(e) => setAuthType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="LOGIN">LOGIN</option>
                <option value="PLAIN">PLAIN</option>
                <option value="CRAM-MD5">CRAM-MD5</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Username / Account
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin@tag.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Test Connection Output */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                testResult.success
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* CC Mail Options (Matching Screenshot 2) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">CC Mail Option</p>
              <p className="text-[11px] text-slate-500">
                Send carbon copies of system transaction emails to designated supervisor or auditing addresses
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="ccMailOption"
                  checked={ccMailOption === true}
                  onChange={() => setCcMailOption(true)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-700">Yes</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="ccMailOption"
                  checked={ccMailOption === false}
                  onChange={() => setCcMailOption(false)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-700">No</span>
              </label>
            </div>
          </div>

          {ccMailOption && (
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <label className="block font-semibold text-slate-700">
                CC Email Addresses
              </label>

              {/* Tag Badges */}
              <div className="flex flex-wrap gap-2">
                {ccEmailList.map((em) => (
                  <span
                    key={em}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px]"
                  >
                    {em}
                    <button
                      type="button"
                      onClick={() => handleRemoveCcEmail(em)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add CC Email Input */}
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newCcEmail}
                  onChange={(e) => setNewCcEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCcEmail();
                    }
                  }}
                  placeholder="Enter email and click Add..."
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddCcEmail}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs transition"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            disabled={testing || !server}
            onClick={handleTestConnection}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {testing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            ) : (
              <ExternalLink className="w-3.5 h-3.5" />
            )}
            Test Connection
          </button>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
