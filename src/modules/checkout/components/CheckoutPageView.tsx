"use strict";
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Lock,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  User,
  MapPin,
  Building2,
  Tag,
  Wallet,
  Smartphone,
  Banknote,
  HelpCircle,
  Edit2,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";
import { StoreHeader } from "@/modules/storefront/components/StoreHeader";
import { StoreFooter } from "@/modules/storefront/components/StoreFooter";
import { useCart } from "@/modules/cart/context/CartContext";
import { DynamicAddressForm, AddressFormData } from "@/modules/customer/components/DynamicAddressForm";
import { AddressEditModal, AddressData } from "@/modules/checkout/components/AddressEditModal";
import { PaytmSandboxModal } from "@/modules/checkout/components/PaytmSandboxModal";

interface PaymentGateway {
  id: string;
  name: string;
  code: string;
  cardTypes: string[];
  isDefault: boolean;
  isCreditCard: boolean;
  isActive: boolean;
  environment: string;
  description: string;
  credentials?: Record<string, string>;
}

interface SavedAddressItem {
  id: string;
  name: string;
  company?: string;
  country: string;
  countryCode: string;
  state: string;
  city: string;
  postalCode: string;
  streetAddress: string;
  apartment?: string;
  phone: string;
  type: "billing" | "shipping";
  isDefault: boolean;
}

