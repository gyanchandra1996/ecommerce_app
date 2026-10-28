"use client";

import React, { useState, useEffect } from "react";
import {
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  Globe,
  Database,
  ExternalLink,
  ShieldAlert,
  Info,
} from "lucide-react";

export function AssetStorageSettingsView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ success: boolean; message: string } | null>(null);

  const [provider, setProvider] = useState<"local" | "s3">("local");
  const [s3Enabled, setS3Enabled] = useState(false);
  const [s3Region, setS3Region] = useState("us-east-1");
  const [s3Bucket, setS3Bucket] = useState("");
  const [s3AccessKeyId, setS3AccessKeyId] = useState("");
  const [s3SecretAccessKey, setS3SecretAccessKey] = useState("");
  const [cloudfrontUrl, setCloudfrontUrl] = useState("");

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings/storage");
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setProvider(d.provider || "local");
        setS3Enabled(Boolean(d.s3Enabled));
        setS3Region(d.s3Region || "us-east-1");
        setS3Bucket(d.s3Bucket || "");
        setS3AccessKeyId(d.s3AccessKeyId || "");
        setS3SecretAccessKey(d.s3SecretAccessKey || "");
        setCloudfrontUrl(d.cloudfrontUrl || "");
      }
    } catch (err: any) {
      console.error("Failed to load storage settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await fetch("/api/settings/storage/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          s3Region,
          s3Bucket,
          s3AccessKeyId,
          s3SecretAccessKey,
          cloudfrontUrl,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setTestResult({ success: true, message: json.message || "Successfully connected to AWS S3 bucket." });
      } else {
        setTestResult({ success: false, message: json.error || "Connection to AWS S3 failed." });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || "Failed to reach test endpoint." });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveMessage(null);
      const res = await fetch("/api/settings/storage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: s3Enabled ? "s3" : provider,
          s3Enabled,
          s3Region,
          s3Bucket,
          s3AccessKeyId,
          s3SecretAccessKey,
          cloudfrontUrl,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSaveMessage({ success: true, message: "Storage settings saved successfully." });
        if (json.data?.s3SecretAccessKey) {
          setS3SecretAccessKey(json.data.s3SecretAccessKey);
        }
      } else {
        setSaveMessage({ success: false, message: json.error || "Failed to save storage settings." });
      }
    } catch (err: any) {
      setSaveMessage({ success: false, message: err.message || "Failed to save storage settings." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
        Loading asset storage configuration...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs text-slate-500 font-medium mb-1">
          Home / Settings / <span className="text-slate-800 font-semibold">Asset Storage</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <HardDrive className="w-7 h-7 text-indigo-600" />
          Asset Storage Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure where uploaded product images, manufacturer logos, category media, and banners are stored
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

      {/* Info Notice */}
      <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
        <Info className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Safe, Non-Destructive Storage Switching</p>
          <p className="text-blue-700">
            Switching between Local and AWS S3 storage does not delete existing local assets. When S3 is enabled, new
            uploads are delivered directly to your configured bucket, while existing local asset paths remain safely accessible.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Provider Selection Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            Storage Provider & Activation
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => {
                setProvider("local");
                setS3Enabled(false);
              }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                !s3Enabled && provider === "local"
                  ? "border-indigo-600 bg-indigo-50/40"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <HardDrive
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  !s3Enabled && provider === "local" ? "text-indigo-600" : "text-slate-400"
                }`}
              />
              <div>
                <p className="text-xs font-bold text-slate-800">Local Filesystem Storage</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Stores uploaded media in the server public directory. Default zero-configuration setup.
                </p>
              </div>
            </div>

            <div
              onClick={() => {
                setProvider("s3");
                setS3Enabled(true);
              }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                s3Enabled || provider === "s3"
                  ? "border-indigo-600 bg-indigo-50/40"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <Cloud
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  s3Enabled || provider === "s3" ? "text-indigo-600" : "text-slate-400"
                }`}
              />
              <div>
                <p className="text-xs font-bold text-slate-800">Amazon Web Services (AWS S3)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Scalable cloud object storage with optional CDN distribution via CloudFront.
                </p>
              </div>
            </div>
          </div>

          {/* S3 Enable Toggle */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Enable AWS S3 Storage</p>
              <p className="text-[11px] text-slate-500">
                Route all new asset uploads to the configured AWS S3 bucket
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={s3Enabled}
                onChange={(e) => {
                  setS3Enabled(e.target.checked);
                  setProvider(e.target.checked ? "s3" : "local");
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* AWS S3 Configuration Form */}
        <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 transition ${!s3Enabled ? "opacity-75" : ""}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-indigo-600" />
              AWS S3 Credentials & Bucket Details
            </h2>
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" /> Encrypted at rest
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                AWS Region <span className="text-red-500">*</span>
              </label>
              <select
                value={s3Region}
                onChange={(e) => setS3Region(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="us-east-1">US East (N. Virginia) us-east-1</option>
                <option value="us-east-2">US East (Ohio) us-east-2</option>
                <option value="us-west-1">US West (N. California) us-west-1</option>
                <option value="us-west-2">US West (Oregon) us-west-2</option>
                <option value="ap-south-1">Asia Pacific (Mumbai) ap-south-1</option>
                <option value="ap-southeast-1">Asia Pacific (Singapore) ap-southeast-1</option>
                <option value="ap-northeast-1">Asia Pacific (Tokyo) ap-northeast-1</option>
                <option value="eu-central-1">Europe (Frankfurt) eu-central-1</option>
                <option value="eu-west-1">Europe (Ireland) eu-west-1</option>
                <option value="eu-west-2">Europe (London) eu-west-2</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                S3 Bucket Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={s3Bucket}
                onChange={(e) => setS3Bucket(e.target.value)}
                placeholder="e.g. emox-assets-production"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                AWS Access Key ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={s3AccessKeyId}
                onChange={(e) => setS3AccessKeyId(e.target.value)}
                placeholder="AKIAIOSFODNN7EXAMPLE"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                AWS Secret Access Key <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={s3SecretAccessKey}
                onChange={(e) => setS3SecretAccessKey(e.target.value)}
                placeholder="••••••••••••••••••••••••"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              CloudFront CDN URL (Optional)
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={cloudfrontUrl}
                onChange={(e) => setCloudfrontUrl(e.target.value)}
                placeholder="https://d111111abcdef8.cloudfront.net"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              If specified, publicly accessible asset URLs will be generated through your CloudFront distribution
            </p>
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            disabled={testing || !s3Bucket || !s3AccessKeyId}
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
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
