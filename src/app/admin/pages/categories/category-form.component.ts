import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EntityService } from '../../../core/services/entity.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="mx-auto max-w-lg space-y-6">
      <h2 class="text-2xl font-bold text-slate-900">{{ isEdit() ? 'Edit' : 'New' }} Category</h2>
      <form (ngSubmit)="submit()" class="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label class="block text-sm font-medium text-slate-700">Name</label>
          <input [(ngModel)]="form.name" name="name" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Icon</label>
          <input [(ngModel)]="form.icon" name="icon" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Color</label>
          <input [(ngModel)]="form.color" name="color" type="color" class="mt-1 h-10 w-full rounded-md border border-slate-300" />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <button type="button" (click)="router.navigate(['/admin/categories'])" class="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" [disabled]="saving()" class="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50">{{ saving() ? 'Saving...' : 'Save' }}</button>
        </div>
      </form>
    </div>
  `,
})
export class CategoryFormComponent implements OnInit {
  private entityService = inject(EntityService);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  isEdit = signal(false);
  saving = signal(false);
  categoryId = '';
  form = { name: '', icon: '', color: '' };

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id') || '';
    if (this.categoryId) {
      this.isEdit.set(true);
      this.entityService.get<any>('categories', this.categoryId).subscribe((c) => {
        this.form = { name: c.name, icon: c.icon || '', color: c.color || '' };
      });
    }
  }

  submit(): void {
    this.saving.set(true);
    const req = this.isEdit()
      ? this.entityService.update('categories', this.categoryId, this.form)
      : this.entityService.create('categories', this.form);
    req.subscribe({ next: () => this.router.navigate(['/admin/categories']), error: () => this.saving.set(false) });
  }
}
