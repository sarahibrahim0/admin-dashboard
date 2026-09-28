import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EntityService } from '../../../core/services/entity.service';
import { LanguageService } from '../../../core/services/language.service';
import { ToastService } from '../../../shared/ui/toast.service';
import { formatDateTime } from '../../../shared/utils/datetime';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';

import { DetailHeaderComponent } from '../../../shared/ui/detail-header.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [FormsModule, TranslatePipe, DetailHeaderComponent],
  template: `
    <div class="w-full space-y-6 px-4 py-6">
      <!-- Header -->
      @if (order()) {
        <app-detail-header [title]="('Order' | translate) + ' #' + order()!.id?.slice(-8).toUpperCase()"
          eyebrow="Order details" [subtitle]="formatDate(order()!.dateOrdered)"
          backLabel="Back to orders" backTo="/admin/orders">
          <span badge [class]="statusBadgeClass()">{{ order()!.status | translate }}</span>
          <button actions type="button" (click)="printInvoice()" class="btn btn-secondary"><i class="bi bi-printer me-1"></i>{{ 'Invoice / PDF' | translate }}</button>
        </app-detail-header>

        <!-- Main Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column: Order Summary + Items -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Order Summary Card -->
            <div class="rounded-lg border border-[#F6F8FE] bg-white shadow-sm overflow-hidden">
              <div class="px-6 py-4 border-b border-[#F6F8FE] bg-[#FAFBFF]">
                <h2 class="section-title">{{ 'Order Summary' | translate }}</h2>
              </div>
              <div class="p-6 space-y-4">
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-[#797979] text-xs uppercase tracking-wide mb-1">{{ 'Payment Status' | translate }}</p>
                    <p class="font-medium text-blue-black capitalize">{{ order()!.paymentStatus | translate }}</p>
                  </div>
                  <div class="text-end">
                    <p class="text-[#797979] text-xs uppercase tracking-wide mb-1">{{ 'Total' | translate }}</p>
                    <p class="text-2xl font-bold text-blue-black">\${{ order()!.totalPrice?.toFixed(2) }}</p>
                  </div>
                  <div>
                    <p class="text-[#797979] text-xs uppercase tracking-wide mb-1">{{ 'Items Count' | translate }}</p>
                    <p class="font-medium text-blue-black">{{ (order()!.orderItems || []).length }}</p>
                  </div>
                  <div class="text-end">
                    <p class="text-[#797979] text-xs uppercase tracking-wide mb-1">{{ 'Order Date' | translate }}</p>
                    <p class="font-medium text-blue-black">{{ formatDate(order()!.dateOrdered) }}</p>
                  </div>
                </div>

                <!-- Status Update -->
                <div class="pt-4 border-t border-[#F6F8FE]">
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <label class="text-sm font-medium text-blue-black whitespace-nowrap">{{ 'Update Status' | translate }}</label>
                      @if (isTerminalOrder()) {
                        <p class="text-sm text-[#797979]">{{ 'This order is in a final state and cannot be changed.' | translate }}</p>
                      } @else {
                        <select [(ngModel)]="newStatus" (ngModelChange)="updateStatus()" class="w-full sm:w-48 rounded-lg border border-[#E0E0E0] bg-white px-3 py-2 text-sm text-blue-black focus:border-salmon focus:ring-2 focus:ring-salmon/20 focus:outline-none transition-all">
                          @for (status of statuses(); track status) {
                            <option [value]="status" [disabled]="status !== order()?.status && !isTransitionAllowed(status)">{{ status | translate }}</option>
                          }
                        </select>
                      }
                    </div>
                    <button
                      type="button"
                      (click)="saveOrder()"
                      [disabled]="saving || newStatus === order()?.status"
                      class="btn btn-primary w-full sm:w-auto"
                    >
                      @if (saving) {
                        <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                        {{ 'Saving...' | translate }}
                      } @else {
                        {{ 'Save Status' | translate }}
                      }
                    </button>
                  </div>
                </div>

                <!-- Refunds -->
                <div class="pt-4 border-t border-[#F6F8FE]">
                  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p class="text-sm font-medium text-blue-black">{{ 'Refunds' | translate }}</p>
                      <p class="text-xs text-[#797979] mt-0.5">
                        {{ 'Refunded' | translate }}: \${{ refunded().toFixed(2) }} · {{ 'Remaining' | translate }}: \${{ remaining().toFixed(2) }}
                      </p>
                    </div>
                    <div class="flex w-full sm:w-auto items-center gap-2">
                      <input
                        type="number"
                        [ngModel]="refundAmount"
                        (ngModelChange)="refundAmount = $event"
                        [placeholder]="'Refund amount' | translate"
                        min="0"
                        class="w-full sm:w-36 rounded-lg border border-[#E0E0E0] bg-white px-3 py-2 text-sm text-blue-black focus:border-salmon focus:ring-2 focus:ring-salmon/20 focus:outline-none transition-all" />
                      <button
                        type="button"
                        (click)="applyRefund()"
                        [disabled]="refundSaving || refunded() >= (order()?.totalPrice ?? 0)"
                        class="btn btn-secondary w-full sm:w-auto"
                      >{{ refundSaving ? ('Saving...' | translate) : ('Refund' | translate) }}</button>
                    </div>
                  </div>
                  @if ((order()!.refunds || []).length) {
                    <ul class="mt-3 ps-4 space-y-1.5 border-s border-[#F6F8FE]">
                      @for (r of order()!.refunds; track r.createdAt) {
                        <li class="text-xs text-[#797979]">\${{ fmtAmount(r.amount) }} · {{ formatDate(r.createdAt) }}</li>
                      }
                    </ul>
                  }
                </div>
              </div>
            </div>

            <!-- Items Card -->
            <div class="rounded-lg border border-[#F6F8FE] bg-white shadow-sm overflow-hidden">
              <div class="px-6 py-4 border-b border-[#F6F8FE] bg-[#FAFBFF]">
                <h2 class="section-title">{{ 'Order Items' | translate }} ({{ (order()!.orderItems || []).length }})</h2>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-[#F6F8FE] text-start text-xs uppercase text-[#797979] bg-[#FAFBFF]">
                      <th class="p-4">{{ 'Product' | translate }}</th>
                      <th class="w-20 p-4 text-center">{{ 'Qty' | translate }}</th>
                      <th class="w-28 p-4 text-end">{{ 'Price' | translate }}</th>
                      <th class="w-32 p-4 text-end">{{ 'Subtotal' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of order()!.orderItems || []; track item.id) {
                      <tr class="border-b border-[#F6F8FE] hover:bg-[#FAFBFF] transition-colors">
                        <td class="p-4">
                          <div class="flex items-center gap-3">
                            @if (item.product?.image?.url) {
                              <img [src]="item.product.image.url" [alt]="localized(item.product.name)" class="w-14 h-14 rounded-lg object-cover border border-[#F6F8FE]" loading="lazy" />
                            } @else {
                              <div class="w-14 h-14 rounded-lg bg-[#F6F8FE] flex items-center justify-center">
                                <svg class="w-6 h-6 text-[#C0C0C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                              </div>
                            }
                            <div class="min-w-0">
                              <p class="font-medium text-blue-black truncate">{{ localized(item.product?.name) }}</p>
                              @if (item.product?.sku) {
                                <p class="text-xs text-[#797979]">SKU: {{ item.product.sku }}</p>
                              }
                            </div>
                          </div>
                        </td>
                        <td class="p-4 text-center whitespace-nowrap">
                          <span class="inline-flex items-center justify-center w-16 h-8 rounded-lg bg-[#F6F8FE] text-sm font-medium text-blue-black">{{ item.quantity }}</span>
                        </td>
                        <td class="p-4 text-end whitespace-nowrap text-blue-black font-medium">\${{ item.product?.price?.toFixed(2) }}</td>
                        <td class="p-4 text-end whitespace-nowrap text-blue-black font-semibold">\${{ (item.product?.price * item.quantity)?.toFixed(2) }}</td>
                      </tr>
                    }
                  </tbody>
                  <tfoot class="bg-[#FAFBFF]">
                    <tr class="border-t border-[#F6F8FE]">
                      <td class="p-4 text-start font-medium text-blue-black">{{ 'Total' | translate }}</td>
                      <td class="p-4 text-center"></td>
                      <td class="p-4 text-end"></td>
                      <td class="p-4 text-end text-lg font-bold text-blue-black">\${{ order()!.totalPrice?.toFixed(2) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              @if (!(order()!.orderItems?.length)) {
                <div class="p-12 text-center">
                  <svg class="mx-auto h-12 w-12 text-[#C0C0C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                  <p class="mt-3 text-[#797979]">{{ 'No items in this order' | translate }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Right Column: Shipping & Customer -->
          <div class="space-y-6">
            <!-- Shipping Address Card -->
            <div class="rounded-lg border border-[#F6F8FE] bg-white shadow-sm overflow-hidden">
              <div class="px-6 py-4 border-b border-[#F6F8FE] bg-[#FAFBFF]">
                <h2 class="section-title">{{ 'Shipping Address' | translate }}</h2>
              </div>
              <div class="p-6 space-y-4">
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-salmon/10 flex items-center justify-center">
                    <svg class="w-5 h-5 text-salmon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-blue-black">{{ shipping().name || '-' }}</p>
                    @if (shipping().phone) {
                      <p class="text-sm text-[#797979]">{{ shipping().phone }}</p>
                    }
                  </div>
                </div>
                <div class="ps-10 border-s border-[#F6F8FE] space-y-2">
                  @if (shipping().line1) {
                    <p class="text-sm text-blue-black">{{ shipping().line1 }}</p>
                  }
                  @if (shipping().line2) {
                    <p class="text-sm text-[#797979]">{{ shipping().line2 }}</p>
                  }
                  <p class="text-sm text-blue-black">{{ shipping().cityLine || '-' }}</p>
                  @if (shipping().zip) {
                    <p class="text-sm text-[#797979">{{ shipping().zip }}</p>
                  }
                </div>
              </div>
            </div>

            <!-- Tracking Card (when Shipped or setting to Shipped) -->
            @if (newStatus === 'Shipped' || order()?.status === 'Shipped') {
              <div class="rounded-lg border border-[#F6F8FE] bg-white shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-[#F6F8FE] bg-[#FAFBFF]">
                  <h2 class="section-title flex items-center gap-2">
                    <svg class="w-5 h-5 text-salmon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    {{ 'Shipment Tracking' | translate }}
                  </h2>
                </div>
                <div class="p-6 space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-blue-black mb-1.5">{{ 'Carrier' | translate }}</label>
                    <input [(ngModel)]="tracking.carrier" type="text" [placeholder]="'e.g. DHL, FedEx, Aramex' | translate" class="w-full rounded-lg border border-[#E0E0E0] bg-white px-3 py-2 text-sm text-blue-black focus:border-salmon focus:ring-2 focus:ring-salmon/20 focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-blue-black mb-1.5">{{ 'Tracking Number' | translate }}</label>
                    <input [(ngModel)]="tracking.trackingNumber" type="text" [placeholder]="'Enter tracking number' | translate" class="w-full rounded-lg border border-[#E0E0E0] bg-white px-3 py-2 text-sm text-blue-black focus:border-salmon focus:ring-2 focus:ring-salmon/20 focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-blue-black mb-1.5">{{ 'Tracking URL' | translate }}</label>
                    <input [(ngModel)]="tracking.trackingUrl" type="url" [placeholder]="'https://tracking.carrier.com/...' | translate" class="w-full rounded-lg border border-[#E0E0E0] bg-white px-3 py-2 text-sm text-blue-black focus:border-salmon focus:ring-2 focus:ring-salmon/20 focus:outline-none transition-all" />
                  </div>
                  <button
                    type="button"
                    (click)="saveOrder()"
                    [disabled]="saving"
                    class="btn btn-primary w-full"
                  >
                    @if (saving) {
                      <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                      {{ 'Saving...' | translate }}
                    } @else {
                      {{ 'Save Shipment' | translate }}
                    }
                  </button>
                </div>
              </div>
            }

            <!-- Order Notes Card -->
            <div class="rounded-lg border border-[#F6F8FE] bg-white shadow-sm overflow-hidden">
              <div class="px-6 py-4 border-b border-[#F6F8FE] bg-[#FAFBFF]">
                <h2 class="section-title">{{ 'Order Notes' | translate }}</h2>
              </div>
              <div class="p-6 space-y-4">
                <div class="flex items-start gap-2">
                  <input
                    [(ngModel)]="noteText"
                    type="text"
                    (keyup.enter)="addNote()"
                    [placeholder]="'Add a note...' | translate"
                    class="flex-1 rounded-lg border border-[#E0E0E0] bg-white px-3 py-2 text-sm text-blue-black focus:border-salmon focus:ring-2 focus:ring-salmon/20 focus:outline-none transition-all" />
                  <button
                    type="button"
                    (click)="addNote()"
                    [disabled]="noteSaving || !noteText.trim()"
                    class="btn btn-secondary"
                  ><i class="bi bi-plus-lg me-1"></i>{{ 'Add' | translate }}</button>
                </div>
                @if (notes().length) {
                  <ul class="space-y-3">
                    @for (n of notes(); track n.createdAt) {
                      <li class="rounded-lg bg-[#FAFBFF] border border-[#F6F8FE] p-3">
                        <p class="text-sm text-blue-black whitespace-pre-wrap">{{ n.text }}</p>
                        <p class="text-xs text-[#797979] mt-1">{{ formatDate(n.createdAt) }}</p>
                      </li>
                    }
                  </ul>
                } @else {
                  <p class="text-sm text-[#797979]">{{ 'No notes yet' | translate }}</p>
                }
              </div>
            </div>

            <!-- Customer Info Card -->
            <div class="rounded-lg border border-[#F6F8FE] bg-white shadow-sm overflow-hidden">
              <div class="px-6 py-4 border-b border-[#F6F8FE] bg-[#FAFBFF]">
                <h2 class="section-title">{{ 'Customer Details' | translate }}</h2>
              </div>
              <div class="p-6 space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-[#797979]">{{ 'Email' | translate }}</span>
                  <span class="font-medium text-blue-black text-end">{{ order()!.user?.email || order()!.email }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-[#797979]">{{ 'Phone' | translate }}</span>
                  <span class="font-medium text-blue-black text-end">{{ order()!.phone }}</span>
                </div>
                @if (order()!.user?._id) {
                  <div class="flex justify-between text-sm">
                    <span class="text-[#797979]">{{ 'Customer Since' | translate }}</span>
                    <span class="font-medium text-blue-black text-end">{{ formatDate(order()!.user!.createdAt) }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      } @else {
        <!-- Loading State -->
        <div class="flex flex-col items-center justify-center py-20">
          <svg class="animate-spin h-10 w-10 text-salmon" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
          <p class="mt-4 text-[#797979]">{{ 'Loading order details...' | translate }}</p>
        </div>
      }
    </div>
  `,
})
export class OrderDetailComponent implements OnInit {
  private entityService = inject(EntityService);
  private route = inject(ActivatedRoute);
  private language = inject(LanguageService);
  private toast = inject(ToastService);
  protected router = inject(Router);

