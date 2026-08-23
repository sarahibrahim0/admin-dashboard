# Admin Design Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance admin dashboard spacing, typography, and redesign the roles/permissions pages with grouped permissions.

**Architecture:** Global token updates (padding, heading sizes) propagate to all pages via Tailwind utility classes. Roles pages get a full template rewrite with two-panel permission form and enhanced list table.

**Tech Stack:** Angular 22, Tailwind CSS v4, PrimeNG 22, Bootstrap Icons

---

### Task 1: Global Typography & Spacing Foundation

**Files:**
- Modify: `D:\admin-dashboard-v2\src\app\admin\layout\admin-shell.component.ts`
- Modify: `D:\admin-dashboard-v2\src\app\admin\layout\topbar.component.ts`
- Modify: `D:\admin-dashboard-v2\src\app\shared\table\base-table.component.ts`

- [ ] **Step 1: Update admin shell main content padding**

In `D:\admin-dashboard-v2\src\app\admin\layout\admin-shell.component.ts`, change `p-6` to `p-8` on the `<main>` element:

```typescript
template: `
    <div class="flex h-screen bg-almond">
      <app-sidebar (collapsed)="collapsed = $event" />
      <div class="flex flex-1 flex-col overflow-hidden" [class.ms-16]="collapsed" [class.ms-64]="!collapsed">
        <app-topbar />
        <main class="flex-1 overflow-y-auto p-8">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
```

- [ ] **Step 2: Update topbar padding**

In `D:\admin-dashboard-v2\src\app\admin\layout\topbar.component.ts`, add `px-8` to the header:

```typescript
template: `
    <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#c9c9c9] bg-almond backdrop-blur px-8">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold text-blue-black uppercase tracking-wider">Dashboard</h1>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm text-blue-black">{{ auth.user()?.name || 'Admin' }}</span>
        <button
          (click)="logout()"
          class="bg-salmon px-4 py-2 text-sm font-medium uppercase tracking-wider text-white hover:bg-[#e9855a] transition-all duration-300">
          Logout
        </button>
      </div>
    </header>
  `,
```

- [ ] **Step 3: Update base table row padding**

In `D:\admin-dashboard-v2\src\app\shared\table\base-table.component.ts`, find the `<td>` elements and change `py-3` to `py-4`. Find the `<thead>` `<th>` elements and change `py-3` to `py-4`.

Specifically, in the template:
- `<th>` rows: change `py-3` to `py-4`
- `<td>` rows: change `py-3` to `py-4`

- [ ] **Step 4: Build and verify**

Run: `cd D:\admin-dashboard-v2 && npx ng build --configuration development 2>&1 | Select-Object -Last 5`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
cd D:\admin-dashboard-v2
git add -A
git commit -m "style: update global spacing - p-8 padding, py-4 table rows, smaller topbar heading"
```

---

### Task 2: Update Other List Pages Typography

**Files:**
- Modify: `D:\admin-dashboard-v2\src\app\admin\pages\products\products-list.component.ts`
- Modify: `D:\admin-dashboard-v2\src\app\admin\pages\users\users-list.component.ts`
- Modify: `D:\admin-dashboard-v2\src\app\admin\pages\categories\categories-list.component.ts`
- Modify: `D:\admin-dashboard-v2\src\app\admin\pages\orders\orders-list.component.ts`
- Modify: `D:\admin-dashboard-v2\src\app\admin\pages\coupons\coupons-list.component.ts`
- Modify: `D:\admin-dashboard-v2\src\app\admin\pages\reviews\reviews-list.component.ts`

- [ ] **Step 1: Update products list heading**

In `D:\admin-dashboard-v2\src\app\admin\pages\products\products-list.component.ts`, find the heading `<h2>` and change `text-2xl` to `text-3xl`:

Change: `<h2 class="text-2xl font-bold uppercase text-blue-black">Products</h2>`
To: `<h2 class="text-3xl font-bold uppercase text-blue-black">Products</h2>`

- [ ] **Step 2: Update users list heading**

In `D:\admin-dashboard-v2\src\app\admin\pages\users\users-list.component.ts`, same change:

Change: `<h2 class="text-2xl font-bold uppercase text-blue-black">Users</h2>`
To: `<h2 class="text-3xl font-bold uppercase text-blue-black">Users</h2>`

