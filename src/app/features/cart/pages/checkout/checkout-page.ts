import { Component } from '@angular/core';
import { CheckoutComponent } from '../../../storefront/checkout/checkout.component';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CheckoutComponent],
  template: `<app-checkout />`
})
export class CheckoutPage {}
