import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TwoFactorService } from '../../../core/services/two-factor.service';

@Component({
  selector: 'app-two-factor',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-slate-900">Two-Factor Authentication</h1>

      <div class="rounded-lg border border-slate-200 bg-white p-6">
        @if (enabled()) {
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <span class="h-3 w-3 rounded-full bg-green-500"></span>
              <span class="font-medium text-green-700">2FA is enabled</span>
            </div>
            <p class="text-sm text-slate-600">Enter the 6-digit code from your authenticator app to disable 2FA.</p>
            <input pInputText [(ngModel)]="token" placeholder="Enter 6-digit code" class="w-48" />
            <p-button label="Disable 2FA" severity="danger" (onClick)="disable2FA()" [disabled]="!token" />
          </div>
        } @else {
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <span class="h-3 w-3 rounded-full bg-slate-400"></span>
              <span class="font-medium text-slate-700">2FA is not enabled</span>
            </div>
            @if (qrCode()) {
              <div class="space-y-4">
                <p class="text-sm text-slate-600">Scan this QR code with your authenticator app:</p>
                <img [src]="qrCode()" alt="QR Code" class="h-48 w-48" />
                <p class="text-sm text-slate-500">Or enter this secret manually: <code class="bg-slate-100 px-2 py-1 rounded">{{ secret() }}</code></p>
                <input pInputText [(ngModel)]="token" placeholder="Enter 6-digit code to verify" class="w-64" />
                <p-button label="Verify & Enable" (onClick)="verifyAndEnable()" [disabled]="!token" />
              </div>
            } @else {
              <p-button label="Setup 2FA" (onClick)="setup2FA()" />
            }
          </div>
        }

        @if (message()) {
          <div class="mt-4 rounded-lg p-3 text-sm"
               [class]="messageType() === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
            {{ message() }}
          </div>
        }
      </div>
    </div>
  `,
})
export class TwoFactorComponent implements OnInit {
  private twoFactorService = inject(TwoFactorService);

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
        this.message.set('2FA enabled successfully');
        this.messageType.set('success');
        this.token = '';
      },
      error: (err) => {
        this.message.set(err.error?.message || 'Invalid token');
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
        this.message.set('2FA disabled successfully');
        this.messageType.set('success');
        this.token = '';
      },
      error: (err) => {
        this.message.set(err.error?.message || 'Invalid token');
        this.messageType.set('error');
      },
    });
  }
}
