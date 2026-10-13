import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { EntityService } from '../../../core/services/entity.service';
import { LanguageService } from '../../../core/services/language.service';
import { ToastService } from '../../../shared/ui/toast.service';
import { formatDateTime } from '../../../shared/utils/datetime';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { DetailHeaderComponent } from '../../../shared/ui/detail-header.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [FormsModule, TranslatePipe, DetailHeaderComponent, RouterLink],
  template: `
    <div class="w-full space-y-6 px-4 py-6">
      @if (tx()) {
        @let t = tx()!;
        <app-detail-header [title]="referenceLabel(t)" eyebrow="Transaction details" [subtitle]="formatDate(t.createdAt)"
          backLabel="Back to transactions" backTo="/admin/payments">
          <span badge [class]="statusBadgeClass(t.status)">{{ statusLabel(t.status) }}</span>
          @if (t.status === 'paid') {
            <button actions type="button" class="btn btn-primary" (click)="scrollToRefund()"><i class="bi bi-arrow-counterclockwise me-1"></i>{{ 'Issue refund' | translate }}</button>
          }
        </app-detail-header>

        @if (error()) {
          <div class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#ff4545]">{{ error() }}</div>
        }

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div class="rounded-lg border border-[#F6F8FE] bg-white shadow-sm overflow-hidden">
              <div class="px-6 py-4 border-b border-[#F6F8FE] bg-[#FAFBFF]">
                <h2 class="section-title">{{ 'Transaction details' | translate }}</h2>
              </div>
              <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 text-sm">
                <div>
                  <p class="text-xs uppercase tracking-wide text-[#797979] mb-1">{{ 'Reference' | translate }}</p>
                  <p class="font-medium text-blue-black">{{ t.reference || shortId(t.id || t._id) }}</p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-wide text-[#797979] mb-1">{{ 'Order' | translate }}</p>
                  <a class="font-medium text-[#1e6bb8] hover:underline" [routerLink]="['/admin/orders', t.orderId]">#{{ shortOrder(t.orderId) }}</a>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-wide text-[#797979] mb-1">{{ 'Amount' | translate }}</p>
                  <p class="text-lg font-bold text-blue-black">{{ money(t.amount, t.currency) }}</p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-wide text-[#797979] mb-1">{{ 'Status' | translate }}</p>
                  <p class="font-medium text-blue-black capitalize">{{ t.status }}</p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-wide text-[#797979] mb-1">{{ 'Payment method' | translate }}</p>
                  <p class="font-medium text-blue-black">{{ localized(t.method?.name) || t.method?.code || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-wide text-[#797979] mb-1">{{ 'Gateway reference' | translate }}</p>
                  <p class="font-medium text-blue-black break-all">{{ t.paymentId || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-wide text-[#797979] mb-1">{{ 'Customer' | translate }}</p>
                  <p class="font-medium text-blue-black">{{ localized(t.user?.name) || localized(t.customer?.name) || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-wide text-[#797979] mb-1">{{ 'Email' | translate }}</p>
                  <p class="font-medium text-blue-black break-all">{{ t.user?.email || t.customer?.email || '-' }}</p>
                </div>
              </div>
            </div>

            @if (metaEntries().length) {
              <div class="rounded-lg border border-[#F6F8FE] bg-white shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-[#F6F8FE] bg-[#FAFBFF]">
                  <h2 class="section-title">{{ 'Metadata' | translate }}</h2>
                </div>
                <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  @for (m of metaEntries(); track m.key) {
                    <div>
                      <p class="text-xs uppercase tracking-wide text-[#797979] mb-1">{{ m.key }}</p>
                      <p class="font-medium text-blue-black break-all">{{ m.value }}</p>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <div id="refund-panel" class="space-y-6">
            @if (t.status === 'paid') {
              <div class="rounded-lg border border-[#F6F8FE] bg-white shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-[#F6F8FE] bg-[#FAFBFF]">
                  <h2 class="section-title">{{ 'Issue refund' | translate }}</h2>
                </div>
                <div class="p-6 space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-blue-black mb-1.5">{{ 'Refund amount' | translate }}</label>
                    <input type="number" [(ngModel)]="refundAmount" min="0" step="0.01"
                      [placeholder]="money(t.amount, t.currency)" [max]="t.amount"
                      class="w-full rounded-lg border border-[#E0E0E0] bg-white px-3 py-2 text-sm text-blue-black focus:border-salmon focus:ring-2 focus:ring-salmon/20 focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-blue-black mb-1.5">{{ 'Refund reason' | translate }}</label>
                    <textarea [(ngModel)]="refundReason" rows="3" [placeholder]="'Refund requested' | translate"
                      class="w-full rounded-lg border border-[#E0E0E0] bg-white px-3 py-2 text-sm text-blue-black focus:border-salmon focus:ring-2 focus:ring-salmon/20 focus:outline-none transition-all"></textarea>
                  </div>
                  <button type="button" (click)="applyRefund()" [disabled]="refundSaving"
                    class="btn btn-primary w-full">
                    @if (refundSaving) {
                      <svg class="animate-spin h-4 w-4 me-2 inline" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                    }
                    {{ refundSaving ? ('Saving...' | translate) : ('Issue refund' | translate) }}
                  </button>
                  <p class="text-xs text-[#797979]">{{ 'Refunds go through the gateway and move this transaction and its order to Refunded.' | translate }}</p>
                </div>
              </div>
            } @else {
              <div class="rounded-lg border border-[#F6F8FE] bg-white shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-[#F6F8FE] bg-[#FAFBFF]">
                  <h2 class="section-title">{{ 'Refund' | translate }}</h2>
                </div>
                <div class="p-6">
                  <p class="text-sm text-[#797979]">{{ 'Only paid transactions can be refunded.' | translate }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      } @else if (loading()) {
        <div class="flex flex-col items-center justify-center py-20">
          <svg class="animate-spin h-10 w-10 text-salmon" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
          <p class="mt-4 text-[#797979]">{{ 'Loading...' | translate }}</p>
        </div>
      }
    </div>
  `,
})
export class TransactionDetailComponent implements OnInit {
  private entityService = inject(EntityService);
  private route = inject(ActivatedRoute);
  private language = inject(LanguageService);
  private toast = inject(ToastService);
  private http = inject(HttpClient);
  protected router = inject(Router);

