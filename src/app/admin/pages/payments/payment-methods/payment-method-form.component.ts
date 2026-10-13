import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { TranslatePipe } from '../../../../shared/i18n/translate.pipe';
import { LanguageService } from '../../../../core/services/language.service';
import { FormFieldComponent, FormFieldOption } from '../../../../shared/forms/form-field.component';
import { LocalizedFieldComponent } from '../../../../shared/forms/localized-field.component';
import { FormConfirmsComponent } from '../../../../shared/confirm-dialog/form-confirms.component';
import { joinLocalized, splitLocalized } from '../../../../shared/utils/localized';
import { DetailHeaderComponent } from '../../../../shared/ui/detail-header.component';
import { ToastService } from '../../../../shared/ui/toast.service';

interface CredField {
  key: string;
  label: string;
  secret?: boolean;
}

const PROVIDER_CREDENTIALS: Record<string, CredField[]> = {
  stripe: [
    { key: 'secret_key', label: 'Secret key', secret: true },
    { key: 'publishable_key', label: 'Publishable key' },
    { key: 'webhook_secret', label: 'Webhook signing secret', secret: true },
  ],
  paymob: [
    { key: 'secret_key', label: 'Secret key', secret: true },
    { key: 'public_key', label: 'Publishable key' },
    { key: 'integration_id', label: 'Integration id' },
    { key: 'hmac_secret', label: 'HMAC secret', secret: true },
  ],
  paypal: [
    { key: 'client_id', label: 'Client id' },
    { key: 'client_secret', label: 'Client secret', secret: true },
  ],
  cod: [],
};

