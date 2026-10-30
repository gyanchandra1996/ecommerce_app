import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, ViewStyle } from "react-native";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = 6,
  style,
}: SkeletonProps) {
  const opacityAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: "#CBD5E1",
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <View
      style={{
        width: "48%",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#F1F5F9",
      }}
    >
      <Skeleton width="100%" height={120} borderRadius={10} style={{ marginBottom: 10 }} />
      <Skeleton width="50%" height={10} borderRadius={4} style={{ marginBottom: 6 }} />
      <Skeleton width="85%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
      <Skeleton width="40%" height={16} borderRadius={4} style={{ marginBottom: 10 }} />
      <Skeleton width="100%" height={32} borderRadius={8} />
    </View>
  );
}

export function BannerSkeleton({ height = 185 }: { height?: number }) {
  return (
    <View style={{ marginHorizontal: 16, marginVertical: 12 }}>
      <Skeleton width="100%" height={height} borderRadius={18} />
    </View>
  );
}

export function OrderCardSkeleton() {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#F1F5F9",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
        <Skeleton width="40%" height={14} borderRadius={4} />
        <Skeleton width="25%" height={14} borderRadius={4} />
      </View>
      <Skeleton width="70%" height={12} borderRadius={4} style={{ marginBottom: 8 }} />
      <Skeleton width="30%" height={18} borderRadius={4} />
    </View>
  );
}
