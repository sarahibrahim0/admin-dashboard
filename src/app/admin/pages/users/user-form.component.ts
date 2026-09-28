import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';
import { FormFieldComponent, FormFieldConfig } from '../../../shared/forms/form-field.component';
import { LocalizedFieldComponent } from '../../../shared/forms/localized-field.component';
import { CountrySelectComponent } from '../../../shared/forms/country-select.component';
import { AuthStore } from '../../../core/stores/auth.store';
import { FormConfirmsComponent } from '../../../shared/confirm-dialog/form-confirms.component';
import { joinLocalized, splitLocalized } from '../../../shared/utils/localized';

import { DetailHeaderComponent } from '../../../shared/ui/detail-header.component';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, FormFieldComponent, LocalizedFieldComponent, CountrySelectComponent, DetailHeaderComponent, FormConfirmsComponent],
  template: `
    <div class="w-full space-y-6">
      <app-detail-header title="{{ isEdit() ? ('Edit user' | translate) : ('New user' | translate) }}"
        eyebrow="{{ isEdit() ? ('Update account' | translate) : ('Add to team' | translate) }}"
        backLabel="Back to users" backTo="/admin/users"
        saveLabel="Save user" cancelTo="/admin/users" [saving]="saving()" (save)="showSaveDialog.set(true)" />
      <form id="user-form" [formGroup]="form" (ngSubmit)="showSaveDialog.set(true)" class="space-y-6">
        <section class="card">
          <h3 class="section-title mb-5">{{ 'User details' | translate }}</h3>
          @if (submitError()) {
            <div class="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#ff4545]">{{ submitError() }}</div>
          }
          <app-localized-field
            [label]="'Name' | translate"
            mode="text"
            [required]="true"
            [controlEn]="form.controls.nameEn"
            [controlAr]="form.controls.nameAr"
            [placeholder]="'Full name' | translate"
            [placeholderAr]="'الاسم بالكامل'"
            [id]="'user-name'">
          </app-localized-field>
          <div class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <app-form-field [form]="form" [fields]="personalFields"></app-form-field>
          </div>
          <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <app-form-field [form]="form" [fields]="contactFields"></app-form-field>
            <app-country-select [control]="form.controls.country" [label]="'Country' | translate" [placeholder]="'Select country' | translate" [id]="'user-country'"></app-country-select>
          </div>
          <div class="mt-6">
            <app-form-field
              [control]="form.controls.isActive"
              [type]="'checkbox'"
              [checkboxLabel]="('Status' | translate) + ' (' + ((form.controls.isActive.value ? 'Active' : 'Inactive') | translate) + ')'"
              [id]="'user-active'">
            </app-form-field>
          </div>
          <div class="mt-6">
            <label class="block text-sm font-medium text-[#646D77]">{{ 'Password' | translate }}</label>
            @if (isEdit()) {
              <p class="mt-1 text-xs text-[#646D77]">{{ 'Leave blank to keep current password' | translate }}</p>
            }
            <input [formControl]="form.controls.password" name="password" type="password" [placeholder]="'Password' | translate"
              class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
          </div>
        </section>
      </form>
      <app-form-confirms [saveOpen]="showSaveDialog()" (save)="confirmSave()" (saveCancel)="showSaveDialog.set(false)" />
    </div>
  `,
})
export class UserFormComponent implements OnInit {
private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  private http = inject(HttpClient);
  private auth = inject(AuthStore);
  private toast = inject(ToastService);
  private language = inject(LanguageService);

  isEdit = signal(false);
  saving = signal(false);
  submitError = signal<string | null>(null);
  showSaveDialog = signal(false);
  userId = '';

  confirmSave(): void {
    this.showSaveDialog.set(false);
    this.submit();
  }

  personalFields: FormFieldConfig[] = [
    { key: 'email', label: 'Email', type: 'email', placeholder: 'Email address', required: true },
    { key: 'phone', label: 'Phone', type: 'text', placeholder: 'Phone number', required: true },
  ];

  contactFields: FormFieldConfig[] = [
    { key: 'city', label: 'City', type: 'text', placeholder: 'City' },
  ];

  form = this.fb.group({
    nameEn: ['', Validators.required],
    nameAr: [''],
    isActive: [true],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    password: [''],
    city: [''],
    country: [''],
  });

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (this.userId) {
      this.isEdit.set(true);
      this.http.get<any>(`${environment.apiUrl}users/${this.userId}`).subscribe((u) => {
        const name = splitLocalized(u.name);
        this.form.patchValue({
          nameEn: name.en,
          nameAr: name.ar,
          isActive: u.isActive ?? true,
          email: u.email || '',
          phone: u.phone || '',
          city: u.city || '',
          country: u.country || '',
        });
      });
    }
  }

  submit(): void {
    if (this.saving()) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.form.pristine) {
      this.toast.info('No changes to save');
      return;
    }
    this.saving.set(true);
    this.submitError.set(null);
    const v = this.form.getRawValue();
    const body: any = {
      ...v,
      name: joinLocalized(v.nameEn, v.nameAr),
    };
    delete body.nameEn;
    delete body.nameAr;
    // Never let an admin deactivate their own account (would lock them out).
    if (this.isEdit() && this.userId && this.userId === this.auth.userId()) {
      body.isActive = true;
    }
    const req = this.isEdit()
      ? this.http.put<any>(`${environment.apiUrl}users/${this.userId}`, body)
      : this.http.post<any>(`${environment.apiUrl}users`, body);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        if (this.isEdit()) {
          this.form.markAsPristine();
          this.toast.success('Saved successfully');
        } else {
          this.toast.success('Saved successfully');
          this.router.navigate(['/admin/users']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.submitError.set(err?.error?.message || 'Could not save user');
      },
    });
  }
}
