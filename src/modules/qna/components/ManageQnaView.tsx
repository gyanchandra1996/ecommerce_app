"use client";

import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  Search,
  Plus,
  PlusCircle,
  Lock,
  Unlock,
  Check,
  X,
  MessageCircle,
  Trash2,
  Star,
  ChevronDown,
} from "lucide-react";

interface QnaAnswer {
  id: string;
  userName: string;
  userEmail: string;
  answer: string;
  isOfficial: boolean;
  createdAt: string;
}

interface QnaItem {
  id: string;
  itemNo: string;
  productName: string;
  userName: string;
  userEmail: string;
  question: string;
  postedOn: string;
  rating: number;
  answersCount: number;
  answers?: QnaAnswer[];
  status: "Active" | "Inactive";
}

interface ProductOption {
  id: string;
  sku: string;
  name: string;
}

export function ManageQnaView() {
  const [qnaList, setQnaList] = useState<QnaItem[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [autoApprove, setAutoApprove] = useState(true);

  // Add Question Modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionSubmitting, setQuestionSubmitting] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    itemNo: "",
    productName: "",
    userName: "",
    userEmail: "",
    question: "",
  });

  // Answer Modal
  const [selectedQnaForAnswer, setSelectedQnaForAnswer] = useState<QnaItem | null>(null);
  const [answerSubmitting, setAnswerSubmitting] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [isOfficial, setIsOfficial] = useState(true);

  const fetchQna = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/qna${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      const json = await res.json();
      if (json.success && json.data) {
        setQnaList(json.data);
      }
    } catch (err) {
      console.error("Error fetching Q&A:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [prodRes, setRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/qna/settings"),
      ]);
      const prodJson = await prodRes.json();
      const setJson = await setRes.json();

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
      console.error("Error fetching initial Q&A settings:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchQna();
  }, [search]);

  const toggleAutoApprove = async () => {
    const newVal = !autoApprove;
    setAutoApprove(newVal);
    try {
      await fetch("/api/qna/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoApprove: newVal }),
      });
    } catch (err) {
      console.error("Error toggling Q&A auto approve:", err);
    }
  };

  const handleProductSelect = (sku: string) => {
    const prod = products.find((p) => p.sku === sku);
    if (prod) {
      setQuestionForm((prev) => ({
        ...prev,
        itemNo: prod.sku,
        productName: prod.name,
      }));
    } else {
      setQuestionForm((prev) => ({ ...prev, itemNo: sku }));
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.itemNo || !questionForm.question.trim()) return;

    try {
      setQuestionSubmitting(true);
      const res = await fetch("/api/qna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionForm),
      });
      const json = await res.json();
      if (json.success) {
        setIsQuestionModalOpen(false);
        fetchQna();
      }
    } catch (err) {
      console.error("Error posting question:", err);
    } finally {
      setQuestionSubmitting(false);
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQnaForAnswer || !answerText.trim()) return;

    try {
      setAnswerSubmitting(true);
      const res = await fetch(`/api/qna/${selectedQnaForAnswer.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: answerText,
          isOfficial,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAnswerText("");
        setSelectedQnaForAnswer(null);
        fetchQna();
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
    } finally {
      setAnswerSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: QnaItem) => {
    const newStatus = item.status === "Active" ? "Inactive" : "Active";
    try {
      const res = await fetch(`/api/qna/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchQna();
    } catch (err) {
      console.error("Error toggling Q&A status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`/api/qna/${id}`, { method: "DELETE" });
      if (res.ok) fetchQna();
    } catch (err) {
      console.error("Error deleting question:", err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header matching Screenshot 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <span>Manage Q&amp;A</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            <span className="text-emerald-600 font-medium">Products</span> /{" "}
            <span className="text-slate-400">Manage Q&amp;A</span>
          </p>
        </div>

        {/* Top Buttons matching Screenshot 2 */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={toggleAutoApprove}
            className={`h-8 px-3.5 text-xs font-semibold rounded-md shadow-xs flex items-center space-x-1.5 transition ${
              autoApprove
                ? "bg-teal-600 hover:bg-teal-700 text-white"
                : "bg-slate-200 hover:bg-slate-300 text-slate-700"
            }`}
            title="Toggle show question immediately after posting"
          >
            {autoApprove ? <Lock className="w-3.5 h-3.5 text-amber-300" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>Show question immediately after posting</span>
          </button>

          <button
            onClick={() => {
              const defaultP = products[0];
              setQuestionForm({
                itemNo: defaultP ? defaultP.sku : "",
                productName: defaultP ? defaultP.name : "",
                userName: "Customer",
                userEmail: "customer@domain.com",
                question: "",
              });
              setIsQuestionModalOpen(true);
            }}
            className="h-8 px-3.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs flex items-center space-x-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Search Bar matching Screenshot 2 */}
      <div className="flex justify-end">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-3 pr-7 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
        </div>
      </div>

      {/* Main Q&A Table matching Screenshot 2 */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Item No.</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">User Email</th>
                <th className="py-3 px-5">Question</th>
                <th className="py-3 px-3">Posted On</th>
                <th className="py-3 px-3 text-center">Rating</th>
                <th className="py-3 px-3 text-center">Answer&apos;s Count</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading questions...
                  </td>
                </tr>
              ) : qnaList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No questions found. Click &quot;+ Add Question&quot; to create one.
                  </td>
                </tr>
              ) : (
                qnaList.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition">
                    {/* Status Badge (Blue for Active, Amber for Inactive) matching Screenshot 2 */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          q.status === "Active"
                            ? "bg-blue-600 text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>

                    {/* Item No. */}
                    <td className="py-3 px-3 font-mono font-medium text-slate-800">
                      {q.itemNo}
                    </td>

                    {/* Product Name (underlined style matching screenshot) */}
                    <td className="py-3 px-4 font-medium text-slate-800 max-w-[170px] truncate underline cursor-pointer hover:text-blue-600">
                      {q.productName}
                    </td>

                    {/* User Email */}
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {q.userEmail}
                    </td>

                    {/* Question text */}
                    <td className="py-3 px-5 text-slate-800 max-w-[260px]">
                      <p className="line-clamp-2">{q.question}</p>
                    </td>

                    {/* Posted On */}
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {q.postedOn}
                    </td>

                    {/* 5-Star Rating matching Screenshot 2 */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-0.5 text-slate-800">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-slate-800 text-slate-800" />
                        ))}
                      </div>
                    </td>

                    {/* Answer's Count with Green Plus Circle matching Screenshot 2 */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="font-mono font-bold text-slate-700">{q.answersCount}</span>
                        <button
                          onClick={() => setSelectedQnaForAnswer(q)}
                          className="text-emerald-600 hover:text-emerald-700 hover:scale-110 transition cursor-pointer"
                          title="Add an official answer"
                        >
                          <PlusCircle className="w-4 h-4 fill-emerald-600 text-white" />
                        </button>
                      </div>
                    </td>

                    {/* Actions Dropdown Button matching Screenshot 2 */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setSelectedQnaForAnswer(q)}
                          className="px-2 py-1 text-[11px] font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded transition"
                        >
                          Actions ▾
                        </button>
                        <button
                          onClick={() => handleToggleStatus(q)}
                          className="p-1 text-slate-400 hover:text-slate-600 transition"
                          title="Toggle Status"
                        >
                          {q.status === "Active" ? (
                            <span className="text-[10px] bg-slate-100 px-1 rounded">Hide</span>
                          ) : (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">Show</span>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition"
                          title="Delete"
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

      {/* Answer Management Modal */}
      {selectedQnaForAnswer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Question &amp; Answers</span>
              </h3>
              <button
                onClick={() => setSelectedQnaForAnswer(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Question preview */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Product: {selectedQnaForAnswer.productName} ({selectedQnaForAnswer.itemNo})
                </div>
                <div className="text-xs font-semibold text-slate-900">
                  &ldquo;{selectedQnaForAnswer.question}&rdquo;
                </div>
                <div className="text-[11px] text-slate-500">
                  Asked by {selectedQnaForAnswer.userEmail} on {selectedQnaForAnswer.postedOn}
                </div>
              </div>

              {/* Existing answers */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Existing Answers ({selectedQnaForAnswer.answers?.length || 0})
                </h4>
                {(!selectedQnaForAnswer.answers || selectedQnaForAnswer.answers.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">No answers provided yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedQnaForAnswer.answers.map((ans) => (
                      <div key={ans.id} className="p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                            {ans.userName}
                            {ans.isOfficial && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Official Answer
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(ans.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-700">{ans.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Answer Form */}
              <form onSubmit={handleAnswerSubmit} className="space-y-3 pt-3 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-800">
                  Add Official Store Response:
                </label>
                <textarea
                  rows={3}
                  required
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type official reply to answer this customer question..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isOfficial}
                      onChange={(e) => setIsOfficial(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Mark as Official emox Answer</span>
                  </label>

                  <button
                    type="submit"
                    disabled={answerSubmitting}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs flex items-center space-x-1.5 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{answerSubmitting ? "Posting..." : "Post Answer"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Question Modal matching Screenshot 2 */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>Add Customer Question</span>
              </h3>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuestionSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={questionForm.itemNo}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">-- Select Product --</option>
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
                    value={questionForm.userName}
                    onChange={(e) => setQuestionForm({ ...questionForm, userName: e.target.value })}
                    placeholder="e.g. Tag Customer"
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
                    value={questionForm.userEmail}
                    onChange={(e) => setQuestionForm({ ...questionForm, userEmail: e.target.value })}
                    placeholder="admin@tag.com"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Question <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  placeholder="e.g. Is this 100% pre-shrunk cotton fabric?"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={questionSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md flex items-center space-x-1.5 transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{questionSubmitting ? "Submitting..." : "Post Question"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
