"use client";

import React, { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  FileImage,
  FileVideo,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { AssetClientService } from "../services/asset.service";
import { Asset, AssetUploadItem } from "../types/asset.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (assets: Asset[]) => void;
}

export function AssetUploaderModal({ isOpen, onClose, onUploadSuccess }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<AssetUploadItem[]>([]);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || !fileList.length) return;
    const newItems: AssetUploadItem[] = Array.from(fileList).map((f) => ({
      id: Math.random().toString(36).substring(2, 9),
      file: f,
      name: f.name,
      size: f.size,
      progress: 0,
      status: "idle",
    }));
    setItems((prev) => [...prev, ...newItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeItem = (id: string) => {
    if (isUploading) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleStartUpload = async () => {
    if (!items.length || isUploading) return;
    setIsUploading(true);

    const completedAssets: Asset[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.status === "success") continue;

      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: "uploading", progress: 0 } : it))
      );

      try {
        const uploaded = await AssetClientService.uploadWithProgress(
          item.file,
          { altText, caption, tags },
          (percent) => {
            setItems((prev) =>
              prev.map((it) => (it.id === item.id ? { ...it, progress: percent } : it))
            );
          }
        );

        completedAssets.push(uploaded);
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? { ...it, status: "success", progress: 100, uploadedAsset: uploaded }
              : it
          )
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload error";
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: "error", errorMessage: msg } : it))
        );
      }
    }

    setIsUploading(false);
    if (completedAssets.length > 0) {
      onUploadSuccess(completedAssets);
    }
  };

  const hasPendingItems = items.some((i) => i.status === "idle" || i.status === "error");
  const allCompleted = items.length > 0 && items.every((i) => i.status === "success");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-800">Upload Media Assets</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload images, videos, and documents to use for e-commerce products
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Drag & Drop Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-emerald-500 bg-emerald-50/60"
                : "border-slate-300 hover:border-emerald-400 bg-slate-50/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Click to select files, or drag & drop them here
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports JPEG, PNG, WEBP, GIF, SVG, MP4, WEBM, MOV (Max 50MB per file)
            </p>
          </div>

          {/* Selected File Items with Live Progress Bars */}
          {items.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Selected Items ({items.length})</span>
                {!isUploading && (
                  <button
                    type="button"
                    onClick={() => setItems([])}
                    className="text-red-600 hover:underline text-xs"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-slate-200 bg-white flex flex-col space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 overflow-hidden">
                        {item.file.type.startsWith("image/") ? (
                          <FileImage className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : item.file.type.startsWith("video/") ? (
                          <FileVideo className="w-4 h-4 text-blue-600 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className="text-xs font-medium text-slate-800 truncate">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          ({formatFileSize(item.size)})
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {item.status === "uploading" && (
                          <span className="text-xs font-semibold text-emerald-600 font-mono">
                            {item.progress}%
                          </span>
                        )}
                        {item.status === "success" && (
                          <span className="inline-flex items-center text-xs font-medium text-emerald-600">
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Ready
                          </span>
                        )}
                        {item.status === "error" && (
                          <span
                            title={item.errorMessage}
                            className="inline-flex items-center text-xs font-medium text-red-600"
                          >
                            <AlertCircle className="w-4 h-4 mr-1" /> Failed
                          </span>
                        )}
                        {!isUploading && item.status !== "success" && (
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-slate-400 hover:text-red-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Live Progress Bar for this file */}
                    {item.status === "uploading" && (
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full transition-all duration-150 ease-out"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Alt Text (SEO & Accessibility)
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="e.g. Green cotton unisex t-shirt"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. apparel, summer, top"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <div className="text-xs text-slate-500">
            {isUploading && (
              <span className="flex items-center text-emerald-700 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Uploading assets to media library...
              </span>
            )}
            {allCompleted && (
              <span className="text-emerald-700 font-medium">
                ✓ All assets successfully uploaded!
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              {allCompleted ? "Done" : "Cancel"}
            </button>

            {hasPendingItems && (
              <button
                type="button"
                onClick={handleStartUpload}
                disabled={isUploading || !items.length}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Now</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
