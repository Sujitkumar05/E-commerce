import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  AdminOrder,
  OrderStatus,
  PaymentStatus,
  ProcurementStatus,
  ShipmentStatus,
  ReturnStatus,
  RefundStatus,
  OrderMetrics,
  VALID_ORDER_TRANSITIONS,
  canTransitionOrder,
  OrderItem,
  ReturnRequestRecord,
  RefundRecord,
  OrderTimelineEvent
} from '../models/order.model';
import { OrderShipment } from '../pages/customers/models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {
  readonly couriers = [
    { name: 'BlueDart Express', trackUrlPrefix: 'https://www.bluedart.com/tracking?track=' },
    { name: 'Delhivery Logistics', trackUrlPrefix: 'https://www.delhivery.com/track/package/' },
    { name: 'DTDC Air Express', trackUrlPrefix: 'https://www.dtdc.in/tracking.asp?strCnno=' },
    { name: 'FedEx Priority', trackUrlPrefix: 'https://www.fedex.com/fedextrack/?trknbr=' },
    { name: 'Shadowfax Quick', trackUrlPrefix: 'https://tracker.shadowfax.in/#/' }
  ];

  readonly suppliers = [
    'Himalaya Herbal Supplies Ltd',
    'Biotique Botanicals Distribution',
    'Dabur Direct Logistics',
    'Patanjali Wholesale Enterprise',
    'The Ordinary Global Imports',
    'Vaseline India Supply Corp'
  ];

  private ordersSubject = new BehaviorSubject<AdminOrder[]>(this.getSeedOrders());
  public orders$: Observable<AdminOrder[]> = this.ordersSubject.asObservable();

  private selectedOrderSubject = new BehaviorSubject<AdminOrder | null>(this.getSeedOrders()[0]);
  public selectedOrder$: Observable<AdminOrder | null> = this.selectedOrderSubject.asObservable();

  constructor() {}

  public get orders(): AdminOrder[] {
    return this.ordersSubject.value;
  }

  public get selectedOrder(): AdminOrder | null {
    return this.selectedOrderSubject.value;
  }

  public setSelectedOrder(order: AdminOrder | null): void {
    this.selectedOrderSubject.next(order);
  }

  public getOrderById(id: string): AdminOrder | undefined {
    if (!id) return undefined;
    const cleanId = decodeURIComponent(id).trim().toLowerCase();
    const withoutHash = cleanId.replace(/^#/, '');
    return this.orders.find(o => {
      const oId = o.id.toLowerCase();
      const oWithoutHash = oId.replace(/^#/, '');
      return oId === cleanId || oWithoutHash === withoutHash;
    });
  }

  public getOrdersByCustomerId(customerId: string): AdminOrder[] {
    return this.orders.filter(o => o.customerId === customerId);
  }

  /**
   * Transition order to a new lifecycle status with validation.
   */
  public transitionOrderStatus(
    orderId: string,
    targetStatus: OrderStatus,
    actor: string = 'Admin (Manual)',
    notes?: string
  ): { success: boolean; message: string } {
    const order = this.getOrderById(orderId);
    if (!order) {
      return { success: false, message: `Order ${orderId} not found.` };
    }

    if (!canTransitionOrder(order.orderStatus, targetStatus)) {
      return {
        success: false,
        message: `Invalid transition! Cannot move order ${orderId} from '${order.orderStatus}' to '${targetStatus}'. Permitted transitions are: [${(VALID_ORDER_TRANSITIONS[order.orderStatus] || []).join(', ') || 'None (Terminal state)'}].`
      };
    }

    // Handle business side-effects of transition
    if (targetStatus === 'Cancelled') {
      return this.cancelOrder(orderId, actor, notes || 'Cancelled by Administrator');
    }

    if (targetStatus === 'Confirmed') {
      return this.confirmOrder(orderId, actor);
    }

    if (targetStatus === 'Ready to Ship') {
      // Validate all picked or available
      const hasDeficit = order.items.some(i => i.quantity > i.inStock);
      if (hasDeficit) {
        return {
          success: false,
          message: `Cannot mark '${targetStatus}' because order ${orderId} still has unfulfilled inventory deficits. Please resolve procurement first.`
        };
      }
    }

    // Direct allowed update
    const previous = order.orderStatus;
    order.orderStatus = targetStatus;

    if (targetStatus === 'Shipped') {
      order.shipmentStatus = 'Shipped';
    } else if (targetStatus === 'In Transit') {
      order.shipmentStatus = 'In Transit';
    } else if (targetStatus === 'Delivered') {
      order.shipmentStatus = 'Delivered';
      if (order.paymentStatus === 'COD') {
        order.paymentStatus = 'Paid';
      }
    }

    this.addTimelineEvent(order, {
      title: `Order ${targetStatus}`,
      actor,
      completed: true,
      notes: notes || `Order status advanced from ${previous} to ${targetStatus}`
    });

    this.notifyUpdate();
    return { success: true, message: `Order ${orderId} successfully updated to '${targetStatus}'.` };
  }

  /**
   * Confirm order with inventory reservation and procurement check
   */
  public confirmOrder(orderId: string, actor: string = 'Admin (System)'): { success: boolean; message: string } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    if (order.orderStatus !== 'Pending' && order.orderStatus !== 'Confirmed') {
      return { success: false, message: `Cannot confirm order in status '${order.orderStatus}'.` };
    }

    // Check inventory
    let hasShortage = false;
    let shortageDetails: string[] = [];

    order.items.forEach(item => {
      if (item.quantity > item.inStock) {
        hasShortage = true;
        const deficit = item.quantity - item.inStock;
        shortageDetails.push(`${item.name} (Deficit: ${deficit} units)`);
        item.procurementStatus = 'Requested';
      } else {
        // Reserve safely
        item.reservedQty = item.quantity;
      }
    });

    order.orderStatus = 'Confirmed';
    order.stockReserved = true;

    if (hasShortage) {
      order.procurementStatus = 'Required';
      order.procurementNotes = `Inventory deficit detected: ${shortageDetails.join(', ')}`;
      this.addTimelineEvent(order, {
        title: 'Order Confirmed - Procurement Required',
        actor,
        completed: true,
        notes: `Confirmed with stock deficit: ${shortageDetails.join(', ')}. Flagged for Procurement.`
      });
      this.notifyUpdate();
      return {
        success: true,
        message: `Order ${orderId} confirmed. Note: Shortage detected on ${shortageDetails.length} item(s); automatically flagged for procurement.`
      };
    } else {
      order.procurementStatus = 'None';
      this.addTimelineEvent(order, {
        title: 'Order Confirmed & Stock Reserved',
        actor,
        completed: true,
        notes: `Inventory verified. ${order.items.length} item(s) safely reserved in warehouse.`
      });
      this.notifyUpdate();
      return {
        success: true,
        message: `Order ${orderId} confirmed successfully with full stock reservation.`
      };
    }
  }

  /**
   * Cancel order and release reserved stock
   */
  public cancelOrder(orderId: string, actor: string = 'Admin', reason: string = 'Administrative Cancellation'): { success: boolean; message: string } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    if (order.orderStatus === 'Shipped' || order.orderStatus === 'In Transit' || order.orderStatus === 'Delivered') {
      return {
        success: false,
        message: `Cannot directly cancel an order that is already '${order.orderStatus}'. For dispatched orders, please use the Return or Interception workflow.`
      };
    }

    if (order.orderStatus === 'Cancelled') {
      return { success: false, message: `Order ${orderId} is already cancelled.` };
    }

    // Release stock safely
    if (order.stockReserved) {
      order.items.forEach(item => {
        item.reservedQty = 0;
      });
      order.stockReserved = false;
    }

    order.orderStatus = 'Cancelled';
    order.procurementStatus = 'None';

    // Initiate refund if order was already paid
    if (order.paymentStatus === 'Paid') {
      order.refundStatus = 'Initiated';
      order.refundRecord = {
        id: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        refundNumber: `TXN-REF-${Date.now().toString().slice(-6)}`,
        orderId: order.id,
        customerId: order.customerId,
        amount: order.totalAmount,
        status: 'Initiated',
        reason: `Auto-initiated upon order cancellation: ${reason}`,
        paymentMethod: order.paymentMethod,
        transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        initiatedAt: this.getNowFormatted()
      };
    }

    this.addTimelineEvent(order, {
      title: 'Order Cancelled',
      actor,
      completed: true,
      notes: `Order cancelled (${reason}). Reserved inventory released safely back to warehouse pool.`
    });

    this.notifyUpdate();
    return {
      success: true,
      message: `Order ${orderId} has been cancelled. Reserved stock released back to inventory.`
    };
  }

  /**
   * Toggle warehouse picking status for an item
   */
  public toggleItemPicked(orderId: string, itemId: string): { success: boolean; allPicked: boolean } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, allPicked: false };

    const item = order.items.find(i => i.id === itemId);
    if (item) {
      item.picked = !item.picked;
    }

    const allPicked = order.items.every(i => i.picked);
    this.notifyUpdate();
    return { success: true, allPicked };
  }

  /**
   * Create Procurement Purchase Order for deficit item
   */
  public createProcurementPO(
    orderId: string,
    itemId: string,
    requestedQty: number,
    supplier: string,
    priority: 'Normal' | 'High' | 'Urgent' = 'Urgent',
    notes: string = ''
  ): { success: boolean; poNumber: string; message: string } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, poNumber: '', message: 'Order not found.' };

    const item = order.items.find(i => i.id === itemId);
    if (!item) return { success: false, poNumber: '', message: 'Item not found in order.' };

    const poNumber = `PO-PROC-${Math.floor(1000 + Math.random() * 9000)}`;
    item.procurementStatus = 'PO_Created';
    item.procurementPoNumber = poNumber;

    order.procurementStatus = 'PO_Created';

    this.addTimelineEvent(order, {
      title: `Procurement PO Generated: ${poNumber}`,
      actor: 'Admin (Procurement)',
      completed: true,
      notes: `Created purchase order for ${requestedQty} units of '${item.name}' with supplier '${supplier}' [Priority: ${priority}]. ${notes}`
    });

    this.notifyUpdate();
    return {
      success: true,
      poNumber,
      message: `Procurement Purchase Order ${poNumber} generated successfully!`
    };
  }

  /**
   * Receive goods for procurement PO and update inventory
   */
  public receiveProcurementStock(
    orderId: string,
    itemId: string,
    receivedQty: number
  ): { success: boolean; message: string } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    const item = order.items.find(i => i.id === itemId);
    if (!item) return { success: false, message: 'Item not found.' };

    item.inStock += receivedQty;
    item.procurementStatus = 'Received';

    // Check if whole order is now fulfilled
    const hasRemainingDeficit = order.items.some(i => i.quantity > i.inStock);
    if (!hasRemainingDeficit) {
      order.procurementStatus = 'Fulfilled';
      order.procurementNotes = 'All inventory deficits fulfilled. Order ready for packaging.';
      if (order.orderStatus === 'Processing') {
        order.orderStatus = 'Ready to Ship';
      }
    } else {
      order.procurementStatus = 'Partially Received';
    }

    this.addTimelineEvent(order, {
      title: `Procurement Stock Received (${receivedQty} units)`,
      actor: 'Warehouse Supervisor',
      completed: true,
      notes: `Restocked ${receivedQty} units of '${item.name}' (SKU: ${item.sku}). Total stock is now ${item.inStock}.`
    });

    this.notifyUpdate();
    return {
      success: true,
      message: `Restocked ${receivedQty} units of '${item.name}'. Current warehouse stock: ${item.inStock}.`
    };
  }

  /**
   * Create shipment and dispatch order (Partial or Full)
   */
  public createShipment(
    orderId: string,
    shipmentData: {
      type: 'Full' | 'Partial';
      courier: string;
      trackingNumber?: string;
      items: { sku: string; name: string; quantity: number }[];
      notes?: string;
    }
  ): { success: boolean; shipmentId: string; message: string } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, shipmentId: '', message: 'Order not found.' };

    if (order.orderStatus === 'Cancelled' || order.orderStatus === 'Delivered') {
      return { success: false, shipmentId: '', message: `Cannot ship order in status '${order.orderStatus}'.` };
    }

    const courierObj = this.couriers.find(c => c.name === shipmentData.courier) || this.couriers[0];
    const trackingNumber =
      shipmentData.trackingNumber?.trim() ||
      `${courierObj.name.slice(0, 2).toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}IN`;

    const shipmentId = `SHP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newShipment: OrderShipment = {
      id: shipmentId,
      type: shipmentData.type,
      courier: courierObj.name,
      trackingNumber,
      dispatchedAt: this.getNowFormatted(),
      status: 'Dispatched',
      items: shipmentData.items,
      notificationSent: true,
      notificationChannel: 'SMS & Email',
      notificationPreview: `Your order ${order.id} has been dispatched via ${courierObj.name}. AWB: ${trackingNumber}. Track at ${courierObj.trackUrlPrefix}${trackingNumber}`
    };

    if (!order.shipments) {
      order.shipments = [];
    }
    order.shipments.push(newShipment);

    // Update item dispatchedQty
    shipmentData.items.forEach(shippedItem => {
      const match = order.items.find(i => i.sku === shippedItem.sku);
      if (match) {
        match.dispatchedQty = (match.dispatchedQty || 0) + shippedItem.quantity;
      }
    });

    const isFullyDispatched = order.items.every(i => (i.dispatchedQty || 0) >= i.quantity);

    if (isFullyDispatched) {
      order.orderStatus = 'Shipped';
      order.shipmentStatus = 'Shipped';
    } else {
      order.orderStatus = 'Processing';
      order.shipmentStatus = 'Partially Shipped';
    }

    this.addTimelineEvent(order, {
      title: `${shipmentData.type} Dispatch Created: ${newShipment.courier}`,
      actor: 'Logistics Manager',
      completed: true,
      notes: `Consignment AWB: ${trackingNumber}. ${shipmentData.items.length} product(s) in package. Carrier tracking generated.`
    });

    this.notifyUpdate();
    return {
      success: true,
      shipmentId,
      message: `Shipment ${shipmentId} dispatched successfully via ${courierObj.name}! AWB: ${trackingNumber}`
    };
  }

  /**
   * Log an in-transit tracking update or delivery confirmation
   */
  public updateShipmentTracking(
    orderId: string,
    shipmentId: string,
    status: 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Exception',
    location?: string,
    notes?: string
  ): { success: boolean; message: string } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    const shipment = order.shipments?.find(s => s.id === shipmentId);
    if (!shipment) return { success: false, message: 'Shipment not found.' };

    shipment.status = status === 'Exception' ? 'In Transit' : status;

    if (status === 'In Transit' || status === 'Out for Delivery') {
      order.orderStatus = 'In Transit';
      order.shipmentStatus = 'In Transit';
      this.addTimelineEvent(order, {
        title: `Package ${status}: ${shipment.courier}`,
        actor: 'Courier Sync Service',
        completed: true,
        notes: location ? `Location: ${location}. ${notes || ''}` : notes
      });
    } else if (status === 'Delivered') {
      order.orderStatus = 'Delivered';
      order.shipmentStatus = 'Delivered';
      if (order.paymentStatus === 'COD') {
        order.paymentStatus = 'Paid';
      }
      this.addTimelineEvent(order, {
        title: `Order Delivered Successfully`,
        actor: `${shipment.courier} Delivery Agent`,
        completed: true,
        notes: `Delivery completed and verified by recipient. Timestamp: ${this.getNowFormatted()}`
      });
    } else if (status === 'Exception') {
      order.shipmentStatus = 'Exception';
      this.addTimelineEvent(order, {
        title: `Delivery Exception / Delay`,
        actor: shipment.courier,
        completed: false,
        notes: `Delivery attempt failed: ${notes || 'Customer unavailable or address incomplete. Reattempt scheduled.'}`
      });
    }

    this.notifyUpdate();
    return { success: true, message: `Shipment status updated to '${status}'.` };
  }

  /**
   * Return Management: Initiate Return Request
   */
  public requestReturn(
    orderId: string,
    reason: string,
    itemsToReturn: { sku: string; name: string; quantity: number; reason: string }[]
  ): { success: boolean; returnNumber: string; message: string } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, returnNumber: '', message: 'Order not found.' };

    if (order.orderStatus !== 'Delivered') {
      return { success: false, returnNumber: '', message: 'Returns can only be requested for delivered orders.' };
    }

    const returnNumber = `RMA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const refundEstimate = itemsToReturn.reduce((sum, ri) => {
      const match = order.items.find(i => i.sku === ri.sku);
      return sum + (match ? match.price * ri.quantity : 0);
    }, 0);

    const returnRecord: ReturnRequestRecord = {
      id: `RET-${Math.floor(1000 + Math.random() * 9000)}`,
      returnNumber,
      orderId: order.id,
      customerId: order.customerId,
      customerName: order.customerName,
      reason,
      status: 'Return Requested',
      requestedAt: this.getNowFormatted(),
      refundAmount: refundEstimate,
      items: itemsToReturn.map(i => ({
        sku: i.sku,
        name: i.name,
        quantity: i.quantity,
        reason: i.reason,
        condition: 'Opened - Intact'
      }))
    };

    order.returnStatus = 'Return Requested';
    order.returnRecord = returnRecord;

    this.addTimelineEvent(order, {
      title: `Return Requested (${returnNumber})`,
      actor: 'Customer / Support Portal',
      completed: true,
      notes: `Return requested for ${itemsToReturn.length} item(s). Reason: ${reason}. Estimated refund: ₹${refundEstimate}`
    });

    this.notifyUpdate();
    return {
      success: true,
      returnNumber,
      message: `Return request ${returnNumber} logged. Pending admin authorization.`
    };
  }

  /**
   * Return Management: Approve or Reject Return
   */
  public processReturnDecision(
    orderId: string,
    decision: 'Approve' | 'Reject',
    rejectionReason?: string
  ): { success: boolean; message: string } {
    const order = this.getOrderById(orderId);
    if (!order || !order.returnRecord) {
      return { success: false, message: 'Active return record not found for this order.' };
    }

    if (decision === 'Approve') {
      order.returnStatus = 'Return Approved';
      order.returnRecord.status = 'Return Approved';
      order.returnRecord.approvedAt = this.getNowFormatted();

      this.addTimelineEvent(order, {
        title: `Return Approved (${order.returnRecord.returnNumber})`,
        actor: 'Admin Quality Team',
        completed: true,
        notes: `Return authorized. Reverse pickup scheduled for customer.`
      });
      this.notifyUpdate();
      return { success: true, message: `Return ${order.returnRecord.returnNumber} has been approved.` };
    } else {
      order.returnStatus = 'Return Rejected';
      order.returnRecord.status = 'Return Rejected';
      order.returnRecord.rejectedAt = this.getNowFormatted();
      order.returnRecord.rejectionReason = rejectionReason || 'Does not meet return eligibility criteria';

      this.addTimelineEvent(order, {
        title: `Return Rejected (${order.returnRecord.returnNumber})`,
        actor: 'Admin Quality Team',
        completed: true,
        notes: `Return declined: ${order.returnRecord.rejectionReason}`
      });
      this.notifyUpdate();
      return { success: true, message: `Return ${order.returnRecord.returnNumber} rejected.` };
    }
  }

  /**
   * Return Management: Receive and Inspect Return Item
   */
  public receiveAndInspectReturn(
    orderId: string,
    restockGoodUnits: boolean = true,
    inspectionNotes: string = 'Item inspected in acceptable condition'
  ): { success: boolean; message: string } {
    const order = this.getOrderById(orderId);
    if (!order || !order.returnRecord) {
      return { success: false, message: 'Return record not found.' };
    }

    order.returnStatus = 'Inspected';
    order.returnRecord.status = 'Inspected';
    order.returnRecord.receivedAt = this.getNowFormatted();
    order.returnRecord.inspectedAt = this.getNowFormatted();
    order.returnRecord.inspectionNotes = inspectionNotes;

    // Restock returned items if usable
    if (restockGoodUnits) {
      order.returnRecord.items.forEach(retItem => {
        const item = order.items.find(i => i.sku === retItem.sku);
        if (item) {
          item.inStock += retItem.quantity;
        }
      });
    }

    // Auto-create refund record
    order.refundStatus = 'Initiated';
    order.refundRecord = {
      id: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      refundNumber: `TXN-REF-${Date.now().toString().slice(-6)}`,
      orderId: order.id,
      customerId: order.customerId,
      amount: order.returnRecord.refundAmount,
      status: 'Initiated',
      reason: `Return inspection approved (${order.returnRecord.returnNumber})`,
      paymentMethod: order.paymentMethod,
      transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      initiatedAt: this.getNowFormatted()
    };

    this.addTimelineEvent(order, {
      title: 'Returned Goods Inspected & Refund Queued',
      actor: 'Warehouse Returns Officer',
      completed: true,
      notes: `Goods received and verified. ${restockGoodUnits ? 'Stock replenished.' : 'Items marked defective.'} Refund of ₹${order.returnRecord.refundAmount} initiated.`
    });

    this.notifyUpdate();
    return {
      success: true,
      message: `Return inspected successfully. Refund of ₹${order.returnRecord.refundAmount} queued for payout.`
    };
  }

  /**
   * Refund Management: Process and Complete Refund
   */
  public processRefund(
    orderId: string,
    amount?: number,
    transactionRef?: string
  ): { success: boolean; message: string } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    const refundAmount = amount !== undefined ? amount : (order.refundRecord?.amount || order.totalAmount);
    const txnId = transactionRef || `BANK-REF-${Math.floor(10000000 + Math.random() * 90000000)}`;

    if (!order.refundRecord) {
      order.refundRecord = {
        id: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        refundNumber: `TXN-REF-${Date.now().toString().slice(-6)}`,
        orderId: order.id,
        customerId: order.customerId,
        amount: refundAmount,
        status: 'Processing',
        reason: 'Refund payout',
        paymentMethod: order.paymentMethod,
        transactionId: txnId,
        initiatedAt: this.getNowFormatted()
      };
    }

    order.refundStatus = 'Completed';
    order.refundRecord.status = 'Completed';
    order.refundRecord.transactionId = txnId;
    order.refundRecord.completedAt = this.getNowFormatted();

    if (refundAmount >= order.totalAmount) {
      order.paymentStatus = 'Refunded';
    } else {
      order.paymentStatus = 'Partially Refunded';
    }

    this.addTimelineEvent(order, {
      title: `Refund Processed Successfully (₹${refundAmount})`,
      actor: 'Payment Gateway / Accounts',
      completed: true,
      notes: `Amount credited via ${order.paymentMethod}. Transaction Ref: ${txnId}`
    });

    this.notifyUpdate();
    return {
      success: true,
      message: `Refund of ₹${refundAmount} successfully executed! Reference: ${txnId}`
    };
  }

  /**
   * Compute live order metrics for dashboard and tab counts
   */
  public getOrderMetrics(): OrderMetrics {
    const all = this.orders;
    return {
      total: all.length,
      pending: all.filter(o => o.orderStatus === 'Pending').length,
      confirmed: all.filter(o => o.orderStatus === 'Confirmed').length,
      processing: all.filter(o => o.orderStatus === 'Processing').length,
      procurementRequired: all.filter(o => o.procurementStatus === 'Required' || o.procurementStatus === 'PO_Created').length,
      readyToShip: all.filter(o => o.orderStatus === 'Ready to Ship').length,
      shipped: all.filter(o => o.orderStatus === 'Shipped').length,
      inTransit: all.filter(o => o.orderStatus === 'In Transit').length,
      delivered: all.filter(o => o.orderStatus === 'Delivered').length,
      cancelled: all.filter(o => o.orderStatus === 'Cancelled').length,
      returnRequests: all.filter(o => o.returnStatus === 'Return Requested' || o.returnStatus === 'Return Approved').length,
      refundManagement: all.filter(o => o.refundStatus === 'Initiated' || o.refundStatus === 'Processing' || o.refundStatus === 'Completed').length,
      totalRevenue: all
        .filter(o => o.orderStatus !== 'Cancelled' && o.paymentStatus !== 'Failed')
        .reduce((sum, o) => sum + o.totalAmount, 0),
      delayedShipments: all.filter(o => o.shipmentStatus === 'Exception').length,
      stockShortages: all.filter(o => o.items.some(i => i.quantity > i.inStock)).length
    };
  }

  private addTimelineEvent(order: AdminOrder, event: Omit<OrderTimelineEvent, 'id' | 'time'>): void {
    const newEv: OrderTimelineEvent = {
      id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      time: this.getNowFormatted(),
      ...event
    };
    order.timeline.unshift(newEv);
  }

  public notifyUpdate(): void {
    const updatedOrders = [...this.ordersSubject.value];
    this.ordersSubject.next(updatedOrders);
    if (this.selectedOrder) {
      const refreshed = updatedOrders.find(o => o.id === this.selectedOrder?.id);
      if (refreshed) {
        this.selectedOrderSubject.next(refreshed);
      }
    }
  }

  /**
   * Create and record a new storefront customer order seamlessly
   */
  public createStorefrontOrder(orderData: Partial<AdminOrder>): AdminOrder {
    const newId = orderData.id || `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const d = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    const hours = d.getHours();
    const mins = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    const timeStr = `${h12.toString().padStart(2, '0')}:${mins} ${ampm}`;

    const newOrder: AdminOrder = {
      id: newId,
      customerId: orderData.customerId || '#C' + Math.floor(1000 + Math.random() * 9000),
      customerName: orderData.customerName || 'Storefront Customer',
      customerEmail: orderData.customerEmail || 'customer@yourstore.com',
      customerPhone: orderData.customerPhone || '+91 98765 43210',
      shippingAddress: orderData.shippingAddress || '123 Market Street, New Delhi, India',
      billingAddress: orderData.billingAddress || orderData.shippingAddress || '123 Market Street, New Delhi, India',
      date: orderData.date || dateStr,
      time: orderData.time || timeStr,
      orderStatus: orderData.orderStatus || 'Confirmed',
      paymentStatus: orderData.paymentStatus || (orderData.paymentMethod?.includes('Cash') ? 'COD' : 'Paid'),
      procurementStatus: 'None',
      shipmentStatus: 'Unshipped',
      returnStatus: 'None',
      refundStatus: 'None',
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      shippingCharge: orderData.shippingCharge || 0,
      discount: orderData.discount || 0,
      totalAmount: orderData.totalAmount || 0,
      paymentMethod: orderData.paymentMethod || 'UPI (Google Pay)',
      deliveryDeadline: orderData.deliveryDeadline || '3 - 5 Business Days',
      fulfillmentPriority: 'Medium',
      timeline: [
        {
          id: 't-init-' + Date.now(),
          title: 'Order Placed & Confirmed Online',
          time: `${dateStr}, ${timeStr}`,
          actor: 'Storefront Customer',
          completed: true,
          notes: `Customer completed checkout via ${orderData.paymentMethod || 'Online Payment'}. Total: $${orderData.totalAmount || 0}`
        }
      ],
      ...orderData,
      stockReserved: orderData.stockReserved ?? true,
      shipments: orderData.shipments ?? []
    } as AdminOrder;

    const currentOrders = this.ordersSubject.value;
    const updated = [newOrder, ...currentOrders];
    this.ordersSubject.next(updated);
    this.notifyUpdate();
    return newOrder;
  }

  private getNowFormatted(): string {
    const d = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours();
    const mins = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hr12 = hours % 12 || 12;
    return `${day} ${month} ${year}, ${hr12}:${mins} ${ampm}`;
  }

  /**
   * Initial relational seed orders connecting directly to customer IDs (#C1001 - #C1010)
   */
  private getSeedOrders(): AdminOrder[] {
    return [
      // 1. Deficit order requiring procurement
      {
        id: '#ORD-1248',
        customerId: '#C1001',
        customerName: 'Rohan Sharma',
        customerEmail: 'rohan.sharma@example.com',
        customerPhone: '+91 98765 43210',
        shippingAddress: '12, Green Park, Sector 62, Noida, Uttar Pradesh - 201309',
        date: '27 Apr 2025',
        time: '10:24 AM',
        orderStatus: 'Processing',
        paymentStatus: 'Paid',
        procurementStatus: 'Required',
        shipmentStatus: 'Unshipped',
        returnStatus: 'None',
        refundStatus: 'None',
        subtotal: 2499,
        shippingCharge: 0,
        discount: 0,
        totalAmount: 2499,
        paymentMethod: 'UPI / Net Banking',
        deliveryDeadline: 'Tomorrow, 06:00 PM',
        deadlineDaysRemaining: 1,
        fulfillmentPriority: 'High',
        stockReserved: true,
        procurementNotes: 'Herbal Shampoo (Neem & Aloe) has 1 unit missing in warehouse.',
        items: [
          {
            id: 'item-101',
            name: 'Herbal Shampoo (Neem & Aloe)',
            sku: 'PST-001',
            image: '/images/wellness/neem-bottle-nature.jpg',
            category: 'Personal Care',
            brand: 'Himalaya',
            price: 299,
            quantity: 4,
            inStock: 3, // Deficit of 1 unit!
            reservedQty: 3,
            warehouseLocation: 'Central Warehouse - Shelf A3',
            pickingLocation: { aisle: 'Aisle 3', rack: 'Rack A', shelf: 'Shelf 3', bin: 'Bin 12' },
            picked: false,
            dispatchedQty: 0,
            procurementStatus: 'Requested',
            variant: '500ml / Standard Bottle',
            size: '500ml',
            color: 'Herbal Green'
          },
          {
            id: 'item-102',
            name: 'Natural Face Wash (Neem & Turmeric)',
            sku: 'PST-002',
            image: '/images/wellness/neem-turmeric.jpg',
            category: 'Skincare',
            brand: 'Biotique',
            price: 199,
            quantity: 2,
            inStock: 12,
            reservedQty: 2,
            warehouseLocation: 'Central Warehouse - Shelf B1',
            pickingLocation: { aisle: 'Aisle 1', rack: 'Rack B', shelf: 'Shelf 1', bin: 'Bin 04' },
            picked: true,
            dispatchedQty: 0,
            procurementStatus: 'None',
            variant: '150ml / Tube Pack',
            size: '150ml',
            color: 'Turmeric Gold'
          }
        ],
        shipments: [],
        timeline: [
          {
            id: 't-1',
            title: 'Inventory Shortage Flagged',
            actor: 'System Inventory Engine',
            time: '27 Apr 2025, 10:26 AM',
            completed: true,
            notes: 'PST-001 stock deficit of 1 unit flagged for procurement.'
          },
          {
            id: 't-2',
            title: 'Payment Confirmed',
            actor: 'Razorpay Payment Gateway',
            time: '27 Apr 2025, 10:24 AM',
            completed: true,
            notes: 'Payment verified via UPI (Txn #UPI-992817)'
          },
          {
            id: 't-3',
            title: 'Order Placed',
            actor: 'Customer (Rohan Sharma)',
            time: '27 Apr 2025, 10:24 AM',
            completed: true
          }
        ]
      },

      // 1b. Additional procurement orders for Customer-wise and All Orders Procurement workflows
      {
        id: '#ORD-1250',
        customerId: '#C1002',
        customerName: 'Priya Singh',
        customerEmail: 'priya@example.com',
        customerPhone: '+91 98765 12345',
        shippingAddress: 'Flat 402, Lotus Tower, Baner, Pune, MH - 411045',
        date: '27 Apr 2025',
        time: '11:45 AM',
        orderStatus: 'Processing',
        paymentStatus: 'Paid',
        procurementStatus: 'Required',
        shipmentStatus: 'Unshipped',
        returnStatus: 'None',
        refundStatus: 'None',
        subtotal: 1848,
        shippingCharge: 0,
        discount: 50,
        totalAmount: 1798,
        paymentMethod: 'Credit Card',
        deliveryDeadline: '29 Apr 2025, 05:00 PM',
        deadlineDaysRemaining: 2,
        fulfillmentPriority: 'High',
        stockReserved: true,
        procurementNotes: 'Ashwagandha Gold Capsules has 2 units missing in warehouse.',
        items: [
          {
            id: 'item-201-p',
            name: 'Ashwagandha Gold Capsules',
            sku: 'PST-015',
            image: '/images/wellness/ashwagandha.jpg',
            category: 'Supplements',
            brand: 'Kapiva',
            price: 499,
            quantity: 3,
            inStock: 1,
            reservedQty: 1,
            warehouseLocation: 'North Wing - Shelf C2',
            pickingLocation: { aisle: 'Aisle 2', rack: 'Rack C', shelf: 'Shelf 2', bin: 'Bin 08' },
            picked: false,
            dispatchedQty: 0,
            procurementStatus: 'Requested',
            variant: 'Pack of 60 / 500mg',
            size: '60 Caps',
            color: 'Amber Bottle'
          },
          {
            id: 'item-202-p',
            name: 'Organic Brahmi Brain Tonic',
            sku: 'PST-022',
            image: '/images/wellness/triphala-capsules.jpg',
            category: 'Health Care',
            brand: 'Dabur',
            price: 349,
            quantity: 1,
            inStock: 8,
            reservedQty: 1,
            warehouseLocation: 'Central Warehouse - Shelf A1',
            pickingLocation: { aisle: 'Aisle 1', rack: 'Rack A', shelf: 'Shelf 1', bin: 'Bin 02' },
            picked: true,
            dispatchedQty: 0,
            procurementStatus: 'None',
            variant: '200ml Glass Bottle',
            size: '200ml',
            color: 'Clear Glass'
          }
        ],
        shipments: [],
        timeline: [
          {
            id: 't-1250-1',
            title: 'Inventory Shortage Flagged',
            actor: 'System Inventory Engine',
            time: '27 Apr 2025, 11:46 AM',
            completed: true,
            notes: 'PST-015 stock deficit of 2 units flagged for procurement.'
          }
        ]
      },
      {
        id: '#ORD-1252',
        customerId: '#C1001',
        customerName: 'Rohan Sharma',
        customerEmail: 'rohan.sharma@example.com',
        customerPhone: '+91 98765 43210',
        shippingAddress: '12, Green Park, Sector 62, Noida, Uttar Pradesh - 201309',
        date: '26 Apr 2025',
        time: '04:15 PM',
        orderStatus: 'Processing',
        paymentStatus: 'Paid',
        procurementStatus: 'Required',
        shipmentStatus: 'Unshipped',
        returnStatus: 'None',
        refundStatus: 'None',
        subtotal: 1599,
        shippingCharge: 0,
        discount: 0,
        totalAmount: 1599,
        paymentMethod: 'UPI / Net Banking',
        deliveryDeadline: '30 Apr 2025, 06:00 PM',
        deadlineDaysRemaining: 3,
        fulfillmentPriority: 'Medium',
        stockReserved: false,
        procurementNotes: 'Kumkumadi Radiance Facial Oil completely out of stock in warehouse.',
        items: [
          {
            id: 'item-301-p',
            name: 'Kumkumadi Radiance Facial Oil',
            sku: 'PST-034',
            image: '/images/wellness/patanjali-giloy.jpg',
            category: 'Skincare',
            brand: 'Biotique',
            price: 799,
            quantity: 2,
            inStock: 0,
            reservedQty: 0,
            warehouseLocation: 'Central Warehouse - Shelf B2',
            pickingLocation: { aisle: 'Aisle 2', rack: 'Rack B', shelf: 'Shelf 2', bin: 'Bin 05' },
            picked: false,
            dispatchedQty: 0,
            procurementStatus: 'Requested',
            variant: '30ml Dropper Bottle',
            size: '30ml',
            color: 'Saffron Tint'
          }
        ],
        shipments: [],
        timeline: [
          {
            id: 't-1252-1',
            title: 'Inventory Shortage Flagged',
            actor: 'System Inventory Engine',
            time: '26 Apr 2025, 04:16 PM',
            completed: true,
            notes: 'PST-034 stock deficit of 2 units flagged for procurement.'
          }
        ]
      },
      {
        id: '#ORD-1255',
        customerId: '#C1005',
        customerName: 'Meera Patel',
        customerEmail: 'meera@example.com',
        customerPhone: '+91 99001 12233',
        shippingAddress: 'Flat 501, Heritage Pride, Satellite, Ahmedabad, GJ - 380015',
        date: '26 Apr 2025',
        time: '02:30 PM',
        orderStatus: 'Processing',
        paymentStatus: 'Paid',
        procurementStatus: 'Required',
        shipmentStatus: 'Unshipped',
        returnStatus: 'None',
        refundStatus: 'None',
        subtotal: 948,
        shippingCharge: 40,
        discount: 0,
        totalAmount: 988,
        paymentMethod: 'Debit Card',
        deliveryDeadline: '29 Apr 2025, 06:00 PM',
        deadlineDaysRemaining: 2,
        fulfillmentPriority: 'High',
        stockReserved: true,
        procurementNotes: 'Amla Juice and Chyawanprash have stock deficits.',
        items: [
          {
            id: 'item-401-p',
            name: 'Pure Amla Juice 1L',
            sku: 'PST-019',
            image: '/images/wellness/triphala-capsules.jpg',
            category: 'Health Care',
            brand: 'Patanjali',
            price: 299,
            quantity: 2,
            inStock: 1,
            reservedQty: 1,
            warehouseLocation: 'North Wing - Shelf C1',
            pickingLocation: { aisle: 'Aisle 3', rack: 'Rack C', shelf: 'Shelf 1', bin: 'Bin 03' },
            picked: false,
            dispatchedQty: 0,
            procurementStatus: 'Requested',
            variant: '1 Litre Pet Bottle',
            size: '1000ml',
            color: 'Natural Green'
          },
          {
            id: 'item-402-p',
            name: 'Chyawanprash Special Formula 1kg',
            sku: 'PST-028',
            image: '/images/wellness/dabur-chyawanprash.jpg',
            category: 'Health Care',
            brand: 'Dabur',
            price: 350,
            quantity: 1,
            inStock: 0,
            reservedQty: 0,
            warehouseLocation: 'Central Warehouse - Shelf D1',
            pickingLocation: { aisle: 'Aisle 1', rack: 'Rack D', shelf: 'Shelf 1', bin: 'Bin 09' },
            picked: false,
            dispatchedQty: 0,
            procurementStatus: 'Requested',
            variant: '1kg Heritage Jar',
            size: '1kg',
            color: 'Dark Amber'
          }
        ],
        shipments: [],
        timeline: [
          {
            id: 't-1255-1',
            title: 'Inventory Shortage Flagged',
            actor: 'System Inventory Engine',
            time: '26 Apr 2025, 02:31 PM',
            completed: true,
            notes: 'Shortages detected on 2 items; flagged for procurement.'
          }
        ]
      },
      {
        id: '#ORD-1235',
        customerId: '#C1002',
        customerName: 'Priya Singh',
        customerEmail: 'priya@example.com',
        customerPhone: '+91 98765 12345',
        shippingAddress: 'Flat 402, Lotus Tower, Baner, Pune, MH - 411045',
        date: '27 Apr 2025',
        time: '09:17 AM',
        orderStatus: 'Pending',
        paymentStatus: 'COD',
        procurementStatus: 'None',
        shipmentStatus: 'Unshipped',
        returnStatus: 'None',
        refundStatus: 'None',
        subtotal: 1249,
        shippingCharge: 50,
        discount: 0,
        totalAmount: 1299,
        paymentMethod: 'Cash on Delivery',
        deliveryDeadline: '30 Apr 2025, 05:00 PM',
        deadlineDaysRemaining: 3,
        fulfillmentPriority: 'Medium',
        stockReserved: false,
        items: [
          {
            id: 'item-201',
            name: 'Triphala Churna 250g',
            sku: 'PST-005',
            image: '/images/wellness/triphala-capsules.jpg',
            category: 'Health Care',
            brand: 'Dabur',
            price: 249,
            quantity: 2,
            inStock: 25,
            reservedQty: 0,
            warehouseLocation: 'North Wing - Shelf C2',
            pickingLocation: { aisle: 'Aisle 2', rack: 'Rack C', shelf: 'Shelf 2', bin: 'Bin 08' },
            picked: false,
            dispatchedQty: 0,
            procurementStatus: 'None'
          },
          {
            id: 'item-202',
            name: 'Herbal Hair Oil 200ml',
            sku: 'PST-006',
            image: '/images/wellness/neem-bottle-nature.jpg',
            category: 'Personal Care',
            brand: 'Biotique',
            price: 399,
            quantity: 2,
            inStock: 18,
            reservedQty: 0,
            warehouseLocation: 'Central Warehouse - Shelf A1',
            pickingLocation: { aisle: 'Aisle 1', rack: 'Rack A', shelf: 'Shelf 1', bin: 'Bin 02' },
            picked: false,
            dispatchedQty: 0,
            procurementStatus: 'None'
          }
        ],
        shipments: [],
        timeline: [
          {
            id: 't-21',
            title: 'Order Placed (COD)',
            actor: 'Customer (Priya Singh)',
            time: '27 Apr 2025, 09:17 AM',
            completed: true,
            notes: 'Order placed with Cash on Delivery. Pending verification.'
          }
        ]
      },

      // 3. Confirmed Order with safe stock reservation
      {
        id: '#ORD-1236-W',
        customerId: '#C1003',
        customerName: 'Amit Verma',
        customerEmail: 'amit@example.com',
        customerPhone: '+91 87654 32109',
        shippingAddress: 'Plot 88, Malviya Nagar, Jaipur, RJ - 302017',
        date: '26 Apr 2025',
        time: '06:42 PM',
        orderStatus: 'Confirmed',
        paymentStatus: 'Paid',
        procurementStatus: 'None',
        shipmentStatus: 'Unshipped',
        returnStatus: 'None',
        refundStatus: 'None',
        subtotal: 4899,
        shippingCharge: 0,
        discount: 200,
        totalAmount: 4899,
        paymentMethod: 'Credit Card',
        deliveryDeadline: '01 May 2025, 06:00 PM',
        deadlineDaysRemaining: 4,
        fulfillmentPriority: 'Medium',
        stockReserved: true,
        items: [
          {
            id: 'item-301',
            name: 'Pure Shilajit Resin 20g',
            sku: 'PST-010',
            image: '/images/wellness/patanjali-giloy.jpg',
            category: 'Supplements',
            brand: 'Kapiva',
            price: 1499,
            quantity: 3,
            inStock: 14,
            reservedQty: 3,
            warehouseLocation: 'Secure Vault - Bay S1',
            pickingLocation: { aisle: 'Aisle 4', rack: 'Vault S', shelf: 'Shelf 1', bin: 'Bin 01' },
            picked: false,
            dispatchedQty: 0,
            procurementStatus: 'None'
          }
        ],
        shipments: [],
        timeline: [
          {
            id: 't-31',
            title: 'Stock Reserved & Order Confirmed',
            actor: 'Admin (System)',
            time: '26 Apr 2025, 06:45 PM',
            completed: true,
            notes: '3 units reserved from warehouse. Ready to move to picking.'
          },
          {
            id: 't-32',
            title: 'Payment Processed',
            actor: 'HDFC Payment Gateway',
            time: '26 Apr 2025, 06:43 PM',
            completed: true
          }
        ]
      },

      // 4. Ready to Ship Order
      {
        id: '#ORD-1237-D',
        customerId: '#C1004',
        customerName: 'Neha Kapoor',
        customerEmail: 'neha@example.com',
        customerPhone: '+91 76543 21098',
        shippingAddress: 'B-14, Vasant Kunj, New Delhi, DL - 110070',
        date: '26 Apr 2025',
        time: '04:21 PM',
        orderStatus: 'Ready to Ship',
        paymentStatus: 'Paid',
        procurementStatus: 'None',
        shipmentStatus: 'Unshipped',
        returnStatus: 'None',
        refundStatus: 'None',
        subtotal: 799,
        shippingCharge: 40,
        discount: 40,
        totalAmount: 799,
        paymentMethod: 'UPI',
        deliveryDeadline: 'Tomorrow, 12:00 PM',
        deadlineDaysRemaining: 1,
        fulfillmentPriority: 'High',
        stockReserved: true,
        items: [
          {
            id: 'item-401',
            name: 'Brahmi Vati 60 Tabs',
            sku: 'PST-015',
            image: '/images/wellness/neem-turmeric.jpg',
            category: 'Health Care',
            brand: 'Baidyanath',
            price: 399,
            quantity: 2,
            inStock: 30,
            reservedQty: 2,
            warehouseLocation: 'North Wing - Shelf D1',
            pickingLocation: { aisle: 'Aisle 2', rack: 'Rack D', shelf: 'Shelf 1', bin: 'Bin 05' },
            picked: true,
            dispatchedQty: 0,
            procurementStatus: 'None'
          }
        ],
        shipments: [],
        timeline: [
          {
            id: 't-41',
            title: 'Items Picked & Box Packed',
            actor: 'Packer Unit 3',
            time: '26 Apr 2025, 05:10 PM',
            completed: true,
            notes: 'Packed in standard herbal parcel. Awaiting shipping manifest.'
          },
          {
            id: 't-42',
            title: 'Order Processing Started',
            actor: 'Warehouse Supervisor',
            time: '26 Apr 2025, 04:30 PM',
            completed: true
          }
        ]
      },

      // 5. Shipped Order with courier tracking
      {
        id: '#ORD-1239-S',
        customerId: '#C1006',
        customerName: 'Ritika Mehta',
        customerEmail: 'ritika@example.com',
        customerPhone: '+91 99887 66554',
        shippingAddress: '78, Salt Lake City, Sector 3, Kolkata, WB - 700098',
        date: '25 Apr 2025',
        time: '11:32 AM',
        orderStatus: 'Shipped',
        paymentStatus: 'Paid',
        procurementStatus: 'None',
        shipmentStatus: 'Shipped',
        returnStatus: 'None',
        refundStatus: 'None',
        subtotal: 1999,
        shippingCharge: 0,
        discount: 100,
        totalAmount: 1999,
        paymentMethod: 'UPI',
        deliveryDeadline: '29 Apr 2025, 06:00 PM',
        deadlineDaysRemaining: 2,
        fulfillmentPriority: 'High',
        stockReserved: true,
        items: [
          {
            id: 'item-501',
            name: 'Saffron Glow Elixir 30ml',
            sku: 'PST-020',
            image: '/images/wellness/neem-bottle-nature.jpg',
            category: 'Skincare',
            brand: 'Forest Essentials',
            price: 1999,
            quantity: 1,
            inStock: 9,
            reservedQty: 1,
            warehouseLocation: 'Premium Cosmetics - Shelf P2',
            pickingLocation: { aisle: 'Aisle 5', rack: 'Rack P', shelf: 'Shelf 2', bin: 'Bin 03' },
            picked: true,
            dispatchedQty: 1,
            procurementStatus: 'None'
          }
        ],
        shipments: [
          {
            id: 'SHP-8821',
            type: 'Full',
            courier: 'BlueDart Express',
            trackingNumber: 'BD-98210384IN',
            dispatchedAt: '26 Apr 2025, 04:00 PM',
            status: 'Dispatched',
            items: [{ sku: 'PST-020', name: 'Saffron Glow Elixir 30ml', quantity: 1 }],
            notificationSent: true,
            notificationChannel: 'SMS & Email'
          }
        ],
        timeline: [
          {
            id: 't-51',
            title: 'Shipment Handed Over to BlueDart',
            actor: 'Logistics Dispatch Dock',
            time: '26 Apr 2025, 04:00 PM',
            completed: true,
            notes: 'AWB: BD-98210384IN. Manifest generated and signed.'
          },
          {
            id: 't-52',
            title: 'Ready for Dispatch',
            actor: 'Packaging Department',
            time: '26 Apr 2025, 01:15 PM',
            completed: true
          }
        ]
      },

      // 6. In Transit Order
      {
        id: '#ORD-1240-K',
        customerId: '#C1007',
        customerName: 'Karan Malhotra',
        customerEmail: 'karan@example.com',
        customerPhone: '+91 90987 77665',
        shippingAddress: '42, Model Town, Ludhiana, PB - 141002',
        date: '25 Apr 2025',
        time: '09:12 AM',
        orderStatus: 'In Transit',
        paymentStatus: 'Paid',
        procurementStatus: 'None',
        shipmentStatus: 'In Transit',
        returnStatus: 'None',
        refundStatus: 'None',
        subtotal: 6799,
        shippingCharge: 0,
        discount: 300,
        totalAmount: 6799,
        paymentMethod: 'Net Banking',
        deliveryDeadline: 'Today, 07:00 PM',
        deadlineDaysRemaining: 0,
        fulfillmentPriority: 'High',
        stockReserved: true,
        items: [
          {
            id: 'item-601',
            name: 'Pure Kashmiri Saffron 5g',
            sku: 'PST-025',
            image: '/images/wellness/patanjali-giloy.jpg',
            category: 'Wellness',
            brand: 'Baby Saffron',
            price: 3200,
            quantity: 2,
            inStock: 8,
            reservedQty: 2,
            warehouseLocation: 'Vault S - Safe 02',
            pickingLocation: { aisle: 'Aisle 4', rack: 'Vault S', shelf: 'Shelf 2', bin: 'Bin 02' },
            picked: true,
            dispatchedQty: 2,
            procurementStatus: 'None'
          },
          {
            id: 'item-602',
            name: 'Giloy Ghanvati Pack',
            sku: 'PST-026',
            image: '/images/wellness/neem-turmeric.jpg',
            category: 'Health Care',
            brand: 'Patanjali',
            price: 399,
            quantity: 1,
            inStock: 40,
            reservedQty: 1,
            warehouseLocation: 'North Wing - Shelf C1',
            pickingLocation: { aisle: 'Aisle 2', rack: 'Rack C', shelf: 'Shelf 1', bin: 'Bin 09' },
            picked: true,
            dispatchedQty: 1,
            procurementStatus: 'None'
          }
        ],
        shipments: [
          {
            id: 'SHP-7742',
            type: 'Full',
            courier: 'Delhivery Logistics',
            trackingNumber: 'DEL-77821945IN',
            dispatchedAt: '25 Apr 2025, 02:30 PM',
            status: 'In Transit',
            items: [
              { sku: 'PST-025', name: 'Pure Kashmiri Saffron 5g', quantity: 2 },
              { sku: 'PST-026', name: 'Giloy Ghanvati Pack', quantity: 1 }
            ],
            notificationSent: true,
            notificationChannel: 'SMS & Email'
          }
        ],
        timeline: [
          {
            id: 't-61',
            title: 'Arrived at Ludhiana Sorting Hub',
            actor: 'Delhivery Hub',
            time: '28 Apr 2025, 08:30 AM',
            completed: true,
            notes: 'Package cleared local sorting facility. Out for delivery soon.'
          },
          {
            id: 't-62',
            title: 'Dispatched from Gurgaon National Hub',
            actor: 'Delhivery Logistics',
            time: '26 Apr 2025, 11:00 PM',
            completed: true
          }
        ]
      },

      // 7. Delivered Order
      {
        id: '#ORD-1241-P',
        customerId: '#C1008',
        customerName: 'Pooja Sharma',
        customerEmail: 'pooja@example.com',
        customerPhone: '+91 88776 55443',
        shippingAddress: '23, Anna Nagar, Chennai, TN - 600040',
        date: '24 Apr 2025',
        time: '07:45 PM',
        orderStatus: 'Delivered',
        paymentStatus: 'Paid',
        procurementStatus: 'None',
        shipmentStatus: 'Delivered',
        returnStatus: 'None',
        refundStatus: 'None',
        subtotal: 1499,
        shippingCharge: 50,
        discount: 0,
        totalAmount: 1499,
        paymentMethod: 'Cash on Delivery',
        fulfillmentPriority: 'Low',
        stockReserved: true,
        items: [
          {
            id: 'item-701',
            name: 'Herbal Hair Oil 200ml',
            sku: 'PST-030',
            image: '/images/wellness/neem-bottle-nature.jpg',
            category: 'Personal Care',
            brand: 'Biotique',
            price: 499,
            quantity: 3,
            inStock: 22,
            reservedQty: 3,
            warehouseLocation: 'Central Warehouse - Shelf A2',
            pickingLocation: { aisle: 'Aisle 1', rack: 'Rack A', shelf: 'Shelf 2', bin: 'Bin 05' },
            picked: true,
            dispatchedQty: 3,
            procurementStatus: 'None'
          }
        ],
        shipments: [
          {
            id: 'SHP-6612',
            type: 'Full',
            courier: 'DTDC Air Express',
            trackingNumber: 'DTDC-66120934IN',
            dispatchedAt: '25 Apr 2025, 10:00 AM',
            status: 'Delivered',
            items: [{ sku: 'PST-030', name: 'Herbal Hair Oil 200ml', quantity: 3 }],
            notificationSent: true,
            notificationChannel: 'SMS & Email'
          }
        ],
        timeline: [
          {
            id: 't-71',
            title: 'Delivered to Recipient',
            actor: 'DTDC Courier Executive',
            time: '27 Apr 2025, 02:40 PM',
            completed: true,
            notes: 'Handed to customer Pooja Sharma. Cash of ₹1,499 collected.'
          },
          {
            id: 't-72',
            title: 'Dispatched via DTDC Air',
            actor: 'Logistics Desk',
            time: '25 Apr 2025, 10:00 AM',
            completed: true
          }
        ]
      },

      // 8. Cancelled Order before dispatch with released inventory
      {
        id: '#ORD-1238-C',
        customerId: '#C1005',
        customerName: 'Suresh Yadav',
        customerEmail: 'suresh@example.com',
        customerPhone: '+91 91234 56789',
        shippingAddress: 'No. 54, Indiranagar, Bengaluru, KA - 560038',
        date: '26 Apr 2025',
        time: '01:56 PM',
        orderStatus: 'Cancelled',
        paymentStatus: 'Refunded',
        procurementStatus: 'None',
        shipmentStatus: 'Unshipped',
        returnStatus: 'None',
        refundStatus: 'Completed',
        subtotal: 3499,
        shippingCharge: 0,
        discount: 0,
        totalAmount: 3499,
        paymentMethod: 'Debit Card',
        fulfillmentPriority: 'Low',
        stockReserved: false,
        refundRecord: {
          id: 'REF-1092',
          refundNumber: 'TXN-REF-771239',
          orderId: '#ORD-1238-C',
          customerId: '#C1005',
          amount: 3499,
          status: 'Completed',
          reason: 'Customer cancelled order before dispatch',
          paymentMethod: 'Debit Card',
          transactionId: 'TXN-REF-771239',
          initiatedAt: '26 Apr 2025, 02:30 PM',
          completedAt: '26 Apr 2025, 02:45 PM'
        },
        items: [
          {
            id: 'item-801',
            name: 'Ayurvedic Wellness Kit',
            sku: 'PST-035',
            image: '/images/wellness/patanjali-giloy.jpg',
            category: 'Wellness',
            brand: 'Organic India',
            price: 3499,
            quantity: 1,
            inStock: 15,
            reservedQty: 0,
            warehouseLocation: 'Central Warehouse - Shelf D3',
            pickingLocation: { aisle: 'Aisle 3', rack: 'Rack D', shelf: 'Shelf 3', bin: 'Bin 11' },
            picked: false,
            dispatchedQty: 0,
            procurementStatus: 'None'
          }
        ],
        shipments: [],
        timeline: [
          {
            id: 't-81',
            title: 'Refund Credited to Debit Card',
            actor: 'Gateway Settlement',
            time: '26 Apr 2025, 02:45 PM',
            completed: true,
            notes: '₹3,499 refunded. Txn Ref: TXN-REF-771239'
          },
          {
            id: 't-82',
            title: 'Order Cancelled & Stock Released',
            actor: 'Customer Service Agent',
            time: '26 Apr 2025, 02:30 PM',
            completed: true,
            notes: 'Cancelled at buyer request. 1 unit of PST-035 released back to stock pool.'
          }
        ]
      },

      // 9. Return Requested Order
      {
        id: '#ORD-1242-V',
        customerId: '#C1009',
        customerName: 'Vikash Raj',
        customerEmail: 'vikash@example.com',
        customerPhone: '+91 99876 44332',
        shippingAddress: 'Flat 12, Bailey Road, Patna, BR - 800001',
        date: '24 Apr 2025',
        time: '03:22 PM',
        orderStatus: 'Delivered',
        paymentStatus: 'Paid',
        procurementStatus: 'None',
        shipmentStatus: 'Delivered',
        returnStatus: 'Return Requested',
        refundStatus: 'None',
        subtotal: 2299,
        shippingCharge: 0,
        discount: 100,
        totalAmount: 2299,
        paymentMethod: 'Credit Card',
        fulfillmentPriority: 'Low',
        stockReserved: true,
        returnRecord: {
          id: 'RET-5510',
          returnNumber: 'RMA-2025-0891',
          orderId: '#ORD-1242-V',
          customerId: '#C1009',
          customerName: 'Vikash Raj',
          reason: 'Damaged packaging during transit, seal broken on powder bottle.',
          status: 'Return Requested',
          requestedAt: '27 Apr 2025, 05:15 PM',
          refundAmount: 1598,
          items: [
            {
              sku: 'PST-040',
              name: 'Ashwagandha Organic Powder 500g',
              quantity: 2,
              reason: 'Broken seal upon delivery',
              condition: 'Opened - Intact'
            }
          ]
        },
        items: [
          {
            id: 'item-901',
            name: 'Ashwagandha Organic Powder 500g',
            sku: 'PST-040',
            image: '/images/wellness/patanjali-giloy.jpg',
            category: 'Supplements',
            brand: 'Organic India',
            price: 799,
            quantity: 2,
            inStock: 19,
            reservedQty: 2,
            warehouseLocation: 'North Wing - Shelf B2',
            pickingLocation: { aisle: 'Aisle 2', rack: 'Rack B', shelf: 'Shelf 2', bin: 'Bin 06' },
            picked: true,
            dispatchedQty: 2,
            procurementStatus: 'None'
          },
          {
            id: 'item-902',
            name: 'Triphala Churna 250g',
            sku: 'PST-041',
            image: '/images/wellness/neem-turmeric.jpg',
            category: 'Health Care',
            brand: 'Dabur',
            price: 701,
            quantity: 1,
            inStock: 35,
            reservedQty: 1,
            warehouseLocation: 'North Wing - Shelf C2',
            pickingLocation: { aisle: 'Aisle 2', rack: 'Rack C', shelf: 'Shelf 2', bin: 'Bin 08' },
            picked: true,
            dispatchedQty: 1,
            procurementStatus: 'None'
          }
        ],
        shipments: [
          {
            id: 'SHP-5501',
            type: 'Full',
            courier: 'FedEx Priority',
            trackingNumber: 'FDX-55019283IN',
            dispatchedAt: '25 Apr 2025, 11:30 AM',
            status: 'Delivered',
            items: [
              { sku: 'PST-040', name: 'Ashwagandha Organic Powder 500g', quantity: 2 },
              { sku: 'PST-041', name: 'Triphala Churna 250g', quantity: 1 }
            ],
            notificationSent: true,
            notificationChannel: 'SMS & Email'
          }
        ],
        timeline: [
          {
            id: 't-91',
            title: 'Return Requested: RMA-2025-0891',
            actor: 'Customer (Vikash Raj)',
            time: '27 Apr 2025, 05:15 PM',
            completed: true,
            notes: 'Damaged packaging during transit. Photo evidence uploaded by customer.'
          },
          {
            id: 't-92',
            title: 'Package Delivered',
            actor: 'FedEx Courier',
            time: '26 Apr 2025, 05:40 PM',
            completed: true
          }
        ]
      },

      // 10. Refund Management active: Refund Initiated
      {
        id: '#ORD-1243-A',
        customerId: '#C1010',
        customerName: 'Anjali Gupta',
        customerEmail: 'anjali@example.com',
        customerPhone: '+91 77665 22110',
        shippingAddress: '34, Gomti Nagar, Lucknow, UP - 226010',
        date: '23 Apr 2025',
        time: '12:18 PM',
        orderStatus: 'Cancelled',
        paymentStatus: 'Paid',
        procurementStatus: 'None',
        shipmentStatus: 'Unshipped',
        returnStatus: 'None',
        refundStatus: 'Initiated',
        subtotal: 3999,
        shippingCharge: 0,
        discount: 0,
        totalAmount: 3999,
        paymentMethod: 'UPI',
        fulfillmentPriority: 'Low',
        stockReserved: false,
        refundRecord: {
          id: 'REF-9921',
          refundNumber: 'TXN-REF-109283',
          orderId: '#ORD-1243-A',
          customerId: '#C1010',
          amount: 3999,
          status: 'Initiated',
          reason: 'Customer cancelled prior to packing - awaiting payment gateway payout',
          paymentMethod: 'UPI (Google Pay)',
          transactionId: 'TXN-9982172',
          initiatedAt: '24 Apr 2025, 11:00 AM'
        },
        items: [
          {
            id: 'item-1001',
            name: 'Neem & Turmeric Cleanser Pack',
            sku: 'PST-050',
            image: '/images/wellness/neem-bottle-nature.jpg',
            category: 'Personal Care',
            brand: 'Himalaya',
            price: 1999,
            quantity: 2,
            inStock: 14,
            reservedQty: 0,
            warehouseLocation: 'Central Warehouse - Shelf B3',
            pickingLocation: { aisle: 'Aisle 1', rack: 'Rack B', shelf: 'Shelf 3', bin: 'Bin 07' },
            picked: false,
            dispatchedQty: 0,
            procurementStatus: 'None'
          }
        ],
        shipments: [],
        timeline: [
          {
            id: 't-101',
            title: 'Refund Initiated (₹3,999)',
            actor: 'Finance Department',
            time: '24 Apr 2025, 11:00 AM',
            completed: true,
            notes: 'Awaiting admin final authorization to release payout.'
          },
          {
            id: 't-102',
            title: 'Order Cancelled',
            actor: 'Admin',
            time: '23 Apr 2025, 01:00 PM',
            completed: true
          }
        ]
      }
    ];
  }
}

