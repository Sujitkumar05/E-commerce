import { Injectable, signal, computed } from '@angular/core';

export interface WishlistItem {
  id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  variant?: string;
  inStock?: boolean;
  categoryTag?: string;
  addedAt?: number;
}

export interface WishlistToast {
  id: number;
  message: string;
  productName: string;
  image?: string;
  added: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly STORAGE_KEY = 'yourstore_shopping_wishlist';

  // State signals
  private readonly _items = signal<WishlistItem[]>(this.loadFromStorage());
  private readonly _toast = signal<WishlistToast | null>(null);
  private toastTimeoutId: any = null;

  // Read-only public signals
  readonly items = this._items.asReadonly();
  readonly toast = this._toast.asReadonly();

  // Computed metrics
  readonly count = computed(() => this._items().length);
  readonly isEmpty = computed(() => this._items().length === 0);

  // Set of wishlisted item IDs for fast O(1) reactive checks
  readonly itemIdsSet = computed(() => new Set(this._items().map((item) => item.id)));

  /**
   * Check if a product ID is in the wishlist
   */
  isInWishlist(productId: string): boolean {
    if (!productId) return false;
    return this.itemIdsSet().has(productId);
  }

  /**
   * Toggle product in wishlist:
   * Adds if not present, removes if already present.
   * Returns true if added, false if removed.
   */
  toggleWishlist(product: Partial<WishlistItem> & { id: string; name: string }): boolean {
    if (!product || !product.id) return false;

    const exists = this.isInWishlist(product.id);

    if (exists) {
      this.removeFromWishlist(product.id);
      this.showToast({
        id: Date.now(),
        message: 'Removed from your wishlist',
        productName: product.name,
        image: product.image,
        added: false,
      });
      return false;
    } else {
      const newItem: WishlistItem = {
        id: product.id,
        name: product.name,
        brand: product.brand || 'Your Store Authentic',
        image: product.image || '/images/wellness/neem-turmeric.jpg',
        price: product.price ?? 0,
        originalPrice: product.originalPrice,
        rating: product.rating ?? 5.0,
        reviewCount: product.reviewCount ?? 120,
        variant: product.variant || 'Standard',
        inStock: product.inStock ?? true,
        categoryTag: product.categoryTag || 'Wellness',
        addedAt: Date.now(),
      };

      const updated = [newItem, ...this._items()];
      this._items.set(updated);
      this.saveToStorage(updated);

      this.showToast({
        id: Date.now(),
        message: 'Added to your wishlist!',
        productName: product.name,
        image: product.image,
        added: true,
      });

      return true;
    }
  }

  /**
   * Add a product explicitly
   */
  addToWishlist(item: WishlistItem): void {
    if (this.isInWishlist(item.id)) return;
    const updated = [item, ...this._items()];
    this._items.set(updated);
    this.saveToStorage(updated);
  }

  /**
   * Remove a product by id
   */
  removeFromWishlist(productId: string): void {
    const updated = this._items().filter((item) => item.id !== productId);
    this._items.set(updated);
    this.saveToStorage(updated);
  }

  /**
   * Clear all items from the wishlist
   */
  clearWishlist(): void {
    this._items.set([]);
    this.saveToStorage([]);
  }

  /**
   * Notification toast
   */
  showToast(toast: WishlistToast): void {
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }
    this._toast.set(toast);
    this.toastTimeoutId = setTimeout(() => {
      this._toast.set(null);
    }, 3500);
  }

  dismissToast(): void {
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }
    this._toast.set(null);
  }

  /**
   * Storage helpers
   */
  private loadFromStorage(): WishlistItem[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Could not load wishlist from localStorage:', e);
      return [];
    }
  }

  private saveToStorage(items: WishlistItem[]): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save wishlist to localStorage:', e);
    }
  }
}
