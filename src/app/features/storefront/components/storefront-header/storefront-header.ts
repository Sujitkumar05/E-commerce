import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { BannerService } from '../../../../core/services/banner.service';

export interface SubCategoryGroup {
  title: string;
  items: string[];
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  groups: SubCategoryGroup[];
  promo: {
    tag: string;
    title: string;
    linkText: string;
    bgColor?: string;
  };
}

@Component({
  selector: 'app-storefront-header',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './storefront-header.html',
  styleUrl: './storefront-header.scss',
})
export class StorefrontHeader {
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);
  readonly authService = inject(AuthService);
  readonly bannerService = inject(BannerService);
  private readonly router = inject(Router);

  get topAnnouncement() {
    const list = this.bannerService.getActiveBannersBySection('Top Announcement Bar');
    return list.length > 0 ? list[0] : null;
  }

  isMegaMenuOpen = false;
  searchQuery: string = '';
  selectedCategoryIndex = 0; // Default to 'Ayurveda'

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], {
        queryParams: { search: this.searchQuery.trim() },
      });
    } else {
      this.router.navigate(['/products']);
    }
  }

  navigateToCategory(catId: string): void {
    this.isMegaMenuOpen = false;
    let categoryGroup = 'wellness';
    if (catId === 'homeopathy') categoryGroup = 'homeopathy';
    else if (catId === 'beauty' || catId === 'beauty-personal-care' || catId === 'beauty-care') categoryGroup = 'beauty';
    else if (catId === 'food-pantry' || catId === 'pantry' || catId === 'sweets-snacks') categoryGroup = 'pantry';
    else if (catId === 'ethnic-clothing' || catId === 'ethnic-wear' || catId === 'fashion') categoryGroup = 'fashion';
    else if (catId === 'wellness' || catId === 'ayurveda') categoryGroup = 'wellness';
    else categoryGroup = catId;

    this.router.navigate(['/products'], {
      queryParams: { category: categoryGroup },
    });
  }

  navigateToSearch(term: string): void {
    this.isMegaMenuOpen = false;
    const currentCat = this.categories[this.selectedCategoryIndex]?.id || 'wellness';
    this.router.navigate(['/products'], {
      queryParams: { category: currentCat, search: term },
    });
  }

  isCategoryActive(catId: string): boolean {
    const currentUrl = this.router.url;
    if (!currentUrl.startsWith('/products')) return false;
    const urlTree = this.router.parseUrl(currentUrl);
    const activeCat = urlTree.queryParams['category'] || 'all';
    if (catId === 'all') return activeCat === 'all' || !urlTree.queryParams['category'];
    if (catId === 'wellness') return ['wellness', 'ayurveda'].includes(activeCat);
    if (catId === 'homeopathy') return activeCat === 'homeopathy';
    if (catId === 'beauty') return ['beauty', 'beauty-care', 'beauty-personal-care'].includes(activeCat);
    if (catId === 'pantry') return ['pantry', 'food-pantry', 'sweets-snacks'].includes(activeCat);
    if (catId === 'fashion') return ['fashion', 'ethnic', 'ethnic-clothing', 'ethnic-wear'].includes(activeCat);
    return activeCat === catId;
  }

  categories: CategoryItem[] = [
    {
      id: 'wellness',
      name: 'Wellness',
      icon: 'fa-solid fa-spa text-success',
      groups: [
        {
          title: 'WELLNESS BESTSELLERS',
          items: ['Chyawanprash', 'Ashwagandha', 'Triphala & Guggulu', 'Giloy & Neem Juice', 'Herbal Shilajit'],
        },
        {
          title: 'TOP BRANDS',
          items: ['Dabur', 'Baidyanath', 'Patanjali', 'Zandu Care', 'Himalaya Wellness'],
        },
        {
          title: 'COMMON CONCERNS',
          items: ['Immunity Boosters', 'Joint & Muscle Pain', 'Digestive Health', 'Stress & Sleep', 'Liver & Kidney Care'],
        },
      ],
      promo: {
        tag: 'BESTSELLERS',
        title: 'Wellness & Ayurveda',
        linkText: 'Shop Wellness →',
        bgColor: '#f1f8f3',
      },
    },
    {
      id: 'homeopathy',
      name: 'Homeopathy',
      icon: 'fa-solid fa-mortar-pestle text-success',
      groups: [
        {
          title: 'HOMEOPATHY BESTSELLERS',
          items: ['Dr. Reckeweg R-Series', 'SBL Mother Tinctures', 'Dr Willmar Schwabe', "Bakson's Homeopathy", 'Allen Homeopathy'],
        },
        {
          title: 'TOP BRANDS',
          items: ['Dr. Reckeweg', 'SBL Homeopathy', 'Dr. Willmar Schwabe', 'Adel Pharma', 'Wheezal Homeopathy'],
        },
        {
          title: 'COMMON CONCERNS',
          items: ['Cough, Cold & Flu', 'Digestive Health', 'Hair & Scalp Care', 'Joint & Pain Relief', 'Eye Care Drops'],
        },
      ],
      promo: {
        tag: 'GERMAN QUALITY',
        title: 'Homeopathy Care',
        linkText: 'Shop Homeopathy →',
        bgColor: '#eaf1f8',
      },
    },
    {
      id: 'beauty',
      name: 'Beauty Care',
      icon: 'fa-solid fa-wand-magic-sparkles text-info',
      groups: [
        {
          title: 'SKIN & BODY CARE',
          items: ['Herbal Face Wash', 'Moisturizers & Lotions', 'Sunscreen Protection', 'Natural Body Scrubs', 'Rose Water & Mists'],
        },
        {
          title: 'TOP BRANDS',
          items: ['Forest Essentials', 'Kama Ayurveda', 'Plum Goodness', 'Minimalist', 'Mamaearth'],
        },
        {
          title: 'HAIRCARE SOLUTIONS',
          items: ['Organic Shampoos', 'Ayurvedic Hair Oils', 'Natural Henna & Indigo', 'Conditioners & Serums', 'Anti-Dandruff Care'],
        },
      ],
      promo: {
        tag: 'ORGANIC PICKS',
        title: 'Beauty & Personal Care',
        linkText: 'Shop Beauty Care →',
        bgColor: '#fbf2f6',
      },
    },
    {
      id: 'pantry',
      name: 'Food & Pantry',
      icon: 'fa-solid fa-utensils text-warning',
      groups: [
        {
          title: 'HERITAGE PANTRY',
          items: ['Cultured A2 Gir Cow Ghee', 'Single-Estate Spices', 'Ancient Millets & Grains', 'Cold-Pressed Oils', 'Raw Forest Honey'],
        },
        {
          title: 'TOP BRANDS',
          items: ['Two Brothers Organic', 'Organic India', "Haldiram's", 'Bikaji', '24 Mantra Organic'],
        },
        {
          title: 'SWEETS & SNACKS',
          items: ['Authentic Gulab Jamun', 'Roasted Makhana', 'Kaju Katli', 'Diet Namkeen Chivda', 'Banana Chips'],
        },
      ],
      promo: {
        tag: 'FARM FRESH',
        title: 'Food & Pantry',
        linkText: 'Shop Food & Pantry →',
        bgColor: '#fef7ee',
      },
    },
    {
      id: 'fashion',
      name: 'Ethnic Clothing',
      icon: 'fa-solid fa-vest text-danger',
      groups: [
        {
          title: "WOMEN'S ETHNIC",
          items: ['Designer Sarees', 'Salwar & Anarkali Suits', 'Daily Wear Kurtis', 'Lehenga Choli', 'Festive Dupattas'],
        },
        {
          title: "MEN'S ETHNIC",
          items: ['Kurta Pajama Sets', 'Nehru & Modi Jackets', 'Dhoti Kurta Sets', 'Embroidered Sherwanis', 'Short Casual Kurtas'],
        },
        {
          title: 'FABRICS & WEAVES',
          items: ['Chanderi & Banarasi Silk', 'Pure Cotton & Linen', 'Bandhani & Chikankari', 'Kalamkari Prints', 'Handloom Specials'],
        },
      ],
      promo: {
        tag: 'HERITAGE WEAVES',
        title: 'Ethnic Clothing',
        linkText: 'Shop Ethnic Clothing →',
        bgColor: '#fdf2f2',
      },
    },
  ];

  toggleMegaMenu(): void {
    this.isMegaMenuOpen = !this.isMegaMenuOpen;
  }

  selectCategory(index: number): void {
    this.selectedCategoryIndex = index;
  }
}

