import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="mx-auto max-w-2xl space-y-6">
      <h2 class="text-2xl font-bold text-slate-900">{{ isEdit() ? 'Edit' : 'New' }} Product</h2>
      <form (ngSubmit)="submit()" class="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label class="block text-sm font-medium text-slate-700">Name</label>
          <input [(ngModel)]="form.name" name="name" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Description</label>
          <textarea [(ngModel)]="form.description" name="description" rows="3" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700">Price</label>
            <input [(ngModel)]="form.price" name="price" type="number" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Stock</label>
            <input [(ngModel)]="form.countInStock" name="countInStock" type="number" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700">Brand</label>
            <input [(ngModel)]="form.brand" name="brand" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Color</label>
            <input [(ngModel)]="form.color" name="color" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Category ID</label>
          <input [(ngModel)]="form.category" name="category" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label class="flex items-center gap-2">
            <input type="checkbox" [(ngModel)]="form.isFeatured" name="isFeatured" class="rounded" />
            <span class="text-sm font-medium text-slate-700">Featured</span>
          </label>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Image</label>
          <input type="file" (change)="onFileSelect($event)" accept="image/*" class="mt-1 w-full text-sm" />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <button type="button" (click)="router.navigate(['/admin/products'])" class="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" [disabled]="saving()" class="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50">{{ saving() ? 'Saving...' : 'Save' }}</button>
        </div>
      </form>
    </div>
  `,
})
export class ProductFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  private http = inject(HttpClient);

  isEdit = signal(false);
  saving = signal(false);
  productId = '';
  imageFile: File | null = null;

  form = { name: '', description: '', price: 0, countInStock: 0, brand: '', color: '', category: '', isFeatured: false };

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id') || '';
    if (this.productId) {
      this.isEdit.set(true);
      this.http.get<any>(`${environment.apiUrl}products/${this.productId}`).subscribe((p) => {
        this.form = {
          name: p.name || '', description: p.description || '', price: p.price || 0,
          countInStock: p.countInStock || 0, brand: p.brand || '', color: p.color || '',
          category: typeof p.category === 'object' ? p.category?.id : p.category || '', isFeatured: p.isFeatured || false,
        };
      });
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.imageFile = input.files[0];
  }

  submit(): void {
    this.saving.set(true);
    const formData = new FormData();
    Object.entries(this.form).forEach(([key, value]) => {
      if (value !== null && value !== undefined) formData.append(key, String(value));
    });
    if (this.imageFile) formData.append('image', this.imageFile);
    const req = this.isEdit()
      ? this.http.put(`${environment.apiUrl}products/${this.productId}`, formData)
      : this.http.post(`${environment.apiUrl}products`, formData);
    req.subscribe({ next: () => this.router.navigate(['/admin/products']), error: () => this.saving.set(false) });
  }
}
