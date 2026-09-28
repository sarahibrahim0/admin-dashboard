import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/stores/auth.store';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';
import { FormFieldComponent } from '../../../shared/forms/form-field.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, FormFieldComponent],
  styles: `
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    .login-card { animation: fadeInUp 0.5s ease-out; }
  `,
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-almond via-white to-almond px-4">
      <div class="login-card w-full max-w-md rounded-xl bg-white px-8 py-8 shadow-lg">
        <h2 class="text-center text-xl font-semibold uppercase tracking-wider text-blue-black">{{ 'Forgot Password?' | translate }}</h2>
        <p class="mt-1 text-center text-sm text-[#797979]">{{ 'Enter your email to receive a reset link' | translate }}</p>
        @if (auth.error(); as err) {
          <div class="mt-5 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-[#ff4545]">{{ err }}</div>
        }
        @if (success(); as msg) {
          <div class="mt-5 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{{ msg }}</div>
        }
        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 space-y-5">
          <app-form-field
            [control]="form.controls.email"
            [label]="'Email Address' | translate"
            [type]="'email'"
            [placeholder]="'admin@example.com'"
            [required]="true"
            [id]="'email'">
          </app-form-field>
          <button type="submit" [disabled]="auth.loading() || success() || form.invalid"
            class="w-full rounded-md bg-salmon py-3 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-primary-hover disabled:opacity-50">
            {{ auth.loading() ? ('Sending...' | translate) : ('Send Reset Link' | translate) }}
          </button>
        </form>
        <div class="mt-4 text-center">
          <a routerLink="/login" class="text-sm text-[#797979] hover:text-blue-black transition-colors">{{ 'Back to Login' | translate }}</a>
        </div>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  protected readonly auth = inject(AuthStore);
  private router = inject(Router);
  private language = inject(LanguageService);
  private fb = inject(FormBuilder);
  success = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    try { await this.auth.forgotPassword(this.form.controls.email.value?.trim() ?? ''); this.success.set(this.language.translate('Check your email for the reset link.')); } catch {}
  }
}