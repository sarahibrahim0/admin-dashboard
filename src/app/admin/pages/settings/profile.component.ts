import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EntityService } from '../../../core/services/entity.service';
import { AuthStore } from '../../../core/stores/auth.store';
import { environment } from '../../../../environments/environment';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';
import { FormFieldComponent } from '../../../shared/forms/form-field.component';
import { LocalizedFieldComponent } from '../../../shared/forms/localized-field.component';
import { CountrySelectComponent } from '../../../shared/forms/country-select.component';
import { FormConfirmsComponent } from '../../../shared/confirm-dialog/form-confirms.component';
import { ToastService } from '../../../shared/ui/toast.service';
import { joinLocalized, splitLocalized } from '../../../shared/utils/localized';
import { DetailHeaderComponent } from '../../../shared/ui/detail-header.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, FormFieldComponent, LocalizedFieldComponent, CountrySelectComponent, DetailHeaderComponent, FormConfirmsComponent],
  template: `
    <div class="w-full space-y-6">
      <app-detail-header title="{{ 'Admin Profile' | translate }}"
        subtitle="{{ 'Update account details' | translate }}" eyebrow="Account" />
      <form [formGroup]="form" (ngSubmit)="showSaveDialog.set(true)">
      <div class="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div class="min-w-0 space-y-4 card">
        <app-localized-field
          [label]="'Name' | translate"
          mode="text"
          [required]="true"
          [controlEn]="form.controls.nameEn"
          [controlAr]="form.controls.nameAr"
          [placeholder]="'Full name' | translate"
          [placeholderAr]="'الاسم بالكامل'"
          [id]="'profile-name'">
        </app-localized-field>
        <app-form-field
          [control]="form.controls.email"
          [label]="'Email' | translate"
          [type]="'email'"
          [required]="true"
          [id]="'profile-email'">
        </app-form-field>
        <app-form-field
          [control]="form.controls.phone"
          [label]="'Phone' | translate"
          [required]="true"
          [id]="'profile-phone'">
        </app-form-field>
        <app-form-field
          [control]="form.controls.password"
          [label]="'New password' | translate"
          [type]="'password'"
          [placeholder]="'Leave blank to keep current password' | translate"
          [id]="'profile-password'">
        </app-form-field>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <app-form-field
            [control]="form.controls.city"
            [label]="'City' | translate"
            [id]="'profile-city'">
          </app-form-field>
          <app-country-select
            [control]="form.controls.country"
            [label]="'Country' | translate"
            [placeholder]="'Select country' | translate"
            [id]="'profile-country'">
          </app-country-select>
        </div>
        <div class="flex items-center justify-end border-t border-[#F6F8FE] pt-4">
          <button type="submit" [disabled]="saving() || uploading() || form.invalid" class="btn btn-primary">{{ saving() ? ('Saving...' | translate) : ('Save profile' | translate) }}</button>
        </div>
        </div>
        <aside class="card relative min-w-0 self-start text-center">
          <div class="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-blue-black text-4xl font-bold text-white">
            @if (imagePreview()) {
              <img [src]="imagePreview()" [alt]="'Admin profile' | translate" class="h-full w-full object-cover" />
            } @else {
              {{ (displayName() || 'A').charAt(0).toUpperCase() }}
            }
          </div>
          <label class="mt-4 block text-sm font-semibold text-[#646D77]">{{ 'Profile picture' | translate }}</label>
          <input #fileInput type="file" (change)="onImageSelect($event)" accept="image/*" class="hidden" />
          <button type="button" (click)="fileInput.click()" class="btn btn-secondary btn-sm mt-2">{{ 'Select photo' | translate }}</button>
          @if (selectedFileName()) { <p class="mt-1 truncate text-xs text-[#646D77]">{{ selectedFileName() }}</p> }
          @if (uploading()) { <p class="mt-1 text-xs text-salmon">{{ 'Uploading picture...' | translate }}</p> }
          <p class="mt-1 text-xs text-[#797979]">{{ 'Use a square image for the best result.' | translate }}</p>
        </aside>
      </div>
      </form>
      <app-form-confirms
        [saveOpen]="showSaveDialog()" (save)="confirmSave()" (saveCancel)="showSaveDialog.set(false)"
        [uploadOpen]="showUploadDialog()" (upload)="confirmUpload()" (uploadCancel)="cancelUpload()" />
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  private entityService = inject(EntityService);
  private http = inject(HttpClient);
  private auth = inject(AuthStore);
  private language = inject(LanguageService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  saving = signal(false);
  uploading = signal(false);
  showSaveDialog = signal(false);
  pendingFile = signal<File | null>(null);
  showUploadDialog = signal(false);
  selectedFileName = signal('');
  mediaDirty = signal(false);

  confirmSave(): void {
    this.showSaveDialog.set(false);
    this.save();
  }
  image: { url: string; publicId: string } | null = null;
  imagePreview = signal('');

  form = this.fb.group({
    nameEn: ['', Validators.required],
    nameAr: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    password: [''],
    city: [''],
    country: [''],
  });

  displayName(): string {
    return this.language.localizedValue({
      en: this.form.controls.nameEn.value,
      ar: this.form.controls.nameAr.value,
    });
  }

  ngOnInit(): void {
    this.entityService.getRoot<any>('users/profile').subscribe((user) => {
      const name = splitLocalized(user.name);
      this.form.patchValue({
        nameEn: name.en,
        nameAr: name.ar,
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        city: user.city || '',
        country: user.country || '',
      });
      if (user.image?.url) {
        this.image = user.image;
        this.imagePreview.set(user.image.url);
      }
    });
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.pendingFile.set(file);
    this.selectedFileName.set(file.name);
    this.showUploadDialog.set(true);
  }

  cancelUpload(): void {
    this.pendingFile.set(null);
    this.selectedFileName.set('');
    this.showUploadDialog.set(false);
  }

  confirmUpload(): void {
    const file = this.pendingFile();
    this.pendingFile.set(null);
    this.selectedFileName.set('');
    this.showUploadDialog.set(false);
    if (!file) return;
    this.uploading.set(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'admins');
    this.http.post<any>(`${environment.apiUrl}media/image`, formData).subscribe({
      next: (response) => {
        this.image = response.image;
        this.imagePreview.set(response.image.url);
        const currentUser = this.auth.user();
        if (currentUser) this.auth.user.set({ ...currentUser, image: response.image });
        this.uploading.set(false);
        this.mediaDirty.set(true);
      },
      error: () => this.uploading.set(false),
    });
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.form.pristine && !this.mediaDirty()) {
      this.toast.info('No changes to save');
      return;
    }
    this.saving.set(true);
    const v = this.form.getRawValue();
    const body: any = {
      ...v,
      name: joinLocalized(v.nameEn, v.nameAr),
    };
    delete body.nameEn;
    delete body.nameAr;
    if (!body.password) delete body.password;
    if (this.image) body.image = this.image;
    this.entityService.updateRoot<any>('users/profile', body).subscribe({
      next: (user) => {
        this.auth.user.set(this.image && !user.image ? { ...user, image: this.image } : user);
        this.form.controls.password.setValue('');
        this.form.markAsPristine();
        this.mediaDirty.set(false);
        this.toast.success('Profile saved');
        this.saving.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Could not save profile');
        this.saving.set(false);
      },
    });
  }
}