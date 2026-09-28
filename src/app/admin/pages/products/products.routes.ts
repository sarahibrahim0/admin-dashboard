import { Routes } from '@angular/router';

export const PRODUCT_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./products-list.component').then((m) => m.ProductsListComponent) },
  { path: 'low-stock', loadComponent: () => import('./low-stock.component').then((m) => m.LowStockComponent) },
  { path: 'new', loadComponent: () => import('./product-form.component').then((m) => m.ProductFormComponent) },
  { path: ':id', loadComponent: () => import('./product-detail.component').then((m) => m.ProductDetailComponent) },
  { path: ':id/edit', loadComponent: () => import('./product-form.component').then((m) => m.ProductFormComponent) },
];