  order = signal<any>(null);
  newStatus = '';
  tracking = { carrier: '', trackingNumber: '', trackingUrl: '' };
  saving = false;
  noteText = '';
  noteSaving = false;
  refundAmount: number | null = null;
  refundSaving = false;

  refunded = computed(() => Number(this.order()?.refunded || 0));
  remaining = computed(() => Math.max(Number(this.order()?.totalPrice || 0) - this.refunded(), 0));
  notes = computed<any[]>(() => this.order()?.orderNotes || this.order()?.notes || []);

  fmtAmount(v: any): string {
    return Number(v || 0).toFixed(2);
  }

  localized(v: any): string {
    return this.language.localizedValue(v);
  }

  /** Shipping address supporting both legacy flat fields and the nested checkout shape. */
  shipping(): { name: string; phone: string; line1: string; line2: string; cityLine: string; zip: string } {
    const o = this.order();
    if (!o) return { name: '', phone: '', line1: '', line2: '', cityLine: '', zip: '' };
    const sa = o.shippingAddress || {};
    const city = o.city || sa.city || '';
    const country = o.country || sa.country || '';
    return {
      name: this.localized(o.user?.name) || o.name || '',
      phone: o.phone || sa.phone || '',
      line1: o.shippingAddress1 || sa.street || '',
      line2: o.shippingAddress2 || sa.apartment || '',
      cityLine: [city, country].filter((x) => !!x).join(', '),
      zip: o.zip || sa.zip || '',
    };
  }

