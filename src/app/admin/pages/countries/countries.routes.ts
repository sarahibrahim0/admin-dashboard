import { Routes } from '@angular/router';

export const COUNTRY_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./countries-list.component').then((m) => m.CountriesListComponent) },
  { path: 'new', loadComponent: () => import('./country-form.component').then((m) => m.CountryFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./country-form.component').then((m) => m.CountryFormComponent) },
];