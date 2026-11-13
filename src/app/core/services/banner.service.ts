import { Injectable, signal, computed } from '@angular/core';

export interface BannerSectionMeta {
  key: string;
  name: string;
  location: string;
  recommendedSize: string;
  badgeClass: string;
  description: string;
  targetPage?: string;
}

export interface BannerItem {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  mobileImage?: string;
  section: string;
  targetPage?: string; // 'Home' | 'Catalog' | 'Homeopathy' | 'Product Details' | 'Global'
  status: 'Active' | 'Inactive';
  sortOrder: number;
  link?: string;
  categoryKey?: string; // e.g. 'wellness' | 'homeopathy' | 'beauty' | 'pantry' | 'fashion'
  badgeText?: string;
  accentColor?: string;
  scheduleStart?: string;
  scheduleEnd?: string;
  selected?: boolean;
}

const STORAGE_KEY = 'herbalmart_centralized_banners_v1';

@Injectable({
  providedIn: 'root',
})
export class BannerService {
  // All 11 banner sections across the entire storefront
  readonly bannerSections: BannerSectionMeta[] = [
    {
      key: 'Home Hero Carousel',
      name: 'Home Hero Carousel',
      location: 'Storefront Home Top (hero-carousel)',
      recommendedSize: '1920 × 600 px',
      badgeClass: 'sec-slider',
      description: 'Main rotating slider showcase at the top of the homepage.',
      targetPage: 'Home',
    },
    {
      key: 'Product Catalog Banners',
      name: 'Product Catalog Banners',
      location: 'Product Catalog Page (/products)',
      recommendedSize: '1024 × 338 px',
      badgeClass: 'sec-announcement',
      description: 'Panoramic header banners for each product category (Wellness, Homeopathy, Beauty, Food & Pantry, Ethnic).',
      targetPage: 'Catalog',
    },
    {
      key: 'Home Wellness Banner',
      name: 'Home Wellness Banner',
      location: 'Storefront Home Middle (home.html)',
      recommendedSize: '600 × 750 px',
      badgeClass: 'sec-promo',
      description: 'Vertical promotional banner next to Wellness products showcase.',
      targetPage: 'Home',
    },
    {
      key: 'Homeopathy Showcase Banner',
      name: 'Homeopathy Showcase Banner',
      location: 'Storefront Home Bottom (homeopathy-showcase)',
      recommendedSize: '600 × 750 px',
      badgeClass: 'sec-category',
      description: 'Vertical banner highlighting certified Indian & German homeopathy remedies.',
      targetPage: 'Home',
    },
    {
      key: 'Signature Picks Banners',
      name: 'Signature Picks Banners',
      location: 'Storefront Home (bento-showcase)',
      recommendedSize: '600 × 400 px',
      badgeClass: 'sec-promo',
      description: 'Promotional banners for curated signature picks and heritage collections.',
      targetPage: 'Home',
    },
    {
      key: 'Regional Banners',
      name: 'Regional Speciality Banners',
      location: 'Storefront Home (speciality-showcase)',
      recommendedSize: '800 × 400 px',
      badgeClass: 'sec-category',
      description: 'Highlighting authentic state & regional delicacies (Tirupati, Mysore, Kashmir, Banaras).',
      targetPage: 'Home',
    },
    {
      key: 'Product Collection Banners',
      name: 'Product Collection Banners',
      location: 'Storefront & Catalog Collections',
      recommendedSize: '1200 × 350 px',
      badgeClass: 'sec-slider',
      description: 'Custom curated seasonal collections and festive promotions.',
      targetPage: 'Catalog',
    },
    {
      key: 'Homeopathy Header Banner',
      name: 'Homeopathy Header Banner',
      location: 'Homeopathy Dedicated Page (/homeopathy)',
      recommendedSize: '1600 × 420 px',
      badgeClass: 'sec-category',
      description: 'Rich hero banner for dedicated homeopathy medicine catalog.',
      targetPage: 'Homeopathy',
    },
    {
      key: 'Product Details Power Card',
      name: 'Product Details Power Card',
      location: 'Product Details Page (/product/:id)',
      recommendedSize: '500 × 350 px',
      badgeClass: 'sec-promo',
      description: 'Highlighted promotional/ingredient spotlight card in product info tab.',
      targetPage: 'Product Details',
    },
    {
      key: 'Top Announcement Bar',
      name: 'Top Announcement Bar',
      location: 'Global Storefront Header (storefront-header)',
      recommendedSize: '1920 × 50 px',
      badgeClass: 'sec-announcement',
      description: 'Top announcement strip for global shipping & verified purity guarantee.',
      targetPage: 'Global',
    },
    {
      key: 'Footer Trust Banner',
      name: 'Footer Trust Banner',
      location: 'Global Footer (footer.html)',
      recommendedSize: '1400 × 120 px',
      badgeClass: 'sec-slider',
      description: 'Guarantee, authenticity and secure checkout trust badge bar.',
      targetPage: 'Global',
    },
  ];

