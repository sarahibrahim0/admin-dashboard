import { Routes } from '@angular/router';

export const REVIEW_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./reviews-list.component').then((m) => m.ReviewsListComponent) },
];
