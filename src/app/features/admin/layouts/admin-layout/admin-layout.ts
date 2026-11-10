import { Component, HostListener } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService, User } from '../../../../core/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminOrder } from '../../models/order.model';
import { AdminOrderService } from '../../services/admin-order.service';
import { ProcurementService } from '../../services/procurement.service';

export interface AdminNotification {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  link: string;
  queryParams?: Record<string, string>;
  unread: boolean;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayout {
  currentUrl = '';
  productsSubmenuOpen = true;
  ordersSubmenuOpen = true;
  selectedOrderForNav: AdminOrder | null = null;
  sidebarOpen = true;
  isMobile = false;

  // Header Interactive Menus State
  profileDropdownOpen = false;
  notificationsOpen = false;
  quickCreateOpen = false;
  searchQuery = '';

  // Notifications Data
  notifications: AdminNotification[] = [
    {
      id: 1,
      title: 'New High Priority Order',
      description: 'Order #ORD-1248 placed by Rohan Sharma (₹2,499)',
      time: 'Just now',
      icon: 'bi-bag-check-fill',
      iconBg: '#eff6ff',
      iconColor: '#3b82f6',
      link: '/admin/orders',
      queryParams: { orderId: '#ORD-1248' },
      unread: true
    },
    {
      id: 2,
      title: 'Warehouse Stock Deficit',
      description: 'Herbal Shampoo deficit in Shelf A3 (1 unit needed)',
      time: '14m ago',
      icon: 'bi-exclamation-triangle-fill',
      iconBg: '#fffbeb',
      iconColor: '#f59e0b',
      link: '/admin/inventory',
      unread: true
    },
    {
      id: 3,
      title: 'Return Request Logged',
      description: 'RMA-2025-4192 submitted for review (#ORD-1210)',
      time: '1h ago',
      icon: 'bi-arrow-repeat',
      iconBg: '#fef2f2',
      iconColor: '#ef4444',
      link: '/admin/orders',
      queryParams: { tab: 'returns' },
      unread: true
    },
    {
      id: 4,
      title: 'New Retail Customer',
      description: 'Priya Singh registered from Mumbai',
      time: '3h ago',
      icon: 'bi-person-plus-fill',
      iconBg: '#f0fdf4',
      iconColor: '#10b981',
      link: '/admin/customers',
      unread: false
    }
  ];

  constructor(
    public auth: AuthService,
    private router: Router,
    public orderService: AdminOrderService,
    public procurementService: ProcurementService
  ) {
    this.checkScreenSize();
    this.currentUrl = this.router.url;
    this.productsSubmenuOpen = this.currentUrl.includes('/admin/products');
    this.ordersSubmenuOpen = this.currentUrl.includes('/admin/orders');

    this.orderService.selectedOrder$.subscribe(order => {
      this.selectedOrderForNav = order;
      if (order && this.currentUrl.includes('/admin/orders')) {
        this.ordersSubmenuOpen = true;
      }
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects || event.url;
        if (this.currentUrl.includes('/admin/products')) {
          this.productsSubmenuOpen = true;
        }
        if (this.currentUrl.includes('/admin/orders')) {
          this.ordersSubmenuOpen = true;
        }
        // Auto-close sidebar on route change when in mobile mode
        if (this.isMobile) {
          this.sidebarOpen = false;
        }
        // Close header dropdowns on route changes
        this.closeAllDropdowns();
      });
  }

  isOrdersActive(): boolean {
    return this.currentUrl.includes('/admin/orders');
  }

  isProcurementActive(): boolean {
    return this.currentUrl.includes('/admin/procurement');
  }

  get pendingProcurementCount(): number {
    return this.procurementService.getProcurementOrders().length;
  }

  toggleOrdersSubmenu(): void {
    this.ordersSubmenuOpen = !this.ordersSubmenuOpen;
    if (this.ordersSubmenuOpen && !this.currentUrl.includes('/admin/orders')) {
      this.router.navigate(['/admin/orders']);
    }
  }

  get currentUser(): User {
    const user = this.auth.currentUser();
    if (user) return user;
    return {
      id: 'usr_admin_demo',
      name: 'Store Admin',
      email: 'admin@dista.demo',
      role: 'admin'
    };
  }

  get unreadNotificationsCount(): number {
    return this.notifications.filter(n => n.unread).length;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-wrapper')) {
      this.closeAllDropdowns();
    }
  }

  private checkScreenSize(): void {
    if (typeof window !== 'undefined') {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 1024;
      if (this.isMobile && !wasMobile) {
        this.sidebarOpen = false;
      } else if (!this.isMobile && wasMobile) {
        this.sidebarOpen = true;
      }
    }
  }

  isProductsActive(): boolean {
    return this.currentUrl.includes('/admin/products');
  }

  toggleProductsSubmenu(): void {
    this.productsSubmenuOpen = !this.productsSubmenuOpen;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  toggleProfileDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.profileDropdownOpen = !this.profileDropdownOpen;
    if (this.profileDropdownOpen) {
      this.notificationsOpen = false;
      this.quickCreateOpen = false;
    }
  }

  toggleNotifications(event?: Event): void {
    if (event) event.stopPropagation();
    this.notificationsOpen = !this.notificationsOpen;
    if (this.notificationsOpen) {
      this.profileDropdownOpen = false;
      this.quickCreateOpen = false;
    }
  }

  toggleQuickCreate(event?: Event): void {
    if (event) event.stopPropagation();
    this.quickCreateOpen = !this.quickCreateOpen;
    if (this.quickCreateOpen) {
      this.profileDropdownOpen = false;
      this.notificationsOpen = false;
    }
  }

  closeAllDropdowns(): void {
    this.profileDropdownOpen = false;
    this.notificationsOpen = false;
    this.quickCreateOpen = false;
  }

  markAllNotificationsRead(): void {
    this.notifications.forEach(n => (n.unread = false));
  }

  onNotificationClick(item: AdminNotification): void {
    item.unread = false;
    this.closeAllDropdowns();
  }

  onSearch(): void {
    const query = (this.searchQuery || '').trim();
    if (!query) return;

    this.closeAllDropdowns();
    const upper = query.toUpperCase();
    if (upper.includes('ORD') || query.startsWith('#')) {
      this.router.navigate(['/admin/orders'], { queryParams: { orderId: query } });
    } else if (upper.startsWith('C') && query.length <= 6) {
      this.router.navigate(['/admin/customers'], { queryParams: { search: query } });
    } else {
      this.router.navigate(['/admin/products'], { queryParams: { search: query } });
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  logout(): void {
    this.closeAllDropdowns();
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
