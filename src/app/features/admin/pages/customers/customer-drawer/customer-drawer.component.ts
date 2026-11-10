import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AdminCustomerRecord,
  CustomerOrder,
  CustomerOrderItem,
  InventoryItemComparison,
  OrderShipment,
  ProcurementRequisition
} from '../models/customer.model';
import { CustomerInventoryService } from '../services/customer-inventory.service';

@Component({
  selector: 'app-customer-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-drawer.component.html',
  styleUrl: './customer-drawer.component.scss'
})
export class CustomerDrawerComponent implements OnInit, OnChanges {
  @Input() customer: AdminCustomerRecord | null = null;
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() customerChanged = new EventEmitter<AdminCustomerRecord>();

  // Drawer Width Mode: 'standard' (540px) or 'wide' (900px)
  drawerWidthMode: 'standard' | 'wide' = 'standard';

  // Active view section
  activeSection: 'fulfillment' | 'inventory' | 'orders' | 'profile' | 'procurement' = 'fulfillment';

  // Fulfillment Priority Filter
  fulfillmentPriorityFilter: 'All' | 'High' | 'Medium' | 'Low' = 'All';

  // Selected order for deep inventory comparison
  selectedOrderId: string = '';

  // Procurement Modal State
  isProcureModalOpen: boolean = false;
  procuringItem: CustomerOrderItem | null = null;
  procuringOrderId: string = '';
  procureQuantity: number = 1;
  selectedSupplier: string = '';
  procurePriority: 'Normal' | 'High' | 'Urgent' = 'Urgent';
  procureNotes: string = '';
  procureDeliveryDate: string = '';

  // Dispatch / Courier Modal State
  isDispatchModalOpen: boolean = false;
  dispatchOrderTarget: CustomerOrder | null = null;
  dispatchType: 'Full' | 'Partial' = 'Full';
  selectedCourier: string = '';
  generatedTrackingNumber: string = '';
  sendNotificationToCustomer: boolean = true;
  notificationChannel: 'SMS & Email' | 'Email' | 'SMS' = 'SMS & Email';

  // Toast notification
  toastMessage: string | null = null;
  toastType: 'success' | 'info' | 'warning' = 'success';
  private toastTimer: any;

  constructor(
    public customerService: CustomerInventoryService,
    private router: Router
  ) {}

  navigateToOrdersModule(orderId?: string): void {
    if (!this.customer) return;
    this.router.navigate(['/admin/orders'], {
      queryParams: {
        customerId: this.customer.id,
        orderId: orderId || undefined
      }
    });
  }

