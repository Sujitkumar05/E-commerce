import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckoutService } from '../../services/checkout.service';
import { PaymentMethodType, UpiApp } from '../../models/checkout.model';

@Component({
  selector: 'app-payment-method',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-method.component.html',
  styleUrl: './payment-method.component.scss'
})
export class PaymentMethodComponent {
  readonly checkoutService = inject(CheckoutService);

  // Form Fields
  selectedMethod: PaymentMethodType = 'upi';
  selectedUpiApp: UpiApp = 'gpay';
  customUpiId = '';
  isUpiVerified = false;
  upiVerifyError = '';

  // Card Form
  cardNumber = '';
  cardHolder = '';
  cardExpiry = '';
  cardCvv = '';
  saveCard = true;
  cardErrors: Record<string, string> = {};

  // Net Banking
  selectedBank = 'HDFC Bank';
  readonly popularBanks = [
    { name: 'HDFC Bank', code: 'HDFC', icon: 'fa-building-columns' },
    { name: 'State Bank of India', code: 'SBI', icon: 'fa-landmark' },
    { name: 'ICICI Bank', code: 'ICICI', icon: 'fa-building-columns' },
    { name: 'Axis Bank', code: 'AXIS', icon: 'fa-landmark' },
    { name: 'Kotak Mahindra Bank', code: 'KOTAK', icon: 'fa-building-columns' },
    { name: 'Punjab National Bank', code: 'PNB', icon: 'fa-landmark' }
  ];

  readonly otherBanks = [
    'Bank of Baroda', 'Canara Bank', 'Union Bank of India', 'IndusInd Bank',
    'IDFC FIRST Bank', 'Federal Bank', 'Yes Bank', 'Standard Chartered'
  ];

  // Cash on Delivery Captcha
  codCaptchaInput = '';
  codCaptchaCode = this.generateCaptcha();
  codCaptchaError = '';

  setPaymentMethod(method: PaymentMethodType): void {
    this.selectedMethod = method;
    this.checkoutService.updatePaymentDetails({ method });
  }

  setUpiApp(app: UpiApp): void {
    this.selectedUpiApp = app;
    this.checkoutService.updatePaymentDetails({ upiApp: app });
  }

  verifyUpiId(): void {
    const id = this.customUpiId.trim();
    if (!id || !id.includes('@')) {
      this.upiVerifyError = 'Please enter a valid UPI ID (e.g. yourname@okhdfcbank)';
      this.isUpiVerified = false;
      return;
    }
    this.isUpiVerified = true;
    this.upiVerifyError = '';
    this.checkoutService.updatePaymentDetails({ upiId: id });
  }

  // Format card number with spaces (#### #### #### ####)
  onCardNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').substring(0, 16);
    const parts = value.match(/.{1,4}/g);
    this.cardNumber = parts ? parts.join(' ') : value;
    delete this.cardErrors['number'];
  }

  // Format card expiry (MM/YY)
  onExpiryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 2) {
      this.cardExpiry = value.substring(0, 2) + '/' + value.substring(2);
    } else {
      this.cardExpiry = value;
    }
    delete this.cardErrors['expiry'];
  }

  getCardType(): string {
    const num = this.cardNumber.replace(/\s+/g, '');
    if (num.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(num)) return 'Mastercard';
    if (/^6[0-9]/.test(num)) return 'RuPay';
    if (/^3[47]/.test(num)) return 'Amex';
    return '';
  }

  refreshCaptcha(): void {
    this.codCaptchaCode = this.generateCaptcha();
    this.codCaptchaInput = '';
    this.codCaptchaError = '';
  }

  generateCaptcha(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  validatePayment(): boolean {
    if (this.selectedMethod === 'upi') {
      if (this.selectedUpiApp === 'custom') {
        if (!this.customUpiId.trim() || !this.customUpiId.includes('@')) {
          this.upiVerifyError = 'Please enter and verify a valid UPI ID.';
          return false;
        }
      }
      this.checkoutService.updatePaymentDetails({
        method: 'upi',
        upiApp: this.selectedUpiApp,
        upiId: this.customUpiId.trim() || undefined
      });
      return true;
    }

    if (this.selectedMethod === 'card') {
      this.cardErrors = {};
      const cleanNum = this.cardNumber.replace(/\s+/g, '');
      if (cleanNum.length < 15) {
        this.cardErrors['number'] = 'Please enter a valid 16-digit card number.';
      }
      if (!this.cardHolder.trim()) {
        this.cardErrors['holder'] = 'Cardholder name is required.';
      }
      if (this.cardExpiry.length < 5) {
        this.cardErrors['expiry'] = 'Valid expiry (MM/YY) required.';
      }
      if (this.cardCvv.length < 3) {
        this.cardErrors['cvv'] = '3-digit CVV required.';
      }

      if (Object.keys(this.cardErrors).length > 0) {
        return false;
      }

      this.checkoutService.updatePaymentDetails({
        method: 'card',
        cardNumber: this.cardNumber,
        cardHolder: this.cardHolder,
        cardExpiry: this.cardExpiry,
        cardCvv: this.cardCvv,
        saveCard: this.saveCard
      });
      return true;
    }

    if (this.selectedMethod === 'netbanking') {
      if (!this.selectedBank) {
        return false;
      }
      this.checkoutService.updatePaymentDetails({
        method: 'netbanking',
        bankName: this.selectedBank
      });
      return true;
    }

    if (this.selectedMethod === 'cod') {
      if (this.codCaptchaInput.trim() !== this.codCaptchaCode) {
        this.codCaptchaError = 'Incorrect security verification code. Please try again.';
        return false;
      }
      this.checkoutService.updatePaymentDetails({
        method: 'cod',
        codVerified: true
      });
      return true;
    }

    return true;
  }

  onPayNow(): void {
    if (!this.validatePayment()) {
      return;
    }

    this.checkoutService.processPayment();
  }

  backToSummary(): void {
    this.checkoutService.setStep('summary');
  }
}

