import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../i18n/translate.pipe';

/**
 * THE shared header for LIST / table pages (products, orders, users…).
 * View + add/edit pages use app-detail-header — do NOT use this there.
 *
 * Design: same white-card shell as app-detail-header (border, radius,
 * shadow, padding) so every dashboard page opens with one consistent
 * header card:
 *   chip (section eyebrow) + UPPERCASE section title + subtitle on the
 *   left, [actions] (Add button, …) on the right. Wraps on mobile,
 *   RTL-safe via logical properties.
 *
 * All labels are translation KEYS (piped internally — passing an already
 * translated string is also safe, it falls through unchanged).
 *
 * Usage:
 *   <app-page-header title="Products" eyebrow="Catalog"
 *     subtitle="Manage your product catalog.">
 *     <a actions routerLink="new" class="btn btn-primary">
 *       <i class="bi bi-plus-lg"></i>{{ 'Add Product' | translate }}
 *     </a>
 *   </app-page-header>
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="detail-header">
      <div class="detail-main">
        <div class="detail-text">
          @if (eyebrow) {
            <span class="detail-chip">{{ eyebrow | translate }}</span>
          }
          <h2 class="detail-title detail-title-section">{{ title | translate }}</h2>
          @if (subtitle) {
            <p class="detail-subtitle">{{ subtitle | translate }}</p>
          }
        </div>
        <div class="detail-side">
          <div class="detail-actions">
            <ng-content select="[actions]"></ng-content>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  /** Translation key, e.g. "Products". Rendered UPPERCASE (section title). */
  @Input() title = '';
  /** Translation key, e.g. "Catalog". Rendered as a chip. */
  @Input() eyebrow = '';
  /** Translation key, e.g. "Manage your product catalog.". */
  @Input() subtitle = '';
}
