import { Component, EventEmitter, Output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface SidebarItem {
  label: string;
  icon: string;
  route: string;
  permission?: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside
      class="fixed inset-y-0 left-0 z-30 flex flex-col border-e border-[#c9c9c9] bg-almond transition-all duration-300"
      [class.w-64]="!isCollapsed()"
      [class.w-16]="isCollapsed()">
      <div class="flex h-16 items-center justify-center border-b border-[#c9c9c9]">
        <span class="text-lg font-bold text-salmon" [class.hidden]="isCollapsed()">Admin</span>
        <span class="text-lg font-bold text-salmon" [class.hidden]="!isCollapsed()">A</span>
      </div>
      <nav class="flex-1 overflow-y-auto p-3">
        @for (section of sections; track section.title) {
          <div class="mb-4">
            <h3 class="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-[#797979]" [class.hidden]="isCollapsed()">
              {{ section.title }}
            </h3>
            @for (item of section.items; track item.route) {
              <a
                [routerLink]="item.route"
                routerLinkActive="bg-white text-salmon"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-blue-black hover:bg-[#ecd7cd]">
                <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path [attr.d]="getIconPath(item.icon)" />
                </svg>
                <span [class.hidden]="isCollapsed()">{{ item.label }}</span>
              </a>
            }
          </div>
        }
      </nav>
      <button
        (click)="toggle()"
        class="flex h-12 items-center justify-center border-t border-[#c9c9c9] text-[#797979] hover:bg-[#ecd7cd]">
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
  @Output() collapsed = new EventEmitter<boolean>();

  isCollapsed = signal(false);

  sections: SidebarSection[] = [
    {
      title: 'Dashboard',
      items: [{ label: 'Overview', icon: 'chart-bar', route: '/admin/dashboard' }],
    },
    {
      title: 'Content',
      items: [
        { label: 'Products', icon: 'box', route: '/admin/products' },
        { label: 'Categories', icon: 'tags', route: '/admin/categories' },
        { label: 'Content', icon: 'file-edit', route: '/admin/content' },
        { label: 'Coupons', icon: 'ticket', route: '/admin/coupons' },
      ],
    },
    {
      title: 'Commerce',
      items: [
        { label: 'Orders', icon: 'shopping-cart', route: '/admin/orders' },
        { label: 'Reviews', icon: 'star', route: '/admin/reviews' },
      ],
    },
    {
      title: 'People',
      items: [
        { label: 'Users', icon: 'users', route: '/admin/users' },
        { label: 'Roles', icon: 'shield', route: '/admin/roles' },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'My Activity', icon: 'history', route: '/my-activity' },
      ],
    },
    {
      title: 'System',
      items: [
        { label: 'Audit Logs', icon: 'list', route: '/admin/audit-logs' },
        { label: 'Settings', icon: 'cog', route: '/admin/settings' },
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
    };
    return icons[icon] || 'M12 2v20M2 12h20';
  }

  toggle(): void {
    this.isCollapsed.update((v) => !v);
    this.collapsed.emit(this.isCollapsed());
  }
}
