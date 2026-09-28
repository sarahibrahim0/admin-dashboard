import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '../i18n/translate.pipe';

/**
 * THE shared header for all VIEW + ADD/EDIT pages (product, category,
 * user, order, coupon, role, content, settings…).
 * List pages keep using app-page-header — do NOT use this there.
 *
 * One line per page, no repeated button markup:
 *
 *   VIEW page:
 *   <app-detail-header [title]="localized(product()?.name)" eyebrow="Product details"
 *     backLabel="Back to products" backTo="/admin/products"
 *     editLabel="Edit product" [editTo]="['/admin/products', product()?.id, 'edit']" />
 *
 *   ADD/EDIT page:
 *   <app-detail-header title="{{ isEdit() ? ('Edit product' | translate) : ('New product' | translate) }}"
 *     eyebrow="Catalog" backLabel="Back to products" backTo="/admin/products"
 *     saveLabel="Save product" cancelTo="/admin/products"
 *     [saving]="saving()" [disabled]="form.invalid" (save)="submit()" />
 *
 * Design: white card with ghost back button (chevron auto-flips in RTL),
 * status/type chip, entity title in normal case (product/user names must
 * never be uppercased), optional meta line, [badge] + actions right.
 *
 * i18n: `eyebrow`, `backLabel`, `editLabel`, `saveLabel`, `cancelLabel`
 * are translation KEYS (piped internally). `title` / `subtitle` are
 * entity DATA (names, dates, order numbers, or already-translated text)
 * and are rendered as-is — never piped.
 *
 * Navigation: prefer `backTo` / `editTo` / `cancelTo` (string or commands
 * array, handled internally). `backClick` / `editClick` / `cancel` outputs
 * remain for custom behavior. Rare custom buttons can still be projected
 * via [badge] / [actions] slots (e.g. the order status badge).
 */
@Component({
  selector: 'app-detail-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  styles: `
    :host { display: block; }
  `,
  template: `
    <div class="detail-header">
      @if (backLabel) {
        <button type="button" class="detail-back" (click)="onBack()">
          <i class="bi bi-chevron-left" aria-hidden="true"></i><span>{{ backLabel | translate }}</span>
        </button>
      }
      <div class="detail-main">
        <div class="detail-text">
          @if (eyebrow) {
            <span class="detail-chip">{{ eyebrow | translate }}</span>
          }
          <h2 class="detail-title">{{ title }}</h2>
          @if (subtitle) {
            <p class="detail-subtitle">{{ subtitle }}</p>
          }
        </div>
        <div class="detail-side">
          <ng-content select="[badge]"></ng-content>
          @if (editLabel) {
            <button type="button" class="btn btn-primary" (click)="onEdit()">
              <i class="bi bi-pencil" aria-hidden="true"></i>{{ editLabel | translate }}
            </button>
          }
          @if (saveLabel) {
            <div class="detail-actions">
              <button type="button" class="btn btn-secondary" (click)="onCancel()">{{ cancelLabel | translate }}</button>
              <button type="button" class="btn btn-primary" [disabled]="saving || disabled" (click)="save.emit()">
                {{ (saving ? savingLabel : saveLabel) | translate }}
              </button>
            </div>
          }
          <div class="detail-actions">
            <ng-content select="[actions]"></ng-content>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DetailHeaderComponent {
  private router = inject(Router);

  /** Entity data (name, "Order #…") or already-translated text — rendered as-is. */
  @Input() title = '';
  /** Translation key, e.g. "Product details". Rendered as a chip. */
  @Input() eyebrow = '';
  /** Entity meta data (dates, descriptions) — rendered as-is. */
  @Input() subtitle = '';
  /** Translation key WITHOUT arrow, e.g. "Back to products" (chevron is built in). */
  @Input() backLabel = '';
  /** Preferred: auto-navigates on back click (string or router commands). */
  @Input() backTo?: string | any[];
  @Output() backClick = new EventEmitter<void>();

  /** When set, renders the primary Edit button. Translation key. */
  @Input() editLabel = '';
  /** Preferred: auto-navigates on edit click. */
  @Input() editTo?: string | any[];
  @Output() editClick = new EventEmitter<void>();

  /** When set, renders Cancel + Save in the header. Translation key. */
  @Input() saveLabel = '';
  @Input() savingLabel = 'Saving...';
  @Input() cancelLabel = 'Cancel';
  @Input() saving = false;
  @Input() disabled = false;
  /** Preferred: auto-navigates on cancel click. */
  @Input() cancelTo?: string | any[];
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onBack(): void {
    if (this.backTo !== undefined) this.router.navigate(Array.isArray(this.backTo) ? this.backTo : [this.backTo]);
    else this.backClick.emit();
  }

  onEdit(): void {
    if (this.editTo !== undefined) this.router.navigate(Array.isArray(this.editTo) ? this.editTo : [this.editTo]);
    else this.editClick.emit();
  }

  onCancel(): void {
    if (this.cancelTo !== undefined) this.router.navigate(Array.isArray(this.cancelTo) ? this.cancelTo : [this.cancelTo]);
    else this.cancel.emit();
  }
}
