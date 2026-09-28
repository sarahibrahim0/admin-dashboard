import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/stores/auth.store';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { FormFieldComponent } from '../../../shared/forms/form-field.component';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, FormFieldComponent],
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
        <!-- Card body -->
        <div class="rounded-xl bg-white px-8 py-8 shadow-lg">
          @if (auth.error()) {
            <div class="mt-5 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-[#ff4545]">
              {{ auth.error() | translate }}
            </div>
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
            <div>
              <label for="password" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#797979]">{{ 'Password' | translate }}</label>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  [formControl]="form.controls.password"
                  [placeholder]="'Enter your password' | translate"
                  class="w-full rounded-md border border-[#c9c9c9] px-4 py-3 pr-10 text-sm text-blue-black outline-none transition-colors placeholder:text-[#c9c9c9] focus:border-salmon focus:ring-2 focus:ring-salmon/20" />
                <button type="button" (click)="showPassword.set(!showPassword())" class="absolute right-3 top-1/2 -translate-y-1/2 text-[#797979] hover:text-blue-black transition-colors">
                  @if (showPassword()) {
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                  }
                </button>
              </div>
              @if (form.controls.password.touched && form.controls.password.errors?.['required']) {
                <p class="mt-1 text-xs text-salmon">{{ 'This field is required' | translate }}</p>
              }
            </div>

            <div class="flex items-center justify-between">
              <app-form-field
                [control]="form.controls.keepLoggedIn"
                [type]="'checkbox'"
                [checkboxLabel]="'Keep me logged in' | translate"
                [id]="'keepLoggedIn'">
              </app-form-field>
              <a routerLink="/forgot-password" class="text-sm font-medium text-salmon hover:text-primary-hover transition-colors">{{ 'Forgot password?' | translate }}</a>
            </div>

            <button
              type="submit"
              [disabled]="auth.loading() || form.invalid"
              class="w-full rounded-md bg-salmon py-3 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-primary-hover disabled:opacity-50">
              {{ auth.loading() ? ('Signing in...' | translate) : ('Sign In' | translate) }}
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
  private fb = inject(FormBuilder);
  showPassword = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    keepLoggedIn: [false],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { email, password, keepLoggedIn } = this.form.getRawValue();
    try {
      await this.auth.login(email ?? '', password ?? '', keepLoggedIn ?? false);
      this.router.navigate(['/admin/dashboard']);
    } catch (err: any) {
      if (err?.status === 403) {
        this.router.navigate(['/verify-email']);
      }
    }
  }
}