  // Default initial banner registry migrating all existing storefront banners
  private readonly defaultBanners: BannerItem[] = [
    // 1. Home Hero Carousel (4 slides)
    {
      id: 1,
      title: 'Ayurvedic Living',
      subtitle: 'Pure Herbal Formulations for Balanced Living.',
      image: 'images/hero-carousel/Ayurvedic.png',
      mobileImage: 'images/hero-carousel/Ayurvedic.png',
      section: 'Home Hero Carousel',
      targetPage: 'Home',
      status: 'Active',
      sortOrder: 1,
      link: '/products?category=wellness',
      badgeText: '100% Herbal & Natural Extracts',
    },
    {
      id: 2,
      title: 'Ethnic Fashion',
      subtitle: 'Timeless Craftsmanship and Heritage Fashion.',
      image: 'images/hero-carousel/Ethnic.png',
      mobileImage: 'images/hero-carousel/Ethnic.png',
      section: 'Home Hero Carousel',
      targetPage: 'Home',
      status: 'Active',
      sortOrder: 2,
      link: '/products?category=fashion',
      badgeText: 'Handcrafted Heritage Collection',
    },
    {
      id: 3,
      title: 'Handicrafts & Spices',
      subtitle: 'Artisanal Treasures and Pure Exotic Flavors.',
      image: 'images/hero-carousel/Handicrafts & Spices.png',
      mobileImage: 'images/hero-carousel/Handicrafts & Spices.png',
      section: 'Home Hero Carousel',
      targetPage: 'Home',
      status: 'Active',
      sortOrder: 3,
      link: '/products?category=pantry',
      badgeText: 'Authentic Crafts & Rich Spices',
    },
    {
      id: 4,
      title: 'Homeopathy Care',
      subtitle: 'Gentle, Trusted Healing for the Entire Family.',
      image: 'images/hero-carousel/Homeopathy.png',
      mobileImage: 'images/hero-carousel/Homeopathy.png',
      section: 'Home Hero Carousel',
      targetPage: 'Home',
      status: 'Active',
      sortOrder: 4,
      link: '/products?category=homeopathy',
      badgeText: 'Certified Natural Remedies',
    },

    // 2. Product Catalog Category Banners (5 categories)
    {
      id: 5,
      title: 'Wellness & Ayurveda',
      subtitle: 'Live Healthy, Live Better With Pure Botanicals',
      image: 'assets/images/product-catalog-banner/wellness-banner.jpg',
      section: 'Product Catalog Banners',
      targetPage: 'Catalog',
      status: 'Active',
      sortOrder: 1,
      categoryKey: 'wellness',
      link: '/products?category=wellness',
      accentColor: '#144927',
      badgeText: '100% Certified Natural',
    },
    {
      id: 6,
      title: 'Homeopathy & Natural Care',
      subtitle: 'Gentle Healing. Lasting Wellness.',
      image: 'assets/images/product-catalog-banner/homeopathy-banner.jpg',
      section: 'Product Catalog Banners',
      targetPage: 'Catalog',
      status: 'Active',
      sortOrder: 2,
      categoryKey: 'homeopathy',
      link: '/products?category=homeopathy',
      accentColor: '#134e27',
      badgeText: 'Safe & Effective',
    },
    {
      id: 7,
      title: 'Beauty & Personal Care',
      subtitle: 'Nourish Your Natural Glow With Pure Botanicals',
      image: 'assets/images/product-catalog-banner/beauty-banner.jpg',
      section: 'Product Catalog Banners',
      targetPage: 'Catalog',
      status: 'Active',
      sortOrder: 3,
      categoryKey: 'beauty',
      link: '/products?category=beauty',
      accentColor: '#164827',
      badgeText: 'Clean & Cruelty-Free',
    },
    {
      id: 8,
      title: 'Food & Pantry',
      subtitle: 'Pure Spices. Rich Flavor. A Healthier You.',
      image: 'assets/images/product-catalog-banner/pantry-banner.jpg',
      section: 'Product Catalog Banners',
      targetPage: 'Catalog',
      status: 'Active',
      sortOrder: 4,
      categoryKey: 'pantry',
      link: '/products?category=pantry',
      accentColor: '#842020',
      badgeText: '100% Pure & Heritage Spices',
    },
    {
      id: 9,
      title: 'Ethnic Clothing & Handlooms',
      subtitle: 'Artisan Handloom Silks & Timeless Weaves',
      image: 'assets/images/product-catalog-banner/ethnic-banner.jpg',
      section: 'Product Catalog Banners',
      targetPage: 'Catalog',
      status: 'Active',
      sortOrder: 5,
      categoryKey: 'fashion',
      link: '/products?category=fashion',
      accentColor: '#5a1526',
      badgeText: 'Handloom & Pure Natural Silks',
    },

    // 3. Home Wellness Promotional Side Banner
    {
      id: 10,
      title: 'Wellness',
      subtitle: 'Authentic Ayurveda & Care',
      image: '/images/wellness/wellness-banner.jpg',
      section: 'Home Wellness Banner',
      targetPage: 'Home',
      status: 'Active',
      sortOrder: 1,
      link: '/products?category=wellness',
      badgeText: 'Authentic Ayurveda & Care',
    },

    // 4. Home Homeopathy Promotional Side Banner
    {
      id: 11,
      title: 'Indian & German Homeopathy',
      subtitle: 'Clinically verified potencies, mother tinctures, biochemic tissue salts',
      image: '/images/homeopathy/homeopathy-banner.jpg',
      section: 'Homeopathy Showcase Banner',
      targetPage: 'Home',
      status: 'Active',
      sortOrder: 1,
      link: '/homeopathy',
      badgeText: '100% Genuine Potencies',
    },

    // 5. Signature Picks Banners
    {
      id: 12,
      title: 'Artisan Heritage Sweets & Treats',
      subtitle: 'Direct from iconic Indian confectioners: Pulla Reddy, Vellanki Foods & Dadu’s',
      image: '/images/wellness/triphala-capsules.jpg',
      section: 'Signature Picks Banners',
      targetPage: 'Home',
      status: 'Active',
      sortOrder: 1,
      link: '/products?category=pantry',
      badgeText: 'Signature Picks',
    },

    // 6. Regional Speciality Banners
    {
      id: 13,
      title: 'GI-Tagged Regional Specialities',
      subtitle: 'Tirupati Laddu, Mysore Pak, Kashmiri Saffron, and Banarasi Silks',
      image: '/images/wellness/amla-capsules.jpg',
      section: 'Regional Banners',
      targetPage: 'Home',
      status: 'Active',
      sortOrder: 1,
      link: '/products',
      badgeText: 'Authentic Regional',
    },

    // 7. Product Collection Banners
    {
      id: 14,
      title: 'Pure Desi Ghee & Farm Cold-Pressed Oils',
      subtitle: 'Traditional Bilona method A2 Gir Cow Ghee & stone-pressed oils',
      image: '/images/wellness/ashwagandha.jpg',
      section: 'Product Collection Banners',
      targetPage: 'Catalog',
      status: 'Active',
      sortOrder: 1,
      link: '/products?category=pantry',
      badgeText: 'Curated Collection',
    },

    // 8. Dedicated Homeopathy Catalog Header Banner
    {
      id: 15,
      title: 'Indian Homeopathic Remedies',
      subtitle: 'Discover authentic homeopathic formulations from India’s leading trusted laboratories',
      image: '/images/wellness/triphala-capsules.jpg',
      section: 'Homeopathy Header Banner',
      targetPage: 'Homeopathy',
      status: 'Active',
      sortOrder: 1,
      link: '/homeopathy',
      badgeText: 'Certified Indian Homeopathy',
    },

    // 9. Product Details Power Spotlight Card
    {
      id: 16,
      title: 'The Power of Neem & Turmeric',
      subtitle: 'Ancient wisdom, Modern wellness. 100% Organic certified booster',
      image: '/images/wellness/neem-turmeric.jpg',
      section: 'Product Details Power Card',
      targetPage: 'Product Details',
      status: 'Active',
      sortOrder: 1,
      link: '/products',
      badgeText: 'Ancient Wisdom',
    },

    // 10. Global Top Announcement Strip
    {
      id: 17,
      title: 'FREE EXPRESS SHIPPING WORLDWIDE ON ORDERS OVER $50',
      subtitle: '100% HERBAL & AYURVEDIC • LAB CERTIFIED PURITY',
      image: '',
      section: 'Top Announcement Bar',
      targetPage: 'Global',
      status: 'Active',
      sortOrder: 1,
      link: '/products',
      badgeText: 'Worldwide Delivery',
    },

    // 11. Global Footer Trust Banner
    {
      id: 18,
      title: '100% Genuine Heritage Guarantee',
      subtitle: 'Lab tested & Direct Sourced from India',
      image: '/images/wellness/ashwagandha.jpg',
      section: 'Footer Trust Banner',
      targetPage: 'Global',
      status: 'Active',
      sortOrder: 1,
      link: '/about-us',
      badgeText: 'Heritage Guarantee',
    },
  ];

