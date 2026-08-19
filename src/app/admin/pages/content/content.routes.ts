import { Routes } from '@angular/router';

export const CONTENT_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./content-list.component').then((m) => m.ContentListComponent) },
  { path: 'new', loadComponent: () => import('./content-form.component').then((m) => m.ContentFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./content-form.component').then((m) => m.ContentFormComponent) },
];
