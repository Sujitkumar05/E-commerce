import { Routes } from '@angular/router';
import { Home } from './features/storefront/pages/home/home';
import { CartPage } from './features/cart/pages/cart/cart-page';
import { ProductDetailPage } from './features/catalog/pages/product-detail/product-detail';
import { ProductCatalogPage } from './features/catalog/pages/product-catalog/product-catalog';
import { WishlistPage } from './features/wishlist/pages/wishlist/wishlist-page';
import { HomeopathyPage } from './features/catalog/pages/homeopathy-page/homeopathy-page';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { authGuard } from './core/guards/auth.guard';
import { AboutUsPage } from './features/company/pages/about-us/about-us';
import { GlobalDeliveryPage } from './features/company/pages/global-delivery/global-delivery';
import { StoreFeaturesPage } from './features/company/pages/store-features/store-features';
import { CareersPage } from './features/company/pages/careers/careers';
import { ContactUsPage } from './features/company/pages/contact-us/contact-us';
import { BlogPage } from './features/company/pages/blog/blog';
import { OrdersPage } from './features/account/pages/orders/orders-page';
import { CheckoutPage } from './features/cart/pages/checkout/checkout-page';
import { adminGuard } from './core/guards/admin.guard';
import { AdminLogin } from './features/admin/pages/login/admin-login';
import { AdminLayout } from './features/admin/layouts/admin-layout/admin-layout';
import { AdminDashboard } from './features/admin/pages/dashboard/dashboard';
import { AdminProducts } from './features/admin/pages/products/products';
import { AdminProductForm } from './features/admin/pages/products/product-form';
import { AdminOrders } from './features/admin/pages/orders/orders';
import { AdminOrderDetail } from './features/admin/pages/orders/order-detail/order-detail.component';
import { AdminCustomers } from './features/admin/pages/customers/customers';
import { AdminCategories } from './features/admin/pages/categories/categories';
import { AdminBrands } from './features/admin/pages/brands/brands';
import { AdminBanners } from './features/admin/pages/banners/banners';
import { AdminReports } from './features/admin/pages/reports/reports';
import { AdminSettings } from './features/admin/pages/settings/settings';
import { AdminHomeManager } from './features/admin/pages/home-manager/home-manager';
import { AdminInventory } from './features/admin/pages/inventory/inventory';
import { AdminProcurement } from './features/admin/pages/procurement/procurement';

export const routes: Routes = [
  // Admin is a separate feature area inside the same Angular application.
  { path: 'admin/login', component: AdminLogin },
  { path: 'admin', component: AdminLayout, canActivate: [adminGuard], children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: AdminDashboard },
    { path: 'home-manager', component: AdminHomeManager },
    { path: 'products', component: AdminProducts },
    { path: 'products/new', component: AdminProductForm },
    { path: 'orders', component: AdminOrders },
    { path: 'orders/details', component: AdminOrderDetail },
    { path: 'orders/:id', component: AdminOrderDetail },
    { path: 'procurement', component: AdminProcurement },
    { path: 'procurement/:id', component: AdminProcurement },
    { path: 'customers', component: AdminCustomers },
    { path: 'categories', component: AdminCategories },
    { path: 'brands', component: AdminBrands },
    { path: 'inventory', component: AdminInventory },
    { path: 'banners', component: AdminBanners },
    { path: 'pages', component: AdminDashboard },
    { path: 'blog', component: AdminDashboard },
    { path: 'notifications', component: AdminSettings },
    { path: 'reports', component: AdminReports },
    { path: 'settings', component: AdminSettings },
  ] },
  { path: '', component: Home },
  { path: 'homeopathy', component: HomeopathyPage },
  { path: 'homeopathic-products', redirectTo: 'homeopathy' },
  { path: 'products', component: ProductCatalogPage },
  { path: 'catalog', redirectTo: 'products' },
  
  // Company & Information Pages
  { path: 'about-us', component: AboutUsPage },
  { path: 'about', redirectTo: 'about-us' },
  { path: 'global-delivery', component: GlobalDeliveryPage },
  { path: 'store-features', component: StoreFeaturesPage },
  { path: 'features', redirectTo: 'store-features' },
  { path: 'careers', component: CareersPage },
  { path: 'contact-us', component: ContactUsPage },
  { path: 'contact', redirectTo: 'contact-us' },
  { path: 'blog', component: BlogPage },

  // Auth & Account
  { path: 'login', component: LoginComponent },
  { path: 'signin', redirectTo: 'login' },
  { path: 'register', component: RegisterComponent },
  { path: 'signup', redirectTo: 'register' },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },

  // Cart & Checkout
  { path: 'cart', component: CartPage, canActivate: [authGuard] },
  { path: 'orders', component: OrdersPage, canActivate: [authGuard] },
  { path: 'checkout', component: CheckoutPage, canActivate: [authGuard] },
  { path: 'wishlist', component: WishlistPage },
  { path: 'product/:id', component: ProductDetailPage },
  { path: 'product', component: ProductDetailPage },
  { path: '**', redirectTo: '' },
];
