import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EntityService } from '../../../core/services/entity.service';

@Component({
  selector: 'app-coupon-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="mx-auto max-w-lg space-y-6">
      <h2 class="text-2xl font-bold text-slate-900">{{ isEdit() ? 'Edit' : 'New' }} Coupon</h2>
      <form (ngSubmit)="submit()" class="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label class="block text-sm font-medium text-slate-700">Code</label>
          <input [(ngModel)]="form.code" name="code" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700">Type</label>
            <select [(ngModel)]="form.type" name="type" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500">
              <option value="percent">Percent</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Value</label>
            <input [(ngModel)]="form.value" name="value" type="number" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700">Max Uses (0=unlimited)</label>
            <input [(ngModel)]="form.maxUses" name="maxUses" type="number" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="flex items-center gap-2 pt-6">
              <input type="checkbox" [(ngModel)]="form.active" name="active" class="rounded" />
              <span class="text-sm font-medium text-slate-700">Active</span>
            </label>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700">Valid From</label>
            <input [(ngModel)]="form.validFrom" name="validFrom" type="date" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Valid Until</label>
            <input [(ngModel)]="form.validUntil" name="validUntil" type="date" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <button type="button" (click)="router.navigate(['/admin/coupons'])" class="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" [disabled]="saving()" class="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50">{{ saving() ? 'Saving...' : 'Save' }}</button>
        </div>
      </form>
    </div>
  `,
})
export class CouponFormComponent implements OnInit {
  private entityService = inject(EntityService);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  isEdit = signal(false);
  saving = signal(false);
  couponId = '';
  form = { code: '', type: 'percent', value: 0, maxUses: 0, active: true, validFrom: '', validUntil: '' };

  ngOnInit(): void {
    this.couponId = this.route.snapshot.paramMap.get('id') || '';
    if (this.couponId) {
      this.isEdit.set(true);
      this.entityService.get<any>('coupons', this.couponId).subscribe((c) => {
        this.form = {
          code: c.code, type: c.type, value: c.value, maxUses: c.maxUses || 0,
          active: c.active, validFrom: c.validFrom ? c.validFrom.split('T')[0] : '',
          validUntil: c.validUntil ? c.validUntil.split('T')[0] : '',
        };
      });
    }
  }

  submit(): void {
    this.saving.set(true);
    const req = this.isEdit()
      ? this.entityService.update('coupons', this.couponId, this.form)
      : this.entityService.create('coupons', this.form);
    req.subscribe({ next: () => this.router.navigate(['/admin/coupons']), error: () => this.saving.set(false) });
  }
}
