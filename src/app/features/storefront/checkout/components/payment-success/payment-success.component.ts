import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CheckoutService } from '../../services/checkout.service';
import { PlacedOrderReceipt } from '../../models/checkout.model';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.scss'
})
export class PaymentSuccessComponent {
  private readonly router = Router ? inject(Router) : null;
  readonly checkoutService = inject(CheckoutService);

  readonly receipt = this.checkoutService.placedReceipt;
  readonly showOrderDetails = signal<boolean>(false);
  readonly showTracking = signal<boolean>(false);
  readonly copiedOrderId = signal<boolean>(false);

  toggleOrderDetails(): void {
    this.showOrderDetails.update(v => !v);
  }

  toggleTracking(): void {
    this.showTracking.update(v => !v);
    if (this.showTracking()) {
      setTimeout(() => {
        const el = document.getElementById('order-tracking-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }

  copyOrderId(orderId: string): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(orderId).then(() => {
        this.copiedOrderId.set(true);
        setTimeout(() => this.copiedOrderId.set(false), 2000);
      });
    }
  }

  continueShopping(): void {
    this.checkoutService.resetCheckout();
    if (this.router) {
      this.router.navigate(['/']);
    } else if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  printReceipt(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}

