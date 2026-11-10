import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HeroBanner } from '../../components/hero-banner/hero-banner';
import { SpecialityShowcase } from '../../components/speciality-showcase/speciality-showcase';
import { FeaturedProducts } from '../../components/featured-products/featured-products';
import { BentoShowcase } from '../../components/bento-showcase/bento-showcase';
import { StorefrontHeader } from '../../components/storefront-header/storefront-header';
import { Footer } from '../../components/footer/footer';
import { HomeopathyShowcase } from '../../components/homeopathy-showcase/homeopathy-showcase';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ProductService, ProductDetailModel } from '../../../../core/services/product.service';

export interface TrustFeature {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
}

export interface ExploreCategory {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  bgGradient: string;
  arrowBg: string;
  arrowColor: string;
}

export interface WellnessProduct {
  id: string;
  name: string;
  brand: string;
  image: string;
  bgGradient: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  isBestSeller: boolean;
  isFavorite?: boolean;
  variants: string[];
  selectedVariant: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, HeroBanner, StorefrontHeader, FeaturedProducts, BentoShowcase, Footer, SpecialityShowcase, HomeopathyShowcase],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);
  readonly authService = inject(AuthService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  // Live DummyJSON Products State
  products: ProductDetailModel[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;
  selectedCategory: string = 'all';
  addedToCartMap: Record<string, boolean> = {};

  // Product Card Stepper & Carousel State
  productQuantities: Record<string, number> = {};
  activeImageIndex: Record<string, number> = {};

  readonly fallbackImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="%23f8fafc"><rect width="400" height="400" fill="%23f8fafc"/><path d="M160 180a20 20 0 100-40 20 20 0 000 40zm80 40l-50-60-60 80h160l-50-60z" fill="%23cbd5e1"/><text x="50%" y="75%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="600" fill="%2394a3b8">Product Preview</text></svg>';

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.productService.fetchProductsFromApi(30, true).subscribe({
      next: (prods) => {
        this.products = prods;
        this.isLoading = false;

        // Also dynamically populate wellness products from live API products
        if (prods && prods.length > 0) {
          const apiWellness = prods.slice(0, 8);
          this.wellnessProducts = apiWellness.map((p, idx) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            image: p.image,
            bgGradient: [
              'linear-gradient(180deg, #fdfbf7 0%, #f7f2ea 100%)',
              'linear-gradient(180deg, #fcfafc 0%, #f7edf7 100%)',
              'linear-gradient(180deg, #f5f9fc 0%, #eaf2f8 100%)',
              'linear-gradient(180deg, #fff8f8 0%, #faecec 100%)',
            ][idx % 4],
            price: p.price,
            originalPrice: p.originalPrice,
            discountPercent: p.discountPercentage ? Math.round(p.discountPercentage) : undefined,
            rating: p.rating,
            reviewCount: p.reviewCount,
            isBestSeller: p.isBestSeller ?? true,
            isFavorite: this.wishlistService.isInWishlist(p.id),
            variants: p.variants?.map((v) => `${v.label} ${v.subLabel}`) || ['Standard 1 Unit'],
            selectedVariant: p.variants?.[0] ? `${p.variants[0].label} ${p.variants[0].subLabel}` : 'Standard 1 Unit',
          }));
        }
      },
      error: (err) => {
        console.error('Failed to fetch DummyJSON products for Storefront:', err);
        this.errorMessage = 'Could not load live products from DummyJSON API. Please check your network connection and retry.';
        this.isLoading = false;
      },
    });
  }

  retryLoad(): void {
    this.loadProducts();
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && target.src !== this.fallbackImage) {
      target.src = this.fallbackImage;
    }
  }

  get categoriesList(): { id: string; name: string; count: number }[] {
    const counts: Record<string, number> = { all: this.products.length };
    this.products.forEach((p) => {
      const cat = p.category || (p.categoryTag || 'General').toLowerCase().replace(/\s+/g, '-');
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const list: { id: string; name: string; count: number }[] = [
      { id: 'all', name: 'All Products', count: this.products.length },
    ];

    Object.keys(counts)
      .filter((k) => k !== 'all')
      .forEach((cat) => {
        list.push({
          id: cat,
          name: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' '),
          count: counts[cat],
        });
      });

    return list;
  }

  get filteredProducts(): ProductDetailModel[] {
    if (this.selectedCategory === 'all') {
      return this.products;
    }
    return this.products.filter(
      (p) =>
        p.category === this.selectedCategory ||
        (p.categoryTag || '').toLowerCase().replace(/\s+/g, '-') === this.selectedCategory
    );
  }

  setCategory(catId: string): void {
    this.selectedCategory = catId;
  }

  isInWishlist(id: string): boolean {
    return this.wishlistService.isInWishlist(id);
  }

  toggleWishlist(prod: ProductDetailModel, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlistService.toggleWishlist({
      id: prod.id,
      name: prod.name,
      brand: prod.brand,
      image: prod.image,
      price: prod.price,
      originalPrice: prod.originalPrice,
      rating: prod.rating,
      reviewCount: prod.reviewCount,
      variant: prod.variants?.[0] ? `${prod.variants[0].label} ${prod.variants[0].subLabel}` : 'Standard',
    });
  }

  addToCartFromStorefront(prod: ProductDetailModel, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const item = {
      productId: prod.id,
      name: prod.name,
      brand: prod.brand,
      image: prod.image,
      price: prod.price,
      originalPrice: prod.originalPrice,
      discountPercent: prod.discountPercentage ? Math.round(prod.discountPercentage) : undefined,
      variant: prod.variants?.[0] ? `${prod.variants[0].label} ${prod.variants[0].subLabel}` : 'Standard',
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
    }, 1500);
  }

  // --- Reference Design Card Interaction Helpers ---
  getQuantity(productId: string): number {
    return this.productQuantities[productId] || 1;
  }

  increaseQuantity(productId: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const current = this.getQuantity(productId);
    this.productQuantities[productId] = current + 1;
  }

  decreaseQuantity(productId: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const current = this.getQuantity(productId);
    if (current > 1) {
      this.productQuantities[productId] = current - 1;
    }
  }

  getActiveImage(prod: ProductDetailModel): string {
    const images = (prod.galleryImages && prod.galleryImages.length > 0) ? prod.galleryImages : [prod.image];
    const idx = this.getActiveImageIndex(prod.id);
    return images[idx] || prod.image;
  }

  getActiveImageIndex(productId: string): number {
    return this.activeImageIndex[productId] || 0;
  }

  setImageIndex(productId: string, index: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.activeImageIndex[productId] = index;
  }

  onAddToCart(prod: ProductDetailModel, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const qty = this.getQuantity(prod.id);
    const item = {
      productId: prod.id,
      name: prod.name,
      brand: prod.brand,
      image: this.getActiveImage(prod),
      price: prod.price,
      originalPrice: prod.originalPrice,
      discountPercent: prod.discountPercentage ? Math.round(prod.discountPercentage) : undefined,
      variant: prod.variants?.[0] ? `${prod.variants[0].label} ${prod.variants[0].subLabel}` : 'Standard',
    };

    const authenticated = this.authService.requireAuthForCart({
      item,
      quantity: qty,
      actionType: 'add',
      returnUrl: '/',
    });

    if (!authenticated) {
      return;
    }

    this.cartService.addToCart(
      {
        ...item,
        quantity: qty,
      },
      qty
    );

    this.addedToCartMap[prod.id] = true;
    setTimeout(() => {
      this.addedToCartMap[prod.id] = false;
    }, 2000);
  }

  onBuyNow(prod: ProductDetailModel, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const qty = this.getQuantity(prod.id);
    const item = {
      productId: prod.id,
      name: prod.name,
      brand: prod.brand,
      image: this.getActiveImage(prod),
      price: prod.price,
      originalPrice: prod.originalPrice,
      discountPercent: prod.discountPercentage ? Math.round(prod.discountPercentage) : undefined,
      variant: prod.variants?.[0] ? `${prod.variants[0].label} ${prod.variants[0].subLabel}` : 'Standard',
    };

    const authenticated = this.authService.requireAuthForCart({
      item,
      quantity: qty,
      actionType: 'buy',
      returnUrl: '/cart',
    });

    if (!authenticated) {
      return;
    }

    this.cartService.addToCart(
      {
        ...item,
        quantity: qty,
      },
      qty
    );

    this.router.navigate(['/cart']);
  }


