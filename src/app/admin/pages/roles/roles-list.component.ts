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
