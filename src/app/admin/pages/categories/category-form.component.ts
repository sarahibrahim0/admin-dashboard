import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { FormFieldComponent } from '../../../shared/forms/form-field.component';
import { LocalizedFieldComponent } from '../../../shared/forms/localized-field.component';
import { FormConfirmsComponent } from '../../../shared/confirm-dialog/form-confirms.component';
import { joinLocalized, splitLocalized } from '../../../shared/utils/localized';

import { DetailHeaderComponent } from '../../../shared/ui/detail-header.component';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, FormFieldComponent, LocalizedFieldComponent, DetailHeaderComponent, FormConfirmsComponent],
  styles: `
    :host ::ng-deep .ql-container { min-height: 140px; font-size: 14px; max-width: 100%; }
    :host ::ng-deep .ql-editor { min-height: 140px; }
  `,
  template: `
    <div class="w-full space-y-6">
      <app-detail-header title="{{ isEdit() ? ('Edit category' | translate) : ('New category' | translate) }}"
        eyebrow="{{ isEdit() ? ('Update catalog item' | translate) : ('Add to catalog' | translate) }}"
        backLabel="Back to categories" backTo="/admin/categories"
        saveLabel="Save category" cancelTo="/admin/categories" [saving]="saving()" [disabled]="uploading()" (save)="showSaveDialog.set(true)" />
      <form id="category-form" [formGroup]="form" (ngSubmit)="showSaveDialog.set(true)">
      <div class="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div class="min-w-0 space-y-6">
        <section class="card">
          <h3 class="section-title mb-5">{{ 'Category content' | translate }}</h3>
          @if (submitError()) {
            <div class="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#ff4545]">{{ submitError() }}</div>
          }
          <app-localized-field
            [label]="'Name' | translate"
            mode="text"
            [required]="true"
            [controlEn]="fc('nameEn')"
            [controlAr]="fc('nameAr')"
            [placeholder]="'Category name' | translate"
            [placeholderAr]="'اسم التصنيف'"
            [id]="'category-name'">
          </app-localized-field>
          <div class="mt-5">
            <app-localized-field
              [label]="'Description' | translate"
              mode="editor"
              [controlEn]="fc('descriptionEn')"
              [controlAr]="fc('descriptionAr')"
              [placeholder]="'Write a category description...' | translate"
              [placeholderAr]="'اكتب وصفاً للتصنيف...'">
            </app-localized-field>
          </div>
          <div class="mt-5">
            <app-localized-field
              [label]="'Rich description' | translate"
              mode="editor"
              [controlEn]="fc('richDescriptionEn')"
              [controlAr]="fc('richDescriptionAr')"
              [placeholder]="'Write detailed category content...' | translate"
              [placeholderAr]="'اكتب محتوى مفصلاً للتصنيف...'">
            </app-localized-field>
          </div>
        </section>
        <section class="card">
          <h3 class="section-title mb-5">{{ 'Category information' | translate }}</h3>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <app-form-field [control]="fc('icon')" [label]="'Icon' | translate" id="category-icon"></app-form-field>
            <app-form-field [control]="fc('color')" [label]="'Color' | translate" type="color" id="category-color"></app-form-field>
          </div>
          <div class="mt-4">
            <app-form-field [control]="fc('isActive')" [type]="'checkbox'" [checkboxLabel]="('Status' | translate) + ' (' + ((fc('isActive').value ? 'Active' : 'Inactive') | translate) + ')'" id="category-active"></app-form-field>
          </div>
        </section>
        </div>
        <aside class="card relative min-w-0 self-start">
          <h3 class="section-title mb-5">{{ 'Category image' | translate }}</h3>
          <div>
            @if (preview()) {
              <img [src]="preview()" [alt]="'Category image' | translate" class="aspect-square w-full rounded-md object-cover" />
            } @else {
              <div class="flex aspect-square w-full items-center justify-center rounded-md bg-[#f8eeea] text-sm text-[#797979]">{{ 'No category image' | translate }}</div>
            }
            <input #categoryFileInput type="file" (change)="onFileSelect($event)" accept="image/*" class="hidden" />
            <button type="button" (click)="categoryFileInput.click()" class="btn btn-secondary btn-sm mt-3">{{ 'Select photo' | translate }}</button>
            @if (pendingFile()) { <p class="mt-1 truncate text-xs text-[#646D77]">{{ pendingFile()?.name }}</p> }
            @if (uploading()) {
              <p class="mt-1 text-xs text-salmon">{{ 'Uploading image...' | translate }}</p>
            }
          </div>
        </aside>
      </div>
      </form>
      <app-form-confirms
        [saveOpen]="showSaveDialog()" (save)="confirmSave()" (saveCancel)="showSaveDialog.set(false)"
        [uploadOpen]="showUploadDialog()" (upload)="confirmUpload()" (uploadCancel)="cancelUpload()" />
    </div>
  `,
})
export class CategoryFormComponent implements OnInit {
private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  private toast = inject(ToastService);
  private http = inject(HttpClient);

