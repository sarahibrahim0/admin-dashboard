import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EntityService } from '../../../core/services/entity.service';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="mx-auto max-w-2xl space-y-6">
      <h2 class="text-2xl font-bold uppercase text-blue-black">{{ isEdit() ? 'Edit' : 'New' }} Role</h2>
      <form (ngSubmit)="submit()" class="space-y-4 rounded-lg border border-[#F6F8FE] bg-white p-6">
        <div>
          <label class="block text-sm font-medium text-[#646D77]">Name</label>
          <input [(ngModel)]="form.name" name="name" required class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
        </div>
        <div>
          <label class="flex items-center gap-2">
            <input type="checkbox" [(ngModel)]="form.isDefault" name="isDefault" class="rounded" />
            <span class="text-sm font-medium text-[#646D77]">Default Role (assigned to new users)</span>
          </label>
        </div>
        <div>
          <label class="block text-sm font-medium text-[#646D77] mb-2">Permissions</label>
          <div class="grid grid-cols-2 gap-2">
            @for (perm of allPermissions; track perm) {
              <label class="flex items-center gap-2 text-sm">
                <input type="checkbox" [checked]="form.permissions.includes(perm)" (change)="togglePermission(perm)" class="rounded" />
                {{ perm }}
              </label>
            }
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <button type="button" (click)="router.navigate(['/admin/roles'])" class="rounded-md border border-[#c9c9c9] px-4 py-2 text-sm text-[#646D77] hover:bg-almond">Cancel</button>
          <button type="submit" [disabled]="saving()" class="rounded-md bg-salmon px-4 py-2 text-sm uppercase tracking-wider text-white hover:bg-[#e9855a] disabled:opacity-50">{{ saving() ? 'Saving...' : 'Save' }}</button>
        </div>
      </form>
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

  allPermissions = [
    'dashboard:read',
    'products:read', 'products:create', 'products:update', 'products:delete',
    'categories:read', 'categories:create', 'categories:update', 'categories:delete',
    'orders:read', 'orders:update', 'orders:delete',
    'users:read', 'users:create', 'users:update', 'users:delete',
    'coupons:read', 'coupons:create', 'coupons:update', 'coupons:delete',
    'content:read', 'content:create', 'content:update', 'content:delete',
    'reviews:read', 'reviews:delete',
    'roles:read', 'roles:create', 'roles:update', 'roles:delete', 'roles:manage',
  ];

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id') || '';
    if (this.roleId) {
      this.isEdit.set(true);
      this.entityService.get<any>('roles', this.roleId).subscribe((r) => {
        this.form = { name: r.name, permissions: r.permissions || [], isDefault: r.isDefault || false };
      });
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
    req.subscribe({ next: () => this.router.navigate(['/admin/roles']), error: () => this.saving.set(false) });
  }
}
