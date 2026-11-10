import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface BrandItem {
  id: number;
  name: string;
  slug: string;
  logo: string;
  logoBg: string;
  website: string;
  status: 'Active' | 'Inactive';
  productsCount: number;
  sortOrder: number;
  featured: boolean;
  selected?: boolean;
}

@Component({
  selector: 'app-admin-brands',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './brands.html',
  styleUrl: './brands.scss'
})
export class AdminBrands {
  // Search & Filter
  searchTerm: string = '';
  statusFilter: string = 'All Status';

  // Stats
  get totalBrands(): number {
    return this.brands.length;
  }

  get activeBrands(): number {
    return this.brands.filter(b => b.status === 'Active').length;
  }

  get inactiveBrands(): number {
    return this.brands.filter(b => b.status === 'Inactive').length;
  }

  // Select all checkbox
  selectAll: boolean = false;

  // New Brand Form Model
  newBrand = {
    name: '',
    slug: '',
    website: '',
    status: 'Active' as 'Active' | 'Inactive',
    featured: false,
    sortOrder: null as number | null,
    logoPreview: '' as string,
    description: ''
  };

  // Brands List matching herbal and wellness store catalogue
  brands: BrandItem[] = [
    {
      id: 1,
      name: 'Himalaya',
      slug: 'himalaya',
      logo: 'H',
      logoBg: '#e8f5e9',
      website: 'himalayawellness.in',
      status: 'Active',
      productsCount: 84,
      sortOrder: 1,
      featured: true
    },
    {
      id: 2,
      name: 'Biotique',
      slug: 'biotique',
      logo: 'B',
      logoBg: '#e0f2f1',
      website: 'biotique.com',
      status: 'Active',
      productsCount: 62,
      sortOrder: 2,
      featured: true
    },
    {
      id: 3,
      name: 'Patanjali',
      slug: 'patanjali',
      logo: 'P',
      logoBg: '#fff3e0',
      website: 'patanjaliayurved.net',
      status: 'Active',
      productsCount: 95,
      sortOrder: 3,
      featured: true
    },
    {
      id: 4,
      name: 'Dabur',
      slug: 'dabur',
      logo: 'D',
      logoBg: '#ffebee',
      website: 'dabur.com',
      status: 'Active',
      productsCount: 78,
      sortOrder: 4,
      featured: true
    },
    {
      id: 5,
      name: 'Zandu',
      slug: 'zandu',
      logo: 'Z',
      logoBg: '#f3e5f5',
      website: 'zanducare.com',
      status: 'Active',
      productsCount: 46,
      sortOrder: 5,
      featured: false
    },
    {
      id: 6,
      name: 'Dr. Reckeweg',
      slug: 'dr-reckeweg',
      logo: 'R',
      logoBg: '#ede7f6',
      website: 'reckeweg.de',
      status: 'Active',
      productsCount: 58,
      sortOrder: 6,
      featured: true
    },
    {
      id: 7,
      name: 'Schwabe India',
      slug: 'schwabe-india',
      logo: 'S',
      logoBg: '#e8eaf6',
      website: 'schwabeindia.com',
      status: 'Active',
      productsCount: 42,
      sortOrder: 7,
      featured: false
    },
    {
      id: 8,
      name: 'Vicco',
      slug: 'vicco',
      logo: 'V',
      logoBg: '#fffde7',
      website: 'viccolabs.com',
      status: 'Active',
      productsCount: 24,
      sortOrder: 8,
      featured: false
    },
    {
      id: 9,
      name: 'Baidyanath',
      slug: 'baidyanath',
      logo: 'B',
      logoBg: '#fbe9e7',
      website: 'baidyanath.co.in',
      status: 'Active',
      productsCount: 38,
      sortOrder: 9,
      featured: false
    },
    {
      id: 10,
      name: 'Kama Ayurveda',
      slug: 'kama-ayurveda',
      logo: 'K',
      logoBg: '#f9fbe7',
      website: 'kamaayurveda.in',
      status: 'Inactive',
      productsCount: 16,
      sortOrder: 10,
      featured: false
    },
    {
      id: 11,
      name: 'SBL Homeopathy',
      slug: 'sbl-homeopathy',
      logo: 'S',
      logoBg: '#e1f5fe',
      website: 'sblglobal.com',
      status: 'Active',
      productsCount: 52,
      sortOrder: 11,
      featured: true
    },
    {
      id: 12,
      name: 'Organic India',
      slug: 'organic-india',
      logo: 'O',
      logoBg: '#e8f5e9',
      website: 'organicindia.com',
      status: 'Active',
      productsCount: 35,
      sortOrder: 12,
      featured: true
    }
  ];

  get filteredBrands(): BrandItem[] {
    return this.brands.filter(item => {
      const matchesSearch = !this.searchTerm.trim() ||
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.slug.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.website.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        this.statusFilter === 'All Status' ||
        item.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  // Auto-generate slug as user types name
  onNameChange(): void {
    if (!this.newBrand.slug || this.newBrand.slug === this.generateSlug(this.newBrand.name.slice(0, -1))) {
      this.newBrand.slug = this.generateSlug(this.newBrand.name);
    }
  }

  generateSlug(val: string): string {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  toggleSelectAll(): void {
    this.filteredBrands.forEach(b => b.selected = this.selectAll);
  }

  checkIndividualSelection(): void {
    this.selectAll = this.filteredBrands.length > 0 &&
      this.filteredBrands.every(b => b.selected);
  }

  // Brand Actions
  viewBrand(brand: BrandItem): void {
    alert(`Brand: ${brand.name}\nSlug: ${brand.slug}\nWebsite: ${brand.website}\nProducts: ${brand.productsCount}\nStatus: ${brand.status}`);
  }

  editBrand(brand: BrandItem): void {
    this.newBrand = {
      name: brand.name,
      slug: brand.slug,
      website: brand.website,
      status: brand.status,
      featured: brand.featured,
      sortOrder: brand.sortOrder,
      logoPreview: '',
      description: ''
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteBrand(brand: BrandItem): void {
    if (confirm(`Are you sure you want to delete brand "${brand.name}"?`)) {
      this.brands = this.brands.filter(b => b.id !== brand.id);
    }
  }

  // Image / Logo Upload
  triggerLogoUpload(): void {
    const input = document.getElementById('brandLogoInput') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  onLogoSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newBrand.logoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveBrand(): void {
    if (!this.newBrand.name.trim()) {
      alert('Please enter a Brand Name');
      return;
    }

    const newId = this.brands.length > 0 ? Math.max(...this.brands.map(b => b.id)) + 1 : 1;
    const initial = this.newBrand.name.trim().charAt(0).toUpperCase();

    const newEntry: BrandItem = {
      id: newId,
      name: this.newBrand.name.trim(),
      slug: this.newBrand.slug || this.generateSlug(this.newBrand.name),
      logo: initial,
      logoBg: '#e0f2fe',
      website: this.newBrand.website.trim() || `${this.newBrand.slug || 'brand'}.com`,
      status: this.newBrand.status,
      productsCount: 0,
      sortOrder: this.newBrand.sortOrder || this.brands.length + 1,
      featured: this.newBrand.featured
    };

    this.brands.push(newEntry);
    alert(`Brand "${newEntry.name}" has been successfully added!`);

    // Reset Form
    this.newBrand = {
      name: '',
      slug: '',
      website: '',
      status: 'Active',
      featured: false,
      sortOrder: null,
      logoPreview: '',
      description: ''
    };
  }
}
