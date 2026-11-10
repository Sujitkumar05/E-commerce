import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { StorefrontHeader } from '../../../storefront/components/storefront-header/storefront-header';
import { Footer } from '../../../storefront/components/footer/footer';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { AuthService } from '../../../../core/auth/auth.service';
import {
  ProductService,
  ProductDetailModel,
  ProductVariant,
} from '../../../../core/services/product.service';

export interface CategoryTab {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface BrandFilterItem {
  name: string;
  count: number;
}

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StorefrontHeader, Footer],
  templateUrl: './product-catalog.html',
  styleUrl: './product-catalog.scss',
})
export class ProductCatalogPage implements OnInit {
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);
  readonly authService = inject(AuthService);
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // All catalog products
  allProducts: ProductDetailModel[] = [];

  // Filter & Search State
  searchQuery: string = '';
  selectedCategory: string = 'all';
  selectedBrands: string[] = [];
  selectedPriceRange: string = 'all';
  selectedRating: number = 0;
  onlyBestSellers: boolean = false;
  onlyOrganic: boolean = false;
  sortBy: string = 'featured';
  viewMode: 'grid' | 'grid-compact' | 'list' = 'grid';
  isMobileFilterOpen: boolean = false;

  // Track variant selections per product
  selectedVariants: Record<string, string> = {};

  // Track temporary "Added to Cart" feedback per product
  addedToCartMap: Record<string, boolean> = {};

  // Card Stepper & Carousel State
  productQuantities: Record<string, number> = {};
  activeImageIndex: Record<string, number> = {};

  readonly fallbackImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="%23f8fafc"><rect width="400" height="400" fill="%23f8fafc"/><path d="M160 180a20 20 0 100-40 20 20 0 000 40zm80 40l-50-60-60 80h160l-50-60z" fill="%23cbd5e1"/><text x="50%" y="75%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="600" fill="%2394a3b8">Product Preview</text></svg>';

  // Loading & API State
  isLoading: boolean = false;
  errorMessage: string | null = null;

  // Filter Options (adapted for DummyJSON prices)
  priceBuckets = [
    { id: 'all', label: 'All Prices' },
    { id: 'under-15', label: 'Under $15' },
    { id: '15-50', label: '$15 - $50' },
    { id: '50-150', label: '$50 - $150' },
    { id: 'above-150', label: '$150 & Above' },
  ];

  ratingBuckets = [
    { value: 0, label: 'All Ratings' },
    { value: 5.0, label: '5.0 Stars (Top Rated)' },
    { value: 4.8, label: '4.8 Stars & Above' },
    { value: 4.5, label: '4.5 Stars & Above' },
  ];

  ngOnInit(): void {
    this.loadProducts();

    // Listen to query params for search, category, brand, sort
    this.route.queryParamMap.subscribe((params) => {
      const catParam = params.get('category');
      const searchParam = params.get('search');
      const brandParam = params.get('brand');
      const sortParam = params.get('sort');
      const filterParam = params.get('filter');

      if (catParam) {
        this.selectedCategory = catParam;
      } else {
        this.selectedCategory = 'all';
      }

      // Always derive query-driven state from the current URL. Resetting absent
      // parameters prevents filters leaking between catalog navigations.
      this.searchQuery = searchParam ?? '';
      this.selectedBrands = brandParam ? [brandParam] : [];
      this.sortBy = sortParam ?? 'featured';
      this.onlyBestSellers = filterParam === 'deals' || filterParam === 'bestseller';

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Use already cached products if present
    const existing = this.productService.getAllProducts();
    if (existing && existing.length > 0) {
      this.allProducts = existing;
      this.initDefaultVariants();
      this.isLoading = false;
    }

    this.productService.fetchProductsFromApi(100).subscribe({
      next: (products) => {
        this.allProducts = products;
        this.initDefaultVariants();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch DummyJSON products', err);
        this.errorMessage = 'Could not fetch live products from DummyJSON API. Showing local catalog.';
        this.allProducts = this.productService.getAllProducts();
        this.initDefaultVariants();
        this.isLoading = false;
      }
    });
  }

  initDefaultVariants(): void {
    this.allProducts.forEach((p) => {
      if (p.variants && p.variants.length > 0 && !this.selectedVariants[p.id]) {
        this.selectedVariants[p.id] = `${p.variants[0].label} ${p.variants[0].subLabel}`;
      }
    });
  }

  retryLoad(): void {
    this.loadProducts();
  }

  onImageError(event: any): void {
    const fallback = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="%23f8fafc"><rect width="400" height="400" fill="%23f8fafc"/><path d="M160 180a20 20 0 100-40 20 20 0 000 40zm80 40l-50-60-60 80h160l-50-60z" fill="%23cbd5e1"/><text x="50%" y="75%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="600" fill="%2394a3b8">Product Preview</text></svg>';
    if (event?.target && event.target.src !== fallback) {
      event.target.src = fallback;
    }
  }


  get categories(): CategoryTab[] {
    return this.productService.getCategoriesWithCount();
  }

  get availableBrands(): BrandFilterItem[] {
    return this.productService.getBrandsWithCount();
  }

  get activeFilterCount(): number {
    let count = 0;
    if (this.selectedCategory !== 'all') count++;
    if (this.searchQuery.trim().length > 0) count++;
    if (this.selectedBrands.length > 0) count += this.selectedBrands.length;
    if (this.selectedPriceRange !== 'all') count++;
    if (this.selectedRating > 0) count++;
    if (this.onlyBestSellers) count++;
    if (this.onlyOrganic) count++;
    return count;
  }

  get activeCategoryLabel(): string {
    if (this.selectedCategory === 'all') {
      return 'All Products';
    }
    return this.productService.getCategoryDisplayName(this.selectedCategory);
  }

  get filteredProducts(): ProductDetailModel[] {
    let result = [...this.allProducts];

    // 1. Filter by category
    if (this.selectedCategory !== 'all') {
      result = result.filter(
        (p) => this.productService.getCategoryGroup(p) === this.selectedCategory
      );
    }

    // 2. Filter by search query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.categoryTag.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.aboutText.toLowerCase().includes(q) ||
          p.benefits?.some((b) => b.title.toLowerCase().includes(q) || b.desc.toLowerCase().includes(q)) ||
          p.ingredients?.some((ing) => ing.name.toLowerCase().includes(q))
      );
    }

    // 3. Filter by brand
    if (this.selectedBrands.length > 0) {
      result = result.filter((p) =>
        this.selectedBrands.some(
          (b) => b.toLowerCase() === p.brand.toLowerCase()
        )
      );
    }

    // 4. Filter by price range
    if (this.selectedPriceRange !== 'all') {
      result = result.filter((p) => {
        const price = p.price;
        switch (this.selectedPriceRange) {
          case 'under-10':
          case 'under-15':
            return price < 15;
          case '10-20':
          case '15-50':
            return price >= 15 && price <= 50;
          case '20-35':
          case '50-150':
            return price > 50 && price <= 150;
          case 'above-35':
          case 'above-150':
            return price > 150;
          default:
            return true;
        }
      });
    }

    // 5. Filter by customer rating
    if (this.selectedRating > 0) {
      result = result.filter((p) => p.rating >= this.selectedRating);
    }

    // 6. Filter by best seller flag
    if (this.onlyBestSellers) {
      result = result.filter(
        (p) => p.isBestSeller || (p.reviewCount && p.reviewCount > 300)
      );
    }

    // 7. Filter by organic
    if (this.onlyOrganic) {
      result = result.filter((p) =>
        p.badges?.some((b) => b.label.toLowerCase().includes('organic')) ||
        p.name.toLowerCase().includes('organic')
      );
    }

    // 8. Sorting
    result.sort((a, b) => {
      switch (this.sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'featured':
        default:
          return b.reviewCount - a.reviewCount;
      }
    });

    return result;
  }

  setCategory(catId: string): void {
    this.selectedCategory = catId;
    this.updateQueryParams();
  }

  onSearch(): void {
    this.updateQueryParams();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.updateQueryParams();
  }

  toggleBrand(brandName: string): void {
    const idx = this.selectedBrands.indexOf(brandName);
    if (idx > -1) {
      this.selectedBrands.splice(idx, 1);
    } else {
      this.selectedBrands.push(brandName);
    }
    this.updateQueryParams();
  }

  isBrandSelected(brandName: string): boolean {
    return this.selectedBrands.includes(brandName);
  }

  resetAllFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.selectedBrands = [];
    this.selectedPriceRange = 'all';
    this.selectedRating = 0;
    this.onlyBestSellers = false;
    this.onlyOrganic = false;
    this.sortBy = 'featured';
    this.updateQueryParams();
  }

  private updateQueryParams(): void {
    const queryParams: Record<string, any> = {};

    if (this.selectedCategory !== 'all') {
      queryParams['category'] = this.selectedCategory;
    }
    if (this.searchQuery.trim()) {
      queryParams['search'] = this.searchQuery.trim();
    }
    if (this.selectedBrands.length === 1) {
      queryParams['brand'] = this.selectedBrands[0];
    }
    if (this.sortBy !== 'featured') {
      queryParams['sort'] = this.sortBy;
    }
    if (this.onlyBestSellers) {
      queryParams['filter'] = 'bestseller';
    }

    // Replace the complete query state so removed filters disappear from the URL.
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true,
    });
  }

  // Variant selector helper
  getVariantPrice(prod: ProductDetailModel): number {
    const sel = this.selectedVariants[prod.id];
    if (!sel || !prod.variants) return prod.price;
    const found = prod.variants.find(
      (v) => `${v.label} ${v.subLabel}` === sel
    );
    return found ? found.price : prod.price;
  }

  onVariantChange(prodId: string, value: string): void {
    this.selectedVariants[prodId] = value;
  }

  toggleWishlist(prod: ProductDetailModel, event: Event): void {
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

  isInWishlist(prodId: string): boolean {
    return this.wishlistService.isInWishlist(prodId);
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
      returnUrl: this.router.url,
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
    const chosenVariant = this.selectedVariants[prod.id] || (prod.variants?.[0] ? `${prod.variants[0].label} ${prod.variants[0].subLabel}` : 'Standard');
    const price = this.getVariantPrice(prod);
    const item = {
      productId: prod.id,
      name: prod.name,
      brand: prod.brand,
      image: this.getActiveImage(prod),
      price: price,
      originalPrice: prod.originalPrice,
      discountPercent: prod.discountPercentage ? Math.round(prod.discountPercentage) : undefined,
      variant: chosenVariant,
    };

    const authenticated = this.authService.requireAuthForCart({
      item,
      quantity: qty,
      actionType: 'add',
      returnUrl: this.router.url,
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
    const chosenVariant = this.selectedVariants[prod.id] || (prod.variants?.[0] ? `${prod.variants[0].label} ${prod.variants[0].subLabel}` : 'Standard');
    const price = this.getVariantPrice(prod);
    const item = {
      productId: prod.id,
      name: prod.name,
      brand: prod.brand,
      image: this.getActiveImage(prod),
      price: price,
      originalPrice: prod.originalPrice,
      discountPercent: prod.discountPercentage ? Math.round(prod.discountPercentage) : undefined,
      variant: chosenVariant,
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
}
