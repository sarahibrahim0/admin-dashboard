import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./admin/pages/login/login.component').then((m) => m.LoginComponent) },
  { path: 'verify-email', loadComponent: () => import('./admin/pages/login/verify-email.component').then((m) => m.VerifyEmailComponent) },
  { path: 'forgot-password', loadComponent: () => import('./admin/pages/login/forgot-password.component').then((m) => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./admin/pages/login/reset-password.component').then((m) => m.ResetPasswordComponent) },
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
      { path: 'audit-logs', loadChildren: () => import('./admin/pages/audit-logs/audit-logs.routes').then((m) => m.AUDIT_LOGS_ROUTES) },
      { path: 'settings', loadChildren: () => import('./admin/pages/settings/settings.routes').then((m) => m.SETTINGS_ROUTES) },
    ],
  },
  {
    path: 'my-activity',
    loadChildren: () => import('./admin/pages/my-activity/my-activity.routes').then(m => m.MY_ACTIVITY_ROUTES),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'admin' },
];
