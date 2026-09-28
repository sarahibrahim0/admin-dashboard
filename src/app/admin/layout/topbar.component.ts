import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';
import { LanguageService } from '../../core/services/language.service';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white px-4 shadow-sm sm:px-6">
      <div class="flex items-center gap-4">
        <button
          type="button"
          [attr.aria-label]="'Open navigation menu' | translate"
          (click)="menuToggle.emit()"
          class="flex h-10 w-10 items-center justify-center rounded-md text-blue-black hover:bg-surface lg:hidden">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <p class="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-faint sm:block">{{ 'Admin workspace' | translate }}</p>
          <h1 class="text-lg font-bold text-blue-black uppercase tracking-wider">{{ 'Dashboard' | translate }}</h1>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          type="button"
          (click)="language.toggle()"
          [attr.aria-label]="(language.isArabic() ? 'Switch to English' : 'Switch to Arabic') | translate"
          [attr.title]="(language.isArabic() ? 'Switch to English' : 'Switch to Arabic') | translate"
          class="rounded-md px-2 py-1 text-xs font-bold text-muted hover:bg-surface hover:text-primary">
          {{ language.isArabic() ? 'EN' : 'ع' }}
        </button>
        <button
          type="button"
          (click)="darkModeChange.emit()"
          [attr.aria-label]="darkMode ? ('Switch to light mode' | translate) : ('Switch to dark mode' | translate)"
          [attr.title]="darkMode ? ('Switch to light mode' | translate) : ('Switch to dark mode' | translate)"
          class="flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-primary">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            @if (darkMode) {
              <path d="M12 3v1M12 20v1M4.22 4.22l.7.7M19.08 19.08l.7.7M3 12h1M20 12h1M4.22 19.78l.7-.7M19.08 4.92l.7-.7M12 16a4 4 0 100-8 4 4 0 000 8z" />
            } @else {
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            }
          </svg>
        </button>
        <div class="hidden text-end sm:block">
          <p class="text-xs font-semibold text-blue-black">{{ language.localizedValue(auth.user()?.name) || 'Admin' }}</p>
          <p class="text-[10px] uppercase tracking-wider text-faint">{{ 'Administrator' | translate }}</p>
        </div>
        <button (click)="router.navigate(['/admin/settings/profile'])" [attr.aria-label]="'Open profile' | translate" class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blue-black text-sm font-bold text-white hover:bg-primary">
          @if (auth.user()?.image?.url) {
            <img [src]="auth.user()?.image?.url" alt="Admin profile" class="h-full w-full object-cover" />
          } @else {
            {{ (language.localizedValue(auth.user()?.name) || 'A').charAt(0).toUpperCase() }}
          }
        </button>
        <button
          (click)="logout()"
          [attr.aria-label]="'Log out' | translate"
          [attr.title]="'Log out' | translate"
          class="flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-primary">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 00-2-2h-5" />
          </svg>
        </button>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  @Output() menuToggle = new EventEmitter<void>();
  @Output() darkModeChange = new EventEmitter<void>();
  @Input() darkMode = false;
  protected readonly auth = inject(AuthStore);
  protected router = inject(Router);
  protected readonly language = inject(LanguageService);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
