import { Component, inject, OnInit } from '@angular/core';
import { ProductService } from '../../../../core/services/product.service';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { AuthService } from '../../../../core/auth/auth.service';

export interface TrendingProduct {
  id: string;
  title: string;
  image: string;
  bgGradient: string;
  rating: number;
  shipsInternationally: boolean;
  price: number;
  isVerified: boolean;
  isFavorite?: boolean;
}

@Component({
  selector: 'app-featured-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.scss',
})
export class FeaturedProducts implements OnInit {
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);

  products: TrendingProduct[] = [
    {
      id: 'daily-balance-blend',
      title: 'Daily Balance Blend',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(180deg, #fbf7f0 0%, #f4ede2 100%)',
      rating: 4.8,
      shipsInternationally: true,
      price: 24.0,
      isVerified: true,
      isFavorite: false,
    },
    {
      id: 'saffron-glow-ritual',
      title: 'Saffron Glow Ritual',
      image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(180deg, #faedf3 0%, #f5dde8 100%)',
      rating: 4.8,
      shipsInternationally: true,
      price: 38.0,
      isVerified: true,
      isFavorite: false,
    },
    {
      id: 'regional-pantry-box',
      title: 'Regional Pantry Box',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(180deg, #f5f8f2 0%, #ebf2e5 100%)',
      rating: 4.8,
      shipsInternationally: true,
      price: 29.0,
      isVerified: true,
      isFavorite: false,
    },
    {
      id: 'artisan-serve-set',
      title: 'Artisan Serve Set',
      image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(180deg, #edf3f9 0%, #e1ecf5 100%)',
      rating: 4.8,
      shipsInternationally: true,
      price: 52.0,
      isVerified: true,
      isFavorite: false,
    },
  ];

  ngOnInit(): void {
    this.productService.apiProducts$.subscribe((apiProds) => {
      if (apiProds && apiProds.length >= 4) {
        // Pick 4 top-rated trending products from DummyJSON
        const topTrending = [...apiProds]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4);

        const gradients = [
          'linear-gradient(180deg, #fbf7f0 0%, #f4ede2 100%)',
          'linear-gradient(180deg, #faedf3 0%, #f5dde8 100%)',
          'linear-gradient(180deg, #f5f8f2 0%, #ebf2e5 100%)',
          'linear-gradient(180deg, #edf3f9 0%, #e1ecf5 100%)',
        ];

        this.products = topTrending.map((p, idx) => ({
          id: p.id,
          title: p.name,
          image: p.image,
          bgGradient: gradients[idx % gradients.length],
          rating: p.rating,
          shipsInternationally: true,
          price: p.price,
          isVerified: true,
          isFavorite: this.wishlistService.isInWishlist(p.id),
        }));
      }
    });
  }

  readonly fallbackImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="%23f8fafc"><rect width="400" height="400" fill="%23f8fafc"/><path d="M160 180a20 20 0 100-40 20 20 0 000 40zm80 40l-50-60-60 80h160l-50-60z" fill="%23cbd5e1"/><text x="50%" y="75%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="600" fill="%2394a3b8">Product Preview</text></svg>';

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && target.src !== this.fallbackImage) {
      target.src = this.fallbackImage;
    }
  }

  toggleFavorite(product: TrendingProduct, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlistService.toggleWishlist({
      id: product.id,
      name: product.title,
      brand: 'Your Store Curated',
      image: product.image,
      price: product.price,
      rating: product.rating,
      variant: 'Standard Pack',
    });
    product.isFavorite = this.wishlistService.isInWishlist(product.id);
  }

  addToCart(product: TrendingProduct, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const item = {
      productId: product.id,
      name: product.title,
      brand: 'Your Store Curated',
      image: product.image,
      price: product.price,
      variant: 'Standard Pack',
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
  }

  navigateToProduct(productId: string): void {
    this.router.navigate(['/product', productId]);
  }
}
