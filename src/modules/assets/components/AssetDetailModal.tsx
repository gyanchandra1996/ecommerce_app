"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  Trash2,
  Save,
  Link as LinkIcon,
  Package,
  Calendar,
  HardDrive,
  FileCode,
  Tag,
  Loader2,
  ExternalLink,
  Cloud,
  CloudUpload,
} from "lucide-react";
import { Asset } from "../types/asset.types";
import { AssetClientService } from "../services/asset.service";

interface Props {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onAssetUpdated: (updated: Asset) => void;
  onAssetDeleted: (id: string) => void;
  isS3Enabled?: boolean;
}

interface ProductOption {
  id: string;
  sku: string;
  name: string;
  assetIds?: string[];
}

export function AssetDetailModal({
  asset,
  isOpen,
  onClose,
  onAssetUpdated,
  onAssetDeleted,
  isS3Enabled = false,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [attachingProduct, setAttachingProduct] = useState(false);
  const [attachSuccess, setAttachSuccess] = useState(false);
  const [syncingS3, setSyncingS3] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const isS3 =
    asset?.storageProvider === "s3" ||
    Boolean(asset?.url && (asset.url.includes("s3") || asset.url.includes("cloudfront")));

  const handleSyncToS3 = async () => {
    if (!asset) return;
    setSyncingS3(true);
    setSyncMessage(null);
    try {
      const res = await fetch(`/api/assets/${asset.id}/sync-s3`, { method: "POST" });
      const json = await res.json();
      if (json.success && json.data) {
        setSyncMessage("Asset successfully synced to AWS S3!");
        onAssetUpdated(json.data);
      } else {
        alert(json.error || "Failed to sync to S3.");
      }
    } catch {
      alert("Error occurred while syncing to S3.");
    } finally {
      setSyncingS3(false);
    }
  };

  useEffect(() => {
    if (asset) {
      setName(asset.name);
      setAltText(asset.altText || "");
      setCaption(asset.caption || "");
      setTags(asset.tags?.join(", ") || "");
    }
  }, [asset]);

  useEffect(() => {
    if (isOpen) {
      // Load products to attach to
      fetch("/api/products")
        .then((res) => res.json())
        .then((json) => {
          if (json.data) setProducts(json.data);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen || !asset) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.origin + asset.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const updated = await AssetClientService.updateMetadata(asset.id, {
        name,
        altText,
        caption,
        tags: tagList,
      });

      onAssetUpdated(updated);
    } catch {
      alert("Failed to save asset details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${asset.name}"?`)) return;
    setDeleting(true);
    try {
      await AssetClientService.deleteAsset(asset.id);
      onAssetDeleted(asset.id);
      onClose();
    } catch {
      alert("Failed to delete asset.");
      setDeleting(false);
    }
  };

  const handleAttachProduct = async () => {
    if (!selectedProductId) return;
    setAttachingProduct(true);
    try {
      await AssetClientService.attachToProduct(selectedProductId, asset.id);
      setAttachSuccess(true);
      setTimeout(() => setAttachSuccess(false), 2500);

      // Refresh products list
      const res = await fetch("/api/products");
      const json = await res.json();
      if (json.data) setProducts(json.data);
    } catch {
      alert("Failed to link asset with product.");
    } finally {
      setAttachingProduct(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Find which products already use this asset
  const linkedProducts = products.filter((p) => p.assetIds?.includes(asset.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              {asset.fileType}
            </span>
            <h2 className="text-sm font-bold text-slate-800 truncate max-w-md">{asset.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content: 2-column layout */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Left Column: Media Preview */}
          <div className="md:col-span-7 p-6 flex flex-col items-center justify-center bg-slate-50/50">
            <div className="w-full h-80 sm:h-96 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center overflow-hidden p-3 shadow-inner">
              {asset.fileType?.toUpperCase() === "IMAGE" || asset.url?.match(/\.(webp|png|jpe?g|svg|gif|avif)$/i) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={asset.url}
                  alt={asset.altText || asset.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : asset.fileType?.toUpperCase() === "VIDEO" || asset.url?.match(/\.(mp4|webm|mov|mkv)$/i) ? (
                <video
                  src={asset.url}
                  controls
                  className="max-h-full max-w-full rounded-lg"
                />
              ) : (
                <div className="text-center p-6 text-slate-500">
                  <FileCode className="w-16 h-16 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm font-medium">{asset.originalName}</p>
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-emerald-600 hover:underline mt-2 font-medium"
                  >
                    <span>Download / Open file</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Quick URL Copy Bar */}
            <div className="w-full mt-4 flex items-center space-x-2 bg-white rounded-lg border border-slate-200 p-1.5">
              <LinkIcon className="w-4 h-4 text-slate-400 ml-1.5 shrink-0" />
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.origin + asset.url : asset.url}
                className="text-xs text-slate-600 bg-transparent flex-1 outline-none truncate font-mono"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition shrink-0 flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Metadata & Product Association */}
          <div className="md:col-span-5 p-6 space-y-6">
            {/* Technical specs */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                File Details
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center space-x-1.5 text-slate-500">
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>File Size:</span>
                  </span>
                  <span className="font-semibold text-slate-800">{formatFileSize(asset.size)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center space-x-1.5 text-slate-500">
                    <FileCode className="w-3.5 h-3.5" />
                    <span>MIME Type:</span>
                  </span>
                  <span className="font-mono text-slate-800">{asset.mimeType}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center space-x-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Uploaded:</span>
                  </span>
                  <span className="text-slate-800">
                    {new Date(asset.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Storage Provider & Cloud Sync - Only shown when AWS S3 is enabled */}
            {isS3Enabled && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Storage Provider
                  </h3>
                  {isS3 ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                      <Cloud className="w-3 h-3 text-sky-600" />
                      <span>AWS S3 Synced</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                      <HardDrive className="w-3 h-3 text-slate-500" />
                      <span>Local Disk</span>
                    </span>
                  )}
                </div>

                <div
                  className={`p-3 rounded-xl border text-xs ${
                    isS3 ? "bg-sky-50/70 border-sky-200" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className={`font-bold ${isS3 ? "text-sky-900" : "text-slate-800"}`}>
                        {isS3 ? "Amazon Simple Storage Service (S3)" : "Local Storage (/public/uploads)"}
                      </p>
                      {isS3 && asset.storageKey && (
                        <p className="text-[11px] font-mono text-sky-700 mt-0.5 truncate">
                          Key: {asset.storageKey}
                        </p>
                      )}
                      {isS3 && asset.s3SyncedAt && (
                        <p className="text-[10px] text-sky-600 mt-0.5">
                          Synced: {new Date(asset.s3SyncedAt).toLocaleString()}
                        </p>
                      )}
                      {!isS3 && (
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Stored locally. Click to sync asset and serve from AWS S3.
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleSyncToS3}
                      disabled={syncingS3}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50 shrink-0 cursor-pointer self-start sm:self-auto"
                    >
                      {syncingS3 ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CloudUpload className="w-3.5 h-3.5" />
                      )}
                      <span>{isS3 ? "Re-sync to S3" : "Sync to AWS S3"}</span>
                    </button>
                  </div>

                  {syncMessage && (
                    <p className="text-[11px] text-emerald-700 font-medium mt-2 flex items-center">
                      <Check className="w-3 h-3 mr-1" /> {syncMessage}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Product Association Feature */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Package className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Use in Products</span>
                </h3>
                {linkedProducts.length > 0 && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    Linked to {linkedProducts.length}
                  </span>
                )}
              </div>

              {linkedProducts.length > 0 && (
                <div className="mb-3 space-y-1">
                  {linkedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="px-2.5 py-1.5 rounded-md bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-900 flex items-center justify-between"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-[10px] font-mono text-emerald-700">SKU: {p.sku}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Attach to another product selector */}
              <div className="flex items-center space-x-2">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  <option value="">Select a product to attach...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAttachProduct}
                  disabled={!selectedProductId || attachingProduct}
                  className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg shadow-xs transition disabled:opacity-50 shrink-0"
                >
                  {attachingProduct ? <Loader2 className="w-3 h-3 animate-spin" /> : "Attach"}
                </button>
              </div>

              {attachSuccess && (
                <p className="text-[11px] text-emerald-700 mt-1.5 font-medium flex items-center">
                  <Check className="w-3 h-3 mr-1" /> Attached to product successfully!
                </p>
              )}
            </div>

            {/* Metadata Edit Form */}
            <form onSubmit={handleSave} className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Edit Asset Info
              </h3>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Asset Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Alt description for search engines"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Tags (Comma separated)
                </label>
                <div className="relative">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="tshirt, summer, green"
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
