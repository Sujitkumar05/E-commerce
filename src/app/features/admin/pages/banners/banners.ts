import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface BannerSectionMeta {
  key: string;
  name: string;
  location: string;
  recommendedSize: string;
  badgeClass: string;
  description: string;
}

export interface BannerItem {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  section: string;
  status: 'Active' | 'Inactive';
  sortOrder: number;
  link?: string;
  selected?: boolean;
}

@Component({
  selector: 'app-admin-banners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './banners.html',
  styleUrl: './banners.scss'
})
export class AdminBanners {
  // Search & Filters
  searchTerm: string = '';
  statusFilter: string = 'All Status';
  sectionFilter: string = 'All Sections';

  // All 8 banner sections used across the entire storefront
  readonly bannerSections: BannerSectionMeta[] = [
    {
      key: 'Home Hero Carousel',
      name: 'Home Hero Carousel',
      location: 'Storefront Home Top (hero-banner)',
      recommendedSize: '1920 × 600 px',
      badgeClass: 'sec-slider',
      description: 'Main rotating slider showcase at the top of the homepage.'
    },
    {
      key: 'Home Wellness Banner',
      name: 'Home Wellness Banner',
      location: 'Storefront Home Middle (home.html)',
      recommendedSize: '600 × 750 px',
      badgeClass: 'sec-promo',
      description: 'Vertical promotional banner next to Wellness products showcase.'
    },
    {
      key: 'Homeopathy Showcase Banner',
      name: 'Homeopathy Showcase Banner',
      location: 'Storefront Home Bottom (homeopathy-showcase)',
      recommendedSize: '600 × 750 px',
      badgeClass: 'sec-category',
      description: 'Vertical banner highlighting certified Indian homeopathy remedies.'
    },
    {
      key: 'Catalog Header Banner',
      name: 'Catalog Header Banner',
      location: 'Product Catalog Page (/products)',
      recommendedSize: '1600 × 400 px',
      badgeClass: 'sec-announcement',
      description: 'Full-width top header banner on all products catalog page.'
    },
    {
      key: 'Homeopathy Header Banner',
      name: 'Homeopathy Header Banner',
      location: 'Homeopathy Dedicated Page (/homeopathy)',
      recommendedSize: '1600 × 420 px',
      badgeClass: 'sec-category',
      description: 'Rich teal gradient hero banner for homeopathy medicine page.'
    },
    {
      key: 'Product Details Power Card',
      name: 'Product Details Power Card',
      location: 'Product Details Page (/product/:id)',
      recommendedSize: '500 × 350 px',
      badgeClass: 'sec-promo',
      description: 'Highlighted promotional/ingredient spotlight card in product info tab.'
    },
    {
      key: 'Top Announcement Bar',
      name: 'Top Announcement Bar',
      location: 'Global Storefront Header (storefront-header)',
      recommendedSize: '1920 × 50 px',
      badgeClass: 'sec-announcement',
      description: 'Top blue announcement strip for global shipping & verified badges.'
    },
    {
      key: 'Footer Trust Banner',
      name: 'Footer Trust Banner',
      location: 'Global Footer (footer.html)',
      recommendedSize: '1400 × 120 px',
      badgeClass: 'sec-slider',
      description: 'Guarantee, authenticity and secure checkout trust badge bar.'
    }
  ];

  // Stats Counters
  get totalBanners(): number {
    return this.banners.length;
  }

  get activeBanners(): number {
    return this.banners.filter(b => b.status === 'Active').length;
  }

  get inactiveBanners(): number {
    return this.banners.filter(b => b.status === 'Inactive').length;
  }

  // Select all checkbox
  selectAll: boolean = false;

  // New Banner Form Model
  newBanner = {
    title: '',
    section: 'Home Hero Carousel',
    imagePreview: '/images/wellness/wellness-banner.jpg',
    link: '',
    status: 'Active' as 'Active' | 'Inactive',
    sortOrder: null as number | null
  };

