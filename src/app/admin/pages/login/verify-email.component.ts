import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/stores/auth.store';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [FormsModule, RouterLink],
  styles: `
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    .login-card { animation: fadeInUp 0.5s ease-out; }
  `,
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-almond via-white to-almond px-4">
      <div class="login-card w-full max-w-md rounded-xl bg-white px-8 py-8 shadow-lg">
        <h2 class="text-center text-xl font-semibold uppercase tracking-wider text-blue-black">Verify Your Email</h2>
        <p class="mt-1 text-center text-sm text-[#797979]">We've sent a 6-digit code to your email</p>
        @if (auth.error(); as err) {
          <div class="mt-5 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-[#ff4545]">{{ err }}</div>
        }
        @if (success(); as msg) {
          <div class="mt-5 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{{ msg }}</div>
        }
        <form (ngSubmit)="submit()" class="mt-6 space-y-5">
          <div>
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#797979]">Verification Code</label>
            <input type="text" [(ngModel)]="code" name="code" maxlength="6" placeholder="Enter 6-digit code" required
              class="w-full rounded-md border border-[#c9c9c9] px-4 py-3 text-center text-lg tracking-[0.5em] text-blue-black outline-none transition-colors placeholder:text-[#c9c9c9] placeholder:tracking-normal placeholder:text-sm focus:border-salmon focus:ring-2 focus:ring-salmon/20" />
          </div>
          <button type="submit" [disabled]="auth.loading() || success()"
            class="w-full rounded-md bg-salmon py-3 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#e9855a] disabled:opacity-50">
            {{ auth.loading() ? 'Verifying...' : 'Verify' }}
          </button>
        </form>
        <div class="mt-4 text-center">
          <button (click)="resend()" [disabled]="resending() || cooldown() > 0" class="text-sm text-salmon hover:text-[#e9855a] transition-colors disabled:opacity-50">
            {{ cooldown() > 0 ? 'Resend in ' + cooldown() + 's' : (resending() ? 'Sending...' : 'Resend code') }}
          </button>
        </div>
        <div class="mt-4 text-center">
          <a routerLink="/login" class="text-sm text-[#797979] hover:text-blue-black transition-colors">Back to Login</a>
        </div>
      </div>
    </div>
  `,
})
export class VerifyEmailComponent {
  protected readonly auth = inject(AuthStore);
  private router = inject(Router);
  code = '';
  success = signal('');
  resending = signal(false);
  cooldown = signal(0);
  private interval: any;
  async submit(): Promise<void> {
    if (this.code.length !== 6) return;
    try { await this.auth.verifyEmail(this.code); this.success.set('Email verified successfully! Redirecting...'); setTimeout(() => this.router.navigate(['/login']), 2000); } catch {}
  }
  async resend(): Promise<void> {
    this.resending.set(true);
    try { await this.auth.resendVerification(); this.startCooldown(); } catch {}
    this.resending.set(false);
  }
  private startCooldown(): void {
    this.cooldown.set(60);
    this.interval = setInterval(() => { this.cooldown.update((c) => { if (c <= 1) { clearInterval(this.interval); return 0; } return c - 1; }); }, 1000);
  }
}
