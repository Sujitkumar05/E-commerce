import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StorefrontHeader } from '../../../storefront/components/storefront-header/storefront-header';
import { Footer } from '../../../storefront/components/footer/footer';
import { WishlistService, WishlistItem } from '../../../../core/services/wishlist.service';
import { CartService } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-wishlist-page',
  imports: [CommonModule, RouterLink, StorefrontHeader, Footer],
  templateUrl: './wishlist-page.html',
  styleUrl: './wishlist-page.scss',
})
export class WishlistPage {
  readonly wishlistService = inject(WishlistService);
  readonly cartService = inject(CartService);
  readonly authService = inject(AuthService);

  /**
   * Add a single wishlisted product to cart
   */
  addToCart(item: WishlistItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    const cartItem = {
      productId: item.id,
      name: item.name,
      brand: item.brand,
      image: item.image,
      price: item.price,
      originalPrice: item.originalPrice,
      variant: item.variant || 'Standard',
    };

    const authenticated = this.authService.requireAuthForCart({
      item: cartItem,
      quantity: 1,
      actionType: 'add',
      returnUrl: '/wishlist',
    });

    if (!authenticated) {
      return;
    }

    this.cartService.addToCart(
      {
        ...cartItem,
        quantity: 1,
      },
      1
    );
  }

  /**
   * Move all wishlisted items into shopping cart
   */
  addAllToCart(): void {
    const items = this.wishlistService.items();
    if (items.length === 0) return;

    if (!this.authService.isAuthenticated()) {
      const first = items[0];
      this.authService.requireAuthForCart({
        item: {
          productId: first.id,
          name: first.name,
          brand: first.brand,
          image: first.image,
          price: first.price,
          originalPrice: first.originalPrice,
          variant: first.variant || 'Standard',
        },
        quantity: 1,
        actionType: 'add',
        returnUrl: '/wishlist',
      });
      return;
    }

    for (const item of items) {
      this.cartService.addToCart({
        productId: item.id,
        name: item.name,
        brand: item.brand,
        image: item.image,
        price: item.price,
        originalPrice: item.originalPrice,
        variant: item.variant || 'Standard',
        quantity: 1,
      });
    }
  }

  /**
   * Remove item from wishlist
   */
  removeItem(id: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.wishlistService.removeFromWishlist(id);
  }

  /**
   * Clear all items from wishlist
   */
  clearAll(): void {
    if (confirm('Are you sure you want to remove all items from your wishlist?')) {
      this.wishlistService.clearWishlist();
    }
  }
}
