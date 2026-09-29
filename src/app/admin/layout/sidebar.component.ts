import { Component, EventEmitter, Input, Output, inject, computed, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { LanguageService } from '../../core/services/language.service';

interface SidebarItem {
  label: string;
  labelAr: string;
  icon: string;
  route: string;
  permission?: string;
}

interface SidebarSection {
  title: string;
  titleAr: string;
  items: SidebarItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, CommonModule, TranslatePipe],
  template: `
    <aside
      class="fixed inset-y-0 left-0 z-40 flex -translate-x-full flex-col border-e border-border bg-white transition-all duration-300 md:translate-x-0"
      [class.w-64]="!rail() || mobileOpen"
      [class.w-16]="rail() && !mobileOpen"
      [class.translate-x-0]="mobileOpen">
      <div class="flex h-16 items-center justify-center border-b border-border">
        <div class="flex items-center gap-2.5" [class.hidden]="rail() && !mobileOpen" aria-label="Haven & Form">
          <svg class="h-8 w-8 shrink-0 text-primary" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M7 14.5 16 7l9 7.5V25H7V14.5Z" fill="currentColor" opacity=".16" />
            <path d="M7 14.5 16 7l9 7.5M10 25V14h12v11M13 25v-6h6v6M5 25h22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="text-[15px] font-bold leading-none tracking-[0.08em] text-blue-black">HAVEN <span class="font-medium text-primary">&amp; FORM</span></span>
        </div>
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white" [class.hidden]="!rail() || mobileOpen" aria-label="Haven & Form">
          <svg class="h-6 w-6" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M7 14.5 16 7l9 7.5V25H7V14.5Z" fill="currentColor" opacity=".18" />
            <path d="M7 14.5 16 7l9 7.5M10 25V14h12v11M13 25v-6h6v6M5 25h22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>
      <nav class="flex-1 overflow-y-auto p-3" [attr.lang]="language.language()">
        @for (section of sections; track section.title) {
          <div class="mb-4">
            <h3 class="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-faint" [class.hidden]="rail() && !mobileOpen">
              {{ language.isArabic() ? section.titleAr : section.title }}
            </h3>
            @for (item of section.items; track item.route) {
              <a
                [routerLink]="item.route"
                (click)="closeMobile()"
                [attr.title]="(rail() && !mobileOpen) ? (language.isArabic() ? item.labelAr : item.label) : null"
                [class.active]="isActive(item)"
                [class.bg-surface]="isActive(item)"
                [class.text-primary]="isActive(item)"
                [class.shadow-sm]="isActive(item)"
                [class.justify-center]="rail() && !mobileOpen"
                [class.px-2]="rail() && !mobileOpen"
                class="group relative flex items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-sm font-medium text-blue-black transition-all duration-200 hover:border-border hover:bg-surface hover:text-primary">
                <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path [attr.d]="getIconPath(item.icon)" />
                </svg>
                <span [class.hidden]="rail() && !mobileOpen">{{ language.isArabic() ? item.labelAr : item.label }}</span>
                @if (!rail() || mobileOpen) {
                  <span [class.right-2]="!language.isArabic()" [class.left-2]="language.isArabic()" class="absolute h-1.5 w-1.5 rounded-full bg-primary opacity-0 transition-opacity group-[.active]:opacity-100"></span>
                }
              </a>
            }
          </div>
        }
      </nav>
      <button
        (click)="toggle()"
        [attr.aria-label]="(isCollapsed() ? 'Expand sidebar' : 'Collapse sidebar') | translate"
        class="flex h-12 items-center justify-center border-t border-border bg-surface text-muted hover:bg-white hover:text-primary">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          @if (isCollapsed()) {
            <path d="M9 18l6-6-6-6" />
          } @else {
            <path d="M15 18l-6-6 6-6" />
          }
        </svg>
      </button>
    </aside>
  `,
})
export class SidebarComponent {
  @Input() mobileOpen = false;
  @Output() collapsed = new EventEmitter<boolean>();
  @Output() mobileClosed = new EventEmitter<void>();

  isCollapsed = signal(false);
  private readonly mqMd = matchMedia('(min-width: 768px)');
  private readonly mqLg = matchMedia('(min-width: 1024px)');
  private readonly isMedium = signal(false);
  rail = computed(() => this.isCollapsed() || this.isMedium());
  private readonly router = inject(Router);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  constructor() {
    this.updateMedia();
    this.mqMd.addEventListener('change', () => this.updateMedia());
    this.mqLg.addEventListener('change', () => this.updateMedia());
  }

  private updateMedia(): void {
    this.isMedium.set(this.mqMd.matches && !this.mqLg.matches);
  }
  protected readonly language = inject(LanguageService);

  private static path(url: string): string {
    const path = url.split('?')[0].split('#')[0].replace(/\/+$/, '');
    return path || '/';
  }

