import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission.guard';
import { TwoFactorComponent } from './two-factor.component';

export const SETTINGS_ROUTES: Routes = [
  { path: '', canActivate: [permissionGuard], data: { permission: 'settings:read' }, loadComponent: () => import('./site-settings.component').then((m) => m.SiteSettingsComponent) },
  { path: '2fa', component: TwoFactorComponent },
  { path: 'profile', loadComponent: () => import('./profile.component').then((m) => m.ProfileComponent) },
  { path: 'shipping', canActivate: [permissionGuard], data: { permission: 'settings:read' }, loadComponent: () => import('./shipping-settings.component').then((m) => m.ShippingSettingsComponent) },
];
