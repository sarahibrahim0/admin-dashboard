import { Routes } from '@angular/router';
import { TwoFactorComponent } from './two-factor.component';

export const SETTINGS_ROUTES: Routes = [
  { path: '2fa', component: TwoFactorComponent },
  { path: '', redirectTo: '2fa', pathMatch: 'full' },
];