  // Banners data mapped to storefront sections
  banners: BannerItem[] = [
    {
      id: 1,
      title: 'Natural Care for a Better You',
      subtitle: 'Discover the power of nature',
      image: '/images/wellness/wellness-banner.jpg',
      section: 'Home Hero Carousel',
      status: 'Active',
      sortOrder: 1,
      link: '/products?category=wellness'
    },
    {
      id: 2,
      title: 'Ayurvedic Wellness Showcase',
      subtitle: 'Pure & Certified Formulations',
      image: '/images/wellness/neem-bottle-nature.jpg',
      section: 'Home Wellness Banner',
      status: 'Active',
      sortOrder: 2,
      link: '/products?category=wellness'
    },
    {
      id: 3,
      title: 'Trusted Homeopathy Remedies',
      subtitle: 'Safe · Natural · Effective',
      image: '/images/wellness/patanjali-giloy.jpg',
      section: 'Homeopathy Showcase Banner',
      status: 'Active',
      sortOrder: 3,
      link: '/homeopathy'
    },
    {
      id: 4,
      title: 'All Products Heritage Market',
      subtitle: 'Explore Authentic Staples & Remedies',
      image: '/images/wellness/amla-capsules.jpg',
      section: 'Catalog Header Banner',
      status: 'Active',
      sortOrder: 4,
      link: '/products'
    },
    {
      id: 5,
      title: 'Homeopathy Potencies & Salts',
      subtitle: 'Dr. Reckeweg & SBL Formulations',
      image: '/images/wellness/triphala-capsules.jpg',
      section: 'Homeopathy Header Banner',
      status: 'Active',
      sortOrder: 5,
      link: '/homeopathy'
    },
    {
      id: 6,
      title: 'The Power of Neem & Turmeric',
      subtitle: '100% Organic certified booster',
      image: '/images/wellness/neem-turmeric.jpg',
      section: 'Product Details Power Card',
      status: 'Active',
      sortOrder: 6,
      link: '/products'
    },
    {
      id: 7,
      title: 'Free Worldwide Shipping',
      subtitle: 'On all orders above ₹499',
      image: '/images/wellness/tulsi-capsules.jpg',
      section: 'Top Announcement Bar',
      status: 'Active',
      sortOrder: 7,
      link: '/global-delivery'
    },
    {
      id: 8,
      title: '100% Genuine Heritage Guarantee',
      subtitle: 'Lab tested & Direct Sourced',
      image: '/images/wellness/ashwagandha.jpg',
      section: 'Footer Trust Banner',
      status: 'Inactive',
      sortOrder: 8,
      link: '/about-us'
    }
  ];

  // Filtered banners
  get filteredBanners(): BannerItem[] {
    return this.banners.filter(banner => {
      const search = this.searchTerm.trim().toLowerCase();
      const matchesSearch = !search ||
        banner.title.toLowerCase().includes(search) ||
        banner.subtitle.toLowerCase().includes(search) ||
        banner.section.toLowerCase().includes(search);

      const matchesStatus = this.statusFilter === 'All Status' ||
        banner.status === this.statusFilter;

      const matchesSection = this.sectionFilter === 'All Sections' ||
        banner.section === this.sectionFilter;

      return matchesSearch && matchesStatus && matchesSection;
    });
  }

  toggleSelectAll(): void {
    this.filteredBanners.forEach(b => b.selected = this.selectAll);
  }

  checkIndividualSelection(): void {
    this.selectAll = this.filteredBanners.length > 0 &&
      this.filteredBanners.every(b => b.selected);
  }

  // Pre-fill "Add New Banner" with a selected section
  addBannerForSection(sectionName: string): void {
    this.newBanner = {
      title: '',
      section: sectionName,
      imagePreview: '/images/wellness/wellness-banner.jpg',
      link: '',
      status: 'Active',
      sortOrder: this.banners.filter(b => b.section === sectionName).length + 1
    };
    const formCard = document.querySelector('.form-card');
    if (formCard) {
      formCard.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Count active banners per section
  getCountForSection(sectionName: string): number {
    return this.banners.filter(b => b.section === sectionName).length;
  }

  // Banner Actions
  viewBanner(banner: BannerItem): void {
    alert(`Banner: ${banner.title}\nSection: ${banner.section}\nStatus: ${banner.status}\nLink: ${banner.link || 'None'}`);
  }

  editBanner(banner: BannerItem): void {
    this.newBanner = {
      title: banner.title,
      section: banner.section,
      imagePreview: banner.image,
      link: banner.link || '',
      status: banner.status,
      sortOrder: banner.sortOrder
    };
    const formCard = document.querySelector('.form-card');
    if (formCard) {
      formCard.scrollIntoView({ behavior: 'smooth' });
    }
  }

  deleteBanner(banner: BannerItem): void {
    if (confirm(`Are you sure you want to delete banner "${banner.title}"?`)) {
      this.banners = this.banners.filter(b => b.id !== banner.id);
    }
  }

  // Upload trigger
  triggerImageUpload(): void {
    const input = document.getElementById('bannerImageInput') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newBanner.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  resetForm(): void {
    this.newBanner = {
      title: '',
      section: 'Home Hero Carousel',
      imagePreview: '/images/wellness/wellness-banner.jpg',
      link: '',
      status: 'Active',
      sortOrder: null
    };
  }

  saveBanner(): void {
    if (!this.newBanner.title.trim()) {
      alert('Please enter a Banner Title');
      return;
    }

    const newId = this.banners.length > 0 ? Math.max(...this.banners.map(b => b.id)) + 1 : 1;
    const newEntry: BannerItem = {
      id: newId,
      title: this.newBanner.title.trim(),
      subtitle: 'Natural and Pure Healthcare',
      image: this.newBanner.imagePreview || '/images/wellness/wellness-banner.jpg',
      section: this.newBanner.section,
      status: this.newBanner.status,
      sortOrder: this.newBanner.sortOrder || this.banners.length + 1,
      link: this.newBanner.link.trim()
    };

    this.banners.push(newEntry);
    alert(`Banner "${newEntry.title}" has been added to "${newEntry.section}"!`);
    this.resetForm();
  }
}
