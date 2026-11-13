import { Component, inject, OnInit, signal } from '@angular/core';
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

export interface CategoryBrand {
  name: string;
  logo: string;
}

export interface CategorySubcategory {
  id: string;
  name: string;
  icon?: string;
  query?: string;
}

export interface CategoryBenefitItem {
  label: string;
  icon: string;
}

export interface CatalogBannerItem {
  id: string;
  categoryId: string;
  title: string;
  image: string;
}

export interface CategoryShowcase {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  button: string;
  background: string;
  accentColor: string;
  bannerImage: string;
  fallbackImage: string;
  benefits: string[];
  detailedBenefits?: CategoryBenefitItem[];
  brands: CategoryBrand[];
  subcategories: CategorySubcategory[];
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
  readonly bannerService = inject(BannerService);
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  activeCategory = signal('wellness');
  currentBannerIndex: number = 0;

  readonly defaultBannerList: CatalogBannerItem[] = [
    {
      id: 'wellness',
      categoryId: 'wellness',
      title: 'Wellness & Ayurveda',
      image: 'assets/images/product-catalog-banner/wellness-banner.jpg',
    },
    {
      id: 'homeopathy',
      categoryId: 'homeopathy',
      title: 'Homeopathy & Natural Care',
      image: 'assets/images/product-catalog-banner/homeopathy-banner.jpg',
    },
    {
      id: 'beauty',
      categoryId: 'beauty',
      title: 'Beauty & Personal Care',
      image: 'assets/images/product-catalog-banner/beauty-banner.jpg',
    },
    {
      id: 'pantry',
      categoryId: 'pantry',
      title: 'Food & Pantry',
      image: 'assets/images/product-catalog-banner/pantry-banner.jpg',
    },
    {
      id: 'ethnic',
      categoryId: 'fashion',
      title: 'Ethnic Clothing & Handlooms',
      image: 'assets/images/product-catalog-banner/ethnic-banner.jpg',
    },
  ];

  get bannerList(): CatalogBannerItem[] {
    const list = this.bannerService.getActiveBannersBySection('Product Catalog Banners');
    if (list && list.length > 0) {
      return list.map((b) => ({
        id: b.categoryKey || 'wellness',
        categoryId: b.categoryKey || 'wellness',
        title: b.title,
        image: b.image,
      }));
    }
    return this.defaultBannerList;
  }

