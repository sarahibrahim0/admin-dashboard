import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn } from '../../../shared/table/table-column';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-coupons-list',
  standalone: true,
  imports: [RouterLink, BaseTableComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-900">Coupons</h2>
        <a routerLink="new" class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Add Coupon</a>
      </div>
      <app-base-table [columns]="columns" [data]="coupons" [totalCount]="totalCount" (sortChange)="onSort($event)" (rowClick)="router.navigate(['/admin/coupons', $event.id, 'edit'])" />
    </div>
    <app-confirm-dialog [open]="showDeleteDialog()" title="Delete Coupon" message="Are you sure?" (confirm)="deleteCoupon()" (cancel)="showDeleteDialog.set(false)" />
  `,
})
export class CouponsListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected router = inject(Router);
  coupons = signal<any[]>([]);
  totalCount = signal(0);
  showDeleteDialog = signal(false);
  deleteId: string | null = null;

  columns: TableColumn[] = [
    { field: 'code', header: 'Code', sortable: true },
    { field: 'type', header: 'Type', format: (v) => v === 'percent' ? 'Percent' : 'Fixed' },
    { field: 'value', header: 'Value', format: (v, r) => r.type === 'percent' ? `${v}%` : `$${v}` },
    { field: 'usedCount', header: 'Used' },
    { field: 'maxUses', header: 'Max Uses', format: (v) => v === 0 ? 'Unlimited' : v },
    { field: 'active', header: 'Active', format: (v) => v ? 'Yes' : 'No' },
    { field: 'validUntil', header: 'Expires', format: (v) => v ? new Date(v).toLocaleDateString() : '-' },
  ];

  ngOnInit(): void {
    this.entityService.list<any>('coupons').subscribe((data) => {
      this.coupons.set(data); this.totalCount.set(data.length);
    });
  }

  onSort(event: { field: string; dir: 'asc' | 'desc' }): void {
    const sorted = [...this.coupons()].sort((a, b) => {
      const cmp = a[event.field] < b[event.field] ? -1 : a[event.field] > b[event.field] ? 1 : 0;
      return event.dir === 'asc' ? cmp : -cmp;
    });
    this.coupons.set(sorted);
  }

  deleteCoupon(): void {
    if (this.deleteId) {
      this.entityService.delete('coupons', this.deleteId).subscribe(() => {
        this.entityService.list<any>('coupons').subscribe((data) => {
          this.coupons.set(data); this.totalCount.set(data.length);
        });
        this.showDeleteDialog.set(false); this.deleteId = null;
      });
    }
  }
}