  formatDate(value: unknown): string {
    return formatDateTime(value, this.language.language());
  }

  statusBadgeClass = computed(() => {
    const status = this.order()?.status;
    const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'Pending': return `${base} bg-yellow-100 text-yellow-800`;
      case 'Processed': return `${base} bg-blue-100 text-blue-800`;
      case 'Shipped': return `${base} bg-purple-100 text-purple-800`;
      case 'Delivered': return `${base} bg-green-100 text-green-800`;
      case 'Cancelled': return `${base} bg-red-100 text-red-800`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.entityService.getRoot<any>('orders/statuses').subscribe({
      next: (meta) => {
        if (Array.isArray(meta.statuses) && meta.statuses.length) this.statuses.set(meta.statuses);
        if (meta.transitions && typeof meta.transitions === 'object') this.statusTransitions.set(meta.transitions);
      },
      error: () => undefined,
    });
    this.entityService.get<any>('orders', id).subscribe((o) => {
      this.order.set(o);
      this.newStatus = o.status;
      this.tracking = { carrier: o.carrier || '', trackingNumber: o.trackingNumber || '', trackingUrl: o.trackingUrl || '' };
    });
  }

  /** Full status list + transitions, loaded from the API (hardcoded fallback). */
  statuses = signal<string[]>(['Pending', 'Processed', 'Shipped', 'Delivered', 'Cancelled']);
  statusTransitions = signal<Record<string, string[]>>({
    Pending: ['Processed', 'Cancelled'],
    Processed: ['Shipped', 'Cancelled'],
    Shipped: ['Delivered'],
    Delivered: [],
    Cancelled: [],
  });

  isTransitionAllowed(status: string): boolean {
    if (status === this.order()?.status) return true;
    return (this.statusTransitions()[this.order()?.status || ''] || []).includes(status);
  }

  isTerminalOrder(): boolean {
    return this.order()?.status === 'Delivered' || this.order()?.status === 'Cancelled';
  }

  updateStatus(): void {
    if (this.newStatus === 'Shipped' && this.order()?.status !== 'Shipped') {
      this.tracking = { ...this.tracking };
    }
  }

  saveOrder(): void {
    if (!this.order() || this.saving) return;
    const current = this.order()!;
    const trackingChanged =
      (this.tracking.carrier || '') !== (current.carrier || '') ||
      (this.tracking.trackingNumber || '') !== (current.trackingNumber || '') ||
      (this.tracking.trackingUrl || '') !== (current.trackingUrl || '');
    if (this.newStatus === current.status && !trackingChanged) {
      this.toast.info('No changes to save');
      return;
    }
    this.saving = true;
    const body: any = { status: this.newStatus };
    if (this.tracking.carrier) body.carrier = this.tracking.carrier;
    if (this.tracking.trackingNumber) body.trackingNumber = this.tracking.trackingNumber;
    if (this.tracking.trackingUrl) body.trackingUrl = this.tracking.trackingUrl;
    this.entityService.update<any>('orders', this.order()!.id, body).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.newStatus = updated.status;
        this.saving = false;
        this.toast.success('Order updated');
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err?.error?.message || 'Could not save order');
      },
    });
  }

  addNote(): void {
    const text = this.noteText.trim();
    const o = this.order();
    if (!o || !text || this.noteSaving) return;
    this.noteSaving = true;
    const notes = [...this.notes(), { text, createdAt: new Date().toISOString() }];
    this.entityService.update<any>('orders', o.id, { orderNotes: notes }).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.noteText = '';
        this.noteSaving = false;
        this.toast.success('Note added');
      },
      error: () => {
        this.noteSaving = false;
        this.toast.error('Could not add note');
      },
    });
  }

  applyRefund(): void {
    const o = this.order();
    const amount = Number(this.refundAmount);
    if (!o || !amount || amount <= 0) { this.toast.info('Enter a valid refund amount'); return; }
    if (amount > this.remaining()) { this.toast.error('Refund exceeds the remaining total'); return; }
    this.refundSaving = true;
    const refunds = [...(o.refunds || []), { amount, createdAt: new Date().toISOString() }];
    this.entityService.update<any>('orders', o.id, { refunded: this.refunded() + amount, refunds }).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.refundAmount = null;
        this.refundSaving = false;
        this.toast.success('Refund applied');
      },
      error: () => {
        this.refundSaving = false;
        this.toast.error('Could not apply refund');
      },
    });
  }

  printInvoice(): void {
    const o = this.order();
    if (!o) return;
    const esc = (v: any): string => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const money = (v: any): string => '$' + Number(v || 0).toFixed(2);
    const rows = (o.orderItems || [])
      .map((it: any, i: number) => {
        const price = Number(it.product?.price || 0);
        const qty = Number(it.quantity || 0);
        return `
        <tr${i % 2 ? ' class="alt"' : ''}>
          <td class="col-name">
            <span class="pname">${esc(this.localized(it.product?.name))}</span>
            ${it.size || it.color ? `<span class="variant">${esc([it.color, it.size].filter(Boolean).join(' / '))}</span>` : ''}
          </td>
          <td class="col-num">${qty}</td>
          <td class="col-num">${money(price)}</td>
          <td class="col-num">${money(price * qty)}</td>
        </tr>`;
      })
      .join('');
    const w = window.open('', '_blank', 'width=840,height=900');
    if (!w) return;
    w.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Invoice ${esc(o.id)}</title>
      <style>
        @page { margin: 18mm; }
        * { box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
          color: #1f2937; margin: 0; font-size: 14px; line-height: 1.5;
        }
        .sheet { max-width: 760px; margin: 0 auto; }
        .muted { color: #6b7280; }

        /* Header */
        .invoice-head {
          display: flex; justify-content: space-between; align-items: flex-start;
          border-bottom: 3px solid #111827; padding-bottom: 20px; margin-bottom: 26px;
        }
        .invoice-head .brand { font-size: 24px; font-weight: 800; letter-spacing: .04em; }
        .invoice-head .brand small { display: block; font-size: 12px; font-weight: 500; color: #6b7280; letter-spacing: .14em; }
        .inv-meta { text-align: right; }
        .inv-meta h1 { font-size: 20px; margin: 0 0 6px; letter-spacing: .12em; }

        /* Addresses */
        .parties { display: flex; gap: 48px; flex-wrap: wrap; margin-bottom: 30px; }
        .party { flex: 1; min-width: 220px; }
        .party .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .12em; color: #6b7280; margin-bottom: 6px; }
        .party strong { display: block; font-size: 15px; margin-bottom: 2px; }

        /* Table */
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        thead th {
          text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .1em;
          color: #6b7280; padding: 10px 12px; border-bottom: 2px solid #e5e7eb;
        }
        thead th.num, td.col-num { text-align: right; }
        tbody td { padding: 12px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
        tbody tr.alt td { background: #fafbfc; }
        .col-name { width: 50%; }
        .pname { display: block; font-weight: 600; }
        .variant { display: block; color: #6b7280; font-size: 12px; margin-top: 1px; }

        /* Totals */
        .totals { margin-left: auto; width: 300px; margin-top: 22px; font-size: 13.5px; }
        .totals .row { display: flex; justify-content: space-between; padding: 6px 12px; }
        .totals .row + .row { border-top: 1px solid #f3f4f6; }
        .totals .row.grand {
          font-size: 16px; font-weight: 700; background: #111827; color: #fff;
          border-radius: 6px; margin-top: 8px; padding: 12px;
        }

        /* Footer */
        .foot { margin-top: 38px; padding-top: 14px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af; }
      </style></head><body>
      <div class="sheet">
        <div class="invoice-head">
          <div class="brand">INVOICE<small>E-COMMERCE ORDER</small></div>
          <div class="inv-meta">
            <h1>Invoice</h1>
            <div class="muted">
              <div>Order <b>#${esc(String(o.id).slice(-8).toUpperCase())}</b></div>
              <div>Placed on ${esc(this.formatDate(o.dateOrdered))}</div>
              <div>Status: <b>${esc(o.status)}</b> · ${esc(o.paymentStatus)}</div>
            </div>
          </div>
        </div>

        <div class="parties">
          <div class="party">
            <div class="lbl">Billed to</div>
            <strong>${esc(this.localized(o.user?.name) || o.name || 'Customer')}</strong>
            <div class="muted">${esc(o.email || o.user?.email || '')}<br>${esc(o.phone || '')}</div>
          </div>
          <div class="party">
            <div class="lbl">Ship to</div>
            <strong>${esc(this.shipping().line1)}</strong>
            <div class="muted">${esc(this.shipping().line2 + ' ' + this.shipping().cityLine)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th class="num">Qty</th>
              <th class="num">Price</th>
              <th class="num">Subtotal</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="totals">
          <div class="row"><span>Total</span><span>${money(o.totalPrice)}</span></div>
          ${(o.refunded || 0) > 0 ? `<div class="row"><span>Refunded</span><span>${money(o.refunded)}</span></div>` : ''}
          <div class="row grand"><span>Amount due</span><span>${money(this.remaining())}</span></div>
        </div>

        <div class="foot">Thank you for your order.</div>
      </div>
      </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }
}