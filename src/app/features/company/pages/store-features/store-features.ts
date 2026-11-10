import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StorefrontHeader } from '../../../storefront/components/storefront-header/storefront-header';
import { Footer } from '../../../storefront/components/footer/footer';

@Component({
  selector: 'app-store-features',
  standalone: true,
  imports: [CommonModule, RouterLink, StorefrontHeader, Footer],
  templateUrl: './store-features.html',
  styleUrl: './store-features.scss',
})
export class StoreFeaturesPage {
  features = [
    {
      icon: 'fa-shield-halved',
      badge: 'VERIFIED SOURCING',
      title: '100% Authentic Maker Direct',
      desc: 'All regional sweets, herbal formulations, and homeopathic medicines are procured directly from brand factories, verified cooperatives, or authorized pharmacies.',
      color: '#16a34a',
      bgColor: '#dcfce7',
    },
    {
      icon: 'fa-cubes-stacked',
      badge: 'SMART VARIANT ENGINE',
      title: 'Dynamic Pack & Size Customization',
      desc: 'Select from single bottles to family multi-packs with instant price adjustment, discount percentages, and detailed net weight breakdowns.',
      color: '#2563eb',
      bgColor: '#dbeafe',
    },
    {
      icon: 'fa-mortar-pestle',
      badge: 'HEALTHCARE PLAZA',
      title: 'Dedicated Homeopathy & Wellness',
      desc: 'A specialized catalog covering genuine German and Indian homeopathic remedies, biochemic salts, mother tinctures, and Ayurvedic extracts.',
      color: '#0d9488',
      bgColor: '#ccfbf1',
    },
    {
      icon: 'fa-lock',
      badge: 'SECURE PAYMENTS',
      title: 'Bank-Grade 256-Bit SSL Checkout',
      desc: 'Shop in USD, GBP, EUR, or CAD with full security. We accept Visa, Mastercard, American Express, Apple Pay, and Google Pay with zero hidden surcharges.',
      color: '#7c3aed',
      bgColor: '#ede9fe',
    },
    {
      icon: 'fa-plane-departure',
      badge: 'EXPRESS TRANSIT',
      title: 'Real-Time Air Cargo Tracking',
      desc: 'Daily air freight flights to the USA, UK, Canada, and Europe with comprehensive checkpoint notifications from packaging to delivery.',
      color: '#ea580c',
      bgColor: '#ffedd5',
    },
    {
      icon: 'fa-headset',
      badge: '24/7 SUPPORT',
      title: 'Multilingual Customer Care',
      desc: 'Our customer support team is always available to assist with order inquiries, customs clearances, ingredient questions, or bulk requests.',
      color: '#db2777',
      bgColor: '#fce7f3',
    },
  ];
}
