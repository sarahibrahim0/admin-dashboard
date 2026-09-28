import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/stores/auth.store';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';
import { FormFieldComponent } from '../../../shared/forms/form-field.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, FormFieldComponent],
  styles: `
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    .login-card { animation: fadeInUp 0.5s ease-out; }
  `,
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-almond via-white to-almond px-4">
      <div class="login-card w-full max-w-md rounded-xl bg-white px-8 py-8 shadow-lg">
        <h2 class="text-center text-xl font-semibold uppercase tracking-wider text-blue-black">{{ 'Reset Password' | translate }}</h2>
        <p class="mt-1 text-center text-sm text-[#797979]">{{ 'Enter your new password' | translate }}</p>
        @if (auth.error(); as err) {
          <div class="mt-5 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-[#ff4545]">{{ err }}</div>
        }
        @if (success(); as msg) {
          <div class="mt-5 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{{ msg }}</div>
        }
        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 space-y-5">
          <app-form-field
            [control]="form.controls.password"
            [label]="'New Password' | translate"
            [type]="'password'"
            [placeholder]="'Enter new password' | translate"
            [required]="true"
            [id]="'password'">
          </app-form-field>
          <app-form-field
            [control]="form.controls.confirmPassword"
            [label]="'Confirm Password' | translate"
            [type]="'password'"
            [placeholder]="'Confirm new password' | translate"
            [required]="true"
            [id]="'confirmPassword'">
          </app-form-field>
          <button type="submit" [disabled]="auth.loading() || success() || form.invalid"
            class="w-full rounded-md bg-salmon py-3 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-primary-hover disabled:opacity-50">
            {{ auth.loading() ? ('Resetting...' | translate) : ('Reset Password' | translate) }}
          </button>
        </form>
        <div class="mt-4 text-center">
          <a routerLink="/login" class="text-sm text-[#797979] hover:text-blue-black transition-colors">{{ 'Back to Login' | translate }}</a>
        </div>
      </div>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  protected readonly auth = inject(AuthStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private language = inject(LanguageService);
  private fb = inject(FormBuilder);
  success = signal('');
  private token = '';

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  ngOnInit(): void { this.token = this.route.snapshot.queryParamMap.get('token') || ''; }

  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { password, confirmPassword } = this.form.getRawValue();
    if (!password || password !== confirmPassword) { this.auth.error.set(this.language.translate('Passwords do not match')); return; }
    try { await this.auth.resetPassword(this.token, password); this.success.set(this.language.translate('Password updated successfully! Redirecting to login...')); setTimeout(() => this.router.navigate(['/login']), 2000); } catch {}
  }
}