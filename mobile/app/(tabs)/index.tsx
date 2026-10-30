import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  MapPin,
  Search,
  LocateFixed,
  X,
  Flame,
  ChevronRight,
  Star,
  Check,
  ShoppingCart,
  Sparkles,
  Tag,
  Zap,
  Heart,
  Smartphone,
  Shirt,
  Laptop,
  Smile,
  ShoppingBag,
  Footprints,
  Pill,
} from "lucide-react-native";
import { useLocationStore, POPULAR_INDIAN_HUBS } from "../../src/store/locationStore";
import { useCartStore } from "../../src/store/cartStore";
import { useWishlistStore } from "../../src/store/wishlistStore";
import { apiClient, getFullImageUrl, API_BASE_URL } from "../../src/services/api";

// Flipkart-style top category navigation
const FLIPKART_CATEGORIES = [
  { id: "all", name: "For You", slug: "all", icon: "✨", color: "#F59E0B" },
  { id: "fashion", name: "Fashion", slug: "fashion", icon: "👕", color: "#8B5CF6" },
  { id: "mobiles", name: "Mobiles", slug: "electronics", icon: "📱", color: "#2563EB" },
  { id: "electronics", name: "Electronics", slug: "electronics", icon: "💻", color: "#0284C7" },
  { id: "beauty", name: "Beauty", slug: "health-beauty", icon: "💄", color: "#EC4899" },
  { id: "groceries", name: "Groceries", slug: "groceries", icon: "🛒", color: "#10B981" },
  { id: "shoes", name: "Shoes", slug: "sportshoes", icon: "👟", color: "#F97316" },
  { id: "pharmacy", name: "Pharmacy", slug: "pharmacy", icon: "💊", color: "#06B6D4" },
];

// Bundled high-res local banners for 100% offline & instant display
const LOCAL_BANNERS: Record<string, any> = {
  "/uploads/hero_iphone16_banner.webp": require("../../assets/banners/hero_iphone16_banner.jpg"),
  "/uploads/hero_iphone16_banner.jpg": require("../../assets/banners/hero_iphone16_banner.jpg"),
  "/uploads/hero_running_sale_banner.webp": require("../../assets/banners/hero_running_sale_banner.jpg"),
  "/uploads/hero_running_sale_banner.jpg": require("../../assets/banners/hero_running_sale_banner.jpg"),
};

const CDN_FALLBACK_BANNERS = [
  "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
];

// Robust banner slide image that tries local asset -> primary URI -> CDN fallback with zero blank display
function BannerSlideImage({ imageUrl, index }: { imageUrl?: string; index: number }) {
  const localAsset = imageUrl ? LOCAL_BANNERS[imageUrl] : null;
  const [useFallback, setUseFallback] = useState(false);

  if (localAsset) {
    return (
      <Image
        source={localAsset}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />
    );
  }

  const primaryUri = imageUrl ? getFullImageUrl(imageUrl) : CDN_FALLBACK_BANNERS[index % CDN_FALLBACK_BANNERS.length];
  const fallbackUri = CDN_FALLBACK_BANNERS[index % CDN_FALLBACK_BANNERS.length];

  return (
    <Image
      source={{ uri: useFallback ? fallbackUri : primaryUri }}
      style={{ width: "100%", height: "100%" }}
      resizeMode="cover"
      onError={() => {
        if (!useFallback) setUseFallback(true);
      }}
    />
  );
}

