import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { LanguageService } from '../../../core/services/language.service';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';

import { DetailHeaderComponent } from '../../../shared/ui/detail-header.component';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [TranslatePipe, DetailHeaderComponent],
  template: `
    <div class="w-full space-y-6">
        <app-detail-header [title]="localized(user()?.name)" eyebrow="Team member"
        backLabel="Back to users" backTo="/admin/users"
        editLabel="Edit" [editTo]="['/admin/users', user()?.id, 'edit']" />
      @if (user()) {
        <div class="card">
          <dl class="grid grid-cols-1 gap-5 text-sm sm:grid-cols-2">
            <div><dt class="spec-dt">{{ 'Email:' | translate }}</dt><dd class="spec-dd">{{ user()?.email }}</dd></div>
            <div><dt class="spec-dt">{{ 'Phone:' | translate }}</dt><dd class="spec-dd">{{ user()?.phone }}</dd></div>
            <div><dt class="spec-dt">{{ 'Admin:' | translate }}</dt><dd class="spec-dd">{{ user()?.isAdmin ? ('Yes' | translate) : ('No' | translate) }}</dd></div>
            <div><dt class="spec-dt">{{ 'Role:' | translate }}</dt><dd class="spec-dd">{{ localized(user()?.role?.name) || ('None' | translate) }}</dd></div>
            <div class="sm:col-span-2"><dt class="spec-dt">{{ 'Address:' | translate }}</dt><dd class="spec-dd">{{ address() }}</dd></div>
          </dl>
        </div>
      }
    </div>
  `,
})
export class UserDetailComponent implements OnInit {
  private entityService = inject(EntityService);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  private language = inject(LanguageService);
  user = signal<any>(null);

  localized(v: any): string {
    return this.language.localizedValue(v);
  }

  address(): string {
    const u = this.user();
    if (!u) return '-';
    return [u.street, u.city, u.country].filter((x: any) => !!x).join(', ') || '-';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.entityService.get<any>('users', id).subscribe((u) => this.user.set(u));
  }
}
