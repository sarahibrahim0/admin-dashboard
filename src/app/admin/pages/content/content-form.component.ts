import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EntityService } from '../../../core/services/entity.service';

@Component({
  selector: 'app-content-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="mx-auto max-w-2xl space-y-6">
      <h2 class="text-2xl font-bold uppercase text-blue-black">{{ isEdit() ? 'Edit' : 'New' }} Content Page</h2>
      <form (ngSubmit)="submit()" class="space-y-4 rounded-lg border border-[#F6F8FE] bg-white p-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-[#646D77]">Key (slug)</label>
            <input [(ngModel)]="form.key" name="key" required [disabled]="isEdit()" class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon disabled:bg-[#ecd7cd]" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#646D77]">Title</label>
            <input [(ngModel)]="form.title" name="title" required class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-[#646D77]">Subtitle</label>
          <input [(ngModel)]="form.subtitle" name="subtitle" class="mt-1 w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon" />
        </div>
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-medium text-[#646D77]">Sections</label>
            <button type="button" (click)="addSection()" class="text-sm text-salmon hover:text-[#e9855a]">+ Add Section</button>
          </div>
          @for (section of form.sections; track $index; let i = $index) {
            <div class="mb-3 rounded border border-[#F6F8FE] p-3 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-[#797979]">Section {{ i + 1 }}</span>
                <button type="button" (click)="removeSection(i)" class="text-xs text-[#ff4545] hover:text-[#e63e3e]">Remove</button>
              </div>
              <input [(ngModel)]="section.heading" [name]="'heading_' + i" placeholder="Heading" class="w-full rounded border border-[#c9c9c9] px-2 py-1 text-sm outline-none focus:border-salmon" />
              <textarea [(ngModel)]="section.body" [name]="'body_' + i" placeholder="Body" rows="3" class="w-full rounded border border-[#c9c9c9] px-2 py-1 text-sm outline-none focus:border-salmon"></textarea>
            </div>
          }
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <button type="button" (click)="router.navigate(['/admin/content'])" class="rounded-md border border-[#c9c9c9] px-4 py-2 text-sm text-[#646D77] hover:bg-almond">Cancel</button>
          <button type="submit" [disabled]="saving()" class="rounded-md bg-salmon px-4 py-2 text-sm uppercase tracking-wider text-white hover:bg-[#e9855a] disabled:opacity-50">{{ saving() ? 'Saving...' : 'Save' }}</button>
        </div>
      </form>
    </div>
  `,
})
export class ContentFormComponent implements OnInit {
  private entityService = inject(EntityService);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  isEdit = signal(false);
  saving = signal(false);
  contentId = '';
  form = { key: '', title: '', subtitle: '', sections: [] as { heading: string; body: string }[] };

  ngOnInit(): void {
    this.contentId = this.route.snapshot.paramMap.get('id') || '';
    if (this.contentId) {
      this.isEdit.set(true);
      this.entityService.get<any>('content', this.contentId).subscribe((c) => {
        this.form = { key: c.key, title: c.title, subtitle: c.subtitle || '', sections: c.sections || [] };
      });
    }
  }

  addSection(): void { this.form.sections.push({ heading: '', body: '' }); }
  removeSection(i: number): void { this.form.sections.splice(i, 1); }

  submit(): void {
    this.saving.set(true);
    const req = this.isEdit()
      ? this.entityService.update('content', this.contentId, this.form)
      : this.entityService.create('content', this.form);
    req.subscribe({ next: () => this.router.navigate(['/admin/content']), error: () => this.saving.set(false) });
  }
}