- [ ] **Step 3: Update categories list heading**

In `D:\admin-dashboard-v2\src\app\admin\pages\categories\categories-list.component.ts`, same change:

Change: `<h2 class="text-2xl font-bold uppercase text-blue-black">Categories</h2>`
To: `<h2 class="text-3xl font-bold uppercase text-blue-black">Categories</h2>`

- [ ] **Step 4: Update orders list heading**

In `D:\admin-dashboard-v2\src\app\admin\pages\orders\orders-list.component.ts`, same change:

Change: `<h2 class="text-2xl font-bold uppercase text-blue-black">Orders</h2>`
To: `<h2 class="text-3xl font-bold uppercase text-blue-black">Orders</h2>`

- [ ] **Step 5: Update coupons list heading**

In `D:\admin-dashboard-v2\src\app\admin\pages\coupons\coupons-list.component.ts`, same change:

Change: `<h2 class="text-2xl font-bold uppercase text-blue-black">Coupons</h2>`
To: `<h2 class="text-3xl font-bold uppercase text-blue-black">Coupons</h2>`

- [ ] **Step 6: Update reviews list heading**

In `D:\admin-dashboard-v2\src\app\admin\pages\reviews\reviews-list.component.ts`, same change:

Change: `<h2 class="text-2xl font-bold uppercase text-blue-black">Reviews</h2>`
To: `<h2 class="text-3xl font-bold uppercase text-blue-black">Reviews</h2>`

- [ ] **Step 7: Build and verify**

Run: `cd D:\admin-dashboard-v2 && npx ng build --configuration development 2>&1 | Select-Object -Last 5`
Expected: Build succeeds

- [ ] **Step 8: Commit**

```bash
cd D:\admin-dashboard-v2
git add -A
git commit -m "style: update all list page headings to text-3xl for consistent typography"
```

---

### Task 3: Roles List Page Redesign

**Files:**
- Modify: `D:\admin-dashboard-v2\src\app\admin\pages\roles\roles-list.component.ts`

- [ ] **Step 1: Rewrite roles list component**

