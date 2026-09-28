import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';
import { FormFieldComponent } from '../../../shared/forms/form-field.component';
import { LocalizedFieldComponent } from '../../../shared/forms/localized-field.component';
import { FormConfirmsComponent } from '../../../shared/confirm-dialog/form-confirms.component';
import { ToastService } from '../../../shared/ui/toast.service';
import { joinLocalized, splitLocalized } from '../../../shared/utils/localized';
import { DetailHeaderComponent } from '../../../shared/ui/detail-header.component';

const DEFAULTS = {
  footerAddress: '12 Tahrir Street, Downtown, Cairo',
  footerPhone: '+20 100 123 4567',
  footerEmail: 'hello@havenandform.com',
  footerWhatsapp: '+201001234567',
  businessHours: 'Mon–Fri 9:00 AM – 6:00 PM',
  footerFacebook: 'https://facebook.com/havenandform',
  footerTwitter: 'https://x.com/havenandform',
  footerInstagram: 'https://instagram.com/havenandform',
  aboutEn: 'Welcome to Haven & Form — your trusted partner for modern furniture. Founded with a vision to bring premium quality, timeless design, and affordable pricing to every home. We believe every piece should be crafted with care, built to last, and designed to make daily life more beautiful.',
  aboutAr: 'مرحباً بكم في هافن آند فورم — شريككم الموثوق للأثاث العصري. تأسسنا برؤية لجلب الجودة الفائقة والتصميم الخالد والأسعار المناسبة لكل منزل. نؤمن أن كل قطعة يجب أن تُصنع بعناية وتدوم طويلاً وتجعل الحياة اليومية أجمل.',
  footerAboutEn: 'Haven & Form — considered furniture for every room, crafted to last.',
  footerAboutAr: 'هافن آند فورم — أثاث مدروس لكل غرفة، يُصنع ليدوم.',
  faqEn: 'Q: What are your delivery times?\nA: Delivery takes 2–5 business days. Cairo and Giza orders arrive next day.\n\nQ: Do you offer returns?\nA: Yes, you can return items within 14 days of delivery in original condition.',
  faqAr: 'س: ما هي مواعيد التوصيل؟\nج: يستغرق التوصيل من 2 إلى 5 أيام عمل، ووصل طلبات القاهرة والجيزة في اليوم التالي.\n\nس: هل توفرون الإرجاع؟\nج: نعم، يمكنك إرجاع المنتجات خلال 14 يوماً من الاستلام بشرط حالتها الأصلية.',
  termsEn: 'These Terms & Conditions govern your use of our website and purchases. By placing an order you agree to our pricing, delivery, and return policies. All prices are in local currency and include applicable taxes unless stated otherwise.',
  termsAr: 'تحدد هذه الشروط والأحكام استخدامك لموقعنا وإتمام عمليات الشراء. بإتمام طلبك فأنت توافق على سياسات الأسعار والتوصيل والإرجاع لدينا. جميع الأسعار بالعملة المحلية وتشمل الضرائب المطبقة ما لم يُذكر خلاف ذلك.',
};