  /**
   * An item is active when the current URL is the item route or one of its
   * descendants. When several items match, only the most specific one wins, so
   * `/admin/products/low-stock` lights up "Low Stock" but not "Products" (same
   * for Transactions vs Payment Methods, and Settings vs Shipping/Profile).
   */
  isActive(item: SidebarItem): boolean {
    const url = SidebarComponent.path(this.currentUrl());
    const route = SidebarComponent.path(item.route);
    if (url !== route && !url.startsWith(`${route}/`)) return false;
    return !this.sections.some((section) =>
      section.items.some((other) => {
        if (other.route === item.route) return false;
        const otherRoute = SidebarComponent.path(other.route);
        return (
          otherRoute.length > route.length &&
          (url === otherRoute || url.startsWith(`${otherRoute}/`))
        );
      }),
    );
  }

  sections: SidebarSection[] = [
    {
      title: 'Dashboard', titleAr: 'لوحة التحكم',
      items: [{ label: 'Overview', labelAr: 'نظرة عامة', icon: 'chart-bar', route: '/admin/dashboard' }],
    },
    {
      title: 'Content', titleAr: 'المحتوى',
      items: [
        { label: 'Products', labelAr: 'المنتجات', icon: 'box', route: '/admin/products' },
        { label: 'Low Stock', labelAr: 'مخزون منخفض', icon: 'exclamation-triangle', route: '/admin/products/low-stock' },
        { label: 'Categories', labelAr: 'التصنيفات', icon: 'tags', route: '/admin/categories' },
        { label: 'Coupons', labelAr: 'الكوبونات', icon: 'ticket', route: '/admin/coupons' },
      ],
    },
    {
      title: 'Commerce', titleAr: 'التجارة',
      items: [
        { label: 'Orders', labelAr: 'الطلبات', icon: 'shopping-cart', route: '/admin/orders' },
        { label: 'Reviews', labelAr: 'التقييمات', icon: 'star', route: '/admin/reviews' },
      ],
    },
    {
      title: 'Payments', titleAr: 'المدفوعات',
      items: [
        { label: 'Transactions', labelAr: 'العمليات', icon: 'credit-card', route: '/admin/payments' },
        { label: 'Payment Methods', labelAr: 'طرق الدفع', icon: 'wallet', route: '/admin/payments/methods' },
        { label: 'Countries', labelAr: 'الدول', icon: 'globe', route: '/admin/countries' },
        { label: 'Currencies', labelAr: 'العملات', icon: 'banknote', route: '/admin/currencies' },
      ],
    },
    {
      title: 'People', titleAr: 'المستخدمون',
      items: [
        { label: 'Users', labelAr: 'المستخدمون', icon: 'users', route: '/admin/users' },
        { label: 'Roles', labelAr: 'الأدوار', icon: 'shield', route: '/admin/roles' },
      ],
    },
    {
      title: 'Account', titleAr: 'الحساب',
      items: [
        { label: 'My Activity', labelAr: 'نشاطي', icon: 'history', route: '/admin/my-activity' },
      ],
    },
    {
      title: 'System', titleAr: 'النظام',
      items: [
        { label: 'Audit Logs', labelAr: 'سجل التدقيق', icon: 'list', route: '/admin/audit-logs' },
        { label: 'Shipping', labelAr: 'الشحن', icon: 'truck', route: '/admin/settings/shipping' },
        { label: 'Profile', labelAr: 'الملف الشخصي', icon: 'user', route: '/admin/settings/profile' },
        { label: 'Settings', labelAr: 'الإعدادات', icon: 'cog', route: '/admin/settings' },
      ],
    },
  ];

  getIconPath(icon: string): string {
    const icons: Record<string, string> = {
      'chart-bar': 'M18 20V10M12 20V4M6 20v-6',
      'box': 'M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12',
      'tags': 'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01',
      'file-edit': 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
      'ticket': 'M2 9a3 3 0 013-3h14a3 3 0 013 3 3 3 0 01-3 3v0a3 3 0 01-3 3H5a3 3 0 01-3-3 3 3 0 013-3zM13 5v2m0 10v2',
      'shopping-cart': 'M3 3h2l2.6 12.3a2 2 0 002 1.7h7.7a2 2 0 002-1.6L21 7H6M9.5 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
      'star': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      'users': 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
      'shield': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
      'history': 'M3 3v5h5M3.05 13A9 9 0 106 5.3L3 8M21 3l-3 3 3 3',
       'list': 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
       'cog': 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
'truck': 'M3 6h11v10H3zM14 10h4l3 3v3h-7zM6 20a2 2 0 100-4 2 2 0 000 4zM18 20a2 2 0 100-4 2 2 0 000 4z',
       'user': 'M20 21a8 8 0 00-16 0M12 11a4 4 0 100-8 4 4 0 000 8z',
       'credit-card': 'M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zM1 10h22',
       'wallet': 'M21 7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V7zM16 14a1 1 0 100-2 1 1 0 000 2z',
       'globe': 'M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18 15 15 0 010-18',
       'banknote': 'M2 6h20v12H2zM12 15a3 3 0 100-6 3 3 0 000 6zM6 9v.01M18 15v.01',
      'exclamation-triangle': 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
      };
    return icons[icon] || 'M12 2v20M2 12h20';
  }

  toggle(): void {
    this.isCollapsed.update((v) => !v);
    this.collapsed.emit(this.isCollapsed());
  }

  closeMobile(): void {
    this.mobileClosed.emit();
  }
}
