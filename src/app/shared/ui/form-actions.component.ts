import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../i18n/translate.pipe';

/**
 * Consistent form footer (and header reuse) for add / edit pages.
 *
 * Position: always right-aligned, Cancel left + Save right,
 * border-t separated, stacks on mobile.
 *
 * Usage inside <form>:
 *   <app-form-actions formId="product-form" saveLabel="Save product"
 *     [saving]="saving()" [disabled]="form.invalid"
 *     (cancel)="router.navigate(['/admin/products'])" />
 *
 * For LONG scrolling forms, add `sticky` — the bar floats pinned to the
 * viewport bottom until you scroll past it:
 *   <app-form-actions [sticky]="true" saveLabel="Save product" ... />
 *
 * Usage in page-header actions slot:
 *   <app-form-actions actions ... /> is NOT needed — just project
 *   two buttons with .btn .btn-secondary / .btn-primary.
 *   This component is for the footer bar.
 */
@Component({
  selector: 'app-form-actions',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  styles: `
    :host { display: block; }
  `,
  template: `
    <div class="form-actions" [class.form-actions-sticky]="sticky">
      @if (showCancel) {
        <button type="button" class="btn btn-secondary" (click)="cancel.emit()" [disabled]="saving">
          {{ cancelLabel | translate }}
        </button>
      }
      <button
        [attr.form]="formId || null"
        [type]="formId ? 'submit' : 'button'"
        class="btn btn-primary"
        [disabled]="saving || disabled"
        (click)="formId ? null : save.emit()"
      >
        {{ (saving ? savingLabel : saveLabel) | translate }}
      </button>
    </div>
  `,
})
export class FormActionsComponent {
  @Input() saveLabel = 'Save';
  @Input() savingLabel = 'Saving...';
  @Input() cancelLabel = 'Cancel';
  @Input() showCancel = true;
  @Input() saving = false;
  @Input() disabled = false;
  /** Floating sticky bottom bar for long scrolling forms. */
  @Input() sticky = false;
  /** If set, button acts as native submit for that form id. Otherwise emits (save). */
  @Input() formId?: string;
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
}