@Component({
  selector: 'app-site-settings',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, FormFieldComponent, LocalizedFieldComponent, DetailHeaderComponent, FormConfirmsComponent, RouterLink],
  template: `
    <div class="w-full space-y-6">
      <app-detail-header title="{{ 'Site & SEO Settings' | translate }}"
        subtitle="{{ 'Control the storefront title, search metadata, and brand assets.' | translate }}" eyebrow="Settings" />

      <div class="flex flex-wrap gap-2 border-b border-[#F6F8FE] pb-3">
        @for (tab of tabs; track tab.key) {
          <button
            type="button"
            (click)="activeTab.set(tab.key)"
            class="rounded-md px-4 py-2 text-sm font-medium transition-colors"
            [class.bg-[#6366F1]]="activeTab() === tab.key"
            [class.text-white]="activeTab() === tab.key"
            [class.text-[#646D77]]="activeTab() !== tab.key"
            [class.hover:bg-[#F6F8FE]]="activeTab() !== tab.key">
            {{ tab.label | translate }}
          </button>
        }
      </div>

      <form [formGroup]="form" (ngSubmit)="showSaveDialog.set(true)" class="space-y-6">
        @if (activeTab() === 'seo') {
          <section class="card space-y-4">
            <div>
              <h2 class="section-title">{{ 'Search engine metadata' | translate }}</h2>
              <p class="mt-1 text-sm text-[#646D77]">{{ 'These values describe your store in search results and browser tabs.' | translate }}</p>
            </div>
            <div>
              <app-localized-field
                [label]="'Site title' | translate"
                mode="text"
                [required]="true"
                [controlEn]="form.controls.titleEn"
                [controlAr]="form.controls.titleAr"
                [placeholder]="'Haven & Form | Modern Furniture' | translate"
                [placeholderAr]="'هافن آند فورم | أثاث عصري'"
                [id]="'site-title'">
              </app-localized-field>
              <p class="mt-1 text-xs text-[#797979]">EN: {{ (form.controls.titleEn.value?.length ?? 0) }}/60 · AR: {{ (form.controls.titleAr.value?.length ?? 0) }}/60 {{ 'characters' | translate }}</p>
            </div>
            <div>
              <app-localized-field
                [label]="'Meta description' | translate"
                mode="textarea"
                [rows]="3"
                [required]="true"
                [controlEn]="form.controls.descriptionEn"
                [controlAr]="form.controls.descriptionAr"
                [placeholder]="'Discover considered furniture for every room...' | translate"
                [placeholderAr]="'اكتشف أثاثاً مختاراً بعناية لكل غرفة...'"
                [id]="'site-description'">
              </app-localized-field>
              <p class="mt-1 text-xs text-[#797979]">EN: {{ (form.controls.descriptionEn.value?.length ?? 0) }}/160 · AR: {{ (form.controls.descriptionAr.value?.length ?? 0) }}/160 {{ 'characters' | translate }}</p>
            </div>
            <app-localized-field
              [label]="'Keywords' | translate"
              mode="text"
              [controlEn]="form.controls.keywordsEn"
              [controlAr]="form.controls.keywordsAr"
              [placeholder]="'modern furniture, home decor, living room, dining' | translate"
              [placeholderAr]="'أثاث عصري، ديكور منزلي، غرفة معيشة، سفرة'"
              [id]="'site-keywords'">
            </app-localized-field>
            <p class="mt-1 text-xs text-[#797979]">{{ 'Separate keywords with commas.' | translate }}</p>
            <app-form-field
              [control]="form.controls.canonicalUrl"
              [label]="'Canonical URL' | translate"
              [type]="'url'"
              [placeholder]="'https://yourstore.com'"
              [id]="'site-canonical'">
            </app-form-field>
          </section>

          <section class="card space-y-4">
            <div>
              <h2 class="section-title">{{ 'Brand assets' | translate }}</h2>
              <p class="mt-1 text-sm text-[#646D77]">{{ 'Use public image URLs for your logo, browser icon, and social previews.' | translate }}</p>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <app-form-field
                [control]="form.controls.logoUrl"
                [label]="'Logo URL' | translate"
                [type]="'url'"
                [placeholder]="'https://.../logo.svg'"
                [id]="'site-logo'">
              </app-form-field>
              <app-form-field
                [control]="form.controls.faviconUrl"
                [label]="'Favicon URL' | translate"
                [type]="'url'"
                [placeholder]="'https://.../favicon.png'"
                [id]="'site-favicon'">
              </app-form-field>
            </div>
            <app-form-field
              [control]="form.controls.socialImageUrl"
              [label]="'Social preview image URL' | translate"
              [type]="'url'"
              [placeholder]="'https://.../social-preview.jpg'"
              [id]="'site-social'">
            </app-form-field>
            @if (form.controls.logoUrl.value) {
              <div class="flex items-center gap-3 rounded-md border border-[#F6F8FE] bg-[#f8eeea] p-3">
                <img [src]="form.controls.logoUrl.value" [alt]="'Site logo preview' | translate" class="h-12 max-w-48 object-contain" />
                <span class="text-xs text-[#646D77]">{{ 'Logo preview' | translate }}</span>
              </div>
            }
          </section>
        }

        @if (activeTab() === 'contact') {
          <section class="card space-y-4">
            <div>
              <h2 class="section-title">{{ 'Contact' | translate }}</h2>
              <p class="mt-1 text-sm text-[#646D77]">{{ 'Contact details shown on the contact page and footer.' | translate }}</p>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <app-form-field
                [control]="form.controls.footerAddress"
                [label]="'Address' | translate"
                [type]="'text'"
                [placeholder]="'Address'"
                [id]="'footer-address'">
              </app-form-field>
              <app-form-field
                [control]="form.controls.footerPhone"
                [label]="'Phone' | translate"
                [type]="'text'"
                [placeholder]="'Phone'"
                [id]="'footer-phone'">
              </app-form-field>
              <app-form-field
                [control]="form.controls.footerEmail"
                [label]="'Email' | translate"
                [type]="'email'"
                [placeholder]="'Email'"
                [id]="'footer-email'">
              </app-form-field>
              <app-form-field
                [control]="form.controls.footerWhatsapp"
                [label]="'WhatsApp' | translate"
                [type]="'text'"
                [placeholder]="'+201234567890'"
                [id]="'footer-whatsapp'">
              </app-form-field>
              <app-form-field
                [control]="form.controls.businessHours"
                [label]="'Business hours' | translate"
                [type]="'text'"
                [placeholder]="'Mon–Fri 9:00 AM – 6:00 PM'"
                [id]="'footer-hours'">
              </app-form-field>
              <app-form-field
                [control]="form.controls.footerFacebook"
                [label]="'Facebook URL' | translate"
                [type]="'url'"
                [placeholder]="'https://facebook.com/...'"
                [id]="'footer-facebook'">
              </app-form-field>
              <app-form-field
                [control]="form.controls.footerTwitter"
                [label]="'Twitter/X URL' | translate"
                [type]="'url'"
                [placeholder]="'https://x.com/...'"
                [id]="'footer-twitter'">
              </app-form-field>
              <app-form-field
                [control]="form.controls.footerInstagram"
                [label]="'Instagram URL' | translate"
                [type]="'url'"
                [placeholder]="'https://instagram.com/...'"
                [id]="'footer-instagram'">
              </app-form-field>
            </div>
          </section>
        }

        @if (activeTab() === 'about') {
          <section class="card space-y-4">
            <div>
              <h2 class="section-title">{{ 'About' | translate }}</h2>
              <p class="mt-1 text-sm text-[#646D77]">{{ 'About text shown on the about page.' | translate }}</p>
            </div>
            <app-localized-field
              [label]="'About text' | translate"
              mode="textarea"
              [rows]="5"
              [controlEn]="form.controls.aboutEn"
              [controlAr]="form.controls.aboutAr"
              [placeholder]="'Tell your story...' | translate"
              [placeholderAr]="'احكِ قصتك...'"
              [id]="'about-text'">
            </app-localized-field>
          </section>
        }

        @if (activeTab() === 'faq') {
          <section class="card space-y-4">
            <div>
              <h2 class="section-title">{{ 'FAQ' | translate }}</h2>
              <p class="mt-1 text-sm text-[#646D77]">{{ 'Frequently asked questions shown on the FAQ page.' | translate }}</p>
            </div>
            <app-localized-field
              [label]="'FAQ' | translate"
              mode="textarea"
              [rows]="10"
              [controlEn]="form.controls.faqEn"
              [controlAr]="form.controls.faqAr"
              [placeholder]="'Q: ...' | translate"
              [placeholderAr]="'س: ...'"
              [id]="'faq-text'">
            </app-localized-field>
            <p class="mt-1 text-xs text-[#797979]">{{ 'Write each question on its own line, followed by the answer.' | translate }}</p>
          </section>

          <section class="card space-y-4">
            <div>
              <h2 class="section-title">{{ 'Terms & Conditions' | translate }}</h2>
              <p class="mt-1 text-sm text-[#646D77]">{{ 'Terms & Conditions shown on the terms page.' | translate }}</p>
            </div>
            <app-localized-field
              [label]="'Terms & Conditions' | translate"
              mode="textarea"
              [rows]="10"
              [controlEn]="form.controls.termsEn"
              [controlAr]="form.controls.termsAr"
              [placeholder]="'These Terms & Conditions govern...' | translate"
              [placeholderAr]="'تحدد هذه الشروط والأحكام...'"
              [id]="'terms-text'">
            </app-localized-field>
          </section>
        }

        @if (activeTab() === 'footer') {
          <section class="card space-y-4">
            <div>
              <h2 class="section-title">{{ 'Footer' | translate }}</h2>
              <p class="mt-1 text-sm text-[#646D77]">{{ 'Short blurb and category links shown in your store footer.' | translate }}</p>
            </div>
            <app-localized-field
              [label]="'Footer about' | translate"
              mode="textarea"
              [rows]="3"
              [controlEn]="form.controls.footerAboutEn"
              [controlAr]="form.controls.footerAboutAr"
              [placeholder]="'About our store...' | translate"
              [placeholderAr]="'عن المتجر...'"
              [id]="'footer-about'">
            </app-localized-field>
            <div>
              <h3 class="mb-3 text-sm font-semibold text-[#18181B]">{{ 'Footer categories' | translate }}</h3>
              <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                @for (cat of categories(); track cat._id) {
                  <label class="flex cursor-pointer items-center gap-2.5 rounded-md border border-[#F6F8FE] bg-[#fafbfc] px-3 py-2.5 text-sm">
                    <input
                      type="checkbox"
                      class="h-4 w-4 cursor-pointer accent-[#6366F1]"
                      [checked]="isCategorySelected(cat._id)"
                      (change)="toggleCategory(cat._id)" />
                    <span class="h-3 w-3 shrink-0 rounded-full" [style.background]="cat.color || '#6366F1'"></span>
                    <span class="truncate text-[#18181B]">{{ language.localizedValue(cat.name) }}</span>
                  </label>
                } @empty {
                  <p class="text-sm text-[#646D77]">{{ 'No categories available' | translate }}</p>
                }
              </div>
            </div>
          </section>
        }

        @if (activeTab() === 'payments') {
          <section class="card space-y-4">
            <div>
              <h2 class="section-title">{{ 'Checkout & payments' | translate }}</h2>
              <p class="mt-1 text-sm text-[#646D77]">{{ 'Global payment defaults. Country-specific payment methods are set per country.' | translate }}</p>
            </div>
            <app-form-field
              [control]="form.controls.enableCashOnDelivery"
              [type]="'checkbox'"
              [checkboxLabel]="'Enable Cash on Delivery' | translate"
              id="settings-cod">
            </app-form-field>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <app-form-field
                [control]="form.controls.defaultCurrency"
                [label]="'Default currency' | translate"
                type="select"
                [options]="currencyOptions"
                [placeholder]="'Select a currency' | translate"
                id="settings-currency">
              </app-form-field>
            </div>
          </section>

          <section class="card space-y-4">
            <div>
              <h2 class="section-title">{{ 'Country-based payments' | translate }}</h2>
              <p class="mt-1 text-sm text-[#646D77]">{{ 'Manage which payment methods are available in each country, and the currency used there.' | translate }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <a routerLink="/admin/countries" class="btn btn-secondary btn-sm"><i class="bi bi-globe2 me-1"></i>{{ 'Countries' | translate }}</a>
              <a routerLink="/admin/currencies" class="btn btn-secondary btn-sm"><i class="bi bi-bank me-1"></i>{{ 'Currencies' | translate }}</a>
              <a routerLink="/admin/payments/methods" class="btn btn-secondary btn-sm"><i class="bi bi-wallet2 me-1"></i>{{ 'Payment Methods' | translate }}</a>
            </div>
          </section>
        }

        <div class="flex items-center justify-end">
          <button type="submit" [disabled]="saving() || form.invalid" class="btn btn-primary">{{ saving() ? ('Saving...' | translate) : ('Save site settings' | translate) }}</button>
        </div>
      </form>
      <app-form-confirms [saveOpen]="showSaveDialog()" (save)="confirmSave()" (saveCancel)="showSaveDialog.set(false)" />
    </div>
  `,
})
export class SiteSettingsComponent implements OnInit {
  private entityService = inject(EntityService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  language = inject(LanguageService);
  saving = signal(false);
  showSaveDialog = signal(false);
  private currentSettings: any = {};
  activeTab = signal('seo');
  categories = signal<any[]>([]);
  currencyOptions: { value: string; label: string }[] = [];

  tabs = [
    { key: 'seo', label: 'SEO & Brand' },
    { key: 'contact', label: 'Contact' },
    { key: 'about', label: 'About' },
    { key: 'faq', label: 'FAQ & Terms' },
    { key: 'footer', label: 'Footer' },
    { key: 'payments', label: 'Payments' },
  ];

  confirmSave(): void {
    this.showSaveDialog.set(false);
    this.save();
  }

  form = this.fb.group({
    titleEn: ['', [Validators.required, Validators.maxLength(60)]],
    titleAr: ['', [Validators.maxLength(60)]],
    descriptionEn: ['', [Validators.required, Validators.maxLength(160)]],
    descriptionAr: ['', [Validators.maxLength(160)]],
    keywordsEn: [''],
    keywordsAr: [''],
    logoUrl: [''],
    faviconUrl: [''],
    socialImageUrl: [''],
    canonicalUrl: [''],
    footerAddress: [DEFAULTS.footerAddress],
    footerPhone: [DEFAULTS.footerPhone],
    footerEmail: [DEFAULTS.footerEmail],
    footerWhatsapp: [DEFAULTS.footerWhatsapp],
    businessHours: [DEFAULTS.businessHours],
    footerFacebook: [DEFAULTS.footerFacebook],
    footerTwitter: [DEFAULTS.footerTwitter],
    footerInstagram: [DEFAULTS.footerInstagram],
    aboutEn: [DEFAULTS.aboutEn],
    aboutAr: [DEFAULTS.aboutAr],
    footerAboutEn: [DEFAULTS.footerAboutEn],
    footerAboutAr: [DEFAULTS.footerAboutAr],
    faqEn: [DEFAULTS.faqEn],
    faqAr: [DEFAULTS.faqAr],
    termsEn: [DEFAULTS.termsEn],
    termsAr: [DEFAULTS.termsAr],
    footerCategories: [[] as string[]],
    enableCashOnDelivery: [true],
    defaultCurrency: [''],
  });

  private patchLocalized(settings: any): void {
    this.currentSettings = settings || {};
    const title = splitLocalized(settings.title);
    const description = splitLocalized(settings.description);
    const keywords = splitLocalized(settings.keywords);
    this.form.patchValue({
      titleEn: title.en,
      titleAr: title.ar,
      descriptionEn: description.en,
      descriptionAr: description.ar,
      keywordsEn: keywords.en,
      keywordsAr: keywords.ar,
      logoUrl: settings.logoUrl ?? '',
      faviconUrl: settings.faviconUrl ?? '',
      socialImageUrl: settings.socialImageUrl ?? '',
      canonicalUrl: settings.canonicalUrl ?? '',
    });
  }

  private patchFooter(settings: any): void {
    const about = splitLocalized(settings.about);
    const faq = splitLocalized(settings.faq);
    const terms = splitLocalized(settings.terms);
    this.form.patchValue({
      footerAddress: settings.footerAddress ?? DEFAULTS.footerAddress,
      footerPhone: settings.footerPhone ?? DEFAULTS.footerPhone,
      footerEmail: settings.footerEmail ?? DEFAULTS.footerEmail,
      footerWhatsapp: settings.footerWhatsapp ?? DEFAULTS.footerWhatsapp,
      businessHours: settings.businessHours ?? DEFAULTS.businessHours,
      footerFacebook: settings.footerFacebook ?? DEFAULTS.footerFacebook,
      footerTwitter: settings.footerTwitter ?? DEFAULTS.footerTwitter,
      footerInstagram: settings.footerInstagram ?? DEFAULTS.footerInstagram,
      aboutEn: about.en || DEFAULTS.aboutEn,
      aboutAr: about.ar || DEFAULTS.aboutAr,
      footerAboutEn: settings.footerAboutEn ?? DEFAULTS.footerAboutEn,
      footerAboutAr: settings.footerAboutAr ?? DEFAULTS.footerAboutAr,
      faqEn: faq.en || DEFAULTS.faqEn,
      faqAr: faq.ar || DEFAULTS.faqAr,
      termsEn: terms.en || DEFAULTS.termsEn,
      termsAr: terms.ar || DEFAULTS.termsAr,
      footerCategories: settings.footerCategories ?? [],
      enableCashOnDelivery: settings.enableCashOnDelivery ?? true,
      defaultCurrency: settings.defaultCurrency ?? '',
    });
  }

  ngOnInit(): void {
    this.entityService.getRoot<any>('settings/seo').subscribe({
      next: (settings) => {
        this.patchLocalized(settings);
        this.patchFooter(settings);
      },
      error: () => undefined,
    });
    this.loadCategories();
    this.loadCurrencies();
  }

  private loadCurrencies(): void {
    this.entityService.listPaginated<any>('currencies', { limit: '200', sortBy: 'name', sortDir: 'asc' }).subscribe({
      next: (res) => {
        this.currencyOptions = (res.data || []).map((c: any) => ({
          value: c._id || c.id,
          label: `${c.code || ''} — ${this.language.localizedValue(c.name)}`,
        }));
        if (!this.form.controls.defaultCurrency.value && this.currencyOptions.length) {
          const def = (res.data || []).find((c: any) => c.isDefault);
          this.form.controls.defaultCurrency.setValue(def?._id || this.currencyOptions[0].value);
        }
      },
      error: () => undefined,
    });
  }

  private loadCategories(): void {
    this.entityService.listPaginated<any>('categories', { limit: '200', sortBy: 'name', sortDir: 'asc' }).subscribe({
      next: (res) => this.categories.set(res.data),
      error: () => undefined,
    });
  }

  isCategorySelected(id: string): boolean {
    return (this.form.controls.footerCategories.value ?? []).includes(id);
  }

  toggleCategory(id: string): void {
    const current = this.form.controls.footerCategories.value ?? [];
    const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id];
    this.form.controls.footerCategories.setValue(next);
    this.form.controls.footerCategories.markAsDirty();
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.form.pristine) {
      this.toast.info('No changes to save');
      return;
    }
    this.saving.set(true);
    const v = this.form.getRawValue();
    const payload = {
      ...this.currentSettings,
      title: joinLocalized(v.titleEn, v.titleAr),
      description: joinLocalized(v.descriptionEn, v.descriptionAr),
      keywords: joinLocalized(v.keywordsEn, v.keywordsAr),
      logoUrl: v.logoUrl,
      faviconUrl: v.faviconUrl,
      socialImageUrl: v.socialImageUrl,
      canonicalUrl: v.canonicalUrl,
      footerAddress: v.footerAddress,
      footerPhone: v.footerPhone,
      footerEmail: v.footerEmail,
      footerWhatsapp: v.footerWhatsapp,
      businessHours: v.businessHours,
      footerFacebook: v.footerFacebook,
      footerTwitter: v.footerTwitter,
      footerInstagram: v.footerInstagram,
      about: joinLocalized(v.aboutEn, v.aboutAr),
      footerAboutEn: v.footerAboutEn,
      footerAboutAr: v.footerAboutAr,
      faq: joinLocalized(v.faqEn, v.faqAr),
      terms: joinLocalized(v.termsEn, v.termsAr),
      footerCategories: v.footerCategories,
      enableCashOnDelivery: v.enableCashOnDelivery,
      defaultCurrency: v.defaultCurrency,
    };
    this.entityService.updateRoot<any>('settings/seo', payload).subscribe({
      next: (settings) => {
        this.currentSettings = settings;
        this.patchLocalized(settings);
        this.patchFooter(settings);
        this.form.markAsPristine();
        this.toast.success('Site settings saved');
        this.saving.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Could not save site settings');
        this.saving.set(false);
      },
    });
  }
}