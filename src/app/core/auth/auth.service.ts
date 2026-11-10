import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'customer' | 'admin' | 'seller';
  avatar?: string;
  token?: string;
}

export interface PendingCartAction {
  item: {
    productId: string;
    name: string;
    brand: string;
    image: string;
    price: number;
    variant: string;
    originalPrice?: number;
    discountPercent?: number;
  };
  quantity: number;
  actionType: 'add' | 'buy';
  returnUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);

  private readonly AUTH_USER_KEY = 'yourstore_auth_user';
  private readonly PENDING_ACTION_KEY = 'yourstore_pending_cart_action';

  constructor() {
    // Clean up passwords written by an earlier demo version. This is not a substitute
    // for server-side authentication; it prevents leaving that old registry behind.
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('yourstore_registered_users');
      }
    } catch { /* Storage may be unavailable in restricted browser contexts. */ }
  }

  // Reactive state signals
  private readonly _currentUser = signal<User | null>(this.loadUserFromStorage());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());

  private readonly _pendingAction = signal<PendingCartAction | null>(this.loadPendingActionFromStorage());
  readonly pendingAction = this._pendingAction.asReadonly();

  // Demo-only accounts. Real customer authentication must be implemented by the backend.
  private readonly defaultUsers: { email: string; password: string; user: User }[] = [
    {
      email: 'customer@yourstore.com',
      password: 'password123',
      user: {
        id: 'usr_cust_01',
        name: 'Sujit Kumar',
        email: 'customer@yourstore.com',
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
    },
    {
      email: 'alex@worldmarket.com',
      password: 'password123',
      user: {
        id: 'usr_alex_02',
        name: 'Alex Morgan',
        email: 'alex@worldmarket.com',
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
    },
  ];

  // Frontend-only admin demo account. Replace this with server-side authentication before production.
  // Do not treat credentials embedded in a client application as secure.
  private readonly adminDemoUser: { email: string; password: string; user: User } = {
    email: 'admin@dista.demo',
    password: 'AdminDemo123!',
    user: { id: 'usr_admin_demo', name: 'Store Admin', email: 'admin@dista.demo', role: 'admin' },
  };

  // Newly registered demo accounts are held in memory only; never persist passwords.
  private readonly sessionRegisteredUsers: { email: string; password: string; user: User }[] = [];

  /**
   * Demo-only login. This is not production authentication and must be replaced by a backend API.
   */
  async login(email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail) {
      return { success: false, message: 'Please enter your email address.' };
    }
    if (!cleanPassword) {
      return { success: false, message: 'Please enter your password.' };
    }

    if (cleanEmail === this.adminDemoUser.email && cleanPassword === this.adminDemoUser.password) {
      this.setUser(this.adminDemoUser.user);
      return { success: true, user: this.adminDemoUser.user };
    }

    // Check session-only demo registrations (passwords are never written to browser storage).
    const foundRegistered = this.sessionRegisteredUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword
    );

    if (foundRegistered) {
      this.setUser(foundRegistered.user);
      return { success: true, user: foundRegistered.user };
    }

    // Check default demo users
    const foundDemo = this.defaultUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword
    );

    if (foundDemo) {
      this.setUser(foundDemo.user);
      return { success: true, user: foundDemo.user };
    }

    // Check if email exists with different password
    const emailExists =
      this.sessionRegisteredUsers.some((u) => u.email.toLowerCase() === cleanEmail) ||
      this.defaultUsers.some((u) => u.email.toLowerCase() === cleanEmail);

    if (emailExists) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    // If it's a valid email format and password >= 6, allow seamless registration on login or error
    return {
      success: false,
      message: 'Account not found. Please check your credentials or create a new account.',
    };
  }

  /**
   * Register a new user account and immediately log them in.
   */
  async register(name: string, email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanName) {
      return { success: false, message: 'Please enter your full name.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    const alreadyExists =
      this.sessionRegisteredUsers.some((u) => u.email.toLowerCase() === cleanEmail) ||
      this.defaultUsers.some((u) => u.email.toLowerCase() === cleanEmail);

    if (alreadyExists) {
      return {
        success: false,
        message: 'An account with this email already exists. Please sign in instead.',
      };
    }

    const newUser: User = {
      id: 'usr_' + Date.now(),
      name: cleanName,
      email: cleanEmail,
      role: 'customer',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
    };

    this.sessionRegisteredUsers.push({
      email: cleanEmail,
      password: cleanPassword,
      user: newUser,
    });

    // Automatically set current user
    this.setUser(newUser);
    return { success: true, user: newUser };
  }

  /**
   * Fast demo sign-in for quick evaluation
   */
  quickDemoLogin(): void {
    const demo = this.defaultUsers[0].user;
    this.setUser(demo);
  }

  /**
   * Log out current user
   */
  logout(): void {
    this._currentUser.set(null);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.AUTH_USER_KEY);
    }
  }

  /**
   * Set user and persist in local storage
   */
  private setUser(user: User): void {
    this._currentUser.set(user);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.AUTH_USER_KEY, JSON.stringify(user));
    }
  }

  /**
   * Save pending cart action before redirecting to login
   */
  setPendingCartAction(action: PendingCartAction): void {
    this._pendingAction.set(action);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.PENDING_ACTION_KEY, JSON.stringify(action));
    }
  }

  /**
   * Retrieve and clear pending cart action
   */
  consumePendingCartAction(): PendingCartAction | null {
    const action = this._pendingAction();
    this.clearPendingCartAction();
    return action;
  }

  /**
   * Clear pending action
   */
  clearPendingCartAction(): void {
    this._pendingAction.set(null);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.PENDING_ACTION_KEY);
    }
  }

  /**
   * Require authentication before an action (like Add to Cart or Buy Now).
   * If not logged in, saves pending action and navigates to login with returnUrl.
   * Returns true if user is already authenticated.
   */
  requireAuthForCart(action: PendingCartAction): boolean {
    if (this.isAuthenticated()) {
      return true;
    }

    this.setPendingCartAction(action);
    const returnUrl = action.returnUrl || this.router.url;
    this.router.navigate(['/login'], {
      queryParams: {
        returnUrl,
        reason: action.actionType === 'buy' ? 'buynow' : 'cart',
        productName: action.item.name,
      },
    });
    return false;
  }

  /**
   * Storage helpers
   */
  private loadUserFromStorage(): User | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    try {
      const data = localStorage.getItem(this.AUTH_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private loadPendingActionFromStorage(): PendingCartAction | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    try {
      const data = localStorage.getItem(this.PENDING_ACTION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

}
