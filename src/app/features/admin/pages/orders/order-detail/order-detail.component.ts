import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminOrder, OrderItem, OrderStatus } from '../../../models/order.model';
import { AdminOrderService } from '../../../services/admin-order.service';

export type DetailTabKey = 'overview' | 'items' | 'shipping' | 'payment' | 'timeline';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class AdminOrderDetail implements OnInit, OnDestroy {
  order: AdminOrder | null = null;
  activeTab: DetailTabKey = 'overview';

  // Modal / Dropdown States
  moreActionsOpen = false;
  isProcureModalOpen = false;
  isRefundModalOpen = false;
  isEditShippingModalOpen = false;
  copiedToast = false;
  toastMessage: string | null = null;

  // Edit Shipping Form Model
  editShippingAddress = '';
  editRecipientName = '';
  editEstimatedDelivery = '29 Apr - 01 May 2025';

  // Procurement Form Model
  procureSupplier = 'Himalaya Herbal Supplies Ltd';
  procureQty = 2;
  procureItem: OrderItem | null = null;

  // Refund Form Model
  refundAmount = 0;
  refundReason = 'Customer Return / Compensation';
  refundTxnRef = '';

  private sub = new Subscription();

  constructor(
    public orderService: AdminOrderService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. Subscribe to route param :id
    this.sub.add(
      this.route.params.subscribe(params => {
        const id = params['id'];
        if (id) {
          this.loadOrder(id);
        } else {
          // Check query params if any
          const qId = this.route.snapshot.queryParamMap.get('orderId');
          if (qId) {
            this.loadOrder(qId);
          } else if (this.orderService.selectedOrder) {
            this.order = this.orderService.selectedOrder;
          } else if (this.orderService.orders.length > 0) {
            this.order = this.orderService.orders[0];
            this.orderService.setSelectedOrder(this.order);
          }
        }
      })
    );

    // 2. Keep reactive in sync with order updates
    this.sub.add(
      this.orderService.selectedOrder$.subscribe(sel => {
        if (sel) {
          this.order = sel;
          this.initEditForms();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  loadOrder(orderId: string): void {
    const found = this.orderService.getOrderById(orderId);
    if (found) {
      this.order = found;
      this.orderService.setSelectedOrder(found);
      this.initEditForms();
    } else if (this.orderService.orders.length > 0) {
      // Fallback gracefully to seed order #ORD-1248
      const fallback = this.orderService.orders.find(o => o.id.includes('1248')) || this.orderService.orders[0];
      this.order = fallback;
      this.orderService.setSelectedOrder(fallback);
      this.initEditForms();
    }
  }

  private initEditForms(): void {
    if (!this.order) return;
    this.editShippingAddress = this.order.shippingAddress;
    this.editRecipientName = this.order.customerName;
    this.refundAmount = this.order.totalAmount;
    this.refundTxnRef = `TXN-REF-${Math.floor(100000 + Math.random() * 900000)}`;

    const deficitItem = this.getDeficitItem();
    if (deficitItem) {
      this.procureItem = deficitItem;
      this.procureQty = Math.max(1, deficitItem.quantity - deficitItem.inStock);
    }
  }

  switchTab(tab: DetailTabKey): void {
    this.activeTab = tab;
  }

  navigateBack(): void {
    this.router.navigate(['/admin/orders']);
  }

  viewCustomerProfile(): void {
    if (!this.order) return;
    this.router.navigate(['/admin/customers'], {
      queryParams: { search: this.order.customerId }
    });
  }

  toggleMoreActions(event?: Event): void {
    if (event) event.stopPropagation();
    this.moreActionsOpen = !this.moreActionsOpen;
  }

  // --- ACTIONS ---

  printInvoice(): void {
    window.print();
  }

  downloadPdf(): void {
    if (!this.order) return;
    const content = `
========================================
           HERBALMART INVOICE
========================================
Order ID:       ${this.order.id}
Order Date:     ${this.order.date}, ${this.order.time}
Status:         ${this.order.orderStatus}
Payment Status: ${this.order.paymentStatus} (${this.order.paymentMethod})

CUSTOMER DETAILS:
Name:           ${this.order.customerName} (${this.order.customerId})
Email:          ${this.order.customerEmail}
Phone:          ${this.order.customerPhone}
Address:        ${this.order.shippingAddress}

ORDER ITEMS:
${this.order.items.map(i => `- ${i.name} [SKU: ${i.sku}] x ${i.quantity} @ ₹${i.price} = ₹${i.price * i.quantity}`).join('\n')}

SUMMARY:
Subtotal:       ₹${this.order.subtotal}
Shipping:       ₹${this.order.shippingCharge}
Discount:       ₹${this.order.discount}
TOTAL AMOUNT:   ₹${this.order.totalAmount}
========================================
Generated on: ${new Date().toLocaleString()}
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${this.order.id.replace('#', '')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.showToast('Invoice downloaded successfully!');
  }

  copyAddress(): void {
    if (!this.order) return;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(this.order.shippingAddress).then(() => {
        this.copiedToast = true;
        setTimeout(() => (this.copiedToast = false), 2200);
      });
    } else {
      this.copiedToast = true;
      setTimeout(() => (this.copiedToast = false), 2200);
    }
  }

  markReadyToShip(): void {
    if (!this.order) return;
    const res = this.orderService.transitionOrderStatus(
      this.order.id,
      'Ready to Ship',
      'Warehouse Supervisor',
      'All items packed and staged for courier handover'
    );
    if (res.success) {
      this.showToast(`Order ${this.order.id} is now Marked Ready to Ship!`);
    } else {
      alert(res.message);
    }
  }

  cancelOrder(): void {
    if (!this.order) return;
    const reason = prompt('Please enter cancellation reason:', 'Customer requested pre-dispatch cancellation');
    if (reason === null) return;
    const res = this.orderService.cancelOrder(this.order.id, 'Admin', reason || 'Admin cancelled');
    if (res.success) {
      this.showToast(`Order ${this.order.id} cancelled. Reserved inventory safely released.`);
    } else {
      alert(res.message);
    }
  }

  openRefundModal(): void {
    this.isRefundModalOpen = true;
    this.moreActionsOpen = false;
  }

  closeRefundModal(): void {
    this.isRefundModalOpen = false;
  }

  submitRefund(): void {
    if (!this.order) return;
    const res = this.orderService.processRefund(this.order.id, this.refundAmount, this.refundTxnRef);
    if (res.success) {
      this.showToast(res.message);
      this.isRefundModalOpen = false;
    }
  }

  openProcurementModal(): void {
    this.isProcureModalOpen = true;
  }

  closeProcurementModal(): void {
    this.isProcureModalOpen = false;
  }

  submitPO(): void {
    if (!this.order) return;
    const item = this.procureItem || this.getDeficitItem() || this.order.items[0];
    const res = this.orderService.createProcurementPO(
      this.order.id,
      item.id,
      this.procureQty,
      this.procureSupplier,
      'Urgent',
      'PO generated from Order Details screen'
    );
    if (res.success) {
      this.showToast(`Procurement PO ${res.poNumber} created for ${item.name}!`);
      this.isProcureModalOpen = false;
    }
  }

  openEditShippingModal(): void {
    this.isEditShippingModalOpen = true;
  }

  closeEditShippingModal(): void {
    this.isEditShippingModalOpen = false;
  }

  saveShipping(): void {
    if (!this.order) return;
    this.order.shippingAddress = this.editShippingAddress;
    this.order.customerName = this.editRecipientName;
    this.isEditShippingModalOpen = false;
    this.showToast('Shipping information updated successfully!');
  }

  getDeficitItem(): OrderItem | null {
    if (!this.order) return null;
    return this.order.items.find(i => i.quantity > i.inStock) || null;
  }

  getCustomerInitial(): string {
    if (!this.order?.customerName) return 'C';
    return this.order.customerName.charAt(0).toUpperCase();
  }

  getStatusClass(status: OrderStatus): string {
    return 'badge-' + status.toLowerCase().replace(/[\s_]+/g, '-');
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => {
      this.toastMessage = null;
    }, 3500);
  }
}

