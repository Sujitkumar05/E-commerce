import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { ProductService } from '../../../../core/services/product.service';

export interface SpecialityItem {
  id: string;
  name: string;
  brand: string;
  image: string;
  bgGradient: string;
  themeColor: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isFavorite?: boolean;
}

export interface BrandPartner {
  id: string;
  name: string;
  tagline?: string;
  fontClass?: string;
  badgeBg?: string;
}

@Component({
  selector: 'app-speciality-showcase',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './speciality-showcase.html',
  styleUrl: './speciality-showcase.scss',
})
export class SpecialityShowcase {
  readonly wishlistService = inject(WishlistService);
  private readonly productService = inject(ProductService);

  // 8 Products from the screenshot in exact order
  products: SpecialityItem[] = [
    {
      id: 'snacks',
      name: 'Snacks',
      brand: 'Grand Sweets',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(150deg, #fffaf2 0%, #fdecd2 100%)',
      themeColor: '#c2410c',
      rating: 4.8,
      reviewCount: 240,
      isVerified: true,
      isFavorite: false,
    },
    {
      id: 'sweets',
      name: 'Sweets',
      brand: 'Anand Sweets',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(150deg, #fdf4f7 0%, #fae0e7 100%)',
      themeColor: '#9d174d',
      rating: 4.9,
      reviewCount: 512,
      isVerified: true,
      isFavorite: false,
    },
    {
      id: 'health-drinks',
      name: 'Health Drinks',
      brand: 'Kapiva Ayurveda',
      image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(150deg, #f2f9f5 0%, #e1f4e9 100%)',
      themeColor: '#16a34a',
      rating: 4.8,
      reviewCount: 180,
      isVerified: true,
      isFavorite: false,
    },
    {
      id: 'ghee',
      name: 'Ghee',
      brand: 'Two Brothers',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(150deg, #fffdf8 0%, #faedd0 100%)',
      themeColor: '#d97706',
      rating: 4.9,
      reviewCount: 342,
      isVerified: true,
      isFavorite: false,
    },
    {
      id: 'pickles',
      name: 'Pickles',
      brand: "Mother's Recipe",
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(150deg, #fff5f0 0%, #fde4d8 100%)',
      themeColor: '#ea580c',
      rating: 4.8,
      reviewCount: 215,
      isVerified: true,
      isFavorite: false,
    },
    {
      id: 'millets',
      name: 'Millets',
      brand: '24 Mantra Organic',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(150deg, #fdfbf2 0%, #f4edd4 100%)',
      themeColor: '#65a30d',
      rating: 4.7,
      reviewCount: 130,
      isVerified: true,
      isFavorite: false,
    },
    {
      id: 'dry-fruits',
      name: 'Dry Fruits',
      brand: 'Nutty Gritties',
      image: 'https://images.unsplash.com/photo-1508061252224-46b7372d68e3?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(150deg, #fcf8f2 0%, #f5ecd8 100%)',
      themeColor: '#b45309',
      rating: 4.9,
      reviewCount: 420,
      isVerified: true,
      isFavorite: false,
    },
    {
      id: 'tea-coffee',
      name: 'Tea & Coffee',
      brand: 'Cafe Niloufer',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'linear-gradient(150deg, #fbf4f0 0%, #f5e4dc 100%)',
      themeColor: '#9a3412',
      rating: 4.8,
      reviewCount: 198,
      isVerified: true,
      isFavorite: false,
    },
  ];

  // 8 Top Brands from the screenshot
  topBrands: BrandPartner[] = [
    {
      id: 'ensure',
      name: 'Ensure',
      tagline: 'STRENGTH & ENERGY',
      fontClass: 'brand-ensure',
    },
    {
      id: 'herbalife',
      name: 'Herbalife',
      tagline: 'NUTRITION',
      fontClass: 'brand-herbalife',
    },
    {
      id: 'vellanki',
      name: 'vellanki',
      tagline: 'FOODS',
      fontClass: 'brand-vellanki',
    },
    {
      id: 'isha-life',
      name: 'isha LIFE',
      tagline: 'YOGIC LIVING',
      fontClass: 'brand-isha',
    },
    {
      id: 'godavari',
      name: 'GODAVARI',
      tagline: 'VANTILLU',
      fontClass: 'brand-godavari',
    },
    {
      id: 'almond-house',
      name: 'ALMOND',
      tagline: 'HOUSE',
      fontClass: 'brand-almond',
    },
    {
      id: 'pulla-reddy',
      name: 'G. PULLA REDDY',
      tagline: 'SWEETS',
      fontClass: 'brand-pulla',
    },
    {
      id: 'yuvagrow',
      name: 'YUVAGROW',
      tagline: 'Taste of Your Home',
      fontClass: 'brand-yuvagrow',
    },
  ];

  scrollProducts(direction: 'left' | 'right'): void {
    const el = document.getElementById('boxProductsGrid');
    if (el) {
      const scrollAmt = 260;
      el.scrollBy({
        left: direction === 'right' ? scrollAmt : -scrollAmt,
        behavior: 'smooth',
      });
    }
  }

  toggleFavorite(prod: SpecialityItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const fullProd = this.productService.getProductById(prod.id);
    this.wishlistService.toggleWishlist({
      id: prod.id,
      name: prod.name,
      brand: prod.brand,
      image: prod.image,
      price: fullProd?.price ?? 14.99,
      rating: prod.rating,
      reviewCount: prod.reviewCount,
      variant: 'Standard',
    });
    prod.isFavorite = this.wishlistService.isInWishlist(prod.id);
  }
}

