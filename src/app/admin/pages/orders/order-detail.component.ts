import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntityService } from '../../../core/services/entity.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="mx-auto max-w-4xl space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-900">Order {{ order()?.id?.slice(-8) }}</h2>
        <button (click)="router.navigate(['/admin/orders'])" class="text-sm text-indigo-600 hover:text-indigo-800">← Back to Orders</button>
      </div>
      @if (order()) {
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div class="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
            <h3 class="text-lg font-semibold text-slate-900">Order Info</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-slate-500">Status</span>
                <select [(ngModel)]="newStatus" (ngModelChange)="updateStatus()" class="rounded border border-slate-300 px-2 py-1 text-sm">
                  <option value="Pending">Pending</option>
                  <option value="Processed">Processed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div class="flex justify-between"><span class="text-slate-500">Payment</span><span>{{ order()?.paymentStatus }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Total</span><span class="font-medium">\${{ order()?.totalPrice?.toFixed(2) }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Date</span><span>{{ order()?.dateOrdered | date:'medium' }}</span></div>
            </div>
          </div>
          <div class="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
            <h3 class="text-lg font-semibold text-slate-900">Shipping</h3>
            <div class="space-y-2 text-sm">
              <div><span class="text-slate-500">Customer:</span> {{ order()?.user?.name }}</div>
              <div><span class="text-slate-500">Phone:</span> {{ order()?.phone }}</div>
              <div><span class="text-slate-500">Address:</span> {{ order()?.shippingAddress1 }}</div>
              <div><span class="text-slate-500">City:</span> {{ order()?.city }}</div>
              <div><span class="text-slate-500">Country:</span> {{ order()?.country }}</div>
            </div>
          </div>
        </div>
        <div class="rounded-lg border border-slate-200 bg-white p-6">
          <h3 class="mb-4 text-lg font-semibold text-slate-900">Items</h3>
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th class="pb-2">Product</th><th class="pb-2">Qty</th><th class="pb-2">Price</th>
              </tr>
            </thead>
            <tbody>
              @for (item of order()?.orderItems || []; track item.id) {
                <tr class="border-b border-slate-100">
                  <td class="py-2">{{ item.product?.name }}</td>
                  <td class="py-2">{{ item.quantity }}</td>
                  <td class="py-2">\${{ (item.product?.price * item.quantity)?.toFixed(2) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class OrderDetailComponent implements OnInit {
  private entityService = inject(EntityService);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  order = signal<any>(null);
  newStatus = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.entityService.get<any>('orders', id).subscribe((o) => {
      this.order.set(o); this.newStatus = o.status;
    });
  }

  updateStatus(): void {
    if (this.newStatus !== this.order()?.status) {
      this.entityService.update('orders', this.order()!.id, { status: this.newStatus }).subscribe((updated) => {
        this.order.set(updated);
      });
    }
  }
}
