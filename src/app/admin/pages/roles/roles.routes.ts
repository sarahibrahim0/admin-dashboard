import { Routes } from '@angular/router';

export const ROLE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./roles-list.component').then((m) => m.RolesListComponent) },
  { path: 'new', loadComponent: () => import('./role-form.component').then((m) => m.RoleFormComponent) },
  { path: ':id', loadComponent: () => import('./role-detail.component').then((m) => m.RoleDetailComponent) },
  { path: ':id/edit', loadComponent: () => import('./role-form.component').then((m) => m.RoleFormComponent) },
];
