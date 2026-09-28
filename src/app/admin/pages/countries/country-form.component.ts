import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { FormFieldComponent } from '../../../shared/forms/form-field.component';
import { LocalizedFieldComponent } from '../../../shared/forms/localized-field.component';
import { FormConfirmsComponent } from '../../../shared/confirm-dialog/form-confirms.component';
import { EntityService } from '../../../core/services/entity.service';
import { LanguageService } from '../../../core/services/language.service';
import { joinLocalized, splitLocalized } from '../../../shared/utils/localized';
import { DetailHeaderComponent } from '../../../shared/ui/detail-header.component';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
  selector: 'app-country-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, FormFieldComponent, LocalizedFieldComponent, DetailHeaderComponent, FormConfirmsComponent],
  template: `
    <div class="w-full space-y-6">
      <app-detail-header title="{{ isEdit() ? ('Edit country' | translate) : ('New country' | translate) }}"
        eyebrow="{{ 'Payments' | translate }}"
        backLabel="Back to countries" backTo="/admin/countries"
        saveLabel="Save country" cancelTo="/admin/countries" [saving]="saving()" [disabled]="loadingRefs()" (save)="showSaveDialog.set(true)" />
      <form id="country-form" [formGroup]="form" (ngSubmit)="showSaveDialog.set(true)">
      <div class="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div class="min-w-0 space-y-6">
        <section class="card">
          <h3 class="section-title mb-5">{{ 'Country information' | translate }}</h3>
          @if (submitError()) {
            <div class="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#ff4545]">{{ submitError() }}</div>
          }
          <app-localized-field
            [label]="'Name' | translate"
            mode="text"
            [required]="true"
            [controlEn]="fc('nameEn')"
            [controlAr]="fc('nameAr')"
            [placeholder]="'Egypt' | translate"
            [placeholderAr]="'مصر'"
            [id]="'country-name'">
          </app-localized-field>
          <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <app-form-field [control]="fc('code')" [label]="'Country code' | translate" [placeholder]="'EG'" [required]="true" id="country-code"></app-form-field>
            <app-form-field [control]="fc('phoneCode')" [label]="'Phone code' | translate" [placeholder]="'+20'" id="country-phone"></app-form-field>
            <app-form-field [control]="fc('flag')" [label]="'Flag' | translate" [placeholder]="'🇪🇬'" id="country-flag"></app-form-field>
          </div>
        </section>

        <section class="card">
          <h3 class="section-title mb-5">{{ 'Currency' | translate }}</h3>
          <app-form-field
            [control]="fc('currencyId')"
            [label]="'Currency' | translate"
            type="select"
            [options]="currencyOptions"
            [placeholder]="'Select a currency' | translate"
            id="country-currency">
          </app-form-field>
          <p class="mt-2 text-xs text-[#797979]">{{ 'The currency customers are charged in for this country.' | translate }}</p>
        </section>

        <section class="card">
          <h3 class="section-title mb-5">{{ 'Payment methods' | translate }}</h3>
          <p class="mb-4 text-sm text-[#646D77]">{{ 'Select the payment methods available to customers in this country.' | translate }}</p>
          @if (paymentMethods().length) {
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
              @for (m of paymentMethods(); track m._id || m.id) {
                <label class="flex cursor-pointer items-center gap-2.5 rounded-md border border-[#F6F8FE] bg-[#fafbfc] px-3 py-2.5 text-sm">
                  <input
                    type="checkbox"
                    class="h-4 w-4 cursor-pointer accent-[#6366F1]"
                    [checked]="isMethodSelected(methodId(m))"
                    (change)="toggleMethod(methodId(m))" />
                  <span class="text-base">{{ m.icon || '💳' }}</span>
                  <span class="truncate font-medium text-[#18181B]">{{ language.localizedValue(m.name) }}</span>
                </label>
              }
            </div>
          } @else {
            <div class="flex items-center justify-between rounded-md border border-[#F6F8FE] bg-[#FAFBFF] px-4 py-3 text-sm text-[#646D77]">
              {{ 'No payment methods yet' | translate }}
              <a routerLink="/admin/payments/methods" class="font-medium text-[#6366F1] hover:underline">{{ 'Add payment methods' | translate }}</a>
            </div>
          }
        </section>
        </div>
        <aside class="card relative min-w-0 self-start">
          <h3 class="section-title mb-5">{{ 'Status' | translate }}</h3>
          <app-form-field [control]="fc('isActive')" [type]="'checkbox'" [checkboxLabel]="('Status' | translate) + ' (' + ((fc('isActive').value ? 'Active' : 'Inactive') | translate) + ')'" id="country-active"></app-form-field>
          <div class="mt-4 flex items-center gap-2 rounded-md border border-[#F6F8FE] bg-[#FAFBFF] px-3 py-2.5 text-sm">
            <span class="text-xl leading-none">{{ fc('flag').value || '🌍' }}</span>
            <span class="font-medium text-[#18181B]">{{ fc('nameEn').value || (fc('nameAr').value || '—') }}</span>
            <span class="ms-auto text-[#797979]">{{ fc('phoneCode').value || '' }}</span>
          </div>
        </aside>
      </div>
      </form>
      <app-form-confirms
        [saveOpen]="showSaveDialog()" (save)="confirmSave()" (saveCancel)="showSaveDialog.set(false)" />
    </div>
  `,
})
export class CountryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  private toast = inject(ToastService);
  private http = inject(HttpClient);
  private entityService = inject(EntityService);
  language = inject(LanguageService);

  isEdit = signal(false);
  saving = signal(false);
  loadingRefs = signal(true);
  submitError = signal<string | null>(null);
  countryId = '';
  currencies = signal<any[]>([]);
  paymentMethods = signal<any[]>([]);
  currencyOptions: { value: string; label: string }[] = [];
  form: FormGroup;

  fc(key: string): FormControl {
    return this.form.controls[key] as FormControl;
  }

  constructor() {
    this.form = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: [''],
      code: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}$/)]],
      phoneCode: ['+'],
      flag: [''],
      currencyId: ['', Validators.required],
      paymentMethodIds: [[] as string[]],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.countryId = this.route.snapshot.paramMap.get('id') || '';
    this.loadCurrencies();
    this.loadMethods();
    if (this.countryId) this.isEdit.set(true);
  }

  private loadCurrencies(): void {
    this.entityService.listPaginated<any>('currencies', { limit: '200', sortBy: 'name', sortDir: 'asc' }).subscribe({
      next: (res) => {
        this.currencies.set(res.data || []);
        this.currencyOptions = (res.data || []).map((c: any) => ({
          value: c._id || c.id,
          label: `${c.code || ''} — ${this.language.localizedValue(c.name)}`,
        }));
        this.loadCountry();
      },
      error: () => { this.currencyOptions = []; this.loadCountry(); },
    });
  }

  private loadMethods(): void {
    this.entityService.listPaginated<any>('payment-methods', { limit: '200', sortBy: 'name', sortDir: 'asc' }).subscribe({
      next: (res) => this.paymentMethods.set(res.data || []),
      error: () => undefined,
    });
  }

  methodId(m: any): string {
    return m._id || m.id;
  }

  private loadCountry(): void {
    if (!this.countryId) { this.loadingRefs.set(false); return; }
    this.http.get<any>(`${environment.apiUrl}countries/${this.countryId}`).subscribe((c) => {
      const name = splitLocalized(c.name);
      this.form.patchValue({
        nameEn: name.en,
        nameAr: name.ar,
        code: c.code || '',
        phoneCode: c.phoneCode || '+',
        flag: c.flag || '',
        currencyId: c.currencyId || (this.currencyOptions[0]?.value ?? ''),
        paymentMethodIds: Array.isArray(c.paymentMethods) ? c.paymentMethods.map((p: any) => (p && typeof p === 'object' ? this.methodId(p) : p)) : [],
        isActive: c.isActive ?? true,
      });
      this.loadingRefs.set(false);
    });
  }

  isMethodSelected(id: string): boolean {
    return (this.form.controls['paymentMethodIds'].value ?? []).includes(id);
  }

  toggleMethod(id: string): void {
    const current = this.form.controls['paymentMethodIds'].value ?? [];
    const next = current.includes(id) ? current.filter((c: string) => c !== id) : [...current, id];
    this.form.controls['paymentMethodIds'].setValue(next);
    this.form.controls['paymentMethodIds'].markAsDirty();
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
      code: v.code.trim().toUpperCase(),
      phoneCode: v.phoneCode,
      flag: v.flag,
      currencyId: v.currencyId,
      paymentMethods: v.paymentMethodIds,
      isActive: v.isActive,
    };
    const req = this.isEdit()
      ? this.http.put<any>(`${environment.apiUrl}countries/${this.countryId}`, body)
      : this.http.post<any>(`${environment.apiUrl}countries`, body);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        if (this.isEdit()) {
          this.form.markAsPristine();
          this.toast.success('Saved successfully');
        } else {
          this.toast.success('Saved successfully');
          this.router.navigate(['/admin/countries']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.submitError.set(err?.error?.message || 'Could not save country');
      },
    });
  }
}