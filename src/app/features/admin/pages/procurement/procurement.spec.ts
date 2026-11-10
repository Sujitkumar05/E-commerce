import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminProcurement } from './procurement';
import { ProcurementService } from '../../services/procurement.service';
import { AdminOrderService } from '../../services/admin-order.service';

describe('AdminProcurement Component', () => {
  let component: AdminProcurement;
  let fixture: ComponentFixture<AdminProcurement>;
  let procurementService: ProcurementService;
  let orderService: AdminOrderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProcurement],
      providers: [
        provideRouter([]),
        AdminOrderService,
        ProcurementService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProcurement);
    component = fixture.componentInstance;
    procurementService = TestBed.inject(ProcurementService);
    orderService = TestBed.inject(AdminOrderService);
    fixture.detectChanges();
  });

  it('should create the procurement component', () => {
    expect(component).toBeTruthy();
  });

  describe('Task 1: Separate Procurement Tab & Sections', () => {
    it('should default to All Procurement Orders section', () => {
      expect(component.activeSection).toBe('all');
    });

    it('should switch between sections and clear order selection', () => {
      const order = component.procurementOrders[0];
      component.selectOrder(order);
      expect(component.selectedOrder).toBe(order);

      component.setSection('customer');
      expect(component.activeSection).toBe('customer');
      expect(component.selectedOrder).toBeNull();

      component.setSection('ready_to_ship');
      expect(component.activeSection).toBe('ready_to_ship');
    });

    it('should list all procurement orders in All section', () => {
      expect(component.filteredAllOrders.length).toBeGreaterThan(0);
      for (const ord of component.filteredAllOrders) {
        expect(['Required', 'PO_Created']).toContain(ord.procurementStatus);
      }
    });

    it('should group procurement orders by customer in Customer-wise section', () => {
      expect(component.filteredCustomerGroups.length).toBeGreaterThan(0);
      const firstGroup = component.filteredCustomerGroups[0];
      expect(firstGroup.customerName).toBeTruthy();
      expect(firstGroup.orders.length).toBeGreaterThan(0);
    });
  });

  describe('Task 2 & 3: Order Details & Product Inspection', () => {
    it('should open order procurement details view when selecting an order', () => {
      const order = component.procurementOrders[0];
      component.selectOrder(order);
      expect(component.selectedOrder).toBe(order);
    });

    it('should open product inspection modal with checklist details', () => {
      const order = component.procurementOrders[0];
      component.selectOrder(order);

      const item = order.items[0];
      component.inspectProduct(item);
      expect(component.inspectedProduct).toBe(item);

      component.closeInspection();
      expect(component.inspectedProduct).toBeNull();
    });

    it('should identify products that need procurement due to shortage', () => {
      const order = component.procurementOrders[0];
      const shortageItem = order.items.find(i => i.quantity > i.inStock);
      if (shortageItem) {
        expect(component.needsProcurement(shortageItem)).toBe(true);
        expect(component.getDeficit(shortageItem)).toBe(shortageItem.quantity - shortageItem.inStock);
      }
    });
  });

  describe('Task 4: Manual Product Verification Checkbox', () => {
    it('should toggle manual verification checkbox for each product', () => {
      const order = component.procurementOrders[0];
      component.selectOrder(order);
      const item = order.items[0];

      // Reset
      procurementService.setItemVerification(order.id, item.id, false);
      expect(component.isItemVerified(order.id, item.id)).toBe(false);

      // Verify item
      component.toggleItemVerification(item);
      expect(component.isItemVerified(order.id, item.id)).toBe(true);

      // Verification progress should update
      const progress = component.getProgress(order.id);
      expect(progress.verifiedCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Task 5 & 6: Confirm Procurement & Move to Ready to Ship', () => {
    it('should disable confirmation button until all products are verified', () => {
      const order = component.procurementOrders[0];
      component.selectOrder(order);

      // Unverify all items
      for (const item of order.items) {
        procurementService.setItemVerification(order.id, item.id, false);
      }

      expect(component.canConfirmProcurement(order)).toBe(false);

      // Verify only 1 item if multiple exist
      if (order.items.length > 1) {
        procurementService.setItemVerification(order.id, order.items[0].id, true);
        expect(component.canConfirmProcurement(order)).toBe(false);
      }

      // Verify all items
      for (const item of order.items) {
        procurementService.setItemVerification(order.id, item.id, true);
      }

      expect(component.canConfirmProcurement(order)).toBe(true);
    });

    it('should execute procurement confirmation and move order to Ready to Ship', () => {
      const order = component.procurementOrders[0];
      const orderId = order.id;
      component.selectOrder(order);

      // Verify all items
      for (const item of order.items) {
        procurementService.setItemVerification(orderId, item.id, true);
      }

      component.openConfirmModal();
      expect(component.isConfirmModalOpen).toBe(true);

      component.executeConfirmProcurement();
      expect(component.isConfirmModalOpen).toBe(false);

      // Order should now be in Ready to Ship section
      expect(component.activeSection).toBe('ready_to_ship');
      const updatedOrder = orderService.getOrderById(orderId);
      expect(updatedOrder?.orderStatus).toBe('Ready to Ship');
      expect(updatedOrder?.procurementStatus).toBe('Completed');
    });
  });

  describe('Interactive Verification Workbench (Image, Size, Comments)', () => {
    it('should load item details into editable fields when inspecting', () => {
      const order = component.procurementOrders[0];
      component.selectOrder(order);
      const item = order.items[0];

      component.inspectProduct(item);
      expect(component.editProductName).toBe(item.name);
      expect(component.editSku).toBe(item.sku);
      expect(component.editQuantity).toBe(item.quantity);
      expect(component.editSize).toBeTruthy();
    });

    it('should support manual data entry for SKU, Name, and Quantity', () => {
      const order = component.procurementOrders[0];
      component.selectOrder(order);
      const item = order.items[0];
      component.inspectProduct(item);

      component.editSku = 'SKU-MANUAL-999';
      component.editProductName = 'Manual Product Name Override';
      component.editQuantity = 5;
      component.saveCurrentInspectionState();

      const state = procurementService.getItemVerificationState(order.id, item.id);
      expect(state.verifiedSku).toBe('SKU-MANUAL-999');
    });

    it('should handle image match check and Image Verified button properly', () => {
      const order = component.procurementOrders[0];
      component.selectOrder(order);
      const item = order.items[0];
      component.inspectProduct(item);

      // Initially image is not checked
      component.imageCorrectChecked = false;
      component.imageVerified = false;

      // Cannot verify without checking if correct first
      component.toggleImageVerified();
      expect(component.imageVerified).toBe(false);

      // Check image as correct
      component.setImageCorrect(true);
      expect(component.imageCorrectChecked).toBe(true);

      // Now Image Verified button works
      component.toggleImageVerified();
      expect(component.imageVerified).toBe(true);

      const state = procurementService.getItemVerificationState(order.id, item.id);
      expect(state.imageVerified).toBe(true);
      expect(state.imageIsCorrect).toBe(true);
    });

    it('should confirm size using preset chips or custom input', () => {
      const order = component.procurementOrders[0];
      component.selectOrder(order);
      const item = order.items[0];
      component.inspectProduct(item);

      expect(component.sizeConfirmed).toBe(false);

      // Select preset size
      component.selectPresetSize('100 Caps');
      expect(component.editSize).toBe('100 Caps');

      // Confirm size
      component.confirmSize();
      expect(component.sizeConfirmed).toBe(true);
      expect(component.confirmedSize).toBe('100 Caps');

      // Allow changing size
      component.editSizeAgain();
      expect(component.sizeConfirmed).toBe(false);

      // Confirm custom size
      component.confirmSize('250ml Bottle');
      expect(component.sizeConfirmed).toBe(true);
      expect(component.confirmedSize).toBe('250ml Bottle');
    });

    it('should unlock comment box once size is confirmed and send comments to Procurement Team', () => {
      const order = component.procurementOrders[0];
      component.selectOrder(order);
      const item = order.items[0];
      component.inspectProduct(item);

      // Confirm size first
      component.confirmSize('60 Caps');
      expect(component.sizeConfirmed).toBe(true);

      // Apply quick suggestion or enter comment
      component.applyCommentSuggestion('Batch 2026 verified with valid expiry.');
      expect(component.newCommentText).toContain('Batch 2026 verified');

      // Send comment to Procurement Team
      component.sendProcurementComment();
      expect(component.newCommentText).toBe('');
      expect(component.procurementComments.length).toBeGreaterThan(0);
      expect(component.procurementComments[0].status).toBe('Sent to Procurement Team');
      expect(component.procurementComments[0].text).toContain('Batch 2026 verified');

      // Verify recorded in order timeline
      const updatedOrder = orderService.getOrderById(order.id);
      const topTimeline = updatedOrder?.timeline[0];
      expect(topTimeline?.title).toBe('Procurement Comment Sent');
    });
  });

  describe('Multi-Image Gallery & Interactive Zoom Inspector', () => {
    it('should generate multiple catalog reference views for inspected product', () => {
      const order = component.procurementOrders[0];
      component.selectOrder(order);
      const item = order.items[0];
      component.inspectProduct(item);

      expect(component.catalogGallery.length).toBeGreaterThanOrEqual(4);
      expect(component.catalogGallery[0].label).toContain('Front Packaging');
      expect(component.catalogGallery[1].label).toContain('Back Label');
      expect(component.catalogGallery[2].label).toContain('Batch No. & Expiry');
      expect(component.catalogGallery[3].label).toContain('Cap & Seal');
    });

    it('should open lightbox and select images', () => {
      const order = component.procurementOrders[0];
      component.selectOrder(order);
      const item = order.items[0];
      component.inspectProduct(item);

      expect(component.isLightboxOpen).toBe(false);

      // Open lightbox on catalog image at index 1
      component.openLightbox('catalog', 1);
      expect(component.isLightboxOpen).toBe(true);
      expect(component.activeLightboxIndex).toBe(1);
      expect(component.zoomLevel).toBe(1.0);
      expect(component.currentLightboxImage?.label).toContain('Back Label');

      // Select image directly
      component.selectLightboxImage(2);
      expect(component.activeLightboxIndex).toBe(2);
      expect(component.currentLightboxImage?.label).toContain('Batch No. & Expiry');

      // Close lightbox
      component.closeLightbox();
      expect(component.isLightboxOpen).toBe(false);
    });

    it('should navigate through images one by one (next and previous)', () => {
      const order = component.procurementOrders[0];
      component.selectOrder(order);
      const item = order.items[0];
      component.inspectProduct(item);

      component.openLightbox('catalog', 0);
      const totalImages = component.filteredLightboxImages.length;

      // Next
      component.nextLightboxImage();
      expect(component.activeLightboxIndex).toBe(1);

      // Next again
      component.nextLightboxImage();
      expect(component.activeLightboxIndex).toBe(2);

      // Previous
      component.prevLightboxImage();
      expect(component.activeLightboxIndex).toBe(1);

      // Wrap around previous
      component.prevLightboxImage();
      expect(component.activeLightboxIndex).toBe(0);
      component.prevLightboxImage();
      expect(component.activeLightboxIndex).toBe(totalImages - 1);
    });

    it('should zoom in, zoom out, reset, and toggle zoom', () => {
      const order = component.procurementOrders[0];
      component.selectOrder(order);
      const item = order.items[0];
      component.inspectProduct(item);

      component.openLightbox('all', 0);
      expect(component.zoomLevel).toBe(1.0);

      component.zoomIn();
      expect(component.zoomLevel).toBe(1.25);

      component.zoomIn();
      expect(component.zoomLevel).toBe(1.5);

      component.zoomOut();
      expect(component.zoomLevel).toBe(1.25);

      component.resetZoom();
      expect(component.zoomLevel).toBe(1.0);

      // Toggle zoom
      component.toggleZoom();
      expect(component.zoomLevel).toBe(2.0);
      component.toggleZoom();
      expect(component.zoomLevel).toBe(1.0);
    });

    it('should handle keyboard navigation events when lightbox is open', () => {
      const order = component.procurementOrders[0];
      component.selectOrder(order);
      const item = order.items[0];
      component.inspectProduct(item);

      component.openLightbox('catalog', 0);

      // ArrowRight
      component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(component.activeLightboxIndex).toBe(1);

      // ArrowLeft
      component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      expect(component.activeLightboxIndex).toBe(0);

      // Zoom +
      component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: '+' }));
      expect(component.zoomLevel).toBe(1.25);

      // Zoom -
      component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: '-' }));
      expect(component.zoomLevel).toBe(1.0);

      // Escape closes lightbox
      component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(component.isLightboxOpen).toBe(false);
    });

    it('should support removing uploaded sample images', () => {
      const order = component.procurementOrders[0];
      component.selectOrder(order);
      const item = order.items[0];
      component.inspectProduct(item);

      // Add a dummy uploaded image
      component.uploadedGallery = [
        {
          id: 'test-1',
          url: 'data:image/png;base64,sample1',
          source: 'uploaded',
          label: 'Sample #1'
        },
        {
          id: 'test-2',
          url: 'data:image/png;base64,sample2',
          source: 'uploaded',
          label: 'Sample #2'
        }
      ];
      expect(component.uploadedGallery.length).toBe(2);

      component.removeUploadedImageAt(0);
      expect(component.uploadedGallery.length).toBe(1);
      expect(component.uploadedGallery[0].label).toBe('Sample #2');
    });
  });

  describe('Search & Filtering', () => {
    it('should filter orders by order ID or customer name', () => {
      component.searchTerm = 'Priya';
      const results = component.filteredAllOrders;
      for (const ord of results) {
        expect(ord.customerName.toLowerCase()).toContain('priya');
      }
    });
  });
});

