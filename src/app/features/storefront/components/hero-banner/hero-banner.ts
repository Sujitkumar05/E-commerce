import { Component } from '@angular/core';

export interface ShowcaseCard {
  id: string;
  category: string;
  taglineTop?: string;
  taglineBottom?: string;
  badgeTitle?: string;
  badgeSubtitle?: string;
  buttonText: string;
  image: string;
  bgGradient: string;
  hasPlayButton?: boolean;
}

export interface BottomCategoryCard {
  id: string;
  title: string;
  count: string;
  image: string;
}

@Component({
  selector: 'app-hero-banner',
  imports: [],
  templateUrl: './hero-banner.html',
  styleUrl: './hero-banner.scss',
})
export class HeroBanner {
  activeCardIndex = 0;

  showcaseCards: ShowcaseCard[] = [
    {
      id: 'audio',
      category: 'PREMIUM AUDIO',
      taglineTop: 'Feel every detail.',
      taglineBottom: 'Anywhere you go.',
      badgeTitle: 'Crystal Clear Sound',
      badgeSubtitle: 'With Deep Bass',
      buttonText: 'Shop Audio',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(145deg, #1d4ed8 0%, #2563eb 45%, #60a5fa 100%)',
      hasPlayButton: true,
    },
    {
      id: 'wearables',
      category: 'Smart Wearables',
      buttonText: 'Smart Wearables',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(180deg, #dbeafe 0%, #bfdbfe 100%)',
    },
    {
      id: 'footwear',
      category: 'Top Footwear',
      buttonText: 'Top Footwear',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%)',
    },
    {
      id: 'home',
      category: 'Home Essentials',
      buttonText: 'Home Essentials',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)',
    },
  ];

  bottomCategories: BottomCategoryCard[] = [
    {
      id: 'electronics',
      title: 'Electronics',
      count: '1,200+product',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'beauty',
      title: 'Beauty & care',
      count: '1,200+product',
      image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'fashion',
      title: 'Fashion',
      count: '1,200+product',
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'food',
      title: 'Food & Pantry',
      count: '1,200+product',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'wellness',
      title: 'Wellness & Health',
      count: '1,200+product',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'beauty',
      title: 'Beauty & care',
      count: '1,200+product',
      image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'fashion',
      title: 'Fashion',
      count: '1,200+product',
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&auto=format&fit=crop&q=80',
    },
  ];

  nextShowcase(): void {
    const first = this.showcaseCards.shift();
    if (first) {
      this.showcaseCards.push(first);
    }
  }

  prevShowcase(): void {
    const last = this.showcaseCards.pop();
    if (last) {
      this.showcaseCards.unshift(last);
    }
  }

  selectCard(index: number): void {
    if (index === 0) return;
    const clicked = this.showcaseCards.splice(index, 1)[0];
    this.showcaseCards.unshift(clicked);
  }

  scrollCategories(direction: 'left' | 'right'): void {
    const container = document.getElementById('heroCategoryCarousel');
    if (container) {
      const scrollAmount = 260;
      container.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  }
}