  // Reactive state using Angular Signals
  readonly banners = signal<BannerItem[]>([]);

  // Computed counters
  readonly totalBanners = computed(() => this.banners().length);
  readonly activeBanners = computed(() => this.banners().filter((b) => b.status === 'Active').length);
  readonly inactiveBanners = computed(() => this.banners().filter((b) => b.status === 'Inactive').length);

  constructor() {
    this.initBanners();
  }

  private initBanners(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.banners.set(parsed);
            return;
          }
        }
      } catch (e) {
        console.warn('Could not parse stored banners, falling back to default registry', e);
      }
    }
    this.banners.set([...this.defaultBanners]);
  }

  private persistBanners(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.banners()));
      } catch (e) {
        console.warn('Could not persist banners to localStorage', e);
      }
    }
  }

  // Get banners for a specific section
  getBannersBySection(sectionKey: string): BannerItem[] {
    return this.banners()
      .filter((b) => b.section === sectionKey)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  // Get active banners for a specific section (taking schedule into account if present)
  getActiveBannersBySection(sectionKey: string): BannerItem[] {
    const now = new Date();
    return this.banners()
      .filter((b) => {
        if (b.section !== sectionKey || b.status !== 'Active') return false;
        if (b.scheduleStart) {
          const start = new Date(b.scheduleStart);
          if (now < start) return false;
        }
        if (b.scheduleEnd) {
          const end = new Date(b.scheduleEnd);
          if (now > end) return false;
        }
        return true;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  // Get single category banner for Product Catalog
  getCategoryBanner(categoryKey: string): BannerItem | undefined {
    const catalogBanners = this.getActiveBannersBySection('Product Catalog Banners');
    return catalogBanners.find((b) => b.categoryKey === categoryKey);
  }

  // Get single banner by ID
  getBannerById(id: number): BannerItem | undefined {
    return this.banners().find((b) => b.id === id);
  }

  // Add new banner
  addBanner(bannerData: Omit<BannerItem, 'id'>): BannerItem {
    const list = this.banners();
    const nextId = list.length > 0 ? Math.max(...list.map((b) => b.id)) + 1 : 1;
    const newBanner: BannerItem = {
      ...bannerData,
      id: nextId,
    };
    this.banners.set([...list, newBanner]);
    this.persistBanners();
    return newBanner;
  }

  // Update existing banner
  updateBanner(id: number, patch: Partial<BannerItem>): boolean {
    const list = this.banners();
    const index = list.findIndex((b) => b.id === id);
    if (index === -1) return false;

    const updated = [...list];
    updated[index] = { ...updated[index], ...patch, id };
    this.banners.set(updated);
    this.persistBanners();
    return true;
  }

  // Replace banner image directly
  replaceBannerImage(id: number, newImageUrl: string, isMobile = false): boolean {
    return this.updateBanner(
      id,
      isMobile ? { mobileImage: newImageUrl } : { image: newImageUrl }
    );
  }

  // Toggle active/inactive status
  toggleStatus(id: number): void {
    const b = this.getBannerById(id);
    if (b) {
      this.updateBanner(id, { status: b.status === 'Active' ? 'Inactive' : 'Active' });
    }
  }

  // Delete banner
  deleteBanner(id: number): boolean {
    const list = this.banners();
    const nextList = list.filter((b) => b.id !== id);
    if (nextList.length === list.length) return false;
    this.banners.set(nextList);
    this.persistBanners();
    return true;
  }

  // Delete multiple banners
  deleteMultiple(ids: number[]): void {
    const idSet = new Set(ids);
    const nextList = this.banners().filter((b) => !idSet.has(b.id));
    this.banners.set(nextList);
    this.persistBanners();
  }

  // Reset all banners to factory defaults
  resetToDefaults(): void {
    this.banners.set([...this.defaultBanners]);
    this.persistBanners();
  }
}
