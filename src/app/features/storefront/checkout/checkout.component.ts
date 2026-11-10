import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StorefrontHeader } from '../components/storefront-header/storefront-header';
import { Footer } from '../components/footer/footer';
import { CartService } from '../../../core/services/cart.service';
import { CheckoutService } from './services/checkout.service';
import { CheckoutProgressComponent } from './components/checkout-progress/checkout-progress.component';
import { DeliveryAddressComponent } from './components/delivery-address/delivery-address.component';
import { OrderSummaryComponent } from './components/order-summary/order-summary.component';
import { PaymentMethodComponent } from './components/payment-method/payment-method.component';
import { PaymentProcessingComponent } from './components/payment-processing/payment-processing.component';
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StorefrontHeader,
    Footer,
    CheckoutProgressComponent,
    DeliveryAddressComponent,
    OrderSummaryComponent,
    PaymentMethodComponent,
    PaymentProcessingComponent,
    PaymentSuccessComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  readonly cartService = inject(CartService);
  readonly checkoutService = inject(CheckoutService);

  ngOnInit(): void {
    // If arriving at checkout with an empty cart and not viewing a finished order, default to address
    if (this.cartService.items().length === 0 && this.checkoutService.currentStep() !== 'success') {
      // Cart is empty
    }
  }
}

