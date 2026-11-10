import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminCustomerRecord, CustomerOrder } from './models/customer.model';
import { CustomerInventoryService } from './services/customer-inventory.service';
import { CustomerDrawerComponent } from './customer-drawer/customer-drawer.component';

// Re-export interfaces for backwards-compatibility
export type { AdminCustomerRecord, CustomerOrder, CustomerOrderItem, ProcurementRequisition } from './models/customer.model';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomerDrawerComponent],
  templateUrl: './customers.html',
  styleUrl: './customers.scss'
})
export class AdminCustomers implements OnInit, OnDestroy {
  // Filters
  searchTerm: string = '';
  customerTypeFilter: string = 'All';
  statusFilter: string = 'All';
  inventoryFilter: 'All' | 'Deficit' | 'Sufficient' = 'All';
  dateRangeFilter: string = 'Last 30 days';

  // View Mode: 'table' (with slide-over drawer) or 'accordion' (full inline accordion cards)
  viewMode: 'table' | 'accordion' = 'table';

  // Selection
  selectAll: boolean = false;

  // Selected Customer for Details Drawer
  selectedCustomer: AdminCustomerRecord | null = null;
  drawerOpen: boolean = false;

  // Customers data from service
  customers: AdminCustomerRecord[] = [];
  private sub = new Subscription();

  // Top Metric Statistics
  readonly totalCustomersCount = 892;
  readonly newCustomersCount = 156;
  readonly activeCustomersCount = 748;
  readonly inactiveCustomersCount = 144;

  constructor(
    public customerService: CustomerInventoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.customerService.customers$.subscribe(list => {
        this.customers = list;
        // Keep selected customer in sync
        if (this.selectedCustomer) {
          const fresh = list.find(c => c.id === this.selectedCustomer?.id);
          if (fresh) {
            this.selectedCustomer = fresh;
          }
        } else if (list.length > 0) {
          this.selectedCustomer = list[0];
        }
      })
    );

    this.sub.add(
      this.route.queryParams.subscribe(params => {
        if (params['search']) {
          this.searchTerm = params['search'];
          const matched = this.customers.find(c => c.id.toLowerCase() === params['search'].toLowerCase());
          if (matched) {
            this.selectedCustomer = matched;
            this.drawerOpen = true;
          }
        }
      })
    );
  }

  viewCustomerOrders(customer: AdminCustomerRecord): void {
    this.router.navigate(['/admin/orders'], {
      queryParams: { customerId: customer.id }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // Count customers with stock shortages
  get customersWithDeficitsCount(): number {
    return this.customers.filter(c => this.customerService.getCustomerDeficitCount(c) > 0).length;
  }

  // Total procurement requisitions
  get totalProcurementRequisitionsCount(): number {
    return this.customers.reduce((acc, c) => acc + (c.procurementRequisitions?.length || 0), 0);
  }

  // Filter logic
  get filteredCustomers(): AdminCustomerRecord[] {
    return this.customers.filter(c => {
      const search = this.searchTerm.trim().toLowerCase();
      const matchesSearch = !search ||
        c.id.toLowerCase().includes(search) ||
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.phone.toLowerCase().includes(search);

      const matchesType = this.customerTypeFilter === 'All' ||
        c.customerType === this.customerTypeFilter;

      const matchesStatus = this.statusFilter === 'All' ||
        c.status === this.statusFilter;

      const deficitCount = this.customerService.getCustomerDeficitCount(c);
      const matchesInventory = this.inventoryFilter === 'All' ||
        (this.inventoryFilter === 'Deficit' && deficitCount > 0) ||
        (this.inventoryFilter === 'Sufficient' && deficitCount === 0);

      return matchesSearch && matchesType && matchesStatus && matchesInventory;
    });
  }

  selectCustomer(customer: AdminCustomerRecord, openDrawer: boolean = true): void {
    this.selectedCustomer = customer;
    if (openDrawer) {
      this.drawerOpen = true;
    }
  }

  openCustomerInventoryAudit(customer: AdminCustomerRecord, event?: Event): void {
    if (event) event.stopPropagation();
    this.selectedCustomer = customer;
    this.drawerOpen = true;
  }

  closeDrawer(): void {
    this.drawerOpen = false;
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'table' ? 'accordion' : 'table';
  }

  toggleSelectAll(): void {
    this.filteredCustomers.forEach(c => c.selected = this.selectAll);
  }

  checkIndividualSelection(): void {
    this.selectAll = this.filteredCustomers.length > 0 &&
      this.filteredCustomers.every(c => c.selected);
  }

  onCustomerUpdated(updated: AdminCustomerRecord): void {
    this.customerService.updateCustomer(updated);
  }

  // Actions
  addNewCustomer(): void {
    const name = prompt('Enter New Customer Full Name:');
    if (!name || !name.trim()) return;

    const email = prompt('Enter Email address:', `${name.toLowerCase().replace(/\s+/g, '')}@example.com`) || '';
    const phone = prompt('Enter Phone number:', '+91 98765 00000') || '';
    const newId = `#C${1001 + this.customers.length}`;

    const newCust: AdminCustomerRecord = {
      id: newId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: 'India',
      shippingAddress: 'Sector 15, Urban Estate, India',
      avatarInitials: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      avatarBg: '#dbeafe',
      customerType: 'Retail',
      status: 'Active',
      joinDate: 'Today',
      joinTime: 'Just now',
      totalOrders: 0,
      totalSpent: 0,
      recentOrders: []
    };

    const currentList = this.customerService.getCustomers();
    currentList.unshift(newCust);
    this.customerService.updateCustomer(newCust);
    this.selectedCustomer = newCust;
    this.drawerOpen = true;
    alert(`Customer ${newCust.name} added successfully!`);
  }

  exportCsv(): void {
    const csvRows = [
      ['Customer ID', 'Name', 'Email', 'Phone', 'Type', 'Status', 'Join Date', 'Total Orders', 'Total Spent', 'Stock Deficit Count'],
      ...this.filteredCustomers.map(c => [
        c.id,
        c.name,
        c.email,
        c.phone,
        c.customerType,
        c.status,
        `${c.joinDate} ${c.joinTime}`,
        c.totalOrders,
        `₹${c.totalSpent}`,
        this.customerService.getCustomerDeficitCount(c)
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customers_inventory_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
