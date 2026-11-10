import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminOrderService } from './admin-order.service';
import { AdminOrder, OrderItem, ProcurementComment } from '../models/order.model';

export interface CustomerProcurementGroup {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  orders: AdminOrder[];
  totalProductsCount: number; // Sum of quantities
  totalItemsCount: number;    // Number of distinct items
  pendingVerificationCount: number;
}

export interface ProductVerificationState {
  verified: boolean;
  verifiedAt?: string;
  notes?: string;
  uploadedImageUrl?: string;
  uploadedImages?: string[];
  imageIsCorrect?: boolean;
  imageVerified?: boolean;
  sizeConfirmed?: boolean;
  confirmedSize?: string;
  verifiedSku?: string;
  procurementComments?: ProcurementComment[];
}

export interface VerificationProgress {
  verifiedCount: number;
  totalCount: number;
  pendingCount: number;
  percentage: number;
  isFullyVerified: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProcurementService {
  private readonly orderService = inject(AdminOrderService);

  // Local verification records: orderId -> itemId -> state
  private verificationState: Record<string, Record<string, ProductVerificationState>> = {};

  constructor() {
    this.loadVerificationState();
  }

  /**
   * Observable stream of all orders requiring procurement
   */
  public get procurementOrders$(): Observable<AdminOrder[]> {
    return this.orderService.orders$.pipe(
      map(orders => orders.filter(o => 
        (o.procurementStatus === 'Required' || o.procurementStatus === 'PO_Created') &&
        o.orderStatus !== 'Ready to Ship' &&
        o.orderStatus !== 'Shipped' &&
        o.orderStatus !== 'Delivered' &&
        o.orderStatus !== 'Cancelled'
      ))
    );
  }

  /**
   * Observable stream of orders in Ready to Ship status
   */
  public get readyToShipOrders$(): Observable<AdminOrder[]> {
    return this.orderService.orders$.pipe(
      map(orders => orders.filter(o => o.orderStatus === 'Ready to Ship'))
    );
  }

  /**
   * Get synchronous list of procurement orders
   */
  public getProcurementOrders(): AdminOrder[] {
    return this.orderService.orders.filter(o =>
      (o.procurementStatus === 'Required' || o.procurementStatus === 'PO_Created') &&
      o.orderStatus !== 'Ready to Ship' &&
      o.orderStatus !== 'Shipped' &&
      o.orderStatus !== 'Delivered' &&
      o.orderStatus !== 'Cancelled'
    );
  }

  /**
   * Get customer-wise grouped procurement orders
   */
  public getCustomerWiseProcurement(): CustomerProcurementGroup[] {
    const orders = this.getProcurementOrders();
    const groupMap = new Map<string, CustomerProcurementGroup>();

    for (const order of orders) {
      const cId = order.customerId || 'C-GUEST';
      if (!groupMap.has(cId)) {
        groupMap.set(cId, {
          customerId: cId,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          shippingAddress: order.shippingAddress,
          orders: [],
          totalProductsCount: 0,
          totalItemsCount: 0,
          pendingVerificationCount: 0
        });
      }

      const group = groupMap.get(cId)!;
      group.orders.push(order);
      const totalUnits = order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      group.totalProductsCount += totalUnits;
      group.totalItemsCount += order.items.length;

      const progress = this.getOrderVerificationProgress(order.id);
      group.pendingVerificationCount += progress.pendingCount;
    }

    return Array.from(groupMap.values());
  }

  /**
   * Lookup single order by ID
   */
  public getOrderById(orderId: string): AdminOrder | undefined {
    return this.orderService.getOrderById(orderId);
  }

  /**
   * Check if a specific product item is verified
   */
  public isItemVerified(orderId: string, itemId: string): boolean {
    const cleanId = orderId.trim();
    const order = this.orderService.getOrderById(cleanId);
    if (order) {
      const item = order.items.find(i => i.id === itemId);
      if (item && item.verified) {
        return true;
      }
    }
    return !!this.verificationState[cleanId]?.[itemId]?.verified;
  }

  /**
   * Set manual verification checkbox state for an order item
   */
  public setItemVerification(orderId: string, itemId: string, verified: boolean): void {
    const cleanId = orderId.trim();
    if (!this.verificationState[cleanId]) {
      this.verificationState[cleanId] = {};
    }

    const existing = this.verificationState[cleanId][itemId] || { verified: false };
    this.verificationState[cleanId][itemId] = {
      ...existing,
      verified,
      verifiedAt: verified ? new Date().toISOString() : undefined
    };

    // Also sync directly on the order item model
    const order = this.orderService.getOrderById(cleanId);
    if (order) {
      const item = order.items.find(i => i.id === itemId);
      if (item) {
        item.verified = verified;
        item.verifiedAt = verified ? new Date().toISOString() : undefined;
      }
    }

    this.saveVerificationState();
  }

  /**
   * Get full verification state for a specific order item
   */
  public getItemVerificationState(orderId: string, itemId: string): ProductVerificationState {
    const cleanId = orderId.trim();
    const order = this.orderService.getOrderById(cleanId);
    const item = order?.items.find(i => i.id === itemId);

    const saved = this.verificationState[cleanId]?.[itemId] || { verified: false };

    return {
      verified: item?.verified ?? saved.verified ?? false,
      verifiedAt: item?.verifiedAt ?? saved.verifiedAt,
      uploadedImageUrl: item?.uploadedImageUrl ?? saved.uploadedImageUrl,
      uploadedImages: item?.uploadedImages ?? saved.uploadedImages ?? (item?.uploadedImageUrl ? [item.uploadedImageUrl] : saved.uploadedImageUrl ? [saved.uploadedImageUrl] : []),
      imageIsCorrect: item?.imageIsCorrect ?? saved.imageIsCorrect ?? false,
      imageVerified: item?.imageVerified ?? saved.imageVerified ?? false,
      sizeConfirmed: item?.sizeConfirmed ?? saved.sizeConfirmed ?? false,
      confirmedSize: item?.confirmedSize ?? saved.confirmedSize ?? item?.size ?? item?.variant,
      verifiedSku: item?.verifiedSku ?? saved.verifiedSku ?? item?.sku,
      procurementComments: item?.procurementComments ?? saved.procurementComments ?? []
    };
  }

  /**
   * Update verification details (e.g., image upload, size confirmation, SKU confirmation)
   */
  public updateItemVerificationDetails(
    orderId: string,
    itemId: string,
    patch: Partial<ProductVerificationState>
  ): ProductVerificationState {
    const cleanId = orderId.trim();
    if (!this.verificationState[cleanId]) {
      this.verificationState[cleanId] = {};
    }

    const current = this.getItemVerificationState(cleanId, itemId);
    const updated: ProductVerificationState = {
      ...current,
      ...patch
    };

    this.verificationState[cleanId][itemId] = updated;

    // Sync on the order item model
    const order = this.orderService.getOrderById(cleanId);
    if (order) {
      const item = order.items.find(i => i.id === itemId);
      if (item) {
        if (patch.verified !== undefined) item.verified = patch.verified;
        if (patch.verifiedAt !== undefined) item.verifiedAt = patch.verifiedAt;
        if (patch.uploadedImageUrl !== undefined) item.uploadedImageUrl = patch.uploadedImageUrl;
        if (patch.uploadedImages !== undefined) item.uploadedImages = patch.uploadedImages;
        if (patch.imageIsCorrect !== undefined) item.imageIsCorrect = patch.imageIsCorrect;
        if (patch.imageVerified !== undefined) item.imageVerified = patch.imageVerified;
        if (patch.sizeConfirmed !== undefined) item.sizeConfirmed = patch.sizeConfirmed;
        if (patch.confirmedSize !== undefined) item.confirmedSize = patch.confirmedSize;
        if (patch.verifiedSku !== undefined) item.verifiedSku = patch.verifiedSku;
        if (patch.procurementComments !== undefined) item.procurementComments = patch.procurementComments;
      }
    }

    this.saveVerificationState();
    return updated;
  }

  /**
   * Send a comment to the Procurement Team for review
   */
  public addProcurementComment(
    orderId: string,
    itemId: string,
    text: string,
    author: string = 'Procurement Officer'
  ): ProcurementComment | null {
    const cleanText = text.trim();
    if (!cleanText) return null;

    const cleanId = orderId.trim();
    const order = this.orderService.getOrderById(cleanId);
    const item = order?.items.find(i => i.id === itemId);
    if (!order || !item) return null;

    const newComment: ProcurementComment = {
      id: `pc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      text: cleanText,
      author,
      createdAt: new Date().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      status: 'Sent to Procurement Team'
    };

    const currentComments = item.procurementComments ? [...item.procurementComments] : [];
    currentComments.unshift(newComment);

    this.updateItemVerificationDetails(cleanId, itemId, {
      procurementComments: currentComments
    });

    // Add timeline record on the customer order so the procurement audit trail is visible
    order.timeline.unshift({
      id: `ev-comm-${Date.now()}`,
      title: 'Procurement Comment Sent',
      actor: author,
      time: newComment.createdAt,
      completed: true,
      notes: `[Product: ${item.name} (${item.sku})] - "${cleanText}"`
    });

    this.orderService.notifyUpdate();
    return newComment;
  }

  /**
   * Calculate verification progress for a customer order
   */
  public getOrderVerificationProgress(orderId: string): VerificationProgress {
    const order = this.orderService.getOrderById(orderId);
    if (!order || !order.items || order.items.length === 0) {
      return {
        verifiedCount: 0,
        totalCount: 0,
        pendingCount: 0,
        percentage: 0,
        isFullyVerified: false
      };
    }

    const totalCount = order.items.length;
    let verifiedCount = 0;

    for (const item of order.items) {
      if (item.verified || this.isItemVerified(order.id, item.id)) {
        verifiedCount++;
      }
    }

    const pendingCount = totalCount - verifiedCount;
    const percentage = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;
    const isFullyVerified = totalCount > 0 && verifiedCount === totalCount;

    return {
      verifiedCount,
      totalCount,
      pendingCount,
      percentage,
      isFullyVerified
    };
  }

  /**
   * Check if all products in the customer order are verified
   */
  public isOrderFullyVerified(orderId: string): boolean {
    return this.getOrderVerificationProgress(orderId).isFullyVerified;
  }

  /**
   * Final confirmation: verify all products, move order to Ready to Ship
   */
  public confirmProcurement(
    orderId: string,
    actor: string = 'Admin (Procurement Officer)'
  ): { success: boolean; message: string; order?: AdminOrder } {
    const cleanId = orderId.trim();
    const order = this.orderService.getOrderById(cleanId);
    if (!order) {
      return { success: false, message: `Order ${orderId} not found.` };
    }

    const progress = this.getOrderVerificationProgress(cleanId);
    if (!progress.isFullyVerified) {
      return {
        success: false,
        message: `Cannot confirm procurement for ${cleanId}. Only ${progress.verifiedCount} of ${progress.totalCount} products verified. All products must be individually verified first.`
      };
    }

    // 1. Update product line items
    for (const item of order.items) {
      item.procurementStatus = 'Received';
      item.inStock = Math.max(item.inStock, item.quantity);
      item.reservedQty = item.quantity;
      item.picked = true;
      item.verified = true;
      if (!item.verifiedAt) {
        item.verifiedAt = new Date().toISOString();
      }
    }

    // 2. Update order statuses
    order.procurementStatus = 'Completed';
    order.orderStatus = 'Ready to Ship';
    order.shipmentStatus = 'Unshipped';
    order.stockReserved = true;

    // 3. Add timeline audit entry
    const timeFormatted = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    order.timeline.unshift({
      id: `ev-proc-${Date.now()}`,
      title: 'Procurement Verified & Completed',
      actor,
      time: timeFormatted,
      completed: true,
      notes: `All ${order.items.length} product(s) manually verified. Order moved to Ready to Ship.`
    });

    // 4. Notify reactive state
    this.orderService.notifyUpdate();
    this.saveVerificationState();

    return {
      success: true,
      message: `Procurement for order ${order.id} confirmed successfully! The order has been moved to Ready to Ship.`,
      order
    };
  }

  private saveVerificationState(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('hm_procurement_verification', JSON.stringify(this.verificationState));
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }

  private loadVerificationState(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem('hm_procurement_verification');
        if (saved) {
          this.verificationState = JSON.parse(saved);
        }
      } catch (e) {
        this.verificationState = {};
      }
    }
  }
}

