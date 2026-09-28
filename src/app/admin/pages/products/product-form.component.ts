import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';
import { FormFieldComponent } from '../../../shared/forms/form-field.component';
import { LocalizedFieldComponent } from '../../../shared/forms/localized-field.component';
import { FormConfirmsComponent } from '../../../shared/confirm-dialog/form-confirms.component';
import { joinLocalized, splitLocalized } from '../../../shared/utils/localized';

import { DetailHeaderComponent } from '../../../shared/ui/detail-header.component';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, FormFieldComponent, LocalizedFieldComponent, DetailHeaderComponent, FormConfirmsComponent],
  styles: `
    :host ::ng-deep .ql-container { min-height: 140px; font-size: 14px; max-width: 100%; }
    :host ::ng-deep .ql-editor { min-height: 140px; }
    :host ::ng-deep .ql-toolbar button.ql-video-upload { width: 28px; padding: 3px; }
    :host ::ng-deep .ql-toolbar button.ql-video-upload::before { content: '↥'; display: block; font-size: 19px; line-height: 18px; font-weight: 700; }
  `,
  template: `
    <div class="w-full space-y-6">
      <app-detail-header title="{{ isEdit() ? ('Edit product' | translate) : ('New product' | translate) }}"
        eyebrow="{{ 'Catalog' | translate }}" backLabel="Back to products" backTo="/admin/products"
        saveLabel="Save product" cancelTo="/admin/products"
        [saving]="saving()" [disabled]="imageUploading() || galleryUploading()" (save)="showSaveDialog.set(true)" />
      <form [formGroup]="form" (ngSubmit)="showSaveDialog.set(true)">
      <div class="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div class="min-w-0 space-y-4 card">
        @if (submitError()) {
          <div class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#ff4545]">{{ submitError() }}</div>
        }
        <app-localized-field
          [label]="'Name' | translate"
          mode="text"
          [required]="true"
          [controlEn]="form.controls.nameEn"
          [controlAr]="form.controls.nameAr"
          [placeholder]="'Product name' | translate"
          [placeholderAr]="'اسم المنتج'"
          [id]="'product-name'">
        </app-localized-field>

        <app-localized-field
          [label]="'Description' | translate"
          mode="editor"
          [controlEn]="form.controls.descriptionEn"
          [controlAr]="form.controls.descriptionAr"
          [editorModulesEn]="modulesFor('descriptionEn')"
          [editorModulesAr]="modulesFor('descriptionAr')"
          (editorReady)="trackEditor('description', $event)"
          [placeholder]="'Write a short description...' | translate"
          [placeholderAr]="'اكتب وصفاً قصيراً...'">
        </app-localized-field>
        <app-localized-field
          [label]="'Rich Description (HTML)' | translate"
          mode="editor"
          [controlEn]="form.controls.richDescriptionEn"
          [controlAr]="form.controls.richDescriptionAr"
          [editorModulesEn]="modulesFor('richDescriptionEn')"
          [editorModulesAr]="modulesFor('richDescriptionAr')"
          (editorReady)="trackEditor('richDescription', $event)"
          [placeholder]="'Write detailed product description...' | translate"
          [placeholderAr]="'اكتب وصفاً تفصيلياً للمنتج...'">
        </app-localized-field>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <app-form-field
            [control]="form.controls.price"
            [label]="'Price' | translate"
            [type]="'number'"
            [required]="true"
            [id]="'product-price'">
          </app-form-field>
          <app-form-field
            [control]="form.controls.salePrice"
            [label]="'Sale price' | translate"
            [type]="'number'"
            [id]="'product-sale-price'">
          </app-form-field>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <app-form-field
            [control]="form.controls.countInStock"
            [label]="'Stock' | translate"
            [type]="'number'"
            [required]="true"
            [id]="'product-stock'">
          </app-form-field>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <app-localized-field
            [controlEn]="form.controls.brandEn"
            [controlAr]="form.controls.brandAr"
            [label]="'Brand' | translate"
            [placeholder]="'Brand' | translate"
            [placeholderAr]="'اسم العلامة التجارية'"
            [id]="'product-brand'">
          </app-localized-field>
          <app-form-field
            [control]="form.controls.color"
            [label]="'Color' | translate"
            [placeholder]="'Color' | translate"
            [id]="'product-color'">
          </app-form-field>
        </div>
        <div>
          <label for="product-category" class="block text-sm font-medium text-[#646D77]">
            {{ 'Category' | translate }}
            <span class="text-salmon">*</span>
          </label>
          <select id="product-category" [formControl]="form.controls.category"
            class="mt-1 w-full rounded-md border border-[#c9c9c9] bg-white px-3 py-2 text-sm outline-none focus:border-salmon">
            <option value="">{{ 'Select category' | translate }}</option>
            @for (c of categories(); track c.id) {
              <option [value]="c.id">{{ categoryLabel(c) }}</option>
            }
          </select>
          @if (form.controls.category.touched && form.controls.category.errors?.['required']) {
            <p class="mt-1 text-xs text-salmon">{{ 'This field is required' | translate }}</p>
          }
        </div>
        <app-form-field
          [control]="form.controls.isFeatured"
          [type]="'checkbox'"
          [checkboxLabel]="'Featured' | translate"
          [id]="'product-featured'">
        </app-form-field>
        <app-form-field
          [control]="form.controls.isActive"
          [type]="'checkbox'"
          [checkboxLabel]="('Status' | translate) + ' (' + ((form.controls.isActive.value ? 'Active' : 'Inactive') | translate) + ')'"
          [id]="'product-active'">
        </app-form-field>
        </div>
        <aside class="card relative min-w-0 space-y-5 self-start">
        <div>
          <label class="block text-sm font-medium text-[#646D77]">{{ 'Image' | translate }}</label>
          @if (imagePreview()) {
            <img [src]="imagePreview()" [alt]="'Product image' | translate" class="mt-2 aspect-square w-full rounded-md object-cover" />
          }
          <input #mainFileInput type="file" (change)="onFileSelect($event)" accept="image/*" class="hidden" />
          <button type="button" (click)="mainFileInput.click()" class="btn btn-secondary btn-sm mt-2">{{ 'Select photo' | translate }}</button>
          @if (pendingMainFile()) { <p class="mt-1 truncate text-xs text-[#646D77]">{{ pendingMainFile()?.name }}</p> }
          @if (imageUploading()) {
            <p class="mt-1 text-xs text-salmon">{{ 'Uploading image...' | translate }}</p>
          }
        </div>
        <div class="border-t border-[#F6F8FE] pt-4">
          <label class="block text-sm font-medium text-[#646D77]">{{ 'Gallery Images' | translate }}</label>
          @if (gallery().length) {
            <div class="mt-2 grid grid-cols-3 gap-2">
              @for (img of gallery(); track img.publicId) {
                <div class="relative">
                  <img [src]="img.url" [alt]="'Gallery image' | translate" class="aspect-square w-full rounded-md object-cover" />
                  <button type="button" (click)="askRemoveGallery(img.publicId)" class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">&times;</button>
                </div>
              }
            </div>
          }
          <input #galleryFileInput type="file" (change)="onGallerySelect($event)" accept="image/*" multiple class="hidden" />
          <button type="button" (click)="galleryFileInput.click()" class="btn btn-secondary btn-sm mt-2">{{ 'Select photos' | translate }}</button>
          @if (pendingGalleryFiles().length) {
            <p class="mt-1 truncate text-xs text-[#646D77]">{{ pendingGalleryFileNames() }}</p>
          }
          @if (galleryUploading()) {
            <p class="mt-1 text-xs text-salmon">{{ 'Uploading gallery...' | translate }}</p>
          }
        </div>
        </aside>
      </div>
      </form>
      <app-form-confirms
        [saveOpen]="showSaveDialog()" (save)="confirmSave()" (saveCancel)="showSaveDialog.set(false)"
        [uploadOpen]="showUploadDialog()" (upload)="confirmUpload()" (uploadCancel)="cancelUpload()"
        [deleteImageOpen]="showDeleteGalleryDialog()" (deleteImage)="confirmRemoveGallery()" (deleteImageCancel)="cancelRemoveGallery()" />
    </div>
  `,
})
export class ProductFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  private toast = inject(ToastService);
  private http = inject(HttpClient);
  private language = inject(LanguageService);
  private fb = inject(FormBuilder);

  isEdit = signal(false);
  saving = signal(false);
  submitError = signal<string | null>(null);
  categories = signal<{ id: string; name: any }[]>([]);
  showSaveDialog = signal(false);
  pendingMainFile = signal<File | null>(null);
  pendingGalleryFiles = signal<File[]>([]);
  showUploadDialog = signal(false);
  pendingDeleteGalleryId = signal<string | null>(null);
  showDeleteGalleryDialog = signal(false);
  mediaDirty = signal(false);
  imageUploading = signal(false);
  galleryUploading = signal(false);
  editorImageUploading = signal(false);
  productId = '';
  private editorRefs: Record<string, any> = {};
  private editorModulesCache: Record<string, any> = {};
  image: { url: string; publicId: string } | null = null;
  imagePreview = signal<string>('');
  gallery = signal<{ url: string; publicId: string }[]>([]);

  form = this.fb.group({
    nameEn: ['', Validators.required],
    nameAr: [''],
    descriptionEn: [''],
    descriptionAr: [''],
    richDescriptionEn: [''],
    richDescriptionAr: [''],
    price: [0, Validators.required],
    salePrice: [0],
    countInStock: [0, Validators.required],
    brandEn: [''],
    brandAr: [''],
    color: [''],
    category: ['', Validators.required],
    isFeatured: [false],
    isActive: [true],
  });

  categoryLabel(c: { name: any }): string {
    return this.language.localizedValue(c.name) || '-';
  }

  trackEditor(field: 'description' | 'richDescription', event: { lang: 'en' | 'ar'; editor: any }): void {
    this.editorRefs[`${field}${event.lang === 'en' ? 'En' : 'Ar'}`] = event.editor;
  }

  modulesFor(key: string): any {
    if (!this.editorModulesCache[key]) {
      this.editorModulesCache[key] = {
        toolbar: {
          container: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ header: 1 }, { header: 2 }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }, { align: [] }],
            ['clean'],
            ['link', 'image', 'video'],
          ],
          handlers: {
            image: () => this.selectEditorImage(key),
            video: () => this.insertEmbeddedVideo(key),
          },
        },
      };
    }
    return this.editorModulesCache[key];
  }

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}categories/`, { params: { limit: '100' } }).subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        this.categories.set(list.map((c: any) => ({ id: c._id || c.id, name: c.name })));
      },
      error: () => undefined,
    });
    this.productId = this.route.snapshot.paramMap.get('id') || '';
    if (this.productId) {
      this.isEdit.set(true);
      this.http.get<any>(`${environment.apiUrl}products/${this.productId}`).subscribe((p) => {
        const name = splitLocalized(p.name);
        const description = splitLocalized(p.description);
        const richDescription = splitLocalized(p.richDescription);
        const brand = splitLocalized(p.brand);
        this.form.setValue({
          nameEn: name.en,
          nameAr: name.ar,
          descriptionEn: description.en,
          descriptionAr: description.ar,
          richDescriptionEn: richDescription.en,
          richDescriptionAr: richDescription.ar,
          price: p.price || 0,
          salePrice: p.salePrice || 0,
          countInStock: p.countInStock || 0,
          brandEn: brand.en,
          brandAr: brand.ar,
          color: p.color || '',
          category: typeof p.category === 'object' ? p.category?.id : p.category || '',
          isFeatured: p.isFeatured || false,
          isActive: p.isActive ?? true,
        });
        if (p.image?.url) {
          this.image = { url: p.image.url, publicId: p.image.publicId || '' };
          this.imagePreview.set(p.image.url);
        }
        if (Array.isArray(p.images) && p.images.length) {
          this.gallery.set(p.images.map((i: any) => ({ url: i.url, publicId: i.publicId || (i.url as string) })));
        }
      });
    }
  }

  confirmSave(): void {
    this.showSaveDialog.set(false);
    this.submit();
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.pendingMainFile.set(file);
    this.showUploadDialog.set(true);
  }

  onGallerySelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    input.value = '';
    if (!files?.length) return;
    this.pendingGalleryFiles.set(Array.from(files));
    this.showUploadDialog.set(true);
  }

  cancelUpload(): void {
    this.pendingMainFile.set(null);
    this.pendingGalleryFiles.set([]);
    this.showUploadDialog.set(false);
  }

  confirmUpload(): void {
    const mainFile = this.pendingMainFile();
    const galleryFiles = this.pendingGalleryFiles();
    this.pendingMainFile.set(null);
    this.pendingGalleryFiles.set([]);
    this.showUploadDialog.set(false);
    if (mainFile) {
      this.imageUploading.set(true);
      const fd = new FormData();
      fd.append('image', mainFile);
      fd.append('folder', 'products');
      this.http.post<any>(`${environment.apiUrl}media/image`, fd).subscribe({
        next: (res) => { this.image = res.image; this.imagePreview.set(res.image.url); this.imageUploading.set(false); this.mediaDirty.set(true); },
        error: () => this.imageUploading.set(false),
      });
    } else if (galleryFiles.length) {
      this.galleryUploading.set(true);
      const fd = new FormData();
      galleryFiles.forEach((f) => fd.append('images', f));
      fd.append('folder', 'products/gallery');
      this.http.post<any>(`${environment.apiUrl}media/images`, fd).subscribe({
        next: (res) => { this.gallery.update((g) => [...g, ...res.images]); this.galleryUploading.set(false); this.mediaDirty.set(true); },
        error: () => this.galleryUploading.set(false),
      });
    }
  }

  pendingGalleryFileNames(): string {
    return this.pendingGalleryFiles().map((f) => f.name).join(', ');
  }

  askRemoveGallery(publicId: string): void {
    this.pendingDeleteGalleryId.set(publicId);
    this.showDeleteGalleryDialog.set(true);
  }

  confirmRemoveGallery(): void {
    const publicId = this.pendingDeleteGalleryId();
    this.cancelRemoveGallery();
    if (!publicId) return;
    this.gallery.update((g) => g.filter((img) => img.publicId !== publicId));
    this.mediaDirty.set(true);
  }

  cancelRemoveGallery(): void {
    this.pendingDeleteGalleryId.set(null);
    this.showDeleteGalleryDialog.set(false);
  }

  selectEditorImage(editorKey: string): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      this.editorImageUploading.set(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'products/editor/images');
      this.http.post<any>(`${environment.apiUrl}media/image`, formData).subscribe({
        next: (res) => {
          const editor = this.editorRefs[editorKey];
          const range = editor?.getSelection(true);
          if (editor && range && res.image?.url) {
            editor.insertEmbed(range.index, 'image', res.image.url, 'user');
            editor.setSelection(range.index + 1, 0, 'user');
          }
          this.editorImageUploading.set(false);
        },
        error: () => this.editorImageUploading.set(false),
      });
    };
    input.click();
  }

  insertEmbeddedVideo(editorKey: string): void {
    const url = window.prompt(this.language.translate('Enter the video embed URL'));
    if (!url) return;
    const editor = this.editorRefs[editorKey];
    const range = editor?.getSelection(true);
    if (editor && range) {
      editor.insertEmbed(range.index, 'video', url.trim(), 'user');
      editor.setSelection(range.index + 1, 0, 'user');
    }
  }

  submit(): void {
    if (this.imageUploading() || this.galleryUploading() || this.editorImageUploading()) return;
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
      price: v.price,
      salePrice: v.salePrice || 0,
      countInStock: v.countInStock,
      brand: joinLocalized(v.brandEn, v.brandAr),
      color: v.color,
      category: v.category,
      isFeatured: v.isFeatured,
      isActive: v.isActive,
    };
    if (this.image) body.image = this.image;

    const baseReq = this.isEdit()
      ? this.http.put<any>(`${environment.apiUrl}products/${this.productId}`, body)
      : this.http.post<any>(`${environment.apiUrl}products`, body);
    baseReq.subscribe({
      next: (res: any) => {
        const wasEdit = this.isEdit();
        const productId = wasEdit ? this.productId : (res._id || res.id);
        const finish = () => {
          this.saving.set(false);
          if (wasEdit) {
            this.form.markAsPristine();
            this.mediaDirty.set(false);
            this.toast.success('Saved successfully');
          } else {
            this.toast.success('Saved successfully');
            this.router.navigate(['/admin/products']);
          }
        };
        if (this.gallery().length) {
          this.http.put<any>(`${environment.apiUrl}products/gallery-images/${productId}`, { images: this.gallery() }).subscribe({
            next: () => finish(),
            error: () => finish(),
          });
        } else {
          finish();
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.submitError.set(err?.error?.message || 'Could not save product');
      },
    });
  }
}
