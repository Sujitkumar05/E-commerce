import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminOrder, OrderItem, ProcurementComment } from '../../models/order.model';
import { ProcurementService, CustomerProcurementGroup, VerificationProgress, ProductVerificationState } from '../../services/procurement.service';
import { AdminOrderService } from '../../services/admin-order.service';

export type ProcurementSection = 'all' | 'customer' | 'ready_to_ship';

export interface GalleryImageItem {
  id: string;
  url: string;
  source: 'catalog' | 'uploaded';
  label: string;
  subLabel?: string;
}

@Component({
  selector: 'app-admin-procurement',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './procurement.html',
  styleUrl: './procurement.scss'
})
export class AdminProcurement implements OnInit, OnDestroy {
  public readonly procurementService = inject(ProcurementService);
  public readonly orderService = inject(AdminOrderService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Active section tab
  activeSection: ProcurementSection = 'all';

  // Selected Order for Procurement Details View
  selectedOrder: AdminOrder | null = null;

  // Selected Product for Verification Modal/Inspection
  inspectedProduct: OrderItem | null = null;

  // ---------------- Interactive Modal State ----------------
  editProductName = '';
  editSku = '';
  editSize = '';
  editQuantity = 1;
  isCorrectProduct = true;
  imageCorrectChecked = false;
  imageVerified = false;
  uploadedImagePreview: string | null = null;
  isUploading = false;
  sizeConfirmed = false;
  confirmedSize = '';
  newCommentText = '';
  procurementComments: ProcurementComment[] = [];
  skuMatchConfirmed = true;
  orderIntegrityConfirmed = true;

  // ---------------- Multi-Image Gallery & Zoom Lightbox State ----------------
  catalogGallery: GalleryImageItem[] = [];
  uploadedGallery: GalleryImageItem[] = [];
  activeCatalogIndex = 0;
  activeUploadedIndex = 0;

  // Lightbox Zoom Viewer state
  isLightboxOpen = false;
  lightboxFilter: 'all' | 'catalog' | 'uploaded' = 'all';
  activeLightboxIndex = 0;
  zoomLevel = 1.0;

  // Quick preset sizes for ease of selection
  presetSizes: string[] = ['30 Caps', '60 Caps', '100 Caps', '100g', '200g', '250ml', '500ml', 'Pack of 1', 'Pack of 2'];

  // Quick Procurement Note suggestions
  quickCommentSuggestions: string[] = [
    'Procured batch verified with valid expiry date (2027).',
    'Barcode SKU verified on physical packaging.',
    'Stock received from authorized distributor. Packaging intact.',
    'Urgent: Customer requested priority delivery.',
    'Deficit resolved. Dispatched to packing station.'
  ];

  // Confirmation Modal state
  isConfirmModalOpen = false;

  // Search & Filter
  searchTerm = '';

  // Toast Notification
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null = null;
  private toastTimeout: any = null;

  // Subscriptions
  private subs = new Subscription();

  // Cached data lists
  procurementOrders: AdminOrder[] = [];
  customerGroups: CustomerProcurementGroup[] = [];
  readyToShipOrders: AdminOrder[] = [];

  ngOnInit(): void {
    // 1. Subscribe to procurement orders
    this.subs.add(
      this.procurementService.procurementOrders$.subscribe(orders => {
        this.procurementOrders = orders;
        this.customerGroups = this.procurementService.getCustomerWiseProcurement();

        // Refresh selectedOrder if currently open
        if (this.selectedOrder) {
          const updated = this.orderService.getOrderById(this.selectedOrder.id);
          if (updated) {
            this.selectedOrder = updated;
          }
        }
      })
    );

    // 2. Subscribe to ready to ship orders
    this.subs.add(
      this.procurementService.readyToShipOrders$.subscribe(orders => {
        this.readyToShipOrders = orders;
      })
    );

    // 3. Handle query params / route params (e.g. ?orderId=#ORD-1248 or ?section=customer)
    this.subs.add(
      this.route.queryParams.subscribe(params => {
        if (params['section'] && ['all', 'customer', 'ready_to_ship'].includes(params['section'])) {
          this.activeSection = params['section'] as ProcurementSection;
        }

        if (params['orderId']) {
          const target = this.orderService.getOrderById(params['orderId']);
          if (target) {
            this.selectOrder(target);
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  // ---------------- Navigation & View Selection ----------------
  setSection(section: ProcurementSection): void {
    this.activeSection = section;
    this.selectedOrder = null;
    this.inspectedProduct = null;
    this.isLightboxOpen = false;
  }

  selectOrder(order: AdminOrder): void {
    this.selectedOrder = order;
    this.inspectedProduct = null;
    this.isLightboxOpen = false;
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  clearSelectedOrder(): void {
    this.selectedOrder = null;
    this.inspectedProduct = null;
    this.isLightboxOpen = false;
  }

  // ---------------- Filtering & Search ----------------
  get filteredAllOrders(): AdminOrder[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.procurementOrders;
    return this.procurementOrders.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.customerEmail && o.customerEmail.toLowerCase().includes(q)) ||
      o.items.some(i => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
    );
  }

  get filteredCustomerGroups(): CustomerProcurementGroup[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.customerGroups;
    return this.customerGroups.filter(g =>
      g.customerName.toLowerCase().includes(q) ||
      g.customerId.toLowerCase().includes(q) ||
      g.customerEmail.toLowerCase().includes(q) ||
      g.orders.some(o => o.id.toLowerCase().includes(q))
    );
  }

  get filteredReadyToShipOrders(): AdminOrder[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.readyToShipOrders;
    return this.readyToShipOrders.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.customerEmail && o.customerEmail.toLowerCase().includes(q))
    );
  }

  // ---------------- Verification Logic (Task 3 & Task 4) ----------------
  getProgress(orderId: string): VerificationProgress {
    return this.procurementService.getOrderVerificationProgress(orderId);
  }

  isItemVerified(orderId: string, itemId: string): boolean {
    return this.procurementService.isItemVerified(orderId, itemId);
  }

  toggleItemVerification(item: OrderItem, event?: Event): void {
    if (!this.selectedOrder) return;
    if (event) {
      event.stopPropagation();
    }
    const currentStatus = this.isItemVerified(this.selectedOrder.id, item.id);
    const newStatus = !currentStatus;
    this.procurementService.setItemVerification(this.selectedOrder.id, item.id, newStatus);
    
    // Refresh group stats
    this.customerGroups = this.procurementService.getCustomerWiseProcurement();

    if (newStatus) {
      this.showToast(`Verified: ${item.name}`, 'info');
    }
  }

  // ---------------- Interactive Modal Inspection ----------------
  inspectProduct(item: OrderItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.inspectedProduct = item;
    if (!this.selectedOrder) return;

    // Load full verification state for this specific item
    const state = this.procurementService.getItemVerificationState(this.selectedOrder.id, item.id);
    this.editProductName = item.name;
    this.editSku = state.verifiedSku || item.sku;
    this.editSize = state.confirmedSize || item.size || item.variant || 'Standard';
    this.editQuantity = item.quantity;
    this.isCorrectProduct = true;
    this.imageCorrectChecked = state.imageIsCorrect ?? false;
    this.imageVerified = state.imageVerified ?? false;
    this.uploadedImagePreview = state.uploadedImageUrl || null;
    this.sizeConfirmed = state.sizeConfirmed ?? false;
    this.confirmedSize = state.confirmedSize || (this.sizeConfirmed ? this.editSize : '');
    this.newCommentText = '';
    this.procurementComments = state.procurementComments ? [...state.procurementComments] : [];
    this.skuMatchConfirmed = true;
    this.orderIntegrityConfirmed = true;

    // Build multi-image galleries
    this.catalogGallery = this.getCatalogGallery(item);
    this.uploadedGallery = this.getUploadedGallery(state, item);
    this.activeCatalogIndex = 0;
    this.activeUploadedIndex = 0;
    this.isLightboxOpen = false;
    this.zoomLevel = 1.0;
  }

  closeInspection(): void {
    this.saveCurrentInspectionState();
    this.inspectedProduct = null;
    this.isLightboxOpen = false;
  }

  saveCurrentInspectionState(): void {
    if (!this.selectedOrder || !this.inspectedProduct) return;

    const uploadedUrls = this.uploadedGallery.map(g => g.url);
    const primaryUploaded = uploadedUrls[0] || this.uploadedImagePreview || undefined;

    this.procurementService.updateItemVerificationDetails(
      this.selectedOrder.id,
      this.inspectedProduct.id,
      {
        verifiedSku: this.editSku,
        confirmedSize: this.confirmedSize || this.editSize,
        sizeConfirmed: this.sizeConfirmed,
        imageIsCorrect: this.imageCorrectChecked,
        imageVerified: this.imageVerified,
        uploadedImageUrl: primaryUploaded,
        uploadedImages: uploadedUrls,
        procurementComments: this.procurementComments
      }
    );
  }

  // ---------------- Gallery Builders ----------------
  getCatalogGallery(item: OrderItem): GalleryImageItem[] {
    if (item.galleryImages && item.galleryImages.length > 0) {
      return item.galleryImages.map((url, i) => ({
        id: `cat-${i}`,
        url,
        source: 'catalog',
        label: i === 0 ? 'Front Packaging (Primary)' :
               i === 1 ? 'Back Label & Ingredients' :
               i === 2 ? 'Batch No. / Expiry / MRP' :
               i === 3 ? 'Cap & Security Seal' : `Angle View ${i + 1}`,
        subLabel: 'Catalog Reference'
      }));
    }

    return [
      {
        id: 'cat-0',
        url: item.image,
        source: 'catalog',
        label: 'Front Packaging (Primary)',
        subLabel: 'Standard System Image'
      },
      {
        id: 'cat-1',
        url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=900&auto=format&fit=crop&q=80',
        source: 'catalog',
        label: 'Back Label & Ingredients',
        subLabel: 'Nutrition & Formulation'
      },
      {
        id: 'cat-2',
        url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=900&auto=format&fit=crop&q=80',
        source: 'catalog',
        label: 'Batch No. & Expiry Print',
        subLabel: 'Barcode & Batch Stamp'
      },
      {
        id: 'cat-3',
        url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=900&auto=format&fit=crop&q=80',
        source: 'catalog',
        label: 'Cap & Seal Quality',
        subLabel: 'Tamper-Evident Seal'
      }
    ];
  }

  getUploadedGallery(state: ProductVerificationState, item: OrderItem): GalleryImageItem[] {
    const list: string[] = state.uploadedImages && state.uploadedImages.length > 0
      ? state.uploadedImages
      : state.uploadedImageUrl
      ? [state.uploadedImageUrl]
      : item.uploadedImages && item.uploadedImages.length > 0
      ? item.uploadedImages
      : item.uploadedImageUrl
      ? [item.uploadedImageUrl]
      : [];

    return list.map((url, i) => ({
      id: `up-${i}`,
      url,
      source: 'uploaded',
      label: `Uploaded Sample #${i + 1}`,
      subLabel: 'Procured Physical Sample'
    }));
  }

  // ---------------- Image Upload & Multi-Image Management ----------------
  onMultipleImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    this.isUploading = true;
    let loadedCount = 0;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const count = this.uploadedGallery.length + 1;
        this.uploadedGallery.push({
          id: `up-${Date.now()}-${count}`,
          url: dataUrl,
          source: 'uploaded',
          label: `Uploaded Sample #${count}`,
          subLabel: file.name || 'Sample Photo'
        });
        loadedCount++;

        if (loadedCount === files.length) {
          this.isUploading = false;
          this.uploadedImagePreview = this.uploadedGallery[0].url;
          this.activeUploadedIndex = this.uploadedGallery.length - 1;
          this.imageCorrectChecked = false;
          this.imageVerified = false;
          this.saveCurrentInspectionState();
          this.showToast(`${files.length} sample photo(s) added. Click on any photo to inspect & zoom.`, 'info');
        }
      };
      reader.onerror = () => {
        loadedCount++;
        if (loadedCount === files.length) {
          this.isUploading = false;
        }
      };
      reader.readAsDataURL(file);
    });
  }

  removeUploadedImageAt(index: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (index >= 0 && index < this.uploadedGallery.length) {
      this.uploadedGallery.splice(index, 1);
      this.uploadedImagePreview = this.uploadedGallery.length > 0 ? this.uploadedGallery[0].url : null;
      this.activeUploadedIndex = Math.max(0, Math.min(this.activeUploadedIndex, this.uploadedGallery.length - 1));
      this.imageCorrectChecked = false;
      this.imageVerified = false;
      this.saveCurrentInspectionState();
      this.showToast('Sample image removed.', 'info');
    }
  }

  setImageCorrect(isCorrect: boolean): void {
    this.imageCorrectChecked = isCorrect;
    if (!isCorrect) {
      this.imageVerified = false;
      this.showToast('Marked as image mismatch. Please upload the correct product sample.', 'error');
    } else {
      this.showToast('Image confirmed as matching product packaging standard.', 'info');
    }
    this.saveCurrentInspectionState();
  }

  toggleImageVerified(): void {
    if (this.uploadedGallery.length === 0 && !this.inspectedProduct?.image) {
      this.showToast('No product images available to verify.', 'error');
      return;
    }

    if (!this.imageCorrectChecked) {
      this.showToast('Please check whether the images are correct before confirming Image Verification.', 'error');
      return;
    }

    this.imageVerified = !this.imageVerified;
    this.saveCurrentInspectionState();

    if (this.imageVerified) {
      this.showToast('Product Images Verified successfully!', 'success');
    } else {
      this.showToast('Image verification cleared.', 'info');
    }
  }

  // ---------------- Lightbox / Zoom Inspector ----------------
  get filteredLightboxImages(): GalleryImageItem[] {
    if (this.lightboxFilter === 'catalog') {
      return this.catalogGallery;
    }
    if (this.lightboxFilter === 'uploaded') {
      return this.uploadedGallery;
    }
    return [...this.catalogGallery, ...this.uploadedGallery];
  }

  get currentLightboxImage(): GalleryImageItem | null {
    const list = this.filteredLightboxImages;
    if (!list || list.length === 0) return null;
    const index = Math.max(0, Math.min(this.activeLightboxIndex, list.length - 1));
    return list[index];
  }

  openLightbox(source: 'all' | 'catalog' | 'uploaded' = 'all', initialIndex: number = 0): void {
    this.lightboxFilter = source;
    this.activeLightboxIndex = initialIndex;
    this.zoomLevel = 1.0;
    this.isLightboxOpen = true;
  }

  closeLightbox(): void {
    this.isLightboxOpen = false;
    this.zoomLevel = 1.0;
  }

  nextLightboxImage(): void {
    const list = this.filteredLightboxImages;
    if (list.length <= 1) return;
    this.activeLightboxIndex = (this.activeLightboxIndex + 1) % list.length;
    this.zoomLevel = 1.0;
  }

  prevLightboxImage(): void {
    const list = this.filteredLightboxImages;
    if (list.length <= 1) return;
    this.activeLightboxIndex = (this.activeLightboxIndex - 1 + list.length) % list.length;
    this.zoomLevel = 1.0;
  }

  selectLightboxImage(index: number): void {
    this.activeLightboxIndex = index;
    this.zoomLevel = 1.0;
  }

  setLightboxFilter(filter: 'all' | 'catalog' | 'uploaded'): void {
    this.lightboxFilter = filter;
    this.activeLightboxIndex = 0;
    this.zoomLevel = 1.0;
  }

  zoomIn(): void {
    this.zoomLevel = Math.min(3.0, +(this.zoomLevel + 0.25).toFixed(2));
  }

  zoomOut(): void {
    this.zoomLevel = Math.max(1.0, +(this.zoomLevel - 0.25).toFixed(2));
  }

  resetZoom(): void {
    this.zoomLevel = 1.0;
  }

  toggleZoom(): void {
    this.zoomLevel = this.zoomLevel > 1.0 ? 1.0 : 2.0;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.isLightboxOpen) return;
    if (event.key === 'ArrowRight') {
      this.nextLightboxImage();
    } else if (event.key === 'ArrowLeft') {
      this.prevLightboxImage();
    } else if (event.key === 'Escape') {
      this.closeLightbox();
    } else if (event.key === '+' || event.key === '=') {
      this.zoomIn();
    } else if (event.key === '-' || event.key === '_') {
      this.zoomOut();
    }
  }

