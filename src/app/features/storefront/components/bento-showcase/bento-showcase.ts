import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
}

@Component({
  selector: 'app-bento-showcase',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bento-showcase.html',
  styleUrl: './bento-showcase.scss',
})
export class BentoShowcase {
  // Column 1: Dry Fruits (Short) + Masala Powders (Tall)
  col1Items: BentoItem[] = [
    {
      id: 'dry-fruits',
      title: 'Dry Fruits',
      tagline: 'Premium California & Afghan Picks',
      shopUrl: '#',
      image: 'https://images.unsplash.com/photo-1508061252224-46b7372d68e3?w=700&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(150deg, #fffdf8 0%, #faeed7 100%)',
      themeColor: '#b45309',
      isTall: false,
      floatingTag: '100% Organic',
    },
    {
      id: 'masala-powders',
      title: 'Masala Powders',
      tagline: 'Authentic Stone-Ground Spices',
      shopUrl: '#',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=700&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(150deg, #fff7f4 0%, #fde4dd 100%)',
      themeColor: '#c2410c',
      isTall: true,
      floatingTag: 'Pure Aroma',
    },
  ];

  // Column 2: Chocolates (Tall) + Spreads (Short)
  col2Items: BentoItem[] = [
    {
      id: 'chocolates',
      title: 'Chocolates',
      tagline: 'Artisan Couverture & Truffles',
      shopUrl: '#',
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=700&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(150deg, #fdf4f7 0%, #f6dde6 100%)',
      themeColor: '#9d174d',
      isTall: true,
      floatingTag: 'Dark & Milk',
    },
    {
      id: 'spreads',
      title: 'Spreads',
      tagline: 'Slow-Roasted Nut Butters',
      shopUrl: '#',
      image: 'https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?w=700&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(150deg, #fefaf0 0%, #faedd0 100%)',
      themeColor: '#d97706',
      isTall: false,
      floatingTag: 'No Palm Oil',
    },
  ];

  // Column 3: Biscuits & Cookies (Short) + Drinks (Tall)
  col3Items: BentoItem[] = [
    {
      id: 'biscuits-cookies',
      title: 'Biscuits & Cookies',
      tagline: 'Crispy Butter & Nutty Bites',
      shopUrl: '#',
      image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=700&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(150deg, #f8f6fe 0%, #ece5fc 100%)',
      themeColor: '#6d28d9',
      isTall: false,
      floatingTag: 'Fresh Baked',
    },
    {
      id: 'drinks',
      title: 'Drinks',
      tagline: 'Nourishing Shakes & Elixirs',
      shopUrl: '#',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(150deg, #f0f6ff 0%, #dceafe 100%)',
      themeColor: '#1748D8',
      isTall: true,
      floatingTag: 'High Energy',
    },
  ];
}
