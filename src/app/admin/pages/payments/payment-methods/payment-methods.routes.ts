import { Routes } from '@angular/router';

export const PAYMENT_METHOD_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./payment-methods-list.component').then((m) => m.PaymentMethodsListComponent) },
  { path: 'new', loadComponent: () => import('./payment-method-form.component').then((m) => m.PaymentMethodFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./payment-method-form.component').then((m) => m.PaymentMethodFormComponent) },
];