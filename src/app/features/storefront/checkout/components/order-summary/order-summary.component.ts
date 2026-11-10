import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../../../../core/services/cart.service';
import { CheckoutService } from '../../services/checkout.service';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss'
})
export class OrderSummaryComponent {
  readonly cartService = inject(CartService);
  readonly checkoutService = inject(CheckoutService);

  couponInput = '';
  couponMessage: { text: string; type: 'success' | 'error' } | null = null;

  readonly fallbackImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="%23f8fafc"><rect width="400" height="400" fill="%23f8fafc"/><path d="M160 180a20 20 0 100-40 20 20 0 000 40zm80 40l-50-60-60 80h160l-50-60z" fill="%23cbd5e1"/><text x="50%" y="75%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="600" fill="%2394a3b8">Product Preview</text></svg>';

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && target.src !== this.fallbackImage) {
      target.src = this.fallbackImage;
    }
  }

  changeAddress(): void {
    this.checkoutService.setStep('address');
  }

  incrementItem(item: CartItem): void {
    this.cartService.incrementQuantity(item.id);
  }

  decrementItem(item: CartItem): void {
    this.cartService.decrementQuantity(item.id);
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.id);
  }

  applyCouponCode(code?: string): void {
    const targetCode = (code || this.couponInput).trim();
    if (!targetCode) return;

    const result = this.checkoutService.applyCoupon(targetCode);
    this.couponMessage = {
      text: result.message,
      type: result.success ? 'success' : 'error'
    };

    if (result.success) {
      this.couponInput = '';
    }

    setTimeout(() => {
      this.couponMessage = null;
    }, 4500);
  }

  removeCoupon(): void {
    this.checkoutService.removeCoupon();
    this.couponMessage = null;
  }

  goToPayment(): void {
    if (this.cartService.items().length === 0) return;
    this.checkoutService.setStep('payment');
  }

  backToAddress(): void {
    this.checkoutService.setStep('address');
  }
}

