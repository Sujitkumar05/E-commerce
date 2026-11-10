import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ProcurementService } from './procurement.service';
import { AdminOrderService } from './admin-order.service';

describe('ProcurementService', () => {
  let service: ProcurementService;
  let orderService: AdminOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminOrderService, ProcurementService]
    });
    orderService = TestBed.inject(AdminOrderService);
    service = TestBed.inject(ProcurementService);
    // Clear localStorage mock if present
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('hm_procurement_verification');
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Procurement Orders Listing (Task 1)', () => {
    it('should return orders that have procurementStatus Required or PO_Created and not completed/shipped', () => {
      const procurementOrders = service.getProcurementOrders();
      expect(procurementOrders.length).toBeGreaterThan(0);
      for (const order of procurementOrders) {
        expect(['Required', 'PO_Created']).toContain(order.procurementStatus);
        expect(['Ready to Ship', 'Shipped', 'Delivered', 'Cancelled']).not.toContain(order.orderStatus);
      }
    });

    it('should group procurement orders by customer', () => {
      const customerGroups = service.getCustomerWiseProcurement();
      expect(customerGroups.length).toBeGreaterThan(0);
      for (const group of customerGroups) {
        expect(group.customerName).toBeTruthy();
        expect(group.orders.length).toBeGreaterThan(0);
        expect(group.totalProductsCount).toBeGreaterThan(0);
      }
    });
  });

  describe('Product Verification Logic (Task 3 & Task 4)', () => {
    it('should initially report pending verification for unverified orders', () => {
      const order = service.getProcurementOrders()[0];
      const progress = service.getOrderVerificationProgress(order.id);
      expect(progress.totalCount).toBe(order.items.length);
      expect(progress.isFullyVerified).toBe(false);
    });

    it('should verify individual items and update verification progress', () => {
      const order = service.getProcurementOrders()[0];
      const firstItem = order.items[0];

      expect(service.isItemVerified(order.id, firstItem.id)).toBe(false);

      service.setItemVerification(order.id, firstItem.id, true);
      expect(service.isItemVerified(order.id, firstItem.id)).toBe(true);

      const progress = service.getOrderVerificationProgress(order.id);
      expect(progress.verifiedCount).toBeGreaterThanOrEqual(1);
    });

    it('should toggle item verification back to false if unchecked', () => {
      const order = service.getProcurementOrders()[0];
      const firstItem = order.items[0];

      service.setItemVerification(order.id, firstItem.id, true);
      expect(service.isItemVerified(order.id, firstItem.id)).toBe(true);

      service.setItemVerification(order.id, firstItem.id, false);
      expect(service.isItemVerified(order.id, firstItem.id)).toBe(false);
    });
  });

  describe('Procurement Confirmation (Task 5 & Task 6)', () => {
    it('should refuse confirmation if not all products are verified', () => {
      const order = service.getProcurementOrders()[0];
      // Ensure at least one item is unverified
      for (const item of order.items) {
        service.setItemVerification(order.id, item.id, false);
      }

      const res = service.confirmProcurement(order.id);
      expect(res.success).toBe(false);
      expect(res.message).toContain('All products must be individually verified first');
      expect(order.orderStatus).not.toBe('Ready to Ship');
    });

    it('should successfully confirm procurement when all products are verified and transition to Ready to Ship', () => {
      const order = service.getProcurementOrders()[0];
      const orderId = order.id;

      // Manually verify every item in the order
      for (const item of order.items) {
        service.setItemVerification(orderId, item.id, true);
      }

      expect(service.isOrderFullyVerified(orderId)).toBe(true);

      const res = service.confirmProcurement(orderId, 'Admin Officer');
      expect(res.success).toBe(true);
      expect(res.message).toContain('Ready to Ship');

      // Verify order state
      const updatedOrder = orderService.getOrderById(orderId);
      expect(updatedOrder?.orderStatus).toBe('Ready to Ship');
      expect(updatedOrder?.procurementStatus).toBe('Completed');
      expect(updatedOrder?.stockReserved).toBe(true);

      // Verify order items state
      for (const item of updatedOrder!.items) {
        expect(item.verified).toBe(true);
        expect(item.procurementStatus).toBe('Received');
        expect(item.inStock).toBeGreaterThanOrEqual(item.quantity);
      }

      // Verify audit timeline entry
      const timelineTop = updatedOrder!.timeline[0];
      expect(timelineTop.title).toBe('Procurement Verified & Completed');
      expect(timelineTop.actor).toBe('Admin Officer');

      // Verify order is removed from pending procurement orders
      const remainingProcurement = service.getProcurementOrders();
      expect(remainingProcurement.some(o => o.id === orderId)).toBe(false);
    });
  });
});

