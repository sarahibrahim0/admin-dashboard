import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  template: `
    <div class="mx-auto max-w-4xl space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-900">{{ product()?.name }}</h2>
        <div class="flex gap-2">
          <button (click)="router.navigate(['/admin/products', product()?.id, 'edit'])" class="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Edit</button>
          <button (click)="router.navigate(['/admin/products'])" class="text-sm text-indigo-600 hover:text-indigo-800">← Back</button>
        </div>
      </div>
      @if (product()) {
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div class="space-y-3 rounded-lg border border-slate-200 bg-white p-6">
            <h3 class="text-lg font-semibold text-slate-900">Details</h3>
            <div class="text-sm"><span class="text-slate-500">Price:</span> {{ '$' + product()?.price?.toFixed(2) }}</div>
            <div class="text-sm"><span class="text-slate-500">Stock:</span> {{ product()?.countInStock }}</div>
            <div class="text-sm"><span class="text-slate-500">Brand:</span> {{ product()?.brand || '-' }}</div>
            <div class="text-sm"><span class="text-slate-500">Color:</span> {{ product()?.color || '-' }}</div>
            <div class="text-sm"><span class="text-slate-500">Category:</span> {{ product()?.category?.name || product()?.category }}</div>
            <div class="text-sm"><span class="text-slate-500">Featured:</span> {{ product()?.isFeatured ? 'Yes' : 'No' }}</div>
            <div class="text-sm"><span class="text-slate-500">Rating:</span> {{ product()?.rating?.toFixed(1) }} ★ ({{ product()?.numbReviews }} reviews)</div>
          </div>
          <div class="space-y-3 rounded-lg border border-slate-200 bg-white p-6">
            <h3 class="text-lg font-semibold text-slate-900">Image</h3>
            @if (product()?.image?.url) {
              <img [src]="product()?.image?.url" [alt]="product()?.name" class="w-full rounded-lg object-cover" />
            } @else {
              <p class="text-sm text-slate-500">No image</p>
            }
          </div>
        </div>
        <div class="rounded-lg border border-slate-200 bg-white p-6">
          <h3 class="mb-2 text-lg font-semibold text-slate-900">Description</h3>
          <p class="text-sm text-slate-600">{{ product()?.description || 'No description' }}</p>
        </div>
      }
    </div>
  `,
})
export class ProductDetailComponent implements OnInit {
  private entityService = inject(EntityService);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  product = signal<any>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.entityService.get<any>('products', id).subscribe((p) => this.product.set(p));
  }
}
