import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { EntityService } from '../../../core/services/entity.service';
import { MediaService } from '../../../core/services/media.service';
import { normalizeApiError } from '../../../core/services/api-error';
import { AuthStore } from '../../../core/stores/auth.store';
import { Role, User } from '../../../core/models';
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
        <div>
          <label class="block text-sm font-medium text-[#646D77]" for="profile-role">{{ 'Role' | translate }}</label>
          <select id="profile-role" [formControl]="form.controls.role"
            class="mt-1 w-full rounded-md border border-[#c9c9c9] bg-white px-3 py-2 text-sm outline-none focus:border-salmon">
            <option value="">{{ 'No role' | translate }}</option>
            @for (role of roles(); track role._id || role.id) {
              <option [value]="role._id || role.id">{{ roleName(role) }}</option>
            }
          </select>
          @if (rolesLoading()) {
            <p class="mt-1 text-xs text-[#646D77]">{{ 'Loading roles...' | translate }}</p>
          }
        </div>
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
          @if (uploading()) {
            <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div class="h-full rounded-full bg-primary transition-all duration-200" [style.width.%]="uploadPercent()"></div>
            </div>
            <p class="mt-1 text-xs text-salmon">{{ 'Uploading picture...' | translate }} {{ uploadPercent() }}%</p>
          }
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
  private media = inject(MediaService);
  private auth = inject(AuthStore);
  private language = inject(LanguageService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  saving = signal(false);
  uploading = signal(false);
  uploadPercent = signal(0);
  showSaveDialog = signal(false);
  pendingFile = signal<File | null>(null);
  showUploadDialog = signal(false);
  selectedFileName = signal('');
  mediaDirty = signal(false);
  roles = signal<Role[]>([]);
  rolesLoading = signal(false);

  confirmSave(): void {
    this.showSaveDialog.set(false);
    this.save();
  }
  image: { url: string; publicId?: string } | null = null;
  imagePreview = signal('');

  form = this.fb.group({
    nameEn: ['', Validators.required],
    nameAr: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    password: [''],
    city: [''],
    country: [''],
    role: [''],
  });

  roleName(role: Role): string {
    return this.language.localizedValue(role.name) || role.name || '-';
  }

  displayName(): string {
    return this.language.localizedValue({
      en: this.form.controls.nameEn.value,
      ar: this.form.controls.nameAr.value,
    });
  }

  ngOnInit(): void {
    this.patch(this.auth.user());
    this.loadRoles();
    void this.auth.loadProfile().then(
      (user) => this.patch(user),
      (err) => {
        // Only surface a problem when there is genuinely nothing to show: the
        // store already holds the admin, so a failed refresh is not a failure
        // of this page.
        if (!this.auth.user() && !this.form.controls.nameEn.value) {
          this.toast.error(normalizeApiError(err).message);
        }
      },
    );
  }

  private patch(user: User | null): void {
    if (!user) return;
    const name = splitLocalized(user.name);
    this.form.patchValue({
      nameEn: name.en,
      nameAr: name.ar,
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      city: user.city || '',
      country: user.country || '',
      role: this.roleId(user.role),
    });
    if (user.image?.url) {
      this.image = user.image;
      this.imagePreview.set(user.image.url);
    }
  }

  private loadRoles(): void {
    this.rolesLoading.set(true);
    this.entityService.listPaginated<Role>('roles', { limit: '200' }).subscribe({
      next: (res) => this.roles.set(res.data),
      error: (err) => {
        this.toast.error(normalizeApiError(err).message);
        this.rolesLoading.set(false);
      },
      complete: () => this.rolesLoading.set(false),
    });
  }

  private roleId(role: Role | string | null | undefined): string {
    return typeof role === 'string' ? role : role?._id || role?.id || '';
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!this.media.validateImages([file])) return;
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
    this.uploadPercent.set(0);
    this.media.uploadImage(file, 'admins', (pct) => this.uploadPercent.set(pct)).subscribe({
      next: (image) => {
        this.image = image;
        this.imagePreview.set(image.url);
        const currentUser = this.auth.user();
        if (currentUser) this.auth.user.set({ ...currentUser, image });
        this.uploading.set(false);
        this.mediaDirty.set(true);
        this.toast.success('Photo uploaded');
      },
      error: () => this.uploading.set(false),
    });
  }

  async save(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.form.pristine && !this.mediaDirty()) {
      this.toast.info('No changes to save');
      return;
    }
    this.saving.set(true);
    const v = this.form.getRawValue();
    const currentUser = this.auth.user();
    const currentRoleId = this.roleId(currentUser?.role);
    const selectedRoleId = v.role || '';
    const roleChanged = selectedRoleId !== currentRoleId;
    const body: Record<string, unknown> = {
      ...v,
      name: joinLocalized(v.nameEn, v.nameAr),
    };
    delete body['nameEn'];
    delete body['nameAr'];
    delete body['role'];
    if (!body['password']) delete body['password'];
    if (this.image) body['image'] = this.image;

    try {
      const user = await this.saveProfileAndRole(body, selectedRoleId, roleChanged, currentUser);
      this.auth.user.set(this.image && !user.image ? { ...user, image: this.image } : user);
      this.form.controls.password.setValue('');
      this.form.markAsPristine();
      this.mediaDirty.set(false);
      this.toast.success('Profile saved');
    } catch (err: any) {
      this.toast.error(
        err?.profileSaved
          ? 'Profile saved, but role could not be updated'
          : normalizeApiError(err).message,
      );
    } finally {
      this.saving.set(false);
    }
  }

  private async saveProfileAndRole(
    body: Record<string, unknown>,
    selectedRoleId: string,
    roleChanged: boolean,
    currentUser: User | null,
  ): Promise<User> {
    const savedUser = await this.auth.saveProfile(body);
    if (!roleChanged) return savedUser;

    const userId = this.auth.userId() || currentUser?.id || currentUser?._id;
    if (!userId) {
      throw Object.assign(new Error('Profile saved, but role could not be updated'), {
        profileSaved: true,
      });
    }

    try {
      const response = await firstValueFrom(
        this.entityService.update<User>('users', userId, { role: selectedRoleId || null }),
      );
      const selectedRole = this.roles().find(
        (role) => (role._id || role.id) === selectedRoleId,
      );
      const responseRole =
        response?.role && typeof response.role === 'object' ? response.role : undefined;
      return {
        ...savedUser,
        role: selectedRoleId ? selectedRole || responseRole || savedUser.role : undefined,
      };
    } catch (err) {
      throw Object.assign(
        err instanceof Error ? err : new Error(normalizeApiError(err).message),
        { profileSaved: true },
      );
    }
  }
}