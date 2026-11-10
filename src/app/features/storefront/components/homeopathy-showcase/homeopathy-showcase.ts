import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ProductService, ProductDetailModel } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { AuthService } from '../../../../core/auth/auth.service';

export interface HomeopathyBrandItem {
  id: string;
  name: string;
  tagline: string;
  fontClass?: string;
}

@Component({
  selector: 'app-homeopathy-showcase',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './homeopathy-showcase.html',
  styleUrl: './homeopathy-showcase.scss',
})
export class HomeopathyShowcase implements OnInit {
  private readonly productService = inject(ProductService);
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  products: ProductDetailModel[] = [];
  selectedVariants: Record<string, string> = {};
  addedToCartMap: Record<string, boolean> = {};

  topBrands: HomeopathyBrandItem[] = [
    { id: 'reckeweg', name: 'Dr. Reckeweg', tagline: 'GERMANY • BENSHEIM' },
    { id: 'sbl', name: 'SBL Homeopathy', tagline: 'SHARDA BOIRON • INDIA' },
    { id: 'schwabe', name: 'Dr. Willmar Schwabe', tagline: 'KARLSRUHE • GERMANY' },
    { id: 'bakson', name: "Bakson's", tagline: 'ESTD 1952 • INDIA' },
    { id: 'wheezal', name: 'Wheezal', tagline: 'HERBAL CLINICAL • INDIA' },
    { id: 'adel', name: 'Adel Pekana', tagline: 'PEKANA GERMANY' },
  ];

  ngOnInit(): void {
    this.products = this.productService.getHomeopathyProducts();
    // Default variants
    this.products.forEach((p) => {
      if (p.variants && p.variants.length > 0) {
        this.selectedVariants[p.id] = `${p.variants[0].label} ${p.variants[0].subLabel}`;
      } else {
        this.selectedVariants[p.id] = 'Standard';
      }
    });
  }

  getVariantPrice(prod: ProductDetailModel): number {
    const sel = this.selectedVariants[prod.id];
    if (!sel || !prod.variants) return prod.price;
    const found = prod.variants.find((v) => `${v.label} ${v.subLabel}` === sel);
    return found ? found.price : prod.price;
  }

  onVariantChange(prodId: string, value: string): void {
    this.selectedVariants[prodId] = value;
  }

  scrollHomeopathy(direction: 'left' | 'right'): void {
    const el = document.getElementById('homeopathyCardsGrid');
    if (el) {
      const scrollAmt = 320;
      el.scrollBy({
        left: direction === 'right' ? scrollAmt : -scrollAmt,
        behavior: 'smooth',
      });
    }
  }

  toggleFavorite(prod: ProductDetailModel, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlistService.toggleWishlist({
      id: prod.id,
      name: prod.name,
      brand: prod.brand,
      image: prod.image,
      price: this.getVariantPrice(prod),
      variant: this.selectedVariants[prod.id] || 'Standard',
      rating: prod.rating,
      reviewCount: prod.reviewCount,
    });
  }

  addToCart(prod: ProductDetailModel, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const chosenVariant = this.selectedVariants[prod.id] || (prod.variants?.[0] ? `${prod.variants[0].label} ${prod.variants[0].subLabel}` : 'Standard');
    const price = this.getVariantPrice(prod);
    const item = {
      productId: prod.id,
      name: prod.name,
      brand: prod.brand,
      image: prod.image,
      price: price,
      variant: chosenVariant,
    };

    const authenticated = this.authService.requireAuthForCart({
      item,
      quantity: 1,
      actionType: 'add',
      returnUrl: '/',
    });

    if (!authenticated) {
      return;
    }

    this.cartService.addToCart(
      {
        ...item,
        quantity: 1,
      },
      1
    );

    this.addedToCartMap[prod.id] = true;
    setTimeout(() => {
      this.addedToCartMap[prod.id] = false;
    }, 2000);
  }

  navigateToProduct(prodId: string): void {
    this.router.navigate(['/product', prodId]);
  }
}
