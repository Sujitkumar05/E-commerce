import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CheckoutService } from '../../services/checkout.service';
import { CheckoutStep } from '../../models/checkout.model';

@Component({
  selector: 'app-checkout-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-progress.component.html',
  styleUrl: './checkout-progress.component.scss'
})
export class CheckoutProgressComponent {
  readonly checkoutService = inject(CheckoutService);
  private readonly router = inject(Router);

  readonly steps: { id: CheckoutStep | 'cart'; label: string; icon: string }[] = [
    { id: 'cart', label: 'Cart', icon: 'fa-cart-shopping' },
    { id: 'address', label: 'Address', icon: 'fa-location-dot' },
    { id: 'summary', label: 'Order Summary', icon: 'fa-list-check' },
    { id: 'payment', label: 'Payment', icon: 'fa-credit-card' },
    { id: 'success', label: 'Done', icon: 'fa-circle-check' }
  ];

  isCurrent(stepId: string): boolean {
    const current = this.checkoutService.currentStep();
    if (current === 'processing' && stepId === 'payment') {
      return true;
    }
    return current === stepId;
  }

  isCompleted(stepId: string): boolean {
    const current = this.checkoutService.currentStep();
    const order: string[] = ['cart', 'address', 'summary', 'payment', 'success'];
    const currentIdx = current === 'processing' ? 3 : order.indexOf(current);
    const stepIdx = order.indexOf(stepId);
    return stepIdx < currentIdx;
  }

  canNavigate(stepId: string): boolean {
    const current = this.checkoutService.currentStep();
    if (current === 'processing' || current === 'success') {
      return false;
    }
    return this.isCompleted(stepId);
  }

  onStepClick(stepId: string): void {
    if (!this.canNavigate(stepId)) return;

    if (stepId === 'cart') {
      this.router.navigate(['/cart']);
      return;
    }

    if (stepId === 'address' || stepId === 'summary' || stepId === 'payment') {
      this.checkoutService.setStep(stepId as CheckoutStep);
    }
  }
}

