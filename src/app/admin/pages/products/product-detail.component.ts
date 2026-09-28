import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { EntityService } from '../../../core/services/entity.service';
import { LanguageService } from '../../../core/services/language.service';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';

import { DetailHeaderComponent } from '../../../shared/ui/detail-header.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [TranslatePipe, DetailHeaderComponent],
  styles: `
    :host { display: block; }
    :host ::ng-deep .product-media { background: linear-gradient(135deg, #fff 0%, #f8eeea 100%); }
    :host ::ng-deep .product-media-main { min-height: 420px; }
    :host ::ng-deep .rich-text { line-height: 1.75; }
    :host ::ng-deep .rich-text p { margin: 0 0 0.75rem; }
    :host ::ng-deep .rich-text h1,
    :host ::ng-deep .rich-text h2,
    :host ::ng-deep .rich-text h3 { margin: 1rem 0 0.5rem; font-weight: 600; color: #18181B; }
    :host ::ng-deep .rich-text h1 { font-size: 1.5rem; }
    :host ::ng-deep .rich-text h2 { font-size: 1.25rem; }
    :host ::ng-deep .rich-text h3 { font-size: 1.125rem; }
    :host ::ng-deep .rich-text ul { list-style: disc !important; padding-left: 1.5rem; margin: 0.5rem 0 1rem; }
    :host ::ng-deep .rich-text ol { list-style: decimal !important; padding-left: 1.5rem; margin: 0.5rem 0 1rem; }
    :host ::ng-deep .rich-text li { margin: 0.25rem 0; }
    :host ::ng-deep .rich-text blockquote { margin: 1rem 0; border-left: 3px solid #FD8F5F; padding-left: 1rem; color: #797979; }
    :host ::ng-deep .rich-text a { color: #FD8F5F; text-decoration: underline !important; }
    :host ::ng-deep .rich-text img { max-width: 100%; height: auto; border-radius: 0.5rem; }
    :host ::ng-deep [dir="rtl"] .ql-editor.rich-text,
    :host ::ng-deep [dir="rtl"] .rich-text { direction: rtl; text-align: right; }
    :host ::ng-deep [dir="rtl"] .rich-text ul,
    :host ::ng-deep [dir="rtl"] .rich-text ol { padding-left: 0; padding-right: 1.5rem; }
    :host ::ng-deep [dir="rtl"] .rich-text blockquote,
    :host ::ng-deep [dir="rtl"] .ql-editor blockquote { border-left: 0; border-right: 3px solid #FD8F5F; padding-left: 0; padding-right: 1rem; }
    :host ::ng-deep .rich-text iframe.ql-video,
    :host ::ng-deep .rich-text video.ql-video { display: block; width: 100%; max-width: 100%; min-height: 320px; border: 0; border-radius: 0.5rem; }
    :host ::ng-deep .rich-text pre.ql-syntax { margin: 0.75rem 0; padding: 0.5rem 0.75rem; overflow-x: auto; border-radius: 0.25rem; background: #23241f; color: #f8f8f2; font-family: monospace; white-space: pre-wrap; }
    :host ::ng-deep .rich-text .ql-bg-black { background-color: #000; }
    :host ::ng-deep .rich-text .ql-bg-red { background-color: #e60000; }
    :host ::ng-deep .rich-text .ql-bg-orange { background-color: #f90; }
    :host ::ng-deep .rich-text .ql-bg-yellow { background-color: #ff0; }
    :host ::ng-deep .rich-text .ql-bg-green { background-color: #008a00; }
    :host ::ng-deep .rich-text .ql-bg-blue { background-color: #06c; }
    :host ::ng-deep .rich-text .ql-bg-purple { background-color: #93f; }
    :host ::ng-deep .rich-text .ql-color-white { color: #fff; }
    :host ::ng-deep .rich-text .ql-color-red { color: #e60000; }
    :host ::ng-deep .rich-text .ql-color-orange { color: #f90; }
    :host ::ng-deep .rich-text .ql-color-yellow { color: #ff0; }
    :host ::ng-deep .rich-text .ql-color-green { color: #008a00; }
    :host ::ng-deep .rich-text .ql-color-blue { color: #06c; }
    :host ::ng-deep .rich-text .ql-color-purple { color: #93f; }
  `,
  template: `
    <div class="w-full space-y-6">
      @if (product()) {
        <app-detail-header [title]="localized(product()?.name)" eyebrow="Product details"
          backLabel="Back to products" backTo="/admin/products"
          editLabel="Edit product" [editTo]="['/admin/products', product()?.id, 'edit']" />

        <section class="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div class="product-media rounded-lg border border-[#eadbd4] p-4 sm:p-6">
            <div class="product-media-main flex items-center justify-center overflow-hidden rounded-md bg-white">
              @if (selectedImage() || product()?.image?.url) {
                <img [src]="selectedImage() || product()?.image?.url" [alt]="localized(product()?.name)" class="max-h-[520px] w-full object-contain" />
              } @else {
                <div class="flex h-full min-h-[320px] items-center justify-center text-sm text-[#797979]">{{ 'No product image' | translate }}</div>
              }
            </div>
            @if (product()?.image?.url || product()?.images?.length) {
              <div class="mt-4 flex gap-3 overflow-x-auto pb-1">
                @if (product()?.image?.url) {
                  <button type="button" (click)="selectImage(product()?.image?.url)" class="h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 border-salmon bg-white p-1">
                    <img [src]="product()?.image?.url" [alt]="localized(product()?.name)" class="h-full w-full object-cover" />
                  </button>
                }
                @for (image of product()?.images; track image.publicId || image.url) {
                  <button type="button" (click)="selectImage(image.url)" class="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-[#eadbd4] bg-white p-1 hover:border-salmon">
                    <img [src]="image.url" [alt]="localized(product()?.name) + ' gallery image'" class="h-full w-full object-cover" />
                  </button>
                }
              </div>
            }
          </div>

          <div class="card">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[#797979]">{{ 'Overview' | translate }}</p>
                <p class="mt-2 text-3xl font-bold text-blue-black">{{ '$' + product()?.price?.toFixed(2) }}</p>
              </div>
              <span class="rounded-full px-3 py-1 text-xs font-semibold" [class.bg-green-100]="product()?.countInStock > 0" [class.text-green-700]="product()?.countInStock > 0" [class.bg-red-100]="product()?.countInStock <= 0" [class.text-red-700]="product()?.countInStock <= 0">
                {{ product()?.countInStock > 0 ? ('In stock' | translate) : ('Out of stock' | translate) }}
              </span>
            </div>
            <div class="my-6 border-t border-[#F6F8FE]"></div>
            <dl class="grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
              <div><dt class="spec-dt">{{ 'Stock' | translate }}</dt><dd class="spec-dd">{{ product()?.countInStock }}</dd></div>
              <div><dt class="spec-dt">{{ 'Rating' | translate }}</dt><dd class="spec-dd">{{ product()?.rating?.toFixed(1) || '0.0' }} ★</dd></div>
              <div><dt class="spec-dt">{{ 'Brand' | translate }}</dt><dd class="spec-dd">{{ localized(product()?.brand) || '-' }}</dd></div>
              <div><dt class="spec-dt">{{ 'Color' | translate }}</dt><dd class="spec-dd">{{ product()?.color || '-' }}</dd></div>
              <div><dt class="spec-dt">{{ 'Category' | translate }}</dt><dd class="spec-dd">{{ localized(product()?.category?.name) || product()?.category || '-' }}</dd></div>
              <div><dt class="spec-dt">{{ 'Reviews' | translate }}</dt><dd class="spec-dd">{{ product()?.numbReviews || 0 }}</dd></div>
            </dl>
            @if (product()?.isFeatured) {
              <div class="mt-7 rounded-md bg-[#f8eeea] px-4 py-3 text-sm font-medium text-blue-black">{{ 'Featured product' | translate }}</div>
            }
          </div>
        </section>

        <section class="card" [attr.dir]="language.isArabic() ? 'rtl' : 'ltr'">
          <h3 class="section-title mb-5">{{ 'Description' | translate }}</h3>
          @if (localized(product()?.description)) {
            <div class="ql-snow"><div class="ql-editor rich-text text-sm text-[#646D77]" [innerHTML]="trustedHtml(localized(product()?.description))"></div></div>
          } @else { <p class="text-sm text-[#797979]">{{ 'No description available.' | translate }}</p> }
        </section>

        @if (localized(product()?.richDescription)) {
          <section class="card" [attr.dir]="language.isArabic() ? 'rtl' : 'ltr'">
            <h3 class="section-title mb-5">{{ 'Rich description' | translate }}</h3>
            <div class="ql-snow"><div class="ql-editor rich-text text-sm text-[#646D77]" [innerHTML]="trustedHtml(localized(product()?.richDescription))"></div></div>
          </section>
        }
      } @else {
        <div class="flex min-h-64 items-center justify-center text-sm text-[#797979]">{{ 'Loading product...' | translate }}</div>
      }
    </div>
  `,
})
export class ProductDetailComponent implements OnInit {
  private entityService = inject(EntityService);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  protected language = inject(LanguageService);
  protected router = inject(Router);
  product = signal<any>(null);
  selectedImage = signal<string | null>(null);

