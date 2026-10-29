import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Star,
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react-native";
import { apiClient, getFullImageUrl } from "../../src/services/api";
import { useCartStore } from "../../src/store/cartStore";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const addToCart = useCartStore((s) => s.addToCart);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
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

  // Find active variant matching selected attributes
  const activeVariant = React.useMemo(() => {
    if (!product || !product.hasVariants || !Array.isArray(product.variants)) return null;
    return product.variants.find((v: any) => {
      if (!v.attributes) return false;
      return Object.entries(selectedAttributes).every(
        ([key, val]) => v.attributes[key] === val
      );
    }) || product.variants[0];
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
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 12, fontSize: 13, color: "#64748B" }}>Loading product specifications...</Text>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
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
              {product.brand || "G-Store Collection"}
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
              {product.reviewsCount || 120} verified customer reviews
            </Text>
          </View>

          {/* Pricing Row */}
          <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 18, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
            <Text style={{ fontSize: 24, fontWeight: "900", color: "#2563EB" }}>
              ₹{Number(currentPrice).toLocaleString("en-IN")}
            </Text>
            {currentComparePrice ? (
              <Text style={{ fontSize: 14, color: "#94A3B8", textDecorationLine: "line-through", marginLeft: 10 }}>
                ₹{Number(currentComparePrice).toLocaleString("en-IN")}
              </Text>
            ) : null}
            {currentSku ? (
              <Text style={{ fontSize: 11, color: "#94A3B8", marginLeft: "auto", fontFamily: "monospace" }}>
                SKU: {currentSku}
              </Text>
            ) : null}
          </View>

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

          {/* Description */}
          <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A", marginBottom: 6 }}>
            Product Overview
          </Text>
          <Text style={{ fontSize: 13, color: "#64748B", lineHeight: 20 }}>
            {product.description || "Premium authentic quality with full manufacturer warranty and express fulfillment."}
          </Text>
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