  isEdit = signal(false);
  saving = signal(false);
  uploading = signal(false);
  submitError = signal<string | null>(null);
  categoryId = '';
  image: { url: string; publicId: string } | null = null;
  preview = signal<string>('');
form: FormGroup;

  fc(key: string): FormControl {
    return this.form.controls[key] as FormControl;
  }

  constructor() {
    this.form = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: [''],
      descriptionEn: [''],
      descriptionAr: [''],
      richDescriptionEn: [''],
      richDescriptionAr: [''],
      icon: [''],
      color: [''],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id') || '';
    if (this.categoryId) {
      this.isEdit.set(true);
      this.http.get<any>(`${environment.apiUrl}categories/${this.categoryId}`).subscribe((c) => {
        const name = splitLocalized(c.name);
        const description = splitLocalized(c.description);
        const richDescription = splitLocalized(c.richDescription);
        this.form.patchValue({
          nameEn: name.en,
          nameAr: name.ar,
          descriptionEn: description.en,
          descriptionAr: description.ar,
          richDescriptionEn: richDescription.en,
          richDescriptionAr: richDescription.ar,
          icon: c.icon || '',
          color: c.color || '',
          isActive: c.isActive ?? true,
        });
        if (c.image?.url) {
          this.image = { url: c.image.url, publicId: c.image.publicId || '' };
          this.preview.set(c.image.url);
        }
      });
    }
  }

  showSaveDialog = signal(false);
  pendingFile = signal<File | null>(null);
  showUploadDialog = signal(false);
  mediaDirty = signal(false);

  confirmSave(): void {
    this.showSaveDialog.set(false);
    this.submit();
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.pendingFile.set(file);
    this.showUploadDialog.set(true);
  }

  cancelUpload(): void {
    this.pendingFile.set(null);
    this.showUploadDialog.set(false);
  }

  confirmUpload(): void {
    const file = this.pendingFile();
    this.pendingFile.set(null);
    this.showUploadDialog.set(false);
    if (!file) return;
    this.uploading.set(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'categories');
    this.http.post<any>(`${environment.apiUrl}media/image`, formData).subscribe({
        next: (res) => {
          this.image = res.image;
          this.preview.set(res.image.url);
          this.uploading.set(false);
          this.mediaDirty.set(true);
        },
      error: () => this.uploading.set(false),
    });
  }

  submit(): void {
    if (this.uploading()) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.form.pristine && !this.mediaDirty()) {
      this.toast.info('No changes to save');
      return;
    }
    this.saving.set(true);
    this.submitError.set(null);
    const v = this.form.getRawValue();
    const body: any = {
      name: joinLocalized(v.nameEn, v.nameAr),
      description: joinLocalized(v.descriptionEn, v.descriptionAr),
      richDescription: joinLocalized(v.richDescriptionEn, v.richDescriptionAr),
      icon: v.icon,
      color: v.color,
      isActive: v.isActive,
    };
    if (this.image) body.image = this.image;
    const req = this.isEdit()
      ? this.http.put<any>(`${environment.apiUrl}categories/${this.categoryId}`, body)
      : this.http.post<any>(`${environment.apiUrl}categories`, body);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        if (this.isEdit()) {
          this.form.markAsPristine();
          this.mediaDirty.set(false);
          this.toast.success('Saved successfully');
        } else {
          this.toast.success('Saved successfully');
          this.router.navigate(['/admin/categories']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.submitError.set(err?.error?.message || 'Could not save category');
      },
    });
  }
}
