import { PickingLocation, OrderShipmentItem, OrderShipment, ProcurementRequisition } from '../pages/customers/models/customer.model';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Ready to Ship'
  | 'Shipped'
  | 'In Transit'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus =
  | 'Pending'
  | 'Paid'
  | 'COD'
  | 'Refunded'
  | 'Partially Refunded'
  | 'Failed';

export type ProcurementStatus =
  | 'None'
  | 'Required'
  | 'PO_Created'
  | 'Partially Received'
  | 'Fulfilled'
  | 'Completed';

export type ShipmentStatus =
  | 'Unshipped'
  | 'Partially Shipped'
  | 'Shipped'
  | 'In Transit'
  | 'Delivered'
  | 'Exception';

export type ReturnStatus =
  | 'None'
  | 'Return Requested'
  | 'Return Approved'
  | 'Return Rejected'
  | 'Item Received'
  | 'Inspected';

export type RefundStatus =
  | 'None'
  | 'Initiated'
  | 'Processing'
  | 'Completed'
  | 'Failed';

export interface ReturnItemRecord {
  sku: string;
  name: string;
  quantity: number;
  reason: string;
  condition?: 'Unopened' | 'Opened - Intact' | 'Damaged' | 'Defective';
}

export interface ReturnRequestRecord {
  id: string;               // e.g. 'RET-5510'
  returnNumber: string;     // e.g. 'RMA-2026-001'
  orderId: string;
  customerId: string;
  customerName: string;
  reason: string;
  status: ReturnStatus;
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  receivedAt?: string;
  inspectedAt?: string;
  inspectionNotes?: string;
  refundAmount: number;
  items: ReturnItemRecord[];
}

export interface RefundRecord {
  id: string;               // e.g. 'REF-9921'
  refundNumber: string;     // e.g. 'TXN-REF-1092'
  orderId: string;
  customerId: string;
  amount: number;
  status: RefundStatus;
  reason: string;
  paymentMethod: string;
  transactionId: string;
  initiatedAt: string;
  completedAt?: string;
  notes?: string;
}

export interface OrderTimelineEvent {
  id: string;
  title: string;
  time: string;
  actor: string;             // e.g. 'Admin (System)', 'Logistics Partner', 'Customer'
  completed: boolean;
  statusBadge?: string;
  notes?: string;
}

export interface ProcurementComment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  status: 'Sent to Procurement Team' | 'Reviewed' | 'Pending';
}

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  image: string;
  category: string;
  brand: string;
  price: number;
  quantity: number;          // customer ordered qty
  inStock: number;           // warehouse current stock
  reservedQty?: number;      // reserved stock qty
  warehouseLocation: string; // e.g. 'Central Warehouse - Shelf A3'
  pickingLocation?: PickingLocation;
  picked?: boolean;
  dispatchedQty?: number;
  procurementStatus?: 'None' | 'Requested' | 'PO_Created' | 'In_Transit' | 'Received' | 'Completed';
  procurementPoNumber?: string;
  variant?: string;
  size?: string;
  color?: string;
  verified?: boolean;
  verifiedAt?: string;
  // Interactive Verification Details
  uploadedImageUrl?: string;
  uploadedImages?: string[];
  galleryImages?: string[];
  imageIsCorrect?: boolean;
  imageVerified?: boolean;
  sizeConfirmed?: boolean;
  confirmedSize?: string;
  verifiedSku?: string;
  procurementComments?: ProcurementComment[];
}

export interface AdminOrder {
  id: string;                // e.g. '#ORD-1248'
  customerId: string;        // foreign key, e.g. '#C1001'
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  billingAddress?: string;
  date: string;
  time: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  procurementStatus: ProcurementStatus;
  shipmentStatus: ShipmentStatus;
  returnStatus: ReturnStatus;
  refundStatus: RefundStatus;
  items: OrderItem[];
  subtotal: number;
  shippingCharge: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  deliveryDeadline?: string;
  deadlineDaysRemaining?: number;
  fulfillmentPriority?: 'High' | 'Medium' | 'Low';
  stockReserved: boolean;
  timeline: OrderTimelineEvent[];
  shipments: OrderShipment[];
  returnRecord?: ReturnRequestRecord;
  refundRecord?: RefundRecord;
  procurementNotes?: string;
  notes?: string;
  selected?: boolean;
}

export interface OrderMetrics {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  procurementRequired: number;
  readyToShip: number;
  shipped: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
  returnRequests: number;
  refundManagement: number;
  totalRevenue: number;
  delayedShipments: number;
  stockShortages: number;
}

/**
 * Valid state transitions for the primary Order Placed -> Delivered lifecycle.
 */
export const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  'Pending': ['Confirmed', 'Cancelled'],
  'Confirmed': ['Processing', 'Cancelled'],
  'Processing': ['Ready to Ship', 'Cancelled'],
  'Ready to Ship': ['Shipped', 'Cancelled'],
  'Shipped': ['In Transit'],
  'In Transit': ['Delivered', 'Ready to Ship'], // 'Ready to Ship' handles delivery exception / re-routing
  'Delivered': [],                               // Delivered is terminal for order status; returns handled via ReturnStatus
  'Cancelled': []                                // Cancelled is terminal for order status
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return false;
  const allowed = VALID_ORDER_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export type OrderActionType =
  | 'CONFIRM'
  | 'START_PROCESSING'
  | 'PROCUREMENT_REQUISITION'
  | 'MARK_READY_TO_SHIP'
  | 'DISPATCH_SHIPMENT'
  | 'MARK_IN_TRANSIT'
  | 'CONFIRM_DELIVERY'
  | 'CANCEL_ORDER'
  | 'REQUEST_RETURN'
  | 'APPROVE_RETURN'
  | 'REJECT_RETURN'
  | 'RECEIVE_RETURN_ITEM'
  | 'PROCESS_REFUND';

export interface PermittedOrderAction {
  action: OrderActionType;
  label: string;
  icon: string;
  btnClass: string;
  tooltip: string;
  destructive?: boolean;
}