  categoryData: Record<string, CategoryShowcase> = {
    wellness: {
      id: 'wellness',
      name: 'Wellness & Ayurveda',
      title: 'Wellness & Ayurveda',
      subtitle: 'Live Healthy, Live Better With Pure Botanicals',
      button: 'Explore Wellness Products',
      background: 'linear-gradient(135deg, #eff5d9 0%, #e2ecd0 100%)',
      accentColor: '#144927',
      bannerImage: 'assets/images/product-catalog-banner/wellness-banner.jpg',
      fallbackImage: 'assets/images/product-catalog-banner/wellness-banner.jpg',
      benefits: [
        '100% Certified Natural',
        'Ayurvedic Heritage',
        'Holistic Immunity',
        'Lab-Tested Purity',
      ],
      detailedBenefits: [
        { label: '100% Natural', icon: 'fa-solid fa-leaf' },
        { label: 'Ayurvedic Heritage', icon: 'fa-solid fa-mortar-pestle' },
        { label: 'Holistic Care', icon: 'fa-solid fa-spa' },
        { label: 'Lab-Tested Purity', icon: 'fa-solid fa-shield-halved' },
      ],
      brands: [
        { name: 'Baidyanath', logo: 'assets/images/brands/baidyanath.svg' },
        { name: 'Upakarma Ayurveda', logo: 'assets/images/brands/upakarma.svg' },
        { name: 'Himalaya', logo: 'assets/images/brands/himalaya.svg' },
        { name: 'Dabur', logo: 'assets/images/brands/dabur.svg' },
        { name: 'Patanjali', logo: 'assets/images/brands/patanjali.svg' },
        { name: 'Zandu', logo: 'assets/images/brands/zandu.svg' },
        { name: 'Organic India', logo: 'assets/images/brands/organic-india.svg' },
        { name: 'Kerala Ayurveda', logo: 'assets/images/brands/kerala.svg' },
      ],
      subcategories: [
        { id: 'all', name: 'All Wellness' },
        { id: 'ayurveda', name: 'Classical Rasayana', icon: 'fa-solid fa-leaf', query: 'ayurveda' },
        { id: 'immunity', name: 'Immunity Boosters', icon: 'fa-solid fa-shield-virus', query: 'immunity' },
        { id: 'supplements', name: 'Herbal Capsules', icon: 'fa-solid fa-capsules', query: 'capsule' },
        { id: 'detox', name: 'Digestive & Detox', icon: 'fa-solid fa-seedling', query: 'triphala' },
        { id: 'superfoods', name: 'Daily Superfoods', icon: 'fa-solid fa-bowl-food', query: 'balance' },
      ],
    },

    homeopathy: {
      id: 'homeopathy',
      name: 'Homeopathy & Natural Care',
      title: 'Homeopathy',
      subtitle: 'Gentle Healing. Lasting Wellness.',
      button: 'Explore Homeopathy',
      background: 'linear-gradient(135deg, #e6f4f2 0%, #d1ebe8 100%)',
      accentColor: '#134e27',
      bannerImage: 'assets/images/product-catalog-banner/homeopathy-banner.jpg',
      fallbackImage: 'assets/images/product-catalog-banner/homeopathy-banner.jpg',
      benefits: [
        '100% Natural',
        'Safe & Effective',
        'Holistic Care',
        'No Side Effects',
      ],
      detailedBenefits: [
        { label: '100% Natural', icon: 'fa-solid fa-leaf' },
        { label: 'Safe & Effective', icon: 'fa-solid fa-mortar-pestle' },
        { label: 'Holistic Care', icon: 'fa-solid fa-spa' },
        { label: 'No Side Effects', icon: 'fa-solid fa-shield-halved' },
      ],
      brands: [
        { name: 'Dr. Reckeweg', logo: 'assets/images/brands/reckeweg.svg' },
        { name: 'SBL Homeopathy', logo: 'assets/images/brands/sbl.svg' },
        { name: 'Boiron', logo: 'assets/images/brands/boiron.svg' },
        { name: "Bakson's", logo: 'assets/images/brands/bakson.svg' },
        { name: 'Dr. Willmar Schwabe', logo: 'assets/images/brands/schwabe.svg' },
        { name: 'Dr. Mantra', logo: 'assets/images/brands/dr-mantra.svg' },
        { name: 'Adel Pharma', logo: 'assets/images/brands/adel.svg' },
        { name: 'Wheezal', logo: 'assets/images/brands/wheezal.svg' },
      ],
      subcategories: [
        { id: 'all', name: 'All Homeopathy' },
        { id: 'tinctures', name: 'Mother Tinctures', icon: 'fa-solid fa-flask', query: 'tincture' },
        { id: 'drops', name: 'Remedy Drops & Syrups', icon: 'fa-solid fa-droplet', query: 'drops' },
        { id: 'hair-scalp', name: 'Hair & Scalp Health', icon: 'fa-solid fa-wind', query: 'scalp' },
        { id: 'eye-care', name: 'Eye Drops & Vision', icon: 'fa-solid fa-eye', query: 'eye' },
        { id: 'joint-pain', name: 'Joint & Muscular Relief', icon: 'fa-solid fa-bone', query: 'joint' },
      ],
    },

    beauty: {
      id: 'beauty',
      name: 'Beauty & Personal Care',
      title: 'Beauty & Personal Care',
      subtitle: 'Nourish Your Natural Glow With Pure Botanicals',
      button: 'Explore Beauty Care',
      background: 'linear-gradient(135deg, #fcecf0 0%, #fae2e8 100%)',
      accentColor: '#164827',
      bannerImage: 'assets/images/product-catalog-banner/beauty-banner.jpg',
      fallbackImage: 'assets/images/product-catalog-banner/beauty-banner.jpg',
      benefits: [
        'Clean & Cruelty-Free',
        'Botanical Extracts',
        'Dermatologist Tested',
        'Natural Radiance',
      ],
      detailedBenefits: [
        { label: '100% Natural', icon: 'fa-solid fa-leaf' },
        { label: 'Clean Botanical', icon: 'fa-solid fa-mortar-pestle' },
        { label: 'Gentle on Skin', icon: 'fa-solid fa-spa' },
        { label: 'Toxin Free', icon: 'fa-solid fa-shield-halved' },
      ],
      brands: [
        { name: 'Mamaearth', logo: 'assets/images/brands/mamaearth.svg' },
        { name: 'Biotique', logo: 'assets/images/brands/biotique.svg' },
        { name: 'Forest Essentials', logo: 'assets/images/brands/forest-essentials.svg' },
        { name: 'Bella Vita Organic', logo: 'assets/images/brands/bella-vita.svg' },
        { name: 'Kama Ayurveda', logo: 'assets/images/brands/kama-ayurveda.svg' },
        { name: 'Plum', logo: 'assets/images/brands/plum.svg' },
        { name: 'Minimalist', logo: 'assets/images/brands/minimalist.svg' },
        { name: 'Khadi Natural', logo: 'assets/images/brands/khadi.svg' },
      ],
      subcategories: [
        { id: 'all', name: 'All Beauty Care' },
        { id: 'skincare', name: 'Face Care & Cleansers', icon: 'fa-solid fa-spa', query: 'skin' },
        { id: 'fragrances', name: 'Fragrances & Mists', icon: 'fa-solid fa-spray-can-sparkles', query: 'fragrance' },
        { id: 'lipcare', name: 'Lip Care & Glow', icon: 'fa-solid fa-wand-magic-sparkles', query: 'lip' },
        { id: 'haircare', name: 'Hair Care & Tonics', icon: 'fa-solid fa-feather', query: 'hair' },
        { id: 'lotions', name: 'Body Lotions & Oils', icon: 'fa-solid fa-hand-holding-heart', query: 'lotion' },
      ],
    },

    pantry: {
      id: 'pantry',
      name: 'Food & Pantry',
      title: 'Taste the Tradition',
      subtitle: 'Pure Spices. Rich Flavor. A Healthier You.',
      button: 'Explore Food & Pantry',
      background: 'linear-gradient(135deg, #fef7ea 0%, #f7eccb 100%)',
      accentColor: '#842020',
      bannerImage: 'assets/images/product-catalog-banner/pantry-banner.jpg',
      fallbackImage: 'assets/images/product-catalog-banner/pantry-banner.jpg',
      benefits: [
        '100% Natural',
        'No Added Preservatives',
        'Pure & Fresh',
        'Rich Aroma Rich Taste',
      ],
      detailedBenefits: [
        { label: '100% Natural', icon: 'fa-solid fa-leaf' },
        { label: 'No Added Preservatives', icon: 'fa-solid fa-shield-halved' },
        { label: 'Pure & Fresh', icon: 'fa-solid fa-mortar-pestle' },
        { label: 'Rich Aroma Rich Taste', icon: 'fa-solid fa-heart' },
      ],
      brands: [
        { name: 'Aashirvaad', logo: 'assets/images/brands/aashirvaad.svg' },
        { name: 'Tata Sampann', logo: 'assets/images/brands/tata-sampann.svg' },
        { name: 'MDH', logo: 'assets/images/brands/mdh.svg' },
        { name: 'Fortune', logo: 'assets/images/brands/fortune.svg' },
        { name: 'Everest', logo: 'assets/images/brands/everest.svg' },
        { name: 'Dabur', logo: 'assets/images/brands/dabur.svg' },
        { name: 'Organic India', logo: 'assets/images/brands/organic-india.svg' },
        { name: 'Two Brothers', logo: 'assets/images/brands/two-brothers.svg' },
      ],
      subcategories: [
        { id: 'all', name: 'All Food & Pantry' },
        { id: 'ghee', name: 'A2 Gir Cow Ghee', icon: 'fa-solid fa-jar', query: 'ghee' },
        { id: 'spices', name: 'Heritage Spice Blends', icon: 'fa-solid fa-pepper-hot', query: 'spice' },
        { id: 'millets', name: 'Ancient Millets & Grains', icon: 'fa-solid fa-wheat-awn', query: 'millet' },
        { id: 'sweets', name: 'Traditional Confections', icon: 'fa-solid fa-cookie-bite', query: 'sweet' },
        { id: 'snacks', name: 'Crunchy Namkeen & Snacks', icon: 'fa-solid fa-bowl-rice', query: 'snack' },
        { id: 'pickles', name: 'Regional Pickles', icon: 'fa-solid fa-lemon', query: 'pickle' },
      ],
    },

    fashion: {
      id: 'fashion',
      name: 'Ethnic Clothing',
      title: 'Ethnic Clothing',
      subtitle: 'Artisan Handloom Silks & Timeless Weaves',
      button: 'Explore Ethnic Wear',
      background: 'linear-gradient(135deg, #f5effe 0%, #ede3fd 100%)',
      accentColor: '#5a1526',
      bannerImage: 'assets/images/product-catalog-banner/ethnic-banner.jpg',
      fallbackImage: 'assets/images/product-catalog-banner/ethnic-banner.jpg',
      benefits: [
        'Handloom Weaving',
        'Pure Natural Silks',
        'Intricate Zari Work',
        'Ethical Artisan Craft',
      ],
      detailedBenefits: [
        { label: 'Handloom Pure', icon: 'fa-solid fa-vest' },
        { label: 'Artisan Craft', icon: 'fa-solid fa-hands-holding' },
        { label: 'Pure Silks', icon: 'fa-solid fa-feather' },
        { label: 'Festive Luxury', icon: 'fa-solid fa-gem' },
      ],
      brands: [
        { name: 'Fabindia', logo: 'assets/images/brands/fabindia.svg' },
        { name: 'Manyavar', logo: 'assets/images/brands/manyavar.svg' },
        { name: 'W for Woman', logo: 'assets/images/brands/w-woman.svg' },
        { name: 'Biba', logo: 'assets/images/brands/biba.svg' },
        { name: 'Anokhi', logo: 'assets/images/brands/anokhi.svg' },
        { name: 'Raw Mango', logo: 'assets/images/brands/raw-mango.svg' },
        { name: 'Raymond Ethnic', logo: 'assets/images/brands/raymond.svg' },
      ],
      subcategories: [
        { id: 'all', name: 'All Ethnic Clothing' },
        { id: 'sarees', name: 'Handcrafted Sarees', icon: 'fa-solid fa-vest', query: 'dress' },
        { id: 'kurtas', name: 'Kurta & Sets', icon: 'fa-solid fa-shirt', query: 'shirt' },
        { id: 'dupattas', name: 'Dupattas & Stoles', icon: 'fa-solid fa-scroll', query: 'fashion' },
        { id: 'jewelry', name: 'Ethnic Jewelry & Accessories', icon: 'fa-solid fa-gem', query: 'jewel' },
        { id: 'footwear', name: 'Traditional Footwear', icon: 'fa-solid fa-shoe-prints', query: 'shoe' },
      ],
    },

    all: {
      id: 'all',
      name: 'All Products',
      title: 'World Market',
      subtitle: 'Authentic Heritage Essentials & Artisanal Wellness',
      button: 'Explore All Products',
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
      accentColor: '#134e27',
      bannerImage: 'assets/images/product-catalog-banner/wellness-banner.jpg',
      fallbackImage: 'assets/images/product-catalog-banner/wellness-banner.jpg',
      benefits: [
        'Worldwide Shipping',
        '100% Verified Sellers',
        'Escrow Protected Payments',
        'Direct Heritage Sourcing',
      ],
      detailedBenefits: [
        { label: '100% Genuine', icon: 'fa-solid fa-award' },
        { label: 'Global Market', icon: 'fa-solid fa-globe' },
        { label: 'Secure Delivery', icon: 'fa-solid fa-box' },
        { label: 'Verified Sellers', icon: 'fa-solid fa-shield-halved' },
      ],
      brands: [
        { name: 'Dabur', logo: 'assets/images/brands/dabur.svg' },
        { name: 'Dr. Reckeweg', logo: 'assets/images/brands/reckeweg.svg' },
        { name: 'Forest Essentials', logo: 'assets/images/brands/forest-essentials.svg' },
        { name: 'Two Brothers', logo: 'assets/images/brands/two-brothers.svg' },
        { name: 'Fabindia', logo: 'assets/images/brands/fabindia.svg' },
        { name: 'Himalaya', logo: 'assets/images/brands/himalaya.svg' },
        { name: 'Organic India', logo: 'assets/images/brands/organic-india.svg' },
        { name: 'Patanjali', logo: 'assets/images/brands/patanjali.svg' },
      ],
      subcategories: [
        { id: 'all', name: 'All Categories' },
        { id: 'wellness', name: 'Wellness', icon: 'fa-solid fa-spa', query: 'wellness' },
        { id: 'homeopathy', name: 'Homeopathy', icon: 'fa-solid fa-mortar-pestle', query: 'homeopathy' },
        { id: 'beauty', name: 'Beauty Care', icon: 'fa-solid fa-wand-magic-sparkles', query: 'beauty' },
        { id: 'pantry', name: 'Food & Pantry', icon: 'fa-solid fa-utensils', query: 'pantry' },
        { id: 'fashion', name: 'Ethnic Clothing', icon: 'fa-solid fa-vest', query: 'fashion' },
      ],
    },
  };

