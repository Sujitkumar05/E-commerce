import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminOrderService } from '../../services/admin-order.service';
import { OrderMetrics, AdminOrder } from '../../models/order.model';
import { CustomerInventoryService } from '../customers/services/customer-inventory.service';

export interface ProductItem {
  id: number;
  image: string;
  name: string;
  category: string;
  brand: string;
  price: string;
  stock: number;
  status: 'Active' | 'Inactive';
}

export interface ActivityItem {
  id: number;
  icon: string;
  bgColor: string;
  title: string;
  meta: string;
  time: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class AdminDashboard implements OnInit, OnDestroy {
  metrics: OrderMetrics = {
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    procurementRequired: 0,
    readyToShip: 0,
    shipped: 0,
    inTransit: 0,
    delivered: 0,
    cancelled: 0,
    returnRequests: 0,
    refundManagement: 0,
    totalRevenue: 0,
    delayedShipments: 0,
    stockShortages: 0
  };

  totalCustomersCount: number = 892;
  recentActivities: ActivityItem[] = [];

  readonly recentProducts: ProductItem[] = [
    {
      id: 1,
      image: '/images/wellness/himalaya-liv52.jpg',
      name: 'Herbal Shampoo',
      category: 'Personal Care',
      brand: 'Himalaya',
      price: '₹299',
      stock: 50,
      status: 'Active'
    },
    {
      id: 2,
      image: '/images/wellness/neem-turmeric.jpg',
      name: 'Natural Face Wash',
      category: 'Skincare',
      brand: 'Biotique',
      price: '₹199',
      stock: 75,
      status: 'Active'
    },
    {
      id: 3,
      image: '/images/wellness/patanjali-giloy.jpg',
      name: 'Aloe Vera Gel',
      category: 'Skincare',
      brand: 'Patanjali',
      price: '₹149',
      stock: 60,
      status: 'Active'
    },
    {
      id: 4,
      image: '/images/wellness/dabur-chyawanprash.jpg',
      name: 'Immunity Booster',
      category: 'Health Care',
      brand: 'Dabur',
      price: '₹349',
      stock: 40,
      status: 'Active'
    },
    {
      id: 5,
      image: '/images/wellness/triphala-capsules.jpg',
      name: 'Multivitamin',
      category: 'Health Care',
      brand: 'Himalaya',
      price: '₹499',
      stock: 30,
      status: 'Active'
    }
  ];

  private sub = new Subscription();

  constructor(
    public orderService: AdminOrderService,
    public customerService: CustomerInventoryService
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.orderService.orders$.subscribe(orders => {
        this.metrics = this.orderService.getOrderMetrics();
        this.updateRecentActivities(orders);
      })
    );

    this.sub.add(
      this.customerService.customers$.subscribe(customers => {
        if (customers.length > 0) {
          this.totalCustomersCount = customers.length;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private updateRecentActivities(orders: AdminOrder[]): void {
    const list: ActivityItem[] = [];
    let idCounter = 1;

    for (const order of orders) {
      if (order.timeline && order.timeline.length > 0) {
        const topEvent = order.timeline[0];
        let icon = 'bi-cart';
        let bgColor = '#3b82f6';

        if (topEvent.title.includes('Delivered')) {
          icon = 'bi-house-check';
          bgColor = '#10b981';
        } else if (topEvent.title.includes('Shortage') || topEvent.title.includes('Procurement')) {
          icon = 'bi-exclamation-triangle';
          bgColor = '#f59e0b';
        } else if (topEvent.title.includes('Cancelled')) {
          icon = 'bi-x-circle';
          bgColor = '#ef4444';
        } else if (topEvent.title.includes('Shipment') || topEvent.title.includes('Dispatched')) {
          icon = 'bi-truck';
          bgColor = '#8b5cf6';
        } else if (topEvent.title.includes('Return')) {
          icon = 'bi-arrow-repeat';
          bgColor = '#e11d48';
        }

        list.push({
          id: idCounter++,
          icon,
          bgColor,
          title: topEvent.title,
          meta: `${order.id} (${order.customerName})`,
          time: topEvent.time
        });
      }
      if (list.length >= 6) break;
    }

    this.recentActivities = list;
  }

  get deliveredPercent(): number {
    if (!this.metrics.total) return 0;
    return Math.round((this.metrics.delivered / this.metrics.total) * 100);
  }

  get processingPercent(): number {
    if (!this.metrics.total) return 0;
    return Math.round(((this.metrics.processing + this.metrics.confirmed + this.metrics.pending) / this.metrics.total) * 100);
  }

  get shippedPercent(): number {
    if (!this.metrics.total) return 0;
    return Math.round(((this.metrics.shipped + this.metrics.inTransit + this.metrics.readyToShip) / this.metrics.total) * 100);
  }

  get cancelledPercent(): number {
    if (!this.metrics.total) return 0;
    return Math.round((this.metrics.cancelled / this.metrics.total) * 100);
  }
}
