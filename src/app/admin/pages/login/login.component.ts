import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../../core/stores/auth.store';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-almond">
      <div class="mx-auto max-w-md px-4 py-16">
        <h1 class="text-2xl font-bold text-[#140C40]">Sign in</h1>
        <p class="mt-1 text-sm text-[#797979]">Admin Dashboard</p>

        @if (auth.error()) {
          <p class="mt-4 bg-white p-3 text-sm text-rose-700">{{ auth.error() }}</p>
        }

      <form (ngSubmit)="submit()" class="mt-6 space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-[#646D77]">Email</label>
          <input
            id="email"
            type="email"
            [(ngModel)]="email"
            name="email"
            class="mt-1 w-full rounded-none border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-[#646D77]">Password</label>
          <input
            id="password"
            type="password"
            [(ngModel)]="password"
            name="password"
            class="mt-1 w-full rounded-none border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
        </div>
        <button
          type="submit"
          [disabled]="auth.loading()"
          class="w-full rounded-none bg-salmon px-4 py-2.5 text-sm font-medium uppercase tracking-wider text-white hover:bg-[#e9855a] disabled:opacity-50">
          {{ auth.loading() ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  protected readonly auth = inject(AuthStore);
  private router = inject(Router);
  email = '';
  password = '';

  async submit(): Promise<void> {
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/admin/dashboard']);
    } catch {}
  }
}
