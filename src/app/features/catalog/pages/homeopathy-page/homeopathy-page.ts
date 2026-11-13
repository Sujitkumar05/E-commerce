import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { StorefrontHeader } from '../../../storefront/components/storefront-header/storefront-header';
import { Footer } from '../../../storefront/components/footer/footer';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { BannerService } from '../../../../core/services/banner.service';
import {
  ProductService,
  ProductDetailModel,
} from '../../../../core/services/product.service';

export interface HomeopathySubCategoryTab {
  id: string;
  name: string;
  icon: string;
  count: number;
}

@Component({
  selector: 'app-homeopathy-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StorefrontHeader, Footer],
  templateUrl: './homeopathy-page.html',
  styleUrl: './homeopathy-page.scss',
})
export class HomeopathyPage implements OnInit {
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);
  readonly authService = inject(AuthService);
  readonly bannerService = inject(BannerService);
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  get headerBanner() {
    const list = this.bannerService.getActiveBannersBySection('Homeopathy Header Banner');
    return list.length > 0
      ? list[0]
      : {
          title: 'Indian Homeopathic Remedies',
          subtitle:
            "Discover authentic homeopathic formulations from India’s leading trusted laboratories: Dr. Reckeweg, SBL Homeopathy, Dr. Willmar Schwabe, Bakson's, and Wheezal. Sealed, seal-intact dilutions, biochemic salts, mother tinctures, and specialized healthcare items.",
          badgeText: 'CERTIFIED INDIAN HOMEOPATHY & HEALTHCARE',
          image: '/images/wellness/triphala-capsules.jpg',
        };
  }

  // All Homeopathy products
  allProducts: ProductDetailModel[] = [];

  // Filter & Search State
  searchQuery: string = '';
  selectedSubCategory: string = 'all';
  selectedBrands: string[] = [];
  selectedPriceRange: string = 'all';
  selectedConcern: string = 'all';
  selectedRating: number = 0;
  onlyBestSellers: boolean = false;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'bestsellers' = 'featured';

  // Variant selections per product
  selectedVariants: Record<string, string> = {};
  addedToCartMap: Record<string, boolean> = {};

  // Subcategory tabs with dynamic count
  subCategories: HomeopathySubCategoryTab[] = [];

  // Brands with counts
  brandFilters: { name: string; count: number }[] = [];

  // Health Concerns
  healthConcerns = [
    { id: 'all', label: 'All Concerns' },
    { id: 'inflammation', label: 'Immunity & Inflammation' },
    { id: 'hair', label: 'Hair & Scalp Health' },
    { id: 'eye', label: 'Eye Care & Vision' },
    { id: 'vitality', label: 'Restorative Vitality & Stamina' },
    { id: 'joint', label: 'Joint & Muscular Pain' },
  ];

  ngOnInit(): void {
    this.allProducts = this.productService.getHomeopathyProducts();

    // Init variant defaults
    this.allProducts.forEach((p) => {
      if (p.variants && p.variants.length > 0) {
        this.selectedVariants[p.id] = `${p.variants[0].label} ${p.variants[0].subLabel}`;
      } else {
        this.selectedVariants[p.id] = 'Standard';
      }
    });

    this.calculateCategoryTabs();
    this.calculateBrandFilters();

    // Query param subscriptions
    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('search');
      if (q !== null) this.searchQuery = q;

      const sub = params.get('subcategory');
      if (sub) this.selectedSubCategory = sub;

      const br = params.get('brand');
      if (br) this.selectedBrands = [br];

      const concern = params.get('concern');
      if (concern) this.selectedConcern = concern;

      const sort = params.get('sort');
      if (sort && ['featured', 'price-low', 'price-high', 'rating', 'bestsellers'].includes(sort)) {
        this.sortBy = sort as any;
      }
    });
  }

  private calculateCategoryTabs(): void {
    const medicinesCount = this.allProducts.filter((p) => (p.categoryTag || '').includes('MEDICINE')).length;
    const remediesCount = this.allProducts.filter((p) => (p.categoryTag || '').includes('REMEDY')).length;
    const healthcareCount = this.allProducts.filter((p) => (p.categoryTag || '').includes('HEALTHCARE')).length;

    this.subCategories = [
      { id: 'all', name: 'All Homeopathy', icon: 'fa-cubes', count: this.allProducts.length },
      { id: 'medicines', name: 'Homeopathic Medicines', icon: 'fa-prescription-bottle', count: medicinesCount },
      { id: 'remedies', name: 'Targeted Remedies', icon: 'fa-shield-halved', count: remediesCount },
      { id: 'healthcare', name: 'Healthcare & Tonics', icon: 'fa-heart-pulse', count: healthcareCount },
    ];
  }

  private calculateBrandFilters(): void {
    const counts: Record<string, number> = {};
    this.allProducts.forEach((p) => {
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    this.brandFilters = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  get filteredProducts(): ProductDetailModel[] {
    let result = [...this.allProducts];

    // 1. Search Query filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.categoryTitle.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.aboutText.toLowerCase().includes(q)
      );
    }

    // 2. SubCategory filter
    if (this.selectedSubCategory !== 'all') {
      if (this.selectedSubCategory === 'medicines') {
        result = result.filter((p) => (p.categoryTag || '').includes('MEDICINE'));
      } else if (this.selectedSubCategory === 'remedies') {
        result = result.filter((p) => (p.categoryTag || '').includes('REMEDY'));
      } else if (this.selectedSubCategory === 'healthcare') {
        result = result.filter((p) => (p.categoryTag || '').includes('HEALTHCARE'));
      }
    }

    // 3. Brand filter
    if (this.selectedBrands.length > 0) {
      result = result.filter((p) => this.selectedBrands.includes(p.brand));
    }

    // 4. Concern filter
    if (this.selectedConcern !== 'all') {
      const c = this.selectedConcern.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(c) ||
          p.categoryTitle.toLowerCase().includes(c) ||
          p.subtitle.toLowerCase().includes(c) ||
          p.aboutText.toLowerCase().includes(c)
      );
    }

    // 5. Price range filter
    if (this.selectedPriceRange !== 'all') {
      result = result.filter((p) => {
        const price = this.getVariantPrice(p);
        switch (this.selectedPriceRange) {
          case 'under-10':
            return price < 10;
          case '10-15':
            return price >= 10 && price <= 15;
          case '15-20':
            return price > 15 && price <= 20;
          case 'above-20':
            return price > 20;
          default:
            return true;
        }
      });
    }

    // 6. Rating filter
    if (this.selectedRating > 0) {
      result = result.filter((p) => p.rating >= this.selectedRating);
    }

    // 7. Best sellers only
    if (this.onlyBestSellers) {
      result = result.filter((p) => p.isBestSeller);
    }

    // Sorting
    switch (this.sortBy) {
      case 'price-low':
        result.sort((a, b) => this.getVariantPrice(a) - this.getVariantPrice(b));
        break;
      case 'price-high':
        result.sort((a, b) => this.getVariantPrice(b) - this.getVariantPrice(a));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'bestsellers':
        result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      case 'featured':
      default:
        break;
    }

    return result;
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

  selectSubCategory(catId: string): void {
    this.selectedSubCategory = catId;
    this.syncQueryParams();
  }

  toggleBrand(brandName: string): void {
    const index = this.selectedBrands.indexOf(brandName);
    if (index > -1) {
      this.selectedBrands.splice(index, 1);
    } else {
      this.selectedBrands.push(brandName);
    }
    this.syncQueryParams();
  }

  isBrandSelected(brandName: string): boolean {
    return this.selectedBrands.includes(brandName);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedSubCategory = 'all';
    this.selectedBrands = [];
    this.selectedPriceRange = 'all';
    this.selectedConcern = 'all';
    this.selectedRating = 0;
    this.onlyBestSellers = false;
    this.sortBy = 'featured';
    this.syncQueryParams();
  }

  hasActiveFilters(): boolean {
    return (
      this.searchQuery.trim().length > 0 ||
      this.selectedSubCategory !== 'all' ||
      this.selectedBrands.length > 0 ||
      this.selectedPriceRange !== 'all' ||
      this.selectedConcern !== 'all' ||
      this.selectedRating > 0 ||
      this.onlyBestSellers ||
      this.sortBy !== 'featured'
    );
  }

  syncQueryParams(): void {
    const queryParams: Record<string, string | null> = {};
    if (this.selectedSubCategory !== 'all') {
      queryParams['subcategory'] = this.selectedSubCategory;
    }
    if (this.searchQuery.trim()) {
      queryParams['search'] = this.searchQuery.trim();
    }
    if (this.selectedBrands.length === 1) {
      queryParams['brand'] = this.selectedBrands[0];
    }
    if (this.selectedConcern !== 'all') {
      queryParams['concern'] = this.selectedConcern;
    }
    if (this.sortBy !== 'featured') {
      queryParams['sort'] = this.sortBy;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
    });
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
      returnUrl: '/homeopathy',
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

  buyNow(prod: ProductDetailModel, event: Event): void {
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
      actionType: 'buy',
      returnUrl: '/homeopathy',
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
    this.router.navigate(['/cart']);
  }

  navigateToProduct(prodId: string): void {
    this.router.navigate(['/product', prodId]);
  }
}
