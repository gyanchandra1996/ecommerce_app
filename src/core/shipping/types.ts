export interface ShippingProviderCredentials {
  apiKey?: string;
  apiSecret?: string;
  clientId?: string;
  clientSecret?: string;
  email?: string;
  password?: string;
  apiToken?: string;
  [key: string]: any;
}

export interface ShippingProviderSettings {
  pickupLocation?: string;
  defaultCourier?: string;
  channelId?: string;
  expressDelivery?: boolean;
  webhookSecret?: string;
  autoLabelGenerate?: boolean;
  [key: string]: any;
}

export interface ShippingRateEstimate {
  rate: number;
  currency: string;
  carrierService?: string;
  estimatedDays?: number;
  providerCode: string;
  providerName: string;
}

export interface TrackingActivity {
  status: string;
  location: string;
  timestamp: string;
  activity: string;
}

export interface TrackingResult {
  awbNumber: string;
  status: string;
  currentLocation?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  activities: TrackingActivity[];
}

export interface ShipmentDispatchResult {
  providerShipmentId: string;
  awbNumber: string;
  trackingUrl?: string;
  shippingCharge?: number;
  shippingLabelPath?: string;
  status: string;
  carrier?: string;
}

export interface ShippingAdapter {
  code: string;
  name: string;

  testConnection(
    credentials: Record<string, any>,
    settings: Record<string, any>,
    apiBaseUrl?: string
  ): Promise<{ success: boolean; message: string; details?: any }>;

  calculateRate(
    origin: { pincode: string; city?: string; state?: string },
    destination: { pincode: string; city?: string; state?: string },
    packageDetails: {
      weightKg: number;
      lengthCm?: number;
      widthCm?: number;
      heightCm?: number;
      declaredValue?: number;
      isCod?: boolean;
    },
    credentials: Record<string, any>,
    settings: Record<string, any>,
    apiBaseUrl?: string
  ): Promise<ShippingRateEstimate>;

  createShipment(
    order: {
      orderId: string;
      orderNumber: string;
      customerName: string;
      customerEmail?: string;
      customerPhone?: string;
      shippingAddress: string;
      shippingAddressDetail?: any;
      items: Array<{ name: string; quantity: number; price: number; itemNo?: string }>;
      totalPrice: number;
      paymentStatus: string;
      gateway: string;
      weightKg?: number;
    },
    credentials: Record<string, any>,
    settings: Record<string, any>,
    apiBaseUrl?: string
  ): Promise<ShipmentDispatchResult>;

  generateLabel(
    providerShipmentId: string,
    awbNumber: string,
    credentials: Record<string, any>,
    settings: Record<string, any>,
    apiBaseUrl?: string
  ): Promise<{ labelUrl: string; labelHtml?: string }>;

  trackShipment(
    awbNumber: string,
    credentials: Record<string, any>,
    settings: Record<string, any>,
    apiBaseUrl?: string
  ): Promise<TrackingResult>;

  cancelShipment(
    providerShipmentId: string,
    awbNumber: string,
    credentials: Record<string, any>,
    settings: Record<string, any>,
    apiBaseUrl?: string
  ): Promise<{ success: boolean; message: string }>;
}
