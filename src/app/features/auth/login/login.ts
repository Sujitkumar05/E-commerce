import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { StorefrontHeader } from '../../storefront/components/storefront-header/storefront-header';
import { Footer } from '../../storefront/components/footer/footer';
import { AuthService } from '../../../core/auth/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StorefrontHeader, Footer],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Form Model
  email = '';
  password = '';
  rememberMe = true;
  showPassword = false;

  // UI States
  isLoading = false;
  errorMessage = '';
  returnUrl = '/';
  redirectReason = '';
  pendingProductName = '';

  ngOnInit(): void {
    // If already logged in, redirect to returnUrl or home
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return;
    }

    // Capture route query parameters
    this.route.queryParamMap.subscribe((params) => {
      this.returnUrl = params.get('returnUrl') || '/';
      this.redirectReason = params.get('reason') || '';
      this.pendingProductName = params.get('productName') || '';

      // Check if there is an active pending action
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

    if (!this.email.trim()) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }
    if (!this.password.trim()) {
      this.errorMessage = 'Please enter your password.';
      return;
    }

    this.isLoading = true;

    try {
      const res = await this.authService.login(this.email, this.password);

      if (res.success) {
        this.completeLoginFlow();
      } else {
        this.errorMessage = res.message || 'Login failed. Please verify your credentials.';
        this.isLoading = false;
      }
    } catch {
      this.errorMessage = 'An unexpected error occurred during sign in. Please try again.';
      this.isLoading = false;
    }
  }

  /**
   * One-click demo sign-in for testing
   */
  async onDemoLogin(): Promise<void> {
    this.email = 'customer@yourstore.com';
    this.password = 'password123';
    this.isLoading = true;
    this.errorMessage = '';

    setTimeout(async () => {
      const res = await this.authService.login(this.email, this.password);
      if (res.success) {
        this.completeLoginFlow();
      } else {
        this.isLoading = false;
      }
    }, 400);
  }

  /**
   * Completes the login flow:
   * 1. If there was a pending cart action, execute it into CartService.
   * 2. Redirect the user back to the product or return page.
   */
  private completeLoginFlow(): void {
    const pending = this.authService.consumePendingCartAction();

    if (pending) {
      // Add the pending item to cart now that the user is authenticated
      this.cartService.addToCart({ ...pending.item, quantity: pending.quantity }, pending.quantity);

      // If user clicked "Buy Now", take them directly to the cart
      if (pending.actionType === 'buy') {
        this.router.navigate(['/cart']);
        return;
      }
    }

    // Navigate to returnUrl or default home
    const targetUrl = pending?.returnUrl || this.returnUrl || '/';
    this.router.navigateByUrl(targetUrl);
  }
}
