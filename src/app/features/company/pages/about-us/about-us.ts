import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StorefrontHeader } from '../../../storefront/components/storefront-header/storefront-header';
import { Footer } from '../../../storefront/components/footer/footer';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, RouterLink, StorefrontHeader, Footer],
  templateUrl: './about-us.html',
  styleUrl: './about-us.scss',
})
export class AboutUsPage {
  stats = [
    { value: '45+', label: 'Countries Delivered', sub: 'Across North America, Europe & APAC' },
    { value: '500k+', label: 'Global Diaspora Customers', sub: 'Families staying connected to roots' },
    { value: '10,000+', label: 'Authentic Heritage Products', sub: 'Pantry, Ayurveda, Sweets & Homeopathy' },
    { value: '99.4%', label: 'Delivery Satisfaction', sub: 'Doorstep express with temperature care' },
  ];

  values = [
    {
      icon: 'fa-certificate',
      title: '100% Genuine Origin',
      desc: 'We partner directly with certified master makers, GI-tagged regional confectioners, and authorized pharmaceutical dispensaries.',
    },
    {
      icon: 'fa-truck-fast',
      title: 'Global Express Logistics',
      desc: 'Seamless customs-cleared air freight delivering fresh sweets, pickles, and wellness botanicals directly to international doorsteps.',
    },
    {
      icon: 'fa-shield-heart',
      title: 'Preserving Heritage & Wellness',
      desc: 'Every item honors age-old traditions — from pure A2 desi cow ghee and authentic Ayurvedic rasayanas to certified German homeopathic dilutions.',
    },
    {
      icon: 'fa-handshake-angle',
      title: 'Direct Artisan Empowerment',
      desc: 'Fair value chain connecting rural cooperatives, women self-help collectives, and heritage sweetmakers with global diaspora markets.',
    },
  ];

  milestones = [
    { year: '2019', title: 'The Founding Craving', desc: 'Started with a simple desire: making regional Indian festive sweets accessible to diaspora families in the USA.' },
    { year: '2021', title: 'Expansion to 25+ Countries', desc: 'Introduced express cold-chain logistics and onboarded verified Ayurvedic wellness botanicals.' },
    { year: '2023', title: 'Certified Homeopathy & Healthcare', desc: 'Launched direct authorized homeopathic dispensary partnerships from Dr. Reckeweg, SBL, and Schwabe.' },
    { year: '2026', title: 'The Global Plaza of Heritage Goods', desc: 'Serving over 500,000 diaspora households across 45+ nations with 10,000+ verified authentic products.' },
  ];
}