categories: ExploreCategory[] = [
    {
      id: 'electronics',
      title: 'Electronics',
      subtitle: 'Latest tech & gadgets',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(180deg, #edf4fe 0%, #e2ecfc 100%)',
      arrowBg: '#dbeafe',
      arrowColor: '#1748D8',
    },
    {
      id: 'home-living',
      title: 'Home & Living',
      subtitle: 'Comfort for every space',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(180deg, #fdf6ea 0%, #fbf0dc 100%)',
      arrowBg: '#faeed7',
      arrowColor: '#b45309',
    },
    {
      id: 'beauty',
      title: 'Beauty',
      subtitle: 'Skincare, makeup & more',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(180deg, #fcf0f5 0%, #fae2ed 100%)',
      arrowBg: '#fce7f3',
      arrowColor: '#be185d',
    },
    {
      id: 'fashion',
      title: 'Fashion',
      subtitle: 'Style for every you',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(180deg, #edf2fe 0%, #e1e9fd 100%)',
      arrowBg: '#e0e7ff',
      arrowColor: '#4338ca',
    },
    {
      id: 'food-pantry',
      title: 'Food & Pantry',
      subtitle: 'Global tastes, local comfort',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(180deg, #eefaf1 0%, #e1f5e6 100%)',
      arrowBg: '#dcfce7',
      arrowColor: '#15803d',
    },
    {
      id: 'ayurveda',
      title: 'Ayurveda',
      subtitle: 'Traditional wellness',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(180deg, #eef7ed 0%, #e2f2e0 100%)',
      arrowBg: '#dcfce7',
      arrowColor: '#166534',
    },
    {
      id: 'gifts',
      title: 'Gifts',
      subtitle: 'Thoughtful finds',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(180deg, #f3f0fd 0%, #e9e3fc 100%)',
      arrowBg: '#ede9fe',
      arrowColor: '#6d28d9',
    },
  ];

  trustFeatures: TrustFeature[] = [
    {
      id: 'verified',
      icon: 'fa-solid fa-shield-halved',
      title: 'Verified Global Sellers',
      subtitle: 'Shop with confidence',
    },
    {
      id: 'delivery',
      icon: 'fa-solid fa-truck-fast',
      title: 'Reliable International Delivery',
      subtitle: 'To 100+ countries',
    },
    {
      id: 'security',
      icon: 'fa-solid fa-shield-cat',
      title: 'Secure Payments',
      subtitle: 'Multiple options',
    },
    {
      id: 'returns',
      icon: 'fa-solid fa-box-open',
      title: 'Easy Returns',
      subtitle: 'Hassle-free shopping',
    },
    {
      id: 'support',
      icon: 'fa-solid fa-headset',
      title: '24/7 Support',
      subtitle: "We're here to help",
    },
  ];

  wellnessProducts: WellnessProduct[] = [
    {
      id: 'isha-neem-turmeric',
      name: 'Isha Life Neem and Turmeric Capsules',
      brand: 'Isha Life',
      image: '/images/wellness/neem-turmeric.jpg',
      bgGradient: 'linear-gradient(180deg, #fdfbf7 0%, #f7f2ea 100%)',
      price: 12.45,
      rating: 4.5,
      reviewCount: 1064,
      isBestSeller: true,
      isFavorite: false,
      variants: ['60 caps + 60 caps / Pack of 1', '120 caps + 120 caps / Pack of 2'],
      selectedVariant: '60 caps + 60 caps / Pack of 1',
    },
    {
      id: 'patanjali-giloy',
      name: 'Patanjali Giloy Ghanvati',
      brand: 'Patanjali',
      image: '/images/wellness/patanjali-giloy.jpg',
      bgGradient: 'linear-gradient(180deg, #fcfafc 0%, #f7edf7 100%)',
      price: 5.0,
      rating: 4.5,
      reviewCount: 227,
      isBestSeller: true,
      isFavorite: false,
      variants: ['60 tabs / Pack of 1', '120 tabs / Pack of 2', '60 tabs / Pack of 3'],
      selectedVariant: '60 tabs / Pack of 1',
    },
    {
      id: 'himalaya-liv52',
      name: 'Himalaya Liv.52 Herbal Supplement Tablets - 100...',
      brand: 'Himalaya',
      image: '/images/wellness/himalaya-liv52.jpg',
      bgGradient: 'linear-gradient(180deg, #f5f9fc 0%, #eaf2f8 100%)',
      price: 8.58,
      originalPrice: 9.53,
      discountPercent: 10,
      rating: 4.5,
      reviewCount: 249,
      isBestSeller: true,
      isFavorite: false,
      variants: ['100 tabs / Pack of 1', '200 tabs / Pack of 2', '60 tabs / Pack of 1'],
      selectedVariant: '100 tabs / Pack of 1',
    },
    {
      id: 'dabur-chyawanprash',
      name: 'Dabur Chyawanprash Immunity Booster - 1kg',
      brand: 'Dabur',
      image: '/images/wellness/dabur-chyawanprash.jpg',
      bgGradient: 'linear-gradient(180deg, #fff8f8 0%, #faecec 100%)',
      price: 9.2,
      originalPrice: 11.5,
      discountPercent: 20,
      rating: 4.8,
      reviewCount: 852,
      isBestSeller: true,
      isFavorite: false,
      variants: ['1 kg / Pack of 1', '500 g / Pack of 1', '2 kg / Value Pack'],
      selectedVariant: '1 kg / Pack of 1',
    },
  ];

  scrollWellness(direction: 'left' | 'right'): void {
    const el = document.getElementById('wellnessCardsGrid');
    if (el) {
      const scrollAmt = 280;
      el.scrollBy({
        left: direction === 'right' ? scrollAmt : -scrollAmt,
        behavior: 'smooth',
      });
    }
  }

  toggleWellnessFavorite(prod: WellnessProduct, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlistService.toggleWishlist({
      id: prod.id,
      name: prod.name,
      brand: prod.brand,
      image: prod.image,
      price: prod.price,
      originalPrice: prod.originalPrice,
      rating: prod.rating,
      reviewCount: prod.reviewCount,
      variant: prod.selectedVariant || prod.variants?.[0] || 'Standard',
    });
    prod.isFavorite = this.wishlistService.isInWishlist(prod.id);
  }

  addToCart(prod: WellnessProduct, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const item = {
      productId: prod.id,
      name: prod.name,
      brand: prod.brand,
      image: prod.image,
      price: prod.price,
      originalPrice: prod.originalPrice,
      discountPercent: prod.discountPercent,
      variant: prod.selectedVariant || prod.variants?.[0] || 'Standard',
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
}
