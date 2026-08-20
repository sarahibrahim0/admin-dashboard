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
      class="fixed inset-y-0 left-0 z-30 flex flex-col border-e border-slate-200 bg-white transition-all duration-300"
      [class.w-64]="!isCollapsed()"
      [class.w-16]="isCollapsed()">
      <div class="flex h-16 items-center justify-center border-b border-slate-200">
        <span class="text-lg font-bold text-indigo-600" [class.hidden]="isCollapsed()">Admin</span>
        <span class="text-lg font-bold text-indigo-600" [class.hidden]="!isCollapsed()">A</span>
      </div>
      <nav class="flex-1 overflow-y-auto p-3">
        @for (section of sections; track section.title) {
          <div class="mb-4">
            <h3 class="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400" [class.hidden]="isCollapsed()">
              {{ section.title }}
            </h3>
            @for (item of section.items; track item.route) {
              <a
                [routerLink]="item.route"
                routerLinkActive="bg-indigo-50 text-indigo-600"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
                <i [class]="item.icon + ' text-lg'"></i>
                <span [class.hidden]="isCollapsed()">{{ item.label }}</span>
              </a>
            }
          </div>
        }
      </nav>
      <button
        (click)="toggle()"
        class="flex h-12 items-center justify-center border-t border-slate-200 text-slate-400 hover:bg-slate-50">
        <i class="pi" [class.pi-arrow-right]="isCollapsed()" [class.pi-arrow-left]="!isCollapsed()"></i>
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
      items: [{ label: 'Overview', icon: 'pi pi-chart-bar', route: '/admin/dashboard' }],
    },
    {
      title: 'Content',
      items: [
        { label: 'Products', icon: 'pi pi-box', route: '/admin/products' },
        { label: 'Categories', icon: 'pi pi-tags', route: '/admin/categories' },
        { label: 'Content', icon: 'pi pi-file-edit', route: '/admin/content' },
        { label: 'Coupons', icon: 'pi pi-ticket', route: '/admin/coupons' },
      ],
    },
    {
      title: 'Commerce',
      items: [
        { label: 'Orders', icon: 'pi pi-shopping-cart', route: '/admin/orders' },
        { label: 'Reviews', icon: 'pi pi-star', route: '/admin/reviews' },
      ],
    },
    {
      title: 'People',
      items: [
        { label: 'Users', icon: 'pi pi-users', route: '/admin/users' },
        { label: 'Roles', icon: 'pi pi-shield', route: '/admin/roles' },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'My Activity', icon: 'pi pi-history', route: '/my-activity' },
      ],
    },
    {
      title: 'System',
      items: [
        { label: 'Audit Logs', icon: 'pi pi-list', route: '/admin/audit-logs' },
        { label: 'Settings', icon: 'pi pi-cog', route: '/admin/settings' },
      ],
    },
  ];

  toggle(): void {
    this.isCollapsed.update((v) => !v);
    this.collapsed.emit(this.isCollapsed());
  }
}