  ngOnInit(): void {
    this.initSelectedOrder();
    this.selectedCourier = this.customerService.couriers[0];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customer'] && this.customer) {
      this.initSelectedOrder();
    }
  }

  private initSelectedOrder(): void {
    if (this.customer && this.customer.recentOrders && this.customer.recentOrders.length > 0) {
      // Prioritize order with nearest deadline or deficit
      const prioritized = this.customerService.getPrioritizedOrders(this.customer);
      this.selectedOrderId = prioritized[0].orderId;
    }
  }

  // Active Selected Order
  get currentOrder(): CustomerOrder | undefined {
    if (!this.customer || !this.customer.recentOrders) return undefined;
    return this.customer.recentOrders.find(o => o.orderId === this.selectedOrderId) || this.customer.recentOrders[0];
  }

  // Inventory Comparisons for currently selected order
  get currentOrderComparisons(): InventoryItemComparison[] {
    if (!this.currentOrder) return [];
    return this.customerService.getInventoryComparison(this.currentOrder);
  }

  get currentOrderDeficitCount(): number {
    return this.currentOrderComparisons.filter(c => c.deficit > 0).length;
  }

  get allDeficitCount(): number {
    if (!this.customer) return 0;
    return this.customerService.getCustomerDeficitCount(this.customer);
  }

  // Prioritized Orders for Fulfillment Tab
  get prioritizedFulfillmentOrders(): CustomerOrder[] {
    if (!this.customer) return [];
    let orders = this.customerService.getPrioritizedOrders(this.customer);
    if (this.fulfillmentPriorityFilter !== 'All') {
      orders = orders.filter(o => o.fulfillmentPriority === this.fulfillmentPriorityFilter);
    }
    return orders;
  }

  get highPriorityCount(): number {
    return this.customer?.recentOrders?.filter(o => o.fulfillmentPriority === 'High').length || 0;
  }

  get mediumPriorityCount(): number {
    return this.customer?.recentOrders?.filter(o => o.fulfillmentPriority === 'Medium').length || 0;
  }

  get lowPriorityCount(): number {
    return this.customer?.recentOrders?.filter(o => o.fulfillmentPriority === 'Low').length || 0;
  }

  toggleDrawerWidth(): void {
    this.drawerWidthMode = this.drawerWidthMode === 'standard' ? 'wide' : 'standard';
  }

  closeDrawer(): void {
    this.close.emit();
  }

  toggleOrderAccordion(order: CustomerOrder): void {
    order.isExpanded = !order.isExpanded;
  }

  expandAllOrders(): void {
    if (this.customer?.recentOrders) {
      this.customer.recentOrders.forEach(o => o.isExpanded = true);
    }
  }

  collapseAllOrders(): void {
    if (this.customer?.recentOrders) {
      this.customer.recentOrders.forEach(o => o.isExpanded = false);
    }
  }

  // Picker Checklist Toggle
  toggleItemPickerCheck(order: CustomerOrder, item: CustomerOrderItem, event?: Event): void {
    if (event) event.stopPropagation();
    if (!this.customer) return;

    this.customerService.toggleItemPicked(this.customer, order.orderId, item.sku);
    const updated = this.customerService.getCustomerById(this.customer.id);
    if (updated) {
      this.customer = updated;
      this.customerChanged.emit(updated);
    }
  }

  // Open Dispatch Modal (Full or Partial)
  openDispatchModal(order: CustomerOrder, type: 'Full' | 'Partial', event?: Event): void {
    if (event) event.stopPropagation();

    this.dispatchOrderTarget = order;
    this.dispatchType = type;
    this.selectedCourier = this.customerService.couriers[0];
    this.sendNotificationToCustomer = true;
    this.notificationChannel = 'SMS & Email';

    const courierCode = this.selectedCourier.startsWith('BlueDart') ? 'BD' :
                        this.selectedCourier.startsWith('Delhivery') ? 'DL' :
                        this.selectedCourier.startsWith('DTDC') ? 'DT' :
                        this.selectedCourier.startsWith('FedEx') ? 'FX' : 'SF';
    this.generatedTrackingNumber = `${courierCode}-${Math.floor(10000000 + Math.random() * 90000000)}IN`;

    this.isDispatchModalOpen = true;
  }

  closeDispatchModal(): void {
    this.isDispatchModalOpen = false;
    this.dispatchOrderTarget = null;
  }

  onCourierChange(): void {
    const courierCode = this.selectedCourier.startsWith('BlueDart') ? 'BD' :
                        this.selectedCourier.startsWith('Delhivery') ? 'DL' :
                        this.selectedCourier.startsWith('DTDC') ? 'DT' :
                        this.selectedCourier.startsWith('FedEx') ? 'FX' : 'SF';
    this.generatedTrackingNumber = `${courierCode}-${Math.floor(10000000 + Math.random() * 90000000)}IN`;
  }

  confirmDispatch(): void {
    if (!this.customer || !this.dispatchOrderTarget) return;

    const shipment = this.customerService.dispatchOrder({
      customer: this.customer,
      orderId: this.dispatchOrderTarget.orderId,
      type: this.dispatchType,
      courier: this.selectedCourier,
      sendNotification: this.sendNotificationToCustomer,
      notificationChannel: this.notificationChannel
    });

    const updated = this.customerService.getCustomerById(this.customer.id);
    if (updated) {
      this.customer = updated;
      this.customerChanged.emit(updated);
    }

    const typeLabel = this.dispatchType === 'Partial' ? 'Partial shipment' : 'Full order';
    this.showToast(
      `${typeLabel} dispatched via ${shipment.courier} (AWB: ${shipment.trackingNumber})! ${shipment.notificationSent ? 'Customer SMS & Email notification sent.' : ''}`,
      'success'
    );

    this.closeDispatchModal();
  }

  // Open Procurement Requisition Modal
  openProcurementModal(item: CustomerOrderItem, orderId: string, event?: Event): void {
    if (event) event.stopPropagation();

    this.procuringItem = item;
    this.procuringOrderId = orderId;
    
    const deficit = Math.max(1, (item.quantity || 1) - (item.inStock || 0));
    this.procureQuantity = deficit;

    this.selectedSupplier = this.customerService.suppliers[0];
    this.procurePriority = 'Urgent';
    this.procureNotes = `Urgent stock replenishment for Customer Order ${orderId} (${this.customer?.name}). Missing ${deficit} unit(s).`;
    
    const delivery = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    this.procureDeliveryDate = delivery.toISOString().split('T')[0];

    this.isProcureModalOpen = true;
  }

  closeProcurementModal(): void {
    this.isProcureModalOpen = false;
    this.procuringItem = null;
  }

  confirmProcurement(): void {
    if (!this.customer || !this.procuringItem) return;

    const requisition = this.customerService.dispatchToProcurement({
      customer: this.customer,
      orderId: this.procuringOrderId,
      item: this.procuringItem,
      quantity: this.procureQuantity,
      supplier: this.selectedSupplier,
      priority: this.procurePriority,
      notes: this.procureNotes
    });

    const updated = this.customerService.getCustomerById(this.customer.id);
    if (updated) {
      this.customer = updated;
      this.customerChanged.emit(updated);
    }

    this.showToast(
      `Requisition ${requisition.id} successfully dispatched to ${requisition.supplier} for ${requisition.requestedQty} unit(s)!`,
      'success'
    );

    this.closeProcurementModal();
  }

  // Send all missing deficit items to procurement at once
  sendAllDeficitsToProcurement(): void {
    if (!this.customer || !this.currentOrder) return;

    const deficitComparisons = this.currentOrderComparisons.filter(c => c.deficit > 0 && c.item.procurementStatus !== 'Requested');
    if (deficitComparisons.length === 0) {
      this.showToast('No unprocured deficit items found in this order.', 'info');
      return;
    }

    let dispatchedCount = 0;
    for (const comp of deficitComparisons) {
      this.customerService.dispatchToProcurement({
        customer: this.customer,
        orderId: comp.orderId,
        item: comp.item,
        quantity: comp.deficit,
        supplier: this.customerService.suppliers[0],
        priority: 'Urgent',
        notes: `Bulk procurement for ${comp.orderId} deficit fulfillment`
      });
      dispatchedCount++;
    }

    const updated = this.customerService.getCustomerById(this.customer.id);
    if (updated) {
      this.customer = updated;
      this.customerChanged.emit(updated);
    }

    this.showToast(
      `Dispatched ${dispatchedCount} procurement purchase order(s) for missing units!`,
      'success'
    );
  }

  // Simulate shipment delivery & restock
  markRequisitionReceived(req: ProcurementRequisition): void {
    if (!this.customer) return;

    this.customerService.fulfillProcurementRequisition(this.customer, req.id);
    const updated = this.customerService.getCustomerById(this.customer.id);
    if (updated) {
      this.customer = updated;
      this.customerChanged.emit(updated);
    }

    this.showToast(
      `Stock replenished! Added ${req.requestedQty} unit(s) of ${req.itemName} to inventory. Deficit resolved!`,
      'success'
    );
  }

  // Quick actions
  sendEmail(): void {
    if (!this.customer) return;
    window.location.href = `mailto:${this.customer.email}?subject=Regarding your HerbalMart order ${this.selectedOrderId || ''}`;
  }

  callPhone(): void {
    if (!this.customer) return;
    window.location.href = `tel:${this.customer.phone}`;
  }

  getDispatchStatusClass(status?: string): string {
    if (!status) return 'dsp-unfulfilled';
    return 'dsp-' + status.toLowerCase().replace(/\s+/g, '-');
  }

  showToast(message: string, type: 'success' | 'info' | 'warning' = 'success'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastType = type;
    this.toastTimer = setTimeout(() => {
      this.toastMessage = null;
    }, 4500);
  }
}