  // ---------------- Size Confirmation ----------------
  selectPresetSize(size: string): void {
    this.editSize = size;
  }

  confirmSize(customSize?: string): void {
    if (customSize) {
      this.editSize = customSize;
    }
    const finalSize = this.editSize.trim();
    if (!finalSize) {
      this.showToast('Please enter or select a size before confirming.', 'error');
      return;
    }

    this.confirmedSize = finalSize;
    this.sizeConfirmed = true;
    this.saveCurrentInspectionState();
    this.showToast(`Size confirmed as "${this.confirmedSize}". Comment box is now open for Procurement Team notes.`, 'success');
  }

  editSizeAgain(): void {
    this.sizeConfirmed = false;
    this.saveCurrentInspectionState();
  }

  // ---------------- Procurement Team Comments ----------------
  applyCommentSuggestion(text: string): void {
    this.newCommentText = text;
  }

  sendProcurementComment(): void {
    const text = this.newCommentText.trim();
    if (!text) {
      this.showToast('Please enter a comment before sending.', 'error');
      return;
    }

    if (!this.selectedOrder || !this.inspectedProduct) return;

    const created = this.procurementService.addProcurementComment(
      this.selectedOrder.id,
      this.inspectedProduct.id,
      text,
      'Admin (Procurement Officer)'
    );

    if (created) {
      this.procurementComments = [created, ...this.procurementComments];
      this.newCommentText = '';
      this.showToast('Comment successfully sent to Procurement Team for review!', 'success');
    }
  }

