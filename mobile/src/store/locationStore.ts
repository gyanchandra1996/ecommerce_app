import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

export interface DeliveryLocation {
  label: string;
  pincode: string;
  city: string;
  state: string;
}

export const POPULAR_INDIAN_HUBS = [
  { pincode: "110001", city: "New Delhi", state: "Delhi" },
  { pincode: "400001", city: "Mumbai", state: "Maharashtra" },
  { pincode: "560001", city: "Bengaluru", state: "Karnataka" },
  { pincode: "700001", city: "Kolkata", state: "West Bengal" },
  { pincode: "600001", city: "Chennai", state: "Tamil Nadu" },
  { pincode: "500001", city: "Hyderabad", state: "Telangana" },
  { pincode: "411001", city: "Pune", state: "Maharashtra" },
  { pincode: "380001", city: "Ahmedabad", state: "Gujarat" },
  { pincode: "302001", city: "Jaipur", state: "Rajasthan" },
  { pincode: "226001", city: "Lucknow", state: "Uttar Pradesh" },
];

interface LocationState {
  currentLocation: DeliveryLocation;
  isDetecting: boolean;
  error: string | null;
  loadStoredLocation: () => Promise<void>;
  selectLocation: (loc: DeliveryLocation) => Promise<void>;
  detectGPSLocation: () => Promise<boolean>;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: {
    label: "Deliver to Mumbai - 400001",
    pincode: "400001",
    city: "Mumbai",
    state: "Maharashtra",
  },
  isDetecting: false,
  error: null,

  loadStoredLocation: async () => {
    try {
      const stored = await AsyncStorage.getItem("gstore_delivery_location");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.label) {
          set({ currentLocation: parsed });
        }
      }
    } catch {}
  },

  selectLocation: async (loc: DeliveryLocation) => {
    set({ currentLocation: loc, error: null });
    try {
      await AsyncStorage.setItem("gstore_delivery_location", JSON.stringify(loc));
    } catch {}
  },

  detectGPSLocation: async () => {
    try {
      set({ isDetecting: true, error: null });
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        set({
          error: "Permission to access location was denied. Please select PIN manually.",
          isDetecting: false,
        });
        return false;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      const city = geocode?.city || geocode?.subregion || "Mumbai";
      const state = geocode?.region || "Maharashtra";
      const pincode = geocode?.postalCode || "400001";

      const loc: DeliveryLocation = {
        label: `Deliver to ${city} - ${pincode}`,
        pincode,
        city,
        state,
      };

      set({ currentLocation: loc, isDetecting: false });
      await AsyncStorage.setItem("gstore_delivery_location", JSON.stringify(loc));
      return true;
    } catch (err: any) {
      set({
        error: "Unable to detect GPS position. Selecting nearest hub.",
        isDetecting: false,
      });
      return false;
    }
  },
}));
