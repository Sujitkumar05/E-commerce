import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { StorefrontHeader } from '../../storefront/components/storefront-header/storefront-header';
import { Footer } from '../../storefront/components/footer/footer';
import { AuthService } from '../../../core/auth/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StorefrontHeader, Footer],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Form Model
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  agreeTerms = true;
  showPassword = false;

  // UI States
  isLoading = false;
  errorMessage = '';
  returnUrl = '/';
  redirectReason = '';
  pendingProductName = '';

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return;
    }

    this.route.queryParamMap.subscribe((params) => {
      this.returnUrl = params.get('returnUrl') || '/';
      this.redirectReason = params.get('reason') || '';
      this.pendingProductName = params.get('productName') || '';

      const pending = this.authService.pendingAction();
      if (pending && !this.pendingProductName) {
        this.pendingProductName = pending.item.name;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = '';

    if (!this.name.trim() || this.name.trim().length < 2) {
      this.errorMessage = 'Please enter your full name (at least 2 characters).';
      return;
    }

    if (!this.email.trim() || !this.email.includes('@')) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    if (!this.password || this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match. Please re-enter your password.';
      return;
    }

    if (!this.agreeTerms) {
      this.errorMessage = 'Please accept the Terms of Service to create an account.';
      return;
    }

    this.isLoading = true;

    try {
      const res = await this.authService.register(this.name, this.email, this.password);

      if (res.success) {
        this.completeRegistrationFlow();
      } else {
        this.errorMessage = res.message || 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    } catch {
      this.errorMessage = 'An error occurred during account creation. Please try again.';
      this.isLoading = false;
    }
  }

  private completeRegistrationFlow(): void {
    const pending = this.authService.consumePendingCartAction();

    if (pending) {
      this.cartService.addToCart({ ...pending.item, quantity: pending.quantity }, pending.quantity);

      if (pending.actionType === 'buy') {
        this.router.navigate(['/cart']);
        return;
      }
    }

    const targetUrl = pending?.returnUrl || this.returnUrl || '/';
    this.router.navigateByUrl(targetUrl);
  }
}
