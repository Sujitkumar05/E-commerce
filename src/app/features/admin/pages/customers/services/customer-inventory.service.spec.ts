import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CustomerInventoryService } from './customer-inventory.service';

describe('CustomerInventoryService', () => {
  let service: CustomerInventoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerInventoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should flag inventory deficit when ordered quantity exceeds stock (e.g. 4 ordered vs 3 in stock)', () => {
    const customer = service.getCustomerById('#C1001');
    expect(customer).toBeDefined();

    const order = customer!.recentOrders![0]; // #ORD-1248
    const comparisons = service.getInventoryComparison(order);

    const shampoo = comparisons.find(c => c.item.sku === 'PST-001');
    expect(shampoo).toBeDefined();
    expect(shampoo!.orderedQty).toBe(4);
    expect(shampoo!.inStock).toBe(3);
    expect(shampoo!.deficit).toBe(1);
    expect(shampoo!.status).toBe('deficit');
  });

  it('should mark sufficient stock when stock covers ordered quantity', () => {
    const customer = service.getCustomerById('#C1001');
    const order = customer!.recentOrders![0];
    const comparisons = service.getInventoryComparison(order);

    const faceWash = comparisons.find(c => c.item.sku === 'PST-002');
    expect(faceWash).toBeDefined();
    expect(faceWash!.orderedQty).toBe(2);
    expect(faceWash!.inStock).toBe(12);
    expect(faceWash!.deficit).toBe(0);
    expect(faceWash!.status).toBe('sufficient');
  });

  it('should dispatch to procurement and record requisition', () => {
    const customer = service.getCustomerById('#C1001')!;
    const order = customer.recentOrders![0];
    const item = order.items[0];

    const req = service.dispatchToProcurement({
      customer,
      orderId: order.orderId,
      item,
      quantity: 1,
      supplier: 'Himalaya Herbal Supplies Ltd',
      priority: 'Urgent',
      notes: 'Test dispatch'
    });

    expect(req).toBeDefined();
    expect(req.id).toContain('PO-PROC-');
    expect(req.requestedQty).toBe(1);

    const updatedCust = service.getCustomerById('#C1001')!;
    expect(updatedCust.procurementRequisitions?.length).toBeGreaterThan(0);
    expect(updatedCust.recentOrders![0].items[0].procurementStatus).toBe('Requested');
  });
});
