import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur px-6">
      <div class="flex items-center gap-4">
        <h1 class="text-lg font-semibold text-slate-900">Dashboard</h1>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm text-slate-600">{{ auth.user()?.name || 'Admin' }}</span>
        <button
          (click)="logout()"
          class="rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-rose-600">
          Logout
        </button>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  protected readonly auth = inject(AuthStore);
  private router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
