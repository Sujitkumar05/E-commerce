import { CartItem } from '../../../../core/services/cart.service';

export type CheckoutStep = 'cart' | 'address' | 'summary' | 'payment' | 'processing' | 'success';

export type AddressType = 'Home' | 'Office';

export interface DeliveryAddress {
  id: string;
  name: string;
  phone: string;
  alternatePhone?: string;
  pincode: string;
  state: string;
  city: string;
  locality: string;
  houseAddress: string;
  landmark?: string;
  type: AddressType;
  isDefault?: boolean;
}

export type PaymentMethodType = 'upi' | 'card' | 'netbanking' | 'cod';

export type UpiApp = 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'custom';

export interface PaymentDetails {
  method: PaymentMethodType;
  upiApp?: UpiApp;
  upiId?: string;
  cardNumber?: string;
  cardHolder?: string;
  cardExpiry?: string;
  cardCvv?: string;
  saveCard?: boolean;
  bankName?: string;
  codVerified?: boolean;
}

export interface Coupon {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minOrderValue: number;
  description: string;
}

export interface PriceBreakdown {
  subtotal: number;
  savings: number;
  shipping: number;
  couponDiscount: number;
  tax: number;
  finalTotal: number;
}

export interface PlacedOrderReceipt {
  orderId: string;
  paymentId: string;
  orderDate: string;
  orderTime: string;
  estimatedDeliveryDate: string;
  totalAmount: number;
  subtotal: number;
  shipping: number;
  savings: number;
  couponDiscount: number;
  tax: number;
  paymentMethod: string;
  address: DeliveryAddress;
  items: CartItem[];
  customerEmail: string;
  customerPhone: string;
}

