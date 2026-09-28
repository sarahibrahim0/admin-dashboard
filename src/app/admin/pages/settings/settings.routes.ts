import { Routes } from '@angular/router';
import { TwoFactorComponent } from './two-factor.component';

export const SETTINGS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./site-settings.component').then((m) => m.SiteSettingsComponent) },
  { path: '2fa', component: TwoFactorComponent },
  { path: 'profile', loadComponent: () => import('./profile.component').then((m) => m.ProfileComponent) },
  { path: 'shipping', loadComponent: () => import('./shipping-settings.component').then((m) => m.ShippingSettingsComponent) },
];
