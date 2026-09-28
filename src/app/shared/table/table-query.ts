import { ParamMap } from '@angular/router';

/**
 * URL query-param persistence for table state (search / sort / filters /
 * page), e.g. `/admin/products?search=sofa&sort=price&dir=desc&page=2&f_color=red`.
 *
 * Links stay shareable, the back button works, and a refresh keeps what the
 * user was looking at. Only non-default values are written, so clean URLs
 * stay clean. Selection is intentionally NOT persisted.
 */
export interface TableQueryState {
  search: string;
  sortField: string;
  sortDir: 'asc' | 'desc';
  filters: Record<string, string>;
  page: number;
}

export function readTableQuery(params: ParamMap): TableQueryState {
  const filters: Record<string, string> = {};
  for (const key of params.keys) {
    if (key.startsWith('f_')) {
      const value = params.get(key);
      if (value !== null && value !== '') filters[key.slice(2)] = value;
    }
  }
  const page = parseInt(params.get('page') || '', 10);
  return {
    search: params.get('search') || '',
    sortField: params.get('sort') || '',
    sortDir: params.get('dir') === 'asc' ? 'asc' : 'desc',
    filters,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function tableQueryParams(state: TableQueryState): Record<string, string> {
  const query: Record<string, string> = {};
  if (state.search) query['search'] = state.search;
  if (state.sortField) {
    query['sort'] = state.sortField;
    query['dir'] = state.sortDir;
  }
  if (state.page > 1) query['page'] = String(state.page);
  for (const [key, value] of Object.entries(state.filters)) {
    if (value !== '' && value !== null && value !== undefined) query[`f_${key}`] = value;
  }
  return query;
}

export function sameTableQuery(a: TableQueryState, b: TableQueryState): boolean {
  return (
    a.search === b.search &&
    a.sortField === b.sortField &&
    a.sortDir === b.sortDir &&
    a.page === b.page &&
    JSON.stringify(a.filters) === JSON.stringify(b.filters)
  );
}
