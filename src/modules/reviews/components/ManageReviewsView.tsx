"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Search,
  RotateCcw,
  RefreshCw,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Check,
  X,
  MessageSquare,
  AlertCircle,
  Filter,
} from "lucide-react";

interface Review {
  id: string;
  itemNo: string;
  productName: string;
  userName: string;
  userEmail: string;
  rating: number;
  review: string;
  commentCount: number;
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
      const [catRes, prodRes, setRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/products"),
        fetch("/api/reviews/settings"),
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

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemNo || !formData.review.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
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
      if (res.ok) fetchReviews();
    } catch (err) {
      console.error("Error deleting review:", err);
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
              setIsModalOpen(true);
            }}
            className="h-8 px-3.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs flex items-center space-x-1.5 transition"
          >
            <span>+ Add Review</span>
            <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar matching Screenshot 1 */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          {/* Filter by Categories */}
          <div className="w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-8 px-3 text-xs border border-teal-600 bg-teal-600 text-white font-medium rounded-md focus:outline-none cursor-pointer"
            >
              <option value="all">Filter by categories ▾</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-slate-800">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetFilters}
            className="w-8 h-8 rounded-md bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center transition"
            title="Reset filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Filter by Rating */}
          <div className="w-40">
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(Number(e.target.value))}
              className="w-full h-8 px-3 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value={0}>Filter by rating ▾</option>
              <option value={5}>5 Stars ★★★★★</option>
              <option value={4}>4 Stars ★★★★☆</option>
              <option value={3}>3 Stars ★★★☆☆</option>
              <option value={2}>2 Stars ★★☆☆☆</option>
              <option value={1}>1 Star ★☆☆☆☆</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchReviews}
            className="w-8 h-8 rounded-md bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center transition"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchReviews();
            }}
            className="relative"
          >
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-3 pr-7 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
          </form>
        </div>
      </div>

      {/* Reviews Table matching Screenshot 1 */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Item No.</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">User Email</th>
                <th className="py-3 px-5">Review</th>
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

                    {/* Review text */}
                    <td className="py-3 px-5 text-slate-700 max-w-[280px]">
                      <p className="line-clamp-2">{rev.review}</p>
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

                    {/* Comment Count */}
                    <td className="py-3 px-3 text-center font-mono font-medium text-slate-600">
                      {rev.commentCount}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
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
                          className="p-1 text-slate-400 hover:text-red-600 transition"
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

      {/* Add Review Modal matching Screenshot 1 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>Add Product Review</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
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
                      className="p-1 hover:scale-110 transition"
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

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md flex items-center space-x-1.5 transition"
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
