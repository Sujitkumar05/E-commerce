import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { BannerService } from '../../../../core/services/banner.service';
import {
  ProductService,
  ProductDetailModel,
  ProductVariant,
  BenefitItem,
  IngredientItem,
  UsageStep,
  ReviewItem,
  TrustBadgeItem,
} from '../../../../core/services/product.service';

export interface RelatedProductCard {
  id: string;
  name: string;
  brand: string;
  image: string;
  rating: number;
  reviewCount: number;
  price: number;
  variants: string[];
  selectedVariant: string;
  isFavorite?: boolean;
}

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetails implements OnInit {
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);
  readonly authService = inject(AuthService);
  private readonly bannerService = inject(BannerService);
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  get activePowerBanner() {
    const list = this.bannerService.getActiveBannersBySection('Product Details Power Card');
    if (list && list.length > 0) {
      const b = list[0];
      return {
        title: b.title,
        subtitle: b.subtitle,
        checkItems: this.powerBanner.checkItems,
        image: b.image || this.powerBanner.image,
      };
    }
    return this.powerBanner;
  }

  @Input() productId: string = 'isha-neem-turmeric';

  // Category and navigation metadata
  categoryGroup: string = 'wellness';
  categoryDisplayName: string = 'Natural Supplements & Wellness';
  justAddedToCart: boolean = false;

  // Product metadata
  brand: string = 'ISHA LIFE';
  title: string = 'Isha Life Neem and Turmeric Capsules';
  subtitle: string =
    'Natural care for your health, with the power of Neem & Turmeric. Helps support immunity, digestion and overall wellness.';
  aboutText: string =
    "Isha Life Neem and Turmeric Capsules are a powerful blend of nature's finest ingredients. Enriched with pure neem and turmeric extract, these capsules help support your immune system, improve digestion and promote overall wellness. With added black pepper extract for better absorption, you get the maximum benefits from every capsule.";
  categoryTag: string = 'NATURAL SUPPLEMENTS';
  categoryTitle: string = 'Neem & Turmeric Capsules';
  categorySubtitle: string = 'Pure goodness of nature for a healthier you.';

  rating: number = 5.0;
  reviewCount: number = 1064;
  isFavorite: boolean = false;

  // Gallery
  mainImage: string = '/images/wellness/neem-turmeric.jpg';
  galleryImages: string[] = [
    '/images/wellness/neem-turmeric.jpg',
    '/images/wellness/turmeric-bowl-thumb.jpg',
    '/images/wellness/supplement-facts.svg',
    '/images/wellness/neem-bottle-nature.jpg',
  ];
  selectedThumbIndex: number = 0;

  // Variants & pricing
  variants: ProductVariant[] = [
    { label: '60 Caps', subLabel: '(1 Pack)', price: 12.45 },
    { label: '120 Caps', subLabel: '(2 Pack)', price: 22.99 },
    { label: '180 Caps', subLabel: '(3 Pack)', price: 31.99 },
  ];
  selectedVariantIndex: number = 0;

  // Badges & Features
  badges: TrustBadgeItem[] = [
    { icon: 'fa-leaf', label: '100% Organic' },
    { icon: 'fa-droplet', label: 'No Chemicals' },
    { icon: 'fa-shield-halved', label: 'Better Immunity' },
    { icon: 'fa-spa', label: 'Natural Healing' },
  ];

  aboutBadges: { title: string; icon: string }[] = [
    { title: 'Boosts Immunity', icon: 'fa-shield-halved' },
    { title: 'Supports Digestion', icon: 'fa-dna' },
    { title: 'Anti-Inflammatory Properties', icon: 'fa-leaf' },
    { title: 'Overall Wellness', icon: 'fa-spa' },
  ];

  powerBanner = {
    title: 'The Power of<br>Neem &amp; Turmeric',
    subtitle: 'Ancient wisdom, Modern wellness.',
    checkItems: ['Pure & Natural Ingredients', 'No Artificial Additives', 'Sourced from Trusted Farms'],
    image: '/images/wellness/turmeric-bowl-thumb.jpg',
  };

  // Quantity
  quantity: number = 1;

  // Active tab state
  activeTab: 'description' | 'benefits' | 'ingredients' | 'howToUse' | 'reviews' = 'description';

  // Benefits list for tab
  benefitsList: BenefitItem[] = [];

  // Ingredients list for tab
  ingredientsList: IngredientItem[] = [];

  // How to use steps
  usageSteps: UsageStep[] = [];

  // Reviews list
  reviews: ReviewItem[] = [];

  // Related products from Screenshot
  relatedProducts: RelatedProductCard[] = [];

  ngOnInit(): void {
    // Subscribe to route params to handle direct URL load and back/forward navigation
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      const targetId = id || this.productId || 'isha-neem-turmeric';
      this.loadProduct(targetId);
    });
  }

  loadProduct(id: string): void {
    this.productService.loadProductById(id).subscribe((product) => {
      if (!product) return;
      this.productId = product.id;
      this.brand = product.brand;
      this.title = product.name;
      this.subtitle = product.subtitle;
      this.aboutText = product.aboutText;
      this.categoryTag = product.categoryTag;
      this.categoryTitle = product.categoryTitle;
      this.categorySubtitle = product.categorySubtitle;
      this.categoryGroup = this.productService.getCategoryGroup(product);
      this.categoryDisplayName = this.productService.getCategoryDisplayName(this.categoryGroup);
      this.rating = product.rating;
      this.reviewCount = product.reviewCount;
      this.mainImage = product.image;
      this.galleryImages = product.galleryImages && product.galleryImages.length > 0 ? product.galleryImages : [product.image];
      this.selectedThumbIndex = 0;
      this.variants = product.variants && product.variants.length > 0 ? product.variants : [{ label: 'Standard', subLabel: '1 Unit', price: product.price }];
      this.selectedVariantIndex = 0;
      this.quantity = 1;
      this.badges = product.badges || [];
      this.aboutBadges = product.aboutBadges || [];
      this.powerBanner = product.powerBanner || {
        title: product.name,
        subtitle: product.subtitle,
        checkItems: ['Verified Quality', 'Fast Shipping', 'Authentic'],
        image: product.image
      };
      this.benefitsList = product.benefits || [];
      this.ingredientsList = product.ingredients || [];
      this.usageSteps = product.usageSteps || [];
      this.reviews = product.reviews || [];
      this.isFavorite = this.wishlistService.isInWishlist(product.id);

      // Load related products excluding current product
      const related = this.productService.getRelatedProducts(product.id, 4);
      this.relatedProducts = related.map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        image: p.image,
        rating: p.rating,
        reviewCount: p.reviewCount,
        price: p.price,
        variants: p.variants?.length ? p.variants.map((v) => `${v.label} ${v.subLabel}`) : ['Standard 1 Unit'],
        selectedVariant: p.variants?.[0] ? `${p.variants[0].label} ${p.variants[0].subLabel}` : 'Standard 1 Unit',
        isFavorite: this.wishlistService.isInWishlist(p.id),
      }));

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  get currentPrice(): number {
    return this.variants[this.selectedVariantIndex]?.price ?? 12.45;
  }

  get currentVariantLabel(): string {
    const v = this.variants[this.selectedVariantIndex];
    return v ? `${v.label} ${v.subLabel}` : 'Standard';
  }

  selectThumbnail(index: number): void {
    this.selectedThumbIndex = index;
    if (this.galleryImages[index]) {
      this.mainImage = this.galleryImages[index];
    }
  }

  selectVariant(index: number): void {
    this.selectedVariantIndex = index;
  }

  incrementQty(): void {
    this.quantity++;
  }

  decrementQty(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    const item = {
      productId: this.productId,
      name: this.title,
      brand: this.brand,
      image: this.mainImage,
      price: this.currentPrice,
      variant: this.currentVariantLabel,
    };

    const authenticated = this.authService.requireAuthForCart({
      item,
      quantity: this.quantity,
      actionType: 'add',
      returnUrl: '/product/' + this.productId,
    });

    if (!authenticated) {
      return;
    }

    this.cartService.addToCart(
      {
        ...item,
        quantity: this.quantity,
      },
      this.quantity
    );
    this.justAddedToCart = true;
    setTimeout(() => {
      this.justAddedToCart = false;
    }, 2200);
  }

  buyNow(): void {
    const item = {
      productId: this.productId,
      name: this.title,
      brand: this.brand,
      image: this.mainImage,
      price: this.currentPrice,
      variant: this.currentVariantLabel,
    };

    const authenticated = this.authService.requireAuthForCart({
      item,
      quantity: this.quantity,
      actionType: 'buy',
      returnUrl: '/product/' + this.productId,
    });

    if (!authenticated) {
      return;
    }

    this.cartService.addToCart(
      {
        ...item,
        quantity: this.quantity,
      },
      this.quantity
    );
    this.router.navigate(['/cart']);
  }

  addRelatedToCart(prod: RelatedProductCard, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const item = {
      productId: prod.id,
      name: prod.name,
      brand: prod.brand,
      image: prod.image,
      price: prod.price,
      variant: prod.selectedVariant || prod.variants[0],
    };

    const authenticated = this.authService.requireAuthForCart({
      item,
      quantity: 1,
      actionType: 'add',
      returnUrl: '/product/' + this.productId,
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

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlistService.toggleWishlist({
      id: this.productId,
      name: this.title,
      brand: this.brand,
      image: this.mainImage,
      price: this.currentPrice,
      variant: this.currentVariantLabel,
      rating: this.rating,
      reviewCount: this.reviewCount,
    });
    this.isFavorite = this.wishlistService.isInWishlist(this.productId);
  }

  toggleRelatedFavorite(prod: RelatedProductCard, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlistService.toggleWishlist({
      id: prod.id,
      name: prod.name,
      brand: prod.brand,
      image: prod.image,
      price: prod.price,
      variant: prod.selectedVariant || prod.variants[0],
      rating: prod.rating,
      reviewCount: prod.reviewCount,
    });
    prod.isFavorite = this.wishlistService.isInWishlist(prod.id);
  }

  navigateToProduct(productId: string): void {
    this.router.navigate(['/product', productId]);
  }
}
