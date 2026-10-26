import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';
import { LocalizedFieldComponent } from '../../../shared/forms/localized-field.component';
import { FormConfirmsComponent } from '../../../shared/confirm-dialog/form-confirms.component';
import { joinLocalized, splitLocalized } from '../../../shared/utils/localized';

interface PermissionGroup {
  key: string;
  label: string;
  permissions: { key: string; label: string }[];
}

import { DetailHeaderComponent } from '../../../shared/ui/detail-header.component';
import { ToastService } from '../../../shared/ui/toast.service';
import { AuthStore } from '../../../core/stores/auth.store';
import { normalizeApiError } from '../../../core/services/api-error';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, LocalizedFieldComponent, DetailHeaderComponent, FormConfirmsComponent],
  template: `
    <div class="w-full space-y-6">
      <app-detail-header title="{{ isEdit() ? ('Edit role' | translate) : ('New role' | translate) }}"
        eyebrow="{{ isEdit() ? ('Update role' | translate) : ('New role' | translate) }}"
        backLabel="Back to roles" backTo="/admin/roles"
        saveLabel="Save role" cancelTo="/admin/roles" [saving]="saving()" (save)="showSaveDialog.set(true)" />
      <form id="role-form" [formGroup]="form" (ngSubmit)="showSaveDialog.set(true)" class="space-y-6">
        <section class="card">
          <h3 class="section-title mb-5">{{ 'Role information' | translate }}</h3>
          @if (submitError()) {
            <div class="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#ff4545]">{{ submitError() }}</div>
          }
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <app-localized-field [controlEn]="form.controls.nameEn" [controlAr]="form.controls.nameAr" [label]="'Name' | translate" [placeholder]="'Role name' | translate" [placeholderAr]="'اسم الدور'" [required]="true" [id]="'role-name'"></app-localized-field>
            <div>
              <label class="flex cursor-pointer items-center gap-2 pt-4">
                <input type="checkbox" [formControl]="form.controls.isDefault" class="rounded accent-salmon" />
                <span class="text-sm font-medium text-[#646D77]">{{ 'Default role' | translate }}</span>
              </label>
            </div>
          </div>
        </section>
        <section class="card">
          <h3 class="section-title mb-5">{{ 'Permissions' | translate }}</h3>
          <label class="mb-5 flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#646D77]">
            <input
              type="checkbox"
              [checked]="allPermissionsSelected()"
              [indeterminate]="somePermissionsSelected() && !allPermissionsSelected()"
              (change)="toggleAllPermissions($event)"
              class="rounded accent-salmon" />
            {{ 'Select all permissions' | translate }}
          </label>
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            @for (group of permissionGroups; track group.key) {
              <div class="rounded-lg border border-[#eadbd4] bg-almond/50 p-5">
                <div class="mb-2 flex items-center justify-between">
                  <h4 class="text-base font-bold text-blue-black">{{ group.label | translate }}</h4>
                </div>
                <label class="mb-3 flex cursor-pointer items-center gap-2 text-sm font-medium text-[#646D77]">
                  <input
                    type="checkbox"
                    [checked]="isGroupFullySelected(group)"
                    [indeterminate]="hasGroupPermission(group) && !isGroupFullySelected(group)"
                    (change)="toggleGroupPermissions(group, $event)"
                    class="rounded accent-salmon" />
                  {{ 'Select all' | translate }}
                </label>
                <div class="mt-3 space-y-2">
                  @for (p of group.permissions; track p.key) {
                    <label class="flex cursor-pointer items-center gap-2 text-sm text-[#646D77]">
                      <input
                        type="checkbox"
                        [checked]="hasPermission(p.key)"
                        [disabled]="isDependent(p.key) && !hasRead(group)"
                        (change)="togglePermission(p.key, $event)"
                        class="rounded accent-salmon" />
                      {{ p.label | translate }}
                    </label>
                  }
                </div>
              </div>
            }
          </div>
        </section>

      </form>
      <app-form-confirms [saveOpen]="showSaveDialog()" (save)="confirmSave()" (saveCancel)="showSaveDialog.set(false)" />
    </div>
  `,
})
export class RoleFormComponent implements OnInit {
private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  private toast = inject(ToastService);
  private auth = inject(AuthStore);
  private http = inject(HttpClient);
  private language = inject(LanguageService);

