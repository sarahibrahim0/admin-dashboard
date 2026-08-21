import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  template: `
    <div class="mx-auto max-w-2xl space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold uppercase text-blue-black">{{ user()?.name }}</h2>
        <div class="flex gap-2">
          <button (click)="router.navigate(['/admin/users', user()?.id, 'edit'])" class="rounded-md border border-[#c9c9c9] px-4 py-2 text-sm text-[#646D77] hover:bg-almond">Edit</button>
          <button (click)="router.navigate(['/admin/users'])" class="text-sm text-salmon hover:text-[#e9855a]">← Back</button>
        </div>
      </div>
      @if (user()) {
        <div class="rounded-lg border border-[#F6F8FE] bg-white p-6 space-y-3 text-sm">
          <div><span class="text-[#797979]">Email:</span> {{ user()?.email }}</div>
          <div><span class="text-[#797979]">Phone:</span> {{ user()?.phone }}</div>
          <div><span class="text-[#797979]">Admin:</span> {{ user()?.isAdmin ? 'Yes' : 'No' }}</div>
          <div><span class="text-[#797979]">Role:</span> {{ user()?.role?.name || 'None' }}</div>
          <div><span class="text-[#797979]">Address:</span> {{ address() }}</div>
        </div>
      }
    </div>
  `,
})
export class UserDetailComponent implements OnInit {
  private entityService = inject(EntityService);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  user = signal<any>(null);

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