  transactionId = '';
  tx = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  refundAmount: number | null = null;
  refundReason = '';
  refundSaving = false;

  ngOnInit(): void {
    this.transactionId = this.route.snapshot.paramMap.get('id') || '';
    this.entityService.get<any>('transactions', this.transactionId).subscribe({
      next: (t) => {
        this.tx.set(t);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Could not load transaction');
      },
    });
  }

  metaEntries(): { key: string; value: string }[] {
    const m = this.tx()?.metadata;
    if (!m || typeof m !== 'object') return [];
    return Object.entries(m)
      .filter(([, v]) => v !== '' && v !== null && v !== undefined)
      .map(([key, value]) => ({ key, value: String(value) }));
  }

  referenceLabel(t: any): string {
    return t.reference || 'Transaction #' + shortId(t.id || t._id);
  }

  shortId(v: any): string {
    return shortId(v);
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = { paid: 'Paid', completed: 'Paid', succeeded: 'Paid', pending: 'Pending', waiting: 'Pending', failed: 'Failed', rejected: 'Failed', refunded: 'Refunded' };
    return map[String(status || '').toLowerCase()] || status;
  }

  statusBadgeClass(status: string): string {
    const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium';
    const map: Record<string, string> = {
      paid: 'bg-green-100 text-green-700',
      completed: 'bg-green-100 text-green-700',
      succeeded: 'bg-green-100 text-green-700',
      pending: 'bg-amber-100 text-amber-700',
      waiting: 'bg-amber-100 text-amber-700',
      failed: 'bg-red-100 text-red-700',
      rejected: 'bg-red-100 text-red-700',
      refunded: 'bg-blue-100 text-blue-700',
    };
    return `${base} ${map[String(status || '').toLowerCase()] || 'bg-gray-100 text-gray-700'}`;
  }

  localized(v: any): string {
    return this.language.localizedValue(v);
  }

  formatDate(value: unknown): string {
    return formatDateTime(value, this.language.language());
  }

  money(v: any, currency?: string): string {
    const n = Number(v || 0).toFixed(2);
    const cur = String(currency || '').trim();
    return cur ? `${cur} ${n}` : `$${n}`;
  }

  shortOrder(v: any): string {
    const s = String(v || '');
    return s ? s.slice(-8).toUpperCase() : '-';
  }

  scrollToRefund(): void {
    document.getElementById('refund-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  applyRefund(): void {
    const t = this.tx();
    if (!t || t.status !== 'paid' || this.refundSaving) return;
    const amount = this.refundAmount === null || this.refundAmount === undefined || this.refundAmount === 0
      ? t.amount
      : Number(this.refundAmount);
    if (!amount || amount <= 0) { this.toast.info('Enter a valid refund amount'); return; }
    if (amount > Number(t.amount)) { this.toast.error('Refund exceeds the transaction amount'); return; }
    this.refundSaving = true;
    this.error.set(null);
    this.http.post<any>(`${environment.apiUrl}transactions/${this.transactionId}/refund`, {
      amount,
      reason: this.refundReason.trim() || undefined,
    }).subscribe({
      next: (res) => {
        this.refundSaving = false;
        if (res?.transaction) {
          this.tx.set(res.transaction);
          this.refundAmount = null;
          this.refundReason = '';
        }
        this.toast.success(res?.message || 'Refund completed');
      },
      error: (err) => {
        this.refundSaving = false;
        this.toast.error(err?.error?.message || 'Could not apply refund');
      },
    });
  }
}

function shortId(v: any): string {
  const s = String(v || '');
  return s ? '…' + s.slice(-8).toUpperCase() : '-';
}