  isEdit = signal(false);
  saving = signal(false);
  submitError = signal<string | null>(null);
  showSaveDialog = signal(false);
  roleId = '';

  confirmSave(): void {
    this.showSaveDialog.set(false);
    this.submit();
  }

  form = this.fb.group({
    nameEn: ['', Validators.required],
    nameAr: [''],
    isDefault: [false],
    permissions: [[] as string[]],
  });

  permissionGroups: PermissionGroup[] = [
    { key: 'dashboard', label: 'Dashboard', permissions: [
      { key: 'dashboard:read', label: 'View' },
      { key: 'dashboard:write', label: 'Edit' },
    ]},
{ key: 'categories', label: 'Categories', permissions: [
      { key: 'categories:read', label: 'View' },
      { key: 'categories:write', label: 'Edit' },
      { key: 'categories:delete', label: 'Delete' },
    ]},
    { key: 'products', label: 'Products', permissions: [
      { key: 'products:read', label: 'View' },
      { key: 'products:write', label: 'Edit' },
      { key: 'products:delete', label: 'Delete' },
    ]},
    { key: 'users', label: 'Users', permissions: [
      { key: 'users:read', label: 'View' },
      { key: 'users:write', label: 'Edit' },
      { key: 'users:delete', label: 'Delete' },
    ]},
    { key: 'roles', label: 'Roles', permissions: [
      { key: 'roles:read', label: 'View' },
      { key: 'roles:write', label: 'Edit' },
      { key: 'roles:delete', label: 'Delete' },
    ]},
    { key: 'coupons', label: 'Coupons', permissions: [
      { key: 'coupons:read', label: 'View' },
      { key: 'coupons:write', label: 'Edit' },
      { key: 'coupons:delete', label: 'Delete' },
    ]},
    { key: 'orders', label: 'Orders', permissions: [
      { key: 'orders:read', label: 'View' },
      { key: 'orders:write', label: 'Edit' },
      { key: 'orders:delete', label: 'Delete' },
    ]},
    { key: 'reviews', label: 'Reviews', permissions: [
      { key: 'reviews:read', label: 'View' },
      { key: 'reviews:write', label: 'Edit' },
      { key: 'reviews:delete', label: 'Delete' },
    ]},
    { key: 'payments', label: 'Payments', permissions: [
      { key: 'payments:read', label: 'View' },
      { key: 'payments:write', label: 'Edit' },
      { key: 'payments:delete', label: 'Delete' },
    ]},
    { key: 'countries', label: 'Countries', permissions: [
      { key: 'countries:read', label: 'View' },
      { key: 'countries:write', label: 'Edit' },
      { key: 'countries:delete', label: 'Delete' },
    ]},
    { key: 'currencies', label: 'Currencies', permissions: [
      { key: 'currencies:read', label: 'View' },
      { key: 'currencies:write', label: 'Edit' },
      { key: 'currencies:delete', label: 'Delete' },
    ]},
    { key: 'audit-logs', label: 'Audit Logs', permissions: [
      { key: 'audit-logs:read', label: 'View' },
      { key: 'audit-logs:write', label: 'Edit' },
      { key: 'audit-logs:delete', label: 'Delete' },
    ]},
    { key: 'settings', label: 'Settings', permissions: [
      { key: 'settings:read', label: 'View' },
      { key: 'settings:write', label: 'Edit' },
      { key: 'settings:delete', label: 'Delete' },
    ]},
  ];

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id') || '';
    if (this.roleId) {
      this.isEdit.set(true);
      this.http.get<any>(`${environment.apiUrl}roles/${this.roleId}`).subscribe((r) => {
        const name = splitLocalized(r.name);
        this.form.patchValue({
          nameEn: name.en,
          nameAr: name.ar,
          isDefault: !!r.isDefault,
          permissions: r.permissions || [],
        });
      });
    }
  }

  hasPermission(key: string): boolean {
    return (this.form.controls.permissions.value || []).includes(key);
  }

  hasRead(group: PermissionGroup): boolean {
    return this.hasPermission(`${group.key}:read`);
  }

  hasGroupPermission(group: PermissionGroup): boolean {
    return group.permissions.some((permission) => this.hasPermission(permission.key));
  }

  isGroupFullySelected(group: PermissionGroup): boolean {
    return group.permissions.every((permission) => this.hasPermission(permission.key));
  }

  allPermissionsSelected(): boolean {
    return this.permissionGroups.every((group) => this.isGroupFullySelected(group));
  }

  somePermissionsSelected(): boolean {
    return this.permissionGroups.some((group) => this.hasGroupPermission(group));
  }

  isDependent(key: string): boolean {
    return !key.endsWith(':read');
  }

  toggleGroupPermissions(group: PermissionGroup, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const perms = new Set(this.form.controls.permissions.value || []);
    if (checked) {
      group.permissions.forEach((permission) => perms.add(permission.key));
    } else {
      group.permissions.forEach((permission) => perms.delete(permission.key));
    }
    this.form.controls.permissions.setValue([...perms]);
    this.form.controls.permissions.markAsDirty();
  }

  toggleAllPermissions(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const perms = new Set(this.form.controls.permissions.value || []);
    this.permissionGroups.forEach((group) => {
      group.permissions.forEach((permission) => {
        if (checked) {
          perms.add(permission.key);
        } else {
          perms.delete(permission.key);
        }
      });
    });
    this.form.controls.permissions.setValue([...perms]);
    this.form.controls.permissions.markAsDirty();
  }

  togglePermission(key: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const perms = new Set(this.form.controls.permissions.value || []);
    if (checked) {
      perms.add(key);
    } else {
      perms.delete(key);
      if (key.endsWith(':read')) {
        const group = this.permissionGroups.find((permissionGroup) => key === `${permissionGroup.key}:read`);
        group?.permissions.forEach((permission) => perms.delete(permission.key));
      }
    }
    this.form.controls.permissions.setValue([...perms]);
    this.form.controls.permissions.markAsDirty();
  }

  submit(): void {
    if (this.saving()) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.form.pristine) {
      this.toast.info('No changes to save');
      return;
    }
    this.saving.set(true);
    this.submitError.set(null);
    const v = this.form.getRawValue();
    const body: any = {
      ...v,
      name: joinLocalized(v.nameEn, v.nameAr),
    };
    delete body.nameEn;
    delete body.nameAr;
    const req = this.isEdit()
      ? this.http.put<any>(`${environment.apiUrl}roles/${this.roleId}`, body)
      : this.http.post<any>(`${environment.apiUrl}roles`, body);
    req.subscribe({
      next: async () => {
        this.saving.set(false);
        if (this.isEdit()) {
          this.form.markAsPristine();
          this.toast.success('Saved successfully');
          try {
            const currentRoleRefreshed = await this.auth.refreshCurrentRole(this.roleId);
            if (currentRoleRefreshed && !this.auth.hasPermission('roles:write')) {
              await this.router.navigateByUrl('/admin/dashboard');
            }
          } catch (err) {
            this.toast.error(normalizeApiError(err).message);
          }
        } else {
          this.toast.success('Saved successfully');
          this.router.navigate(['/admin/roles']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.submitError.set(err?.error?.message || 'Could not save role');
      },
    });
  }
}
