import { Component, Input } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormFieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'url' | 'color' | 'date' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  rows?: number;
  options?: FormFieldOption[];
  checkboxLabel?: string;
}

/**
 * Shared, schema-driven form-field component.
 *
 * Two usage modes:
 * 1. Single-control (legacy): <app-form-field [control]="form.controls.x" [label]="'Name'" .../>
 * 2. Dynamic (recommended):   <app-form-field [form]="form" [fields]="myFields" />
 *    where `myFields: FormFieldConfig[]` describes every field. The component
 *    renders the whole group from the schema, so pages no longer write
 *    per-field markup.
 */
@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  template: `
    @if (form && fields.length > 0) {
      <div class="space-y-5">
        @for (f of fields; track f.key) {
          <div>
            @if (f.type !== 'checkbox') {
              <label [for]="'field-' + f.key" class="block text-sm font-medium text-[#646D77]">
                {{ f.label }}
                @if (f.required) { <span class="text-salmon">*</span> }
              </label>
            }
            @switch (f.type) {
              @case ('textarea') {
                <textarea [id]="'field-' + f.key" [formControl]="controlFor(f.key)" [rows]="f.rows ?? 4"
                  [placeholder]="f.placeholder | translate" class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon"></textarea>
              }
              @case ('select') {
                <select [id]="'field-' + f.key" [formControl]="controlFor(f.key)"
                  class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon">
                  <option value="">{{ f.placeholder | translate }}</option>
                  @for (opt of f.options ?? []; track opt.value) {
                    <option [value]="opt.value">{{ opt.label | translate }}</option>
                  }
                </select>
              }
              @case ('checkbox') {
                <label class="flex cursor-pointer items-center gap-2">
                  <input [id]="'field-' + f.key" type="checkbox" [formControl]="controlFor(f.key)" class="rounded accent-salmon" />
                  <span class="text-sm font-medium text-[#646D77]">{{ f.checkboxLabel ?? f.label }}</span>
                </label>
              }
              @default {
                <input [id]="'field-' + f.key" [formControl]="controlFor(f.key)" [type]="f.type ?? 'text'"
                  [placeholder]="f.placeholder | translate" class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
              }
            }
            @if ((form.controls[f.key].touched || form.controls[f.key].dirty) && form.controls[f.key].errors) {
              @if (form.controls[f.key].errors?.['required']) {
                <p class="mt-1 text-xs text-salmon">{{ 'This field is required' | translate }}</p>
              }
            }
          </div>
        }
      </div>
    } @else {
      <div>
        @if (control && label && type !== 'checkbox') {
          <label [for]="id || 'field'" class="block text-sm font-medium text-[#646D77]">
            {{ label }}
            @if (required) { <span class="text-salmon">*</span> }
          </label>
        }
        @switch (type) {
          @case ('textarea') {
            <textarea [id]="id || 'field'" [formControl]="getControl()" [rows]="rows" [placeholder]="placeholder"
              class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon"></textarea>
          }
          @case ('select') {
            <select [id]="id || 'field'" [formControl]="getControl()"
              class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon">
              <option value="">{{ placeholder }}</option>
              @for (opt of options; track opt.value) {
                <option [value]="opt.value">{{ opt.label | translate }}</option>
              }
            </select>
          }
          @case ('checkbox') {
            <label class="flex cursor-pointer items-center gap-2">
              <input [id]="id || 'field'" type="checkbox" [formControl]="getControl()" class="rounded accent-salmon" />
              <span class="text-sm font-medium text-[#646D77]">{{ checkboxLabel || label }}</span>
            </label>
          }
          @default {
            <input [id]="id || 'field'" [formControl]="getControl()" [type]="type" [placeholder]="placeholder"
              [required]="required" class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
          }
        }
        @if (control?.touched && control?.errors) {
          @if (control.errors['required']) {
            <p class="mt-1 text-xs text-salmon">{{ 'This field is required' | translate }}</p>
          }
        }
      </div>
    }
  `,
})
export class FormFieldComponent {
  @Input() control?: FormControl | null;
  @Input() label = '';
  @Input() checkboxLabel = '';
  @Input() type: 'text' | 'number' | 'email' | 'password' | 'url' | 'color' | 'date' | 'textarea' | 'select' | 'checkbox' = 'text';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() rows = 4;
  @Input() options: FormFieldOption[] = [];
  @Input() id = '';

  @Input() form?: FormGroup;
  @Input() fields: FormFieldConfig[] = [];

  controlFor(key: string): FormControl {
    return this.form?.controls[key] as FormControl;
  }

  getControl(): FormControl {
    return this.control as FormControl;
  }
}