  normalizeCategory(cat: string | null): string {
    if (!cat) return 'all';
    const c = cat.toLowerCase().trim();
    if (['wellness', 'ayurveda'].includes(c)) return 'wellness';
    if (['homeopathy', 'homeopathic'].includes(c)) return 'homeopathy';
    if (['beauty', 'beauty-care', 'beauty-personal-care'].includes(c)) return 'beauty';
    if (['food-pantry', 'pantry', 'sweets-snacks', 'groceries'].includes(c)) return 'pantry';
    if (['ethnic-clothing', 'ethnic', 'ethnic-wear', 'fashion'].includes(c)) return 'fashion';
    return c;
  }

  get currentCategory(): CategoryShowcase {
    const cat = this.activeCategory();
    return this.getBannerData(cat);
  }

  selectCategory(categoryId: string): void {
    this.setCategory(categoryId);
  }

  filterByBrand(brandName: string): void {
    const idx = this.selectedBrands.indexOf(brandName);
    if (idx > -1) {
      this.selectedBrands = [];
    } else {
      this.selectedBrands = [brandName];
    }
    this.updateQueryParams();
    this.scrollToProducts();
  }

  clearBrandFilter(): void {
    this.selectedBrands = [];
    this.updateQueryParams();
  }

  selectSubcategory(sub: CategorySubcategory): void {
    this.selectedSubcategory = sub.id;
    if (sub.id === 'all') {
      this.searchQuery = '';
      this.selectedBrands = [];
    } else if (['wellness', 'homeopathy', 'beauty', 'pantry', 'fashion'].includes(sub.id)) {
      this.setCategory(sub.id);
      return;
    } else if (sub.query) {
      this.searchQuery = sub.query;
    }
    this.updateQueryParams();
    this.scrollToProducts();
  }

