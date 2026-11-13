import { Injectable, signal, computed } from '@angular/core';

export type SectionType = 'Hero' | 'Showcase' | 'Grid' | 'Carousel' | 'Banner' | 'Features' | 'Custom';
export type LayoutMode = 'grid' | 'carousel' | 'split-banner' | 'cards-row';
export type ProductSource = 'all' | 'category' | 'manual' | 'bestsellers' | 'trending';

export interface SectionStyling {
  background: string;
  textColor: string;
  padding: string; // e.g. 'py-5', 'py-4', 'py-3', 'py-2'
  borderRadius: string;
  columns: number; // 2, 3, 4, 6
}

export interface SectionProductConfig {
  source: ProductSource;
  categoryFilter?: string; // e.g. 'wellness', 'homeopathy', 'beauty', 'pantry', 'fashion'
  productLimit: number;
  displayLayout: 'grid' | 'carousel';
  cardStyle: 'standard' | 'box' | 'compact' | 'featured';
  selectedProductIds?: string[];
}

export interface HomepageSection {
  id: string;
  componentId: string;
  name: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  enabled: boolean;
  order: number;
  type: SectionType;
  itemsCount: number;
  previewImage: string;
  lastUpdated: string;
  styling: SectionStyling;
  productConfig?: SectionProductConfig;
  bannerImage?: string;
  bannerLink?: string;
}

const STORAGE_PUBLISHED_KEY = 'herbalmart_homepage_published_v1';
const STORAGE_DRAFT_KEY = 'herbalmart_homepage_draft_v1';

