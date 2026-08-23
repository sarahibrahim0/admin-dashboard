import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#c9c9c9] bg-almond backdrop-blur px-8">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold text-blue-black uppercase tracking-wider">Dashboard</h1>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm text-blue-black">{{ auth.user()?.name || 'Admin' }}</span>
        <button
          (click)="logout()"
          class="bg-salmon px-4 py-2 text-sm font-medium uppercase tracking-wider text-white hover:bg-[#e9855a] transition-all duration-300">
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
