import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Star,
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowLeft,
  MessageSquare,
  HelpCircle,
  User,
  Tag,
  Zap,
} from "lucide-react-native";
import { apiClient, getFullImageUrl } from "../../src/services/api";
import { useCartStore } from "../../src/store/cartStore";
import { useAuthStore } from "../../src/store/authStore";
import { Skeleton } from "../../src/components/SkeletonLoader";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addToCart, totalItems } = useCartStore();
  const authUser = useAuthStore((s) => s.user);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  // Reviews & Q&A state
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "reviews" | "qna">("overview");

  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Q&A state
  const [qnaList, setQnaList] = useState<any[]>([]);
  const [loadingQna, setLoadingQna] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [submittingQna, setSubmittingQna] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
      loadReviews();
      loadQna();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(`/api/products/${id}`);
      if (res.data?.success && res.data?.data) {
        const prod = res.data.data;
        setProduct(prod);

        // Pre-select first variant attributes if available
        if (prod.hasVariants && Array.isArray(prod.variants) && prod.variants.length > 0) {
          const firstVar = prod.variants[0];
          if (firstVar.attributes && typeof firstVar.attributes === "object") {
            setSelectedAttributes(firstVar.attributes);
          }
        }
      } else {
        throw new Error("Product not found");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load product details.");
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await apiClient.get(`/api/reviews?productId=${id}`);
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setReviews(res.data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingReviews(false);
    }
  };

  const loadQna = async () => {
    try {
      setLoadingQna(true);
      const res = await apiClient.get(`/api/qna?productId=${id}`);
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setQnaList(res.data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingQna(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      Alert.alert("Missing Review", "Please enter your thoughts before submitting.");
      return;
    }

    try {
      setSubmittingReview(true);
      const payload = {
        productId: product?.id,
        itemNo: product?.sku || product?.name,
        productName: product?.name,
        userName: authUser?.name || "Verified Customer",
        userEmail: authUser?.email || "customer@example.com",
        rating: reviewRating,
        review: reviewText.trim(),
        comments: [],
        media: [],
      };

      const res = await apiClient.post("/api/reviews", payload);
      if (res.data?.success && res.data?.data) {
        setReviews([res.data.data, ...reviews]);
        setReviewText("");
        Alert.alert("Review Published!", "Thank you for sharing your experience.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not publish review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!questionText.trim()) {
      Alert.alert("Missing Question", "Please type your question about this product.");
      return;
    }

    try {
      setSubmittingQna(true);
      const payload = {
        productId: product?.id,
        itemNo: product?.sku || product?.name,
        productName: product?.name,
        userName: authUser?.name || "Customer",
        userEmail: authUser?.email || "customer@example.com",
        question: questionText.trim(),
      };

      const res = await apiClient.post("/api/qna", payload);
      if (res.data?.success && res.data?.data) {
        setQnaList([res.data.data, ...qnaList]);
        setQuestionText("");
        Alert.alert("Question Sent", "Your question was posted. Our team will answer shortly.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not post question.");
    } finally {
      setSubmittingQna(false);
    }
  };

  // Find active variant matching selected attributes
  const activeVariant = React.useMemo(() => {
    if (!product || !product.hasVariants || !Array.isArray(product.variants)) return null;
    return (
      product.variants.find((v: any) => {
        if (!v.attributes) return false;
        return Object.entries(selectedAttributes).every(
          ([key, val]) => v.attributes[key] === val
        );
      }) || product.variants[0]
    );
  }, [product, selectedAttributes]);

  const currentPrice = activeVariant?.price ?? product?.price ?? 0;
  const currentComparePrice = activeVariant?.comparePrice ?? product?.comparePrice;
  const currentStock = activeVariant?.currentStock ?? product?.currentStock ?? 0;
  const currentSku = activeVariant?.sku || product?.sku;

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    const ok = await addToCart(product.id, activeVariant?.id, 1);
    setIsAdding(false);
    if (ok) {
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2500);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", flexDirection: "row", alignItems: "center" }}>
          <Skeleton width={36} height={36} borderRadius={18} style={{ marginRight: 12 }} />
          <Skeleton width={180} height={18} borderRadius={4} />
        </View>
        <ScrollView style={{ padding: 16 }}>
          <Skeleton width="100%" height={280} borderRadius={16} style={{ marginBottom: 16 }} />
          <Skeleton width="40%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
          <Skeleton width="90%" height={22} borderRadius={6} style={{ marginBottom: 12 }} />
          <Skeleton width="50%" height={28} borderRadius={6} style={{ marginBottom: 20 }} />
          <Skeleton width="100%" height={80} borderRadius={12} style={{ marginBottom: 20 }} />
          <Skeleton width="100%" height={48} borderRadius={12} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: "800", color: "#EF4444", textAlign: "center" }}>
          {error || "Product not found"}
        </Text>
        <TouchableOpacity
          onPress={loadProduct}
          style={{ marginTop: 16, backgroundColor: "#2563EB", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const imageUrl = getFullImageUrl(activeVariant?.image || product.mainImage);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Top Header Bar */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#F1F5F9",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>

        <Text numberOfLines={1} style={{ flex: 1, fontSize: 15, fontWeight: "800", color: "#0F172A", marginHorizontal: 12 }}>
          {product.name}
        </Text>

        <TouchableOpacity onPress={() => router.push("/(tabs)/cart")} style={{ position: "relative", padding: 4 }}>
          <ShoppingCart size={22} color="#0F172A" />
          {totalItems > 0 && (
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                backgroundColor: "#2563EB",
                width: 16,
                height: 16,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 9, fontWeight: "900" }}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Product Image Stage */}
        <View style={{ backgroundColor: "#F8FAFC", paddingVertical: 20, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
          <Image
            source={{ uri: imageUrl }}
            resizeMode="contain"
            style={{ width: "90%", height: 260 }}
          />
        </View>

        <View style={{ padding: 18 }}>
          {/* Brand & Stock Pill */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: "800", color: "#2563EB", textTransform: "uppercase" }}>
              {product.brand || "e-Shop Collection"}
            </Text>
            <View
              style={{
                backgroundColor: currentStock > 0 ? "#F0FDF4" : "#FEF2F2",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: currentStock > 0 ? "#BBF7D0" : "#FCA5A5",
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: "800", color: currentStock > 0 ? "#16A34A" : "#DC2626" }}>
                {currentStock > 0 ? `In Stock (${currentStock} units)` : "Sold Out"}
              </Text>
            </View>
          </View>

          {/* Product Title */}
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A", lineHeight: 24, marginBottom: 8 }}>
            {product.name}
          </Text>

          {/* Ratings */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#FEF3C7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
              <Star size={13} color="#D97706" fill="#D97706" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, fontWeight: "800", color: "#B45309" }}>{product.rating || 4.5}</Text>
            </View>
            <Text style={{ fontSize: 12, color: "#64748B", marginLeft: 8 }}>
              {reviews.length > 0 ? `${reviews.length} customer reviews` : "120 verified customer reviews"}
            </Text>
          </View>

          {/* Pricing Row with Savings Pill */}
          {(() => {
            const priceNum = Number(currentPrice || 0);
            const comparePriceNum = currentComparePrice
              ? Number(currentComparePrice)
              : Math.round(priceNum * 1.25);
            const discountPercent =
              comparePriceNum > priceNum
                ? Math.round(((comparePriceNum - priceNum) / comparePriceNum) * 100)
                : 20;
            const savingsAmount = comparePriceNum - priceNum;

            return (
              <>
                <View style={{ marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
                  <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap" }}>
                    <Text style={{ fontSize: 26, fontWeight: "900", color: "#0F172A" }}>
                      ₹{priceNum.toLocaleString("en-IN")}
                    </Text>
                    <Text style={{ fontSize: 14, color: "#94A3B8", textDecorationLine: "line-through", marginLeft: 10 }}>
                      ₹{comparePriceNum.toLocaleString("en-IN")}
                    </Text>
                    <View style={{ backgroundColor: "#DCFCE7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginLeft: 10 }}>
                      <Text style={{ fontSize: 12, fontWeight: "900", color: "#16A34A" }}>
                        {discountPercent}% OFF
                      </Text>
                    </View>
                    {currentSku ? (
                      <Text style={{ fontSize: 11, color: "#94A3B8", marginLeft: "auto", fontFamily: "monospace" }}>
                        SKU: {currentSku}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: "800", color: "#16A34A", marginTop: 4 }}>
                    You Save ₹{savingsAmount.toLocaleString("en-IN")} on this order
                  </Text>
                </View>

                {/* Flipkart-Style Available Offers Box */}
                <View
                  style={{
                    backgroundColor: "#F0FDF4",
                    borderWidth: 1,
                    borderColor: "#BBF7D0",
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 20,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                    <Tag size={16} color="#16A34A" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 14, fontWeight: "900", color: "#166534" }}>
                      Available Offers &amp; Bank Discounts
                    </Text>
                  </View>

                  <View style={{ marginBottom: 8, flexDirection: "row" }}>
                    <Text style={{ fontSize: 12, marginRight: 6 }}>🏷️</Text>
                    <Text style={{ fontSize: 12, color: "#166534", flex: 1 }}>
                      <Text style={{ fontWeight: "900", color: "#14532D" }}>Bank Offer: </Text>
                      10% instant discount up to ₹1,500 on HDFC &amp; SBI Bank Cards.
                    </Text>
                  </View>

                  <View style={{ marginBottom: 8, flexDirection: "row" }}>
                    <Text style={{ fontSize: 12, marginRight: 6 }}>🏷️</Text>
                    <Text style={{ fontSize: 12, color: "#166534", flex: 1 }}>
                      <Text style={{ fontWeight: "900", color: "#14532D" }}>Special Price: </Text>
                      Flat festival discount applied directly to current price.
                    </Text>
                  </View>

                  <View style={{ marginBottom: 8, flexDirection: "row" }}>
                    <Text style={{ fontSize: 12, marginRight: 6 }}>🏷️</Text>
                    <Text style={{ fontSize: 12, color: "#166534", flex: 1 }}>
                      <Text style={{ fontWeight: "900", color: "#14532D" }}>Partner Cashback: </Text>
                      Extra ₹100 welcome cashback on Razorpay UPI checkout.
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ fontSize: 12, marginRight: 6 }}>🏷️</Text>
                    <Text style={{ fontSize: 12, color: "#166534", flex: 1 }}>
                      <Text style={{ fontWeight: "900", color: "#14532D" }}>No Cost EMI: </Text>
                      Avail 0% interest EMI options starting at ₹999/month.
                    </Text>
                  </View>
                </View>
              </>
            );
          })()}

          {/* Dynamic Variant Attributes Selector */}
          {product.hasVariants && Array.isArray(product.variantAttributes) && product.variantAttributes.length > 0 && (
            <View style={{ marginBottom: 18 }}>
              {product.variantAttributes.map((attrGroup: any) => (
                <View key={attrGroup.name} style={{ marginBottom: 14 }}>
                  <Text style={{ fontSize: 12, fontWeight: "800", color: "#334155", textTransform: "uppercase", marginBottom: 8 }}>
                    {attrGroup.name}: <Text style={{ color: "#2563EB" }}>{selectedAttributes[attrGroup.name]}</Text>
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {(attrGroup.values || []).map((val: string) => {
                      const isSelected = selectedAttributes[attrGroup.name] === val;
                      return (
                        <TouchableOpacity
                          key={val}
                          onPress={() => setSelectedAttributes({ ...selectedAttributes, [attrGroup.name]: val })}
                          activeOpacity={0.7}
                          style={{
                            paddingHorizontal: 14,
                            paddingVertical: 7,
                            borderRadius: 8,
                            marginRight: 8,
                            marginBottom: 8,
                            backgroundColor: isSelected ? "#2563EB" : "#F8FAFC",
                            borderWidth: 1,
                            borderColor: isSelected ? "#2563EB" : "#E2E8F0",
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#334155" }}>
                            {val}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Trust Highlights */}
          <View style={{ backgroundColor: "#F8FAFC", borderRadius: 12, padding: 12, marginBottom: 18 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <ShieldCheck size={16} color="#16A34A" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155" }}>100% Authentic Product Guarantee</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <Truck size={16} color="#2563EB" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155" }}>Express Doorstep Delivery Across India</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <RotateCcw size={16} color="#6366F1" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155" }}>7 Days Easy Return &amp; Exchange</Text>
            </View>
          </View>

          {/* Navigation Sub-Tabs */}
          <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E2E8F0", marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => setActiveTab("overview")}
              style={{
                paddingVertical: 10,
                marginRight: 20,
                borderBottomWidth: 2,
                borderBottomColor: activeTab === "overview" ? "#2563EB" : "transparent",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "800", color: activeTab === "overview" ? "#2563EB" : "#64748B" }}>
                Overview
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("reviews")}
              style={{
                paddingVertical: 10,
                marginRight: 20,
                borderBottomWidth: 2,
                borderBottomColor: activeTab === "reviews" ? "#2563EB" : "transparent",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "800", color: activeTab === "reviews" ? "#2563EB" : "#64748B" }}>
                Reviews ({reviews.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("qna")}
              style={{
                paddingVertical: 10,
                borderBottomWidth: 2,
                borderBottomColor: activeTab === "qna" ? "#2563EB" : "transparent",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "800", color: activeTab === "qna" ? "#2563EB" : "#64748B" }}>
                Q&amp;A ({qnaList.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <View>
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A", marginBottom: 6 }}>
                Product Description
              </Text>
              <Text style={{ fontSize: 13, color: "#64748B", lineHeight: 20 }}>
                {product.description || "Premium authentic quality with full manufacturer warranty and express fulfillment."}
              </Text>
            </View>
          )}

          {/* TAB 2: CUSTOMER REVIEWS */}
          {activeTab === "reviews" && (
            <View>
              {/* Write Review Form */}
              <View style={{ backgroundColor: "#F8FAFC", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 18 }}>
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>
                  Write a Customer Review
                </Text>

                {/* Rating Stars Picker */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <Text style={{ fontSize: 12, color: "#64748B", marginRight: 8 }}>Rating:</Text>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <TouchableOpacity key={s} onPress={() => setReviewRating(s)} style={{ padding: 4 }}>
                      <Star
                        size={20}
                        color={s <= reviewRating ? "#F59E0B" : "#CBD5E1"}
                        fill={s <= reviewRating ? "#F59E0B" : "transparent"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  value={reviewText}
                  onChangeText={setReviewText}
                  placeholder="Share details of your experience with this item..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    borderRadius: 8,
                    padding: 10,
                    fontSize: 12,
                    textAlignVertical: "top",
                    marginBottom: 10,
                  }}
                />

                <TouchableOpacity
                  onPress={handleSubmitReview}
                  disabled={submittingReview}
                  style={{
                    backgroundColor: "#2563EB",
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  {submittingReview ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 12 }}>Submit Review</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Reviews List */}
              {loadingReviews ? (
                <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 20 }} />
              ) : reviews.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 20 }}>
                  <MessageSquare size={32} color="#94A3B8" style={{ marginBottom: 6 }} />
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#64748B" }}>No reviews yet</Text>
                  <Text style={{ fontSize: 11, color: "#94A3B8" }}>Be the first customer to review this product!</Text>
                </View>
              ) : (
                reviews.map((rev) => (
                  <View
                    key={rev.id}
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: "#F1F5F9",
                      paddingVertical: 12,
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#E2E8F0", alignItems: "center", justifyContent: "center", marginRight: 8 }}>
                          <User size={13} color="#64748B" />
                        </View>
                        <Text style={{ fontSize: 12, fontWeight: "800", color: "#0F172A" }}>
                          {rev.userName || "Verified Buyer"}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row" }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            color={s <= rev.rating ? "#F59E0B" : "#E2E8F0"}
                            fill={s <= rev.rating ? "#F59E0B" : "transparent"}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, color: "#334155", lineHeight: 18 }}>
                      {rev.review}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}

          {/* TAB 3: QUESTIONS & ANSWERS */}
          {activeTab === "qna" && (
            <View>
              {/* Ask Question Form */}
              <View style={{ backgroundColor: "#F8FAFC", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 18 }}>
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>
                  Ask a Question
                </Text>
                <TextInput
                  value={questionText}
                  onChangeText={setQuestionText}
                  placeholder="e.g. Does this support 45W fast charging?"
                  placeholderTextColor="#94A3B8"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    borderRadius: 8,
                    padding: 10,
                    fontSize: 12,
                    marginBottom: 10,
                  }}
                />
                <TouchableOpacity
                  onPress={handleSubmitQuestion}
                  disabled={submittingQna}
                  style={{
                    backgroundColor: "#2563EB",
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  {submittingQna ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 12 }}>Post Question</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Q&A List */}
              {loadingQna ? (
                <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 20 }} />
              ) : qnaList.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 20 }}>
                  <HelpCircle size={32} color="#94A3B8" style={{ marginBottom: 6 }} />
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#64748B" }}>No questions asked yet</Text>
                  <Text style={{ fontSize: 11, color: "#94A3B8" }}>Ask anything about compatibility, warranty, or delivery.</Text>
                </View>
              ) : (
                qnaList.map((q) => (
                  <View
                    key={q.id}
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: "#F1F5F9",
                      paddingVertical: 12,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: "800", color: "#0F172A", marginBottom: 4 }}>
                      Q: {q.question}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#64748B" }}>
                      Asked by {q.userName || "Customer"} • {q.answers ? q.answers.length : 0} answers
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Bottom Add-to-Cart Bar */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E2E8F0",
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <View>
          <Text style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", fontWeight: "700" }}>Total Price</Text>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#2563EB" }}>
            ₹{Number(currentPrice).toLocaleString("en-IN")}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleAddToCart}
          disabled={isAdding || currentStock <= 0}
          activeOpacity={0.8}
          style={{
            backgroundColor: addSuccess ? "#16A34A" : "#2563EB",
            paddingHorizontal: 28,
            paddingVertical: 12,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            opacity: currentStock <= 0 ? 0.6 : 1,
          }}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : addSuccess ? (
            <>
              <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 13 }}>Added!</Text>
            </>
          ) : (
            <>
              <ShoppingCart size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 13 }}>
                {currentStock > 0 ? "Add to Cart" : "Out of Stock"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
