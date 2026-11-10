import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StorefrontHeader } from '../../../storefront/components/storefront-header/storefront-header';
import { Footer } from '../../../storefront/components/footer/footer';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [RouterLink, StorefrontHeader, Footer],
  template: `
    <app-storefront-header />
    <main class="container py-5" style="min-height: 45vh;">
      <nav aria-label="breadcrumb" class="mb-4">
        <a routerLink="/" class="text-decoration-none">Home</a>
        <span class="mx-2" aria-hidden="true">/</span>
        <span aria-current="page">Orders</span>
      </nav>
      <section class="border rounded-4 p-4 p-md-5 text-center mx-auto" style="max-width: 720px;">
        <h1 class="h3 fw-bold mb-3">Your Orders</h1>
        <p class="text-secondary mb-4">Order history will be available once customer accounts and order APIs are connected. No order has been created from this demo storefront.</p>
        <a routerLink="/products" class="btn btn-primary rounded-pill px-4">Continue shopping</a>
      </section>
    </main>
    <app-footer />
  `,
})
export class OrdersPage {}