@Injectable({
  providedIn: 'root',
})
export class HomepageBuilderService {
  // All 9 default registered sections matching the live storefront
  private readonly defaultSections: HomepageSection[] = [
    {
      id: 'sec-hero-banner',
      componentId: 'sec-hero-banner',
      name: 'Hero Banner Showcase',
      tag: 'PREMIUM PROMOTIONS',
      title: 'Curated Heritage & Wellness Carousel',
      subtitle: 'Dynamic interactive carousel highlighting top audio, wearables, and essentials.',
      description: 'Main interactive 3D hero slider highlighting Ayurvedic, Ethnic, Spices, and Homeopathy collections.',
      enabled: true,
      order: 1,
      type: 'Hero',
      itemsCount: 4,
      previewImage: 'images/hero-carousel/Ayurvedic.png',
      lastUpdated: 'Live',
      styling: {
        background: '#ffffff',
        textColor: '#17251c',
        padding: 'py-0',
        borderRadius: '0px',
        columns: 1,
      },
    },
    {
      id: 'sec-shop-categories',
      componentId: 'sec-shop-categories',
      name: 'Shop by Category Cards',
      tag: 'SHOP BY CATEGORY',
      title: 'Explore by Category',
      subtitle: 'Discover global brands and everyday essentials across your favourite categories.',
      description: 'Horizontal scrollable pastel category cards: Ayurveda, Beauty, Food & Pantry, Home Living, etc.',
      enabled: true,
      order: 2,
      type: 'Grid',
      itemsCount: 7,
      previewImage: '/images/wellness/amla-capsules.jpg',
      lastUpdated: 'Live',
      styling: {
        background: '#ffffff',
        textColor: '#17251c',
        padding: 'py-5',
        borderRadius: '16px',
        columns: 6,
      },
    },
    {
      id: 'sec-trust-features',
      componentId: 'sec-trust-features',
      name: 'Trust Badges & Value Bar',
      tag: 'SERVICE COMMITMENT',
      title: 'Guaranteed Quality & Worldwide Delivery',
      subtitle: 'Genuine products guarantee, express international delivery, and 24/7 care support.',
      description: '4 customer trust badges: 100% Genuine, Temperature Safe, Express Global, Safe Checkout.',
      enabled: true,
      order: 3,
      type: 'Features',
      itemsCount: 4,
      previewImage: '/images/wellness/supplement-facts.svg',
      lastUpdated: 'Live',
      styling: {
        background: '#ffffff',
        textColor: '#17251c',
        padding: 'py-4',
        borderRadius: '16px',
        columns: 4,
      },
    },
    {
      id: 'sec-featured-products',
      componentId: 'sec-featured-products',
      name: 'Trending Now & Featured Products',
      tag: 'TRENDING THIS WEEK',
      title: 'Trending This Week',
      subtitle: 'Highlight high-velocity products with Add to Cart and variant preview.',
      description: 'Curated trending picks with direct cart actions, discounts, and ratings.',
      enabled: true,
      order: 4,
      type: 'Showcase',
      itemsCount: 8,
      previewImage: '/images/wellness/neem-bottle-nature.jpg',
      lastUpdated: 'Live',
      styling: {
        background: '#ffffff',
        textColor: '#17251c',
        padding: 'py-5',
        borderRadius: '16px',
        columns: 4,
      },
      productConfig: {
        source: 'trending',
        productLimit: 8,
        displayLayout: 'carousel',
        cardStyle: 'standard',
      },
    },
    {
      id: 'sec-storefront-products',
      componentId: 'sec-storefront-products',
      name: 'Live Storefront Products Grid',
      tag: 'DUMMYJSON API • STOREFRONT PRODUCTS',
      title: 'Storefront Products',
      subtitle: 'Explore all products fetched dynamically in real-time from the catalog API.',
      description: 'Dynamic responsive product grid with live stock counter, interactive ratings, and quick Buy Now.',
      enabled: true,
      order: 5,
      type: 'Grid',
      itemsCount: 8,
      previewImage: '/images/wellness/neem-turmeric.jpg',
      lastUpdated: 'Live',
      styling: {
        background: '#ffffff',
        textColor: '#17251c',
        padding: 'py-5',
        borderRadius: '16px',
        columns: 4,
      },
      productConfig: {
        source: 'all',
        productLimit: 8,
        displayLayout: 'grid',
        cardStyle: 'standard',
      },
    },
    {
      id: 'sec-bento-grid',
      componentId: 'sec-bento-grid',
      name: 'Signature Picks & Bento Collections',
      tag: 'SIGNATURE PICKS',
      title: 'Curated Heritage Special Collections',
      subtitle: 'Bento layout showcasing regional specials, immunity boosters, and heritage snacks.',
      description: 'Visual bento box grid highlighting sweets, snacks, ghee, and artisan crafts.',
      enabled: true,
      order: 6,
      type: 'Grid',
      itemsCount: 5,
      previewImage: '/images/wellness/tulsi-capsules.jpg',
      lastUpdated: 'Live',
      styling: {
        background: '#ffffff',
        textColor: '#17251c',
        padding: 'py-5',
        borderRadius: '20px',
        columns: 3,
      },
    },
    {
      id: 'sec-regional-specialities',
      componentId: 'sec-regional-specialities',
      name: 'Regional Specialities & Brand Partners',
      tag: 'AUTHORIZED PARTNERS',
      title: 'Regional Specialities & Authentic Brands',
      subtitle: 'Brand logo showcases for Ensure, Herbalife, Almond House, Pulla Reddy, etc.',
      description: 'Logos and cards showcasing verified iconic brands and regional delicacies.',
      enabled: true,
      order: 7,
      type: 'Showcase',
      itemsCount: 8,
      previewImage: '/images/wellness/ashwagandha.jpg',
      lastUpdated: 'Live',
      styling: {
        background: '#ffffff',
        textColor: '#17251c',
        padding: 'py-4',
        borderRadius: '16px',
        columns: 4,
      },
    },
    {
      id: 'sec-wellness-showcase',
      componentId: 'sec-wellness-showcase',
      name: 'Wellness & Ayurveda Showcase',
      tag: 'HERBAL ESSENTIALS',
      title: 'Wellness Essentials & Supplements',
      subtitle: 'Split layout with left vertical wellness banner and horizontal scroll products list.',
      description: 'Promotional side banner paired with authentic Ayurvedic herbs and immunity boosters.',
      enabled: true,
      order: 8,
      type: 'Banner',
      itemsCount: 6,
      previewImage: '/images/wellness/wellness-banner.jpg',
      lastUpdated: 'Live',
      styling: {
        background: '#ffffff',
        textColor: '#17251c',
        padding: 'py-5',
        borderRadius: '16px',
        columns: 3,
      },
      productConfig: {
        source: 'category',
        categoryFilter: 'wellness',
        productLimit: 6,
        displayLayout: 'carousel',
        cardStyle: 'box',
      },
    },
    {
      id: 'sec-homeopathy-showcase',
      componentId: 'sec-homeopathy-showcase',
      name: 'Indian & German Homeopathy Showcase',
      tag: 'CERTIFIED LABORATORIES',
      title: 'Indian & German Homeopathy',
      subtitle: 'Deep teal promotional card + genuine German & Indian homeopathy medicine potencies.',
      description: 'Promotional showcase with authorized clinical laboratories: Dr. Reckeweg, SBL, Schwabe, Bakson’s.',
      enabled: true,
      order: 9,
      type: 'Banner',
      itemsCount: 6,
      previewImage: '/images/homeopathy/homeopathy-banner.jpg',
      lastUpdated: 'Live',
      styling: {
        background: '#ffffff',
        textColor: '#17251c',
        padding: 'py-5',
        borderRadius: '16px',
        columns: 3,
      },
      productConfig: {
        source: 'category',
        categoryFilter: 'homeopathy',
        productLimit: 6,
        displayLayout: 'carousel',
        cardStyle: 'box',
      },
    },
  ];

