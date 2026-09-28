import { Component, DestroyRef, EventEmitter, Input, OnInit, Output, Signal, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { TableColumn, TableAction, TableCellContent } from './table-column';
import { TableQueryState, readTableQuery, sameTableQuery, tableQueryParams } from './table-query';
import { TranslatePipe } from '../i18n/translate.pipe';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-base-table',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  styles: `
    :host { display: block; }
  `,
  template: `
    <div class="overflow-hidden rounded-lg border border-[#eff2f5] bg-white">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#eff2f5] px-4 py-4 sm:px-5">
        <div class="flex items-center gap-3">
          @if (showSearch && searchChange.observed) {
            <div class="relative">
              <svg class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1a5b7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
              <input type="text" [placeholder]="'Search...' | translate" [ngModel]="searchQuery()" (ngModelChange)="onSearchInput($event)" class="w-full rounded-md border-0 bg-[#f5f8fa] py-2 pe-3 ps-9 text-sm outline-none ring-1 ring-transparent focus:bg-white focus:ring-salmon sm:w-64" />
            </div>
          }
          @if (selectedIds().length > 0) {
            <span class="text-sm text-[#797979]">{{ selectedIds().length }} {{ 'selected' | translate }}</span>
          }
          @if (hasActiveFilters()) {
            <button (click)="clearFilters()" class="text-sm font-medium text-salmon hover:text-[#e9855a]"><i class="bi bi-x-circle mr-1"></i>{{ 'Clear filters' | translate }}</button>
          }
        </div>
        <div class="flex items-center gap-2">
          <ng-content select="[actions]"></ng-content>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-[#eff2f5] bg-[#f5f8fa]">
              @if (selectable) {
                <th class="w-10 px-4 py-3"><input type="checkbox" (change)="toggleAll($event)" /></th>
              }
              @for (col of columns; track col.field) {
                <th class="whitespace-nowrap px-4 py-3 text-start text-[11px] font-bold uppercase tracking-wider text-[#7e8299]" [style.width]="col.width" [class.cursor-pointer]="col.sortable" (click)="col.sortable && toggleSort(col.field)">
                  <div class="flex items-center gap-1">
                    {{ col.header | translate }}
                    @if (col.sortable) {
                      <span class="text-[9px]">{{ sortField() === col.field ? (sortDir() === 'asc' ? '▲' : '▼') : '↕' }}</span>
                    }
                  </div>
                </th>
              }
              @if (actions.length > 0) {
                <th class="whitespace-nowrap px-4 py-3 text-start text-[11px] font-bold uppercase tracking-wider text-[#7e8299]" [style.width]="actionsWidth"><div class="flex items-center gap-1">{{ 'Actions' | translate }}</div></th>
              }
            </tr>
            @if (hasFilterable()) {
              <tr class="border-b border-[#eff2f5] bg-[#fbfcfe]">
                @if (selectable) {
                  <td class="px-4 py-2"></td>
                }
                @for (col of columns; track col.field) {
                  <td class="min-w-40 px-4 py-2">
                    @if (col.filterable) {
                      @switch (col.filterType || 'text') {
                        @case ('select') {
                          <select [value]="filters()[col.field] || ''" (change)="setFilter(col.field, $any($event.target).value, true)"
                            class="w-full rounded-md border border-[#e3e8ef] bg-white px-2 py-2 text-sm text-[#7e8299] outline-none focus:border-salmon">
                            <option value="">{{ 'All' | translate }}</option>
                            @for (opt of col.filterOptions || []; track opt.value) {
                              <option [value]="opt.value">{{ opt.label | translate }}</option>
                            }
                          </select>
                        }
                        @case ('boolean') {
                          <select [value]="filters()[col.field] || ''" (change)="setFilter(col.field, $any($event.target).value, true)"
                            class="w-full rounded-md border border-[#e3e8ef] bg-white px-2 py-2 text-sm text-[#7e8299] outline-none focus:border-salmon">
                            <option value="">{{ 'All' | translate }}</option>
                            <option value="true">{{ 'Yes' | translate }}</option>
                            <option value="false">{{ 'No' | translate }}</option>
                          </select>
                        }
                        @case ('number') {
                          <input type="number" [value]="filters()[col.field] || ''" (input)="setFilter(col.field, $any($event.target).value)"
                            class="w-full rounded-md border border-[#e3e8ef] bg-white px-2 py-2 text-sm text-[#7e8299] outline-none focus:border-salmon" />
                        }
                        @default {
                          <input type="text" [value]="filters()[col.field] || ''" (input)="setFilter(col.field, $any($event.target).value)"
                            [placeholder]="col.placeholder ? (col.placeholder | translate) : ('Filter' | translate)" class="w-full rounded-md border border-[#e3e8ef] bg-white px-2 py-2 text-sm text-[#7e8299] outline-none focus:border-salmon" />
                        }
                      }
                    }
                  </td>
                }
                @if (actions.length > 0) {
                  <td class="px-4 py-2"></td>
                }
              </tr>
            }
          </thead>
          <tbody>
            @for (row of paginatedRows(); track row.id) {
              <tr class="cursor-pointer border-b border-[#eff2f5] hover:bg-[#f8fbff]" [class.bg-almond]="selectedIds().includes(row.id)" (click)="rowClick.emit(row)">
                @if (selectable) {
                  <td class="px-4 py-3" (click)="$event.stopPropagation()"><input type="checkbox" [checked]="selectedIds().includes(row.id)" (change)="toggleSelect(row.id)" /></td>
                }
                @for (col of columns; track col.field) {
                  <td class="whitespace-nowrap px-4 py-3 text-start text-sm text-[#7e8299]" [class.text-center]="col.align === 'center'" [class.text-end]="col.align === 'right'">
                    @if (col.imageField) {
                      @if (row[col.field]?.url) {
                        <img [src]="row[col.field].url" [alt]="col.header" class="h-10 w-14 rounded-md object-cover" />
                      } @else {
                        <span class="text-[#c9c9c9]">-</span>
                      }
                    } @else {
                      @let cell = cellContent(col, row);
                      @if (cell.chips && cell.chips.length > 0) {
                        <div class="flex flex-wrap gap-1.5">
                          @for (chip of cell.chips; track chip) {
                            <span class="inline-block rounded-full bg-almond px-2.5 py-1 text-xs font-medium text-blue-black">{{ chip }}</span>
                          }
                        </div>
                      } @else if (cell.icon) {
                        <i [class]="cell.icon + ' text-lg ' + (cell.iconClass || '')"></i>
                      } @else if (cell.badge) {
                        <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium" [class]="cell.badgeClass">{{ cell.badge | translate }}</span>
                      } @else {
                        {{ cell.label | translate }}
                      }
                    }
                  </td>
                }
                @if (actions.length > 0) {
                  <td class="whitespace-nowrap px-4 py-3 text-start" (click)="$event.stopPropagation()">
                    <div class="flex items-center justify-start gap-1">
                      @for (action of actions; track action.type) {
                        @if (!action.visible || action.visible(row)) {
                          <button (click)="actionClick.emit({ action: action.type, row })" [title]="(action.title || action.type) | translate" [attr.aria-label]="(action.title || action.type) | translate" [class]="'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors ' + (action.class || 'text-[#797979] hover:bg-almond hover:text-salmon')">
                            <i [class]="action.icon + ' text-sm'"></i>
                          </button>
                        }
                      }
                    </div>
                  </td>
                }
              </tr>
            } @empty {
              @if (loading) {
                <tr><td [attr.colspan]="columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)" class="px-4 py-10 text-center">
                  <span class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-salmon border-t-transparent"></span>
                </td></tr>
              } @else if (error) {
                <tr><td [attr.colspan]="columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)" class="px-4 py-10 text-center text-sm text-[#ff4545]">{{ error }}</td></tr>
              } @else {
                <tr><td [attr.colspan]="columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)" class="px-4 py-10 text-center text-sm text-[#7e8299]">{{ 'No data found' | translate }}</td></tr>
              }
            }
          </tbody>
        </table>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-[#eff2f5] px-4 py-4">
        <span class="text-xs font-medium text-[#7e8299]">{{ 'Showing' | translate }} {{ totalCount() === 0 ? 0 : (currentPage() - 1) * pageSize() + 1 }} {{ 'to' | translate }} {{ Math.min(currentPage() * pageSize(), totalCount()) }} {{ 'of' | translate }} {{ totalCount() }}</span>
        <div class="flex items-center gap-1">
            <button (click)="currentPage.set(currentPage() - 1); pageChange.emit(currentPage())" [disabled]="currentPage() <= 1" class="rounded-md px-3 py-1.5 text-xs font-semibold text-[#7e8299] hover:bg-[#f1faff] hover:text-salmon disabled:opacity-50">{{ 'Previous' | translate }}</button>
          @for (p of visiblePages(); track p) {
            <button (click)="currentPage.set(p); pageChange.emit(p)" [class.bg-salmon]="p === currentPage()" [class.text-white]="p === currentPage()" class="rounded-md px-3 py-1.5 text-xs font-semibold text-[#7e8299] hover:bg-[#f1faff] hover:text-salmon">{{ p }}</button>
          }
          <button (click)="currentPage.set(currentPage() + 1); pageChange.emit(currentPage())" [disabled]="currentPage() >= totalPages()" class="rounded-md px-3 py-1.5 text-xs font-semibold text-[#7e8299] hover:bg-[#f1faff] hover:text-salmon disabled:opacity-50">{{ 'Next' | translate }}</button>
        </div>
      </div>
    </div>
  `,
})
export class BaseTableComponent implements OnInit {
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() actionsWidth = '130px';
  @Input() data = signal<any[]>([]);
  @Input() totalCount: Signal<number> = signal(0);
  @Input() selectable = false;
  @Input() pageSize = signal(10);
  @Input() serverSidePagination = false;
  /** Default sort applied on init (e.g. newest-first) — also shows the header indicator. */
  @Input() initialSortField = '';
  @Input() initialSortDir: 'asc' | 'desc' = 'desc';
  /** One-time initial values (parents pass URL-restored state). */
  @Input() initialSearch = '';
  @Input() initialFilters: Record<string, string> = {};
  @Input() initialPage = 1;
  /** When true, table state syncs with URL query params (persist + back button). */
  @Input() syncQueryParams = false;
  /** Server loading flag (bind a LatestLoader) — shows a spinner instead of rows. */
  @Input() loading = false;
  /** Server error message (bind a LatestLoader) — shown instead of rows. */
  @Input() error: string | null = null;
  @Input() showSearch = true;
  /** Ms to wait after the last keystroke before firing search/filter requests. */
  @Input() debounceMs = 400;
  @Output() searchChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<{ field: string; dir: 'asc' | 'desc' }>();
  @Output() filterChange = new EventEmitter<Record<string, string>>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() selectionChange = new EventEmitter<string[]>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();

  searchQuery = signal('');
  sortField = signal('');
  sortDir = signal<'asc' | 'desc'>('asc');
  filters = signal<Record<string, string>>({});
  currentPage = signal(1);
  selectedIds = signal<string[]>([]);
  protected readonly Math = Math;

  private destroyRef = inject(DestroyRef);
  private router = inject(Router, { optional: true });
  private route = inject(ActivatedRoute, { optional: true });
  private lastQueryKeys = new Set<string>();
  /** Keystroke streams — debounced so typing doesn't fire a request per character. */
  private searchStream = new Subject<string>();
  private filterStream = new Subject<{ version: number; filters: Record<string, string> }>();
  private filterVersion = 0;

  constructor() {
    // Persist every state change to the URL (replace, no history spam).
    // The equality guard below also stops loops with the query subscription.
    effect(() => {
      if (!this.syncQueryParams) return;
      const router = this.router;
      const route = this.route;
      if (!router || !route) return;
      const state: TableQueryState = {
        search: this.searchQuery(),
        sortField: this.sortField(),
        sortDir: this.sortDir(),
        filters: { ...this.filters() },
        page: this.currentPage(),
      };
      if (sameTableQuery(state, readTableQuery(route.snapshot.queryParamMap))) return;
      // Merge keeps parent-owned params (e.g. entity); explicitly null out
      // table keys that returned to default so stale values don't linger.
      const next = tableQueryParams(state);
      const params: Record<string, string | null> = { ...next };
      for (const key of this.lastQueryKeys) {
        if (!(key in next)) params[key] = null;
      }
      this.lastQueryKeys = new Set(Object.keys(next));
      void router.navigate([], {
        relativeTo: route,
        queryParams: params,
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }

  ngOnInit(): void {
    if (this.initialSortField) {
      this.sortField.set(this.initialSortField);
      this.sortDir.set(this.initialSortDir);
    }
    if (this.initialSearch) this.searchQuery.set(this.initialSearch);
    if (this.initialFilters && Object.keys(this.initialFilters).length > 0) {
      this.filterVersion++;
      this.filters.set({ ...this.initialFilters });
    }
    if (this.initialPage > 1) this.currentPage.set(this.initialPage);
    if (this.syncQueryParams && this.route) {
      // Back/forward button: URL changed externally → reapply + notify parents to reload.
      this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
        const next = readTableQuery(params);
        const current: TableQueryState = {
          search: this.searchQuery(),
          sortField: this.sortField(),
          sortDir: this.sortDir(),
          filters: { ...this.filters() },
          page: this.currentPage(),
        };
        if (sameTableQuery(next, current)) return;
        if (next.search !== current.search) {
          this.searchQuery.set(next.search);
          this.searchStream.next(next.search);
        }
        if (next.sortField !== current.sortField || next.sortDir !== current.sortDir) {
          this.sortField.set(next.sortField);
          this.sortDir.set(next.sortDir);
          this.sortChange.emit({ field: next.sortField, dir: next.sortDir });
        }
        if (JSON.stringify(next.filters) !== JSON.stringify(current.filters)) {
          this.filterVersion++;
          this.filters.set({ ...next.filters });
          this.filterChange.emit({ ...next.filters });
        }
        if (next.page !== current.page) {
          this.currentPage.set(next.page);
          this.pageChange.emit(next.page);
        }
      });
    }
    this.searchStream
      .pipe(debounceTime(this.debounceMs), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => this.searchChange.emit(query));
    this.filterStream
      .pipe(debounceTime(this.debounceMs), takeUntilDestroyed(this.destroyRef))
      .subscribe(({ version, filters }) => {
        // Ignore stale keystrokes if filters were cleared/replaced meanwhile.
        if (version === this.filterVersion) this.filterChange.emit({ ...filters });
      });
  }

  /** Search box updates instantly for responsive typing; the request is debounced. */
  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.searchStream.next(value);
  }

  hasFilterable = () => this.columns.some((c) => c.filterable);
  hasActiveFilters = () => Object.values(this.filters()).some((v) => v !== '' && v != null);

  paginatedRows = computed(() => {
    if (this.serverSidePagination) return this.data();
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.data().slice(start, start + this.pageSize());
  });

  private resetPageOnDataChange = effect(() => {
    this.data();
    if (!this.serverSidePagination) this.currentPage.set(1);
  });

  private resetPageOnSearch = effect(() => {
    this.searchQuery();
    this.currentPage.set(1);
  });

  cellContent(col: TableColumn, row: any): TableCellContent {
    const value = col.format ? col.format(row?.[col.field], row) : row?.[col.field];
    if (value !== null && value !== undefined && typeof value === 'object') return value;
    return { label: value ?? '-' };
  }

  setFilter(field: string, value: string, immediate = false): void {
    this.filters.update((current) => ({ ...current, [field]: value }));
    this.currentPage.set(1);
    const version = ++this.filterVersion;
    // Dropdowns fire on deliberate selection → immediate; typing → debounced.
    if (immediate) this.filterChange.emit({ ...this.filters() });
    else this.filterStream.next({ version, filters: { ...this.filters() } });
  }

  clearFilters(): void {
    this.filterVersion++;
    this.filters.set({});
    this.currentPage.set(1);
    this.filterChange.emit({});
  }

  resetPage(): void {
    this.currentPage.set(1);
  }

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
    this.currentPage.set(1);
    this.sortChange.emit({ field: this.sortField(), dir: this.sortDir() });
  }

  toggleSelect(id: string): void {
    this.selectedIds.update((ids) => ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]);
    this.selectionChange.emit(this.selectedIds());
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedIds.set(checked ? this.paginatedRows().map((r) => r.id) : []);
    this.selectionChange.emit(this.selectedIds());
  }

  clearSelection(): void {
    this.selectedIds.set([]);
    this.selectionChange.emit([]);
  }
}