  localized(v: any): string {
    return this.language.localizedValue(v);
  }

  selectImage(url: string): void {
    this.selectedImage.set(url);
  }

  trustedHtml(html?: string) {
    if (!html) return null;
    const documentHtml = new DOMParser().parseFromString(html, 'text/html');
    documentHtml.querySelectorAll('iframe.ql-video').forEach((iframe) => {
      const src = iframe.getAttribute('src') || '';
      const youtubeSrc = this.youtubeEmbedUrl(src);
      if (youtubeSrc) iframe.setAttribute('src', youtubeSrc);
      if (!this.isDirectVideoUrl(src)) return;
      const video = documentHtml.createElement('video');
      video.className = 'ql-video';
      video.setAttribute('controls', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('preload', 'metadata');
      const source = documentHtml.createElement('source');
      source.src = src;
      video.appendChild(source);
      iframe.replaceWith(video);
    });
    documentHtml.querySelectorAll('a[href]').forEach((link) => {
      const embedUrl = this.youtubeEmbedUrl(link.getAttribute('href') || '') || this.vimeoEmbedUrl(link.getAttribute('href') || '');
      if (!embedUrl) return;
      const iframe = documentHtml.createElement('iframe');
      iframe.className = 'ql-video';
      iframe.setAttribute('src', embedUrl);
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      link.replaceWith(iframe);
    });
    return this.sanitizer.bypassSecurityTrustHtml(documentHtml.body.innerHTML);
  }

  private isDirectVideoUrl(url: string): boolean {
    return /\.(mp4|webm|ogg)(?:\?|#|$)/i.test(url) || url.includes('/video/upload/');
  }

  private youtubeEmbedUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      let videoId = parsed.searchParams.get('v');
      if (!videoId && (parsed.hostname === 'youtu.be' || parsed.pathname.startsWith('/shorts/'))) {
        videoId = parsed.pathname.split('/').filter(Boolean).pop() || null;
      }
      if (videoId && (parsed.hostname.includes('youtube.com') || parsed.hostname === 'youtu.be')) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    } catch {}
    return null;
  }

  private vimeoEmbedUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      const videoId = parsed.pathname.split('/').filter(Boolean).pop();
      if (videoId && parsed.hostname.includes('vimeo.com')) return `https://player.vimeo.com/video/${videoId}`;
    } catch {}
    return null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.entityService.get<any>('products', id).subscribe((p) => {
      this.product.set(p);
      this.selectedImage.set(p.image?.url || p.images?.[0]?.url || null);
    });
  }
}