  // Live Published State
  readonly publishedSections = signal<HomepageSection[]>([]);

  // Working / Draft State in Builder
  readonly workingSections = signal<HomepageSection[]>([]);

  // Computed: Active published sections sorted by order
  readonly activePublishedSections = computed(() =>
    this.publishedSections()
      .filter((s) => s.enabled)
      .sort((a, b) => a.order - b.order)
  );

  // Computed: Total & Active counts for Builder
  readonly totalSectionsCount = computed(() => this.workingSections().length);
  readonly activeSectionsCount = computed(() => this.workingSections().filter((s) => s.enabled).length);
  readonly inactiveSectionsCount = computed(() => this.workingSections().filter((s) => !s.enabled).length);

  // Unsaved changes flag
  readonly hasUnsavedChanges = signal<boolean>(false);

  constructor() {
    this.initSections();
  }

  private initSections(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(STORAGE_PUBLISHED_KEY) || localStorage.getItem(STORAGE_DRAFT_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.publishedSections.set(parsed);
            this.workingSections.set(JSON.parse(JSON.stringify(parsed)));
            return;
          }
        }
      } catch (e) {
        console.warn('Could not parse stored published sections, falling back to defaults', e);
      }
    }
    const def = JSON.parse(JSON.stringify(this.defaultSections));
    this.publishedSections.set(def);
    this.workingSections.set(JSON.parse(JSON.stringify(def)));
  }

  private persistPublished(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_PUBLISHED_KEY, JSON.stringify(this.publishedSections()));
      } catch (e) {
        console.warn('Could not persist published sections to localStorage', e);
      }
    }
  }

  private persistDraft(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(this.workingSections()));
      } catch (e) {
        console.warn('Could not persist draft to localStorage', e);
      }
    }
  }

  // Atomic sync to both signals and local storage
  private commitAndSync(list: HomepageSection[]): void {
    const updated = list.map((sec, idx) => ({
      ...sec,
      order: idx + 1,
    }));
    this.workingSections.set(updated);
    this.publishedSections.set(JSON.parse(JSON.stringify(updated)));
    this.hasUnsavedChanges.set(false);
    this.persistPublished();
    this.persistDraft();
  }

  // LOOKUP
  getSectionById(id: string): HomepageSection | undefined {
    return this.workingSections().find((s) => s.id === id);
  }

  // REORDER / MOVE
  moveUp(target: string | number): void {
    const list = [...this.workingSections()];
    const index = typeof target === 'string'
      ? list.findIndex((s) => s.id === target)
      : target;

    if (index <= 0 || index >= list.length) return;

    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;

    this.commitAndSync(list);
  }

  moveDown(target: string | number): void {
    const list = [...this.workingSections()];
    const index = typeof target === 'string'
      ? list.findIndex((s) => s.id === target)
      : target;

    if (index < 0 || index >= list.length - 1) return;

    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;

    this.commitAndSync(list);
  }

  reorder(fromIndex: number, toIndex: number): void {
    const list = [...this.workingSections()];
    if (
      fromIndex < 0 ||
      fromIndex >= list.length ||
      toIndex < 0 ||
      toIndex >= list.length ||
      fromIndex === toIndex
    ) {
      return;
    }

    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);

    this.commitAndSync(list);
  }

  // TOGGLE VISIBILITY
  toggleVisibility(id: string): void {
    const list = this.workingSections().map((s) => {
      if (s.id === id) {
        return { ...s, enabled: !s.enabled, lastUpdated: 'Just now' };
      }
      return { ...s };
    });
    this.commitAndSync(list);
  }

  // CREATE NEW SECTION
  createSection(data: Partial<HomepageSection>): HomepageSection {
    const list = this.workingSections();
    const newId = data.id || ('sec-custom-' + Date.now());
    const newSec: HomepageSection = {
      id: newId,
      componentId: data.componentId || 'sec-custom-collection',
      name: data.name || 'New Custom Section',
      tag: data.tag || 'CURATED COLLECTION',
      title: data.title || 'Special Collection',
      subtitle: data.subtitle || 'Handpicked products crafted for your lifestyle.',
      description: data.description || 'Custom homepage promotional section.',
      enabled: data.enabled !== undefined ? data.enabled : true,
      order: list.length + 1,
      type: data.type || 'Showcase',
      itemsCount: data.itemsCount || 4,
      previewImage: data.previewImage || '/images/wellness/wellness-banner.jpg',
      lastUpdated: 'Just now',
      styling: {
        background: data.styling?.background || '#ffffff',
        textColor: data.styling?.textColor || '#17251c',
        padding: data.styling?.padding || 'py-5',
        borderRadius: data.styling?.borderRadius || '16px',
        columns: data.styling?.columns || 4,
      },
      productConfig: data.productConfig || {
        source: 'all',
        productLimit: 4,
        displayLayout: 'grid',
        cardStyle: 'standard',
      },
      bannerImage: data.bannerImage,
      bannerLink: data.bannerLink,
    };

    const nextList = [...list, newSec];
    this.commitAndSync(nextList);
    return newSec;
  }

  // DUPLICATE SECTION
  duplicateSection(id: string): HomepageSection | null {
    const original = this.workingSections().find((s) => s.id === id);
    if (!original) return null;

    const clone: HomepageSection = JSON.parse(JSON.stringify(original));
    clone.id = 'sec-copy-' + Date.now();
    clone.name = `${original.name} (Copy)`;
    clone.title = `${original.title} (Copy)`;
    clone.lastUpdated = 'Just now';

    const list = [...this.workingSections(), clone];
    this.commitAndSync(list);
    return clone;
  }

  // UPDATE SECTION
  updateSection(id: string, patch: Partial<HomepageSection>): boolean {
    const list = this.workingSections();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return false;

    const updated = [...list];
    updated[idx] = {
      ...updated[idx],
      ...patch,
      styling: { ...updated[idx].styling, ...patch.styling },
      productConfig: patch.productConfig
        ? ({ ...updated[idx].productConfig, ...patch.productConfig } as SectionProductConfig)
        : updated[idx].productConfig,
      lastUpdated: 'Just now',
    };

    this.commitAndSync(updated);
    return true;
  }

  // DELETE SECTION
  deleteSection(id: string): boolean {
    const list = this.workingSections().filter((s) => s.id !== id);
    if (list.length === this.workingSections().length) return false;

    this.commitAndSync(list);
    return true;
  }

  // PUBLISH TO LIVE STOREFRONT
  publishToLive(): void {
    this.commitAndSync(this.workingSections());
  }

  // RESTORE TO LAST PUBLISHED STATE
  restorePublished(): void {
    const pub = JSON.parse(JSON.stringify(this.publishedSections()));
    this.workingSections.set(pub);
    this.hasUnsavedChanges.set(false);
    this.persistDraft();
  }

  // RESET TO FACTORY DEFAULTS
  resetToDefaults(): void {
    const def = JSON.parse(JSON.stringify(this.defaultSections));
    this.commitAndSync(def);
  }
}
