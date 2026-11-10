import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerDrawerComponent } from './customer-drawer.component';
import { CustomerInventoryService } from '../services/customer-inventory.service';

describe('CustomerDrawerComponent', () => {
  let component: CustomerDrawerComponent;
  let fixture: ComponentFixture<CustomerDrawerComponent>;
  let service: CustomerInventoryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDrawerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerDrawerComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(CustomerInventoryService);

    const testCust = service.getCustomerById('#C1001')!;
    component.customer = testCust;
    component.isOpen = true;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should accurately calculate stock comparison for the customer order', () => {
    const comparisons = component.currentOrderComparisons;
    expect(comparisons.length).toBeGreaterThan(0);

    const shortageItem = comparisons.find(c => c.deficit > 0);
    expect(shortageItem).toBeDefined();
    // In our seed data, customer orders 4 units of Herbal Shampoo but stock is 3 -> 1 unit missing
    expect(shortageItem!.orderedQty).toBe(4);
    expect(shortageItem!.inStock).toBe(3);
    expect(shortageItem!.deficit).toBe(1);
  });

  it('should toggle drawer width mode', () => {
    expect(component.drawerWidthMode).toBe('standard');
    component.toggleDrawerWidth();
    expect(component.drawerWidthMode).toBe('wide');
    component.toggleDrawerWidth();
    expect(component.drawerWidthMode).toBe('standard');
  });

  it('should open procurement modal with missing quantity prefilled', () => {
    const item = component.currentOrder!.items[0];
    component.openProcurementModal(item, component.currentOrder!.orderId);

    expect(component.isProcureModalOpen).toBe(true);
    expect(component.procureQuantity).toBe(1); // 4 - 3 = 1 missing unit
  });
});
