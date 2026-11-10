import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StorefrontHeader } from '../../../storefront/components/storefront-header/storefront-header';
import { Footer } from '../../../storefront/components/footer/footer';
import { CartService, CartItem } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-cart-page',
  imports: [CommonModule, RouterLink, FormsModule, StorefrontHeader, Footer],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
})
export class CartPage {
  readonly cartService = inject(CartService);
  readonly router = inject(Router);

  promoCode = '';
  promoApplied = false;
  promoDiscount = 0;

  applyPromo(): void {
    const code = this.promoCode.trim().toUpperCase();
    if (code === 'WELLNESS10' || code === 'SAVE10') {
      this.promoApplied = true;
      this.promoDiscount = +(this.cartService.subtotal() * 0.1).toFixed(2);
    } else {
      alert('Invalid promo code. Try "SAVE10" for 10% off!');
    }
  }

  get finalTotal(): number {
    const discounted = this.cartService.total() - (this.promoApplied ? this.promoDiscount : 0);
    return Math.max(0, +discounted.toFixed(2));
  }

  proceedToCheckout(): void {
    // Checkout is a transparent placeholder until a backend and payment provider exist.
    this.router.navigate(['/checkout']);
  }
}
