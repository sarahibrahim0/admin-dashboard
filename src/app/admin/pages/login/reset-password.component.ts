import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/stores/auth.store';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  styles: `
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    .login-card { animation: fadeInUp 0.5s ease-out; }
  `,
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-almond via-white to-almond px-4">
      <div class="login-card w-full max-w-md rounded-xl bg-white px-8 py-8 shadow-lg">
        <h2 class="text-center text-xl font-semibold uppercase tracking-wider text-blue-black">Reset Password</h2>
        <p class="mt-1 text-center text-sm text-[#797979]">Enter your new password</p>
        @if (auth.error(); as err) {
          <div class="mt-5 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-[#ff4545]">{{ err }}</div>
        }
        @if (success(); as msg) {
          <div class="mt-5 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{{ msg }}</div>
        }
        <form (ngSubmit)="submit()" class="mt-6 space-y-5">
          <div>
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#797979]">New Password</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="Enter new password" required
              class="w-full rounded-md border border-[#c9c9c9] px-4 py-3 text-sm text-blue-black outline-none transition-colors placeholder:text-[#c9c9c9] focus:border-salmon focus:ring-2 focus:ring-salmon/20" />
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#797979]">Confirm Password</label>
            <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" placeholder="Confirm new password" required
              class="w-full rounded-md border border-[#c9c9c9] px-4 py-3 text-sm text-blue-black outline-none transition-colors placeholder:text-[#c9c9c9] focus:border-salmon focus:ring-2 focus:ring-salmon/20" />
          </div>
          <button type="submit" [disabled]="auth.loading() || success()"
            class="w-full rounded-md bg-salmon py-3 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#e9855a] disabled:opacity-50">
            {{ auth.loading() ? 'Resetting...' : 'Reset Password' }}
          </button>
        </form>
        <div class="mt-4 text-center">
          <a routerLink="/login" class="text-sm text-[#797979] hover:text-blue-black transition-colors">Back to Login</a>
        </div>
      </div>
    </div>
  `,
})
export class ResetPasswordComponent {
  protected readonly auth = inject(AuthStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  password = '';
  confirmPassword = '';
  success = signal('');
  private token = '';
  ngOnInit(): void { this.token = this.route.snapshot.queryParamMap.get('token') || ''; }
  async submit(): Promise<void> {
    if (!this.password || this.password !== this.confirmPassword) { this.auth.error.set('Passwords do not match'); return; }
    try { await this.auth.resetPassword(this.token, this.password); this.success.set('Password updated successfully! Redirecting to login...'); setTimeout(() => this.router.navigate(['/login']), 2000); } catch {}
  }
}
