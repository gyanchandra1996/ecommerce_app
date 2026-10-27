"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  MapPin,
  Mail,
  User,
  ShieldCheck,
  ChevronLeft,
  X,
  Tag,
  DollarSign,
  Send,
  Building,
  Phone,
} from "lucide-react";

interface ProductOption {
  id: string;
  sku: string;
  name: string;
  price: number;
  comparePrice?: number;
  mainImage?: string;
  currentStock: number;
}

interface CustomerOption {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface GatewayOption {
  id: string;
  name: string;
  code: string;
  isDefault: boolean;
  isCreditCard: boolean;
}

interface AddressItem {
  id?: string;
  name: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  phone: string;
  isDefault?: boolean;
  status?: "Active" | "Inactive";
  type?: "billing" | "shipping";
}

interface OrderItemRow {
  productId?: string;
  itemNo: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export function AddOrderView() {
  const router = useRouter();

  // Reference data
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [gateways, setGateways] = useState<GatewayOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected customer
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Items in Order
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>("");
  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([
    {
      itemNo: "l2150",
      name: "laptop-l2150",
      price: 379.0,
      quantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100",
    },
  ]);

  // Addresses
  const [billingAddress, setBillingAddress] = useState<AddressItem | null>({
    name: "Gyanchandra",
    company: "Emox Retail India Pvt Ltd",
    addressLine1: "Bandra West, Hill Road, Suite 402",
    addressLine2: "Near Mehboob Studio",
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    postalCode: "400050",
    phone: "+91 98765 43210",
    status: "Active",
    isDefault: true,
  });

  const [shippingAddress, setShippingAddress] = useState<AddressItem | null>({
    name: "Gyanchandra",
    company: "Emox Retail India Pvt Ltd",
    addressLine1: "Bandra West, Hill Road, Suite 402",
    addressLine2: "Near Mehboob Studio",
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    postalCode: "400050",
    phone: "+91 98765 43210",
    status: "Active",
    isDefault: true,
  });

  // Modal State for Address (matching Screenshot 4 modal)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [modalAddressType, setModalAddressType] = useState<"billing" | "shipping">("billing");

  // 11 fields of Address Modal matching Screenshot 4
  const [addrName, setAddrName] = useState("");
  const [addrCompany, setAddrCompany] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrLine2, setAddrLine2] = useState("");
  const [addrCountry, setAddrCountry] = useState("India");
  const [addrState, setAddrState] = useState("Maharashtra");
  const [addrCity, setAddrCity] = useState("Mumbai");
  const [addrPostalCode, setAddrPostalCode] = useState("400050");
  const [addrPhone, setAddrPhone] = useState("+91 98765 43210");
  const [addrStatus, setAddrStatus] = useState<"Active" | "Inactive">("Active");
  const [addrIsDefault, setAddrIsDefault] = useState(true);

  // Payment & Status
  const [selectedGateway, setSelectedGateway] = useState<string>("Authorize.Net");
  const [selectedGatewayCode, setSelectedGatewayCode] = useState<string>("authorizenet");
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Pending">("Paid");
  const [orderStatus, setOrderStatus] = useState<"Pending" | "Processing" | "Shipped" | "Delivered">("Pending");

