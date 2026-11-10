import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

export interface UploadedImage {
  id: number;
  url: string;
  isMain?: boolean;
}

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl:'./product-form.html',
  styleUrl: './product-form.scss'
})
export class AdminProductForm {
  // Form fields matching image
  productName: string = '';
  category: string = '';
  brand: string = '';
  price: number | null = null;
  comparePrice: number | null = null;
  stockQuantity: number | null = null;
  sku: string = '';
  shortDescription: string = '';
  fullDescription: string = '';

  // Status & Featured
  status: 'Active' | 'Inactive' = 'Active';
  featuredProduct: boolean = true;

  // Additional Information
  tags: string = '';
  weight: string = '';
  length: string = '';
  width: string = '';
  height: string = '';

  // SEO Information
  metaTitle: string = '';
  metaDescription: string = '';

  // Product Images preview list
  images: UploadedImage[] = [
    {
      id: 1,
      url: '/images/wellness/neem-bottle-nature.jpg',
      isMain: true
    },
    {
      id: 2,
      url: '/images/wellness/neem-turmeric.jpg',
      isMain: false
    },
    {
      id: 3,
      url: '/images/wellness/patanjali-giloy.jpg',
      isMain: false
    }
  ];

  constructor(private router: Router) {}

  removeImage(index: number, event: Event): void {
    event.stopPropagation();
    this.images.splice(index, 1);
    if (this.images.length > 0 && !this.images.some(img => img.isMain)) {
      this.images[0].isMain = true;
    }
  }

  setMainImage(index: number): void {
    this.images.forEach((img, i) => {
      img.isMain = i === index;
    });
  }

  triggerUpload(): void {
    const input = document.getElementById('imageFileInput') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  onFilesSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.images.push({
            id: Date.now() + i,
            url: e.target.result,
            isMain: this.images.length === 0
          });
        };
        reader.readAsDataURL(file);
      }
    }
  }

  saveProduct(): void {
    if (!this.productName.trim()) {
      alert('Please provide a Product Name');
      return;
    }
    alert('Product "' + this.productName + '" saved successfully!');
    this.router.navigate(['/admin/products']);
  }
}
