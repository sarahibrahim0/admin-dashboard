import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EntityService } from '../../../core/services/entity.service';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';
import { FormFieldComponent } from '../../../shared/forms/form-field.component';
import { CountrySelectComponent } from '../../../shared/forms/country-select.component';
import { FormConfirmsComponent } from '../../../shared/confirm-dialog/form-confirms.component';
import { ToastService } from '../../../shared/ui/toast.service';
import { DetailHeaderComponent } from '../../../shared/ui/detail-header.component';

@Component({
  selector: 'app-shipping-settings',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, FormFieldComponent, CountrySelectComponent, DetailHeaderComponent, FormConfirmsComponent],
  template: `
    <div class="w-full space-y-6">
      <app-detail-header title="{{ 'Shipping Settings' | translate }}"
        subtitle="{{ 'Shipping description' | translate }}" eyebrow="Settings" />
      <form [formGroup]="form" (ngSubmit)="showSaveDialog.set(true)" class="space-y-6 card">
        <section class="space-y-4">
          <h2 class="section-title">{{ 'Distance pricing' | translate }}</h2>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <app-form-field
              [control]="form.controls.originLatitude"
              [label]="'Warehouse latitude' | translate"
              [type]="'number'"
              [required]="true"
              [id]="'originLatitude'">
            </app-form-field>
            <app-form-field
              [control]="form.controls.originLongitude"
              [label]="'Warehouse longitude' | translate"
              [type]="'number'"
              [required]="true"
              [id]="'originLongitude'">
            </app-form-field>
            <app-form-field
              [control]="form.controls.distanceRate"
              [label]="'Price per kilometre' | translate"
              [type]="'number'"
              [required]="true"
              [id]="'distanceRate'">
            </app-form-field>
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <app-form-field
              [control]="form.controls.baseRate"
              [label]="'Base rate fallback' | translate"
              [type]="'number'"
              [id]="'baseRate'">
            </app-form-field>
            <app-form-field
              [control]="form.controls.freeShippingThreshold"
              [label]="'Free shipping threshold' | translate"
              [type]="'number'"
              [id]="'freeShippingThreshold'">
            </app-form-field>
          </div>
        </section>
        <section class="space-y-4 border-t border-[#F6F8FE] pt-5">
          <div class="flex items-center justify-between">
            <div><h2 class="section-title">{{ 'Fallback location rates' | translate }}</h2><p class="text-sm text-[#646D77]">{{ 'Used when checkout does not provide coordinates.' | translate }}</p></div>
            <button type="button" (click)="addRate()" class="btn btn-secondary">{{ 'Add rate' | translate }}</button>
          </div>
          @for (rate of rates.controls; track $index; let i = $index) {
            <div class="grid grid-cols-1 gap-3 rounded border border-[#F6F8FE] p-3 sm:grid-cols-5">
              <input [formControl]="$any(rate.controls)['label']" [placeholder]="'Label' | translate" class="rounded border border-[#c9c9c9] px-2 py-1.5 text-sm" />
              <input [formControl]="$any(rate.controls)['city']" [placeholder]="'City' | translate" class="rounded border border-[#c9c9c9] px-2 py-1.5 text-sm" />
              <app-country-select [control]="$any(rate.controls)['country']" [placeholder]="'Country' | translate" [compact]="true"></app-country-select>
              <input [formControl]="$any(rate.controls)['rate']" type="number" min="0" step="0.01" [placeholder]="'Rate' | translate" class="rounded border border-[#c9c9c9] px-2 py-1.5 text-sm" />
              <button type="button" (click)="removeRate(i)" class="btn btn-danger-outline">{{ 'Remove' | translate }}</button>
            </div>
          }
        </section>
        <div class="flex items-center justify-end border-t border-[#F6F8FE] pt-4">
          <button type="submit" [disabled]="saving() || form.invalid" class="btn btn-primary">{{ saving() ? ('Saving...' | translate) : ('Save shipping' | translate) }}</button>
        </div>
      </form>
      <app-form-confirms [saveOpen]="showSaveDialog()" (save)="confirmSave()" (saveCancel)="showSaveDialog.set(false)" />
    </div>
  `,
})
export class ShippingSettingsComponent implements OnInit {
  private entityService = inject(EntityService);
  private language = inject(LanguageService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  saving = signal(false);
  showSaveDialog = signal(false);

  confirmSave(): void {
    this.showSaveDialog.set(false);
    this.save();
  }

  form = this.fb.group({
    originLatitude: [0, [Validators.required, Validators.min(-90), Validators.max(90)]],
    originLongitude: [0, [Validators.required, Validators.min(-180), Validators.max(180)]],
    distanceRate: [0, [Validators.required, Validators.min(0)]],
    baseRate: [0, Validators.min(0)],
    freeShippingThreshold: [0, Validators.min(0)],
    rates: this.fb.array<FormGroup>([]),
  });

  get rates(): FormArray<FormGroup> {
    return this.form.controls.rates;
  }

  private rateGroup(rate?: { label?: string; city?: string; country?: string; rate?: number }): FormGroup {
    return this.fb.group({
      label: [rate?.label ?? ''],
      city: [rate?.city ?? ''],
      country: [rate?.country ?? ''],
      rate: [rate?.rate ?? 0, Validators.min(0)],
    });
  }

  ngOnInit(): void {
    this.entityService.getRoot<any>('shipping').subscribe((config) => {
      this.form.patchValue({
        originLatitude: config.originLatitude ?? 0,
        originLongitude: config.originLongitude ?? 0,
        distanceRate: config.distanceRate ?? 0,
        baseRate: config.baseRate ?? 0,
        freeShippingThreshold: config.freeShippingThreshold ?? 0,
      });
      this.rates.clear();
      (config.rates || []).forEach((rate: any) => this.rates.push(this.rateGroup(rate)));
    });
  }

  addRate(): void { this.rates.push(this.rateGroup()); }
  removeRate(index: number): void { this.rates.removeAt(index); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.form.pristine) {
      this.toast.info('No changes to save');
      return;
    }
    this.saving.set(true);
    this.entityService.updateRoot<any>('shipping', this.form.getRawValue()).subscribe({
      next: (config) => {
        this.rates.clear();
        (config.rates || []).forEach((rate: any) => this.rates.push(this.rateGroup(rate)));
        this.form.markAsPristine();
        this.toast.success('Shipping settings saved');
        this.saving.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Could not save shipping settings');
        this.saving.set(false);
      },
    });
  }
}