  scrollToProducts(): void {
    if (typeof document !== 'undefined') {
      const el = document.getElementById('catalog-products-anchor');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  getBrandLogoSvg(name: string, accentColor?: string): string {
    const slug = (name || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return `assets/images/brands/${slug}.svg`;
  }

  onBrandLogoError(event: any, brandName: string): void {
    if (!event?.target) return;
    if (event.target.dataset.fallbackTried) {
      return;
    }
    event.target.dataset.fallbackTried = 'true';
    const slug = (brandName || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    event.target.src = `assets/images/brands/${slug}.svg`;
  }

  prevBanner(): void {
    const newIdx = (this.currentBannerIndex - 1 + this.bannerList.length) % this.bannerList.length;
    this.goToBanner(newIdx);
  }

  nextBanner(): void {
    const newIdx = (this.currentBannerIndex + 1) % this.bannerList.length;
    this.goToBanner(newIdx);
  }

  goToBanner(index: number): void {
    this.currentBannerIndex = index;
    const banner = this.bannerList[index];
    if (banner) {
      this.setCategory(banner.categoryId);
    }
  }

  syncBannerWithCategory(catId: string): void {
    const idx = this.bannerList.findIndex((b) => b.categoryId === catId);
    if (idx !== -1) {
      this.currentBannerIndex = idx;
    }
  }

  onBannerImageError(event: any): void {
    const fallback = 'assets/images/product-catalog-banner/wellness-banner.jpg';
    if (event?.target && !event.target.src.includes(fallback)) {
      event.target.src = fallback;
    }
  }

  getBannerData(categoryId: string): CategoryShowcase {
    const base = this.categoryData[categoryId] || this.categoryData['wellness'];
    const serviceBanner = this.bannerService.getCategoryBanner(categoryId);
    if (serviceBanner) {
      return {
        ...base,
        title: serviceBanner.title || base.title,
        subtitle: serviceBanner.subtitle || base.subtitle,
        bannerImage: serviceBanner.image || base.bannerImage,
        fallbackImage: serviceBanner.image || base.fallbackImage,
      };
    }
    return base;
  }

  getBannerBenefits(categoryId: string): CategoryBenefitItem[] {
    const data = this.getBannerData(categoryId);
    return data.detailedBenefits || [
      { label: '100% Natural', icon: 'fa-solid fa-leaf' },
      { label: 'Safe & Effective', icon: 'fa-solid fa-mortar-pestle' },
      { label: 'Holistic Care', icon: 'fa-solid fa-spa' },
      { label: 'No Side Effects', icon: 'fa-solid fa-shield-halved' },
    ];
  }







 






  // All catalog products
  allProducts: ProductDetailModel[] = [];

  // Filter & Search State
  searchQuery: string = '';
  selectedCategory: string = 'all';
  selectedSubcategory: string = 'all';
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
      const rawCat = params.get('category');
      const searchParam = params.get('search');
      const brandParam = params.get('brand');
      const sortParam = params.get('sort');
      const filterParam = params.get('filter');
      const subParam = params.get('subcategory');

      const catParam = this.normalizeCategory(rawCat);
      this.selectedCategory = catParam;
      this.activeCategory.set(catParam === 'all' ? 'wellness' : catParam);
      this.syncBannerWithCategory(this.activeCategory());

      // Always derive query-driven state from the current URL. Resetting absent
      // parameters prevents filters leaking between catalog navigations.
      this.searchQuery = searchParam ?? '';
      this.selectedBrands = brandParam ? [brandParam] : [];
      this.sortBy = sortParam ?? 'featured';
      this.onlyBestSellers = filterParam === 'deals' || filterParam === 'bestseller';
      this.selectedSubcategory = subParam ?? 'all';

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
      result = result.filter((p) => {
        const grp = this.productService.getCategoryGroup(p);
        if (this.selectedCategory === 'wellness') return grp === 'wellness';
        if (this.selectedCategory === 'homeopathy') return grp === 'homeopathy';
        if (this.selectedCategory === 'beauty') return grp === 'beauty';
        if (this.selectedCategory === 'pantry') return grp === 'pantry' || grp === 'sweets-snacks';
        if (this.selectedCategory === 'fashion') return grp === 'fashion';
        return grp === this.selectedCategory;
      });
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
    const normalized = this.normalizeCategory(catId);
    this.selectedCategory = normalized;
    this.activeCategory.set(normalized === 'all' ? 'wellness' : normalized);
    this.syncBannerWithCategory(this.activeCategory());
    this.selectedSubcategory = 'all';
    this.selectedBrands = [];
    this.searchQuery = '';
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
    if (this.selectedSubcategory !== 'all') {
      queryParams['subcategory'] = this.selectedSubcategory;
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
   void this.router.navigate([], {
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
  void this.router.navigate(['/product', prodId]);
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

   void this.router.navigate(['/cart']);
  }
}
