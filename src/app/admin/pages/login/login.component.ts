import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../../core/stores/auth.store';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  styles: `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .login-card { animation: fadeInUp 0.5s ease-out; }
  `,
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-almond via-white to-almond px-4">
      <div class="login-card w-full max-w-md">
        <!-- Header bar -->
        <div class="rounded-t-xl bg-gradient-to-r from-salmon to-dark-purple px-8 py-6 text-center">
          <span class="text-2xl font-bold uppercase tracking-widest text-white">Admin</span>
          <p class="mt-1 text-sm text-white/80 tracking-wide">Dashboard</p>
        </div>

        <!-- Card body -->
        <div class="rounded-b-xl bg-white px-8 py-8 shadow-lg">
          @if (auth.error()) {
            <div class="mt-5 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-[#ff4545]">
              {{ auth.error() }}
            </div>
          }

          <form (ngSubmit)="submit()" class="mt-6 space-y-5">
            <div>
              <label for="email" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#797979]">Email Address</label>
              <input
                id="email"
                type="email"
                [(ngModel)]="email"
                name="email"
                placeholder="admin@example.com"
                required
                class="w-full rounded-md border border-[#c9c9c9] px-4 py-3 text-sm text-blue-black outline-none transition-colors placeholder:text-[#c9c9c9] focus:border-salmon focus:ring-2 focus:ring-salmon/20" />
            </div>
            <div>
              <label for="password" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#797979]">Password</label>
              <input
                id="password"
                type="password"
                [(ngModel)]="password"
                name="password"
                placeholder="Enter your password"
                required
                class="w-full rounded-md border border-[#c9c9c9] px-4 py-3 text-sm text-blue-black outline-none transition-colors placeholder:text-[#c9c9c9] focus:border-salmon focus:ring-2 focus:ring-salmon/20" />
            </div>

            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="keepLoggedIn"
                  name="keepLoggedIn"
                  class="h-4 w-4 rounded border-[#c9c9c9] text-salmon accent-[#FD8F5F] focus:ring-salmon" />
                <span class="text-sm text-[#646D77]">Keep me logged in</span>
              </label>
              <a href="javascript:void(0)" class="text-sm font-medium text-salmon hover:text-[#e9855a] transition-colors">Forgot password?</a>
            </div>

            <button
              type="submit"
              [disabled]="auth.loading()"
              class="w-full rounded-md bg-salmon py-3 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#e9855a] disabled:opacity-50">
              {{ auth.loading() ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  protected readonly auth = inject(AuthStore);
  private router = inject(Router);
  email = '';
  password = '';
  keepLoggedIn = false;

  async submit(): Promise<void> {
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/admin/dashboard']);
    } catch {}
  }
}
