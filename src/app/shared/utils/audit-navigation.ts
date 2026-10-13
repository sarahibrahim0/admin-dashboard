/**
 * Routes an audit-log entry to the dashboard record it describes.
 *
 * `entity` is the PascalCase name written by the backend's `logAction` helper.
 * Deleted records no longer exist, so those entries point at the collection
 * instead of a dead detail link. Unknown entities return null so the row stays
 * inert.
 */
const DETAIL_ROUTE: Record<string, (id: string) => any[]> = {
  Order: (id) => ['/admin/orders', id],
  Country: (id) => ['/admin/countries', id, 'edit'],
  Currency: (id) => ['/admin/currencies', id, 'edit'],
  PaymentMethod: (id) => ['/admin/payments/methods', id, 'edit'],
};

const LIST_ROUTE: Record<string, any[]> = {
  Order: ['/admin/orders'],
  Country: ['/admin/countries'],
  Currency: ['/admin/currencies'],
  PaymentMethod: ['/admin/payments/methods'],
};

function isDeletion(action?: string): boolean {
  return /^delet/i.test(action ?? '');
}

export function auditEntityRoute(entity?: string, entityId?: string, action?: string): any[] | null {
  if (!entity) return null;
  if (!isDeletion(action) && entityId && DETAIL_ROUTE[entity]) return DETAIL_ROUTE[entity](entityId);
  return LIST_ROUTE[entity] ?? null;
}
