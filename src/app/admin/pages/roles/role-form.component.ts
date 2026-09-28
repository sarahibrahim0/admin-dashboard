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
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            @for (group of permissionGroups; track group.key) {
              <div class="rounded-lg border border-[#eadbd4] bg-almond/50 p-5">
                <div class="mb-2 flex items-center justify-between">
                  <h4 class="text-base font-bold text-blue-black">{{ group.label | translate }}</h4>
                </div>
                <div>
                  <label class="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#646D77]">
                    <input type="checkbox" [checked]="hasRead(group)" (change)="toggleRead(group, $event)" class="rounded accent-salmon" />
                    {{ 'Read' | translate }}
                  </label>
                </div>
                <div class="mt-3 space-y-2">
                  @for (p of group.permissions; track p.key) {
                    @if (p.key !== group.key + ':read') {
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
      { key: 'dashboard:read', label: 'Read' },
      { key: 'dashboard:write', label: 'Write' },
    ]},
{ key: 'categories', label: 'Categories', permissions: [
      { key: 'categories:read', label: 'Read' },
      { key: 'categories:write', label: 'Write' },
      { key: 'categories:delete', label: 'Delete' },
    ]},
    { key: 'products', label: 'Products', permissions: [
      { key: 'products:read', label: 'Read' },
      { key: 'products:write', label: 'Write' },
      { key: 'products:delete', label: 'Delete' },
    ]},
    { key: 'users', label: 'Users', permissions: [
      { key: 'users:read', label: 'Read' },
      { key: 'users:write', label: 'Write' },
      { key: 'users:delete', label: 'Delete' },
    ]},
    { key: 'roles', label: 'Roles', permissions: [
      { key: 'roles:read', label: 'Read' },
      { key: 'roles:write', label: 'Write' },
      { key: 'roles:delete', label: 'Delete' },
    ]},
    { key: 'coupons', label: 'Coupons', permissions: [
      { key: 'coupons:read', label: 'Read' },
      { key: 'coupons:write', label: 'Write' },
      { key: 'coupons:delete', label: 'Delete' },
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

isDependent(key: string): boolean {
    return !key.endsWith(':read');
  }

  toggleRead(group: PermissionGroup, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const perms = new Set(this.form.controls.permissions.value || []);
    const readKey = `${group.key}:read`;
    if (checked) {
      perms.add(readKey);
    } else {
      group.permissions.forEach((p) => perms.delete(p.key));
    }
    this.form.controls.permissions.setValue([...perms]);
  }

  togglePermission(key: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const perms = new Set(this.form.controls.permissions.value || []);
    checked ? perms.add(key) : perms.delete(key);
    this.form.controls.permissions.setValue([...perms]);
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
      next: () => {
        this.saving.set(false);
        if (this.isEdit()) {
          this.form.markAsPristine();
          this.toast.success('Saved successfully');
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
