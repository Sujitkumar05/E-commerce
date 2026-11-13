import { Component } from '@angular/core';
import { HeroCarousel } from '../hero-carousel/hero-carousel';


export interface BottomCategoryCard {
  id: string;
   title: string;
   count: string ;
   image: string ;
   
}

@Component({
  selector: 'app-hero-banner',
  imports: [ HeroCarousel],
  templateUrl: './hero-banner.html',
  styleUrl: './hero-banner.scss',
})
export class HeroBanner {
  activeCardIndex = 0;

  

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
