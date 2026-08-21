import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableColumn } from './table-column';

@Component({
  selector: 'app-base-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rounded-lg border border-[#F6F8FE] bg-white">
      <div class="flex items-center justify-between border-b border-[#F6F8FE] px-4 py-3">
        <div class="flex items-center gap-3">
          <input type="text" placeholder="Search..." [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event); searchChange.emit($event)" class="rounded-md border border-[#c9c9c9] px-3 py-1.5 text-sm outline-none focus:border-salmon" />
          @if (selectedIds().length > 0) {
            <span class="text-sm text-[#797979]">{{ selectedIds().length }} selected</span>
          }
        </div>
        <div class="flex items-center gap-2">
          <ng-content select="[actions]"></ng-content>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-[#F6F8FE] bg-almond">
              @if (selectable) {
                <th class="w-10 px-4 py-3"><input type="checkbox" (change)="toggleAll($event)" /></th>
              }
              @for (col of columns; track col.field) {
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#797979]" [style.width]="col.width" [class.cursor-pointer]="col.sortable" (click)="col.sortable && toggleSort(col.field)">
                  <div class="flex items-center gap-1">
                    {{ col.header }}
                    @if (col.sortable && sortField() === col.field) {
                      <span>{{ sortDir() === 'asc' ? '▲' : '▼' }}</span>
                    }
                  </div>
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of data(); track row.id) {
              <tr class="border-b border-[#F6F8FE] hover:bg-almond cursor-pointer" [class.bg-almond]="selectedIds().includes(row.id)" (click)="rowClick.emit(row)">
                @if (selectable) {
                  <td class="px-4 py-3" (click)="$event.stopPropagation()"><input type="checkbox" [checked]="selectedIds().includes(row.id)" (change)="toggleSelect(row.id)" /></td>
                }
                @for (col of columns; track col.field) {
                  <td class="px-4 py-3 text-sm text-[#646D77]" [class.text-center]="col.align === 'center'" [class.text-right]="col.align === 'right'">
                    @if (col.format) { {{ col.format(row[col.field], row) }} } @else { {{ row[col.field] }} }
                  </td>
                }
              </tr>
            } @empty {
              <tr><td [attr.colspan]="columns.length + (selectable ? 1 : 0)" class="px-4 py-8 text-center text-sm text-[#797979]">No data found</td></tr>
            }
          </tbody>
        </table>
      </div>
      <div class="flex items-center justify-between border-t border-[#F6F8FE] px-4 py-3">
        <span class="text-sm text-[#797979]">Showing {{ totalCount() === 0 ? 0 : (currentPage() - 1) * pageSize() + 1 }} to {{ Math.min(currentPage() * pageSize(), totalCount()) }} of {{ totalCount() }}</span>
        <div class="flex items-center gap-1">
          <button (click)="currentPage.set(currentPage() - 1); pageChange.emit(currentPage())" [disabled]="currentPage() <= 1" class="rounded px-3 py-1 text-sm text-[#646D77] hover:bg-[#ecd7cd] disabled:opacity-50">Previous</button>
          @for (p of visiblePages(); track p) {
            <button (click)="currentPage.set(p); pageChange.emit(p)" [class.bg-salmon]="p === currentPage()" [class.text-white]="p === currentPage()" class="rounded px-3 py-1 text-sm hover:bg-[#ecd7cd]">{{ p }}</button>
          }
          <button (click)="currentPage.set(currentPage() + 1); pageChange.emit(currentPage())" [disabled]="currentPage() >= totalPages()" class="rounded px-3 py-1 text-sm text-[#646D77] hover:bg-[#ecd7cd] disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  `,
})
export class BaseTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data = signal<any[]>([]);
  @Input() totalCount = signal(0);
  @Input() selectable = false;
  @Input() pageSize = signal(10);
  @Output() searchChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<{ field: string; dir: 'asc' | 'desc' }>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() selectionChange = new EventEmitter<string[]>();
  @Output() rowClick = new EventEmitter<any>();

  searchQuery = signal('');
  sortField = signal('');
  sortDir = signal<'asc' | 'desc'>('asc');
  currentPage = signal(1);
  selectedIds = signal<string[]>([]);
  protected readonly Math = Math;

  get totalPages(): () => number {
    return () => Math.ceil(this.totalCount() / this.pageSize());
  }

  get visiblePages(): () => number[] {
    return () => {
      const total = this.totalPages();
      const current = this.currentPage();
      const pages: number[] = [];
      const start = Math.max(1, current - 2);
      const end = Math.min(total, current + 2);
      for (let i = start; i <= end; i++) pages.push(i);
      return pages;
    };
  }

  toggleSort(field: string): void {
    if (this.sortField() === field) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }
    this.sortChange.emit({ field: this.sortField(), dir: this.sortDir() });
  }

  toggleSelect(id: string): void {
    this.selectedIds.update((ids) => ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]);
    this.selectionChange.emit(this.selectedIds());
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedIds.set(checked ? this.data().map((r) => r.id) : []);
    this.selectionChange.emit(this.selectedIds());
  }

  clearSelection(): void {
    this.selectedIds.set([]);
    this.selectionChange.emit([]);
  }
}
