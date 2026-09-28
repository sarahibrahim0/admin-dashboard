import { Routes } from '@angular/router';

export const PAYMENT_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./transactions-list.component').then((m) => m.TransactionsListComponent) },
  { path: 'transactions', redirectTo: '', pathMatch: 'full' },
  { path: 'methods', loadChildren: () => import('./payment-methods/payment-methods.routes').then((m) => m.PAYMENT_METHOD_ROUTES) },
];