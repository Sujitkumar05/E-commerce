import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface StoreHomeSection {
  id: string;
  name: string;
  tag: string;
  componentName: string;
  enabled: boolean;
  order: number;
  type: 'Hero' | 'Showcase' | 'Grid' | 'Banner' | 'Features';
  itemsCount: number;
  previewImage: string;
  description: string;
  lastUpdated: string;
}

@Component({
  selector: 'app-admin-home-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-manager.html',
  styleUrl: './home-manager.scss',
})
export class AdminHomeManager {
  // Search & Filter
  searchTerm: string = '';
  typeFilter: string = 'All';

  // Modal / Drawer state for Add/Edit Section
  isModalOpen: boolean = false;
  isEditing: boolean = false;

  currentSection: StoreHomeSection = {
    id: '',
    name: '',
    tag: '',
    componentName: '',
    enabled: true,
    order: 1,
    type: 'Showcase',
    itemsCount: 4,
    previewImage: '/images/wellness/wellness-banner.jpg',
    description: '',
    lastUpdated: 'Just now'
  };

  // Pre-configured sections matching actual Storefront Home layout
  sections: StoreHomeSection[] = [
    {
      id: 'sec-hero-banner',
      name: 'Hero Banner Showcase',
      tag: 'PREMIUM PROMOTIONS',
      componentName: '<app-hero-banner>',
      enabled: true,
      order: 1,
      type: 'Hero',
      itemsCount: 4,
      previewImage: '/images/wellness/wellness-banner.jpg',
      description: 'Dynamic interactive carousel highlighting top audio, wearables, and essentials.',
      lastUpdated: '27 Apr 2025'
    },
    {
      id: 'sec-shop-categories',
      name: 'Shop by Category Cards',
      tag: 'EXPLORE BY CATEGORY',
      componentName: 'Category Pastel Grid',
      enabled: true,
      order: 2,
      type: 'Grid',
      itemsCount: 7,
      previewImage: '/images/wellness/amla-capsules.jpg',
      description: 'Curated 7 pastel category cards: Ayurveda, Beauty, Food & Pantry, etc.',
      lastUpdated: '26 Apr 2025'
    },
    {
      id: 'sec-trust-features',
      name: 'Trust Badges & Value Bar',
      tag: 'SERVICE COMMITMENT',
      componentName: 'TrustFeaturesBar',
      enabled: true,
      order: 3,
      type: 'Features',
      itemsCount: 4,
      previewImage: '/images/wellness/supplement-facts.svg',
      description: 'Genuine products guarantee, express international delivery, and 24/7 care support.',
      lastUpdated: '24 Apr 2025'
    },
    {
      id: 'sec-featured-products',
      name: 'Featured & Trending Products',
      tag: 'TRENDING THIS WEEK',
      componentName: '<app-featured-products>',
      enabled: true,
      order: 4,
      type: 'Showcase',
      itemsCount: 8,
      previewImage: '/images/wellness/neem-bottle-nature.jpg',
      description: 'Highlight high-velocity products with Add to Cart and variant preview.',
      lastUpdated: '25 Apr 2025'
    },
    {
      id: 'sec-bento-grid',
      name: 'Bento Grid Special Collections',
      tag: 'CURATED HERITAGE',
      componentName: '<app-bento-showcase>',
      enabled: true,
      order: 5,
      type: 'Grid',
      itemsCount: 5,
      previewImage: '/images/wellness/neem-turmeric.jpg',
      description: 'Bento layout showcasing regional specials, immunity boosters, and heritage snacks.',
      lastUpdated: '25 Apr 2025'
    },
    {
      id: 'sec-regional-specialities',
      name: 'Top Brand Partners Bar',
      tag: 'AUTHORIZED PARTNERS',
      componentName: '<app-speciality-showcase>',
      enabled: true,
      order: 6,
      type: 'Showcase',
      itemsCount: 8,
      previewImage: '/images/wellness/ashwagandha.jpg',
      description: 'Brand logo showcases for Ensure, Herbalife, Almond House, Pulla Reddy, etc.',
      lastUpdated: '26 Apr 2025'
    },
    {
      id: 'sec-wellness-showcase',
      name: 'Wellness Products Showcase',
      tag: 'HERBAL ESSENTIALS',
      componentName: 'WellnessShowcase',
      enabled: true,
      order: 7,
      type: 'Banner',
      itemsCount: 6,
      previewImage: '/images/wellness/tulsi-capsules.jpg',
      description: 'Split layout with left vertical wellness banner and horizontal scroll products list.',
      lastUpdated: '27 Apr 2025'
    },
    {
      id: 'sec-homeopathy-showcase',
      name: 'Indian Homeopathy Showcase',
      tag: 'CERTIFIED LABORATORIES',
      componentName: '<app-homeopathy-showcase>',
      enabled: true,
      order: 8,
      type: 'Banner',
      itemsCount: 6,
      previewImage: '/images/wellness/patanjali-giloy.jpg',
      description: 'Deep teal promotional card + genuine German & Indian homeopathy medicine potencies.',
      lastUpdated: '27 Apr 2025'
    }
  ];