  // Right card Amount Details matching Screenshot 4
  const [adjPrice, setAdjPrice] = useState<number>(0);
  const [couponCode, setCouponCode] = useState<string>("");
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [handlingCharge, setHandlingCharge] = useState<number>(15.0);
  const [shippingCost, setShippingCost] = useState<number>(10.0);
  const [taxAmount, setTaxAmount] = useState<number>(6.0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [prodRes, custRes, gwRes] = await Promise.all([
          fetch("/api/products?limit=100"),
          fetch("/api/customers"),
          fetch("/api/gateways?activeOnly=true"),
        ]);

        const prodJson = await prodRes.json();
        const custJson = await custRes.json();
        const gwJson = await gwRes.json();

        if (prodJson.success) {
          const pList = Array.isArray(prodJson.data)
            ? prodJson.data
            : Array.isArray(prodJson.data?.items)
            ? prodJson.data.items
            : [];
          setProducts(pList);
        }
        if (custJson.success) {
          const cList = Array.isArray(custJson.data)
            ? custJson.data
            : Array.isArray(custJson.data?.items)
            ? custJson.data.items
            : [];
          setCustomers(cList);
          if (cList.length > 0) {
            const first = cList[0];
            setSelectedCustomerId(first.id);
            setCustomerName(first.name);
            setCustomerEmail(first.email);
            setCustomerPhone(first.phone || (first as any).mobileNumber || "");
          }
        }
        if (gwJson.success) {
          const gList = Array.isArray(gwJson.data)
            ? gwJson.data
            : Array.isArray(gwJson.data?.items)
            ? gwJson.data.items
            : [];
          if (gList.length > 0) {
            setGateways(gList);
            const defGw = gList.find((g: any) => g.isDefault) || gList[0];
            setSelectedGateway(defGw.name);
            setSelectedGatewayCode(defGw.code);
          }
        }
      } catch (err) {
        console.error("Error loading order creation data", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Update customer fields when dropdown changes
  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const found = customers.find((c) => c.id === customerId);
    if (found) {
      setCustomerName(found.name);
      setCustomerEmail(found.email);
      setCustomerPhone(found.phone || (found as any).mobileNumber || "");
      if ((found as any).billingAddressDetail) {
        setBillingAddress((found as any).billingAddressDetail);
      }
      if ((found as any).shippingAddressDetail) {
        setShippingAddress((found as any).shippingAddressDetail);
      }
    }
  };

  // Add Product to item table
  const handleAddProduct = () => {
    if (!selectedProductToAdd) return;
    const p = products.find((pr) => pr.id === selectedProductToAdd);
    if (!p) return;

    const existingIdx = orderItems.findIndex((it) => it.productId === p.id || it.itemNo === p.sku);
    if (existingIdx !== -1) {
      const updated = [...orderItems];
      updated[existingIdx].quantity += 1;
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: p.id,
          itemNo: p.sku || "PROD-" + (orderItems.length + 1),
          name: p.name,
          price: p.price,
          quantity: 1,
          imageUrl: p.mainImage,
        },
      ]);
    }
    setSelectedProductToAdd("");
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, idx) => idx !== index));
  };

  // Quantity change
  const handleQuantityChange = (index: number, qty: number) => {
    if (qty < 1) return;
    const updated = [...orderItems];
    updated[index].quantity = qty;
    setOrderItems(updated);
  };

  // Calculate totals matching Screenshot 4 ($379 Subtotal, $410 Total)
  const subTotal = orderItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const calculatedTotal = Math.max(
    0,
    Number((subTotal + adjPrice + handlingCharge + shippingCost + taxAmount - couponDiscount).toFixed(2))
  );

  // Apply Coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal: subTotal, shippingCost }),
      });
      const json = await res.json();
      if (json.valid) {
        setCouponDiscount(json.discountAmount || 0);
        setCouponApplied(true);
        setNotice(`Coupon ${couponCode.toUpperCase()} applied! Saved $${json.discountAmount}`);
        setTimeout(() => setNotice(null), 3500);
      } else {
        alert(json.error || "Invalid coupon code");
      }
    } catch {
      alert("Error validating coupon");
    }
  };

  // Open Modal for Add Address matching Screenshot 4
  const openAddressModal = (type: "billing" | "shipping") => {
    setModalAddressType(type);
    const existing = type === "billing" ? billingAddress : shippingAddress;
    if (existing) {
      setAddrName(existing.name || customerName || "");
      setAddrCompany(existing.company || "");
      setAddrLine1(existing.addressLine1 || "");
      setAddrLine2(existing.addressLine2 || "");
      setAddrCountry(existing.country || "India");
      setAddrState(existing.state || "Maharashtra");
      setAddrCity(existing.city || "Mumbai");
      setAddrPostalCode(existing.postalCode || "400050");
      setAddrPhone(existing.phone || customerPhone || "");
      setAddrStatus(existing.status || "Active");
      setAddrIsDefault(existing.isDefault ?? true);
    } else {
      setAddrName(customerName || "");
      setAddrCompany("");
      setAddrLine1("");
      setAddrLine2("");
      setAddrCountry("India");
      setAddrState("Maharashtra");
      setAddrCity("Mumbai");
      setAddrPostalCode("400050");
      setAddrPhone(customerPhone || "");
      setAddrStatus("Active");
      setAddrIsDefault(true);
    }
    setIsAddressModalOpen(true);
  };

  // Save Modal Address
  const handleSaveModalAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName.trim() || !addrLine1.trim() || !addrCity.trim() || !addrPostalCode.trim() || !addrPhone.trim()) {
      alert("Please fill in Name, Address 1, City, Postal Code, and Phone");
      return;
    }

    const newAddr: AddressItem = {
      name: addrName.trim(),
      company: addrCompany.trim(),
      addressLine1: addrLine1.trim(),
      addressLine2: addrLine2.trim(),
      country: addrCountry.trim(),
      state: addrState.trim(),
      city: addrCity.trim(),
      postalCode: addrPostalCode.trim(),
      phone: addrPhone.trim(),
      status: addrStatus,
      isDefault: addrIsDefault,
      type: modalAddressType,
    };

    if (modalAddressType === "billing") {
      setBillingAddress(newAddr);
    } else {
      setShippingAddress(newAddr);
    }

    // Persist to DB in background
    fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newAddr,
        customerEmail,
      }),
    }).catch(() => {});

    setIsAddressModalOpen(false);
  };

  // Submit Order Creation
  const handleCreateOrder = async (approve = false) => {
    if (!customerName.trim()) {
      alert("Please provide customer name");
      return;
    }
    if (orderItems.length === 0) {
      alert("Please add at least one product to the order");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const payload = {
        orderNumber: "tags" + Math.floor(1000 + Math.random() * 9000),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        orderDate: new Date().toISOString(),
        gateway: selectedGateway,
        gatewayCode: selectedGatewayCode,
        paymentStatus: approve ? "Paid" : paymentStatus,
        orderStatus: approve ? "Processing" : orderStatus,
        subtotal: subTotal,
        shippingCost,
        handlingCharge,
        adjustmentPrice: adjPrice,
        taxAmount,
        couponCode: couponApplied ? couponCode : undefined,
        couponDiscount: couponApplied ? couponDiscount : 0,
        totalPrice: calculatedTotal,
        billingAddress: billingAddress
          ? `${billingAddress.name}, ${billingAddress.addressLine1}, ${billingAddress.city}, ${billingAddress.country}`
          : "",
        shippingAddress: shippingAddress
          ? `${shippingAddress.name}, ${shippingAddress.addressLine1}, ${shippingAddress.city}, ${shippingAddress.country}`
          : "",
        billingAddressDetail: billingAddress || undefined,
        shippingAddressDetail: shippingAddress || undefined,
        items: orderItems,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setNotice(`Order #${json.data.orderNumber} created successfully! Total: $${calculatedTotal.toFixed(2)}`);
        setTimeout(() => {
          router.push("/admin/orders");
        }, 1500);
      } else {
        setErrorMsg(json.error || "Failed to create order");
      }
    } catch {
      setErrorMsg("Error submitting order request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb matching Screenshot 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
            <span>Add Order</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            <Link href="/admin/orders" className="text-indigo-600 font-medium hover:underline">
              Order
            </Link>{" "}
            / <span className="text-slate-400">Add Order</span>
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 bg-white shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
      </div>

      {notice && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main 2-Column Layout matching Screenshot 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 8 COLS (Customer, Products, Addresses, Gateway) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Customer Selection */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Customer Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Manual Customer Entry --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Gyanchandra"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. gyanwork1996@gmail.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Add Product & Items Table matching Screenshot 4 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-indigo-600" />
              <span>Order Items</span>
            </h2>

            {/* Product dropdown selector */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={selectedProductToAdd}
                onChange={(e) => setSelectedProductToAdd(e.target.value)}
                className="w-full sm:flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select Product to add...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ${p.price.toFixed(2)} (Stock: {p.currentStock})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddProduct}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Table matching Screenshot 4 (Item#, Name, Price, Quantity, Action) */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                    <th className="py-2.5 px-3">Item#</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3 w-28 text-center">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orderItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No products added yet. Select a product above.
                      </td>
                    </tr>
                  ) : (
                    orderItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-600">{item.itemNo}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{item.name}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">${item.price.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="inline-flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(idx, item.quantity - 1)}
                              className="px-2 py-0.5 text-slate-500 hover:bg-slate-100"
                            >
                              -
                            </button>
                            <span className="px-2.5 py-0.5 text-xs font-bold text-slate-800">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(idx, item.quantity + 1)}
                              className="px-2 py-0.5 text-slate-500 hover:bg-slate-100"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 3: Addresses matching Screenshot 4 (Billing & Shipping with + button) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Billing Address Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2 relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Billing Address</span>
                </h3>
                <button
                  type="button"
                  onClick={() => openAddressModal("billing")}
                  className="w-6 h-6 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs transition"
                  title="Add / Edit Billing Address"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {billingAddress ? (
                <div className="text-xs text-slate-600 space-y-0.5 leading-relaxed pt-1">
                  <p className="font-bold text-slate-800">{billingAddress.name}</p>
                  {billingAddress.company && <p className="text-slate-500">{billingAddress.company}</p>}
                  <p>{billingAddress.addressLine1}</p>
                  {billingAddress.addressLine2 && <p>{billingAddress.addressLine2}</p>}
                  <p>
                    {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}
                  </p>
                  <p className="font-medium text-slate-700">{billingAddress.country}</p>
                  <p className="text-slate-500">{billingAddress.phone}</p>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-slate-400">
                  No billing address set. Click <span className="font-bold text-indigo-600">+</span> to add.
                </div>
              )}
            </div>

            {/* Shipping Address Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2 relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Shipping Address</span>
                </h3>
                <button
                  type="button"
                  onClick={() => openAddressModal("shipping")}
                  className="w-6 h-6 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs transition"
                  title="Add / Edit Shipping Address"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {shippingAddress ? (
                <div className="text-xs text-slate-600 space-y-0.5 leading-relaxed pt-1">
                  <p className="font-bold text-slate-800">{shippingAddress.name}</p>
                  {shippingAddress.company && <p className="text-slate-500">{shippingAddress.company}</p>}
                  <p>{shippingAddress.addressLine1}</p>
                  {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                  <p>
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                  </p>
                  <p className="font-medium text-slate-700">{shippingAddress.country}</p>
                  <p className="text-slate-500">{shippingAddress.phone}</p>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-slate-400">
                  No shipping address set. Click <span className="font-bold text-emerald-600">+</span> to add.
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Payment Gateway & Order Statuses */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>Payment & Fulfillment</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Gateway</label>
                <select
                  value={selectedGateway}
                  onChange={(e) => {
                    const gwName = e.target.value;
                    setSelectedGateway(gwName);
                    const found = gateways.find((g) => g.name === gwName);
                    if (found) setSelectedGatewayCode(found.code);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {gateways.length > 0 ? (
                    gateways.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name} {g.isDefault ? "(Default)" : ""}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Authorize.Net">Authorize.Net</option>
                      <option value="PayPal Express">PayPal Express</option>
                      <option value="Razorpay">Razorpay</option>
                      <option value="Paytm Payments">Paytm Payments</option>
                      <option value="Stripe">Stripe</option>
                      <option value="Cash On Delivery (COD)">Cash On Delivery (COD)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Order Status</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 4 COLS (Amount Details matching Screenshot 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100">
              Amount Details
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              {/* Sub Total */}
              <div className="flex items-center justify-between text-slate-600">
                <span>Sub Total</span>
                <span className="font-bold text-slate-800">${subTotal.toFixed(2)}</span>
              </div>

              {/* Adj Price */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600">Adj Price</span>
                <div className="flex items-center gap-1 w-28">
                  <span className="text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={adjPrice}
                    onChange={(e) => setAdjPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-right border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              {/* Coupon */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Coupon</span>
                  {couponApplied && (
                    <span className="text-emerald-600 font-bold">-${couponDiscount.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded text-xs uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-900"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Handling Charge */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600">Handling Charge</span>
                <div className="flex items-center gap-1 w-28">
                  <span className="text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={handlingCharge}
                    onChange={(e) => setHandlingCharge(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-right border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              {/* Shipping */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600">Shipping</span>
                <div className="flex items-center gap-1 w-28">
                  <span className="text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-right border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              {/* Tax */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600">Tax</span>
                <div className="flex items-center gap-1 w-28">
                  <span className="text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-right border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              {/* Total Line matching Screenshot 4 ($410.00) */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-base font-extrabold text-slate-900">Total</span>
                <span className="text-xl font-black text-indigo-600">${calculatedTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons matching Screenshot 4 */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleCreateOrder(false)}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isSubmitting ? "Creating Order..." : "Create Order"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  alert(`Order confirmation email queued for ${customerEmail || "customer"}`);
                }}
                className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Send Email</span>
              </button>

              <button
                type="button"
                onClick={() => handleCreateOrder(true)}
                disabled={isSubmitting}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve for Payment</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADD BILLING / SHIPPING ADDRESS matching Screenshot 4 (All 11 fields) */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header matching Screenshot 4 */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>
                  {modalAddressType === "billing" ? "Add Billing Address" : "Add Shipping Address"}
                </span>
              </h2>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form with all 11 fields */}
            <form onSubmit={handleSaveModalAddress} className="flex-1 overflow-y-auto p-6 space-y-3.5 text-xs sm:text-sm">
              {/* 1. Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={addrName}
                  onChange={(e) => setAddrName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* 2. Company */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company</label>
                <input
                  type="text"
                  value={addrCompany}
                  onChange={(e) => setAddrCompany(e.target.value)}
                  placeholder="Company name (optional)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* 3. Address 1 */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address 1 *</label>
                <input
                  type="text"
                  required
                  value={addrLine1}
                  onChange={(e) => setAddrLine1(e.target.value)}
                  placeholder="Street address, building, suite"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* 4. Address 2 */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address 2</label>
                <input
                  type="text"
                  value={addrLine2}
                  onChange={(e) => setAddrLine2(e.target.value)}
                  placeholder="Apartment, landmark, unit (optional)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* 5. Country & 6. State */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    value={addrCountry}
                    onChange={(e) => setAddrCountry(e.target.value)}
                    placeholder="e.g. India"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 7. City & 8. Postal Code */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={addrPostalCode}
                    onChange={(e) => setAddrPostalCode(e.target.value)}
                    placeholder="e.g. 12345"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 9. Phone & 10. Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={addrStatus}
                    onChange={(e) => setAddrStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* 11. Make default address checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={addrIsDefault}
                    onChange={(e) => setAddrIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Make default address</span>
                </label>
              </div>

              {/* Modal Footer buttons matching Screenshot 4 (Cancel, Save) */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-sm"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
