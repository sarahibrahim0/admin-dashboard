import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TwoFactorService } from '../../../core/services/two-factor.service';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { DetailHeaderComponent } from '../../../shared/ui/detail-header.component';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-two-factor',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, DetailHeaderComponent],
  template: `
    <div class="space-y-6">
      <app-detail-header title="{{ 'Two-Factor Authentication' | translate }}" eyebrow="Settings" />

      <div class="card">
        @if (enabled()) {
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <span class="h-3 w-3 rounded-full bg-emerald-500"></span>
              <span class="font-medium text-emerald-700">{{ '2FA is enabled' | translate }}</span>
            </div>
            <p class="text-sm text-[#646D77]">{{ 'Enter the 6-digit code from your authenticator app to disable 2FA.' | translate }}</p>
            <input type="text" [(ngModel)]="token" [placeholder]="'Enter 6-digit code' | translate"
              class="w-48 rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
            <button (click)="disable2FA()" [disabled]="!token"
              class="btn btn-danger">
              {{ 'Disable 2FA' | translate }}
            </button>
          </div>
        } @else {
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <span class="h-3 w-3 rounded-full bg-[#c9c9c9]"></span>
              <span class="font-medium text-[#646D77]">{{ '2FA is not enabled' | translate }}</span>
            </div>
            @if (qrCode()) {
              <div class="space-y-4">
                <p class="text-sm text-[#646D77]">{{ 'Scan this QR code with your authenticator app:' | translate }}</p>
                <img [src]="qrCode()" [alt]="'QR Code' | translate" class="h-48 w-48" />
                <p class="text-sm text-[#797979]">{{ 'Or enter this secret manually:' | translate }} <code class="rounded bg-[#ecd7cd] px-2 py-1">{{ secret() }}</code></p>
                <input type="text" [(ngModel)]="token" [placeholder]="'Enter 6-digit code to verify' | translate"
                  class="w-64 rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
                <button (click)="verifyAndEnable()" [disabled]="!token"
                  class="btn btn-primary">
                  {{ 'Verify & Enable' | translate }}
                </button>
              </div>
            } @else {
              <button (click)="setup2FA()"
                class="btn btn-primary">
                {{ 'Setup 2FA' | translate }}
              </button>
            }
          </div>
        }

        @if (message()) {
          <div class="mt-4 rounded-md p-3 text-sm"
               [class]="messageType() === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-[#fff5f5] text-[#ff4545]'">
            {{ message() | translate }}
          </div>
        }
      </div>
    </div>
  `,
})
export class TwoFactorComponent implements OnInit {
  private twoFactorService = inject(TwoFactorService);
  private language = inject(LanguageService);

  enabled = signal(false);
  qrCode = signal('');
  secret = signal('');
  token = '';
  message = signal('');
  messageType = signal<'success' | 'error'>('success');

  ngOnInit(): void {
    this.twoFactorService.getStatus().subscribe((res) => this.enabled.set(res.enabled));
  }

  setup2FA(): void {
    this.twoFactorService.setup().subscribe((res) => {
      this.qrCode.set(res.qrCode);
      this.secret.set(res.secret);
    });
  }

  verifyAndEnable(): void {
    this.twoFactorService.verify(this.token).subscribe({
      next: () => {
        this.enabled.set(true);
        this.message.set(this.language.translate('2FA enabled successfully'));
        this.messageType.set('success');
        this.token = '';
      },
      error: (err) => {
        this.message.set(err.error?.message || this.language.translate('Invalid token'));
        this.messageType.set('error');
      },
    });
  }

  disable2FA(): void {
    this.twoFactorService.disable(this.token).subscribe({
      next: () => {
        this.enabled.set(false);
        this.qrCode.set('');
        this.secret.set('');
        this.message.set(this.language.translate('2FA disabled successfully'));
        this.messageType.set('success');
        this.token = '';
      },
      error: (err) => {
        this.message.set(err.error?.message || this.language.translate('Invalid token'));
        this.messageType.set('error');
      },
    });
  }
}
