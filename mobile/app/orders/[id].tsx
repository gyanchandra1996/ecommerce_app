import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Check,
  Package,
  Calendar,
  Clock,
  MessageCircle,
  Phone,
  MapPin,
  ExternalLink,
  Truck,
  ChevronRight,
  ShieldCheck,
} from "lucide-react-native";

export default function OrderTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = (params.id as string) || "tags8842";
  const orderNumber = (params.orderNumber as string) || orderId;

  const [activeStep] = useState(2); // 0: Order Placed, 1: Packed, 2: Shipped / In Transit, 3: Delivered

  const handleCallCourier = () => {
    Linking.openURL("tel:+919876543210").catch(() => {
      Alert.alert("Contact Courier", "Calling Rahul Sharma at +91 98765 43210");
    });
  };

  const handleMessageCourier = () => {
    Linking.openURL("sms:+919876543210?body=Hi, inquiring about order #" + orderNumber).catch(() => {
      Alert.alert("Message Courier", "SMS: Inquiring about order #" + orderNumber);
    });
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Top Header matching Inspiration Screenshot */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "#F1F5F9",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#F8FAFC",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            borderWidth: 1,
            borderColor: "#E2E8F0",
          }}
        >
          <ArrowLeft size={18} color="#0F172A" />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "900",
            color: "#0F172A",
            letterSpacing: -0.4,
          }}
        >
          Order Tracking
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
      >
        {/* Horizontal Tracking Stepper matching Image 2 Screen 2 */}
        <View style={{ marginBottom: 24, marginTop: 4 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
            }}
          >
            {/* Step 1: Order placed */}
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: "#7C3AED",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Check size={14} color="#FFFFFF" strokeWidth={3} />
            </View>

            {/* Stepper Line 1 */}
            <View
              style={{
                flex: 1,
                height: 3,
                backgroundColor: "#7C3AED",
                marginHorizontal: 6,
                borderRadius: 2,
              }}
            />

            {/* Step 2: Packed */}
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: "#7C3AED",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Check size={14} color="#FFFFFF" strokeWidth={3} />
            </View>

            {/* Stepper Line 2 */}
            <View
              style={{
                flex: 1,
                height: 3,
                backgroundColor: "#7C3AED",
                marginHorizontal: 6,
                borderRadius: 2,
              }}
            />

            {/* Step 3: Shipped / In Transit */}
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: "#7C3AED",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Truck size={13} color="#FFFFFF" />
            </View>

            {/* Stepper Line 3 */}
            <View
              style={{
                flex: 1,
                height: 3,
                backgroundColor: "#E2E8F0",
                marginHorizontal: 6,
                borderRadius: 2,
              }}
            />

            {/* Step 4: Delivered */}
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: "#E2E8F0",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#94A3B8",
                }}
              />
            </View>
          </View>

          {/* Stepper Labels */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 8,
              paddingHorizontal: 2,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#7C3AED" }}>
              Order placed
            </Text>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#7C3AED", marginLeft: 4 }}>
              Packed
            </Text>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#7C3AED" }}>
              Shipped
            </Text>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#94A3B8" }}>
              Delivered
            </Text>
          </View>
        </View>

        {/* Live Route Map Card matching Image 2 Screen 2 */}
        <View
          style={{
            height: 180,
            borderRadius: 20,
            backgroundColor: "#F3F0FF",
            borderWidth: 1,
            borderColor: "#E9D5FF",
            position: "relative",
            overflow: "hidden",
            marginBottom: 20,
            padding: 16,
            justifyContent: "space-between",
          }}
        >
          {/* Decorative Map Grid & Streets */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.35,
            }}
          >
            {/* Grid street lines */}
            <View style={{ position: "absolute", top: 40, left: 0, right: 0, height: 8, backgroundColor: "#DDD6FE" }} />
            <View style={{ position: "absolute", top: 100, left: 0, right: 0, height: 8, backgroundColor: "#DDD6FE" }} />
            <View style={{ position: "absolute", top: 0, bottom: 0, left: 70, width: 8, backgroundColor: "#DDD6FE" }} />
            <View style={{ position: "absolute", top: 0, bottom: 0, left: 180, width: 8, backgroundColor: "#DDD6FE" }} />
            <View style={{ position: "absolute", top: 0, bottom: 0, right: 70, width: 8, backgroundColor: "#DDD6FE" }} />
          </View>

          {/* Purple Route Trail */}
          <View
            style={{
              position: "absolute",
              top: 40,
              left: 70,
              width: 140,
              height: 70,
              borderLeftWidth: 4,
              borderBottomWidth: 4,
              borderColor: "#7C3AED",
              borderRadius: 6,
            }}
          />

          {/* Delivery Van on Route */}
          <View
            style={{
              position: "absolute",
              top: 32,
              left: 115,
              width: 28,
              height: 24,
              borderRadius: 6,
              backgroundColor: "#7C3AED",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#7C3AED",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Text style={{ fontSize: 13 }}>🚚</Text>
          </View>

          {/* Destination Pin */}
          <View
            style={{
              position: "absolute",
              bottom: 60,
              left: 62,
              alignItems: "center",
            }}
          >
            <MapPin size={22} color="#EC4899" fill="#EC4899" />
          </View>

          {/* Map Header / Popout Button */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: "800", color: "#6D28D9" }}>
                LIVE GPS ROUTE
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => Alert.alert("Live Map", "Real-time carrier GPS coordinates synced.")}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <ExternalLink size={14} color="#6D28D9" />
            </TouchableOpacity>
          </View>

          {/* Live ETA Pill */}
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#10B981", marginRight: 6 }} />
            <Text style={{ fontSize: 11, fontWeight: "800", color: "#0F172A" }}>
              Arriving in 25-35 mins
            </Text>
          </View>
        </View>

        {/* 3 Status Metric Boxes matching Image 2 Screen 2 */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          {/* Status Box (Green) */}
          <View
            style={{
              width: "31%",
              backgroundColor: "#F0FDF4",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#BBF7D0",
              padding: 12,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#DCFCE7",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              <Package size={18} color="#16A34A" />
            </View>
            <Text style={{ fontSize: 10, fontWeight: "700", color: "#64748B" }}>Status</Text>
            <Text
              numberOfLines={1}
              style={{ fontSize: 11, fontWeight: "900", color: "#16A34A", marginTop: 2 }}
            >
              In Transit
            </Text>
          </View>

          {/* Delivery Date Box (Blue) */}
          <View
            style={{
              width: "31%",
              backgroundColor: "#EFF6FF",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#BFDBFE",
              padding: 12,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#DBEAFE",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              <Calendar size={18} color="#2563EB" />
            </View>
            <Text style={{ fontSize: 10, fontWeight: "700", color: "#64748B" }}>Delivery date</Text>
            <Text
              numberOfLines={1}
              style={{ fontSize: 11, fontWeight: "900", color: "#2563EB", marginTop: 2 }}
            >
              Today, 6 PM
            </Text>
          </View>

          {/* Updated Box (Purple) */}
          <View
            style={{
              width: "31%",
              backgroundColor: "#FAF5FF",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#E9D5FF",
              padding: 12,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#F3E8FF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              <Clock size={18} color="#7C3AED" />
            </View>
            <Text style={{ fontSize: 10, fontWeight: "700", color: "#64748B" }}>Updated</Text>
            <Text
              numberOfLines={1}
              style={{ fontSize: 11, fontWeight: "900", color: "#7C3AED", marginTop: 2 }}
            >
              2 min ago
            </Text>
          </View>
        </View>

        {/* Courier Driver Card matching Image 2 Screen 2 */}
        <View
          style={{
            backgroundColor: "#F8FAFC",
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            padding: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Courier Avatar */}
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                backgroundColor: "#7C3AED",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Text style={{ fontSize: 20 }}>👨‍✈️</Text>
            </View>

            <View>
              <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>Your courier</Text>
              <Text style={{ fontSize: 14, fontWeight: "900", color: "#0F172A", marginTop: 1 }}>
                Rahul Sharma (BlueDart)
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                <ShieldCheck size={11} color="#16A34A" style={{ marginRight: 3 }} />
                <Text style={{ fontSize: 10, fontWeight: "700", color: "#16A34A" }}>
                  Verified Carrier Partner
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons: Message & Call */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={handleMessageCourier}
              activeOpacity={0.7}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#0F172A",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
              }}
            >
              <MessageCircle size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCallCourier}
              activeOpacity={0.7}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#0F172A",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Phone size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Location Order Button matching Image 2 Screen 2 */}
        <TouchableOpacity
          onPress={() => Alert.alert("Live Courier GPS", "Rahul Sharma is 1.4 km away on Hill Road.")}
          activeOpacity={0.8}
          style={{
            backgroundColor: "#F1F5F9",
            borderRadius: 16,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MapPin size={18} color="#7C3AED" style={{ marginRight: 10 }} />
            <Text style={{ fontSize: 13, fontWeight: "800", color: "#0F172A" }}>
              Live Location Order
            </Text>
          </View>
          <ChevronRight size={18} color="#64748B" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
