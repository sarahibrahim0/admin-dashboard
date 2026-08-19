import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./admin/pages/login/login.component').then((m) => m.LoginComponent) },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./admin/layout/admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./admin/pages/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'products', loadChildren: () => import('./admin/pages/products/products.routes').then((m) => m.PRODUCT_ROUTES) },
      { path: 'categories', loadChildren: () => import('./admin/pages/categories/categories.routes').then((m) => m.CATEGORY_ROUTES) },
      { path: 'orders', loadChildren: () => import('./admin/pages/orders/orders.routes').then((m) => m.ORDER_ROUTES) },
      { path: 'coupons', loadChildren: () => import('./admin/pages/coupons/coupons.routes').then((m) => m.COUPON_ROUTES) },
      { path: 'users', loadChildren: () => import('./admin/pages/users/users.routes').then((m) => m.USER_ROUTES) },
      { path: 'reviews', loadChildren: () => import('./admin/pages/reviews/reviews.routes').then((m) => m.REVIEW_ROUTES) },
      { path: 'content', loadChildren: () => import('./admin/pages/content/content.routes').then((m) => m.CONTENT_ROUTES) },
      { path: 'roles', loadChildren: () => import('./admin/pages/roles/roles.routes').then((m) => m.ROLE_ROUTES) },
    ],
  },
  { path: '**', redirectTo: 'admin' },
];
