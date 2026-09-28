import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { LanguageService } from '../../../core/services/language.service';
import { formatDateTime } from '../../../shared/utils/datetime';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { DetailHeaderComponent } from '../../../shared/ui/detail-header.component';

@Component({
  selector: 'app-coupon-detail',
  standalone: true,
  imports: [TranslatePipe, DetailHeaderComponent],
  template: `
    <div class="w-full space-y-6">
      @if (coupon()) {
        <app-detail-header [title]="coupon()?.code" eyebrow="Coupon details"
          backLabel="Back to coupons" backTo="/admin/coupons"
          editLabel="Edit coupon" [editTo]="['/admin/coupons', coupon()?.id, 'edit']" />
        <div class="card">
          <dl class="grid grid-cols-1 gap-5 text-sm sm:grid-cols-2">
            <div><dt class="spec-dt">{{ 'Code' | translate }}</dt><dd class="spec-dd">{{ coupon()?.code }}</dd></div>
            <div><dt class="spec-dt">{{ 'Type' | translate }}</dt><dd class="spec-dd">{{ coupon()?.type === 'percent' ? ('Percent' | translate) : ('Fixed' | translate) }}</dd></div>
            <div><dt class="spec-dt">{{ 'Value' | translate }}</dt><dd class="spec-dd">{{ displayValue() }}</dd></div>
            <div><dt class="spec-dt">{{ 'Used' | translate }}</dt><dd class="spec-dd">{{ coupon()?.usedCount ?? 0 }}</dd></div>
            <div><dt class="spec-dt">{{ 'Max Uses' | translate }}</dt><dd class="spec-dd">{{ coupon()?.maxUses === 0 ? ('Unlimited' | translate) : coupon()?.maxUses }}</dd></div>
            <div><dt class="spec-dt">{{ 'Min order' | translate }}</dt><dd class="spec-dd">{{ coupon()?.minSubtotal && coupon()?.minSubtotal > 0 ? coupon()?.minSubtotal : ('None' | translate) }}</dd></div>
            <div><dt class="spec-dt">{{ 'Scope' | translate }}</dt><dd class="spec-dd">{{ scope() }}</dd></div>
            <div><dt class="spec-dt">{{ 'Active' | translate }}</dt><dd class="spec-dd">{{ coupon()?.active ? ('Yes' | translate) : ('No' | translate) }}</dd></div>
            <div><dt class="spec-dt">{{ 'Valid From' | translate }}</dt><dd class="spec-dd">{{ formatDate(coupon()?.validFrom) }}</dd></div>
            <div><dt class="spec-dt">{{ 'Valid Until' | translate }}</dt><dd class="spec-dd">{{ formatDate(coupon()?.validUntil) }}</dd></div>
          </dl>
        </div>
      } @else {
        <div class="flex min-h-64 items-center justify-center text-sm text-[#797979]">{{ 'Loading...' | translate }}</div>
      }
    </div>
  `,
})
export class CouponDetailComponent implements OnInit {
  private entityService = inject(EntityService);
  private route = inject(ActivatedRoute);
  private language = inject(LanguageService);
  coupon = signal<any>(null);

  displayValue(): string {
    const c = this.coupon();
    if (!c) return '-';
    return c.type === 'percent' ? `${c.value}%` : `$${c.value}`;
  }

  scope(): string {
    const c = this.coupon();
    if (!c) return '-';
    const products = Array.isArray(c.productIds) ? c.productIds.length : 0;
    const categories = Array.isArray(c.categoryIds) ? c.categoryIds.length : 0;
    if (products === 0 && categories === 0) return 'Whole order';
    return `${products} products / ${categories} categories`;
  }

  formatDate(value: string): string {
    return formatDateTime(value, this.language.language());
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.entityService.get<any>('coupons', id).subscribe((c) => this.coupon.set(c));
  }
}
