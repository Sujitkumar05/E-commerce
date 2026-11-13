import { Injectable, signal, computed } from '@angular/core';

export interface BentoItem {
  id: string;
  title: string;
  tagline: string;
  shopUrl: string;
  image: string;
  bgGradient: string;
  themeColor: string;
  isTall: boolean;
  floatingTag?: string;
  column: 1 | 2 | 3;
}

const STORAGE_BENTO_KEY = 'herbalmart_bento_grid_v1';

@Injectable({
  providedIn: 'root',
})
export class BentoGridService {
  private readonly defaultItems: BentoItem[] = [
    // Column 1: Dry Fruits (Short) + Masala Powders (Tall)
    {
      id: 'dry-fruits',
      title: 'Dry Fruits',
      tagline: 'Premium California & Afghan Picks',
      shopUrl: '/products?category=pantry',
      image: 'https://images.unsplash.com/photo-1508061252224-46b7372d68e3?w=700&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(150deg, #fffdf8 0%, #faeed7 100%)',
      themeColor: '#b45309',
      isTall: false,
      floatingTag: '100% Organic',
      column: 1,
    },
    {
      id: 'masala-powders',
      title: 'Masala Powders',
      tagline: 'Authentic Stone-Ground Spices',
      shopUrl: '/products?category=pantry',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=700&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(150deg, #fff7f4 0%, #fde4dd 100%)',
      themeColor: '#c2410c',
      isTall: true,
      floatingTag: 'Pure Aroma',
      column: 1,
    },
    // Column 2: Chocolates (Tall) + Spreads (Short)
    {
      id: 'chocolates',
      title: 'Chocolates',
      tagline: 'Artisan Couverture & Truffles',
      shopUrl: '/products?category=pantry',
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=700&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(150deg, #fdf4f7 0%, #f6dde6 100%)',
      themeColor: '#9d174d',
      isTall: true,
      floatingTag: 'Dark & Milk',
      column: 2,
    },
    {
      id: 'spreads',
      title: 'Spreads',
      tagline: 'Slow-Roasted Nut Butters',
      shopUrl: '/products?category=pantry',
      image: 'https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?w=700&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(150deg, #fefaf0 0%, #faedd0 100%)',
      themeColor: '#d97706',
      isTall: false,
      floatingTag: 'No Palm Oil',
      column: 2,
    },
    // Column 3: Biscuits & Cookies (Short) + Drinks (Tall)
    {
      id: 'biscuits-cookies',
      title: 'Biscuits & Cookies',
      tagline: 'Crispy Butter & Nutty Bites',
      shopUrl: '/products?category=pantry',
      image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=700&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(150deg, #f8f6fe 0%, #ece5fc 100%)',
      themeColor: '#6d28d9',
      isTall: false,
      floatingTag: 'Fresh Baked',
      column: 3,
    },
    {
      id: 'drinks',
      title: 'Drinks',
      tagline: 'Nourishing Shakes & Elixirs',
      shopUrl: '/products?category=wellness',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(150deg, #f0f6ff 0%, #dceafe 100%)',
      themeColor: '#1748D8',
      isTall: true,
      floatingTag: 'High Energy',
      column: 3,
    },
  ];

  readonly items = signal<BentoItem[]>([]);

  readonly col1Items = computed(() => this.items().filter((item) => item.column === 1));
  readonly col2Items = computed(() => this.items().filter((item) => item.column === 2));
  readonly col3Items = computed(() => this.items().filter((item) => item.column === 3));

  constructor() {
    this.initItems();
  }

  private initItems(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(STORAGE_BENTO_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.items.set(parsed);
            return;
          }
        }
      } catch (e) {
        console.warn('Could not parse stored bento grid items, falling back to defaults', e);
      }
    }
    this.items.set(JSON.parse(JSON.stringify(this.defaultItems)));
  }

  private persist(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_BENTO_KEY, JSON.stringify(this.items()));
      } catch (e) {
        console.warn('Could not persist bento grid items to localStorage', e);
      }
    }
  }

  getItemById(id: string): BentoItem | undefined {
    return this.items().find((item) => item.id === id);
  }

  updateImage(id: string, newImage: string): boolean {
    const list = this.items();
    const idx = list.findIndex((item) => item.id === id);
    if (idx === -1) return false;

    const updated = [...list];
    updated[idx] = {
      ...updated[idx],
      image: newImage,
    };
    this.items.set(updated);
    this.persist();
    return true;
  }

  updateItem(id: string, patch: Partial<BentoItem>): boolean {
    const list = this.items();
    const idx = list.findIndex((item) => item.id === id);
    if (idx === -1) return false;

    const updated = [...list];
    updated[idx] = {
      ...updated[idx],
      ...patch,
    };
    this.items.set(updated);
    this.persist();
    return true;
  }

  resetToDefaults(): void {
    this.items.set(JSON.parse(JSON.stringify(this.defaultItems)));
    this.persist();
  }
}

