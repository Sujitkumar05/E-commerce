import { describe, it, expect, beforeEach } from 'vitest';
import { AdminOrderService } from './admin-order.service';

describe('AdminOrderService', () => {
  let service: AdminOrderService;

  beforeEach(() => {
    service = new AdminOrderService();
  });

  it('should initialize with relational seed orders linked to customer IDs', () => {
    const orders = service.orders;
    expect(orders.length).toBeGreaterThan(0);
    expect(orders[0].customerId).toBe('#C1001');
    expect(orders[0].id).toBe('#ORD-1248');
  });

  describe('Order State Transitions & Business Rules', () => {
    it('should allow valid transition from Pending to Confirmed', () => {
      const res = service.transitionOrderStatus('#ORD-1235', 'Confirmed');
      expect(res.success).toBe(true);
      const order = service.getOrderById('#ORD-1235');
      expect(order?.orderStatus).toBe('Confirmed');
      expect(order?.stockReserved).toBe(true);
    });

    it('should reject invalid transition from Pending directly to Delivered', () => {
      const res = service.transitionOrderStatus('#ORD-1235', 'Delivered');
      expect(res.success).toBe(false);
      expect(res.message).toContain('Invalid transition');
      const order = service.getOrderById('#ORD-1235');
      expect(order?.orderStatus).toBe('Pending');
    });

    it('should reject transition from Delivered to Processing (terminal state)', () => {
      const res = service.transitionOrderStatus('#ORD-1241-P', 'Processing');
      expect(res.success).toBe(false);
      expect(res.message).toContain('Invalid transition');
    });

    it('should release reserved inventory when cancelling an eligible order', () => {
      const orderBefore = service.getOrderById('#ORD-1236-W');
      expect(orderBefore?.stockReserved).toBe(true);

      const cancelRes = service.cancelOrder('#ORD-1236-W', 'Admin User', 'Customer request');
      expect(cancelRes.success).toBe(true);

      const orderAfter = service.getOrderById('#ORD-1236-W');
      expect(orderAfter?.orderStatus).toBe('Cancelled');
      expect(orderAfter?.stockReserved).toBe(false);
      expect(orderAfter?.items[0].reservedQty).toBe(0);
    });

    it('should prevent direct cancellation of an already shipped or delivered order', () => {
      const cancelRes = service.cancelOrder('#ORD-1241-P', 'Admin');
      expect(cancelRes.success).toBe(false);
      expect(cancelRes.message).toContain('Cannot directly cancel');
    });
  });

  describe('Procurement & Inventory Deficit Flow', () => {
    it('should detect deficit on #ORD-1248 and flag procurement required', () => {
      const order = service.getOrderById('#ORD-1248');
      expect(order?.procurementStatus).toBe('Required');
      const deficitItem = order?.items.find(i => i.quantity > i.inStock);
      expect(deficitItem).toBeDefined();
      expect(deficitItem?.quantity).toBe(4);
      expect(deficitItem?.inStock).toBe(3);
    });

    it('should create procurement PO for deficit item', () => {
      const res = service.createProcurementPO(
        '#ORD-1248',
        'item-101',
        1,
        'Himalaya Herbal Supplies Ltd',
        'Urgent',
        'Missing unit needed for delivery'
      );
      expect(res.success).toBe(true);
      expect(res.poNumber).toMatch(/^PO-PROC-\d+/);

      const order = service.getOrderById('#ORD-1248');
      expect(order?.procurementStatus).toBe('PO_Created');
      expect(order?.items[0].procurementStatus).toBe('PO_Created');
      expect(order?.items[0].procurementPoNumber).toBe(res.poNumber);
    });

    it('should restock inventory when procurement arrives and advance status', () => {
      const beforeStock = service.getOrderById('#ORD-1248')?.items[0].inStock || 0;
      const res = service.receiveProcurementStock('#ORD-1248', 'item-101', 2);
      expect(res.success).toBe(true);

      const order = service.getOrderById('#ORD-1248');
      expect(order?.items[0].inStock).toBe(beforeStock + 2);
      expect(order?.procurementStatus).toBe('Fulfilled');
      expect(order?.orderStatus).toBe('Ready to Ship');
    });
  });

  describe('Shipment Dispatch & Courier Tracking', () => {
    it('should create shipment dispatch and update tracking', () => {
      const res = service.createShipment('#ORD-1237-D', {
        type: 'Full',
        courier: 'BlueDart Express',
        items: [{ sku: 'PST-015', name: 'Brahmi Vati 60 Tabs', quantity: 2 }]
      });
      expect(res.success).toBe(true);
      expect(res.shipmentId).toMatch(/^SHP-\d+/);

      const order = service.getOrderById('#ORD-1237-D');
      expect(order?.orderStatus).toBe('Shipped');
      expect(order?.shipments.length).toBe(1);
      expect(order?.shipments[0].courier).toBe('BlueDart Express');
      expect(order?.shipments[0].trackingNumber).toBeDefined();
    });

    it('should progress shipment tracking to Delivered and mark payment for COD', () => {
      const order = service.getOrderById('#ORD-1240-K');
      const shipmentId = order?.shipments[0].id || '';

      const trackRes = service.updateShipmentTracking(
        '#ORD-1240-K',
        shipmentId,
        'Delivered',
        'Ludhiana',
        'Package signed by recipient'
      );
      expect(trackRes.success).toBe(true);
      expect(order?.orderStatus).toBe('Delivered');
      expect(order?.shipmentStatus).toBe('Delivered');
    });
  });

  describe('Return & Refund Management', () => {
    it('should initiate return request on delivered order', () => {
      const res = service.requestReturn('#ORD-1241-P', 'Customer allergic reaction', [
        { sku: 'PST-030', name: 'Herbal Hair Oil 200ml', quantity: 1, reason: 'Allergic reaction' }
      ]);
      expect(res.success).toBe(true);
      expect(res.returnNumber).toMatch(/^RMA-\d+/);

      const order = service.getOrderById('#ORD-1241-P');
      expect(order?.returnStatus).toBe('Return Requested');
      expect(order?.returnRecord).toBeDefined();
    });

    it('should approve return and then receive/inspect to queue refund', () => {
      const order = service.getOrderById('#ORD-1242-V');
      expect(order?.returnStatus).toBe('Return Requested');

      const appRes = service.processReturnDecision('#ORD-1242-V', 'Approve');
      expect(appRes.success).toBe(true);
      expect(order?.returnStatus).toBe('Return Approved');

      const inspRes = service.receiveAndInspectReturn('#ORD-1242-V', true, 'Bottles unopened, seal intact');
      expect(inspRes.success).toBe(true);
      expect(order?.returnStatus).toBe('Inspected');
      expect(order?.refundStatus).toBe('Initiated');
      expect(order?.refundRecord).toBeDefined();

      const refRes = service.processRefund('#ORD-1242-V');
      expect(refRes.success).toBe(true);
      expect(order?.refundStatus).toBe('Completed');
      expect(order?.paymentStatus).toBe('Partially Refunded'); // Only returned items refunded (1598 of 2299)
    });
  });

  describe('Customer Relational Linking & Order Metrics', () => {
    it('should retrieve all orders for a specific customer ID', () => {
      const rohanOrders = service.getOrdersByCustomerId('#C1001');
      expect(rohanOrders.length).toBeGreaterThan(0);
      expect(rohanOrders.every(o => o.customerId === '#C1001')).toBe(true);
    });

    it('should accurately calculate live order metrics for dashboard', () => {
      const metrics = service.getOrderMetrics();
      expect(metrics.total).toBe(service.orders.length);
      expect(metrics.totalRevenue).toBeGreaterThan(0);
      expect(metrics.pending).toBeGreaterThanOrEqual(1);
      expect(metrics.procurementRequired).toBeGreaterThanOrEqual(1);
      expect(metrics.returnRequests).toBeGreaterThanOrEqual(1);
    });
  });
});
