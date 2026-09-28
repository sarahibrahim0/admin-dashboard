import { Component, ElementRef, HostListener, Input, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '../i18n/translate.pipe';
import { LanguageService } from '../../core/services/language.service';
import { COUNTRY_CODES, countryNameAr, countryNameEn, findCountryCode } from '../utils/countries';

interface CountryOption {
  code: string;
  en: string;
  ar: string;
}

/**
 * Searchable country dropdown bound to a FormControl.
 * Stores the English country name (backend-compatible); displays the name in
 * the current UI language. Type to filter in either language.
 *
 * Usage:
 *   <app-country-select [control]="form.controls.country"
 *     [label]="'Country' | translate" [placeholder]="'Select country' | translate" />
 */
@Component({
  selector: 'app-country-select',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, TranslatePipe],
  styles: `
    :host { display: block; min-width: 0; }
  `,
  template: `
    <div class="relative" #root>
      @if (!compact) {
        <label [for]="id || 'country'" class="block text-sm font-medium text-[#646D77]">
          {{ label }}
          @if (required) { <span class="text-salmon">*</span> }
        </label>
      }
      <button #toggleBtn type="button" (click)="toggle()"
        [class.mt-1]="!compact"
        class="flex w-full items-center justify-between gap-2 rounded-md border border-[#c9c9c9] bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-salmon">
        <span class="truncate" [class.text-[#c9c9c9]]="!control.value">{{ displayValue() || placeholder }}</span>
        <span class="flex shrink-0 items-center gap-1 text-[#797979]">
          @if (control.value) {
            <i class="bi bi-x-lg text-xs hover:text-[#ff4545]" (click)="clear($event)" [attr.aria-label]="'Clear' | translate"></i>
          }
          <i class="bi text-xs" [class.bi-chevron-up]="open()" [class.bi-chevron-down]="!open()"></i>
        </span>
      </button>
      @if (open()) {
        <div class="absolute z-30 w-full overflow-hidden rounded-md border border-[#e3e8ef] bg-white shadow-lg"
          [class.top-full]="!dropUp()" [class.mt-1]="!dropUp()" [class.bottom-full]="dropUp()" [class.mb-1]="dropUp()">
          <div class="border-b border-[#F6F8FE] p-2">
            <input [ngModel]="query()" (ngModelChange)="query.set($event)" dir="auto"
              [placeholder]="'Search...' | translate"
              class="w-full rounded-md border border-[#e3e8ef] bg-[#f5f8fa] px-2 py-1.5 text-sm outline-none focus:border-salmon focus:bg-white" />
          </div>
          <ul class="max-h-60 overflow-y-auto py-1">
            @for (c of filtered(); track c.code) {
              <li>
                <button type="button" (click)="select(c.code)"
                  class="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-start text-sm hover:bg-[#f1faff]"
                  [class.bg-almond]="isSelected(c.code)">
                  <span class="truncate text-blue-black">{{ pickLabel(c) }}</span>
                  <span class="shrink-0 text-[10px] font-semibold uppercase text-[#c9c9c9]">{{ c.code }}</span>
                </button>
              </li>
            } @empty {
              <li class="px-3 py-2 text-sm text-[#797979]">{{ 'No results' | translate }}</li>
            }
          </ul>
        </div>
      }
    </div>
  `,
})
export class CountrySelectComponent {
  @Input() control!: FormControl;
  @Input() label = '';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() id = '';
  /** Compact mode for tight rows (e.g. shipping rates): no label, always open-friendly. */
  @Input() compact = false;

  private language = inject(LanguageService);
  private el = inject(ElementRef);

  open = signal(false);
  query = signal('');
  /** Opens upward when there isn't enough space below the button. */
  dropUp = signal(false);
  @ViewChild('toggleBtn') private toggleBtn?: ElementRef<HTMLButtonElement>;

  filtered = computed(() => {
    const lang = this.language.language();
    const q = this.query().trim().toLowerCase();
    const all: CountryOption[] = COUNTRY_CODES.map((code) => ({
      code,
      en: countryNameEn(code),
      ar: countryNameAr(code),
    }));
    const list = !q
      ? all
      : all.filter(
          (c) =>
            c.en.toLowerCase().includes(q) ||
            c.ar.includes(this.query().trim()) ||
            c.code.toLowerCase() === q,
        );
    return list.sort((a, b) =>
      (lang === 'ar' ? a.ar : a.en).localeCompare(lang === 'ar' ? b.ar : b.en, lang),
    );
  });

  displayValue(): string {
    const code = findCountryCode(this.control?.value);
    if (!code) return String(this.control?.value ?? '');
    return this.language.language() === 'ar' ? countryNameAr(code) : countryNameEn(code);
  }

  pickLabel(c: CountryOption): string {
    return this.language.language() === 'ar' ? c.ar : c.en;
  }

  isSelected(code: string): boolean {
    return findCountryCode(this.control?.value) === code;
  }

  toggle(): void {
    this.query.set('');
    const willOpen = !this.open();
    this.open.set(willOpen);
    if (willOpen) this.decideDirection();
  }

  private decideDirection(): void {
    requestAnimationFrame(() => {
      const btn = this.toggleBtn?.nativeElement;
      if (!btn) {
        this.dropUp.set(false);
        return;
      }
      const rect = btn.getBoundingClientRect();
      const needed = 300; // search box + full option list height
      const below = window.innerHeight - rect.bottom;
      const above = rect.top;
      this.dropUp.set(below < needed && above > below);
    });
  }

  select(code: string): void {
    this.control.setValue(countryNameEn(code));
    this.control.markAsTouched();
    this.query.set('');
    this.open.set(false);
  }

  clear(event: Event): void {
    event.stopPropagation();
    this.control.setValue('');
    this.control.markAsTouched();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.el.nativeElement.contains(event.target)) this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }
}
