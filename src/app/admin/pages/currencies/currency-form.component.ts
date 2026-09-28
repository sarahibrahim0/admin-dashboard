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
  selector: 'app-currency-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, FormFieldComponent, LocalizedFieldComponent, DetailHeaderComponent, FormConfirmsComponent],
  template: `
    <div class="w-full space-y-6">
      <app-detail-header title="{{ isEdit() ? ('Edit currency' | translate) : ('New currency' | translate) }}"
        eyebrow="{{ 'Payments' | translate }}"
        backLabel="Back to currencies" backTo="/admin/currencies"
        saveLabel="Save currency" cancelTo="/admin/currencies" [saving]="saving()" (save)="showSaveDialog.set(true)" />
      <form id="currency-form" [formGroup]="form" (ngSubmit)="showSaveDialog.set(true)">
      <div class="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div class="min-w-0 space-y-6">
        <section class="card">
          <h3 class="section-title mb-5">{{ 'Currency details' | translate }}</h3>
          @if (submitError()) {
            <div class="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#ff4545]">{{ submitError() }}</div>
          }
          <app-localized-field
            [label]="'Name' | translate"
            mode="text"
            [required]="true"
            [controlEn]="fc('nameEn')"
            [controlAr]="fc('nameAr')"
            [placeholder]="'Egyptian Pound' | translate"
            [placeholderAr]="'الجنيه المصري'"
            [id]="'currency-name'">
          </app-localized-field>
          <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <app-form-field [control]="fc('code')" [label]="'Code' | translate" [placeholder]="'EGP'" [required]="true" id="currency-code"></app-form-field>
            <app-form-field [control]="fc('symbol')" [label]="'Symbol' | translate" [placeholder]="'E£'" [required]="true" id="currency-symbol"></app-form-field>
            <app-form-field [control]="fc('rate')" [label]="'Rate' | translate" type="number" [placeholder]="'1.00'" id="currency-rate"></app-form-field>
          </div>
          <p class="mt-2 text-xs text-[#797979]">{{ 'Rate = how many of this currency equal 1 of your base currency.' | translate }}</p>
        </section>
        </div>
        <aside class="card relative min-w-0 self-start">
          <h3 class="section-title mb-5">{{ 'Status' | translate }}</h3>
          <app-form-field [control]="fc('isDefault')" [type]="'checkbox'" [checkboxLabel]="'Base currency' | translate" id="currency-default"></app-form-field>
          <div class="mt-4">
            <app-form-field [control]="fc('isActive')" [type]="'checkbox'" [checkboxLabel]="('Status' | translate) + ' (' + ((fc('isActive').value ? 'Active' : 'Inactive') | translate) + ')'" id="currency-active"></app-form-field>
          </div>
          <div class="mt-4 flex items-center gap-2 rounded-md border border-[#F6F8FE] bg-[#FAFBFF] px-3 py-2.5 text-sm">
            <span class="text-lg font-bold text-[#18181B]">{{ fc('symbol').value || '¤' }}</span>
            <span class="font-medium text-[#18181B]">{{ fc('code').value || '—' }}</span>
            <span class="ms-auto text-[#797979]">1 {{ fc('code').value || '?' }} = <b>{{ fc('rate').value || '1' }}</b></span>
          </div>
        </aside>
      </div>
      </form>
      <app-form-confirms
        [saveOpen]="showSaveDialog()" (save)="confirmSave()" (saveCancel)="showSaveDialog.set(false)" />
    </div>
  `,
})
export class CurrencyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  private toast = inject(ToastService);
  private http = inject(HttpClient);

  isEdit = signal(false);
  saving = signal(false);
  submitError = signal<string | null>(null);
  currencyId = '';
  form: FormGroup;

  fc(key: string): FormControl {
    return this.form.controls[key] as FormControl;
  }

  constructor() {
    this.form = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: [''],
      code: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}$/)]],
      symbol: ['', Validators.required],
      rate: [1, [Validators.required, Validators.min(0.0001)]],
      isDefault: [false],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.currencyId = this.route.snapshot.paramMap.get('id') || '';
    if (this.currencyId) {
      this.isEdit.set(true);
      this.http.get<any>(`${environment.apiUrl}currencies/${this.currencyId}`).subscribe((c) => {
        const name = splitLocalized(c.name);
        this.form.patchValue({
          nameEn: name.en,
          nameAr: name.ar,
          code: c.code || '',
          symbol: c.symbol || '',
          rate: c.rate ?? 1,
          isDefault: c.isDefault ?? false,
          isActive: c.isActive ?? true,
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
      code: v.code.trim().toUpperCase(),
      symbol: v.symbol,
      rate: Number(v.rate),
      isDefault: v.isDefault,
      isActive: v.isActive,
    };
    const req = this.isEdit()
      ? this.http.put<any>(`${environment.apiUrl}currencies/${this.currencyId}`, body)
      : this.http.post<any>(`${environment.apiUrl}currencies`, body);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        if (this.isEdit()) {
          this.form.markAsPristine();
          this.toast.success('Saved successfully');
        } else {
          this.toast.success('Saved successfully');
          this.router.navigate(['/admin/currencies']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.submitError.set(err?.error?.message || 'Could not save currency');
      },
    });
  }
}