import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminOrders } from './orders';
import { AdminOrderService } from '../../services/admin-order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

describe('AdminOrders Component', () => {
  let component: AdminOrders;
  let fixture: ComponentFixture<AdminOrders>;
  let orderService: AdminOrderService;
  let mockRouter: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockRouter = {
      navigate: () => Promise.resolve(true)
    };

    mockActivatedRoute = {
      queryParams: of({})
    };

    await TestBed.configureTestingModule({
      imports: [AdminOrders],
      providers: [
        AdminOrderService,
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOrders);
    component = fixture.componentInstance;
    orderService = TestBed.inject(AdminOrderService);
    fixture.detectChanges();
  });

  it('should create the component and load orders from AdminOrderService', () => {
    expect(component).toBeTruthy();
    expect(component.allOrders.length).toBeGreaterThan(0);
    expect(component.selectedOrder).toBeDefined();
    expect(component.metrics).toBeDefined();
  });

  describe('12-Tab Categorization & Filter Navigation', () => {
    it('should filter by Pending tab', () => {
      component.switchTab('pending');
      const list = component.filteredOrders;
      expect(list.every(o => o.orderStatus === 'Pending')).toBe(true);
      expect(list.length).toBe(component.metrics.pending);
    });

    it('should filter by Procurement Required tab', () => {
      component.switchTab('procurement');
      const list = component.filteredOrders;
      expect(list.every(o => o.procurementStatus === 'Required' || o.procurementStatus === 'PO_Created')).toBe(true);
      expect(list.some(o => o.id === '#ORD-1248')).toBe(true);
    });

    it('should filter by Return Requests tab', () => {
      component.switchTab('returns');
      const list = component.filteredOrders;
      expect(list.every(o => o.returnStatus !== 'None')).toBe(true);
      expect(list.some(o => o.id === '#ORD-1242-V')).toBe(true);
    });

    it('should filter by Refund Management tab', () => {
      component.switchTab('refunds');
      const list = component.filteredOrders;
      expect(list.every(o => o.refundStatus !== 'None')).toBe(true);
    });
  });

  describe('Search & Customer Link Pre-filtering', () => {
    it('should search orders by customer ID #C1001', () => {
      component.searchTerm = '#C1001';
      const list = component.filteredOrders;
      expect(list.length).toBeGreaterThan(0);
      expect(list.every(o => o.customerId === '#C1001')).toBe(true);
    });

    it('should search orders by SKU PST-001', () => {
      component.searchTerm = 'PST-001';
      const list = component.filteredOrders;
      expect(list.length).toBeGreaterThan(0);
      expect(list.some(o => o.id === '#ORD-1248')).toBe(true);
    });

    it('should filter specifically when customerFilterId is applied', () => {
      component.customerFilterId = '#C1003';
      const list = component.filteredOrders;
      expect(list.every(o => o.customerId === '#C1003')).toBe(true);

      component.clearCustomerFilter();
      expect(component.customerFilterId).toBeNull();
    });
  });

  describe('Order Lifecycle Action Execution', () => {
    it('should confirm a pending order and reserve inventory', () => {
      const pendingOrder = component.allOrders.find(o => o.orderStatus === 'Pending');
      expect(pendingOrder).toBeDefined();

      component.confirmOrder(pendingOrder);
      expect(pendingOrder?.orderStatus).toBe('Confirmed');
      expect(pendingOrder?.stockReserved).toBe(true);
    });

    it('should dispatch shipment for Ready to Ship order', () => {
      const readyOrder = component.allOrders.find(o => o.orderStatus === 'Ready to Ship');
      expect(readyOrder).toBeDefined();

      component.openShipmentModal(readyOrder!);
      expect(component.isShipmentModalOpen).toBe(true);
      expect(component.shipmentTrackingNumber).toBeDefined();

      component.submitShipment();
      expect(component.isShipmentModalOpen).toBe(false);
      expect(readyOrder?.orderStatus).toBe('Shipped');
      expect(readyOrder?.shipments.length).toBeGreaterThan(0);
    });

    it('should cancel eligible order and release stock reservation', () => {
      const confirmedOrder = component.allOrders.find(o => o.id === '#ORD-1236-W');
      expect(confirmedOrder?.stockReserved).toBe(true);

      // Spy on prompt to simulate user entering a reason
      const originalPrompt = window.prompt;
      window.prompt = () => 'Customer cancellation test';

      try {
        component.cancelOrder(confirmedOrder);
        expect(confirmedOrder?.orderStatus).toBe('Cancelled');
        expect(confirmedOrder?.stockReserved).toBe(false);
      } finally {
        window.prompt = originalPrompt;
      }
    });

    it('should create procurement PO for deficit item', () => {
      const deficitOrder = component.allOrders.find(o => o.id === '#ORD-1248');
      const deficitItem = deficitOrder?.items.find(i => i.quantity > i.inStock);
      expect(deficitItem).toBeDefined();

      component.selectedOrder = deficitOrder!;
      component.openProcurementModal(deficitItem!);
      expect(component.isProcureModalOpen).toBe(true);
      expect(component.procureQty).toBe(1);

      component.submitProcurementPO();
      expect(component.isProcureModalOpen).toBe(false);
      expect(deficitItem?.procurementStatus).toBe('PO_Created');
      expect(deficitItem?.procurementPoNumber).toMatch(/^PO-PROC-\d+/);
    });

    it('should approve return request on return order', () => {
      const returnOrder = component.allOrders.find(o => o.returnStatus === 'Return Requested');
      expect(returnOrder).toBeDefined();

      component.approveReturn(returnOrder);
      expect(returnOrder?.returnStatus).toBe('Return Approved');
    });
  });

  describe('Pagination & Selection', () => {
    it('should compute paginated orders and pagination text', () => {
      expect(component.paginatedOrders.length).toBeLessThanOrEqual(component.pageSize);
      expect(component.paginationRangeText).toContain('Showing');
    });

    it('should toggle select all orders', () => {
      component.selectAll = true;
      component.toggleSelectAll();
      expect(component.filteredOrders.every(o => o.selected)).toBe(true);

      component.selectAll = false;
      component.toggleSelectAll();
      expect(component.filteredOrders.every(o => !o.selected)).toBe(true);
    });
  });
});

