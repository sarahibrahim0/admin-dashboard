import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { TranslatePipe } from '../../../../shared/i18n/translate.pipe';
import { FormFieldComponent } from '../../../../shared/forms/form-field.component';
import { LocalizedFieldComponent } from '../../../../shared/forms/localized-field.component';
import { FormConfirmsComponent } from '../../../../shared/confirm-dialog/form-confirms.component';
import { joinLocalized, splitLocalized } from '../../../../shared/utils/localized';
import { DetailHeaderComponent } from '../../../../shared/ui/detail-header.component';
import { ToastService } from '../../../../shared/ui/toast.service';

@Component({
  selector: 'app-payment-method-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, FormFieldComponent, LocalizedFieldComponent, DetailHeaderComponent, FormConfirmsComponent],
  template: `
    <div class="w-full space-y-6">
      <app-detail-header title="{{ isEdit() ? ('Edit payment method' | translate) : ('New payment method' | translate) }}"
        eyebrow="{{ 'Payments' | translate }}"
        backLabel="Back to payment methods" backTo="/admin/payments/methods"
        saveLabel="Save payment method" cancelTo="/admin/payments/methods" [saving]="saving()" (save)="showSaveDialog.set(true)" />
      <form id="payment-method-form" [formGroup]="form" (ngSubmit)="showSaveDialog.set(true)">
      <div class="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div class="min-w-0 space-y-6">
        <section class="card">
          <h3 class="section-title mb-5">{{ 'Payment method details' | translate }}</h3>
          @if (submitError()) {
            <div class="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#ff4545]">{{ submitError() }}</div>
          }
          <app-localized-field
            [label]="'Name' | translate"
            mode="text"
            [required]="true"
            [controlEn]="fc('nameEn')"
            [controlAr]="fc('nameAr')"
            [placeholder]="'Cash on Delivery' | translate"
            [placeholderAr]="'الدفع عند الاستلام'"
            [id]="'method-name'">
          </app-localized-field>
          <div class="mt-5">
            <app-form-field
              [control]="fc('code')"
              [label]="'Code' | translate"
              [placeholder]="'cod'"
              [required]="true"
              id="method-code"></app-form-field>
            <p class="mt-1 text-xs text-[#797979]">{{ 'A unique machine key the storefront uses (e.g. cod, paymob, fawry, mada, tabby).' | translate }}</p>
          </div>
          <div class="mt-5">
            <app-localized-field
              [label]="'Description' | translate"
              mode="textarea"
              [rows]="3"
              [controlEn]="fc('descriptionEn')"
              [controlAr]="fc('descriptionAr')"
              [placeholder]="'Pay when your order is delivered...' | translate"
              [placeholderAr]="'ادفع عند استلام طلبك...'">
            </app-localized-field>
          </div>
        </section>
        </div>
        <aside class="card relative min-w-0 self-start">
          <h3 class="section-title mb-5">{{ 'Appearance' | translate }}</h3>
          <app-form-field [control]="fc('icon')" [label]="'Icon' | translate" [placeholder]="'💳'" id="method-icon"></app-form-field>
          <div class="mt-4">
            <app-form-field [control]="fc('color')" [label]="'Color' | translate" type="color" id="method-color"></app-form-field>
          </div>
          <div class="mt-4">
            <app-form-field [control]="fc('isActive')" [type]="'checkbox'" [checkboxLabel]="('Status' | translate) + ' (' + ((fc('isActive').value ? 'Active' : 'Inactive') | translate) + ')'" id="method-active"></app-form-field>
          </div>
          <div class="mt-4 flex items-center gap-2 rounded-md border border-[#F6F8FE] bg-[#FAFBFF] px-3 py-2.5 text-sm">
            <span class="text-lg">{{ fc('icon').value || '💳' }}</span>
            <span class="font-medium text-[#18181B]">{{ fc('nameEn').value || (fc('nameAr').value || '—') }}</span>
          </div>
        </aside>
      </div>
      </form>
      <app-form-confirms
        [saveOpen]="showSaveDialog()" (save)="confirmSave()" (saveCancel)="showSaveDialog.set(false)" />
    </div>
  `,
})
export class PaymentMethodFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  private toast = inject(ToastService);
  private http = inject(HttpClient);

  isEdit = signal(false);
  saving = signal(false);
  submitError = signal<string | null>(null);
  methodId = '';
  form: FormGroup;

  fc(key: string): FormControl {
    return this.form.controls[key] as FormControl;
  }

  constructor() {
    this.form = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: [''],
      code: ['', [Validators.required, Validators.pattern(/^[a-z0-9_-]+$/)]],
      descriptionEn: [''],
      descriptionAr: [''],
      icon: [''],
      color: ['#6366F1'],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.methodId = this.route.snapshot.paramMap.get('id') || '';
    if (this.methodId) {
      this.isEdit.set(true);
      this.http.get<any>(`${environment.apiUrl}payment-methods/${this.methodId}`).subscribe((m) => {
        const name = splitLocalized(m.name);
        const description = splitLocalized(m.description);
        this.form.patchValue({
          nameEn: name.en,
          nameAr: name.ar,
          code: m.code || '',
          descriptionEn: description.en,
          descriptionAr: description.ar,
          icon: m.icon || '',
          color: m.color || '#6366F1',
          isActive: m.isActive ?? true,
        });
      });
    }
  }

  showSaveDialog = signal(false);

  confirmSave(): void {
    this.showSaveDialog.set(false);
    this.submit();
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.form.pristine) {
      this.toast.info('No changes to save');
      return;
    }
    this.saving.set(true);
    this.submitError.set(null);
    const v = this.form.getRawValue();
    const body: any = {
      name: joinLocalized(v.nameEn, v.nameAr),
      code: v.code.trim().toLowerCase(),
      description: joinLocalized(v.descriptionEn, v.descriptionAr),
      icon: v.icon,
      color: v.color,
      isActive: v.isActive,
    };
    const req = this.isEdit()
      ? this.http.put<any>(`${environment.apiUrl}payment-methods/${this.methodId}`, body)
      : this.http.post<any>(`${environment.apiUrl}payment-methods`, body);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        if (this.isEdit()) {
          this.form.markAsPristine();
          this.toast.success('Saved successfully');
        } else {
          this.toast.success('Saved successfully');
          this.router.navigate(['/admin/payments/methods']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.submitError.set(err?.error?.message || 'Could not save payment method');
      },
    });
  }
}