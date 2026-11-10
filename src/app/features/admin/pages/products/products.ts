import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

export interface ProductItem {
  id: number;
  image: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  status: 'Active' | 'Out of Stock' | 'Draft';
  featured: boolean;
  selected?: boolean;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class AdminProducts {
  // Filters & Search
  searchTerm: string = '';
  selectedCategory: string = 'All Categories';
  selectedBrand: string = 'All Brands';
  selectedStatus: string = 'All Status';
  selectedSort: string = 'Newest First';

  selectAll: boolean = false;

  // 10 Products from user screenshot
  products: ProductItem[] = [
    {
      id: 1,
      image: '/images/wellness/himalaya-liv52.jpg',
      name: 'Herbal Shampoo',
      sku: 'SKU: HM001',
      category: 'Personal Care',
      brand: 'Himalaya',
      price: 299,
      stock: 50,
      status: 'Active',
      featured: true,
      selected: false
    },
    {
      id: 2,
      image: '/images/wellness/neem-turmeric.jpg',
      name: 'Natural Face Wash',
      sku: 'SKU: HM002',
      category: 'Skincare',
      brand: 'Biotique',
      price: 199,
      stock: 75,
      status: 'Active',
      featured: false,
      selected: false
    },
    {
      id: 3,
      image: '/images/wellness/patanjali-giloy.jpg',
      name: 'Aloe Vera Gel',
      sku: 'SKU: HM003',
      category: 'Skincare',
      brand: 'Patanjali',
      price: 149,
      stock: 60,
      status: 'Active',
      featured: true,
      selected: false
    },
    {
      id: 4,
      image: '/images/wellness/dabur-chyawanprash.jpg',
      name: 'Immunity Booster',
      sku: 'SKU: HM004',
      category: 'Health Care',
      brand: 'Dabur',
      price: 349,
      stock: 40,
      status: 'Active',
      featured: false,
      selected: false
    },
    {
      id: 5,
      image: '/images/wellness/triphala-capsules.jpg',
      name: 'Multivitamin',
      sku: 'SKU: HM005',
      category: 'Health Care',
      brand: 'Himalaya',
      price: 499,
      stock: 30,
      status: 'Active',
      featured: true,
      selected: false
    },
    {
      id: 6,
      image: '/images/wellness/neem-bottle-nature.jpg',
      name: 'Neem Soap',
      sku: 'SKU: HM006',
      category: 'Personal Care',
      brand: 'Medimix',
      price: 89,
      stock: 100,
      status: 'Active',
      featured: false,
      selected: false
    },
    {
      id: 7,
      image: '/images/wellness/turmeric-bowl-thumb.jpg',
      name: 'Anti Acne Cream',
      sku: 'SKU: HM007',
      category: 'Skincare',
      brand: 'Himalaya',
      price: 249,
      stock: 55,
      status: 'Active',
      featured: false,
      selected: false
    },
    {
      id: 8,
      image: '/images/wellness/ashwagandha.jpg',
      name: 'Ashwagandha Capsules',
      sku: 'SKU: HM008',
      category: 'Health Care',
      brand: 'Zandu',
      price: 399,
      stock: 45,
      status: 'Active',
      featured: true,
      selected: false
    },
    {
      id: 9,
      image: '/images/wellness/tulsi-capsules.jpg',
      name: 'Herbal Toothpaste',
      sku: 'SKU: HM009',
      category: 'Personal Care',
      brand: 'Vicco',
      price: 129,
      stock: 80,
      status: 'Active',
      featured: false,
      selected: false
    },
    {
      id: 10,
      image: '/images/wellness/amla-capsules.jpg',
      name: 'Pure Honey',
      sku: 'SKU: HM010',
      category: 'Food & Beverages',
      brand: 'Dabur',
      price: 399,
      stock: 20,
      status: 'Active',
      featured: false,
      selected: false
    }
  ];

  get filteredProducts(): ProductItem[] {
    return this.products.filter(p => {
      const matchSearch =
        !this.searchTerm ||
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchCategory =
        this.selectedCategory === 'All Categories' || p.category === this.selectedCategory;

      const matchBrand =
        this.selectedBrand === 'All Brands' || p.brand === this.selectedBrand;

      const matchStatus =
        this.selectedStatus === 'All Status' || p.status === this.selectedStatus;

      return matchSearch && matchCategory && matchBrand && matchStatus;
    });
  }

  toggleSelectAll(): void {
    this.filteredProducts.forEach(p => (p.selected = this.selectAll));
  }

  toggleFeatured(p: ProductItem): void {
    p.featured = !p.featured;
  }

  deleteProduct(p: ProductItem): void {
    this.products = this.products.filter(item => item.id !== p.id);
  }

  getCategoryBadgeClass(category: string): string {
    switch (category) {
      case 'Personal Care':
        return 'cat-personal-care';
      case 'Skincare':
        return 'cat-skincare';
      case 'Health Care':
        return 'cat-healthcare';
      case 'Food & Beverages':
        return 'cat-food';
      default:
        return 'cat-default';
    }
  }
}
