import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { EntityService } from '../../../core/services/entity.service';
import { LanguageService } from '../../../core/services/language.service';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';

import { DetailHeaderComponent } from '../../../shared/ui/detail-header.component';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [TranslatePipe, DetailHeaderComponent],
  styles: `
    :host { display: block; }
    :host ::ng-deep .rich-text { line-height: 1.75; }
    :host ::ng-deep .rich-text p { margin: 0 0 0.75rem; }
    :host ::ng-deep .rich-text h1,
    :host ::ng-deep .rich-text h2,
    :host ::ng-deep .rich-text h3 { margin: 1rem 0 0.5rem; font-weight: 600; color: #18181B; }
    :host ::ng-deep .rich-text ul { list-style: disc !important; padding-left: 1.5rem; }
    :host ::ng-deep .rich-text ol { list-style: decimal !important; padding-left: 1.5rem; }
    :host ::ng-deep .rich-text a { color: #FD8F5F; text-decoration: underline !important; }
    :host ::ng-deep .rich-text img { max-width: 100%; height: auto; border-radius: 0.5rem; }
    :host ::ng-deep .rich-text iframe.ql-video,
    :host ::ng-deep .rich-text video.ql-video { display: block; width: 100%; max-width: 100%; min-height: 320px; border: 0; border-radius: 0.5rem; }
    :host ::ng-deep .rich-text pre.ql-syntax { margin: 0.75rem 0; padding: 0.5rem 0.75rem; overflow-x: auto; border-radius: 0.25rem; background: #23241f; color: #f8f8f2; font-family: monospace; white-space: pre-wrap; }
  `,
  template: `
    <div class="w-full space-y-6">
      @if (category()) {
        <app-detail-header [title]="localized(category()?.name)" eyebrow="Category details"
          backLabel="Back to categories" backTo="/admin/categories"
          editLabel="Edit category" [editTo]="['/admin/categories', category()?.id, 'edit']" />

        <section class="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div class="flex min-h-[360px] items-center justify-center rounded-lg border border-[#eadbd4] bg-[#f8eeea] p-6">
            @if (category()?.image?.url) {
              <img [src]="category()?.image?.url" [alt]="localized(category()?.name)" class="max-h-[460px] w-full rounded-md object-contain" />
            } @else {
              <span class="text-sm text-[#797979]">{{ 'No category image' | translate }}</span>
            }
          </div>
          <div class="card">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[#797979]">{{ 'Overview' | translate }}</p>
            <dl class="mt-6 space-y-5 text-sm">
              <div><dt class="spec-dt">{{ 'Name' | translate }}</dt><dd class="spec-dd">{{ localized(category()?.name) }}</dd></div>
              <div><dt class="spec-dt">{{ 'Icon' | translate }}</dt><dd class="spec-dd">{{ category()?.icon || '-' }}</dd></div>
              <div><dt class="spec-dt">{{ 'Color' | translate }}</dt><dd class="spec-dd flex items-center gap-2"><span class="h-5 w-5 rounded border border-[#c9c9c9]" [style.backgroundColor]="category()?.color"></span>{{ category()?.color || '-' }}</dd></div>
            </dl>
          </div>
        </section>

        @if (category()?.description) {
          <section class="card">
            <h3 class="section-title mb-5">{{ 'Description' | translate }}</h3>
            <div class="ql-snow"><div class="ql-editor rich-text text-sm text-[#646D77]" [innerHTML]="trustedHtml(category()?.description)"></div></div>
          </section>
        }
        @if (category()?.richDescription) {
          <section class="card">
            <h3 class="section-title mb-5">{{ 'Rich description' | translate }}</h3>
            <div class="ql-snow"><div class="ql-editor rich-text text-sm text-[#646D77]" [innerHTML]="trustedHtml(category()?.richDescription)"></div></div>
          </section>
        }
      } @else {
        <div class="flex min-h-64 items-center justify-center text-sm text-[#797979]">{{ 'Loading category...' | translate }}</div>
      }
    </div>
  `,
})
export class CategoryDetailComponent implements OnInit {
  private entityService = inject(EntityService);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private language = inject(LanguageService);
  protected router = inject(Router);
  category = signal<any>(null);

  localized(v: any): string {
    return this.language.localizedValue(v);
  }

  trustedHtml(html?: string) {
    return html ? this.sanitizer.bypassSecurityTrustHtml(html) : null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.entityService.get<any>('categories', id).subscribe((category) => this.category.set(category));
  }
}
