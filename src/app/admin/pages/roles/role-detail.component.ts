import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { LanguageService } from '../../../core/services/language.service';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { DetailHeaderComponent } from '../../../shared/ui/detail-header.component';

@Component({
  selector: 'app-role-detail',
  standalone: true,
  imports: [TranslatePipe, DetailHeaderComponent],
  template: `
    <div class="w-full space-y-6">
      @if (role()) {
        <app-detail-header [title]="localized(role()?.name)" eyebrow="Role details"
          backLabel="Back to roles" backTo="/admin/roles"
          editLabel="Edit role" [editTo]="['/admin/roles', role()?.id, 'edit']" />
        <div class="card">
          <h3 class="section-title mb-5">{{ 'Role information' | translate }}</h3>
          <dl class="grid grid-cols-1 gap-5 text-sm sm:grid-cols-2">
            <div><dt class="spec-dt">{{ 'Name' | translate }}</dt><dd class="spec-dd">{{ localized(role()?.name) }}</dd></div>
            <div><dt class="spec-dt">{{ 'Default Role' | translate }}</dt><dd class="spec-dd">{{ role()?.isDefault ? ('Yes' | translate) : ('No' | translate) }}</dd></div>
          </dl>
        </div>
        <div class="card">
          <h3 class="section-title mb-5">{{ 'Permissions' | translate }}</h3>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            @for (group of permissionGroups; track group.key) {
              <div class="rounded-lg border border-[#eadbd4] bg-almond/50 p-5">
                <h4 class="mb-2 text-base font-bold text-blue-black">{{ group.label }}</h4>
                @if (permsFor(group.key).length > 0) {
                  <div class="flex flex-wrap gap-1.5">
                    @for (p of permsFor(group.key); track p) {
                      <span class="inline-block rounded-full bg-almond px-2.5 py-1 text-xs font-medium text-blue-black">{{ p }}</span>
                    }
                  </div>
                } @else {
                  <p class="text-sm text-[#797979]">{{ 'None' | translate }}</p>
                }
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="flex min-h-64 items-center justify-center text-sm text-[#797979]">{{ 'Loading...' | translate }}</div>
      }
    </div>
  `,
})
export class RoleDetailComponent implements OnInit {
  private entityService = inject(EntityService);
  private route = inject(ActivatedRoute);
  private language = inject(LanguageService);
  role = signal<any>(null);

  permissionGroups: { key: string; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'products', label: 'Products' },
    { key: 'categories', label: 'Categories' },
    { key: 'orders', label: 'Orders' },
    { key: 'users', label: 'Users' },
    { key: 'coupons', label: 'Coupons' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'roles', label: 'Roles' },
  ];

  localized(v: any): string {
    return this.language.localizedValue(v);
  }

  permsFor(group: string): string[] {
    return ((this.role()?.permissions || []) as string[]).filter((p) => p === group || p.startsWith(group + ':'));
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.entityService.get<any>('roles', id).subscribe((r) => this.role.set(r));
  }
}