// Clean Graphic Banners (Text removed from banner as requested; graphics contain their own artwork)
const DEFAULT_SLIDERS = [
  {
    id: "slider_hero_iphone16",
    title: "iPhone 16 Pro",
    buttonLink: "/category/electronics",
    imageUrl: "/uploads/hero_iphone16_banner.webp",
  },
  {
    id: "slider_hero_running_sale",
    title: "Running & Sneaker Fest",
    buttonLink: "/category/sportshoes",
    imageUrl: "/uploads/hero_running_sale_banner.webp",
  },
  {
    id: "slider_hero_electronics",
    title: "Mega Electronics Drop",
    buttonLink: "/category/electronics",
    imageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "slider_hero_fashion",
    title: "Festival Fashion Sale",
    buttonLink: "/category/fashion",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "slider_hero_gadgets",
    title: "Smart Gear & Wearables",
    buttonLink: "/category/electronics",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { currentLocation, selectLocation, detectGPSLocation, isDetecting } = useLocationStore();
  const { addToCart, totalItems } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [selectedCategoryTab, setSelectedCategoryTab] = useState("all");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [pinSearch, setPinSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  // Live Sliders & Banners
  const [sliders, setSliders] = useState<any[]>(DEFAULT_SLIDERS);
  const [promoBanners, setPromoBanners] = useState<any[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const sliderScrollRef = useRef<any>(null);
  const { width: windowWidth } = Dimensions.get("window");
  const bannerWidth = windowWidth - 32;

  useEffect(() => {
    loadFeaturedProducts();
    loadSliders();
  }, []);

  const loadSliders = async () => {
    try {
      const res = await apiClient.get("/api/sliders");
      if (res.data?.success && Array.isArray(res.data?.data)) {
        const allSliders = res.data.data;
        const main = allSliders.filter(
          (s: any) => s.position === "main" || s.position === "side" || !s.position
        );
        const promos = allSliders.filter((s: any) => s.position === "triple_promo");
        if (main.length > 0) {
          setSliders(main);
        }
        if (promos.length > 0) {
          setPromoBanners(promos);
        }
      }
    } catch (err) {
      // Retain DEFAULT_SLIDERS on error
    }
  };

  // Auto-advance banner slides every 4.5 seconds
  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => {
        const next = (prev + 1) % sliders.length;
        sliderScrollRef.current?.scrollTo({
          x: next * bannerWidth,
          animated: true,
        });
        return next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [sliders.length, bannerWidth]);

  const handleSlideScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / bannerWidth);
    if (index >= 0 && index < sliders.length && index !== activeSlideIndex) {
      setActiveSlideIndex(index);
    }
  };

  const loadFeaturedProducts = async () => {
    try {
      setLoadingProducts(true);
      setLoadError(null);
      const res = await apiClient.get("/api/products?limit=30");
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setProducts(res.data.data);
      }
    } catch (err: any) {
      setLoadError(err.message || "Failed to load products from server.");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleQuickAdd = async (productId: string) => {
    setAddingId(productId);
    const ok = await addToCart(productId, undefined, 1);
    setAddingId(null);
    if (ok) {
      setAddedId(productId);
      setTimeout(() => setAddedId(null), 2000);
    }
  };

  const filteredHubs = pinSearch.trim()
    ? POPULAR_INDIAN_HUBS.filter(
        (h) =>
          h.pincode.includes(pinSearch.trim()) ||
          h.city.toLowerCase().includes(pinSearch.toLowerCase())
      )
    : POPULAR_INDIAN_HUBS;

  // Filter products by search query AND selected Flipkart category tab
  const displayProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery.trim() ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCategoryTab === "all") return true;

    const pCat = (p.categorySlug || p.category?.slug || p.categoryId || "").toLowerCase();
    const pName = (p.name || "").toLowerCase();

    if (selectedCategoryTab === "mobiles") {
      return (
        pCat.includes("electronic") ||
        pName.includes("iphone") ||
        pName.includes("samsung") ||
        pName.includes("phone") ||
        pName.includes("pixel")
      );
    }
    if (selectedCategoryTab === "fashion") {
      return (
        pCat.includes("fashion") ||
        pName.includes("hoodie") ||
        pName.includes("shirt") ||
        pName.includes("jacket") ||
        pName.includes("trench")
      );
    }
    if (selectedCategoryTab === "electronics") {
      return (
        pCat.includes("electronic") ||
        pName.includes("macbook") ||
        pName.includes("laptop") ||
        pName.includes("headphone") ||
        pName.includes("sound") ||
        pName.includes("watch")
      );
    }
    if (selectedCategoryTab === "beauty") {
      return (
        pCat.includes("beauty") ||
        pCat.includes("health") ||
        pName.includes("cream") ||
        pName.includes("argan") ||
        pName.includes("perfume")
      );
    }
    if (selectedCategoryTab === "groceries") {
      return (
        pCat.includes("grocer") ||
        pName.includes("almond") ||
        pName.includes("coffee") ||
        pName.includes("tea")
      );
    }
    if (selectedCategoryTab === "shoes") {
      return (
        pCat.includes("shoe") ||
        pCat.includes("sport") ||
        pName.includes("nike") ||
        pName.includes("puma") ||
        pName.includes("react") ||
        pName.includes("sneaker")
      );
    }
    if (selectedCategoryTab === "pharmacy") {
      return (
        pCat.includes("pharmacy") ||
        pName.includes("vitamin") ||
        pName.includes("tablet") ||
        pName.includes("supplement")
      );
    }
    return true;
  });

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* 1. Header with e-Shop Brand & Search */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#F1F5F9",
        }}
      >
        {/* Top Row: Store Name & Quick Cart */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: "#2563EB",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
              }}
            >
              <Text style={{ fontSize: 18 }}>🛍️</Text>
            </View>
            <View>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Text style={{ fontSize: 22, fontWeight: "900", color: "#0F172A", letterSpacing: -0.5 }}>
                  e-
                </Text>
                <Text style={{ fontSize: 22, fontWeight: "900", color: "#2563EB", letterSpacing: -0.5 }}>
                  Shop
                </Text>
              </View>
              <Text style={{ fontSize: 9, fontWeight: "700", color: "#16A34A", marginTop: -2 }}>
                Superstore • Express Delivery
              </Text>
            </View>
          </View>

          {/* Cart Icon with Live Badge */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/cart")}
            activeOpacity={0.7}
            style={{
              position: "relative",
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#F8FAFC",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShoppingCart size={19} color="#0F172A" />
            {totalItems > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  backgroundColor: "#2563EB",
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 4,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "900" }}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Location Pill */}
        <TouchableOpacity
          onPress={() => setIsLocationModalOpen(true)}
          activeOpacity={0.7}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F8FAFC",
            paddingHorizontal: 10,
            paddingVertical: 7,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            marginBottom: 8,
          }}
        >
          <MapPin size={14} color="#2563EB" style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 11, color: "#64748B", marginRight: 4 }}>Delivering to:</Text>
          <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: "800", color: "#0F172A", flex: 1 }}>
            {currentLocation.city || "Mumbai"} ({currentLocation.pincode || "400001"})
          </Text>
          <Text style={{ fontSize: 10, color: "#2563EB", fontWeight: "800", marginLeft: 4 }}>Change ▼</Text>
        </TouchableOpacity>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F1F5F9",
            borderRadius: 10,
            paddingHorizontal: 12,
            height: 40,
          }}
        >
          <Search size={16} color="#64748B" style={{ marginRight: 8 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search iPhone, sneakers, hoodies, electronics..."
            placeholderTextColor="#94A3B8"
            style={{ flex: 1, fontSize: 13, color: "#0F172A" }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={{ padding: 4 }}>
              <X size={15} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* ======================================================== */}
        {/* 2. FLIPKART UI: FIRST CATEGORY NAVIGATION STRIP           */}
        {/* Directly at the top with vibrant blue active underline  */}
        {/* ======================================================== */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            paddingTop: 10,
            paddingBottom: 4,
            borderBottomWidth: 1,
            borderBottomColor: "#F1F5F9",
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12 }}
          >
            {FLIPKART_CATEGORIES.map((cat) => {
              const isSelected = selectedCategoryTab === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategoryTab(cat.id)}
                  activeOpacity={0.7}
                  style={{
                    alignItems: "center",
                    marginHorizontal: 10,
                    paddingBottom: 6,
                  }}
                >
                  {/* Category Rounded Icon Pill */}
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 16,
                      backgroundColor: isSelected ? "#EFF6FF" : "#F8FAFC",
                      borderWidth: 1.5,
                      borderColor: isSelected ? "#2563EB" : "#E2E8F0",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 5,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: isSelected ? 0.08 : 0.03,
                      shadowRadius: 2,
                      elevation: isSelected ? 2 : 1,
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
                  </View>

                  {/* Category Label */}
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: isSelected ? "900" : "600",
                      color: isSelected ? "#0F172A" : "#64748B",
                      marginBottom: 4,
                    }}
                  >
                    {cat.name}
                  </Text>

                  {/* Flipkart-style Active Blue Underline Bar */}
                  <View
                    style={{
                      width: 28,
                      height: 3,
                      borderRadius: 1.5,
                      backgroundColor: isSelected ? "#2563EB" : "transparent",
                    }}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ======================================================== */}
        {/* 3. HERO BANNER CAROUSEL: CLEAN IMAGE WITHOUT TEXT        */}
        {/* User requested: "banner se text hata do"                 */}
        {/* ======================================================== */}
        <View style={{ marginTop: 14, marginBottom: 14 }}>
          <ScrollView
            ref={sliderScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleSlideScroll}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {sliders.map((slide, index) => {
              return (
                <TouchableOpacity
                  key={slide.id || index}
                  activeOpacity={0.92}
                  onPress={() => {
                    const link = slide.buttonLink || "/category/electronics";
                    router.push(link);
                  }}
                  style={{
                    width: bannerWidth,
                    height: 185,
                    borderRadius: 18,
                    overflow: "hidden",
                    backgroundColor: "#1E293B",
                    position: "relative",
                    marginRight: index < sliders.length - 1 ? 12 : 0,
                    shadowColor: "#0F172A",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.18,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                >
                  {/* Clean full banner graphic without overlapping text */}
                  <BannerSlideImage imageUrl={slide.imageUrl} index={index} />

                  {/* Minimal Subtle Pagination Dots at Bottom Center */}
                  {sliders.length > 1 && (
                    <View
                      style={{
                        position: "absolute",
                        bottom: 8,
                        left: 0,
                        right: 0,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 3,
                      }}
                    >
                      {sliders.map((s, idx) => (
                        <View
                          key={s.id || idx}
                          style={{
                            width: activeSlideIndex === idx ? 20 : 5,
                            height: 5,
                            borderRadius: 2.5,
                            backgroundColor:
                              activeSlideIndex === idx ? "#FFFFFF" : "rgba(255, 255, 255, 0.55)",
                            marginHorizontal: 2.5,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.4,
                            shadowRadius: 2,
                          }}
                        />
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 3.1 Promo Banners Strip */}
        {promoBanners.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginBottom: 14 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {promoBanners.map((promo, pIdx) => (
                <TouchableOpacity
                  key={promo.id || pIdx}
                  activeOpacity={0.8}
                  onPress={() => router.push("/(tabs)/deals")}
                  style={{
                    width: 210,
                    borderRadius: 14,
                    marginRight: 10,
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    overflow: "hidden",
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 8,
                  }}
                >
                  <Image
                    source={{ uri: getFullImageUrl(promo.imageUrl) }}
                    style={{ width: 48, height: 48, borderRadius: 8, marginRight: 10 }}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1 }}>
                    {promo.badge ? (
                      <Text style={{ fontSize: 9, fontWeight: "900", color: "#2563EB", textTransform: "uppercase" }}>
                        {promo.badge}
                      </Text>
                    ) : null}
                    <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: "800", color: "#0F172A" }}>
                      {promo.title}
                    </Text>
                    <Text numberOfLines={1} style={{ fontSize: 10, color: "#64748B", marginTop: 1 }}>
                      {promo.subtitle || "Exclusive Deal"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ======================================================== */}
        {/* 4. PRODUCTS GRID WITH HIGH-VISIBILITY OFFERS & SAVINGS    */}
        {/* User requested: "product per jo offer hai wo bhi nhi      */}
        {/* dikh rhe hai" - Now every offer is highlighted!          */}
        {/* ======================================================== */}
        <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Flame size={18} color="#EA580C" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
                {searchQuery
                  ? `Search Results (${displayProducts.length})`
                  : selectedCategoryTab !== "all"
                  ? `${FLIPKART_CATEGORIES.find((c) => c.id === selectedCategoryTab)?.name || "Category"} (${displayProducts.length})`
                  : "Trending & Best Sellers • Mega Deals"}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(tabs)/deals")}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#2563EB" }}>View All &rarr;</Text>
            </TouchableOpacity>
          </View>

          {loadingProducts ? (
            <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 30 }} />
          ) : loadError ? (
            <View style={{ backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#DBEAFE", borderRadius: 12, padding: 14, alignItems: "center", marginVertical: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#1E3A8A", marginBottom: 4 }}>
                Connecting to e-Shop Backend
              </Text>
              <Text style={{ fontSize: 11, color: "#3B82F6", textAlign: "center", marginBottom: 10 }}>
                Server: {API_BASE_URL}
              </Text>
              <TouchableOpacity
                onPress={loadFeaturedProducts}
                style={{ backgroundColor: "#2563EB", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>Tap to Retry</Text>
              </TouchableOpacity>
            </View>
          ) : displayProducts.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 36 }}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🛍️</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#64748B" }}>No products in this category</Text>
              <TouchableOpacity
                onPress={() => setSelectedCategoryTab("all")}
                style={{ marginTop: 10, backgroundColor: "#EFF6FF", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 }}
              >
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#2563EB" }}>View All Products</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
              {displayProducts.map((prod) => {
                const isAdding = addingId === prod.id;
                const isAdded = addedId === prod.id;
                const imageUrl = getFullImageUrl(prod.mainImage);
                const isWish = isInWishlist(prod.id);

                // Calculate Offer / Discount
                const priceNum = Number(prod.price || 0);
                const comparePriceNum = prod.comparePrice
                  ? Number(prod.comparePrice)
                  : Math.round(priceNum * 1.25);
                const discountPercent =
                  comparePriceNum > priceNum
                    ? Math.round(((comparePriceNum - priceNum) / comparePriceNum) * 100)
                    : 20;
                const savingsAmount = comparePriceNum - priceNum;

                return (
                  <TouchableOpacity
                    key={prod.id}
                    activeOpacity={0.88}
                    onPress={() => router.push(`/products/${prod.id}`)}
                    style={{
                      width: "48.5%",
                      backgroundColor: "#FFFFFF",
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      padding: 10,
                      marginBottom: 14,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.04,
                      shadowRadius: 3,
                      elevation: 2,
                      position: "relative",
                    }}
                  >
                    {/* High-Visibility Offer Discount Badge (Top Left) */}
                    <View
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        zIndex: 10,
                        backgroundColor: "#16A34A",
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                        borderRadius: 6,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.2,
                        shadowRadius: 2,
                        elevation: 3,
                      }}
                    >
                      <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "900" }}>
                        {discountPercent}% OFF
                      </Text>
                    </View>

                    {/* Heart Wishlist Toggle Button (Top Right) */}
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation?.();
                        toggleWishlist(prod);
                      }}
                      activeOpacity={0.7}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        zIndex: 10,
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: "rgba(255, 255, 255, 0.92)",
                        alignItems: "center",
                        justifyContent: "center",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.15,
                        shadowRadius: 2,
                        elevation: 3,
                      }}
                    >
                      <Heart
                        size={15}
                        color={isWish ? "#EF4444" : "#94A3B8"}
                        fill={isWish ? "#EF4444" : "transparent"}
                      />
                    </TouchableOpacity>

                    {/* Product Image */}
                    <View
                      style={{
                        width: "100%",
                        height: 130,
                        backgroundColor: "#F8FAFC",
                        borderRadius: 8,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 8,
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        source={{ uri: imageUrl }}
                        resizeMode="contain"
                        style={{ width: "90%", height: "90%" }}
                      />
                    </View>

                    <Text numberOfLines={1} style={{ fontSize: 10, fontWeight: "800", color: "#2563EB", textTransform: "uppercase" }}>
                      {prod.brand || "e-Shop"}
                    </Text>

                    <Text numberOfLines={2} style={{ fontSize: 12, fontWeight: "700", color: "#0F172A", minHeight: 32, marginTop: 2 }}>
                      {prod.name}
                    </Text>

                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", marginLeft: 4 }}>
                        {prod.rating || 4.5}
                      </Text>
                      <Text style={{ fontSize: 10, color: "#94A3B8", marginLeft: 4 }}>
                        ({prod.reviewsCount || 40})
                      </Text>
                    </View>

                    {/* Price with Original Compare Price & Discount */}
                    <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 6, flexWrap: "wrap" }}>
                      <Text style={{ fontSize: 15, fontWeight: "900", color: "#0F172A" }}>
                        ₹{priceNum.toLocaleString("en-IN")}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#94A3B8", textDecorationLine: "line-through", marginLeft: 6 }}>
                        ₹{comparePriceNum.toLocaleString("en-IN")}
                      </Text>
                      <Text style={{ fontSize: 11, fontWeight: "900", color: "#16A34A", marginLeft: 6 }}>
                        {discountPercent}% off
                      </Text>
                    </View>

                    {/* Flipkart-Style Offer Tagline */}
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                      <Tag size={11} color="#16A34A" style={{ marginRight: 4 }} />
                      <Text numberOfLines={1} style={{ fontSize: 10, fontWeight: "800", color: "#16A34A" }}>
                        Save ₹{savingsAmount.toLocaleString("en-IN")} • Special Deal
                      </Text>
                    </View>

                    {/* Quick Add to Cart Button */}
                    <TouchableOpacity
                      onPress={() => handleQuickAdd(prod.id)}
                      disabled={isAdding}
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: isAdded ? "#16A34A" : "#EFF6FF",
                        borderWidth: 1,
                        borderColor: isAdded ? "#16A34A" : "#BFDBFE",
                        paddingVertical: 7,
                        borderRadius: 8,
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 8,
                        flexDirection: "row",
                      }}
                    >
                      {isAdding ? (
                        <ActivityIndicator size="small" color="#2563EB" />
                      ) : isAdded ? (
                        <>
                          <Check size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                          <Text style={{ fontSize: 11, fontWeight: "800", color: "#FFFFFF" }}>Added</Text>
                        </>
                      ) : (
                        <Text style={{ fontSize: 11, fontWeight: "800", color: "#2563EB" }}>+ Add to Cart</Text>
                      )}
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 5. Indian PIN & Delivery Modal */}
      <Modal visible={isLocationModalOpen} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "80%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <View>
                <Text style={{ fontSize: 17, fontWeight: "900", color: "#0F172A" }}>Select Delivery Address</Text>
                <Text style={{ fontSize: 12, color: "#64748B" }}>Express doorstep shipping across India</Text>
              </View>
              <TouchableOpacity onPress={() => setIsLocationModalOpen(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Indian PIN / City Search */}
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 12, height: 42, marginBottom: 12 }}>
              <Search size={16} color="#64748B" style={{ marginRight: 8 }} />
              <TextInput
                value={pinSearch}
                onChangeText={setPinSearch}
                placeholder="Search area, city, or 6-digit PIN code"
                placeholderTextColor="#94A3B8"
                style={{ flex: 1, fontSize: 13, color: "#0F172A" }}
              />
            </View>

            {/* GPS Auto-Detect Button */}
            <TouchableOpacity
              onPress={async () => {
                await detectGPSLocation();
                setIsLocationModalOpen(false);
              }}
              disabled={isDetecting}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                backgroundColor: "#EFF6FF",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#BFDBFE",
                marginBottom: 16,
              }}
            >
              <LocateFixed size={18} color="#2563EB" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#1D4ED8" }}>
                  {isDetecting ? "Detecting GPS Location..." : "Use My Current Location"}
                </Text>
                <Text style={{ fontSize: 11, color: "#3B82F6" }}>Autofill state, city, and nearest postal hub</Text>
              </View>
            </TouchableOpacity>

            <Text style={{ fontSize: 12, fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: 8 }}>
              Popular Indian Hubs
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredHubs.map((hub) => (
                <TouchableOpacity
                  key={hub.pincode}
                  onPress={() => {
                    selectLocation({
                      pincode: hub.pincode,
                      city: hub.city,
                      state: hub.state,
                      label: `${hub.city}, ${hub.state} (${hub.pincode})`,
                    });
                    setIsLocationModalOpen(false);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F1F5F9",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MapPin size={16} color="#64748B" style={{ marginRight: 10 }} />
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: "700", color: "#0F172A" }}>
                        {hub.city}, {hub.state}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#64748B" }}>PIN: {hub.pincode}</Text>
                    </View>
                  </View>
                  {currentLocation.pincode === hub.pincode && (
                    <Text style={{ fontSize: 11, fontWeight: "800", color: "#2563EB" }}>Selected</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
