import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  id: string; // Composite key: `${productId}_${variant}`
  productId: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  variant: string;
  quantity: number;
}

export interface CartToast {
  id: number;
  message: string;
  productName: string;
  variant?: string;
  image?: string;
  price?: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly STORAGE_KEY = 'yourstore_shopping_cart';

  // State signals
  private readonly _items = signal<CartItem[]>(this.loadFromStorage());
  private readonly _toast = signal<CartToast | null>(null);
  private toastTimeoutId: any = null;

  // Read-only public signals
  readonly items = this._items.asReadonly();
  readonly toast = this._toast.asReadonly();

  // Computed metrics
  readonly totalQuantity = computed(() =>
    this._items().reduce((total, item) => total + item.quantity, 0)
  );

  readonly subtotal = computed(() =>
    this._items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  readonly shipping = computed(() => (this.subtotal() > 50 || this.subtotal() === 0 ? 0 : 4.99));

  readonly estimatedTax = computed(() => +(this.subtotal() * 0.05).toFixed(2));

  readonly total = computed(() => +(this.subtotal() + this.shipping() + this.estimatedTax()).toFixed(2));

  readonly isEmpty = computed(() => this._items().length === 0);

  /**
   * Add a product to cart.
   * If the item with the same productId and variant exists, increase its quantity.
   * Otherwise add a new item entry.
   */
  addToCart(item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }, qty: number = 1): void {
    const quantityToAdd = Math.max(1, qty ?? item.quantity ?? 1);
    const variantKey = (item.variant || 'Standard').trim();
    const compositeId = `${item.productId}_${variantKey.toLowerCase().replace(/\s+/g, '-')}`;

    const currentItems = this._items();
    const existingIndex = currentItems.findIndex((i) => i.id === compositeId);

    let updatedItems: CartItem[];

    if (existingIndex > -1) {
      // Update quantity
      updatedItems = currentItems.map((cartItem, index) => {
        if (index === existingIndex) {
          return {
            ...cartItem,
            quantity: cartItem.quantity + quantityToAdd,
          };
        }
        return cartItem;
      });
    } else {
      // Add new cart entry
      const newItem: CartItem = {
        ...item,
        id: compositeId,
        variant: variantKey,
        quantity: quantityToAdd,
      };
      updatedItems = [...currentItems, newItem];
    }

    this._items.set(updatedItems);
    this.saveToStorage(updatedItems);

    // Trigger toast notification
    this.showToast({
      id: Date.now(),
      message: 'Added to your shopping cart!',
      productName: item.name,
      variant: variantKey,
      image: item.image,
      price: item.price,
    });
  }

  /**
   * Update item quantity directly
   */
  updateQuantity(itemId: string, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeItem(itemId);
      return;
    }

    const updated = this._items().map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );

    this._items.set(updated);
    this.saveToStorage(updated);
  }

  /**
   * Increment quantity
   */
  incrementQuantity(itemId: string): void {
    const item = this._items().find((i) => i.id === itemId);
    if (item) {
      this.updateQuantity(itemId, item.quantity + 1);
    }
  }

  /**
   * Decrement quantity
   */
  decrementQuantity(itemId: string): void {
    const item = this._items().find((i) => i.id === itemId);
    if (item) {
      this.updateQuantity(itemId, item.quantity - 1);
    }
  }

  /**
   * Remove item from cart
   */
  removeItem(itemId: string): void {
    const updated = this._items().filter((i) => i.id !== itemId);
    this._items.set(updated);
    this.saveToStorage(updated);
  }

  /**
   * Clear all cart items
   */
  clearCart(): void {
    this._items.set([]);
    this.saveToStorage([]);
  }

  /**
   * Show toast confirmation notification
   */
  showToast(toast: CartToast): void {
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }
    this._toast.set(toast);
    this.toastTimeoutId = setTimeout(() => {
      this._toast.set(null);
    }, 4000);
  }

  /**
   * Dismiss toast immediately
   */
  dismissToast(): void {
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }
    this._toast.set(null);
  }

  /**
   * Local storage helpers
   */
  private loadFromStorage(): CartItem[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Could not parse cart from localStorage:', e);
      return [];
    }
  }

  private saveToStorage(items: CartItem[]): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save cart to localStorage:', e);
    }
  }
}
