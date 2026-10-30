import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Flame,
  Gift,
  Package,
  Sparkles,
  ChevronRight,
  Send,
  Clock,
  Tag,
} from "lucide-react-native";
import { useNotificationStore, NotificationItem } from "../../src/store/notificationStore";

const CATEGORIES = [
  { id: "all", label: "All", icon: Bell },
  { id: "deal", label: "🔥 Top Deals", icon: Flame },
  { id: "offer", label: "🎁 Offers", icon: Gift },
  { id: "order", label: "📦 Orders", icon: Package },
  { id: "system", label: "🔔 Alerts", icon: Sparkles },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    sendCustomNotification,
  } = useNotificationStore();

  const [activeTab, setActiveTab] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications(activeTab);
    }, [activeTab])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(activeTab);
    setRefreshing(false);
  };

  const handleTabChange = (catId: string) => {
    setActiveTab(catId);
    fetchNotifications(catId);
  };

  const handleNotificationPress = async (item: NotificationItem) => {
    if (!item.isRead) {
      await markAsRead(item.id);
    }
    const target = item.actionUrl || "/(tabs)/deals";
    router.push(target as any);
  };

  // Interactive Test Notification Trigger
  const handleTriggerTestDeal = async () => {
    try {
      setIsSendingTest(true);
      const testDeals = [
        {
          title: "🔥 Flash Sale: 60% OFF on Flagship Mobiles!",
          body: "Festive discount live right now on iPhone 16 Pro, Samsung & accessories. Free delivery included!",
          category: "deal" as const,
          badge: "60% OFF",
          actionUrl: "/(tabs)/deals",
          actionText: "Shop Deals",
        },
        {
          title: "🎁 Special Offer: Flat ₹300 Cashback on UPI!",
          body: "Pay via Razorpay UPI and receive instant cash back directly to your account. Valid today only.",
          category: "offer" as const,
          badge: "₹300 CASHBACK",
          actionUrl: "/checkout",
          actionText: "Claim Now",
        },
        {
          title: "⚡ Lightning Deal: Nike Air Max 270 React at ₹161",
          body: "Lowest price drop ever recorded. Exclusive app-only pricing with instant checkout.",
          category: "deal" as const,
          badge: "FLASH SALE",
          actionUrl: "/products/prod_nike_af1",
          actionText: "Grab Deal",
        },
      ];

      const randomDeal = testDeals[Math.floor(Math.random() * testDeals.length)];
      await sendCustomNotification(randomDeal);
    } finally {
      setIsSendingTest(false);
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "Recently";
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return "Recently";
    }
  };

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.category === activeTab);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Notifications & Offers</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0 ? `${unreadCount} unread alerts` : "All caught up"}
            </Text>
          </View>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={markAllAsRead}
            activeOpacity={0.8}
            style={styles.markAllBtn}
          >
            <CheckCheck size={14} color="#2563EB" style={{ marginRight: 4 }} />
            <Text style={styles.markAllText}>Mark Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Interactive Trigger Banner: Send Test Notification */}
      <View style={styles.testBannerContainer}>
        <TouchableOpacity
          onPress={handleTriggerTestDeal}
          disabled={isSendingTest}
          activeOpacity={0.85}
          style={styles.testBanner}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View style={styles.sendIconBox}>
              {isSendingTest ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Send size={15} color="#FFFFFF" />
              )}
            </View>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.testBannerTitle}>
                🔔 Send Test Deal / Offer Notification
              </Text>
              <Text style={styles.testBannerSub}>
                Tap to simulate real-time notification with floating banner alert!
              </Text>
            </View>
          </View>
          <ChevronRight size={16} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = activeTab === item.id;
            return (
              <TouchableOpacity
                onPress={() => handleTabChange(item.id)}
                activeOpacity={0.7}
                style={[
                  styles.tabChip,
                  isSelected && styles.tabChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabChipText,
                    isSelected && styles.tabChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          isLoading ? (
            <View style={{ alignItems: "center", justifyContent: "center", padding: 40 }}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={{ marginTop: 12, fontSize: 13, color: "#64748B" }}>
                Loading updates...
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Bell size={40} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Notifications Found</Text>
              <Text style={styles.emptySub}>
                You have received no alerts in this category yet. Check back for seasonal deals!
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/deals")}
                style={styles.exploreDealsBtn}
              >
                <Text style={styles.exploreDealsText}>Explore Top Deals</Text>
              </TouchableOpacity>
            </View>
          )
        }
        renderItem={({ item }) => {
          const isDeal = item.category === "deal";
          const isOffer = item.category === "offer";
          const accentColor = isDeal ? "#EA580C" : isOffer ? "#16A34A" : "#2563EB";
          const lightBg = isDeal ? "#FFF7ED" : isOffer ? "#F0FDF4" : "#EFF6FF";

          return (
            <TouchableOpacity
              onPress={() => handleNotificationPress(item)}
              activeOpacity={0.85}
              style={[
                styles.notifCard,
                !item.isRead && styles.notifCardUnread,
              ]}
            >
              <View style={styles.notifHeaderRow}>
                {/* Icon box */}
                <View style={[styles.notifIconBox, { backgroundColor: lightBg }]}>
                  <Text style={{ fontSize: 18 }}>
                    {item.icon || (isDeal ? "🔥" : isOffer ? "🎁" : "📦")}
                  </Text>
                </View>

                {/* Title & Badge */}
                <View style={{ flex: 1, paddingHorizontal: 10 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                    <Text style={styles.notifTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    {item.badge && (
                      <View style={[styles.dealBadge, { backgroundColor: accentColor }]}>
                        <Text style={styles.dealBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.notifTime}>{formatTime(item.createdAt)}</Text>
                </View>

                {/* Unread indicator dot */}
                {!item.isRead && <View style={styles.unreadDot} />}
              </View>

              {/* Description Body */}
              <Text style={styles.notifBody}>{item.body}</Text>

              {/* Action Button Row */}
              <View style={styles.cardFooter}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Tag size={12} color={accentColor} style={{ marginRight: 4 }} />
                  <Text style={[styles.cardCategoryText, { color: accentColor }]}>
                    {item.category.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.actionPill}>
                  <Text style={[styles.actionPillText, { color: accentColor }]}>
                    {item.actionText || "View Deal"}
                  </Text>
                  <ChevronRight size={13} color={accentColor} />
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  markAllText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2563EB",
  },
  testBannerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  testBanner: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1.5,
    borderColor: "#93C5FD",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sendIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  testBannerTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#1E3A8A",
  },
  testBannerSub: {
    fontSize: 10,
    color: "#3B82F6",
    marginTop: 2,
  },
  tabsContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
  },
  tabChipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  tabChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  notifCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  notifCardUnread: {
    borderColor: "#BFDBFE",
    backgroundColor: "#FAFCFF",
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
  },
  notifHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  notifIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 18,
  },
  dealBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dealBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  notifTime: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 3,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
    marginTop: 4,
  },
  notifBody: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 17,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 8,
  },
  cardCategoryText: {
    fontSize: 10,
    fontWeight: "800",
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: "800",
    marginRight: 2,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  emptySub: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  exploreDealsBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  exploreDealsText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },
});
