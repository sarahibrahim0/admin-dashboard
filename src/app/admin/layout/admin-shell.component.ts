import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';
import { ToastsComponent } from '../../shared/ui/toasts.component';
import { ConnectivityBannerComponent } from '../../shared/ui/connectivity-banner.component';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    TopbarComponent,
    ToastsComponent,
    ConnectivityBannerComponent,
    TranslatePipe,
  ],
  template: `
    <div class="flex h-screen bg-surface" [class.admin-dark]="darkMode">
      <app-sidebar
        [mobileOpen]="mobileOpen"
        (collapsed)="collapsed = $event"
        (mobileClosed)="mobileOpen = false" />
      @if (mobileOpen) {
        <button
          type="button"
          [attr.aria-label]="'Close navigation menu' | translate"
          (click)="mobileOpen = false"
          class="fixed inset-0 z-30 bg-blue-black/30 lg:hidden"></button>
      }
      <div class="flex min-w-0 flex-1 flex-col overflow-hidden md:ms-16" [class.lg:ms-64]="!collapsed">
        <app-topbar [darkMode]="darkMode" (darkModeChange)="toggleDarkMode()" (menuToggle)="mobileOpen = !mobileOpen" />
        <app-connectivity-banner />
        <main class="flex-1 overflow-y-auto p-3 md:p-5 lg:p-6">
          <router-outlet />
        </main>
      </div>
      <app-toasts />
    </div>
  `,
})
export class AdminShellComponent {
  collapsed = false;
  mobileOpen = false;
  darkMode = localStorage.getItem('admin.darkMode') === 'true';

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('admin.darkMode', String(this.darkMode));
  }
}
