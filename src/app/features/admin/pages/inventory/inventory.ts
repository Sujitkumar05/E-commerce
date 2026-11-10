import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

export interface InventoryItem {
  id: string;
  name: string;
  variants: string;
  image: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  selected?: boolean;
}

export interface LowStockAlertItem {
  name: string;
  sku: string;
  qty: number;
  status: 'Low Stock' | 'Out of Stock';
  image: string;
}

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss'
})
export class AdminInventory {
  // Search & Filter Controls
  searchTerm: string = '';
  selectedCategory: string = 'All Categories';
  selectedStatus: string = 'All Status';
  selectedBrand: string = 'All Brands';
  activeTab: 'All' | 'In Stock' | 'Low Stock' | 'Out of Stock' = 'All';

  // Demo alert notice state
  showNotice: boolean = true;

  // Selected checkbox state
  isAllSelected: boolean = false;

  // Modal State
  isAddModalOpen: boolean = false;
  isEditStockModalOpen: boolean = false;
  selectedItemForEdit: InventoryItem | null = null;
  newStockValue: number = 0;

  // Categories list
  categories: string[] = ['All Categories', 'Personal Care', 'Skincare', 'Health Care', 'Hair Care'];

  // Brands list
  brands: string[] = [
    'All Brands',
    'Himalaya',
    'Biotique',
    'Patanjali',
    'Dabur',
    'Nivea',
    'The Ordinary',
    'Vaseline',
    'Tata Tea',
    'Parachute'
  ];

  // Primary Inventory Data matching the image exactly
  inventoryItems: InventoryItem[] = [
    {
      id: 'inv-1',
      name: 'Herbal Shampoo',
      variants: '2 variants',
      image: '/images/wellness/neem-bottle-nature.jpg',
      sku: 'PST-001',
      category: 'Personal Care',
      brand: 'Himalaya',
      price: 299,
      stock: 50,
      status: 'In Stock',
      selected: false
    },
    {
      id: 'inv-2',
      name: 'Natural Face Wash',
      variants: '2 variants',
      image: '/images/wellness/neem-turmeric.jpg',
      sku: 'PST-002',
      category: 'Skincare',
      brand: 'Biotique',
      price: 199,
      stock: 12,
      status: 'Low Stock',
      selected: false
    },
    {
      id: 'inv-3',
      name: 'Aloe Vera Gel',
      variants: '1 variant',
      image: '/images/wellness/patanjali-giloy.jpg',
      sku: 'PST-003',
      category: 'Skincare',
      brand: 'Patanjali',
      price: 149,
      stock: 60,
      status: 'In Stock',
      selected: false
    },
    {
      id: 'inv-4',
      name: 'Immunity Booster',
      variants: '1 variant',
      image: '/images/wellness/dabur-chyawanprash.jpg',
      sku: 'PST-004',
      category: 'Health Care',
      brand: 'Dabur',
      price: 349,
      stock: 5,
      status: 'Low Stock',
      selected: false
    },
    {
      id: 'inv-5',
      name: 'Multivitamin',
      variants: '1 variant',
      image: '/images/wellness/ashwagandha.jpg',
      sku: 'PST-005',
      category: 'Health Care',
      brand: 'Himalaya',
      price: 499,
      stock: 30,
      status: 'In Stock',
      selected: false
    },
    {
      id: 'inv-6',
      name: 'Moisturizer Cream',
      variants: '1 variant',
      image: '/images/wellness/tulsi-capsules.jpg',
      sku: 'PST-006',
      category: 'Skincare',
      brand: 'Nivea',
      price: 399,
      stock: 0,
      status: 'Out of Stock',
      selected: false
    },
    {
      id: 'inv-7',
      name: 'Vitamin C Serum',
      variants: '1 variant',
      image: '/images/wellness/amla-capsules.jpg',
      sku: 'PST-007',
      category: 'Skincare',
      brand: 'The Ordinary',
      price: 799,
      stock: 15,
      status: 'Low Stock',
      selected: false
    },
    {
      id: 'inv-8',
      name: 'Body Lotion',
      variants: '3 variants',
      image: '/images/wellness/himalaya-liv52.jpg',
      sku: 'PST-008',
      category: 'Personal Care',
      brand: 'Vaseline',
      price: 349,
      stock: 80,
      status: 'In Stock',
      selected: false
    },
    {
      id: 'inv-9',
      name: 'Green Tea',
      variants: '1 variant',
      image: '/images/wellness/triphala-capsules.jpg',
      sku: 'PST-009',
      category: 'Health Care',
      brand: 'Tata Tea',
      price: 199,
      stock: 45,
      status: 'In Stock',
      selected: false
    },
    {
      id: 'inv-10',
      name: 'Hair Oil',
      variants: '2 variants',
      image: '/images/homeopathy/sbl-scalptone.jpg',
      sku: 'PST-010',
      category: 'Hair Care',
      brand: 'Parachute',
      price: 159,
      stock: 8,
      status: 'Low Stock',
      selected: false
    }
  ];

