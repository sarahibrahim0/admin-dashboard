import { Routes } from '@angular/router';

export const COUPON_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./coupons-list.component').then((m) => m.CouponsListComponent) },
  { path: 'new', loadComponent: () => import('./coupon-form.component').then((m) => m.CouponFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./coupon-form.component').then((m) => m.CouponFormComponent) },
];
