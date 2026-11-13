import { Injectable, signal } from '@angular/core';

export interface ExploreCategory {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  bgGradient: string;
  arrowBg: string;
  arrowColor: string;
  link?: string;
  categoryQuery?: string;
}

const STORAGE_EXPLORE_KEY = 'herbalmart_explore_categories_v1';

@Injectable({
  providedIn: 'root',
})
export class ExploreCategoryService {
  private readonly defaultCategories: ExploreCategory[] = [
    {
      id: 'home-living',
      title: 'Home & Living',
      subtitle: 'Comfort for every space',
      image: '/images/explore-category/image 38.png',
      bgGradient: 'linear-gradient(180deg, #fdf6ea 0%, #fbf0dc 100%)',
      arrowBg: '#faeed7',
      arrowColor: '#b45309',
      categoryQuery: 'craft-living',
    },
    {
      id: 'beauty',
      title: 'Beauty',
      subtitle: 'Skincare, makeup & more',
      image: '/images/explore-category/image 39.png',
      bgGradient: 'linear-gradient(180deg, #fcf0f5 0%, #fae2ed 100%)',
      arrowBg: '#fce7f3',
      arrowColor: '#be185d',
      categoryQuery: 'beauty',
    },
    {
      id: 'fashion',
      title: 'Fashion',
      subtitle: 'Style for every you',
      image: '/images/explore-category/image 40.png',
      bgGradient: 'linear-gradient(180deg, #edf2fe 0%, #e1e9fd 100%)',
      arrowBg: '#e0e7ff',
      arrowColor: '#4338ca',
      categoryQuery: 'fashion',
    },
    {
      id: 'food-pantry',
      title: 'Food & Pantry',
      subtitle: 'Global tastes, local comfort',
      image: '/images/explore-category/image 41.png',
      bgGradient: 'linear-gradient(180deg, #eefaf1 0%, #e1f5e6 100%)',
      arrowBg: '#dcfce7',
      arrowColor: '#15803d',
      categoryQuery: 'pantry',
    },
    {
      id: 'ayurveda',
      title: 'Ayurveda',
      subtitle: 'Traditional wellness',
      image: '/images/explore-category/image 42.png',
      bgGradient: 'linear-gradient(180deg, #eef7ed 0%, #e2f2e0 100%)',
      arrowBg: '#dcfce7',
      arrowColor: '#166534',
      categoryQuery: 'wellness',
    },
    {
      id: 'gifts',
      title: 'Gifts',
      subtitle: 'Thoughtful finds',
      image: '/images/explore-category/image 43.png',
      bgGradient: 'linear-gradient(180deg, #f3f0fd 0%, #e9e3fc 100%)',
      arrowBg: '#ede9fe',
      arrowColor: '#6d28d9',
      categoryQuery: 'wellness',
    },
  ];

  readonly categories = signal<ExploreCategory[]>([]);

  constructor() {
    this.initCategories();
  }

  private initCategories(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(STORAGE_EXPLORE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.categories.set(parsed);
            return;
          }
        }
      } catch (e) {
        console.warn('Could not parse stored explore categories, falling back to defaults', e);
      }
    }
    this.categories.set(JSON.parse(JSON.stringify(this.defaultCategories)));
  }

  private persist(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_EXPLORE_KEY, JSON.stringify(this.categories()));
      } catch (e) {
        console.warn('Could not persist explore categories to localStorage', e);
      }
    }
  }

  getCategoryById(id: string): ExploreCategory | undefined {
    return this.categories().find((c) => c.id === id);
  }

  addCategory(data: Partial<ExploreCategory>): ExploreCategory {
    const list = this.categories();
    const newId = data.id || ('cat-' + Date.now());
    const newCat: ExploreCategory = {
      id: newId,
      title: data.title || 'New Category',
      subtitle: data.subtitle || 'Everyday essentials',
      image: data.image || '/images/explore-category/image 38.png',
      bgGradient: data.bgGradient || 'linear-gradient(180deg, #fdf6ea 0%, #fbf0dc 100%)',
      arrowBg: data.arrowBg || '#faeed7',
      arrowColor: data.arrowColor || '#b45309',
      categoryQuery: data.categoryQuery || 'wellness',
      link: data.link,
    };

    const updated = [...list, newCat];
    this.categories.set(updated);
    this.persist();
    return newCat;
  }

  updateCategory(id: string, patch: Partial<ExploreCategory>): boolean {
    const list = this.categories();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return false;

    const updated = [...list];
    updated[idx] = {
      ...updated[idx],
      ...patch,
    };
    this.categories.set(updated);
    this.persist();
    return true;
  }

  replaceImage(id: string, newImage: string): boolean {
    return this.updateCategory(id, { image: newImage });
  }

  deleteCategory(id: string): boolean {
    const list = this.categories().filter((c) => c.id !== id);
    if (list.length === this.categories().length) return false;

    this.categories.set(list);
    this.persist();
    return true;
  }

  resetToDefaults(): void {
    this.categories.set(JSON.parse(JSON.stringify(this.defaultCategories)));
    this.persist();
  }
}

