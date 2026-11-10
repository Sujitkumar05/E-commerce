import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CheckoutService } from './checkout.service';
import { CartService } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AdminOrderService } from '../../../admin/services/admin-order.service';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let cartService: CartService;
  let adminOrderService: AdminOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CheckoutService, CartService, AuthService, AdminOrderService]
    });
    service = TestBed.inject(CheckoutService);
    cartService = TestBed.inject(CartService);
    adminOrderService = TestBed.inject(AdminOrderService);

    // Reset cart
    cartService.clearCart();
    service.resetCheckout();
  });

  it('should be created and have initial defaults', () => {
    expect(service).toBeTruthy();
    expect(service.currentStep()).toBe('address');
    expect(service.savedAddresses().length).toBeGreaterThanOrEqual(1);
    expect(service.selectedAddress()).toBeTruthy();
  });

  describe('Address Management', () => {
    it('should select an address by ID', () => {
      const addresses = service.savedAddresses();
      if (addresses.length > 1) {
        service.selectAddress(addresses[1].id);
        expect(service.selectedAddressId()).toBe(addresses[1].id);
        expect(service.selectedAddress()?.id).toBe(addresses[1].id);
      }
    });

    it('should save a new delivery address', () => {
      const initialCount = service.savedAddresses().length;
      const created = service.saveAddress({
        name: 'Rahul Verma',
        phone: '+91 99887 76655',
        pincode: '400001',
        state: 'Maharashtra',
        city: 'Mumbai',
        locality: 'Colaba Causeway',
        houseAddress: 'Building 12, Flat 3B',
        type: 'Home',
        isDefault: false
      });

      expect(created.id).toBeTruthy();
      expect(service.savedAddresses().length).toBe(initialCount + 1);
      expect(service.selectedAddressId()).toBe(created.id);
    });

    it('should edit an existing delivery address', () => {
      const first = service.savedAddresses()[0];
      service.saveAddress({
        ...first,
        name: 'Priya S. Sharma'
      }, first.id);

      const updated = service.savedAddresses().find(a => a.id === first.id);
      expect(updated?.name).toBe('Priya S. Sharma');
    });

    it('should delete an address when more than one exists', () => {
      const initialAddresses = service.savedAddresses();
      if (initialAddresses.length > 1) {
        const idToDelete = initialAddresses[initialAddresses.length - 1].id;
        const result = service.deleteAddress(idToDelete);
        expect(result).toBe(true);
        expect(service.savedAddresses().some(a => a.id === idToDelete)).toBe(false);
      }
    });
  });

  describe('Coupon Application & Pricing', () => {
    beforeEach(() => {
      // Add a test item: price $40, qty 1
      cartService.addToCart({
        productId: '101',
        name: 'Ashwagandha Gold',
        brand: 'YourStore',
        price: 40,
        originalPrice: 50,
        image: 'img.jpg',
        variant: 'Standard 60 Caps'
      }, 1);
    });

    it('should calculate initial subtotal and pricing accurately', () => {
      const pricing = service.priceBreakdown();
      expect(pricing.subtotal).toBe(40);
      expect(pricing.savings).toBe(10);
      expect(pricing.tax).toBe(2); // 5% of 40
      expect(pricing.finalTotal).toBeGreaterThan(0);
    });

    it('should apply valid percentage coupon SAVE10', () => {
      const result = service.applyCoupon('SAVE10');
      expect(result.success).toBe(true);
      expect(service.appliedCoupon()?.code).toBe('SAVE10');

      const pricing = service.priceBreakdown();
      expect(pricing.couponDiscount).toBe(4); // 10% of 40
    });

    it('should reject invalid coupon code', () => {
      const result = service.applyCoupon('INVALID99');
      expect(result.success).toBe(false);
      expect(service.appliedCoupon()).toBeNull();
    });

    it('should remove applied coupon', () => {
      service.applyCoupon('SAVE10');
      expect(service.appliedCoupon()).not.toBeNull();
      service.removeCoupon();
      expect(service.appliedCoupon()).toBeNull();
    });
  });

  describe('Payment and Step Navigation', () => {
    it('should transition between steps', () => {
      service.setStep('summary');
      expect(service.currentStep()).toBe('summary');
      service.setStep('payment');
      expect(service.currentStep()).toBe('payment');
    });

    it('should update payment method details', () => {
      service.updatePaymentDetails({
        method: 'card',
        cardHolder: 'John Doe',
        cardNumber: '4111 2222 3333 4444'
      });
      expect(service.paymentDetails().method).toBe('card');
      expect(service.paymentDetails().cardHolder).toBe('John Doe');
    });

    it('should process payment and generate receipt for active cart', async () => {
      cartService.addToCart({
        productId: '202',
        name: 'Giloy Tablets',
        brand: 'YourStore',
        price: 25,
        image: 'giloy.jpg',
        variant: 'Standard Pack'
      }, 2);

      const res = await service.processPayment();
      expect(res.success).toBe(true);
      expect(res.orderId).toBeTruthy();
      expect(service.currentStep()).toBe('success');
      expect(service.placedReceipt()).toBeTruthy();
      expect(service.placedReceipt()?.orderId).toBe(res.orderId);
      // Cart should be emptied on success
      expect(cartService.items().length).toBe(0);
    });
  });
});

