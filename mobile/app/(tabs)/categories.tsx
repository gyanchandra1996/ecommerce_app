import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";

const CATEGORIES = [
  { id: "cat_electronics", name: "Electronics", slug: "electronics", icon: "📱", desc: "Flagship phones, laptops, audio" },
  { id: "cat_fashion", name: "Fashion", slug: "fashion", icon: "👕", desc: "Men's apparel, shoes, jackets" },
  { id: "cat_womens", name: "Women's", slug: "womens", icon: "👗", desc: "Ethnic wear, handbags, dresses" },
  { id: "cat_kids_fashion", name: "Kids' Fashion", slug: "kids-fashion", icon: "🧸", desc: "Toys, babywear, school shoes" },
  { id: "cat_health_beauty", name: "Health & Beauty", slug: "health-beauty", icon: "✨", desc: "Skincare, fragrance, personal care" },
  { id: "cat_pharmacy", name: "Pharmacy", slug: "pharmacy", icon: "💊", desc: "Wellness, vitamins, first-aid" },
  { id: "cat_groceries", name: "Groceries", slug: "groceries", icon: "🛒", desc: "Daily pantry, teas, superfoods" },
  { id: "cat_luxury_item", name: "Luxury Item", slug: "luxury-item", icon: "💎", desc: "Chronographs, diamond jewelry" },
];

export default function CategoriesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
        <Text style={{ fontSize: 20, fontWeight: "900", color: "#0F172A" }}>e-Shop Categories</Text>
        <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Explore 8 core shopping departments with verified prices</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            activeOpacity={0.7}
            onPress={() => router.push(`/category/${cat.slug}`)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 14,
              backgroundColor: "#F8FAFC",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              marginBottom: 10,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
                borderWidth: 1,
                borderColor: "#E2E8F0",
              }}
            >
              <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}>{cat.name}</Text>
              <Text style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{cat.desc}</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