  get filteredSections(): StoreHomeSection[] {
    return this.sections
      .filter(s => {
        const matchesSearch = !this.searchTerm.trim() ||
          s.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          s.tag.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          s.componentName.toLowerCase().includes(this.searchTerm.toLowerCase());

        const matchesType = this.typeFilter === 'All' || s.type === this.typeFilter;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => a.order - b.order);
  }

  get activeCount(): number {
    return this.sections.filter(s => s.enabled).length;
  }

  get inactiveCount(): number {
    return this.sections.filter(s => !s.enabled).length;
  }

  // REORDER / MOVE CONTROLS
  moveUp(index: number): void {
    if (index <= 0) return;
    const current = this.sections[index];
    const previous = this.sections[index - 1];

    const tempOrder = current.order;
    current.order = previous.order;
    previous.order = tempOrder;

    this.reIndexOrders();
  }

  moveDown(index: number): void {
    if (index >= this.sections.length - 1) return;
    const current = this.sections[index];
    const next = this.sections[index + 1];

    const tempOrder = current.order;
    current.order = next.order;
    next.order = tempOrder;

    this.reIndexOrders();
  }

  private reIndexOrders(): void {
    this.sections.sort((a, b) => a.order - b.order);
    this.sections.forEach((sec, idx) => {
      sec.order = idx + 1;
    });
  }

  // TOGGLE STATUS
  toggleSectionEnabled(section: StoreHomeSection): void {
    section.enabled = !section.enabled;
    section.lastUpdated = 'Just now';
  }

  // ADD SECTION
  openAddModal(): void {
    this.isEditing = false;
    this.currentSection = {
      id: 'sec-' + Date.now(),
      name: '',
      tag: '',
      componentName: '<app-custom-section>',
      enabled: true,
      order: this.sections.length + 1,
      type: 'Showcase',
      itemsCount: 4,
      previewImage: '/images/wellness/wellness-banner.jpg',
      description: '',
      lastUpdated: 'Just now'
    };
    this.isModalOpen = true;
  }

  // EDIT SECTION
  openEditModal(section: StoreHomeSection): void {
    this.isEditing = true;
    this.currentSection = { ...section };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveSection(): void {
    if (!this.currentSection.name.trim()) {
      alert('Please provide a Section Name');
      return;
    }

    if (this.isEditing) {
      const idx = this.sections.findIndex(s => s.id === this.currentSection.id);
      if (idx !== -1) {
        this.currentSection.lastUpdated = 'Just now';
        this.sections[idx] = { ...this.currentSection };
      }
    } else {
      this.currentSection.order = this.sections.length + 1;
      this.currentSection.lastUpdated = 'Just now';
      this.sections.push({ ...this.currentSection });
    }

    this.reIndexOrders();
    this.closeModal();
    alert(`Home section "${this.currentSection.name}" saved successfully!`);
  }

  // DELETE SECTION
  deleteSection(section: StoreHomeSection): void {
    if (confirm(`Are you sure you want to remove section "${section.name}" from Storefront Home?`)) {
      this.sections = this.sections.filter(s => s.id !== section.id);
      this.reIndexOrders();
    }
  }

  saveAllLayout(): void {
    alert('Home layout configuration saved and deployed to storefront!');
  }
}
