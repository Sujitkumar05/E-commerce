import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  AdminOrder,
  OrderStatus,
  PaymentStatus,
  ProcurementStatus,
  ShipmentStatus,
  ReturnStatus,
  RefundStatus,
  OrderItem,
  OrderMetrics,
  canTransitionOrder,
  VALID_ORDER_TRANSITIONS
} from '../../models/order.model';
import { AdminOrderService } from '../../services/admin-order.service';

export type OrderTabKey =
  | 'all'
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'procurement'
  | 'ready_to_ship'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'returns'
  | 'refunds';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class AdminOrders implements OnInit, OnDestroy {
  // Tabs
  activeTab: OrderTabKey = 'all';

  // Filters & Search
  searchTerm: string = '';
  paymentStatusFilter: string = 'All';
  procurementStatusFilter: string = 'All';
  shipmentStatusFilter: string = 'All';
  dateRangeFilter: string = 'All Time';
  customerFilterId: string | null = null;
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' = 'date_desc';

  // Selection & Drawer
  selectAll: boolean = false;
  selectedOrder: AdminOrder | null = null;
  drawerOpen: boolean = true;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 8;

  // All orders from reactive service
  allOrders: AdminOrder[] = [];
  metrics!: OrderMetrics;

  // Modals state
  // 1. Shipment Modal
  isShipmentModalOpen: boolean = false;
  shipmentCourier: string = 'BlueDart Express';
  shipmentType: 'Full' | 'Partial' = 'Full';
  shipmentTrackingNumber: string = '';
  shipmentNotes: string = '';
  shipmentSelectedItems: { sku: string; name: string; quantity: number }[] = [];

  // 2. Procurement Modal
  isProcureModalOpen: boolean = false;
  procuringItem: OrderItem | null = null;
  procureQty: number = 1;
  procureSupplier: string = 'Himalaya Herbal Supplies Ltd';
  procurePriority: 'Normal' | 'High' | 'Urgent' = 'Urgent';
  procureNotes: string = '';

  // 3. Return Modal
  isReturnModalOpen: boolean = false;
  returnReason: string = 'Damaged product during transit';
  returnItemsSelection: { sku: string; name: string; quantity: number; reason: string }[] = [];

  // 4. Return Inspection Modal
  isInspectModalOpen: boolean = false;
  inspectionCondition: 'Unopened' | 'Opened - Intact' | 'Damaged' | 'Defective' = 'Opened - Intact';
  restockUsableItems: boolean = true;
  inspectionNotes: string = 'Items checked by returns officer and found eligible for refund';

  // 5. Refund Modal
  isRefundModalOpen: boolean = false;
  refundAmountToPay: number = 0;
  refundMethod: string = 'UPI / Net Banking';
  refundTxnRef: string = '';

  // Toast feedback
  toastMessage: string | null = null;
  toastType: 'success' | 'info' | 'warning' | 'error' = 'success';
  private toastTimer: any = null;

  private routeSub?: Subscription;
  private ordersSub?: Subscription;

  readonly courierOptions = [
    'BlueDart Express',
    'Delhivery Logistics',
    'DTDC Air Express',
    'FedEx Priority',
    'Shadowfax Quick'
  ];

  readonly supplierOptions = [
    'Himalaya Herbal Supplies Ltd',
    'Biotique Botanicals Distribution',
    'Dabur Direct Logistics',
    'Patanjali Wholesale Enterprise',
    'The Ordinary Global Imports',
    'Vaseline India Supply Corp'
  ];

  constructor(
    public orderService: AdminOrderService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Subscribe to order updates from central service
    this.ordersSub = this.orderService.orders$.subscribe(orders => {
      this.allOrders = orders;
      this.metrics = this.orderService.getOrderMetrics();

      if (this.selectedOrder) {
        // Keep active selected order updated
        const updated = orders.find(o => o.id === this.selectedOrder?.id);
        if (updated) {
          this.selectedOrder = updated;
        } else if (orders.length > 0) {
          this.selectedOrder = orders[0];
        }
      } else if (orders.length > 0) {
        this.selectedOrder = orders[0];
      }
    });

    // Check query params for customer pre-filtering
    this.routeSub = this.route.queryParams.subscribe(params => {
      if (params['customerId']) {
        this.customerFilterId = params['customerId'];
      }
      if (params['tab'] && this.isValidTab(params['tab'])) {
        this.activeTab = params['tab'] as OrderTabKey;
      }
      if (params['orderId']) {
        const found = this.allOrders.find(o => o.id === params['orderId']);
        if (found) {
          this.selectOrder(found);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.ordersSub?.unsubscribe();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  private isValidTab(tab: string): boolean {
    const validTabs: OrderTabKey[] = [
      'all', 'pending', 'confirmed', 'processing', 'procurement',
      'ready_to_ship', 'shipped', 'in_transit', 'delivered', 'cancelled', 'returns', 'refunds'
    ];
    return validTabs.includes(tab as OrderTabKey);
  }

  // Filtered orders pipeline
  get filteredOrders(): AdminOrder[] {
    let list = this.allOrders.filter(order => {
      // 1. Customer specific filter from route
      if (this.customerFilterId && order.customerId !== this.customerFilterId) {
        return false;
      }

      // 2. Search
      const search = this.searchTerm.trim().toLowerCase();
      if (search) {
        const matchesId = order.id.toLowerCase().includes(search);
        const matchesCustId = order.customerId.toLowerCase().includes(search);
        const matchesName = order.customerName.toLowerCase().includes(search);
        const matchesEmail = order.customerEmail.toLowerCase().includes(search);
        const matchesItem = order.items.some(i => i.name.toLowerCase().includes(search) || i.sku.toLowerCase().includes(search));
        if (!matchesId && !matchesCustId && !matchesName && !matchesEmail && !matchesItem) {
          return false;
        }
      }

      // 3. Status Tabs
      switch (this.activeTab) {
        case 'pending':
          if (order.orderStatus !== 'Pending') return false;
          break;
        case 'confirmed':
          if (order.orderStatus !== 'Confirmed') return false;
          break;
        case 'processing':
          if (order.orderStatus !== 'Processing') return false;
          break;
        case 'procurement':
          if (order.procurementStatus !== 'Required' && order.procurementStatus !== 'PO_Created' && order.procurementStatus !== 'Partially Received') return false;
          break;
        case 'ready_to_ship':
          if (order.orderStatus !== 'Ready to Ship') return false;
          break;
        case 'shipped':
          if (order.orderStatus !== 'Shipped') return false;
          break;
        case 'in_transit':
          if (order.orderStatus !== 'In Transit') return false;
          break;
        case 'delivered':
          if (order.orderStatus !== 'Delivered') return false;
          break;
        case 'cancelled':
          if (order.orderStatus !== 'Cancelled') return false;
          break;
        case 'returns':
          if (order.returnStatus === 'None') return false;
          break;
        case 'refunds':
          if (order.refundStatus === 'None') return false;
          break;
        case 'all':
        default:
          break;
      }

      // 4. Dropdown Filters
      if (this.paymentStatusFilter !== 'All' && order.paymentStatus !== this.paymentStatusFilter) {
        return false;
      }
      if (this.procurementStatusFilter !== 'All' && order.procurementStatus !== this.procurementStatusFilter) {
        return false;
      }
      if (this.shipmentStatusFilter !== 'All' && order.shipmentStatus !== this.shipmentStatusFilter) {
        return false;
      }

      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (this.sortBy === 'amount_desc') return b.totalAmount - a.totalAmount;
      if (this.sortBy === 'amount_asc') return a.totalAmount - b.totalAmount;
      // Default date sorting
      return b.id.localeCompare(a.id);
    });

    return list;
  }

  get paginatedOrders(): AdminOrder[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredOrders.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.pageSize) || 1;
  }

  get paginationRangeText(): string {
    const total = this.filteredOrders.length;
    if (total === 0) return '0 orders';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, total);
    return `Showing ${start}-${end} of ${total} orders`;
  }

  // Tab navigation
  switchTab(tab: OrderTabKey): void {
    this.activeTab = tab;
    this.currentPage = 1;
  }

  clearCustomerFilter(): void {
    this.customerFilterId = null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { customerId: null },
      queryParamsHandling: 'merge'
    });
  }

  selectOrder(order: AdminOrder): void {
    this.selectedOrder = order;
    this.orderService.setSelectedOrder(order);
    this.router.navigate(['/admin/orders', order.id]);
  }

  closeDrawer(): void {
    this.drawerOpen = false;
  }

  toggleSelectAll(): void {
    this.filteredOrders.forEach(o => o.selected = this.selectAll);
  }

  checkIndividualSelection(): void {
    this.selectAll = this.filteredOrders.length > 0 &&
      this.filteredOrders.every(o => o.selected);
  }

  // --- BUSINESS LIFECYCLE ACTION HANDLERS ---

  canTransitionTo(target: OrderStatus): boolean {
    if (!this.selectedOrder) return false;
    return canTransitionOrder(this.selectedOrder.orderStatus, target);
  }

  confirmOrder(order?: AdminOrder): void {
    const target = order || this.selectedOrder;
    if (!target) return;

    const res = this.orderService.confirmOrder(target.id, 'Admin');
    if (res.success) {
      this.showToast(res.message, 'success');
    } else {
      this.showToast(res.message, 'error');
    }
  }

  startProcessing(order?: AdminOrder): void {
    const target = order || this.selectedOrder;
    if (!target) return;

    const res = this.orderService.transitionOrderStatus(target.id, 'Processing', 'Admin', 'Started warehouse picking');
    if (res.success) {
      this.showToast(res.message, 'success');
    } else {
      this.showToast(res.message, 'error');
    }
  }

  markReadyToShip(order?: AdminOrder): void {
    const target = order || this.selectedOrder;
    if (!target) return;

    const res = this.orderService.transitionOrderStatus(target.id, 'Ready to Ship', 'Warehouse Supervisor', 'All items picked and packed');
    if (res.success) {
      this.showToast(res.message, 'success');
    } else {
      this.showToast(res.message, 'warning');
    }
  }

  markInTransit(order?: AdminOrder): void {
    const target = order || this.selectedOrder;
    if (!target) return;

    const shipmentId = target.shipments?.[0]?.id;
    if (!shipmentId) {
      this.showToast('No active shipment found to update tracking.', 'warning');
      return;
    }

    const res = this.orderService.updateShipmentTracking(
      target.id,
      shipmentId,
      'In Transit',
      'Regional Sorting Hub',
      'In transit to delivery destination'
    );
    if (res.success) {
      this.showToast(res.message, 'success');
    }
  }

  confirmDelivered(order?: AdminOrder): void {
    const target = order || this.selectedOrder;
    if (!target) return;

    const shipmentId = target.shipments?.[0]?.id;
    if (!shipmentId) {
      // Direct transition with timeline verification
      const res = this.orderService.transitionOrderStatus(target.id, 'Delivered', 'Admin (Manual Proof)', 'Confirmed by delivery executive receipt');
      if (res.success) {
        this.showToast(res.message, 'success');
      } else {
        this.showToast(res.message, 'error');
      }
      return;
    }

    const res = this.orderService.updateShipmentTracking(
      target.id,
      shipmentId,
      'Delivered',
      target.shippingAddress,
      'Package handed over and recipient signature verified'
    );
    if (res.success) {
      this.showToast(res.message, 'success');
    }
  }

  cancelOrder(order?: AdminOrder): void {
    const target = order || this.selectedOrder;
    if (!target) return;

    const reason = prompt('Reason for cancelling order:', 'Buyer requested cancellation prior to dispatch');
    if (reason === null) return; // User cancelled prompt

    const res = this.orderService.cancelOrder(target.id, 'Admin', reason || 'Administrative Cancellation');
    if (res.success) {
      this.showToast(res.message, 'success');
    } else {
      this.showToast(res.message, 'error');
    }
  }

  toggleItemPicked(item: OrderItem): void {
    if (!this.selectedOrder) return;
    const res = this.orderService.toggleItemPicked(this.selectedOrder.id, item.id);
    if (res.allPicked) {
      this.showToast('All items in order have been picked and verified!', 'info');
    }
  }

  // --- SHIPMENT MODAL HANDLERS ---
  openShipmentModal(order: AdminOrder): void {
    this.selectedOrder = order;
    this.shipmentCourier = this.courierOptions[0];
    this.shipmentType = 'Full';
    this.shipmentTrackingNumber = `BD-${Math.floor(10000000 + Math.random() * 90000000)}IN`;
    this.shipmentNotes = '';
    this.shipmentSelectedItems = order.items.map(i => ({
      sku: i.sku,
      name: i.name,
      quantity: Math.max(1, i.quantity - (i.dispatchedQty || 0))
    }));
    this.isShipmentModalOpen = true;
  }

  onCourierChange(): void {
    const prefix = this.shipmentCourier.slice(0, 2).toUpperCase();
    this.shipmentTrackingNumber = `${prefix}-${Math.floor(10000000 + Math.random() * 90000000)}IN`;
  }

  submitShipment(): void {
    if (!this.selectedOrder) return;

    const res = this.orderService.createShipment(this.selectedOrder.id, {
      courier: this.shipmentCourier,
      type: this.shipmentType,
      trackingNumber: this.shipmentTrackingNumber,
      items: this.shipmentSelectedItems,
      notes: this.shipmentNotes
    });

    if (res.success) {
      this.showToast(res.message, 'success');
      this.isShipmentModalOpen = false;
    } else {
      this.showToast(res.message, 'error');
    }
  }

  // --- PROCUREMENT MODAL HANDLERS ---
  openProcurementModal(item: OrderItem): void {
    if (!this.selectedOrder) return;
    this.procuringItem = item;
    this.procureQty = Math.max(1, item.quantity - item.inStock);
    this.procureSupplier = this.supplierOptions[0];
    this.procurePriority = 'Urgent';
    this.procureNotes = `Restock required for customer order ${this.selectedOrder.id}`;
    this.isProcureModalOpen = true;
  }

  submitProcurementPO(): void {
    if (!this.selectedOrder || !this.procuringItem) return;

    const res = this.orderService.createProcurementPO(
      this.selectedOrder.id,
      this.procuringItem.id,
      this.procureQty,
      this.procureSupplier,
      this.procurePriority,
      this.procureNotes
    );

    if (res.success) {
      this.showToast(res.message, 'success');
      this.isProcureModalOpen = false;
    } else {
      this.showToast(res.message, 'error');
    }
  }

  receiveProcuredStock(item: OrderItem): void {
    if (!this.selectedOrder) return;
    const qty = Math.max(1, item.quantity - item.inStock);

    const res = this.orderService.receiveProcurementStock(this.selectedOrder.id, item.id, qty);
    if (res.success) {
      this.showToast(res.message, 'success');
    }
  }

  // --- RETURN MODAL HANDLERS ---
  openReturnModal(order: AdminOrder): void {
    this.selectedOrder = order;
    this.returnReason = 'Damaged packaging during transit, product unsealed';
    this.returnItemsSelection = order.items.map(i => ({
      sku: i.sku,
      name: i.name,
      quantity: i.quantity,
      reason: 'Damaged item'
    }));
    this.isReturnModalOpen = true;
  }

  submitReturnRequest(): void {
    if (!this.selectedOrder) return;

    const res = this.orderService.requestReturn(
      this.selectedOrder.id,
      this.returnReason,
      this.returnItemsSelection
    );

    if (res.success) {
      this.showToast(res.message, 'success');
      this.isReturnModalOpen = false;
    } else {
      this.showToast(res.message, 'error');
    }
  }

  approveReturn(order?: AdminOrder): void {
    const target = order || this.selectedOrder;
    if (!target) return;

    const res = this.orderService.processReturnDecision(target.id, 'Approve');
    if (res.success) {
      this.showToast(res.message, 'success');
    }
  }

  rejectReturn(order?: AdminOrder): void {
    const target = order || this.selectedOrder;
    if (!target) return;

    const reason = prompt('Reason for return rejection:', 'Item was used or outside 7-day return policy');
    if (reason === null) return;

    const res = this.orderService.processReturnDecision(target.id, 'Reject', reason);
    if (res.success) {
      this.showToast(res.message, 'warning');
    }
  }

  openInspectReturnModal(): void {
    this.isInspectModalOpen = true;
  }

  submitReturnInspection(): void {
    if (!this.selectedOrder) return;

    const res = this.orderService.receiveAndInspectReturn(
      this.selectedOrder.id,
      this.restockUsableItems,
      this.inspectionNotes
    );

    if (res.success) {
      this.showToast(res.message, 'success');
      this.isInspectModalOpen = false;
    }
  }

  // --- REFUND MODAL HANDLERS ---
  openRefundModal(order: AdminOrder): void {
    this.selectedOrder = order;
    this.refundAmountToPay = order.refundRecord?.amount || order.totalAmount;
    this.refundMethod = order.paymentMethod;
    this.refundTxnRef = `BANK-REF-${Math.floor(10000000 + Math.random() * 90000000)}`;
    this.isRefundModalOpen = true;
  }

  submitRefundPayout(): void {
    if (!this.selectedOrder) return;

    const res = this.orderService.processRefund(
      this.selectedOrder.id,
      this.refundAmountToPay,
      this.refundTxnRef
    );

    if (res.success) {
      this.showToast(res.message, 'success');
      this.isRefundModalOpen = false;
    }
  }

  // Navigation helpers
  navigateToCustomer(customerId: string): void {
    this.router.navigate(['/admin/customers'], {
      queryParams: { search: customerId }
    });
  }

  getOrderProgressStep(order: AdminOrder): number {
    switch (order.orderStatus) {
      case 'Pending': return 1;
      case 'Confirmed': return 2;
      case 'Processing': return 3;
      case 'Ready to Ship': return 4;
      case 'Shipped': return 5;
      case 'In Transit': return 6;
      case 'Delivered': return 7;
      case 'Cancelled': return 0;
      default: return 1;
    }
  }

  getCourierTrackingUrl(courier: string, trackingNum: string): string {
    const found = this.orderService.couriers.find(c => c.name === courier);
    return found ? `${found.trackUrlPrefix}${trackingNum}` : `#`;
  }

  // CSV Export
  exportCsv(): void {
    const csvRows = [
      ['Order ID', 'Customer ID', 'Customer Name', 'Email', 'Order Status', 'Payment Status', 'Procurement', 'Shipment', 'Total Amount', 'Date'],
      ...this.filteredOrders.map(o => [
        o.id,
        o.customerId,
        o.customerName,
        o.customerEmail,
        o.orderStatus,
        o.paymentStatus,
        o.procurementStatus,
        o.shipmentStatus,
        `₹${o.totalAmount}`,
        `${o.date} ${o.time}`
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orders_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('Exported CSV of filtered orders successfully!', 'info');
  }

  showToast(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastType = type;
    this.toastTimer = setTimeout(() => {
      this.toastMessage = null;
    }, 4500);
  }
}
