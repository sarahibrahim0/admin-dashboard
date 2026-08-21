# Match Storefront Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the admin dashboard (D:\admin-dashboard-v2) look identical to the storefront (D:\E-Commerce\E-Commerce\ecommerce-v2) — same colors, same Tailwind classes, same visual patterns.

**Architecture:** Replace all PrimeNG/primeicons remnants with pure Tailwind + inline SVGs. Normalize styles.css, login, topbar, sidebar, and KPI cards to match the storefront's exact design tokens.

**Tech Stack:** Angular 22, Tailwind CSS v4 (CSS-first config), no component library.

---

## File Structure

| File | Change |
|------|--------|
| `src/styles.css` | Remove CSS variables, fix focus-visible color to `#6366f1` |
| `angular.json` | Remove `primeicons/primeicons.css` from styles array |
| `src/app/admin/layout/topbar.component.ts` | Add `sticky top-0 z-30 bg-white/95 backdrop-blur` to match storefront header |
| `src/app/admin/pages/login/login.component.ts` | Remove card wrapper, match storefront login layout exactly |
| `src/app/admin/layout/sidebar.component.ts` | Replace all `pi pi-*` icons with inline SVGs |
| `src/app/admin/pages/dashboard/kpi-card.component.ts` | Replace `<i [class]="icon">` with inline SVG |
| `src/app/admin/pages/dashboard/dashboard.component.ts` | Update icon inputs from `pi pi-*` to SVG template refs |
| `src/app/admin/pages/products/products-list.component.ts` | Remove `pi pi-trash` from bulkActions |

---

### Task 1: Fix styles.css and angular.json

**Files:**
- Modify: `D:\admin-dashboard-v2\src\styles.css:1-18`
- Modify: `D:\admin-dashboard-v2\angular.json:28-31`

- [ ] **Step 1: Fix styles.css**

Replace entire file with:

```css
@import 'tailwindcss';

:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}
```

- [ ] **Step 2: Remove primeicons from angular.json**

Change the styles array from:
```json
"styles": [
  "node_modules/primeicons/primeicons.css",
  "src/styles.css"
]
```
to:
```json
"styles": [
  "src/styles.css"
]
```

- [ ] **Step 3: Commit**

```bash
cd D:\admin-dashboard-v2 && git add src/styles.css angular.json && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "style: match storefront global styles, remove primeicons"
```

---

### Task 2: Fix login page to match storefront

**Files:**
- Modify: `D:\admin-dashboard-v2\src\app\admin\pages\login\login.component.ts:10-48`

- [ ] **Step 1: Replace login template**

The storefront login is `mx-auto max-w-md px-4 py-16` — no card wrapper, no bg-slate-50 centering. Replace the template:

```typescript
@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="mx-auto max-w-md px-4 py-16">
      <h1 class="text-2xl font-bold text-slate-900">Sign in</h1>
      <p class="mt-1 text-sm text-slate-500">Admin Dashboard</p>

      @if (auth.error()) {
        <p class="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{{ auth.error() }}</p>
      }

      <form (ngSubmit)="submit()" class="mt-6 space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-slate-700">Email</label>
          <input
            id="email"
            type="email"
            [(ngModel)]="email"
            name="email"
            class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
          <input
            id="password"
            type="password"
            [(ngModel)]="password"
            name="password"
            class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </div>
        <button
          type="submit"
          [disabled]="auth.loading()"
          class="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
          {{ auth.loading() ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
    </div>
  `,
})
```

- [ ] **Step 2: Commit**

```bash
cd D:\admin-dashboard-v2 && git add src/app/admin/pages/login/login.component.ts && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "style: match storefront login page layout"
```

---

### Task 3: Fix topbar to match storefront header

**Files:**
- Modify: `D:\admin-dashboard-v2\src\app\admin\layout\topbar.component.ts:8-21`

- [ ] **Step 1: Replace topbar template**

Storefront header uses `sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur`. Replace:

```typescript
@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur px-6">
      <div class="flex items-center gap-4">
        <h1 class="text-lg font-semibold text-slate-900">Dashboard</h1>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm text-slate-600">{{ auth.user()?.name || 'Admin' }}</span>
        <button
          (click)="logout()"
          class="rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-rose-600">
          Logout
        </button>
      </div>
    </header>
  `,
})
```

- [ ] **Step 2: Commit**

```bash
cd D:\admin-dashboard-v2 && git add src/app/admin/layout/topbar.component.ts && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "style: match storefront header style on admin topbar"
```

---

### Task 4: Replace sidebar primeicons with inline SVGs

**Files:**
- Modify: `D:\admin-dashboard-v2\src\app\admin\layout\sidebar.component.ts` (entire file)

- [ ] **Step 1: Rewrite sidebar with inline SVGs**

Replace the entire file. Change icon field type from `string` to store SVG paths, and render with `<svg>` elements:

```typescript
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
        class="flex h-12 items-center justify-center border-t border-slate-200 text-slate-400 hover:bg-slate-50">
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
```

- [ ] **Step 2: Commit**

```bash
cd D:\admin-dashboard-v2 && git add src/app/admin/layout/sidebar.component.ts && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "style: replace primeicons with inline SVGs in sidebar"
```

---

### Task 5: Replace KPI card primeicons with inline SVGs

**Files:**
- Modify: `D:\admin-dashboard-v2\src\app\admin\pages\dashboard\kpi-card.component.ts:1-32`

- [ ] **Step 1: Rewrite kpi-card component**

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-lg border border-slate-200 bg-white p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-slate-500">{{ label }}</p>
          <p class="mt-1 text-2xl font-bold text-slate-900">{{ value }}</p>
          @if (subtitle) {
            <p class="mt-1 text-xs text-slate-400">{{ subtitle }}</p>
          }
        </div>
        <div class="rounded-lg p-3" [ngClass]="iconBg">
          <svg class="h-5 w-5" [ngClass]="iconColor" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path [attr.d]="getIconPath(icon)" />
          </svg>
        </div>
      </div>
    </div>
  `,
})
export class KpiCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() subtitle = '';
  @Input() icon = 'chart-bar';
  @Input() iconBg = 'bg-indigo-100';
  @Input() iconColor = 'text-indigo-600';

  getIconPath(icon: string): string {
    const icons: Record<string, string> = {
      'dollar': 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
      'shopping-cart': 'M3 3h2l2.6 12.3a2 2 0 002 1.7h7.7a2 2 0 002-1.6L21 7H6M9.5 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
      'box': 'M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12',
      'users': 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
      'clock': 'M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2',
      'exclamation-triangle': 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
      'chart-bar': 'M18 20V10M12 20V4M6 20v-6',
    };
    return icons[icon] || 'M12 2v20M2 12h20';
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd D:\admin-dashboard-v2 && git add src/app/admin/pages/dashboard/kpi-card.component.ts && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "style: replace primeicons with inline SVGs in KPI card"
```

---

### Task 6: Update dashboard icon inputs

**Files:**
- Modify: `D:\admin-dashboard-v2\src\app\admin\pages\dashboard\dashboard.component.ts:28-33`

- [ ] **Step 1: Update icon inputs**

Change lines 28-33 from `pi pi-*` to short icon names matching the KPI card's `getIconPath`:

```
icon="pi pi-dollar"     →  icon="dollar"
icon="pi pi-shopping-cart" → icon="shopping-cart"
icon="pi pi-box"        →  icon="box"
icon="pi pi-users"      →  icon="users"
icon="pi pi-clock"      →  icon="clock"
icon="pi pi-exclamation-triangle" → icon="exclamation-triangle"
```

- [ ] **Step 2: Commit**

```bash
cd D:\admin-dashboard-v2 && git add src/app/admin/pages/dashboard/dashboard.component.ts && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "style: update dashboard KPI icon inputs to match inline SVGs"
```

---

### Task 7: Fix products-list bulkActions icon

**Files:**
- Modify: `D:\admin-dashboard-v2\src\app\admin\pages\products\products-list.component.ts:42`

- [ ] **Step 1: Remove pi-trash icon string**

Change:
```typescript
bulkActions: BulkAction[] = [{ label: 'Delete', icon: 'pi pi-trash', action: 'delete' }];
```
to:
```typescript
bulkActions: BulkAction[] = [{ label: 'Delete', icon: 'trash', action: 'delete' }];
```

Also check BulkActionsComponent to ensure it handles the icon string correctly (it may use `<i [class]="icon">` — update it to use SVG like KPI card if so).

- [ ] **Step 2: Verify build**

```bash
cd D:\admin-dashboard-v2 && npx ng build --configuration development
```

- [ ] **Step 3: Commit**

```bash
cd D:\admin-dashboard-v2 && git add src/app/admin/pages/products/ && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "style: remove primeicons reference from products bulk actions"
```

---

### Task 8: Final build verification

- [ ] **Step 1: Full production build**

```bash
cd D:\admin-dashboard-v2 && npx ng build
```

- [ ] **Step 2: Verify no primeicons references remain**

```bash
cd D:\admin-dashboard-v2 && grep -r "pi pi" src/ --include="*.ts" --include="*.html"
```

Expected: No matches.

```bash
cd D:\admin-dashboard-v2 && grep -r "primeicons" angular.json package.json
```

Expected: No matches in angular.json. Only in package.json (dependency declaration — can optionally remove).

- [ ] **Step 3: Commit any cleanup**

```bash
cd D:\admin-dashboard-v2 && git add -A && git -c user.name=sarah -c user.email=sarahibrahimabdelhamid@gmail.com commit -m "chore: final cleanup removing all primeicons references"
```
