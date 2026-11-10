export interface PickingLocation {
  aisle: string; // e.g. 'Aisle 3'
  rack: string;  // e.g. 'Rack B'
  shelf: string; // e.g. 'Shelf 2'
  bin: string;   // e.g. 'Bin 14'
}

export interface OrderShipmentItem {
  sku: string;
  name: string;
  quantity: number;
}

export interface OrderShipment {
  id: string;              // e.g. 'SHP-8921'
  type: 'Full' | 'Partial';
  courier: string;         // e.g. 'BlueDart Express'
  trackingNumber: string;  // e.g. 'BD-78921049IN'
  dispatchedAt: string;    // e.g. '28 Oct 2026, 12:30 PM'
  items: OrderShipmentItem[];
  status: 'Label Generated' | 'Dispatched' | 'In Transit' | 'Out for Delivery' | 'Delivered';
  notificationSent: boolean;
  notificationChannel?: 'SMS & Email' | 'Email' | 'SMS';
  notificationPreview?: string;
}

export interface CustomerOrderItem {
  id: string;
  name: string;
  sku: string;
  image: string;
  category: string;
  brand: string;
  price: number;
  quantity: number;        // Ordered quantity by customer (e.g. 4 units)
  inStock: number;         // Current warehouse stock (e.g. 3 units)
  warehouseLocation: string; // e.g. 'Central Warehouse - Shelf A3'
  pickingLocation?: PickingLocation;
  picked?: boolean;        // Warehouse picker checklist toggle
  dispatchedQty?: number;  // How many units already shipped in partial dispatches
  procurementStatus?: 'None' | 'Requested' | 'PO_Created' | 'In_Transit' | 'Received';
  procurementPoNumber?: string;
  procurementSupplier?: string;
  procurementQty?: number;
  procurementRequestedAt?: string;
  procurementPriority?: 'Normal' | 'High' | 'Urgent';
}

export interface CustomerOrder {
  orderId: string;         // e.g. '#ORD-1248'
  date: string;            // e.g. '27 Apr 2025'
  time?: string;           // e.g. '10:24 AM'
  amount: number;
  status: 'Delivered' | 'Shipped' | 'Processing' | 'Pending' | 'Cancelled';
  paymentMethod: string;
  paymentStatus: 'Paid' | 'COD' | 'Pending' | 'Refunded';
  shippingAddress: string;
  items: CustomerOrderItem[];
  isExpanded?: boolean;    // for accordion toggle
  // Fulfillment specific fields
  deliveryDeadline?: string; // e.g. '2026-10-30'
  deadlineDaysRemaining?: number; // e.g. 1
  fulfillmentPriority?: 'High' | 'Medium' | 'Low';
  dispatchStatus?: 'Unfulfilled' | 'Partially Dispatched' | 'Fully Dispatched';
  shipments?: OrderShipment[];
}

export interface ProcurementRequisition {
  id: string;              // e.g. 'PO-PROC-9041'
  orderId: string;
  customerId: string;
  customerName: string;
  itemSku: string;
  itemName: string;
  requestedQty: number;    // e.g. 1 unit
  currentStock: number;    // e.g. 3 units
  orderedQty: number;      // e.g. 4 units
  supplier: string;        // e.g. 'Himalaya Herbal Supplies Ltd'
  priority: 'Normal' | 'High' | 'Urgent';
  status: 'Dispatched to Supplier' | 'Pending Approval' | 'In Transit' | 'Received & Restocked';
  createdAt: string;
  estimatedDelivery: string;
  notes?: string;
}

export interface AdminCustomerRecord {
  id: string;              // e.g. '#C1001'
  name: string;
  email: string;
  phone: string;
  location: string;
  shippingAddress?: string;
  billingAddress?: string;
  avatar?: string;
  avatarInitials?: string;
  avatarBg?: string;
  customerType: 'Retail' | 'Wholesale' | 'Business';
  status: 'Active' | 'Inactive' | 'Cancelled';
  joinDate: string;        // e.g. '27 Apr 2025'
  joinTime: string;        // e.g. '10:24 AM'
  totalOrders: number;
  totalSpent: number;
  recentOrders?: CustomerOrder[];
  procurementRequisitions?: ProcurementRequisition[];
  selected?: boolean;
}

export interface InventoryItemComparison {
  item: CustomerOrderItem;
  orderId: string;
  orderedQty: number;
  inStock: number;
  deficit: number;         // Math.max(0, orderedQty - inStock)
  status: 'sufficient' | 'deficit' | 'out_of_stock';
  fulfillmentPct: number;  // (inStock / orderedQty) * 100 clamped at 100
}
