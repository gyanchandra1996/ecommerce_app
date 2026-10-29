"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Search,
  RotateCcw,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Check,
  X,
  MessageSquare,
  AlertCircle,
  Camera,
  Video,
  Play,
  Send,
  Loader2,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

export interface ReviewMediaItem {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  name?: string;
  size?: number;
}

export interface ReviewComment {
  id: string;
  reviewId: string;
  userName: string;
  userEmail: string;
  comment: string;
  isAdmin?: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  itemNo: string;
  productName: string;
  userName: string;
  userEmail: string;
  rating: number;
  review: string;
  commentCount: number;
  media?: ReviewMediaItem[];
  comments?: ReviewComment[];
  status: "Active" | "Inactive" | "Pending";
  postedOn: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductOption {
  id: string;
  sku: string;
  name: string;
}

export function ManageReviewsView() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters matching Screenshot 1
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [search, setSearch] = useState("");
  const [autoApprove, setAutoApprove] = useState(true);

  // Add Review Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    itemNo: "",
    productName: "",
    userName: "",
    userEmail: "",
    rating: 5,
    review: "",
  });
  const [modalMedia, setModalMedia] = useState<ReviewMediaItem[]>([]);
  const [uploadingModalMedia, setUploadingModalMedia] = useState(false);

  // Comments Management Modal
  const [selectedReviewForComments, setSelectedReviewForComments] = useState<Review | null>(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentAuthorName, setCommentAuthorName] = useState("G-Store Admin");
  const [commentAuthorEmail, setCommentAuthorEmail] = useState("admin@gstore.com");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentDeleteLoading, setCommentDeleteLoading] = useState<string | null>(null);
  const [previewMediaItem, setPreviewMediaItem] = useState<ReviewMediaItem | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedRating > 0) params.append("rating", selectedRating.toString());
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/reviews?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setReviews(json.data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [catRes, prodRes, setRes, userRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/products"),
        fetch("/api/reviews/settings"),
        fetch("/api/auth/me?portal=admin").catch(() => null),
      ]);
      const catJson = await catRes.json();
      const prodJson = await prodRes.json();
      const setJson = await setRes.json();

      if (catJson.data) setCategories(catJson.data);
      if (prodJson.data) {
        setProducts(
          prodJson.data.map((p: any) => ({
            id: p.id,
            sku: p.sku,
            name: p.name,
          }))
        );
      }
      if (setJson.success && setJson.autoApprove !== undefined) {
        setAutoApprove(setJson.autoApprove);
      }

      if (userRes && userRes.ok) {
        const userJson = await userRes.json();
        if (userJson.user?.name) setCommentAuthorName(userJson.user.name + " (Admin)");
        if (userJson.user?.email) setCommentAuthorEmail(userJson.user.email);
      }
    } catch (err) {
      console.error("Error loading initial review filters:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [selectedRating]);

  const toggleAutoApprove = async () => {
    const newVal = !autoApprove;
    setAutoApprove(newVal);
    try {
      await fetch("/api/reviews/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoApprove: newVal }),
      });
    } catch (err) {
      console.error("Error toggling auto approve:", err);
    }
  };

  const handleProductSelect = (sku: string) => {
    const prod = products.find((p) => p.sku === sku);
    if (prod) {
      setFormData((prev) => ({
        ...prev,
        itemNo: prod.sku,
        productName: prod.name,
      }));
    } else {
      setFormData((prev) => ({ ...prev, itemNo: sku }));
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingModalMedia(true);
    try {
      const data = new FormData();
      Array.from(files).forEach((file) => data.append("files", file));

      const res = await fetch("/api/reviews/upload", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (json.success && json.data) {
        setModalMedia((prev) => [...prev, ...json.data]);
      } else {
        alert(json.error || "Failed to upload media.");
      }
    } catch {
      alert("Error uploading media file.");
    } finally {
      setUploadingModalMedia(false);
      e.target.value = "";
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemNo || !formData.review.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          media: modalMedia,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setModalMedia([]);
        fetchReviews();
      }
    } catch (err) {
      console.error("Error creating review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: "Active" | "Inactive") => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchReviews();
    } catch (err) {
      console.error("Error updating review status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedReviewForComments?.id === id) {
          setIsCommentsModalOpen(false);
          setSelectedReviewForComments(null);
        }
        fetchReviews();
      }
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  // Open Comments Modal
  const openCommentsModal = async (rev: Review) => {
    setSelectedReviewForComments(rev);
    setIsCommentsModalOpen(true);
    setCommentText("");

    // Fetch latest comments directly to ensure fresh data
    try {
      const res = await fetch(`/api/reviews/${rev.id}/comments`);
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedReviewForComments((prev) =>
          prev && prev.id === rev.id
            ? { ...prev, comments: json.data, commentCount: json.data.length }
            : prev
        );
      }
    } catch (err) {
      console.error("Error refreshing comments:", err);
    }
  };

  // Submit Admin Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewForComments || !commentText.trim()) return;

    setCommentSubmitting(true);
    try {
      const res = await fetch(`/api/reviews/${selectedReviewForComments.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: commentAuthorName || "G-Store Admin",
          userEmail: commentAuthorEmail || "admin@gstore.com",
          comment: commentText.trim(),
          isAdmin: true,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const updated = json.data;
        setSelectedReviewForComments(updated);
        setCommentText("");
        // Update in table state
        setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      } else {
        alert(json.error || "Failed to add comment.");
      }
    } catch {
      alert("Error adding comment.");
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!selectedReviewForComments) return;
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setCommentDeleteLoading(commentId);
    try {
      const res = await fetch(
        `/api/reviews/${selectedReviewForComments.id}/comments/${commentId}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (json.success && json.data) {
        const updated = json.data;
        setSelectedReviewForComments(updated);
        // Update in table state
        setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      } else {
        alert(json.error || "Failed to delete comment.");
      }
    } catch {
      alert("Error deleting comment.");
    } finally {
      setCommentDeleteLoading(null);
    }
  };

  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedRating(0);
    setSearch("");
    setTimeout(() => {
      fetch("/api/reviews")
        .then((r) => r.json())
        .then((j) => {
          if (j.data) setReviews(j.data);
        });
    }, 50);
  };

  return (
    <div className="space-y-5">
      {/* Header and Breadcrumb matching Screenshot 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <span>Manage Review</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            <span className="text-emerald-600 font-medium">Products</span> /{" "}
            <span className="text-slate-400">Reviews</span>
          </p>
        </div>

        {/* Top Right Action Buttons matching Screenshot 1 */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={toggleAutoApprove}
            className={`h-8 px-3.5 text-xs font-semibold rounded-md shadow-xs flex items-center space-x-1.5 transition ${
              autoApprove
                ? "bg-teal-600 hover:bg-teal-700 text-white"
                : "bg-slate-200 hover:bg-slate-300 text-slate-700"
            }`}
            title="Toggle whether reviews are approved immediately"
          >
            {autoApprove ? <Lock className="w-3.5 h-3.5 text-amber-300" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>Review Immediately Icon</span>
          </button>

          <button
            onClick={() => {
              const defaultP = products[0];
              setFormData({
                itemNo: defaultP ? defaultP.sku : "",
                productName: defaultP ? defaultP.name : "",
                userName: "Verified Customer",
                userEmail: "customer@example.com",
                rating: 5,
                review: "",
              });
              setModalMedia([]);
              setIsModalOpen(true);
            }}
            className="h-8 px-4 text-xs font-bold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Review</span>
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar matching Screenshot 1 */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3.5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Left: Filter by categories & Reset */}
          <div className="flex items-center space-x-2 w-full lg:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3.5 text-xs font-semibold rounded-md bg-teal-600 hover:bg-teal-700 text-white border-none cursor-pointer focus:outline-none"
            >
              <option value="all">Filter by categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              title="Reset Filters"
              className="w-9 h-9 rounded-md bg-slate-700 hover:bg-slate-800 text-white flex items-center justify-center transition shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Filter by rating & Search Box */}
          <div className="flex items-center space-x-2 w-full lg:w-auto justify-end">
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(Number(e.target.value))}
              className="h-9 px-3 text-xs text-slate-700 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer min-w-[130px]"
            >
              <option value={0}>Filter by rating</option>
              <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
              <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
              <option value={3}>⭐⭐⭐ (3 Stars)</option>
              <option value={2}>⭐⭐ (2 Stars)</option>
              <option value={1}>⭐ (1 Star)</option>
            </select>

            <button
              onClick={fetchReviews}
              title="Search"
              className="w-9 h-9 rounded-md bg-slate-700 hover:bg-slate-800 text-white flex items-center justify-center transition shadow-xs cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchReviews()}
                className="h-9 pl-3 pr-8 text-xs text-slate-700 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400 w-44 sm:w-48"
              />
              <Search
                onClick={fetchReviews}
                className="w-3.5 h-3.5 absolute right-2.5 top-3 text-slate-400 cursor-pointer hover:text-slate-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Table matching Screenshot 1 */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Item No.</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">User Email</th>
                <th className="py-3 px-5">Review & Media</th>
                <th className="py-3 px-3">Posted On</th>
                <th className="py-3 px-3 text-center">Rating</th>
                <th className="py-3 px-3 text-center">Comment Count</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No customer reviews found. Click &quot;+ Add Review&quot; to add one.
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50/70 transition">
                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          rev.status === "Active"
                            ? "bg-blue-600 text-white"
                            : rev.status === "Pending"
                            ? "bg-amber-500 text-white"
                            : "bg-slate-300 text-slate-700"
                        }`}
                      >
                        {rev.status}
                      </span>
                    </td>

                    {/* Item No. */}
                    <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                      {rev.itemNo}
                    </td>

                    {/* Product Name */}
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-[160px] truncate">
                      {rev.productName}
                    </td>

                    {/* User Email */}
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {rev.userEmail}
                    </td>

                    {/* Review text & Attached Media */}
                    <td className="py-3 px-5 text-slate-700 max-w-[280px]">
                      <p className="line-clamp-2">{rev.review}</p>
                      {rev.media && rev.media.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                          {rev.media.map((m, idx) => (
                            <button
                              type="button"
                              key={m.id || idx}
                              onClick={() => setPreviewMediaItem(m)}
                              className="relative w-8 h-8 rounded-md overflow-hidden border border-slate-200 bg-slate-100 shrink-0 cursor-pointer hover:ring-2 hover:ring-emerald-500 transition"
                              title={m.name || (m.type === "VIDEO" ? "Play review video" : "View photo")}
                            >
                              {m.type === "VIDEO" ? (
                                <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                                  <Play className="w-3.5 h-3.5 fill-white text-white" />
                                </div>
                              ) : (
                                <img src={m.url} alt="" className="w-full h-full object-cover" />
                              )}
                            </button>
                          ))}
                          <span className="text-[10px] text-slate-400 font-medium">
                            {rev.media.length} {rev.media.length === 1 ? "media" : "media"}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Posted On */}
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {rev.postedOn}
                    </td>

                    {/* Rating Stars */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200 fill-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    {/* Comment Count - Interactive button to open Comments Modal */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => openCommentsModal(rev)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                          rev.commentCount > 0
                            ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                        }`}
                        title="Click to view and add comments"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{rev.commentCount || 0}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => openCommentsModal(rev)}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                          title="Manage Comments"
                        >
                          Comments
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(
                              rev.id,
                              rev.status === "Active" ? "Inactive" : "Active"
                            )
                          }
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                            rev.status === "Active"
                              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                          title="Toggle Status"
                        >
                          {rev.status === "Active" ? "Deactivate" : "Approve"}
                        </button>
                        <button
                          onClick={() => handleDelete(rev.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                          title="Delete Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Comments & Moderation Modal */}
      {isCommentsModalOpen && selectedReviewForComments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Review Comments & Replies</h3>
                  <p className="text-[11px] text-slate-500">
                    Product: <span className="font-semibold text-slate-700">{selectedReviewForComments.productName}</span> ({selectedReviewForComments.itemNo})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCommentsModalOpen(false);
                  setSelectedReviewForComments(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Original Review Snapshot */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-800">{selectedReviewForComments.userName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({selectedReviewForComments.userEmail})</span>
                  </div>
                  <div className="flex items-center space-x-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < selectedReviewForComments.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200 fill-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed italic">
                  &ldquo;{selectedReviewForComments.review}&rdquo;
                </p>

                {/* Attached media thumbnails */}
                {selectedReviewForComments.media && selectedReviewForComments.media.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Attached Photos & Videos ({selectedReviewForComments.media.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedReviewForComments.media.map((m, idx) => (
                        <div
                          key={m.id || idx}
                          onClick={() => setPreviewMediaItem(m)}
                          className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white group cursor-pointer hover:ring-2 hover:ring-emerald-500 transition"
                        >
                          {m.type === "VIDEO" ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white">
                              <Play className="w-5 h-5 fill-white text-white" />
                              <span className="text-[8px] font-mono mt-0.5 text-slate-300">VIDEO</span>
                            </div>
                          ) : (
                            <img src={m.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Comments & Store Responses</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono">
                      {selectedReviewForComments.comments?.length || 0}
                    </span>
                  </h4>
                </div>

                {(!selectedReviewForComments.comments || selectedReviewForComments.comments.length === 0) ? (
                  <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p>No comments on this review yet.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Use the form below to post an official reply or note.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedReviewForComments.comments.map((cmt) => (
                      <div
                        key={cmt.id}
                        className={`p-3.5 rounded-xl border transition ${
                          cmt.isAdmin
                            ? "bg-emerald-50/50 border-emerald-200"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-slate-900">{cmt.userName}</span>
                            {cmt.isAdmin && (
                              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-600 text-white">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Store Team</span>
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">
                              {new Date(cmt.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteComment(cmt.id)}
                            disabled={commentDeleteLoading === cmt.id}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
                            title="Delete this comment"
                          >
                            {commentDeleteLoading === cmt.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-700 mt-1.5 leading-relaxed whitespace-pre-line">
                          {cmt.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Post Official Admin Reply
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Author / Display Name
                    </label>
                    <input
                      type="text"
                      value={commentAuthorName}
                      onChange={(e) => setCommentAuthorName(e.target.value)}
                      placeholder="e.g. G-Store Support"
                      required
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={commentAuthorEmail}
                      onChange={(e) => setCommentAuthorEmail(e.target.value)}
                      placeholder="support@domain.com"
                      required
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Comment Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a response to the customer's review..."
                    required
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={commentSubmitting || !commentText.trim()}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 flex items-center space-x-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {commentSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Posting Comment...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Post Comment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Media Lightbox / Video Modal */}
      {previewMediaItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative max-w-3xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center p-2">
            <button
              type="button"
              onClick={() => setPreviewMediaItem(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            {previewMediaItem.type === "VIDEO" ? (
              <video
                src={previewMediaItem.url}
                controls
                autoPlay
                className="max-h-[80vh] max-w-full rounded-xl"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewMediaItem.url}
                alt={previewMediaItem.name || "Review Photo"}
                className="max-h-[80vh] max-w-full object-contain rounded-xl"
              />
            )}
            {previewMediaItem.name && (
              <p className="text-xs text-slate-300 mt-2 font-mono">{previewMediaItem.name}</p>
            )}
          </div>
        </div>
      )}

      {/* Add Review Modal with Media Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>Add Product Review</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.itemNo}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.sku}>
                      {p.sku} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    User Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.userEmail}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                    placeholder="customer@domain.com"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Star Rating (1 - 5)
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 hover:scale-110 transition cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formData.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 fill-slate-100"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {formData.rating} Star{formData.rating !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Review Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  placeholder="Share customer feedback about product quality, performance, and experience..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Attach Review Media (Photos / Video) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Attach Media (Photos / Video)
                  </label>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WEBP, MP4</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition">
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Upload Media</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleMediaUpload}
                      disabled={uploadingModalMedia}
                      className="hidden"
                    />
                  </label>
                  {uploadingModalMedia && (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                    </span>
                  )}
                </div>

                {modalMedia.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {modalMedia.map((m, idx) => (
                      <div key={m.id || idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group">
                        {m.type === "VIDEO" ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white">
                            <Video className="w-4 h-4 text-emerald-400" />
                            <span className="text-[8px] font-mono mt-0.5">VIDEO</span>
                          </div>
                        ) : (
                          <img src={m.url} alt="" className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => setModalMedia((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{submitting ? "Posting..." : "Submit Review"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