  // Right sidebar: Low stock alerts list
  lowStockAlerts: LowStockAlertItem[] = [
    {
      name: 'Immunity Booster',
      sku: 'PST-004',
      qty: 5,
      status: 'Low Stock',
      image: '/images/wellness/dabur-chyawanprash.jpg'
    },
    {
      name: 'Moisturizer Cream',
      sku: 'PST-006',
      qty: 0,
      status: 'Out of Stock',
      image: '/images/wellness/tulsi-capsules.jpg'
    },
    {
      name: 'Vitamin C Serum',
      sku: 'PST-007',
      qty: 15,
      status: 'Low Stock',
      image: '/images/wellness/amla-capsules.jpg'
    },
    {
      name: 'Hair Oil',
      sku: 'PST-010',
      qty: 8,
      status: 'Low Stock',
      image: '/images/homeopathy/sbl-scalptone.jpg'
    }
  ];

  // Pagination
  currentPage: number = 1;
  totalPages: number = 36;
  totalProductsCount: number = 356;
  inStockCount: number = 312;
  lowStockCount: number = 24;
  outOfStockCount: number = 20;

  // New product form model
  newProduct: Partial<InventoryItem> = {
    name: '',
    variants: '1 variant',
    sku: 'PST-' + Math.floor(100 + Math.random() * 900),
    category: 'Personal Care',
    brand: 'Himalaya',
    price: 299,
    stock: 50,
    status: 'In Stock',
    image: '/images/wellness/neem-bottle-nature.jpg'
  };

  // Filtered Items computation
  get filteredItems(): InventoryItem[] {
    return this.inventoryItems.filter(item => {
      // Tab filter
      if (this.activeTab !== 'All' && item.status !== this.activeTab) {
        return false;
      }

      // Search term
      if (this.searchTerm.trim()) {
        const query = this.searchTerm.toLowerCase();
        const match =
          item.name.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.brand.toLowerCase().includes(query);
        if (!match) return false;
      }

      // Category filter
      if (this.selectedCategory !== 'All Categories' && item.category !== this.selectedCategory) {
        return false;
      }

      // Stock status filter
      if (this.selectedStatus !== 'All Status' && item.status !== this.selectedStatus) {
        return false;
      }

      // Brand filter
      if (this.selectedBrand !== 'All Brands' && item.brand !== this.selectedBrand) {
        return false;
      }

      return true;
    });
  }

  // Set active tab
  setTab(tab: 'All' | 'In Stock' | 'Low Stock' | 'Out of Stock'): void {
    this.activeTab = tab;
  }

  // Checkbox bulk selection
  toggleSelectAll(): void {
    this.isAllSelected = !this.isAllSelected;
    this.filteredItems.forEach(item => (item.selected = this.isAllSelected));
  }

  checkIndividualSelection(): void {
    this.isAllSelected = this.filteredItems.length > 0 && this.filteredItems.every(item => item.selected);
  }

  // Stock edit modal
  openStockEdit(item: InventoryItem): void {
    this.selectedItemForEdit = item;
    this.newStockValue = item.stock;
    this.isEditStockModalOpen = true;
  }

  saveStockEdit(): void {
    if (this.selectedItemForEdit) {
      this.selectedItemForEdit.stock = this.newStockValue;
      if (this.newStockValue === 0) {
        this.selectedItemForEdit.status = 'Out of Stock';
      } else if (this.newStockValue <= 15) {
        this.selectedItemForEdit.status = 'Low Stock';
      } else {
        this.selectedItemForEdit.status = 'In Stock';
      }
    }
    this.isEditStockModalOpen = false;
  }

  // Add Product modal
  openAddProductModal(): void {
    this.newProduct = {
      name: '',
      variants: '1 variant',
      sku: 'PST-' + Math.floor(100 + Math.random() * 900),
      category: 'Personal Care',
      brand: 'Himalaya',
      price: 299,
      stock: 50,
      status: 'In Stock',
      image: '/images/wellness/neem-bottle-nature.jpg'
    };
    this.isAddModalOpen = true;
  }

  saveNewProduct(): void {
    if (!this.newProduct.name?.trim()) {
      alert('Please enter a product name');
      return;
    }

    const stock = Number(this.newProduct.stock) || 0;
    const status: 'In Stock' | 'Low Stock' | 'Out of Stock' =
      stock === 0 ? 'Out of Stock' : stock <= 15 ? 'Low Stock' : 'In Stock';

    const item: InventoryItem = {
      id: 'inv-' + Date.now(),
      name: this.newProduct.name,
      variants: this.newProduct.variants || '1 variant',
      sku: this.newProduct.sku || 'PST-' + Date.now().toString().slice(-4),
      category: this.newProduct.category || 'Personal Care',
      brand: this.newProduct.brand || 'Himalaya',
      price: Number(this.newProduct.price) || 199,
      stock: stock,
      status: status,
      image: this.newProduct.image || '/images/wellness/neem-bottle-nature.jpg',
      selected: false
    };

    this.inventoryItems.unshift(item);
    this.totalProductsCount++;
    if (status === 'In Stock') this.inStockCount++;
    else if (status === 'Low Stock') this.lowStockCount++;
    else this.outOfStockCount++;

    this.isAddModalOpen = false;
  }

  // Export CSV
  exportCsv(): void {
    const headers = ['Product Name', 'SKU', 'Category', 'Brand', 'Price', 'Stock', 'Status'];
    const rows = this.inventoryItems.map(item => [
      `"${item.name}"`,
      `"${item.sku}"`,
      `"${item.category}"`,
      `"${item.brand}"`,
      item.price,
      item.stock,
      `"${item.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Dismiss demo notice
  dismissNotice(): void {
    this.showNotice = false;
  }

  // Pagination navigation
  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
