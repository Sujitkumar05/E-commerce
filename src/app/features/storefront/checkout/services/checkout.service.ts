import { Injectable, signal, computed, inject } from '@angular/core';
import { CartService, CartItem } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AdminOrderService } from '../../../admin/services/admin-order.service';
import { OrderItem } from '../../../admin/models/order.model';
import {
  CheckoutStep,
  DeliveryAddress,
  PaymentDetails,
  Coupon,
  PriceBreakdown,
  PlacedOrderReceipt
} from '../models/checkout.model';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly orderService = inject(AdminOrderService);

  private readonly STORAGE_ADDRESSES_KEY = 'yourstore_saved_addresses';
  private readonly STORAGE_RECEIPT_KEY = 'yourstore_last_placed_order';

  // Seed default addresses
  private readonly seedAddresses: DeliveryAddress[] = [
    {
      id: 'addr-01',
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
      alternatePhone: '+91 98111 22334',
      pincode: '110001',
      state: 'Delhi',
      city: 'New Delhi',
      locality: 'Connaught Place, Barakhamba Road',
      houseAddress: 'Flat 402, Royal Residency, Block C',
      landmark: 'Near Statesman House',
      type: 'Home',
      isDefault: true
    },
    {
      id: 'addr-02',
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
      pincode: '110020',
      state: 'Delhi',
      city: 'New Delhi',
      locality: 'Okhla Industrial Area Phase III',
      houseAddress: 'Suite 305, Tech Hub Towers, Plot 14',
      landmark: 'Opposite Metro Pillar 218',
      type: 'Office',
      isDefault: false
    }
  ];

  // Available coupons
  readonly availableCoupons: Coupon[] = [
    {
      code: 'SAVE10',
      discountPercent: 10,
      minOrderValue: 20,
      description: 'Get 10% instant discount on orders above $20'
    },
    {
      code: 'WELCOME50',
      discountAmount: 5.0,
      minOrderValue: 30,
      description: 'Flat $5.00 off on orders above $30'
    },
    {
      code: 'FREESHIP',
      discountAmount: 4.99,
      minOrderValue: 0,
      description: 'Free express doorstep delivery on your order'
    }
  ];

  // Reactive state signals
  readonly currentStep = signal<CheckoutStep>('address');
  readonly savedAddresses = signal<DeliveryAddress[]>(this.loadAddressesFromStorage());
  readonly selectedAddressId = signal<string>(this.initSelectedAddressId());
  readonly appliedCoupon = signal<Coupon | null>(null);
  readonly paymentDetails = signal<PaymentDetails>({
    method: 'upi',
    upiApp: 'gpay',
    upiId: '',
    saveCard: true,
    bankName: 'HDFC Bank',
    codVerified: false
  });
  readonly isProcessing = signal<boolean>(false);
  readonly processingStatus = signal<string>('Processing Your Payment...');
  readonly placedReceipt = signal<PlacedOrderReceipt | null>(this.loadReceiptFromStorage());

  // Computed properties
  readonly selectedAddress = computed(() => {
    const list = this.savedAddresses();
    const id = this.selectedAddressId();
    return list.find(a => a.id === id) || list[0] || null;
  });

  readonly priceBreakdown = computed<PriceBreakdown>(() => {
    const items = this.cartService.items();
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Savings from original price
    const savings = items.reduce((sum, item) => {
      if (item.originalPrice && item.originalPrice > item.price) {
        return sum + (item.originalPrice - item.price) * item.quantity;
      }
      return sum;
    }, 0);

    // Standard shipping: Free if subtotal > 50 or empty
    let shipping = subtotal > 50 || subtotal === 0 ? 0 : 4.99;

    // Coupon discount calculation
    const coupon = this.appliedCoupon();
    let couponDiscount = 0;
    if (coupon) {
      if (coupon.code === 'FREESHIP') {
        shipping = 0;
        couponDiscount = 4.99;
      } else if (coupon.discountPercent) {
        couponDiscount = +(subtotal * (coupon.discountPercent / 100)).toFixed(2);
      } else if (coupon.discountAmount) {
        couponDiscount = Math.min(subtotal, coupon.discountAmount);
      }
    }

    const tax = +(subtotal * 0.05).toFixed(2);
    const finalTotal = Math.max(0, +(subtotal - (coupon?.code === 'FREESHIP' ? 0 : couponDiscount) + shipping + tax).toFixed(2));

    return {
      subtotal: +subtotal.toFixed(2),
      savings: +savings.toFixed(2),
      shipping: +shipping.toFixed(2),
      couponDiscount: +couponDiscount.toFixed(2),
      tax,
      finalTotal
    };
  });

  // Step Navigation
  setStep(step: CheckoutStep): void {
    this.currentStep.set(step);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Address Management
  selectAddress(id: string): void {
    this.selectedAddressId.set(id);
  }

  saveAddress(data: Omit<DeliveryAddress, 'id'>, existingId?: string): DeliveryAddress {
    const currentList = this.savedAddresses();
    let updatedList: DeliveryAddress[];
    let saved: DeliveryAddress;

    if (existingId) {
      // Edit existing
      saved = { ...data, id: existingId };
      updatedList = currentList.map(item => {
        if (item.id === existingId) {
          return saved;
        }
        // If the updated address is set as default, remove default from others
        return data.isDefault ? { ...item, isDefault: false } : item;
      });
    } else {
      // Create new
      const newId = 'addr-' + Date.now().toString().slice(-6);
      saved = { ...data, id: newId };
      // If new address is default, clear others
      const preparedList = data.isDefault
        ? currentList.map(a => ({ ...a, isDefault: false }))
        : [...currentList];
      updatedList = [saved, ...preparedList];
    }

    this.savedAddresses.set(updatedList);
    this.saveAddressesToStorage(updatedList);
    this.selectedAddressId.set(saved.id);
    return saved;
  }

  deleteAddress(id: string): boolean {
    const currentList = this.savedAddresses();
    if (currentList.length <= 1) {
      return false; // Keep at least 1 address
    }

    const updatedList = currentList.filter(a => a.id !== id);
    this.savedAddresses.set(updatedList);
    this.saveAddressesToStorage(updatedList);

    if (this.selectedAddressId() === id) {
      this.selectedAddressId.set(updatedList[0].id);
    }
    return true;
  }

  // Coupon Management
  applyCoupon(inputCode: string): { success: boolean; message: string } {
    const cleanCode = (inputCode || '').trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a valid coupon code.' };
    }

    const coupon = this.availableCoupons.find(c => c.code === cleanCode);
    if (!coupon) {
      return { success: false, message: `Coupon "${cleanCode}" is invalid or expired. Try "SAVE10" or "WELCOME50".` };
    }

    const subtotal = this.priceBreakdown().subtotal;
    if (subtotal < coupon.minOrderValue) {
      return {
        success: false,
        message: `Coupon "${cleanCode}" requires a minimum order value of $${coupon.minOrderValue.toFixed(2)}. Add more items to apply!`
      };
    }

    this.appliedCoupon.set(coupon);
    return { success: true, message: `Awesome! Coupon "${coupon.code}" applied successfully.` };
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
  }

  // Payment Details Update
  updatePaymentDetails(details: Partial<PaymentDetails>): void {
    this.paymentDetails.set({
      ...this.paymentDetails(),
      ...details
    });
  }

  // Process Payment Execution
  async processPayment(): Promise<{ success: boolean; error?: string; orderId?: string }> {
    const address = this.selectedAddress();
    if (!address) {
      return { success: false, error: 'Please select a delivery address before proceeding.' };
    }

    const items = this.cartService.items();
    if (!items || items.length === 0) {
      return { success: false, error: 'Your cart is empty. Please add items to order.' };
    }

    if (this.isProcessing()) {
      return { success: false, error: 'Payment is already processing.' };
    }

    this.isProcessing.set(true);
    this.currentStep.set('processing');

    // Simulate realistic 3-stage secure banking gateway steps
    try {
      this.processingStatus.set('Connecting to secure banking gateway...');
      await this.delay(700);

      this.processingStatus.set('Authorizing payment and verifying credentials...');
      await this.delay(900);

      this.processingStatus.set('Reserving inventory and generating order confirmation...');
      await this.delay(700);

      // Create confirmed order record
      const receipt = this.finalizeOrder(address, items);

      this.isProcessing.set(false);
      this.currentStep.set('success');

      return { success: true, orderId: receipt.orderId };
    } catch (err) {
      this.isProcessing.set(false);
      this.setStep('payment');
      return { success: false, error: 'Payment gateway encountered a temporary error. Please try again.' };
    }
  }

  private finalizeOrder(address: DeliveryAddress, cartItems: CartItem[]): PlacedOrderReceipt {
    const breakdown = this.priceBreakdown();
    const user = this.authService.currentUser();
    const payment = this.paymentDetails();

    const orderId = `#ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const paymentId = `PAY-${payment.method.toUpperCase()}-${Date.now().toString().slice(-8)}`;

    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const orderDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const hours = now.getHours();
    const mins = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    const orderTime = `${h12.toString().padStart(2, '0')}:${mins} ${ampm}`;

    // Estimated delivery 4 days ahead
    const deliveryDateObj = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
    const estDayName = deliveryDateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const estDeliveryDate = `${estDayName}, ${deliveryDateObj.getDate()} ${months[deliveryDateObj.getMonth()]} ${deliveryDateObj.getFullYear()} (3-5 business days)`;

    let paymentMethodLabel = 'UPI';
    if (payment.method === 'upi') {
      const appName = payment.upiApp === 'gpay' ? 'Google Pay' : payment.upiApp === 'phonepe' ? 'PhonePe' : payment.upiApp === 'paytm' ? 'Paytm' : 'BHIM UPI';
      paymentMethodLabel = `UPI (${appName}${payment.upiId ? ' - ' + payment.upiId : ''})`;
    } else if (payment.method === 'card') {
      const last4 = payment.cardNumber ? payment.cardNumber.replace(/\s+/g, '').slice(-4) : '4242';
      paymentMethodLabel = `Credit / Debit Card (ending in ${last4})`;
    } else if (payment.method === 'netbanking') {
      paymentMethodLabel = `Net Banking (${payment.bankName || 'HDFC Bank'})`;
    } else if (payment.method === 'cod') {
      paymentMethodLabel = 'Cash on Delivery (COD)';
    }

    const fullShippingAddress = `${address.name}, ${address.houseAddress}, ${address.locality}, ${address.city}, ${address.state} - ${address.pincode} (Phone: ${address.phone})`;

    // Map cart items to Admin OrderItems
    const orderItems: OrderItem[] = cartItems.map((c, idx) => ({
      id: `oi-${idx + 1}-${Date.now()}`,
      name: c.name,
      sku: `SKU-${c.productId.padStart(4, '0')}`,
      image: c.image,
      category: 'Storefront Products',
      brand: c.brand || 'YourStore Authentic',
      price: c.price,
      quantity: c.quantity,
      inStock: 10 + c.quantity,
      warehouseLocation: 'Main Logistics Hub - Rack B2',
      variant: c.variant || 'Standard 1 Unit',
      verified: false
    }));

    // Persist into AdminOrderService
    this.orderService.createStorefrontOrder({
      id: orderId,
      customerName: address.name,
      customerEmail: user?.email || 'customer@yourstore.com',
      customerPhone: address.phone,
      shippingAddress: fullShippingAddress,
      billingAddress: fullShippingAddress,
      date: orderDate,
      time: orderTime,
      orderStatus: 'Confirmed',
      paymentStatus: payment.method === 'cod' ? 'COD' : 'Paid',
      subtotal: breakdown.subtotal,
      shippingCharge: breakdown.shipping,
      discount: breakdown.couponDiscount + breakdown.savings,
      totalAmount: breakdown.finalTotal,
      paymentMethod: paymentMethodLabel,
      items: orderItems
    });

    const receipt: PlacedOrderReceipt = {
      orderId,
      paymentId,
      orderDate,
      orderTime,
      estimatedDeliveryDate: estDeliveryDate,
      totalAmount: breakdown.finalTotal,
      subtotal: breakdown.subtotal,
      shipping: breakdown.shipping,
      savings: breakdown.savings,
      couponDiscount: breakdown.couponDiscount,
      tax: breakdown.tax,
      paymentMethod: paymentMethodLabel,
      address,
      items: [...cartItems],
      customerEmail: user?.email || 'customer@yourstore.com',
      customerPhone: address.phone
    };

    this.placedReceipt.set(receipt);
    this.saveReceiptToStorage(receipt);

    // Clear cart now that order is confirmed
    this.cartService.clearCart();
    this.removeCoupon();

    return receipt;
  }

  resetCheckout(): void {
    this.appliedCoupon.set(null);
    this.isProcessing.set(false);
    this.currentStep.set('address');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Storage Persistence Helpers
  private loadAddressesFromStorage(): DeliveryAddress[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return this.seedAddresses;
    }
    try {
      const data = localStorage.getItem(this.STORAGE_ADDRESSES_KEY);
      return data ? JSON.parse(data) : this.seedAddresses;
    } catch {
      return this.seedAddresses;
    }
  }

  private saveAddressesToStorage(list: DeliveryAddress[]): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem(this.STORAGE_ADDRESSES_KEY, JSON.stringify(list));
    } catch { /* storage restricted */ }
  }

  private initSelectedAddressId(): string {
    const list = this.loadAddressesFromStorage();
    const def = list.find(a => a.isDefault);
    return def ? def.id : (list[0]?.id || 'addr-01');
  }

  private loadReceiptFromStorage(): PlacedOrderReceipt | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      const data = localStorage.getItem(this.STORAGE_RECEIPT_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private saveReceiptToStorage(receipt: PlacedOrderReceipt): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem(this.STORAGE_RECEIPT_KEY, JSON.stringify(receipt));
    } catch { /* storage restricted */ }
  }
}

