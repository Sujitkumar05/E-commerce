import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  AdminCustomerRecord,
  CustomerOrder,
  CustomerOrderItem,
  InventoryItemComparison,
  OrderShipment,
  OrderShipmentItem,
  ProcurementRequisition
} from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerInventoryService {
  readonly couriers: string[] = [
    'BlueDart Express',
    'Delhivery Logistics',
    'DTDC Air Express',
    'FedEx Priority',
    'Shadowfax Quick'
  ];

  readonly suppliers: string[] = [
    'Himalaya Herbal Supplies Ltd',
    'Biotique Botanicals Distribution',
    'Dabur Direct Logistics',
    'Patanjali Wholesale Enterprise',
    'The Ordinary Global Imports',
    'Vaseline India Supply Corp'
  ];

  private initialCustomers: AdminCustomerRecord[] = [
    {
      id: '#C1001',
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.com',
      phone: '+91 98765 43210',
      location: 'New Delhi, India',
      shippingAddress: '12, Green Park, Sector 62, Noida, Uttar Pradesh - 201309',
      billingAddress: '12, Green Park, Sector 62, Noida, Uttar Pradesh - 201309',
      avatar: '',
      avatarInitials: 'RS',
      avatarBg: '#dbeafe',
      customerType: 'Retail',
      status: 'Active',
      joinDate: '27 Apr 2025',
      joinTime: '10:24 AM',
      totalOrders: 5,
      totalSpent: 12499,
      recentOrders: [
        {
          orderId: '#ORD-1248',
          date: '27 Apr 2025',
          time: '10:24 AM',
          amount: 2499,
          status: 'Processing',
          paymentMethod: 'UPI / Net Banking',
          paymentStatus: 'Paid',
          shippingAddress: '12, Green Park, Sector 62, Noida, Uttar Pradesh - 201309',
          isExpanded: true,
          deliveryDeadline: 'Tomorrow, 06:00 PM',
          deadlineDaysRemaining: 1, // <= 2 days -> HIGH PRIORITY
          fulfillmentPriority: 'High',
          dispatchStatus: 'Unfulfilled',
          shipments: [],
          items: [
            {
              id: 'item-101',
              name: 'Herbal Shampoo (Neem & Aloe)',
              sku: 'PST-001',
              image: '/images/wellness/neem-bottle-nature.jpg',
              category: 'Personal Care',
              brand: 'Himalaya',
              price: 299,
              quantity: 4,      // Ordered 4 units
              inStock: 3,       // Only 3 in stock -> Deficit of 1 unit!
              warehouseLocation: 'Central Warehouse - Shelf A3',
              pickingLocation: { aisle: 'Aisle 3', rack: 'Rack A', shelf: 'Shelf 3', bin: 'Bin 12' },
              picked: false,
              dispatchedQty: 0,
              procurementStatus: 'None'
            },
            {
              id: 'item-102',
              name: 'Natural Face Wash (Neem & Turmeric)',
              sku: 'PST-002',
              image: '/images/wellness/neem-turmeric.jpg',
              category: 'Skincare',
              brand: 'Biotique',
              price: 199,
              quantity: 2,      // Ordered 2 units
              inStock: 12,      // 12 in stock -> Sufficient
              warehouseLocation: 'Central Warehouse - Shelf B1',
              pickingLocation: { aisle: 'Aisle 1', rack: 'Rack B', shelf: 'Shelf 1', bin: 'Bin 04' },
              picked: false,
              dispatchedQty: 0,
              procurementStatus: 'None'
            },
            {
              id: 'item-103',
              name: 'Pure Aloe Vera Soothing Gel',
              sku: 'PST-003',
              image: '/images/wellness/patanjali-giloy.jpg',
              category: 'Skincare',
              brand: 'Patanjali',
              price: 149,
              quantity: 1,      // Ordered 1 unit
              inStock: 60,      // 60 in stock -> Sufficient
              warehouseLocation: 'North Hub - Bin 22',
              pickingLocation: { aisle: 'Aisle 4', rack: 'Rack C', shelf: 'Shelf 2', bin: 'Bin 22' },
              picked: false,
              dispatchedQty: 0,
              procurementStatus: 'None'
            }
          ]
        },
        {
          orderId: '#ORD-1236',
          date: '20 Apr 2025',
          time: '02:15 PM',
          amount: 1999,
          status: 'Shipped',
          paymentMethod: 'Credit Card',
          paymentStatus: 'Paid',
          shippingAddress: '12, Green Park, Sector 62, Noida, Uttar Pradesh - 201309',
          isExpanded: false,
          deliveryDeadline: '24 Apr 2025',
          deadlineDaysRemaining: 4, // 3-5 days -> MEDIUM PRIORITY
          fulfillmentPriority: 'Medium',
          dispatchStatus: 'Fully Dispatched',
          shipments: [
            {
              id: 'SHP-8012',
              type: 'Full',
              courier: 'BlueDart Express',
              trackingNumber: 'BD-98241029IN',
              dispatchedAt: '21 Apr 2025, 03:00 PM',
              status: 'Delivered',
              notificationSent: true,
              notificationChannel: 'SMS & Email',
              items: [
                { sku: 'PST-008', name: 'Deep Nourish Body Lotion', quantity: 2 },
                { sku: 'PST-009', name: 'Organic Green Tea (Tulsi & Mint)', quantity: 3 }
              ]
            }
          ],
          items: [
            {
              id: 'item-104',
              name: 'Deep Nourish Body Lotion',
              sku: 'PST-008',
              image: '/images/wellness/himalaya-liv52.jpg',
              category: 'Personal Care',
              brand: 'Vaseline',
              price: 349,
              quantity: 2,
              inStock: 80,
              warehouseLocation: 'North Hub - Bin 14',
              pickingLocation: { aisle: 'Aisle 2', rack: 'Rack A', shelf: 'Shelf 4', bin: 'Bin 14' },
              picked: true,
              dispatchedQty: 2,
              procurementStatus: 'None'
            },
            {
              id: 'item-105',
              name: 'Organic Green Tea (Tulsi & Mint)',
              sku: 'PST-009',
              image: '/images/wellness/triphala-capsules.jpg',
              category: 'Health Care',
              brand: 'Tata Tea',
              price: 199,
              quantity: 3,
              inStock: 45,
              warehouseLocation: 'Central Warehouse - Shelf C4',
              pickingLocation: { aisle: 'Aisle 5', rack: 'Rack B', shelf: 'Shelf 1', bin: 'Bin 08' },
              picked: true,
              dispatchedQty: 3,
              procurementStatus: 'None'
            }
          ]
        },
        {
          orderId: '#ORD-1210',
          date: '12 Apr 2025',
          time: '11:45 AM',
          amount: 3499,
          status: 'Delivered',
          paymentMethod: 'Cash on Delivery',
          paymentStatus: 'Paid',
          shippingAddress: '12, Green Park, Sector 62, Noida, Uttar Pradesh - 201309',
          isExpanded: false,
          deliveryDeadline: '16 Apr 2025',
          deadlineDaysRemaining: 7, // > 5 days -> LOW PRIORITY
          fulfillmentPriority: 'Low',
          dispatchStatus: 'Fully Dispatched',
          shipments: [],
          items: [
            {
              id: 'item-106',
              name: 'Herbal Immunity Booster Chyawanprash',
              sku: 'PST-004',
              image: '/images/wellness/dabur-chyawanprash.jpg',
              category: 'Health Care',
              brand: 'Dabur',
              price: 349,
              quantity: 2,
              inStock: 5,
              warehouseLocation: 'Central Warehouse - Shelf D2',
              pickingLocation: { aisle: 'Aisle 3', rack: 'Rack D', shelf: 'Shelf 2', bin: 'Bin 02' },
              picked: true,
              dispatchedQty: 2,
              procurementStatus: 'None'
            }
          ]
        }
      ],
      procurementRequisitions: []
    },
    {
      id: '#C1002',
      name: 'Priya Singh',
      email: 'priya@example.com',
      phone: '+91 98765 12345',
      location: 'Mumbai, Maharashtra',
      shippingAddress: 'Flat 402, Sea Breeze Apts, Bandra West, Mumbai - 400050',
      billingAddress: 'Flat 402, Sea Breeze Apts, Bandra West, Mumbai - 400050',
      avatar: '',
      avatarInitials: 'PS',
      avatarBg: '#fce7f3',
      customerType: 'Retail',
      status: 'Active',
      joinDate: '27 Apr 2025',
      joinTime: '09:17 AM',
      totalOrders: 3,
      totalSpent: 4899,
      recentOrders: [
        {
          orderId: '#ORD-1235',
          date: '27 Apr 2025',
          time: '09:17 AM',
          amount: 1299,
          status: 'Processing',
          paymentMethod: 'UPI',
          paymentStatus: 'Paid',
          shippingAddress: 'Flat 402, Sea Breeze Apts, Bandra West, Mumbai - 400050',
          isExpanded: true,
          deliveryDeadline: 'In 2 days, 02:00 PM',
          deadlineDaysRemaining: 2, // <= 2 days -> HIGH PRIORITY
          fulfillmentPriority: 'High',
          dispatchStatus: 'Unfulfilled',
          shipments: [],
          items: [
            {
              id: 'item-201',
              name: 'Hydrating Moisturizer Cream',
              sku: 'PST-006',
              image: '/images/wellness/tulsi-capsules.jpg',
              category: 'Skincare',
              brand: 'Nivea',
              price: 399,
              quantity: 3,      // Ordered 3 units
              inStock: 0,       // 0 in stock -> Out of stock deficit of 3!
              warehouseLocation: 'West Hub - Bin 08',
              pickingLocation: { aisle: 'Aisle 1', rack: 'Rack C', shelf: 'Shelf 1', bin: 'Bin 08' },
              picked: false,
              dispatchedQty: 0,
              procurementStatus: 'None'
            },
            {
              id: 'item-202',
              name: 'Vitamin C Brightening Serum',
              sku: 'PST-007',
              image: '/images/wellness/amla-capsules.jpg',
              category: 'Skincare',
              brand: 'The Ordinary',
              price: 799,
              quantity: 1,
              inStock: 15,
              warehouseLocation: 'West Hub - Bin 10',
              pickingLocation: { aisle: 'Aisle 2', rack: 'Rack B', shelf: 'Shelf 2', bin: 'Bin 10' },
              picked: false,
              dispatchedQty: 0,
              procurementStatus: 'None'
            }
          ]
        }
      ],
      procurementRequisitions: []
    },
    {
      id: '#C1003',
      name: 'Amit Verma',
      email: 'amit@example.com',
      phone: '+91 87654 32109',
      location: 'Jaipur, Rajasthan',
      shippingAddress: 'House 88, Civil Lines, Jaipur, Rajasthan - 302006',
      billingAddress: 'House 88, Civil Lines, Jaipur, Rajasthan - 302006',
      avatar: '',
      avatarInitials: 'AV',
      avatarBg: '#ede9fe',
      customerType: 'Wholesale',
      status: 'Active',
      joinDate: '26 Apr 2025',
      joinTime: '06:42 PM',
      totalOrders: 14,
      totalSpent: 48950,
      recentOrders: [
        {
          orderId: '#ORD-1236-W',
          date: '26 Apr 2025',
          time: '06:42 PM',
          amount: 4899,
          status: 'Processing',
          paymentMethod: 'Bank Transfer',
          paymentStatus: 'Paid',
          shippingAddress: 'House 88, Civil Lines, Jaipur, Rajasthan - 302006',
          isExpanded: true,
          deliveryDeadline: 'In 4 days, 11:00 AM',
          deadlineDaysRemaining: 4, // 3-5 days -> MEDIUM PRIORITY
          fulfillmentPriority: 'Medium',
          dispatchStatus: 'Unfulfilled',
          shipments: [],
          items: [
            {
              id: 'item-301',
              name: 'Immunity Booster Special Pack',
              sku: 'PST-004',
              image: '/images/wellness/dabur-chyawanprash.jpg',
              category: 'Health Care',
              brand: 'Dabur',
              price: 349,
              quantity: 8,      // Ordered 8 units
              inStock: 5,       // Only 5 in stock -> Deficit of 3 units!
              warehouseLocation: 'Central Warehouse - Shelf D2',
              pickingLocation: { aisle: 'Aisle 3', rack: 'Rack D', shelf: 'Shelf 2', bin: 'Bin 02' },
              picked: false,
              dispatchedQty: 0,
              procurementStatus: 'None'
            },
            {
              id: 'item-302',
              name: 'Herbal Multivitamin 60s',
              sku: 'PST-005',
              image: '/images/wellness/ashwagandha.jpg',
              category: 'Health Care',
              brand: 'Himalaya',
              price: 499,
              quantity: 5,
              inStock: 30,
              warehouseLocation: 'Central Warehouse - Shelf E1',
              pickingLocation: { aisle: 'Aisle 3', rack: 'Rack E', shelf: 'Shelf 1', bin: 'Bin 05' },
              picked: false,
              dispatchedQty: 0,
              procurementStatus: 'None'
            }
          ]
        }
      ],
      procurementRequisitions: []
    },
    {
      id: '#C1004',
      name: 'Neha Kapoor',
      email: 'neha@example.com',
      phone: '+91 76543 21098',
      location: 'Chandigarh, Punjab',
      shippingAddress: 'Plot 24, Sector 9, Chandigarh - 160009',
      billingAddress: 'Plot 24, Sector 9, Chandigarh - 160009',
      avatar: '',
      avatarInitials: 'NK',
      avatarBg: '#fef3c7',
      customerType: 'Retail',
      status: 'Active',
      joinDate: '26 Apr 2025',
      joinTime: '04:21 PM',
      totalOrders: 2,
      totalSpent: 1598,
      recentOrders: [
        {
          orderId: '#ORD-1237',
          date: '26 Apr 2025',
          time: '04:21 PM',
          amount: 799,
          status: 'Processing',
          paymentMethod: 'UPI',
          paymentStatus: 'Paid',
          shippingAddress: 'Plot 24, Sector 9, Chandigarh - 160009',
          isExpanded: false,
          deliveryDeadline: 'In 6 days',
          deadlineDaysRemaining: 6, // > 5 days -> LOW PRIORITY
          fulfillmentPriority: 'Low',
          dispatchStatus: 'Unfulfilled',
          shipments: [],
          items: [
            {
              id: 'item-401',
              name: 'Vitamin C Brightening Serum',
              sku: 'PST-007',
              image: '/images/wellness/amla-capsules.jpg',
              category: 'Skincare',
              brand: 'The Ordinary',
              price: 799,
              quantity: 1,
              inStock: 15,
              warehouseLocation: 'West Hub - Bin 10',
              pickingLocation: { aisle: 'Aisle 2', rack: 'Rack B', shelf: 'Shelf 2', bin: 'Bin 10' },
              picked: false,
              dispatchedQty: 0,
              procurementStatus: 'None'
            }
          ]
        }
      ],
      procurementRequisitions: []
    },
    {
      id: '#C1005',
      name: 'Suresh Yadav',
      email: 'suresh@example.com',
      phone: '+91 91234 56789',
      location: 'Bengaluru, Karnataka',
      shippingAddress: 'No. 51, 14th Main, HSR Layout Sector 4, Bengaluru - 560102',
      billingAddress: 'No. 51, 14th Main, HSR Layout Sector 4, Bengaluru - 560102',
      avatar: '',
      avatarInitials: 'SY',
      avatarBg: '#fee2e2',
      customerType: 'Retail',
      status: 'Inactive',
      joinDate: '25 Apr 2025',
      joinTime: '01:56 PM',
      totalOrders: 1,
      totalSpent: 3499,
      recentOrders: [
        {
          orderId: '#ORD-1238',
          date: '26 Apr 2025',
          time: '01:56 PM',
          amount: 3499,
          status: 'Cancelled',
          paymentMethod: 'COD',
          paymentStatus: 'Refunded',
          shippingAddress: 'No. 51, 14th Main, HSR Layout Sector 4, Bengaluru - 560102',
          isExpanded: false,
          deliveryDeadline: 'Cancelled',
          deadlineDaysRemaining: 99,
          fulfillmentPriority: 'Low',
          dispatchStatus: 'Unfulfilled',
          shipments: [],
          items: []
        }
      ],
      procurementRequisitions: []
    },
    {
      id: '#C1006',
      name: 'Ritika Mehta',
      email: 'ritika@example.com',
      phone: '+91 99887 66554',
      location: 'Kolkata, West Bengal',
      shippingAddress: '15/2, Park Street, Kolkata - 700016',
      billingAddress: '15/2, Park Street, Kolkata - 700016',
      avatar: '',
      avatarInitials: 'RM',
      avatarBg: '#ffedd5',
      customerType: 'Business',
      status: 'Active',
      joinDate: '25 Apr 2025',
      joinTime: '11:32 AM',
      totalOrders: 8,
      totalSpent: 24650,
      recentOrders: [
        {
          orderId: '#ORD-1239',
          date: '25 Apr 2025',
          time: '11:32 AM',
          amount: 1999,
          status: 'Shipped',
          paymentMethod: 'Credit Card',
          paymentStatus: 'Paid',
          shippingAddress: '15/2, Park Street, Kolkata - 700016',
          isExpanded: false,
          deliveryDeadline: 'In 3 days',
          deadlineDaysRemaining: 3, // 3-5 days -> MEDIUM PRIORITY
          fulfillmentPriority: 'Medium',
          dispatchStatus: 'Fully Dispatched',
          shipments: [],
          items: [
            {
              id: 'item-601',
              name: 'Herbal Shampoo',
              sku: 'PST-001',
              image: '/images/wellness/neem-bottle-nature.jpg',
              category: 'Personal Care',
              brand: 'Himalaya',
              price: 299,
              quantity: 2,
              inStock: 3,
              warehouseLocation: 'Central Warehouse - Shelf A3',
              pickingLocation: { aisle: 'Aisle 3', rack: 'Rack A', shelf: 'Shelf 3', bin: 'Bin 12' },
              picked: true,
              dispatchedQty: 2,
              procurementStatus: 'None'
            }
          ]
        }
      ],
      procurementRequisitions: []
    }
  ];

  private customersSubject = new BehaviorSubject<AdminCustomerRecord[]>(this.initialCustomers);
  customers$: Observable<AdminCustomerRecord[]> = this.customersSubject.asObservable();

  getCustomers(): AdminCustomerRecord[] {
    return this.customersSubject.getValue();
  }

  getCustomerById(id: string): AdminCustomerRecord | undefined {
    return this.getCustomers().find(c => c.id === id);
  }

  updateCustomer(updated: AdminCustomerRecord): void {
    const list = this.getCustomers().map(c => c.id === updated.id ? { ...updated } : c);
    this.customersSubject.next(list);
  }

  /**
   * Evaluates inventory comparisons for a given customer or order
   */
  getInventoryComparison(order: CustomerOrder): InventoryItemComparison[] {
    if (!order || !order.items) return [];

    return order.items.map(item => {
      const orderedQty = item.quantity || 0;
      const inStock = item.inStock || 0;
      const deficit = Math.max(0, orderedQty - inStock);
      
      let status: 'sufficient' | 'deficit' | 'out_of_stock' = 'sufficient';
      if (inStock === 0 && orderedQty > 0) {
        status = 'out_of_stock';
      } else if (deficit > 0) {
        status = 'deficit';
      }

      const fulfillmentPct = orderedQty > 0 ? Math.min(100, Math.round((inStock / orderedQty) * 100)) : 100;

      return {
        item,
        orderId: order.orderId,
        orderedQty,
        inStock,
        deficit,
        status,
        fulfillmentPct
      };
    });
  }

  /**
   * Calculate priority category based on delivery deadline days:
   * High: <= 2 days
   * Medium: 3 - 5 days
   * Low: > 5 days
   */
  calculateDeadlinePriority(daysRemaining: number): 'High' | 'Medium' | 'Low' {
    if (daysRemaining <= 2) return 'High';
    if (daysRemaining <= 5) return 'Medium';
    return 'Low';
  }

  /**
   * Sort customer orders by urgency (Nearest Delivery Deadline first, then High -> Medium -> Low)
   */
  getPrioritizedOrders(customer: AdminCustomerRecord): CustomerOrder[] {
    if (!customer || !customer.recentOrders) return [];
    
    return [...customer.recentOrders].sort((a, b) => {
      const daysA = a.deadlineDaysRemaining ?? 99;
      const daysB = b.deadlineDaysRemaining ?? 99;
      return daysA - daysB;
    });
  }

  /**
   * Count how many items in a customer's active orders have inventory shortages
   */
  getCustomerDeficitCount(customer: AdminCustomerRecord): number {
    if (!customer || !customer.recentOrders) return 0;
    let count = 0;
    for (const order of customer.recentOrders) {
      if (order.status !== 'Delivered' && order.status !== 'Cancelled') {
        const comparisons = this.getInventoryComparison(order);
        count += comparisons.filter(c => c.deficit > 0).length;
      }
    }
    return count;
  }

  /**
   * Toggle item picked checklist state by picker
   */
  toggleItemPicked(customer: AdminCustomerRecord, orderId: string, itemSku: string): void {
    const updated = { ...customer };
    if (!updated.recentOrders) return;

    for (const ord of updated.recentOrders) {
      if (ord.orderId === orderId && ord.items) {
        for (const itm of ord.items) {
          if (itm.sku === itemSku) {
            itm.picked = !itm.picked;
          }
        }
      }
    }
    this.updateCustomer(updated);
  }

  /**
   * Dispatch Order: Supports Partial Dispatch and Full Dispatch with Courier & Notifications
   */
  dispatchOrder(params: {
    customer: AdminCustomerRecord;
    orderId: string;
    type: 'Full' | 'Partial';
    courier: string;
    sendNotification: boolean;
    notificationChannel?: 'SMS & Email' | 'Email' | 'SMS';
  }): OrderShipment {
    const updatedCustomer = { ...params.customer };
    if (!updatedCustomer.recentOrders) throw new Error('No orders found');

    const order = updatedCustomer.recentOrders.find(o => o.orderId === params.orderId);
    if (!order) throw new Error('Order not found');

    const shipmentId = `SHP-${Math.floor(1000 + Math.random() * 9000)}`;
    const courierCode = params.courier.startsWith('BlueDart') ? 'BD' :
                        params.courier.startsWith('Delhivery') ? 'DL' :
                        params.courier.startsWith('DTDC') ? 'DT' :
                        params.courier.startsWith('FedEx') ? 'FX' : 'SF';
    const trackingNumber = `${courierCode}-${Math.floor(10000000 + Math.random() * 90000000)}IN`;

    const now = new Date();
    const formattedDate = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const shippedItems: OrderShipmentItem[] = [];
    let hasRemainingItems = false;

    for (const itm of order.items) {
      const alreadyShipped = itm.dispatchedQty || 0;
      const unfulfilledQty = Math.max(0, itm.quantity - alreadyShipped);

      if (params.type === 'Full') {
        // Ship all requested
        itm.dispatchedQty = itm.quantity;
        itm.picked = true;
        shippedItems.push({ sku: itm.sku, name: itm.name, quantity: unfulfilledQty });
      } else {
        // Partial Dispatch: Ship available stock immediately!
        const availableToShip = Math.min(unfulfilledQty, itm.inStock);
        if (availableToShip > 0) {
          itm.dispatchedQty = alreadyShipped + availableToShip;
          itm.inStock = Math.max(0, itm.inStock - availableToShip); // consume picked stock
          itm.picked = true;
          shippedItems.push({ sku: itm.sku, name: itm.name, quantity: availableToShip });
        }
        if ((itm.dispatchedQty || 0) < itm.quantity) {
          hasRemainingItems = true;
        }
      }
    }

    // Determine order dispatch status
    if (params.type === 'Full' || !hasRemainingItems) {
      order.dispatchStatus = 'Fully Dispatched';
      order.status = 'Shipped';
    } else {
      order.dispatchStatus = 'Partially Dispatched';
      order.status = 'Processing';
    }

    const channel = params.notificationChannel || 'SMS & Email';
    const notificationPreview = params.sendNotification
      ? `[${channel} Triggered] Hi ${params.customer.name}, your HerbalMart order ${order.orderId} was ${params.type === 'Partial' ? 'partially ' : ''}dispatched via ${params.courier} (Tracking: ${trackingNumber}). ${hasRemainingItems ? 'Remaining items are being expedited.' : 'Delivery is on the way!'}`
      : 'Notification suppressed by admin';

    const newShipment: OrderShipment = {
      id: shipmentId,
      type: params.type,
      courier: params.courier,
      trackingNumber,
      dispatchedAt: formattedDate,
      items: shippedItems,
      status: 'Dispatched',
      notificationSent: params.sendNotification,
      notificationChannel: channel,
      notificationPreview
    };

    if (!order.shipments) {
      order.shipments = [];
    }
    order.shipments.unshift(newShipment);

    this.updateCustomer(updatedCustomer);
    return newShipment;
  }

  /**
   * Dispatches a purchase requisition to procurement
   */
  dispatchToProcurement(params: {
    customer: AdminCustomerRecord;
    orderId: string;
    item: CustomerOrderItem;
    quantity: number;
    supplier: string;
    priority: 'Normal' | 'High' | 'Urgent';
    notes?: string;
  }): ProcurementRequisition {
    const poNumber = `PO-PROC-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedDate = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    const estDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const estDelivery = `${estDate.getDate()} ${estDate.toLocaleString('default', { month: 'short' })} ${estDate.getFullYear()}`;

    const newRequisition: ProcurementRequisition = {
      id: poNumber,
      orderId: params.orderId,
      customerId: params.customer.id,
      customerName: params.customer.name,
      itemSku: params.item.sku,
      itemName: params.item.name,
      requestedQty: params.quantity,
      currentStock: params.item.inStock,
      orderedQty: params.item.quantity,
      supplier: params.supplier,
      priority: params.priority,
      status: 'Dispatched to Supplier',
      createdAt: formattedDate,
      estimatedDelivery: estDelivery,
      notes: params.notes || `Expedited procurement for order ${params.orderId}`
    };

    const updatedCustomer = { ...params.customer };
    if (updatedCustomer.recentOrders) {
      for (const ord of updatedCustomer.recentOrders) {
        if (ord.orderId === params.orderId && ord.items) {
          for (const itm of ord.items) {
            if (itm.sku === params.item.sku) {
              itm.procurementStatus = 'Requested';
              itm.procurementPoNumber = poNumber;
              itm.procurementSupplier = params.supplier;
              itm.procurementQty = params.quantity;
              itm.procurementRequestedAt = formattedDate;
              itm.procurementPriority = params.priority;
            }
          }
        }
      }
    }

    if (!updatedCustomer.procurementRequisitions) {
      updatedCustomer.procurementRequisitions = [];
    }
    updatedCustomer.procurementRequisitions.unshift(newRequisition);

    this.updateCustomer(updatedCustomer);
    return newRequisition;
  }

  /**
   * Simulates procurement delivery & restocks the warehouse
   */
  fulfillProcurementRequisition(customer: AdminCustomerRecord, poId: string): void {
    const updatedCustomer = { ...customer };
    if (!updatedCustomer.procurementRequisitions) return;

    const req = updatedCustomer.procurementRequisitions.find(r => r.id === poId);
    if (!req) return;

    req.status = 'Received & Restocked';

    if (updatedCustomer.recentOrders) {
      for (const ord of updatedCustomer.recentOrders) {
        if (ord.items) {
          for (const itm of ord.items) {
            if (itm.sku === req.itemSku) {
              itm.inStock += req.requestedQty;
              itm.procurementStatus = 'Received';
            }
          }
        }
      }
    }

    this.updateCustomer(updatedCustomer);
  }
}
