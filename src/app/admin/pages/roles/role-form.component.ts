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
