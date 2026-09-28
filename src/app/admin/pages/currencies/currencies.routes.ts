import { Routes } from '@angular/router';

export const CURRENCY_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./currencies-list.component').then((m) => m.CurrenciesListComponent) },
  { path: 'new', loadComponent: () => import('./currency-form.component').then((m) => m.CurrencyFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./currency-form.component').then((m) => m.CurrencyFormComponent) },
];