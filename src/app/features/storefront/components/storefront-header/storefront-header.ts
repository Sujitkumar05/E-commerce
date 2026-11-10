import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { AuthService } from '../../../../core/auth/auth.service';

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
  private readonly router = inject(Router);

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
    if (catId === 'homeopathy') {
      this.router.navigate(['/homeopathy']);
      return;
    }
    let categoryGroup = 'wellness';
    if (catId === 'sweets-snacks') categoryGroup = 'sweets-snacks';
    if (catId === 'food-pantry') categoryGroup = 'pantry';
    if (catId === 'pooja-rituals') categoryGroup = 'craft-living';

    this.router.navigate(['/products'], {
      queryParams: { category: categoryGroup },
    });
  }

  navigateToSearch(term: string): void {
    this.isMegaMenuOpen = false;
    const currentCat = this.categories[this.selectedCategoryIndex]?.id;
    if (currentCat === 'homeopathy') {
      this.router.navigate(['/homeopathy'], {
        queryParams: { search: term },
      });
      return;
    }
    this.router.navigate(['/products'], {
      queryParams: { search: term },
    });
  }

  categories: CategoryItem[] = [
    {
      id: 'ayurveda',
      name: 'Ayurveda',
      icon: 'fa-solid fa-leaf text-success',
      groups: [
        {
          title: 'AYURVEDA BESTSELLERS',
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
        title: 'Ayurveda',
        linkText: 'Shop now →',
        bgColor: '#f1f8f3',
      },
    },
    {
      id: 'homeopathy',
      name: 'Homeopathy',
      icon: 'fa-solid fa-stethoscope text-success',
      groups: [
        {
          title: 'HOMEOPATHY BESTSELLERS',
          items: ['Dr. Reckeweg', 'SBL Homeopathy', 'Dr Willmar Schwabe', "Bakson's Homeopathy", 'Allen Homeopathy'],
        },
        {
          title: 'TOP BRANDS',
          items: ['Adel Homeopathy', 'Excel Pharma', 'Haslab Homeopathy', 'Wheezal Homeopathy', 'Bjain Homeopathy'],
        },
        {
          title: 'COMMON CONCERNS',
          items: ['Cough, Cold & Flu', 'Digestive Health', 'Hair & Skin Care', 'Pain Relief', 'Stress & Anxiety'],
        },
      ],
      promo: {
        tag: 'BESTSELLERS',
        title: 'Homeopathy',
        linkText: 'Shop now →',
        bgColor: '#eaf1f8',
      },
    },
    {
      id: 'sweets-snacks',
      name: 'Sweets & Snacks',
      icon: 'fa-solid fa-cookie-bite text-warning',
      groups: [
        {
          title: 'AUTHENTIC SWEETS',
          items: ['Gulab Jamun & Rasgulla', 'Kaju Katli', 'Soan Papdi', 'Motichoor Laddoo', 'Milk Cake & Peda'],
        },
        {
          title: 'TOP BRANDS',
          items: ["Haldiram's", 'Bikaji', 'Bikanervala', 'Maiyas', 'Chitale Bandhu'],
        },
        {
          title: 'NAMKEEN & CRUNCHIES',
          items: ['Aloo Bhujia', 'Diet Chivda', 'Roasted Makhana', 'Banana Chips', 'Mathri & Khakhra'],
        },
      ],
      promo: {
        tag: 'FRESH SPECIALS',
        title: 'Sweets & Snacks',
        linkText: 'Shop now →',
        bgColor: '#fef7ee',
      },
    },
    {
      id: 'beauty-personal-care',
      name: 'Beauty & Personal Care',
      icon: 'fa-solid fa-wand-magic-sparkles text-info',
      groups: [
        {
          title: 'SKIN & BODY CARE',
          items: ['Herbal Face Wash', 'Moisturizers & Lotions', 'Sunscreen Protection', 'Natural Body Scrubs', 'Rose Water & Mists'],
        },
        {
          title: 'TOP BRANDS',
          items: ['Khadi Natural', 'Biotique', 'Forest Essentials', 'Mamaearth', 'Lotus Herbals'],
        },
        {
          title: 'HAIRCARE SOLUTIONS',
          items: ['Organic Shampoos', 'Ayurvedic Hair Oils', 'Natural Henna & Indigo', 'Conditioners & Serums', 'Anti-Dandruff Care'],
        },
      ],
      promo: {
        tag: 'ORGANIC PICKS',
        title: 'Beauty & Care',
        linkText: 'Shop now →',
        bgColor: '#fbf2f6',
      },
    },
    {
      id: 'ethnic-wear',
      name: 'Ethnic Wear',
      icon: 'fa-solid fa-vest text-danger',
      groups: [
        {
          title: "WOMEN'S ETHNIC",
          items: ['Designer Sarees', 'Salwar & Anarkali Suits', 'Daily Wear Kurtis', 'Lehenga Choli', 'Festive Dupattas'],
        },
        {
          title: "MEN'S COLLECTION",
          items: ['Kurta Pajama Sets', 'Nehru & Modi Jackets', 'Dhoti Kurta', 'Embroidered Sherwanis', 'Short Casual Kurtas'],
        },
        {
          title: 'FABRICS & REGIONS',
          items: ['Chanderi & Banarasi Silk', 'Pure Cotton & Linen', 'Bandhani & Chikankari', 'Kalamkari Prints', 'Handloom Specials'],
        },
      ],
      promo: {
        tag: 'NEW ARRIVALS',
        title: 'Ethnic Wear',
        linkText: 'Shop now →',
        bgColor: '#fdf2f2',
      },
    },
    {
      id: 'pooja-festivals',
      name: 'Pooja & Festivals',
      icon: 'fa-solid fa-fire-flame-curved text-warning',
      groups: [
        {
          title: 'POOJA ESSENTIALS',
          items: ['Brass Diyas & Bells', 'Pure Camphor & Dhoop', 'Natural Agarbatti (Incense)', 'Cotton Wicks & Til Oil', 'Puja Thali Sets'],
        },
        {
          title: 'IDOLS & SACRED ITEMS',
          items: ['Brass & Silver Idols', 'Rudraksha Beads & Malas', 'Yantras & Sacred Chants', 'Gangajal & Gomutra', 'Chandan & Roli Kumkum'],
        },
        {
          title: 'FESTIVAL SPECIALS',
          items: ['Diwali Lights & Lamps', 'Navratri Garba Props', 'Havan Samagri Herbs', 'Rangoli Color Sets', 'Vedic Torans & Hangings'],
        },
      ],
      promo: {
        tag: 'SPIRITUAL',
        title: 'Pooja & Rituals',
        linkText: 'Shop now →',
        bgColor: '#fdf9ee',
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

