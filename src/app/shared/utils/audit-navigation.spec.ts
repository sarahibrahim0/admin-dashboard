import { auditEntityRoute } from './audit-navigation';

describe('auditEntityRoute', () => {
  it('routes an order change to its detail page', () => {
    expect(auditEntityRoute('Order', 'o1', 'status_change')).toEqual(['/admin/orders', 'o1']);
  });

  it('routes country, currency and payment-method changes to their edit forms', () => {
    expect(auditEntityRoute('Country', 'c1', 'updated')).toEqual(['/admin/countries', 'c1', 'edit']);
    expect(auditEntityRoute('Currency', 'cur1', 'created')).toEqual(['/admin/currencies', 'cur1', 'edit']);
    expect(auditEntityRoute('PaymentMethod', 'p1', 'updated')).toEqual(['/admin/payments/methods', 'p1', 'edit']);
  });

  it('falls back to the collection for deleted records', () => {
    expect(auditEntityRoute('Order', 'o1', 'deleted')).toEqual(['/admin/orders']);
    expect(auditEntityRoute('Country', 'c1', 'deleted')).toEqual(['/admin/countries']);
  });

  it('returns null for unknown entities and missing entity', () => {
    expect(auditEntityRoute('Product', 'p1', 'created')).toBeNull();
    expect(auditEntityRoute(undefined, 'x', 'created')).toBeNull();
  });
});
