import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  icon: string;
  iconBg: string;
  status: 'Active' | 'Inactive';
  productsCount: number;
  sortOrder: number;
  selected?: boolean;
}

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.scss'
})
export class AdminCategories {
  // Search & Filter
  searchTerm: string = '';
  statusFilter: string = 'All Status';

  // Stats
  get totalCategories(): number {
    return this.categories.length;
  }

  get activeCategories(): number {
    return this.categories.filter(c => c.status === 'Active').length;
  }

  get inactiveCategories(): number {
    return this.categories.filter(c => c.status === 'Inactive').length;
  }

  // Select all checkbox
  selectAll: boolean = false;

  // New Category Form Model
  newCategory = {
    name: '',
    slug: '',
    parentCategory: 'None (Main Category)',
    status: 'Active' as 'Active' | 'Inactive',
    sortOrder: null as number | null,
    imagePreview: '' as string,
    description: ''
  };

  parentCategories: string[] = [
    'None (Main Category)',
    'Personal Care',
    'Skincare',
    'Health Care',
    'Wellness'
  ];

  // Categories List based on image
  categories: CategoryItem[] = [
    {
      id: 1,
      name: 'Homeopathy',
      slug: 'homeopathy',
      icon: '🌿',
      iconBg: '#e8f5e9',
      status: 'Active',
      productsCount: 48,
      sortOrder: 1
    },
    {
      id: 2,
      name: 'Skincare',
      slug: 'skincare',
      icon: '🧖‍♀️',
      iconBg: '#fff3e0',
      status: 'Active',
      productsCount: 76,
      sortOrder: 2
    },
    {
      id: 3,
      name: 'Personal Care',
      slug: 'personal-care',
      icon: '🧴',
      iconBg: '#e3f2fd',
      status: 'Active',
      productsCount: 64,
      sortOrder: 3
    },
    {
      id: 4,
      name: 'Health Care',
      slug: 'health-care',
      icon: '💚',
      iconBg: '#e8f8f5',
      status: 'Active',
      productsCount: 52,
      sortOrder: 4
    },
    {
      id: 5,
      name: 'Baby Care',
      slug: 'baby-care',
      icon: '👶',
      iconBg: '#fbe9e7',
      status: 'Active',
      productsCount: 28,
      sortOrder: 5
    },
    {
      id: 6,
      name: 'Wellness',
      slug: 'wellness',
      icon: '🪷',
      iconBg: '#f3e5f5',
      status: 'Active',
      productsCount: 44,
      sortOrder: 6
    },
    {
      id: 7,
      name: 'Nutrition',
      slug: 'nutrition',
      icon: '🥗',
      iconBg: '#e8f5e9',
      status: 'Active',
      productsCount: 37,
      sortOrder: 7
    },
    {
      id: 8,
      name: 'Hair Care',
      slug: 'hair-care',
      icon: '👩',
      iconBg: '#fef3e2',
      status: 'Active',
      productsCount: 30,
      sortOrder: 8
    },
    {
      id: 9,
      name: 'Oral Care',
      slug: 'oral-care',
      icon: '🦷',
      iconBg: '#e1f5fe',
      status: 'Active',
      productsCount: 22,
      sortOrder: 9
    },
    {
      id: 10,
      name: 'Skin Care',
      slug: 'skin-care',
      icon: '☀️',
      iconBg: '#fff9c4',
      status: 'Inactive',
      productsCount: 18,
      sortOrder: 10
    },
    {
      id: 11,
      name: 'Joint Care',
      slug: 'joint-care',
      icon: '🦿',
      iconBg: '#ede7f6',
      status: 'Active',
      productsCount: 14,
      sortOrder: 11
    },
    {
      id: 12,
      name: 'Vitamins & Supplements',
      slug: 'vitamins-supplements',
      icon: '💊',
      iconBg: '#fff3e0',
      status: 'Active',
      productsCount: 20,
      sortOrder: 12
    }
  ];

  get filteredCategories(): CategoryItem[] {
    return this.categories.filter(item => {
      const matchesSearch = !this.searchTerm.trim() ||
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.slug.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        this.statusFilter === 'All Status' ||
        item.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  // Auto-generate slug as user types name
  onNameChange(): void {
    if (!this.newCategory.slug || this.newCategory.slug === this.generateSlug(this.newCategory.name.slice(0, -1))) {
      this.newCategory.slug = this.generateSlug(this.newCategory.name);
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
    this.filteredCategories.forEach(c => c.selected = this.selectAll);
  }

  checkIndividualSelection(): void {
    this.selectAll = this.filteredCategories.length > 0 &&
      this.filteredCategories.every(c => c.selected);
  }

  // Category Actions
  viewCategory(category: CategoryItem): void {
    alert(`Category: ${category.name}\nSlug: ${category.slug}\nProducts: ${category.productsCount}\nStatus: ${category.status}`);
  }

  editCategory(category: CategoryItem): void {
    this.newCategory = {
      name: category.name,
      slug: category.slug,
      parentCategory: 'None (Main Category)',
      status: category.status,
      sortOrder: category.sortOrder,
      imagePreview: '',
      description: ''
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteCategory(category: CategoryItem): void {
    if (confirm(`Are you sure you want to delete category "${category.name}"?`)) {
      this.categories = this.categories.filter(c => c.id !== category.id);
    }
  }

  // Image Upload trigger
  triggerImageUpload(): void {
    const input = document.getElementById('categoryImageInput') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newCategory.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveCategory(): void {
    if (!this.newCategory.name.trim()) {
      alert('Please enter a Category Name');
      return;
    }

    const newId = this.categories.length > 0 ? Math.max(...this.categories.map(c => c.id)) + 1 : 1;
    const newEntry: CategoryItem = {
      id: newId,
      name: this.newCategory.name.trim(),
      slug: this.newCategory.slug || this.generateSlug(this.newCategory.name),
      icon: '🌿',
      iconBg: '#e8f5e9',
      status: this.newCategory.status,
      productsCount: 0,
      sortOrder: this.newCategory.sortOrder || this.categories.length + 1
    };

    this.categories.push(newEntry);
    alert(`Category "${newEntry.name}" has been successfully added!`);

    // Reset Form
    this.newCategory = {
      name: '',
      slug: '',
      parentCategory: 'None (Main Category)',
      status: 'Active',
      sortOrder: null,
      imagePreview: '',
      description: ''
    };
  }
}
