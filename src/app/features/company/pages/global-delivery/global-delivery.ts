import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StorefrontHeader } from '../../../storefront/components/storefront-header/storefront-header';
import { Footer } from '../../../storefront/components/footer/footer';

@Component({
  selector: 'app-global-delivery',
  standalone: true,
  imports: [CommonModule, RouterLink, StorefrontHeader, Footer],
  templateUrl: './global-delivery.html',
  styleUrl: './global-delivery.scss',
})
export class GlobalDeliveryPage {
  globalHubs = [
    { country: 'United States', code: 'USA', flag: '🇺🇸', cities: 'Overland Park, Frisco, San Jose, Chicago, Dallas, New York, Seattle', eta: '3 - 5 Business Days' },
    { country: 'United Kingdom', code: 'UK', flag: '🇬🇧', cities: 'London, Birmingham, Manchester, Leicester, Edinburgh, Glasgow', eta: '3 - 4 Business Days' },
    { country: 'Canada', code: 'CAN', flag: '🇨🇦', cities: 'Toronto, Vancouver, Calgary, Edmonton, Brampton, Mississauga', eta: '4 - 6 Business Days' },
    { country: 'Netherlands & EU', code: 'EU', flag: '🇳🇱', cities: 'Amsterdam, Rotterdam, The Hague, Frankfurt, Paris, Brussels', eta: '4 - 5 Business Days' },
    { country: 'Australia & NZ', code: 'AUS', flag: '🇦🇺', cities: 'Sydney, Melbourne, Brisbane, Perth, Auckland', eta: '5 - 7 Business Days' },
    { country: 'Middle East', code: 'UAE', flag: '🇦🇪', cities: 'Dubai, Abu Dhabi, Sharjah, Doha, Muscat', eta: '2 - 3 Business Days' },
  ];

  features = [
    {
      icon: 'fa-plane-departure',
      title: 'Daily Air Freight Cargo',
      desc: 'Parcels fly daily out of Hyderabad, Delhi, and Mumbai international cargo terminals with certified priority air clearance.',
    },
    {
      icon: 'fa-temperature-arrow-down',
      title: 'Climate-Controlled Packaging',
      desc: 'Insulated food-grade bubble barrier packaging to safeguard fresh ghee sweets, homeopathy liquid potencies, and oils.',
    },
    {
      icon: 'fa-file-shield',
      title: 'DDP - Delivered Duty Paid',
      desc: 'Zero surprise import duties at your door. All taxes and customs clearances are completely managed and pre-cleared.',
    },
    {
      icon: 'fa-location-crosshairs',
      title: 'End-to-End Live Tracking',
      desc: 'Trace your package in real-time from the kitchen in India right up to your doorstep with SMS and email checkpoints.',
    },
  ];
}