Replace the entire content of `D:\admin-dashboard-v2\src\app\admin\pages\roles\roles-list.component.ts` with:

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [RouterLink, ConfirmDialogComponent],
  template: `
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-bold uppercase text-blue-black">Roles</h2>
        <a routerLink="new" class="inline-flex items-center gap-2 rounded-md bg-salmon px-5 py-2.5 text-sm uppercase tracking-wider font-medium text-white hover:bg-[#e9855a] transition-colors">
          <i class="bi bi-plus-lg text-sm"></i>
          Add Role
        </a>
      </div>

      @if (roles().length === 0) {
        <div class="rounded-lg border border-[#F6F8FE] bg-white p-12 text-center">
          <i class="bi bi-shield-lock text-4xl text-[#c9c9c9]"></i>
          <p class="mt-3 text-sm text-[#797979]">No roles found</p>
        </div>
      } @else {
        <div class="rounded-lg border border-[#F6F8FE] bg-white overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="border-b border-[#F6F8FE] bg-[#F6F8FE]">
                <th class="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#797979]">Name</th>
                <th class="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#797979]">Permissions</th>
                <th class="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#797979]">Default</th>
                <th class="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-[#797979]">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (role of roles(); track role.id) {
                <tr class="border-b border-[#F6F8FE] hover:bg-[#F6F8FE] transition-colors cursor-pointer" (click)="router.navigate(['/admin/roles', role.id, 'edit'])">
                  <td class="px-6 py-4 text-sm font-semibold text-blue-black">{{ role.name }}</td>
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-1.5">
                      @for (group of getPermissionGroups(role.permissions); track group) {
                        <span class="inline-block rounded-full bg-almond px-2.5 py-1 text-xs font-medium text-blue-black">{{ group }}</span>
                      }
                      @if (getExtraCount(role.permissions) > 0) {
                        <span class="inline-block rounded-full bg-[#F6F8FE] px-2.5 py-1 text-xs font-medium text-[#797979]">+{{ getExtraCount(role.permissions) }}</span>
                      }
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    @if (role.isDefault) {
                      <i class="bi bi-check-circle-fill text-lg text-green-500"></i>
                    } @else {
                      <i class="bi bi-dash text-lg text-[#c9c9c9]"></i>
                    }
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2" (click)="$event.stopPropagation()">
                      <button (click)="router.navigate(['/admin/roles', role.id, 'edit'])" class="p-2 text-[#797979] hover:text-salmon transition-colors rounded-md hover:bg-almond">
                        <i class="bi bi-pencil text-sm"></i>
                      </button>
                      <button (click)="confirmDelete(role.id)" class="p-2 text-[#797979] hover:text-[#ff4545] transition-colors rounded-md hover:bg-red-50">
                        <i class="bi bi-trash text-sm"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <app-confirm-dialog
      [open]="showDeleteDialog()"
      title="Delete Role"
      message="Are you sure you want to delete this role? This action cannot be undone."
      (confirm)="deleteRole()"
      (cancel)="showDeleteDialog.set(false)"
    />
  `,
})
export class RolesListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected router = inject(Router);
  roles = signal<any[]>([]);
  totalCount = signal(0);
  showDeleteDialog = signal(false);
  deleteId: string | null = null;

  private permissionGroupMap: Record<string, string> = {
    dashboard: 'Dashboard',
    products: 'Products',
    categories: 'Categories',
    orders: 'Orders',
    users: 'Users',
    coupons: 'Coupons',
    content: 'Content',
    reviews: 'Reviews',
    roles: 'Roles',
  };

  ngOnInit(): void {
    this.entityService.list<any>('roles').subscribe((data) => {
      this.roles.set(data);
      this.totalCount.set(data.length);
    });
  }

  getPermissionGroups(permissions: string[]): string[] {
    if (!permissions) return [];
    const groups = new Set<string>();
    for (const perm of permissions) {
      const prefix = perm.split(':')[0];
      const label = this.permissionGroupMap[prefix] || prefix;
      groups.add(label);
    }
    return Array.from(groups).slice(0, 3);
  }

  getExtraCount(permissions: string[]): number {
    if (!permissions) return 0;
    const groups = new Set<string>();
    for (const perm of permissions) {
      groups.add(perm.split(':')[0]);
    }
    return Math.max(0, groups.size - 3);
  }

  confirmDelete(id: string): void {
    this.deleteId = id;
    this.showDeleteDialog.set(true);
  }

  deleteRole(): void {
    if (this.deleteId) {
      this.entityService.delete('roles', this.deleteId).subscribe(() => {
        this.entityService.list<any>('roles').subscribe((data) => {
          this.roles.set(data);
          this.totalCount.set(data.length);
        });
        this.showDeleteDialog.set(false);
        this.deleteId = null;
      });
    }
  }
}
```

- [ ] **Step 2: Build and verify**

Run: `cd D:\admin-dashboard-v2 && npx ng build --configuration development 2>&1 | Select-Object -Last 5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd D:\admin-dashboard-v2
git add -A
git commit -m "feat: redesign roles list with permission chips, actions column, empty state"
```

---

### Task 4: Role Form Page Redesign — Grouped Permissions

**Files:**
- Modify: `D:\admin-dashboard-v2\src\app\admin\pages\roles\role-form.component.ts`

- [ ] **Step 1: Rewrite role form component**

Replace the entire content of `D:\admin-dashboard-v2\src\app\admin\pages\roles\role-form.component.ts` with:

```typescript
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EntityService } from '../../../core/services/entity.service';