function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutPageView() {
  const router = useRouter();
  const {
    items,
    isInitialized,
    totalCount,
    subtotal,
    shippingFee: cartShippingFee,
    taxAmount: cartTaxAmount,
    discountAmount,
    grandTotal: cartGrandTotal,
    coupon,
    couponError,
    couponLoading,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();

  // User state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressItem[]>([]);
  const [isUserLoading, setIsUserLoading] = useState(true);

  // Customer Contact Info (for guest or prefilled)
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Address Selection mode: "saved" or "new"
  const [selectedSavedShippingId, setSelectedSavedShippingId] = useState<string>("");
  const [selectedSavedBillingId, setSelectedSavedBillingId] = useState<string>("");

  // Shipping & Billing Address state (Defaulted to India)
  const [shippingAddress, setShippingAddress] = useState<AddressFormData>({
    name: "",
    country: "India",
    countryCode: "IN",
    state: "Maharashtra",
    city: "Mumbai",
    postalCode: "400001",
    streetAddress: "",
    apartment: "",
    phone: "",
    type: "shipping",
    isDefault: true,
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);

  const [billingAddress, setBillingAddress] = useState<AddressFormData>({
    name: "",
    country: "India",
    countryCode: "IN",
    state: "Maharashtra",
    city: "Mumbai",
    postalCode: "400001",
    streetAddress: "",
    apartment: "",
    phone: "",
    type: "billing",
    isDefault: true,
  });

  // Address Modal State for Edit & Add New
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressModalMode, setAddressModalMode] = useState<"add" | "edit">("add");
  const [addressModalTargetType, setAddressModalTargetType] = useState<"billing" | "shipping">("shipping");
  const [editingAddressData, setEditingAddressData] = useState<SavedAddressItem | null>(null);

  // Gateways
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [selectedGatewayCode, setSelectedGatewayCode] = useState<string>("");
  const [gatewayLoading, setGatewayLoading] = useState(true);

  // Paytm Sandbox Modal State
  const [isPaytmModalOpen, setIsPaytmModalOpen] = useState(false);
  const [paytmModalData, setPaytmModalData] = useState<{
    orderNumber: string;
    amount: string;
    txnToken: string;
    mid: string;
  } | null>(null);

  // Payment simulated card fields
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8892");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("889");
  const [cardHolder, setCardHolder] = useState("");
  const [upiId, setUpiId] = useState("");

  // Coupon in Checkout
  const [checkoutCouponCode, setCheckoutCouponCode] = useState("");

  // Submission & Errors
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Dynamic Shipping Charge calculation based on selected shipping address destination
  const calculateDynamicShipping = useCallback(() => {
    if (subtotal === 0) return 0;
    if (coupon?.freeShipping) return 0;

    const isDomestic =
      shippingAddress.country.toLowerCase() === "india" || shippingAddress.countryCode === "IN";
    if (!isDomestic) {
      return 250; // International shipping flat fee
    }

    // Remote regions in India
    const remoteStates = ["Andaman and Nicobar Islands", "Ladakh", "Lakshadweep"];
    if (remoteStates.includes(shippingAddress.state)) {
      return 120;
    }

    // Standard India shipping: Free above ₹499, otherwise ₹49
    if (subtotal >= 499) {
      return 0;
    }
    return 49;
  }, [subtotal, coupon?.freeShipping, shippingAddress.country, shippingAddress.countryCode, shippingAddress.state]);

  const effectiveShippingCost = calculateDynamicShipping();
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const effectiveTaxAmount = Number((taxableAmount * 0.18).toFixed(2));
  const effectiveGrandTotal = Number((taxableAmount + effectiveShippingCost + effectiveTaxAmount).toFixed(2));

  // Load user profile & saved addresses
  const loadUser = useCallback(async () => {
    try {
      setIsUserLoading(true);
      const res = await fetch("/api/customer/profile");
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const user = json.data.user || json.data;
        const addresses: SavedAddressItem[] = json.data.addresses || [];
        setCurrentUser(user);
        setSavedAddresses(addresses);

        if (user) {
          setContactName(user.name || "");
          setContactEmail(user.email || "");
          setContactPhone(user.mobileNumber || user.phone || "");
          setCardHolder(user.name || "");
        }

        // Pick default shipping address
        const defShipping =
          addresses.find((a) => a.type === "shipping" && a.isDefault) ||
          addresses.find((a) => a.type === "shipping") ||
          addresses[0];

        if (defShipping) {
          setSelectedSavedShippingId(defShipping.id);
          setShippingAddress({
            name: defShipping.name,
            company: defShipping.company,
            country: defShipping.country,
            countryCode: defShipping.countryCode,
            state: defShipping.state,
            city: defShipping.city,
            postalCode: defShipping.postalCode,
            streetAddress: defShipping.streetAddress,
            apartment: defShipping.apartment,
            phone: defShipping.phone,
            type: "shipping",
            isDefault: defShipping.isDefault,
          });
        }

        // Pick default billing address
        const defBilling =
          addresses.find((a) => a.type === "billing" && a.isDefault) ||
          addresses.find((a) => a.type === "billing") ||
          addresses[0];

        if (defBilling) {
          setSelectedSavedBillingId(defBilling.id);
          setBillingAddress({
            name: defBilling.name,
            company: defBilling.company,
            country: defBilling.country,
            countryCode: defBilling.countryCode,
            state: defBilling.state,
            city: defBilling.city,
            postalCode: defBilling.postalCode,
            streetAddress: defBilling.streetAddress,
            apartment: defBilling.apartment,
            phone: defBilling.phone,
            type: "billing",
            isDefault: defBilling.isDefault,
          });
        }
      }
    } catch {
      // Guest user, ok
    } finally {
      setIsUserLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Load Gateways (Filtered by active only)
  useEffect(() => {
    let isMounted = true;
    async function loadGateways() {
      try {
        setGatewayLoading(true);
        const res = await fetch("/api/gateways?activeOnly=true");
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setGateways(json.data);
          // Prefer default gateway or Razorpay/Paytm
          const defaultGw =
            json.data.find((g: PaymentGateway) => g.isDefault) ||
            json.data.find((g: PaymentGateway) => g.code === "razorpay") ||
            json.data[0];
          if (defaultGw) {
            setSelectedGatewayCode(defaultGw.code);
          }
        }
      } catch (err) {
        console.error("Failed to load gateways", err);
      } finally {
        if (isMounted) setGatewayLoading(false);
      }
    }
    loadGateways();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Saved Address Selection
  const handleSelectSavedShipping = (addrId: string) => {
    setSelectedSavedShippingId(addrId);
    const found = savedAddresses.find((a) => a.id === addrId);
    if (found) {
      setShippingAddress({
        name: found.name,
        company: found.company,
        country: found.country,
        countryCode: found.countryCode || "IN",
        state: found.state,
        city: found.city,
        postalCode: found.postalCode,
        streetAddress: found.streetAddress,
        apartment: found.apartment,
        phone: found.phone,
        type: "shipping",
        isDefault: found.isDefault,
      });
    }
  };

  const handleSelectSavedBilling = (addrId: string) => {
    setSelectedSavedBillingId(addrId);
    const found = savedAddresses.find((a) => a.id === addrId);
    if (found) {
      setBillingAddress({
        name: found.name,
        company: found.company,
        country: found.country,
        countryCode: found.countryCode || "IN",
        state: found.state,
        city: found.city,
        postalCode: found.postalCode,
        streetAddress: found.streetAddress,
        apartment: found.apartment,
        phone: found.phone,
        type: "billing",
        isDefault: found.isDefault,
      });
    }
  };

  // Open Edit Address Modal
  const handleOpenEditAddress = (addr: SavedAddressItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddressData(addr);
    setAddressModalMode("edit");
    setAddressModalTargetType(addr.type);
    setIsAddressModalOpen(true);
  };

  // Open Add Address Modal
  const handleOpenAddAddress = (targetType: "shipping" | "billing") => {
    setEditingAddressData(null);
    setAddressModalMode("add");
    setAddressModalTargetType(targetType);
    setIsAddressModalOpen(true);
  };

  // Handle Delete Address
  const handleDeleteAddress = async (addrId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this saved address?")) return;

    try {
      const res = await fetch(`/api/addresses/${addrId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error || "Failed to delete address.");
        return;
      }
      setSuccessNotice("Address removed successfully.");
      setTimeout(() => setSuccessNotice(null), 3000);
      await loadUser();
    } catch {
      alert("Error deleting address.");
    }
  };

  // Handle Address Saved from Modal (Added or Edited)
  const handleAddressSavedFromModal = (savedAddr: AddressData) => {
    setSuccessNotice(
      addressModalMode === "edit"
        ? "Address updated successfully."
        : "New address added and selected."
    );
    setTimeout(() => setSuccessNotice(null), 3000);

    // Refresh address list
    loadUser();

    // Select the updated / newly added address immediately
    if (savedAddr.type === "shipping") {
      if (savedAddr.id) setSelectedSavedShippingId(savedAddr.id);
      setShippingAddress({
        name: savedAddr.name,
        company: savedAddr.company,
        country: savedAddr.country,
        countryCode: savedAddr.countryCode,
        state: savedAddr.state,
        city: savedAddr.city,
        postalCode: savedAddr.postalCode,
        streetAddress: savedAddr.streetAddress,
        apartment: savedAddr.apartment,
        phone: savedAddr.phone,
        type: "shipping",
        isDefault: savedAddr.isDefault,
      });
    } else {
      if (savedAddr.id) setSelectedSavedBillingId(savedAddr.id);
      setBillingAddress({
        name: savedAddr.name,
        company: savedAddr.company,
        country: savedAddr.country,
        countryCode: savedAddr.countryCode,
        state: savedAddr.state,
        city: savedAddr.city,
        postalCode: savedAddr.postalCode,
        streetAddress: savedAddr.streetAddress,
        apartment: savedAddr.apartment,
        phone: savedAddr.phone,
        type: "billing",
        isDefault: savedAddr.isDefault,
      });
    }
  };

  // Notify backend of user cancellation or failed payment
  const handlePaymentCancelled = async (orderNumber: string, gatewayName: string) => {
    try {
      await fetch("/api/payments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          gateway: gatewayName,
          reason: "Payment window was closed before completion.",
        }),
      });
    } catch {
      // Ignored
    }
    setSubmitError(`Payment was cancelled. Your cart items are preserved so you can retry.`);
    setIsSubmitting(false);
  };

  // Unified Checkout Order Submission
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Cart validation
    if (items.length === 0) {
      setSubmitError("Your shopping cart is empty.");
      return;
    }

    const nameToUse = contactName.trim() || shippingAddress.name.trim();
    if (!nameToUse) {
      setSubmitError("Please provide your full recipient name.");
      return;
    }

    if (!contactEmail.trim() || !contactEmail.includes("@")) {
      setSubmitError("Please provide a valid email address for order notifications.");
      return;
    }

    if (!shippingAddress.streetAddress.trim()) {
      setSubmitError("Please provide a complete street address for delivery.");
      return;
    }

    if (!shippingAddress.city.trim() || !shippingAddress.state.trim()) {
      setSubmitError("Please provide city and state for delivery.");
      return;
    }

    if (!shippingAddress.postalCode.trim()) {
      setSubmitError("Please provide PIN / postal code.");
      return;
    }

    const selectedGateway = gateways.find((g) => g.code === selectedGatewayCode);
    if (!selectedGateway) {
      setSubmitError("Please select a payment gateway.");
      return;
    }

    const effectiveBilling = sameAsShipping ? shippingAddress : billingAddress;

    const formattedShippingString = [
      shippingAddress.streetAddress,
      shippingAddress.apartment,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.postalCode,
      shippingAddress.country,
    ]
      .filter(Boolean)
      .join(", ");

    const formattedBillingString = sameAsShipping
      ? formattedShippingString
      : [
          effectiveBilling.streetAddress,
          effectiveBilling.apartment,
          effectiveBilling.city,
          effectiveBilling.state,
          effectiveBilling.postalCode,
          effectiveBilling.country,
        ]
          .filter(Boolean)
          .join(", ");

    const generatedOrderNumber = "tags" + Math.floor(1000 + Math.random() * 9000);

    const baseOrderPayload = {
      orderNumber: generatedOrderNumber,
      customerName: nameToUse,
      customerEmail: contactEmail.trim(),
      customerPhone: contactPhone.trim() || shippingAddress.phone || "",
      customerId: currentUser?.id || undefined,
      savedShippingId: selectedSavedShippingId || undefined,
      savedBillingId: !sameAsShipping ? selectedSavedBillingId || undefined : undefined,
      gateway: selectedGateway.name,
      gatewayCode: selectedGateway.code,
      paymentStatus: "Pending",
      orderStatus: "Processing",
      subtotal,
      shippingCost: effectiveShippingCost,
      taxAmount: effectiveTaxAmount,
      couponCode: coupon?.code || undefined,
      couponDiscount: discountAmount,
      totalPrice: effectiveGrandTotal,
      shippingAddress: formattedShippingString,
      billingAddress: formattedBillingString,
      shippingAddressDetail: {
        name: shippingAddress.name || nameToUse,
        company: shippingAddress.company || "",
        country: shippingAddress.country,
        countryCode: shippingAddress.countryCode,
        state: shippingAddress.state,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        streetAddress: shippingAddress.streetAddress,
        apartment: shippingAddress.apartment || "",
        phone: shippingAddress.phone || contactPhone,
        type: "shipping",
      },
      billingAddressDetail: {
        name: effectiveBilling.name || nameToUse,
        company: effectiveBilling.company || "",
        country: effectiveBilling.country,
        countryCode: effectiveBilling.countryCode,
        state: effectiveBilling.state,
        city: effectiveBilling.city,
        postalCode: effectiveBilling.postalCode,
        streetAddress: effectiveBilling.streetAddress,
        apartment: effectiveBilling.apartment || "",
        phone: effectiveBilling.phone || contactPhone,
        type: "billing",
      },
      items: items.map((it) => ({
        productId: it.productId,
        variantId: it.variantId || undefined,
        variantAttributes: it.variantAttributes || undefined,
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        imageUrl: it.image,
        itemNo: it.sku || "SKU-" + it.productId.slice(0, 6).toUpperCase(),
      })),
      createdBy: currentUser ? currentUser.name : "Guest Customer",
    };

    try {
      setIsSubmitting(true);

      // ================= 1. RAZORPAY INTEGRATION =================
      if (selectedGateway.code === "razorpay") {
        // Step A: Request Razorpay Order initialization from backend
        const orderRes = await fetch("/api/payments/razorpay/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(baseOrderPayload),
        });

        const orderJson = await orderRes.json();
        if (!orderRes.ok || !orderJson.success || !orderJson.data) {
          throw new Error(orderJson.error || "Failed to initialize Razorpay payment order.");
        }

        const rzpData = orderJson.data;

        // Step B: Ensure Razorpay Checkout SDK is loaded
        const isSdkLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!isSdkLoaded || typeof (window as any).Razorpay === "undefined") {
          throw new Error("Unable to load Razorpay Checkout SDK. Please check your internet connection.");
        }

        // Step C: Open Razorpay Payment Modal
        const options = {
          key: rzpData.keyId,
          amount: rzpData.amount, // in paise
          currency: rzpData.currency || "INR",
          name: "emox India",
          description: `Order #${rzpData.orderNumber}`,
          order_id: rzpData.orderId,
          prefill: {
            name: nameToUse,
            email: contactEmail.trim(),
            contact: contactPhone.trim() || shippingAddress.phone,
          },
          theme: {
            color: "#2563eb",
          },
          handler: async function (response: any) {
            try {
              setIsSubmitting(true);
              // Step D: Cryptographically verify payment on backend
              const verifyRes = await fetch("/api/payments/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderNumber: rzpData.orderNumber,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyJson = await verifyRes.json();
              if (verifyRes.ok && verifyJson.success) {
                clearCart();
                router.push(`/order-success/${rzpData.orderNumber}`);
              } else {
                setSubmitError(verifyJson.error || "Payment signature verification failed.");
                setIsSubmitting(false);
              }
            } catch (err: any) {
              setSubmitError(err.message || "Failed to verify Razorpay payment result.");
              setIsSubmitting(false);
            }
          },
          modal: {
            ondismiss: function () {
              handlePaymentCancelled(rzpData.orderNumber, "Razorpay");
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          const failReason =
            response.error?.description || response.error?.reason || "Payment transaction was declined.";
          setSubmitError(`Razorpay Payment Failed: ${failReason}`);
          setIsSubmitting(false);
        });

        rzp.open();
        return;
      }

      // ================= 2. PAYTM INTEGRATION =================
      if (selectedGateway.code === "paytm") {
        // Step A: Request Paytm transaction token from backend
        const ptmRes = await fetch("/api/payments/paytm/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(baseOrderPayload),
        });

        const ptmJson = await ptmRes.json();
        if (!ptmRes.ok || !ptmJson.success || !ptmJson.data) {
          throw new Error(ptmJson.error || "Failed to initiate Paytm payment session.");
        }

        const ptmData = ptmJson.data;

        // Step B: Open Paytm Sandbox Modal or CheckoutJS
        if (ptmData.mode === "sandbox_modal" || ptmData.isSandboxSimulated) {
          setPaytmModalData({
            orderNumber: ptmData.orderNumber,
            amount: ptmData.amount,
            txnToken: ptmData.txnToken,
            mid: ptmData.mid,
          });
          setIsPaytmModalOpen(true);
          setIsSubmitting(false);
          return;
        }

        // Live / Full CheckoutJS Integration
        const isSdkLoaded = await loadScript(
          `https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/${ptmData.mid}.js`
        );

        if (isSdkLoaded && typeof (window as any).Paytm !== "undefined") {
          const config = {
            root: "",
            flow: "DEFAULT",
            data: {
              orderId: ptmData.orderNumber,
              token: ptmData.txnToken,
              tokenType: "TXN_TOKEN",
              amount: ptmData.amount,
            },
            handler: {
              notifyMerchant: function (eventName: string, data: any) {
                if (eventName === "APP_CLOSED" || eventName === "DISMISS") {
                  handlePaymentCancelled(ptmData.orderNumber, "Paytm");
                }
              },
              transactionStatus: async function (paymentStatus: any) {
                const verifyRes = await fetch("/api/payments/paytm/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orderNumber: ptmData.orderNumber,
                    txnToken: ptmData.txnToken,
                    paytmTxnId: paymentStatus?.TXNID,
                    status: paymentStatus?.STATUS,
                    responseBody: paymentStatus,
                  }),
                });
                const verifyJson = await verifyRes.json();
                if (verifyJson.success) {
                  clearCart();
                  router.push(`/order-success/${ptmData.orderNumber}`);
                } else {
                  setSubmitError(verifyJson.error || "Paytm verification failed.");
                  setIsSubmitting(false);
                }
              },
            },
          };

          (window as any).Paytm.CheckoutJS.init(config)
            .then(() => {
              (window as any).Paytm.CheckoutJS.invoke();
            })
            .catch(() => {
              // Fallback to sandbox modal if checkoutjs invocation fails
              setPaytmModalData({
                orderNumber: ptmData.orderNumber,
                amount: ptmData.amount,
                txnToken: ptmData.txnToken,
                mid: ptmData.mid,
              });
              setIsPaytmModalOpen(true);
              setIsSubmitting(false);
            });
          return;
        } else {
          // Fallback to sandbox modal
          setPaytmModalData({
            orderNumber: ptmData.orderNumber,
            amount: ptmData.amount,
            txnToken: ptmData.txnToken,
            mid: ptmData.mid,
          });
          setIsPaytmModalOpen(true);
          setIsSubmitting(false);
          return;
        }
      }

      // ================= 3. OTHER GATEWAYS (COD / PayPal / Credit Card) =================
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...baseOrderPayload,
          paymentStatus: selectedGateway.code === "cod" ? "Pending" : "Paid",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit order. Please try again.");
      }

      const createdOrder = json.data;
      clearCart();
      router.push(`/order-success/${createdOrder.orderNumber || createdOrder.id}`);
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred while processing your order.");
      setIsSubmitting(false);
    }
  };

  // While cart is hydrating from localStorage
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <StoreHeader />
        <main className="flex-1 max-w-xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl border border-slate-200 p-10 shadow-xs flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-bold text-slate-800">Loading Checkout...</p>
            <p className="text-[11px] text-slate-400 mt-1">Retrieving cart items and addresses.</p>
          </div>
        </main>
        <StoreFooter />
      </div>
    );
  }

  // If cart is initialized and empty, show empty notice
  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <StoreHeader />
        <main className="flex-1 max-w-xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl border border-slate-200 p-10 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Checkout Unavailable</h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Your shopping cart is currently empty. Please add items to your cart before proceeding to checkout.
            </p>
            <Link
              href="/category"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <StoreHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Breadcrumb & SSL Trust Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <nav className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-blue-600 transition">
              Home
            </Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-blue-600 transition">
              Cart
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Secure Checkout</span>
          </nav>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>

        {/* Global Notifications */}
        {submitError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <div className="font-bold">Checkout Error</div>
              <div>{submitError}</div>
            </div>
          </div>
        )}

        {successNotice && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Cols: Customer info, Shipping Address, Billing Address, Payment Gateways */}
            <div className="lg:col-span-8 space-y-6">
              {/* Step 1: Customer Contact Info */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                      1
                    </div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Customer Contact Information
                    </h2>
                  </div>

                  {currentUser ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>{currentUser.name} (Logged In)</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">
                      Already have an account?{" "}
                      <Link href="/login?callbackUrl=/checkout" className="text-blue-600 font-bold hover:underline">
                        Sign In
                      </Link>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Gyanchandra Verma"
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. gyan@example.com"
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Address & Saved Address Selection */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                      2
                    </div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Shipping Address (Delivery Location)
                    </h2>
                  </div>

                  {currentUser && (
                    <button
                      type="button"
                      onClick={() => handleOpenAddAddress("shipping")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Address</span>
                    </button>
                  )}
                </div>

                {/* Display Saved Addresses in a Clear Selection Interface */}
                {savedAddresses.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase">
                        Select Delivery Address:
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {savedAddresses.length} saved address{savedAddresses.length > 1 ? "es" : ""} found
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedSavedShippingId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectSavedShipping(addr.id)}
                            className={`p-3.5 rounded-xl border text-left cursor-pointer transition relative flex flex-col justify-between ${
                              isSelected
                                ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/80 shadow-xs"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="selectedShippingAddress"
                                    checked={isSelected}
                                    onChange={() => handleSelectSavedShipping(addr.id)}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                                  />
                                  <span className="text-xs font-black text-slate-900 truncate">
                                    {addr.name}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {addr.isDefault && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                                      Default
                                    </span>
                                  )}
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                      addr.type === "shipping"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-purple-100 text-purple-700"
                                    }`}
                                  >
                                    {addr.type}
                                  </span>
                                </div>
                              </div>

                              <p className="text-[11px] text-slate-600 leading-snug pl-6">
                                {addr.streetAddress}
                                {addr.apartment ? `, ${addr.apartment}` : ""}, {addr.city},{" "}
                                {addr.state} <strong className="text-slate-800">{addr.postalCode}</strong>,{" "}
                                {addr.country}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1 pl-6">{addr.phone}</p>
                            </div>

                            {/* Edit & Delete Action Buttons */}
                            <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-end gap-3 text-xs">
                              <button
                                type="button"
                                onClick={(e) => handleOpenEditAddress(addr, e)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit Address</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteAddress(addr.id, e)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Guest or User without saved addresses */
                  <div className="pt-2">
                    <DynamicAddressForm
                      initialData={shippingAddress}
                      onChange={(data) => setShippingAddress(data)}
                      showTypeSelector={false}
                      showDefaultToggle={Boolean(currentUser)}
                    />
                  </div>
                )}
              </div>

              {/* Step 3: Billing Address */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                      3
                    </div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Billing Address
                    </h2>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span>My billing address is the same as my shipping address</span>
                </label>

                {!sameAsShipping && (
                  <div className="pt-2 space-y-4 animate-in fade-in">
                    {savedAddresses.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-bold text-slate-700 uppercase">
                            Select Billing Address:
                          </label>
                          <button
                            type="button"
                            onClick={() => handleOpenAddAddress("billing")}
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add New Billing Address</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {savedAddresses.map((addr) => {
                            const isSelected = selectedSavedBillingId === addr.id;
                            return (
                              <div
                                key={addr.id}
                                onClick={() => handleSelectSavedBilling(addr.id)}
                                className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                                  isSelected
                                    ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/80 shadow-xs"
                                    : "border-slate-200 bg-white hover:bg-slate-50"
                                }`}
                              >
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <input
                                      type="radio"
                                      name="selectedBillingAddress"
                                      checked={isSelected}
                                      onChange={() => handleSelectSavedBilling(addr.id)}
                                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                                    />
                                    <span className="text-xs font-black text-slate-900 truncate">
                                      {addr.name}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 leading-snug pl-6">
                                    {addr.streetAddress}, {addr.city}, {addr.state} {addr.postalCode}
                                  </p>
                                </div>

                                <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-end gap-2 text-xs">
                                  <button
                                    type="button"
                                    onClick={(e) => handleOpenEditAddress(addr, e)}
                                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <DynamicAddressForm
                        initialData={billingAddress}
                        onChange={(data) => setBillingAddress(data)}
                        showTypeSelector={false}
                        showDefaultToggle={Boolean(currentUser)}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Step 4: Payment Gateways (Enabled Gateways Only) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                      4
                    </div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Payment Gateway Selection
                    </h2>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Verified SSL Payment Rails
                  </span>
                </div>

                {gatewayLoading ? (
                  <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Loading payment options...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {gateways.map((gw) => {
                      const isSelected = selectedGatewayCode === gw.code;
                      return (
                        <div
                          key={gw.id}
                          onClick={() => setSelectedGatewayCode(gw.code)}
                          className={`p-4 rounded-xl border transition cursor-pointer ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600 shadow-xs"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="paymentGateway"
                                checked={isSelected}
                                onChange={() => setSelectedGatewayCode(gw.code)}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs sm:text-sm font-black text-slate-900">
                                    {gw.name}
                                  </span>
                                  {gw.isDefault && (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-700 uppercase">
                                      Default
                                    </span>
                                  )}
                                  {gw.environment === "sandbox" && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 uppercase">
                                      Test Mode
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">{gw.description}</p>
                              </div>
                            </div>

                            {/* Card Badges */}
                            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                              {(gw.cardTypes || []).slice(0, 4).map((ctype) => (
                                <span
                                  key={ctype}
                                  className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600"
                                >
                                  {ctype}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Dynamic Gateway helper info when selected */}
                          {isSelected && (
                            <div className="mt-4 pt-3 border-t border-slate-200/80 animate-in fade-in">
                              {gw.code === "razorpay" ? (
                                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                                    RZP
                                  </div>
                                  <div className="text-xs text-blue-900">
                                    <div className="font-bold">Instant Sandbox Payment via Razorpay</div>
                                    <div className="text-[11px] text-blue-700 mt-0.5 leading-snug">
                                      Clicking &apos;Place Order&apos; opens the official Razorpay test payment modal.
                                      You can test Cards, UPI, Netbanking, and Indian banking rails.
                                    </div>
                                  </div>
                                </div>
                              ) : gw.code === "paytm" ? (
                                <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200 flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                                    PTM
                                  </div>
                                  <div className="text-xs text-sky-900">
                                    <div className="font-bold">Paytm Staging / Sandbox Checkout</div>
                                    <div className="text-[11px] text-sky-700 mt-0.5 leading-snug">
                                      Clicking &apos;Place Order&apos; generates a secure transaction session and opens
                                      the Paytm payment interface to test Wallet (7777777777), UPI, and Cards.
                                    </div>
                                  </div>
                                </div>
                              ) : gw.code === "authorizenet" ||
                                gw.code === "braintree" ||
                                gw.code === "stripe" ? (
                                <div className="space-y-3">
                                  <div className="text-[11px] font-bold text-slate-600">
                                    Cardholder Details (Encrypted directly with {gw.name}):
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="sm:col-span-2">
                                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                                        Cardholder Name
                                      </label>
                                      <input
                                        type="text"
                                        value={cardHolder}
                                        onChange={(e) => setCardHolder(e.target.value)}
                                        placeholder="Name as it appears on card"
                                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                                        Card Number
                                      </label>
                                      <div className="relative">
                                        <input
                                          type="text"
                                          value={cardNumber}
                                          onChange={(e) => setCardNumber(e.target.value)}
                                          placeholder="4000 1234 5678 9010"
                                          className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold text-slate-800"
                                        />
                                        <CreditCard className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                                          Expires
                                        </label>
                                        <input
                                          type="text"
                                          value={cardExpiry}
                                          onChange={(e) => setCardExpiry(e.target.value)}
                                          placeholder="MM/YY"
                                          className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-center"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                                          CVV
                                        </label>
                                        <input
                                          type="text"
                                          value={cardCvv}
                                          onChange={(e) => setCardCvv(e.target.value)}
                                          placeholder="123"
                                          className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-center"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : gw.code === "paypal" ? (
                                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center gap-3">
                                  <Wallet className="w-5 h-5 text-blue-600 shrink-0" />
                                  <p className="text-[11px] text-slate-600">
                                    Clicking &apos;Place Order&apos; initiates PayPal Buyer Protection authorization for ₹{effectiveGrandTotal.toFixed(2)}.
                                  </p>
                                </div>
                              ) : (
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                                  <Banknote className="w-5 h-5 text-emerald-600 shrink-0" />
                                  <p className="text-[11px] text-slate-600">
                                    Payment will be collected in cash or contactless mobile POS upon delivery.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right 4 Cols: Order Summary & Placement CTA */}
            <div className="lg:col-span-4 space-y-6 sticky top-20">
              {/* Items in Order */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Order Summary ({totalCount})
                  </h3>
                  <Link href="/cart" className="text-[11px] font-bold text-blue-600 hover:underline">
                    Edit Cart
                  </Link>
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 space-y-2 pr-1">
                  {items.map((it) => {
                    const itKey = it.id || `${it.productId}_${it.variantId || "base"}`;
                    return (
                      <div key={itKey} className="pt-2 flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          <Image
                            src={it.image || "/placeholder-product.png"}
                            alt={it.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{it.name}</h4>
                          {it.variantAttributes && Object.keys(it.variantAttributes).length > 0 && (
                            <div className="text-[10px] text-purple-700 font-semibold truncate">
                              {Object.entries(it.variantAttributes)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(" • ")}
                            </div>
                          )}
                          <div className="text-[11px] text-slate-500">
                            Qty: {it.quantity} × ₹{it.price.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-xs font-black text-slate-900 font-mono">
                          ₹{(it.price * it.quantity).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon Code Input in Checkout */}
                <div className="pt-2 border-t border-slate-100">
                  {coupon ? (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{coupon.code} (-₹{discountAmount.toFixed(2)})</span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-[10px] text-rose-600 font-bold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="COUPON CODE"
                        value={checkoutCouponCode}
                        onChange={(e) => setCheckoutCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 uppercase font-mono text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                      />
                      <button
                        type="button"
                        disabled={couponLoading || !checkoutCouponCode.trim()}
                        onClick={async () => {
                          const res = await applyCoupon(checkoutCouponCode);
                          if (res.success) setCheckoutCouponCode("");
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition"
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-[10px] text-rose-600 mt-1 font-medium">{couponError}</p>
                  )}
                </div>

                {/* Pricing Summary (Dynamically Updates with Address changes) */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-bold font-mono text-slate-900">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700 font-semibold">
                      <span>Discount ({coupon?.code}):</span>
                      <span className="font-bold font-mono">-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600">
                    <div className="flex items-center gap-1">
                      <span>Shipping Delivery:</span>
                      {shippingAddress.state && (
                        <span className="text-[10px] text-slate-400">({shippingAddress.state})</span>
                      )}
                    </div>
                    <span className="font-bold font-mono">
                      {effectiveShippingCost === 0 ? (
                        <span className="text-emerald-600 font-black">FREE</span>
                      ) : (
                        `₹${effectiveShippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Estimated GST (18%):</span>
                    <span className="font-bold font-mono text-slate-900">
                      ₹{effectiveTaxAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-slate-900 block">Total Due:</span>
                      <span className="text-[10px] text-slate-400">All Indian taxes included</span>
                    </div>
                    <span className="text-xl font-black text-blue-600 font-mono">
                      ₹{effectiveGrandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Initializing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Place Order • ₹{effectiveGrandTotal.toFixed(2)}</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-slate-400 leading-tight">
                  By clicking &quot;Place Order&quot;, you agree to emox Terms of Service and Privacy Policy.
                </p>
              </div>

              {/* Security Trust Badges */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 text-[11px] text-slate-500 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Buyer Protection Guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Tracked courier delivery with SMS tracking</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Address Edit / Add Modal */}
      <AddressEditModal
        isOpen={isAddressModalOpen}
        mode={addressModalMode}
        initialData={editingAddressData}
        defaultType={addressModalTargetType}
        onSave={handleAddressSavedFromModal}
        onClose={() => setIsAddressModalOpen(false)}
      />

      {/* Paytm Sandbox Modal */}
      {isPaytmModalOpen && paytmModalData && (
        <PaytmSandboxModal
          isOpen={isPaytmModalOpen}
          orderNumber={paytmModalData.orderNumber}
          amount={paytmModalData.amount}
          txnToken={paytmModalData.txnToken}
          mid={paytmModalData.mid}
          onSuccess={(txnId) => {
            setIsPaytmModalOpen(false);
            clearCart();
            router.push(`/order-success/${paytmModalData.orderNumber}`);
          }}
          onFailure={(errorMessage) => {
            setIsPaytmModalOpen(false);
            handlePaymentCancelled(paytmModalData.orderNumber, "Paytm");
            setSubmitError(`Paytm payment failed: ${errorMessage}`);
          }}
          onCancel={() => {
            setIsPaytmModalOpen(false);
            handlePaymentCancelled(paytmModalData.orderNumber, "Paytm");
          }}
        />
      )}

      <StoreFooter />
    </div>
  );
}
