import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { X, ChevronRight, Bell, Sparkles } from "lucide-react-native";
import { useNotificationStore } from "../store/notificationStore";

export function NotificationBanner() {
  const router = useRouter();
  const { activeBanner, hideBanner } = useNotificationStore();
  const slideAnim = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    if (activeBanner) {
      // Slide Down
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        dismissBanner();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      slideAnim.setValue(-120);
    }
  }, [activeBanner]);

  const dismissBanner = () => {
    Animated.timing(slideAnim, {
      toValue: -140,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      hideBanner();
    });
  };

  const handlePressAction = () => {
    if (!activeBanner) return;
    const targetUrl = activeBanner.actionUrl || "/(tabs)/deals";
    dismissBanner();
    router.push(targetUrl as any);
  };

  if (!activeBanner) return null;

  const isDeal = activeBanner.category === "deal";
  const isOffer = activeBanner.category === "offer";
  const accentColor = isDeal ? "#EA580C" : isOffer ? "#16A34A" : "#2563EB";
  const bgColor = isDeal ? "#FFF7ED" : isOffer ? "#F0FDF4" : "#EFF6FF";
  const borderColor = isDeal ? "#FDBA74" : isOffer ? "#86EFAC" : "#93C5FD";

  return (
    <Animated.View
      style={[
        styles.bannerContainer,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: bgColor,
            borderColor: borderColor,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handlePressAction}
          style={styles.contentRow}
        >
          {/* Icon Badge */}
          <View style={[styles.iconBox, { backgroundColor: accentColor }]}>
            <Text style={{ fontSize: 16 }}>
              {activeBanner.icon || (isDeal ? "🔥" : isOffer ? "🎁" : "⚡")}
            </Text>
          </View>

          {/* Texts */}
          <View style={{ flex: 1, paddingRight: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
              <Text style={[styles.title, { color: "#0F172A" }]} numberOfLines={1}>
                {activeBanner.title}
              </Text>
              {activeBanner.badge && (
                <View style={[styles.badge, { backgroundColor: accentColor }]}>
                  <Text style={styles.badgeText}>{activeBanner.badge}</Text>
                </View>
              )}
            </View>
            <Text style={styles.body} numberOfLines={2}>
              {activeBanner.body}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
              <Text style={[styles.actionText, { color: accentColor }]}>
                {activeBanner.actionText || "View Deal"}
              </Text>
              <ChevronRight size={12} color={accentColor} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Close Button */}
        <TouchableOpacity
          onPress={dismissBanner}
          style={styles.closeBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={15} color="#64748B" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  contentRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: "900",
    flex: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  body: {
    fontSize: 11,
    color: "#475569",
    lineHeight: 15,
  },
  actionText: {
    fontSize: 11,
    fontWeight: "800",
  },
  closeBtn: {
    padding: 2,
    marginLeft: 4,
  },
});