const PROVIDER_LABELS: Record<string, string> = { stripe: 'Stripe', paymob: 'Paymob', paypal: 'PayPal', cod: 'Cash on Delivery' };

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

        <section class="card">
          <div class="mb-5 flex items-center justify-between gap-4">
            <h3 class="section-title">{{ 'Payment gateway' | translate }}</h3>
            @if (isEdit()) {
              <button type="button" class="btn btn-outline" [disabled]="testing()" (click)="testConnection()">
                <i class="bi bi-plug me-1"></i>{{ testing() ? ('Loading' | translate) : ('Test connection' | translate) }}
              </button>
            }
          </div>
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <app-form-field [control]="fc('provider')" [label]="'Gateway provider' | translate" type="select" [options]="providerOptions" [placeholder]="'—'"></app-form-field>
            </div>
            <div>
              <app-form-field [control]="fc('mode')" [label]="'Mode' | translate" type="select" [options]="modeOptions" [placeholder]="'—'"></app-form-field>
            </div>
          </div>
          @if (credentialFields().length > 0) {
            <div class="mt-5">
              <p class="text-sm font-medium text-[#646D77]">{{ 'Gateway credentials' | translate }}</p>
              <p class="mt-0.5 text-xs text-[#797979]">{{ 'Stored keys are never read back. Leave blank to keep the current value.' | translate }}</p>
              <div class="mt-3 space-y-4">
                @for (f of credentialFields(); track f.key) {
                  <app-form-field [control]="credentialsControl(f.key)" [label]="f.label" [type]="f.secret ? 'password' : 'text'" [id]="'cred-' + f.key"></app-form-field>
                }
              </div>
            </div>
          }
          <div class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <app-form-field [control]="fc('supportedCurrencies')" [label]="'Supported currencies' | translate" [placeholder]="'EGP, USD'"></app-form-field>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <app-form-field [control]="fc('minAmount')" [label]="'Minimum amount' | translate" type="number"></app-form-field>
              <app-form-field [control]="fc('maxAmount')" [label]="'Maximum amount' | translate" type="number"></app-form-field>
            </div>
          </div>
          <p class="mt-1 text-xs text-[#797979]">{{ '0 = no limit. Leave blank to allow any amount.' | translate }}</p>
          <div class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <app-form-field [control]="fc('sortOrder')" [label]="'Sort order' | translate" type="number"></app-form-field>
            </div>
            <div class="flex items-end pb-1">
              <app-form-field [control]="fc('supportsRefund')" [type]="'checkbox'" [checkboxLabel]="('Supports refunds' | translate)"></app-form-field>
            </div>
          </div>
          <div class="mt-5">
            <app-localized-field
              [label]="'Instructions for the customer' | translate"
              mode="textarea"
              [rows]="3"
              [controlEn]="fc('instructionsEn')"
              [controlAr]="fc('instructionsAr')"
              [placeholder]="'Pay via your card...'">
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
            <app-form-field [control]="fc('isActive')" [type]="'checkbox'" [checkboxLabel]="activeLabel()" id="method-active"></app-form-field>
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
  private language = inject(LanguageService);

  isEdit = signal(false);
  saving = signal(false);
  testing = signal(false);
  submitError = signal<string | null>(null);
  methodId = '';
  form: FormGroup;
  credentialFields = signal<CredField[]>([]);

  providerOptions: FormFieldOption[] = ['stripe', 'paymob', 'paypal', 'cod'].map((p) => ({ value: p, label: PROVIDER_LABELS[p] || p }));
  modeOptions: FormFieldOption[] = [
    { value: 'test', label: 'Test' },
    { value: 'live', label: 'Live' },
  ];

  private maskedCredentials: Record<string, string> = {};

  fc(key: string): FormControl {
    return this.form.controls[key] as FormControl;
  }

  credentialsControl(key: string): FormControl | null {
    const group = this.form.controls['credentials'] as FormGroup | undefined;
    return group ? (group.controls[key] as FormControl) ?? null : null;
  }

  activeLabel(): string {
    return this.language.translate(this.fc('isActive').value ? 'Active' : 'Inactive');
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
      provider: ['', Validators.required],
      mode: ['test'],
      credentials: this.fb.group({}),
      supportedCurrencies: [''],
      minAmount: [null],
      maxAmount: [null],
      sortOrder: [0],
      supportsRefund: [true],
      instructionsEn: [''],
      instructionsAr: [''],
    });
    this.fc('credentials');
    this.fc('provider').valueChanges.subscribe((p: string) => this.rebuildCredentials(p || ''));
    this.rebuildCredentials(this.fc('provider').value || '');
  }

  private rebuildCredentials(provider: string): void {
    const fields = PROVIDER_CREDENTIALS[provider] || [];
    const controls: Record<string, unknown> = {};
    for (const f of fields) {
      controls[f.key] = [this.maskedCredentials[f.key] || ''];
    }
    this.form.setControl('credentials', this.fb.group(controls));
    this.credentialFields.set(fields);
  }

  ngOnInit(): void {
    this.methodId = this.route.snapshot.paramMap.get('id') || '';
    if (this.methodId) {
      this.isEdit.set(true);
      this.http.get<any>(`${environment.apiUrl}payment-methods/${this.methodId}`).subscribe((m) => {
        const name = splitLocalized(m.name);
        const description = splitLocalized(m.description);
        const instructions = splitLocalized(m.instructions);
        this.maskedCredentials = m.credentials || {};
        this.form.patchValue({
          nameEn: name.en,
          nameAr: name.ar,
          code: m.code || '',
          descriptionEn: description.en,
          descriptionAr: description.ar,
          icon: m.icon || '',
          color: m.color || '#6366F1',
          isActive: m.isActive ?? true,
          provider: m.provider || '',
          mode: m.mode || 'test',
          supportedCurrencies: Array.isArray(m.supportedCurrencies) ? m.supportedCurrencies.join(', ') : (m.supportedCurrencies || ''),
          minAmount: m.minAmount ?? null,
          maxAmount: m.maxAmount ?? null,
          sortOrder: m.sortOrder ?? 0,
          supportsRefund: m.supportsRefund ?? true,
          instructionsEn: instructions.en,
          instructionsAr: instructions.ar,
        });
      });
    }
  }

  showSaveDialog = signal(false);

  confirmSave(): void {
    this.showSaveDialog.set(false);
    this.submit();
  }

  testConnection(): void {
    this.testing.set(true);
    this.http.post<any>(`${environment.apiUrl}payment-methods/${this.methodId}/test`, {}).subscribe({
      next: (res) => {
        this.testing.set(false);
        if (res?.ok) {
          this.toast.success(res?.message || 'Connection OK');
        } else {
          this.toast.error(res?.message || 'Connection test failed');
        }
      },
      error: (err) => {
        this.testing.set(false);
        this.toast.error(err?.error?.message || 'Connection test failed');
      },
    });
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
    const rawCreds = (this.form.controls['credentials'] as FormGroup)?.getRawValue() || {};
    const credentials: Record<string, string> = {};
    for (const key of Object.keys(rawCreds)) {
      const val = String(rawCreds[key] ?? '').trim();
      if (val && !val.includes('••••')) credentials[key] = val;
    }
    const body: any = {
      name: joinLocalized(v.nameEn, v.nameAr),
      code: v.code.trim().toLowerCase(),
      description: joinLocalized(v.descriptionEn, v.descriptionAr),
      icon: v.icon,
      color: v.color,
      isActive: v.isActive,
      provider: v.provider,
      mode: v.mode,
      credentials,
      supportedCurrencies: v.supportedCurrencies
        ? v.supportedCurrencies.split(',').map((s: string) => s.trim().toUpperCase()).filter(Boolean)
        : [],
      minAmount: v.minAmount === null || v.minAmount === '' ? undefined : Number(v.minAmount),
      maxAmount: v.maxAmount === null || v.maxAmount === '' ? undefined : Number(v.maxAmount),
      sortOrder: Number(v.sortOrder ?? 0),
      supportsRefund: v.supportsRefund,
      instructions: joinLocalized(v.instructionsEn, v.instructionsAr),
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