import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EntityService } from '../../../core/services/entity.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="mx-auto max-w-lg space-y-6">
      <h2 class="text-2xl font-bold text-slate-900">{{ isEdit() ? 'Edit' : 'New' }} User</h2>
      <form (ngSubmit)="submit()" class="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label class="block text-sm font-medium text-slate-700">Name</label>
          <input [(ngModel)]="form.name" name="name" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Email</label>
          <input [(ngModel)]="form.email" name="email" type="email" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Phone</label>
          <input [(ngModel)]="form.phone" name="phone" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </div>
        @if (!isEdit()) {
          <div>
            <label class="block text-sm font-medium text-slate-700">Password</label>
            <input [(ngModel)]="form.password" name="password" type="password" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>
        }
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700">City</label>
            <input [(ngModel)]="form.city" name="city" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Country</label>
            <input [(ngModel)]="form.country" name="country" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <button type="button" (click)="router.navigate(['/admin/users'])" class="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" [disabled]="saving()" class="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50">{{ saving() ? 'Saving...' : 'Save' }}</button>
        </div>
      </form>
    </div>
  `,
})
export class UserFormComponent implements OnInit {
  private entityService = inject(EntityService);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  isEdit = signal(false);
  saving = signal(false);
  userId = '';
  form = { name: '', email: '', phone: '', password: '', city: '', country: '' };

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (this.userId) {
      this.isEdit.set(true);
      this.entityService.get<any>('users', this.userId).subscribe((u) => {
        this.form = { name: u.name, email: u.email, phone: u.phone || '', password: '', city: u.city || '', country: u.country || '' };
      });
    }
  }

  submit(): void {
    this.saving.set(true);
    const body: any = { ...this.form };
    if (this.isEdit() && !body.password) delete body.password;
    const req = this.isEdit()
      ? this.entityService.update('users', this.userId, body)
      : this.entityService.create('users', body);
    req.subscribe({ next: () => this.router.navigate(['/admin/users']), error: () => this.saving.set(false) });
  }
}
