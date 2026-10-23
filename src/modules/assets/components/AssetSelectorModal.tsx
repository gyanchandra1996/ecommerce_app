"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Check,
  UploadCloud,
  FileImage,
  FileVideo,
  Plus,
  Loader2,
  CheckSquare,
} from "lucide-react";
import { Asset } from "../types/asset.types";
import { AssetClientService } from "../services/asset.service";
import { AssetUploaderModal } from "./AssetUploaderModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedAssetIds: string[];
  onConfirmSelection: (selectedAssets: Asset[]) => void;
  multiSelect?: boolean;
}

export function AssetSelectorModal({
  isOpen,
  onClose,
  selectedAssetIds = [],
  onConfirmSelection,
  multiSelect = true,
}: Props) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fileType, setFileType] = useState<"all" | "image" | "video">("image");
  const [chosenIds, setChosenIds] = useState<string[]>([]);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setChosenIds([...selectedAssetIds]);
      loadAssets();
    }
  }, [isOpen, selectedAssetIds]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const res = await AssetClientService.fetchAssets({
        search,
        fileType,
        sort: "recent",
        pageSize: 50,
      });
      setAssets(res.items);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [search, fileType]);

  if (!isOpen) return null;

  const toggleSelect = (asset: Asset) => {
    if (multiSelect) {
      setChosenIds((prev) =>
        prev.includes(asset.id) ? prev.filter((id) => id !== asset.id) : [...prev, asset.id]
      );
    } else {
      setChosenIds([asset.id]);
    }
  };

  const handleConfirm = () => {
    const selected = assets.filter((a) => chosenIds.includes(a.id));
    onConfirmSelection(selected);
    onClose();
  };

  const handleUploadDone = (newAssets: Asset[]) => {
    setIsUploaderOpen(false);
    setAssets((prev) => [...newAssets, ...prev]);
    // Auto-select newly uploaded items
    if (newAssets.length > 0) {
      setChosenIds((prev) => [...prev, ...newAssets.map((a) => a.id)]);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <div>
              <h2 className="text-base font-bold text-slate-800">Select Media Assets</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose images or videos from your library to attach to this product
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
            <div className="flex items-center space-x-2">
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as "all" | "image" | "video")}
                className="h-8 px-2.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="image">Only Images</option>
                <option value="video">Only Videos</option>
                <option value="all">All Media</option>
              </select>

              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search assets..."
                  className="h-8 pl-3 pr-7 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44 sm:w-56"
                />
                <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsUploaderOpen(true)}
              className="h-8 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md flex items-center space-x-1.5 transition shadow-xs"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload New Asset</span>
            </button>
          </div>

          {/* Asset Grid Selection Area */}
          <div className="p-4 overflow-y-auto flex-1 min-h-[300px] bg-slate-50/50">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <span className="text-xs">Loading media assets...</span>
              </div>
            ) : assets.length === 0 ? (
              <div className="text-center py-16">
                <FileImage className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">No assets found</p>
                <button
                  type="button"
                  onClick={() => setIsUploaderOpen(true)}
                  className="mt-3 text-xs text-emerald-600 font-semibold hover:underline"
                >
                  Upload your first media file
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {assets.map((asset) => {
                  const isSelected = chosenIds.includes(asset.id);
                  return (
                    <div
                      key={asset.id}
                      onClick={() => toggleSelect(asset)}
                      className={`group relative bg-white rounded-lg border cursor-pointer overflow-hidden transition-all duration-150 ${
                        isSelected
                          ? "border-emerald-600 ring-2 ring-emerald-500/20 shadow-md"
                          : "border-slate-200 hover:border-slate-300 hover:shadow-xs"
                      }`}
                    >
                      {/* Check indicator */}
                      <div className="absolute top-2 left-2 z-10">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center transition border ${
                            isSelected
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "bg-white/90 border-slate-300 hover:border-emerald-500"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Thumbnail */}
                      <div className="w-full h-28 bg-slate-100 flex items-center justify-center p-2 border-b border-slate-100">
                        {asset.fileType === "IMAGE" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-500">
                            <FileVideo className="w-8 h-8 text-blue-600" />
                            <span className="text-[9px] font-mono mt-1">VIDEO</span>
                          </div>
                        )}
                      </div>

                      {/* Name */}
                      <div className="p-2 text-center bg-white">
                        <p
                          title={asset.name}
                          className="text-[11px] font-medium text-slate-700 truncate w-full"
                        >
                          {asset.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-100 bg-white flex items-center justify-between">
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-emerald-700">{chosenIds.length}</span>{" "}
              asset(s) selected
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
              >
                Add Selected to Product
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Uploader Modal for uploading new assets on the fly */}
      <AssetUploaderModal
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onUploadSuccess={handleUploadDone}
      />
    </>
  );
}