  // ---------------- Inspection Bottom Toggle ----------------
  toggleOverallVerificationFromModal(): void {
    if (!this.selectedOrder || !this.inspectedProduct) return;
    this.toggleItemVerification(this.inspectedProduct);
  }

  needsProcurement(item: OrderItem): boolean {
    return item.quantity > (item.inStock || 0);
  }

  getDeficit(item: OrderItem): number {
    return Math.max(0, item.quantity - (item.inStock || 0));
  }

  // ---------------- Final Confirmation (Task 5 & Task 6) ----------------
  canConfirmProcurement(order: AdminOrder): boolean {
    const progress = this.getProgress(order.id);
    return progress.isFullyVerified && progress.totalCount > 0;
  }

  openConfirmModal(): void {
    if (!this.selectedOrder) return;
    if (!this.canConfirmProcurement(this.selectedOrder)) {
      this.showToast('Please verify all products before confirming procurement.', 'error');
      return;
    }
    this.isConfirmModalOpen = true;
  }

  closeConfirmModal(): void {
    this.isConfirmModalOpen = false;
  }

  executeConfirmProcurement(): void {
    if (!this.selectedOrder) return;

    const orderId = this.selectedOrder.id;
    const result = this.procurementService.confirmProcurement(orderId);

    if (result.success) {
      this.closeConfirmModal();
      this.showToast(`Order ${orderId} moved to Ready to Ship successfully!`, 'success');
      
      this.activeSection = 'ready_to_ship';
      this.selectedOrder = null;
      this.inspectedProduct = null;
      this.isLightboxOpen = false;
    } else {
      this.showToast(result.message, 'error');
    }
  }

  // ---------------- UI Helpers ----------------
  showToast(text: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.toastMessage = { text, type };
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = null;
    }, 4000);
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=80';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  }
}
