import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { X, CheckCircle2, ShoppingBag, Heart, Trash2, Info, ArrowRight } from "lucide-react-native";
import { useToastStore } from "../store/toastStore";

export function ActionToast() {
  const router = useRouter();
  const { currentToast, hideToast } = useToastStore();
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (currentToast) {
      // Spring entrance
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        dismiss();
      }, currentToast.duration || 2600);

      return () => clearTimeout(timer);
    } else {
      translateY.setValue(100);
      opacity.setValue(0);
      scale.setValue(0.9);
    }
  }, [currentToast]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 80,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideToast();
    });
  };

  if (!currentToast) return null;

  const isCart = currentToast.type === "cart";
  const isWishlist = currentToast.type === "wishlist";
  const isRemove = currentToast.type === "remove";
  const isError = currentToast.type === "error";

  const bgColor = isCart
    ? "#0F172A"
    : isWishlist
    ? "#831843"
    : isRemove
    ? "#1E293B"
    : isError
    ? "#7F1D1D"
    : "#0F172A";

  const accentColor = isCart
    ? "#10B981"
    : isWishlist
    ? "#EC4899"
    : isRemove
    ? "#F97316"
    : isError
    ? "#EF4444"
    : "#3B82F6";

  const renderIcon = () => {
    if (currentToast.icon) {
      return <Text style={{ fontSize: 18 }}>{currentToast.icon}</Text>;
    }
    if (isCart) {
      return <ShoppingBag size={18} color="#FFFFFF" />;
    }
    if (isWishlist) {
      return <Heart size={18} color="#FFFFFF" fill="#FFFFFF" />;
    }
    if (isRemove) {
      return <Trash2 size={18} color="#FFFFFF" />;
    }
    return <CheckCircle2 size={18} color="#FFFFFF" />;
  };

  const handleAction = () => {
    dismiss();
    if (currentToast.actionUrl) {
      try {
        router.push(currentToast.actionUrl as any);
      } catch {}
    } else if (isCart) {
      router.push("/(tabs)/cart");
    }
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={dismiss}
        style={[styles.pill, { backgroundColor: bgColor }]}
      >
        <View style={[styles.iconCircle, { backgroundColor: accentColor }]}>
          {renderIcon()}
        </View>

        <Text numberOfLines={2} style={styles.message}>
          {currentToast.message}
        </Text>

        {(currentToast.actionText || isCart) && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAction}
            style={styles.actionBtn}
          >
            <Text style={styles.actionText}>
              {currentToast.actionText || "View Cart"}
            </Text>
            <ArrowRight size={13} color="#93C5FD" style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={dismiss} style={styles.closeBtn}>
          <X size={15} color="#94A3B8" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 84, // elevated nicely above bottom navigation tab bar
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    maxWidth: width - 32,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 18,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  actionText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#93C5FD",
  },
  closeBtn: {
    padding: 6,
    marginLeft: 4,
  },
});
