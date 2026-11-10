import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorefrontHeader } from '../../../storefront/components/storefront-header/storefront-header';
import { Footer } from '../../../storefront/components/footer/footer';
import { ProductDetails } from '../../components/product-details/product-details';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, StorefrontHeader, Footer, ProductDetails],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetailPage {}
