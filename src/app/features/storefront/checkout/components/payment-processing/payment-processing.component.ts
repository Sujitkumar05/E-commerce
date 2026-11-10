import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutService } from '../../services/checkout.service';

@Component({
  selector: 'app-payment-processing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-processing.component.html',
  styleUrl: './payment-processing.component.scss'
})
export class PaymentProcessingComponent {
  readonly checkoutService = inject(CheckoutService);
}

