import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

 type SettingsSection = 'general' | 'regional' | 'payments' | 'shipping' | 'orders' | 'notifications' | 'security' | 'admins' | 'system';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class AdminSettings {
  activeSection: SettingsSection = 'general';
  saved = false;
  lastSaved = '';

  storeName = 'Dista Marketplace';
  storeEmail = 'hello@distamarketplace.com';
  supportEmail = 'support@distamarketplace.com';
  phone = '+91 98765 43210';
  website = 'https://distamarketplace.com';
  address = 'Industrial Area, Mohali';
  currency = 'INR';
  timezone = 'Asia/Kolkata';
  language = 'English';
  dateFormat = 'DD/MM/YYYY';
  taxInclusive = true;
  payments = { cod: true, online: true, upi: true, cards: true, netbanking: false };
  shipping = { freeShipping: true, localDelivery: true, tracking: true };
  orders = { guestCheckout: true, orderConfirmation: true, allowCancellation: true, minimumOrder: 0, prefix: 'ORD' };
  notifications = { newOrder: true, lowStock: true, newCustomer: false, failedPayment: true, email: true, inApp: true };
  security = { twoFactor: false, strongPasswords: true, sessionTimeout: '30', loginAlerts: true };
  maintenanceMode = false;

  readonly sections: { id: SettingsSection; label: string; description: string; icon: string }[] = [
    { id: 'general', label: 'General', description: 'Store identity & contact', icon: 'bi-shop' },
    { id: 'regional', label: 'Regional', description: 'Currency, language & tax', icon: 'bi-globe2' },
    { id: 'payments', label: 'Payments', description: 'Payment methods', icon: 'bi-credit-card' },
    { id: 'shipping', label: 'Shipping', description: 'Delivery preferences', icon: 'bi-truck' },
    { id: 'orders', label: 'Orders & checkout', description: 'Customer purchase flow', icon: 'bi-bag-check' },
    { id: 'notifications', label: 'Notifications', description: 'Alerts & updates', icon: 'bi-bell' },
    { id: 'security', label: 'Security', description: 'Admin access & sessions', icon: 'bi-shield-lock' },
    { id: 'admins', label: 'Admin users', description: 'Roles & permissions', icon: 'bi-people' },
    { id: 'system', label: 'System', description: 'Backup & maintenance', icon: 'bi-sliders' }
  ];

  setSection(section: SettingsSection): void {
    this.activeSection = section;
    this.saved = false;
  }

  save(): void {
    this.saved = true;
    this.lastSaved = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  reset(): void {
    this.storeName = 'Dista Marketplace';
    this.storeEmail = 'hello@distamarketplace.com';
    this.supportEmail = 'support@distamarketplace.com';
    this.phone = '+91 98765 43210';
    this.website = 'https://distamarketplace.com';
    this.address = 'Industrial Area, Mohali';
    this.currency = 'INR';
    this.timezone = 'Asia/Kolkata';
    this.language = 'English';
    this.dateFormat = 'DD/MM/YYYY';
    this.taxInclusive = true;
    this.saved = false;
  }
}
