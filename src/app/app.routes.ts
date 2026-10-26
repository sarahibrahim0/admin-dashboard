import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./admin/pages/login/login.component').then((m) => m.LoginComponent) },
  { path: 'verify-email', loadComponent: () => import('./admin/pages/login/verify-email.component').then((m) => m.VerifyEmailComponent) },
  { path: 'forgot-password', loadComponent: () => import('./admin/pages/login/forgot-password.component').then((m) => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./admin/pages/login/reset-password.component').then((m) => m.ResetPasswordComponent) },
  {
    path: 'admin',
    canActivate: [adminGuard],
    canActivateChild: [permissionGuard],
    loadComponent: () => import('./admin/layout/admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', data: { permission: 'dashboard:read' }, loadComponent: () => import('./admin/pages/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'products', data: { permission: 'products:read' }, loadChildren: () => import('./admin/pages/products/products.routes').then((m) => m.PRODUCT_ROUTES) },
      { path: 'categories', data: { permission: 'categories:read' }, loadChildren: () => import('./admin/pages/categories/categories.routes').then((m) => m.CATEGORY_ROUTES) },
      { path: 'orders', data: { permission: 'orders:read' }, loadChildren: () => import('./admin/pages/orders/orders.routes').then((m) => m.ORDER_ROUTES) },
      { path: 'coupons', data: { permission: 'coupons:read' }, loadChildren: () => import('./admin/pages/coupons/coupons.routes').then((m) => m.COUPON_ROUTES) },
      { path: 'payments', data: { permission: 'payments:read' }, loadChildren: () => import('./admin/pages/payments/payments.routes').then((m) => m.PAYMENT_ROUTES) },
      { path: 'countries', data: { permission: 'countries:read' }, loadChildren: () => import('./admin/pages/countries/countries.routes').then((m) => m.COUNTRY_ROUTES) },
      { path: 'currencies', data: { permission: 'currencies:read' }, loadChildren: () => import('./admin/pages/currencies/currencies.routes').then((m) => m.CURRENCY_ROUTES) },
      { path: 'users', data: { permission: 'users:read' }, loadChildren: () => import('./admin/pages/users/users.routes').then((m) => m.USER_ROUTES) },
      { path: 'reviews', data: { permission: 'reviews:read' }, loadChildren: () => import('./admin/pages/reviews/reviews.routes').then((m) => m.REVIEW_ROUTES) },
      { path: 'roles', data: { permission: 'roles:read' }, loadChildren: () => import('./admin/pages/roles/roles.routes').then((m) => m.ROLE_ROUTES) },
      { path: 'audit-logs', data: { permission: 'audit-logs:read' }, loadChildren: () => import('./admin/pages/audit-logs/audit-logs.routes').then((m) => m.AUDIT_LOGS_ROUTES) },
      { path: 'settings', data: { permission: 'settings:read' }, loadChildren: () => import('./admin/pages/settings/settings.routes').then((m) => m.SETTINGS_ROUTES) },
      { path: 'my-activity', data: { permission: 'audit-logs:read' }, loadChildren: () => import('./admin/pages/my-activity/my-activity.routes').then(m => m.MY_ACTIVITY_ROUTES) },
    ],
  },
  { path: 'my-activity', redirectTo: 'admin/my-activity', pathMatch: 'full' },
  { path: '**', redirectTo: 'admin' },
];
