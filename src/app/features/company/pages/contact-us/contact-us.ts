import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StorefrontHeader } from '../../../storefront/components/storefront-header/storefront-header';
import { Footer } from '../../../storefront/components/footer/footer';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StorefrontHeader, Footer],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.scss',
})
export class ContactUsPage {
  name: string = '';
  email: string = '';
  subject: string = 'Order Tracking & Support';
  orderId: string = '';
  message: string = '';
  submitted: boolean = false;

  supportChannels = [
    {
      icon: 'fa-envelope',
      title: 'Customer Email',
      desc: 'support@yourstore.com / help@yourstore.com',
      sub: 'Guaranteed response within 4 hours',
      action: 'mailto:support@yourstore.com',
      actionLabel: 'Email Us',
    },
    {
      icon: 'fa-brands fa-whatsapp',
      title: 'WhatsApp Concierge',
      desc: '+1 (800) 555-STORE',
      sub: 'Live chat assistance 24/7',
      action: 'https://wa.me/',
      actionLabel: 'Chat on WhatsApp',
    },
    {
      icon: 'fa-clock',
      title: 'Operating Hours',
      desc: '24 Hours / 7 Days a Week',
      sub: 'Global diaspora dispatch desks',
      action: '#faq',
      actionLabel: 'View FAQ',
    },
  ];

  offices = [
    { city: 'United States', address: '10801 Mastin Blvd, Overland Park, KS 66213, USA' },
    { city: 'India Operations & Sourcing', address: 'Plot 42, Hitech City, Madhapur, Hyderabad, Telangana 500081' },
    { city: 'European Distribution Hub', address: 'Keizersgracht 421, 1016 EK Amsterdam, Netherlands' },
  ];

  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.name && this.email && this.message) {
      this.submitted = true;
      setTimeout(() => {
        this.name = '';
        this.email = '';
        this.orderId = '';
        this.message = '';
      }, 5000);
    }
  }
}