interface PermissionGroup {
  key: string;
  label: string;
  permissions: { key: string; label: string }[];
}

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-8">
      <div class="flex items-center gap-4">
        <button (click)="router.navigate(['/admin/roles'])" class="p-2 text-[#797979] hover:text-blue-black hover:bg-almond rounded-md transition-colors">
          <i class="bi bi-arrow-left text-lg"></i>
        </button>
        <h2 class="text-3xl font-bold uppercase text-blue-black">{{ isEdit() ? 'Edit' : 'New' }} Role</h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Panel: Role Info -->
        <div class="lg:col-span-1">
          <div class="rounded-lg border border-[#F6F8FE] bg-white p-8 space-y-6">
            <h3 class="text-base font-semibold uppercase tracking-wider text-[#797979]">Role Information</h3>
            <div>
              <label class="block text-xs font-medium uppercase tracking-wider text-[#797979] mb-2">Role Name</label>
              <input
                [(ngModel)]="form.name"
                name="name"
                required
                placeholder="e.g. Editor, Manager"
                class="w-full rounded-md border border-[#c9c9c9] px-4 py-2.5 text-sm outline-none focus:border-salmon transition-colors"
              />
            </div>
            <div class="pt-2">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="form.isDefault"
                  name="isDefault"
                  class="w-4 h-4 rounded border-[#c9c9c9] text-salmon focus:ring-salmon accent-[#FD8F5F]"
                />
                <div>
                  <span class="text-sm font-medium text-blue-black">Default Role</span>
                  <p class="text-xs text-[#797979] mt-0.5">Automatically assigned to new users</p>
                </div>
              </label>
            </div>

            <div class="pt-4 border-t border-[#F6F8FE]">
              <div class="text-sm text-[#797979]">
                <span class="font-semibold text-blue-black">{{ selectedCount() }}</span> of <span class="font-semibold text-blue-black">{{ totalCount() }}</span> permissions selected
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Permissions -->
        <div class="lg:col-span-2">
          <div class="rounded-lg border border-[#F6F8FE] bg-white p-8 space-y-6">
            <h3 class="text-base font-semibold uppercase tracking-wider text-[#797979]">Permissions</h3>

            @for (group of permissionGroups; track group.key) {
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="text-sm font-semibold uppercase tracking-wider text-blue-black">{{ group.label }}</h4>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      [checked]="isGroupFullySelected(group)"
                      [indeterminate]="isGroupPartiallySelected(group)"
                      (change)="toggleGroup(group)"
                      class="w-3.5 h-3.5 rounded border-[#c9c9c9] text-salmon focus:ring-salmon accent-[#FD8F5F]"
                    />
                    <span class="text-xs text-[#797979]">Select All</span>
                  </label>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  @for (perm of group.permissions; track perm.key) {
                    <label
                      class="flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer transition-colors"
                      [class]="form.permissions.includes(perm.key) ? 'bg-salmon/10 text-salmon border border-salmon/30' : 'bg-[#F6F8FE] text-[#646D77] border border-transparent hover:bg-almond'"
                    >
                      <input
                        type="checkbox"
                        [checked]="form.permissions.includes(perm.key)"
                        (change)="togglePermission(perm.key)"
                        class="w-3.5 h-3.5 rounded border-[#c9c9c9] text-salmon focus:ring-salmon accent-[#FD8F5F]"
                      />
                      <span>{{ perm.label }}</span>
                    </label>
                  }
                </div>
              </div>
              @if (!$last) {
                <div class="border-b border-[#F6F8FE]"></div>
              }
            }
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-3">
        <button
          type="button"
          (click)="router.navigate(['/admin/roles'])"
          class="rounded-md border border-[#c9c9c9] px-6 py-2.5 text-sm font-medium text-[#646D77] hover:bg-almond transition-colors">
          Cancel
        </button>
        <button
          type="button"
          (click)="submit()"
          [disabled]="saving()"
          class="rounded-md bg-salmon px-6 py-2.5 text-sm font-medium uppercase tracking-wider text-white hover:bg-[#e9855a] disabled:opacity-50 transition-colors">
          {{ saving() ? 'Saving...' : 'Save Role' }}
        </button>
      </div>
    </div>
  `,
})
export class RoleFormComponent implements OnInit {
  private entityService = inject(EntityService);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  isEdit = signal(false);
  saving = signal(false);
  roleId = '';
  form = { name: '', permissions: [] as string[], isDefault: false };

  permissionGroups: PermissionGroup[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      permissions: [{ key: 'dashboard:read', label: 'Read' }],
    },
    {
      key: 'products',
      label: 'Products',
      permissions: [
        { key: 'products:read', label: 'Read' },
        { key: 'products:create', label: 'Create' },
        { key: 'products:update', label: 'Update' },
        { key: 'products:delete', label: 'Delete' },
      ],
    },
    {
      key: 'categories',
      label: 'Categories',
      permissions: [
        { key: 'categories:read', label: 'Read' },
        { key: 'categories:create', label: 'Create' },
        { key: 'categories:update', label: 'Update' },
        { key: 'categories:delete', label: 'Delete' },
      ],
    },
    {
      key: 'orders',
      label: 'Orders',
      permissions: [
        { key: 'orders:read', label: 'Read' },
        { key: 'orders:update', label: 'Update' },
        { key: 'orders:delete', label: 'Delete' },
      ],
    },
    {
      key: 'users',
      label: 'Users',
      permissions: [
        { key: 'users:read', label: 'Read' },
        { key: 'users:create', label: 'Create' },
        { key: 'users:update', label: 'Update' },
        { key: 'users:delete', label: 'Delete' },
      ],
    },
    {
      key: 'coupons',
      label: 'Coupons',
      permissions: [
        { key: 'coupons:read', label: 'Read' },
        { key: 'coupons:create', label: 'Create' },
        { key: 'coupons:update', label: 'Update' },
        { key: 'coupons:delete', label: 'Delete' },
      ],
    },
    {
      key: 'content',
      label: 'Content',
      permissions: [
        { key: 'content:read', label: 'Read' },
        { key: 'content:create', label: 'Create' },
        { key: 'content:update', label: 'Update' },
        { key: 'content:delete', label: 'Delete' },
      ],
    },
    {
      key: 'reviews',
      label: 'Reviews',
      permissions: [
        { key: 'reviews:read', label: 'Read' },
        { key: 'reviews:delete', label: 'Delete' },
      ],
    },
    {
      key: 'roles',
      label: 'Roles',
      permissions: [
        { key: 'roles:read', label: 'Read' },
        { key: 'roles:create', label: 'Create' },
        { key: 'roles:update', label: 'Update' },
        { key: 'roles:delete', label: 'Delete' },
        { key: 'roles:manage', label: 'Manage' },
      ],
    },
  ];

  selectedCount = computed(() => this.form.permissions.length);
  totalCount = computed(() => this.permissionGroups.reduce((sum, g) => sum + g.permissions.length, 0));

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id') || '';
    if (this.roleId) {
      this.isEdit.set(true);
      this.entityService.get<any>('roles', this.roleId).subscribe((r) => {
        this.form = { name: r.name, permissions: r.permissions || [], isDefault: r.isDefault || false };
      });
    }
  }

  isGroupFullySelected(group: PermissionGroup): boolean {
    return group.permissions.every((p) => this.form.permissions.includes(p.key));
  }

  isGroupPartiallySelected(group: PermissionGroup): boolean {
    const selected = group.permissions.filter((p) => this.form.permissions.includes(p.key)).length;
    return selected > 0 && selected < group.permissions.length;
  }

  toggleGroup(group: PermissionGroup): void {
    if (this.isGroupFullySelected(group)) {
      this.form.permissions = this.form.permissions.filter((p) => !group.permissions.some((gp) => gp.key === p));
    } else {
      const groupKeys = group.permissions.map((p) => p.key);
      this.form.permissions = [...new Set([...this.form.permissions, ...groupKeys])];
    }
  }

  togglePermission(perm: string): void {
    if (this.form.permissions.includes(perm)) {
      this.form.permissions = this.form.permissions.filter((p) => p !== perm);
    } else {
      this.form.permissions.push(perm);
    }
  }

  submit(): void {
    this.saving.set(true);
    const req = this.isEdit()
      ? this.entityService.update('roles', this.roleId, this.form)
      : this.entityService.create('roles', this.form);
    req.subscribe({
      next: () => this.router.navigate(['/admin/roles']),
      error: () => this.saving.set(false),
    });
  }
}
```

- [ ] **Step 2: Build and verify**

Run: `cd D:\admin-dashboard-v2 && npx ng build --configuration development 2>&1 | Select-Object -Last 5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd D:\admin-dashboard-v2
git add -A
git commit -m "feat: redesign role form with two-panel layout, grouped permissions, select-all"
```

---

### Task 5: Final Build Verification

- [ ] **Step 1: Full production build**

Run: `cd D:\admin-dashboard-v2 && npx ng build 2>&1 | Select-Object -Last 10`
Expected: Build succeeds with no errors

- [ ] **Step 2: Final commit (if any fixups needed)**

```bash
cd D:\admin-dashboard-v2
git add -A
git commit -m "chore: final design enhancement verification"
```
