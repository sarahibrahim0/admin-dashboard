import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';
import { FormFieldComponent, FormFieldConfig } from '../../../shared/forms/form-field.component';
import { FormConfirmsComponent } from '../../../shared/confirm-dialog/form-confirms.component';

import { DetailHeaderComponent } from '../../../shared/ui/detail-header.component';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
  selector: 'app-coupon-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, FormFieldComponent, DetailHeaderComponent, FormConfirmsComponent],
  template: `
    <div class="w-full space-y-6">
      <app-detail-header title="{{ isEdit() ? ('Edit coupon' | translate) : ('Create coupon' | translate) }}"
        eyebrow="{{ isEdit() ? ('Update coupon' | translate) : ('New coupon' | translate) }}"
        backLabel="Back to coupons" backTo="/admin/coupons"
        saveLabel="Save coupon" cancelTo="/admin/coupons" [saving]="saving()" (save)="showSaveDialog.set(true)" />
      <form id="coupon-form" [formGroup]="form" (ngSubmit)="showSaveDialog.set(true)" class="space-y-6">
        <section class="card">
          <h3 class="section-title mb-5">{{ 'Coupon details' | translate }}</h3>
          @if (submitError()) {
            <div class="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#ff4545]">{{ submitError() }}</div>
          }
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <app-form-field [form]="form" [fields]="codeFields"></app-form-field>
            <app-form-field [form]="form" [fields]="typeFields"></app-form-field>
          </div>
          <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-[#646D77]">{{ 'Value' | translate }}</label>
              <input [formControl]="form.controls.value" name="value" type="number" class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#646D77]">{{ 'Max uses' | translate }}</label>
              <input [formControl]="form.controls.maxUses" name="maxUses" type="number" class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
            </div>
          </div>
          <div class="mt-6">
            <label class="block text-sm font-medium text-[#646D77]">{{ 'Minimum order subtotal' | translate }}</label>
            <input [formControl]="form.controls.minSubtotal" name="minSubtotal" type="number" class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
            <p class="mt-1 text-xs text-[#c9c9c9]">{{ 'Coupon only applies when the order reaches this amount (0 = always).' | translate }}</p>
          </div>
          <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-[#646D77]">{{ 'Products' | translate }}</label>
              <p class="mb-1 text-xs text-[#c9c9c9]">{{ 'Leave empty to apply to the whole order.' | translate }}</p>
              <select multiple size="6" name="productIds" [disabled]="productsLoading()"
                (change)="onProductsChange($event)"
                class="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon">
                @for (p of products(); track p.id) {
                  <option [value]="p.id" [selected]="isProductSelected(p.id)">{{ productLabel(p) }}</option>
                }
              </select>
              @if (productsLoading()) {
                <p class="mt-1 text-xs text-[#c9c9c9]">{{ 'Loading products...' | translate }}</p>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-[#646D77]">{{ 'Categories' | translate }}</label>
              <p class="mb-1 text-xs text-[#c9c9c9]">{{ 'Leave empty to apply to the whole order.' | translate }}</p>
              <select multiple size="6" name="categoryIds" [disabled]="categoriesLoading()"
                (change)="onCategoriesChange($event)"
                class="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon">
                @for (c of categories(); track c.id) {
                  <option [value]="c.id" [selected]="isCategorySelected(c.id)">{{ categoryLabel(c) }}</option>
                }
              </select>
              @if (categoriesLoading()) {
                <p class="mt-1 text-xs text-[#c9c9c9]">{{ 'Loading categories...' | translate }}</p>
              }
            </div>
          </div>
          <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-[#646D77]">{{ 'Valid from' | translate }}</label>
              <input [formControl]="form.controls.validFrom" name="validFrom" type="date" class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#646D77]">{{ 'Valid until' | translate }}</label>
              <input [formControl]="form.controls.validUntil" name="validUntil" type="date" class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
            </div>
          </div>
          <div class="mt-6">
            <label class="flex cursor-pointer items-center gap-2">
              <input [formControl]="form.controls.active" name="active" type="checkbox" class="rounded accent-salmon" />
              <span class="text-sm font-medium text-[#646D77]">{{ ('Status' | translate) + ' (' + ((form.controls.active.value ? 'Active' : 'Inactive') | translate) + ')' }}</span>
            </label>
          </div>
        </section>
      </form>
      <app-form-confirms [saveOpen]="showSaveDialog()" (save)="confirmSave()" (saveCancel)="showSaveDialog.set(false)" />
    </div>
  `,
})
export class CouponFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  private toast = inject(ToastService);
  private http = inject(HttpClient);
  private language = inject(LanguageService);

  isEditSignal = signal(false);
  saving = signal(false);
  submitError = signal<string | null>(null);
  showSaveDialog = signal(false);
  products = signal<{ id: string; name: any }[]>([]);
  categories = signal<{ id: string; name: any }[]>([]);
  productsLoading = signal(false);
  categoriesLoading = signal(false);

  confirmSave(): void {
    this.showSaveDialog.set(false);
    this.submit();
  }

  codeFields: FormFieldConfig[] = [
    { key: 'code', label: 'Code', type: 'text', placeholder: 'Coupon code', required: true },
  ];
  typeFields: FormFieldConfig[] = [
    { key: 'type', label: 'Type', type: 'select', placeholder: 'Select type', options: [
      { value: 'percent', label: 'Percent' },
      { value: 'fixed', label: 'Fixed' },
    ]},
  ];

  form = this.fb.group({
    code: ['', Validators.required],
    type: ['percent'],
    value: [0, Validators.required],
    maxUses: [0],
    minSubtotal: [0],
    productIds: [[] as string[]],
    categoryIds: [[] as string[]],
    validFrom: [''],
    validUntil: [''],
    active: [true],
  });

  productLabel(p: { name: any }): string {
    return this.language.localizedValue(p.name) || '-';
  }

  categoryLabel(c: { name: any }): string {
    return this.language.localizedValue(c.name) || '-';
  }

  onProductsChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.form.controls.productIds.setValue(Array.from(select.selectedOptions).map((o) => o.value));
  }

  onCategoriesChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.form.controls.categoryIds.setValue(Array.from(select.selectedOptions).map((o) => o.value));
  }

  isProductSelected(id: string): boolean {
    return (this.form.controls.productIds.value ?? []).includes(id);
  }

  isCategorySelected(id: string): boolean {
    return (this.form.controls.categoryIds.value ?? []).includes(id);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.loadProducts();
    this.loadCategories();
    if (id) {
      this.isEditSignal.set(true);
      this.http.get<any>(`${environment.apiUrl}coupons/${id}`).subscribe((c: any) => {
        this.form.patchValue({
          code: c.code || '',
          type: c.type || 'percent',
          value: c.value ?? 0,
          maxUses: c.maxUses ?? 0,
          minSubtotal: c.minSubtotal ?? 0,
          productIds: Array.isArray(c.productIds) ? c.productIds.map((x: any) => x._id || x.id || x) : [],
          categoryIds: Array.isArray(c.categoryIds) ? c.categoryIds.map((x: any) => x._id || x.id || x) : [],
          validFrom: c.validFrom || '',
          validUntil: c.validUntil || '',
          active: c.active ?? true,
        });
      });
    }
  }

  private loadProducts(): void {
    this.productsLoading.set(true);
    this.http.get<any>(`${environment.apiUrl}products`, { params: { limit: '1000', page: '1' } }).subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        this.products.set(list.map((p: any) => ({ id: p._id || p.id, name: p.name })));
      },
      error: () => undefined,
      complete: () => this.productsLoading.set(false),
    });
  }

  private loadCategories(): void {
    this.categoriesLoading.set(true);
    this.http.get<any>(`${environment.apiUrl}categories/`, { params: { limit: '100' } }).subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        this.categories.set(list.map((c: any) => ({ id: c._id || c.id, name: c.name })));
      },
      error: () => undefined,
      complete: () => this.categoriesLoading.set(false),
    });
  }

  isEdit(): boolean { return this.isEditSignal(); }

  submit(): void {
    if (this.saving()) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.form.pristine) {
      this.toast.info('No changes to save');
      return;
    }
    this.saving.set(true);
    this.submitError.set(null);
    const body: any = { ...this.form.value };
    const req = this.isEdit()
      ? this.http.put<any>(`${environment.apiUrl}coupons/${this.route.snapshot.paramMap.get('id')}`, body)
      : this.http.post<any>(`${environment.apiUrl}coupons`, body);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        if (this.isEdit()) {
          this.form.markAsPristine();
          this.toast.success('Saved successfully');
        } else {
          this.toast.success('Saved successfully');
          this.router.navigate(['/admin/coupons']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.submitError.set(err?.error?.message || 'Could not save coupon');
      },
    });
  }
}