# Payment Gateway Integration Plan (Backend + Admin)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the admin `payment-methods` config actually drive checkout on the storefront — config-driven, not code-driven — and close the operational gaps (storefront availability endpoint, refunds, transaction detail, correctness).

**Architecture:** Two repos:
- **Backend** `D:\E-Backend` (Express + Mongo) — the payment engine.
- **Admin dashboard** `D:\admin-dashboard-v2` (Angular 22) — the control plane.
- Storefront (not in scope here) consumes the contract in §6.

**Reality check:** most of the flow already exists in the backend (Stripe checkout, Paymob Intention API, PayPal, COD, `/webhooks/stripe`, `/webhooks/paymob`, Transaction upsert, country↔method sync). This plan therefore focuses on the **gaps that stop the config from being useful**, not on building from zero.

---

## 1. What already works

| Area | Where | Status |
|------|-------|--------|
| Payment method CRUD + country sync | `routers/payment-methods.js`, `routers/countries.js` | ✅ |
| Country exposes active methods | `routers/countries.js` `.populate('paymentMethods', ..., { isActive: true })` | ✅ |
| Checkout by method | `routers/orders.js` `POST /orders/checkout` | ⚠️ see Gaps |
| Stripe checkout + webhook | `utils/payments.js`, `routers/webhooks.js`, `app.js:24` raw body | ✅ |
| Paymob Intention + HMAC webhook | `utils/payments.js`, `routers/webhooks.js` | ✅ |
| PayPal order + capture | `utils/payments.js`, `POST /orders/confirm-paypal` | ✅ |
| COD | `routers/orders.js` (debits stock, no gateway) | ✅ |
| Transactions list/detail | `utils/transactions.js`, `routers/transactions.js` | ✅ (admin) |
| Paymob credential diagnostic | `helpers/check-paymob.js` | ✅ |

## 2. The real gaps

**G1 — Config is not wired to code (the core problem).**
`routers/orders.js:385-391` hardcodes `card | cod | paypal | paymob`. Any method an admin creates in the dashboard with another code (`fawry`, `tabby`, `mada`, `apple-pay`, …) is rejected with `unsupported payment method`. So the dashboard can *create* methods the checkout can never honour.

**G2 — `PaymentMethod` has no gateway config.**
`models/payment-method.js` holds only presentation fields. There is no `provider`, `mode` (test/live), per-method credentials, `supportsRefund`, `minAmount`/`maxAmount`, `sortOrder`, `supportedCurrencies`, or checkout `instructions`. Gateway credentials live only in global `.env` (`STRIPE_SECRET`, `PAYMOB_*`, `PAYPAL_*`).

**G3 — No storefront availability endpoint.**
There is no `GET /countries/:code/payment-methods`. The storefront must use the admin-shaped `/countries/:id` (by ObjectId, full payload) to know what to show.

**G4 — Availability rules partially enforced.**
The country-support check runs for `cod`/`paypal`/`paymob` but is **skipped for `card`** (`orders.js:393-398`). The global `enableCashOnDelivery` setting is stored (`models/site-settings.js:35`) but **never enforced** at checkout.

**G5 — Refunds are Stripe-only and admin-less.**
Only order cancel triggers a Stripe refund (`orders.js:647-672`). No `POST /transactions/:id/refund`; Paymob/PayPal refunds missing; no partial-refund gateway call.

**G6 — Correctness / data-model drift.**
- `models/order.js` is **missing fields the router writes**: `currency`, `paymentMethod`, `shippingFee`, `discount`, `refunded`, `refunds`, `trackingNumber`, `carrier`, `trackingUrl`, `orderNotes`, `shippedAt`, `deliveredAt`. With default Mongoose strict mode these are silently dropped → multi-currency, PayPal confirm, and refunds likely misbehave. **Verify first — highest-risk item.**
- `payment-methods:*`, `countries:*`, `currencies:*` permission keys are used in routers but **not registered** in `constants/permissions.js` → only super-admins can manage them and the roles UI can't grant them.

**G7 — Dashboard gaps.**
Payment-method form has no gateway section; no transaction detail/refund UI; `API.md` in the dashboard is out of date vs. the backend.

---

## 3. Best practices (target behaviour)

1. **Webhook is the source of truth** — never fulfil on the browser redirect.
2. **Verify webhook signatures** (Stripe: raw body ✅; Paymob: field-order HMAC ✅) and **dedupe by event id** (currently relies only on `order.paymentStatus`).
3. **Idempotency keys** on every money-moving call, generated outside the retry loop.
4. **Explicit payment state machine**; reject illegal transitions; a **timeout = `unknown`, not `failed`**.
5. **Never store card data** — hosted/tokenized flows → keep PCI at **SAQ A**.
6. **Secrets**: per-method, encrypted at rest, masked/write-only in the dashboard, never logged.
7. **Local methods per country**; enforce the exact availability the admin configured.
8. **Reconciliation**: append-only ledger; refunds keyed by refund id.

---

## 4. Workstreams

### WS1 — Make payments config-driven (Backend) — unblocks G1, G2

- [ ] **1.1** Extend `models/payment-method.js`: `provider` (`cod|stripe|paymob|paypal|manual`), `mode` (`test|live`), `credentials` (encrypted, write-only — see §8 D1), `supportedCurrencies[]`, `supportsRefund`, `minAmount`, `maxAmount`, `sortOrder`, `instructions` (localized).
- [ ] **1.2** Add a provider-adapter registry (`utils/payments/registry.js`): map `provider → { createPayment, confirm, refund, parseWebhook }`, so checkout switches on `method.provider`, not a hardcoded `switch`.
- [ ] **1.3** Rewrite the method resolution in `routers/orders.js`: accept `paymentMethodId` (preferred) or code, look up the `PaymentMethod`, validate it is active + belongs to the customer's country + currency, then dispatch to the adapter.
- [ ] **1.4** Add a home for a `manual` provider so admins can register a method the storefront handles offline (never silently rejected).

### WS2 — Storefront availability endpoint (Backend) — unblocks G3, G4

- [ ] **2.1** Add `GET /countries/:code/payment-methods` returning active methods for the country's currency, sorted by `sortOrder` (public/unauthenticated read, minimal payload).
- [ ] **2.2** Enforce `enableCashOnDelivery` (global setting) and drop the `card` exemption in the country-support check.
- [ ] **2.3** Validate `minAmount`/`maxAmount` against the order total before dispatch.

### WS3 — Transactions & refunds (Backend) — unblocks G5

- [ ] **3.1** Add `POST /transactions/:id/refund` (admin): full/partial, idempotency keyed by refund id, updates `order.refunded`/`refunds`, calls the provider adapter.
- [ ] **3.2** Implement `refund()` for Paymob and PayPal (Stripe exists).
- [ ] **3.3** Add gateway `idempotencyKey` to create/confirm/refund calls.
- [ ] **3.4** Add webhook event dedupe (unique `provider + eventId`) and an append-only ledger for reconciliation.

### WS4 — Correctness (Backend) — unblocks G6

- [ ] **4.1** **Verify** the order-model drift (G6). If real, extend `models/order.js` with the missing paths and re-test checkout → paymob/paypal/cod + refunds.
- [ ] **4.2** Register `payment-methods:*`, `countries:*`, `currencies:*` (and `settings:*`, `shipping:*`) in `constants/permissions.js` and expose them via `/permissions`.
- [ ] **4.3** Decide masking policy for credentials (never return secrets; return `{ configured: true, hint: '••••1234' }`).

### WS5 — Admin dashboard (this repo) — unblocks G7

- [ ] **5.1** Payment method form `src/app/admin/pages/payments/payment-methods/payment-method-form.component.ts`: add a **Gateway** section (provider, mode, credentials masked/write-only, currencies, min/max, sort, supports refund, instructions).
- [ ] **5.2** List columns: add `provider` + `mode`; add a row action **Test connection** → `POST /payment-methods/:id/test`.
- [ ] **5.3** New transaction detail route `payments/:id` + component: timeline, gateway refs, failure reason, order link, **Refund** action (mirror `order-detail.component.ts` refund block).
- [ ] **5.4** Transactions list: row click → detail; retry/refresh for `pending`/`failed`.
- [ ] **5.5** Order detail: show payment method + transaction link.
- [ ] **5.6** Add i18n keys (`language.service.ts`, `en`/`ar`) and refresh `API.md`.

---

## 5. Suggested sequencing

1. **WS4.1** (verify/fix order model) — everything else depends on it.
2. **WS1** + **WS2** — the actual "make config useful" step.
3. **WS3** — refunds/robustness.
4. **WS5** — dashboard polish on top.
5. **WS4.2** — permissions once the resource set is final.

## 6. API contract

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/countries/:code/payment-methods` | None | Storefront: available methods. |
| POST | `/orders/checkout` | JWT | + `paymentMethodId` (or code); dispatch via provider. |
| POST | `/transactions/:id/refund` | Admin | Full/partial refund. |
| GET | `/transactions/:id` | Admin | Already exists. |
| POST | `/payment-methods/:id/test` | Admin | Validate credentials. |
| GET/POST/PUT | `/payment-methods` | Admin | Gain WS1 fields; credentials write-only. |

## 7. Testing

- [ ] Checkout with each provider (cod/card/paymob/paypal) → order + transaction correct.
- [ ] Method created in the dashboard with a supported provider actually works end-to-end.
- [ ] A method **not** enabled for the country is rejected; `enableCashOnDelivery=false` blocks COD.
- [ ] Webhook delivered twice → settles once; tampered Paymob HMAC → 401.
- [ ] Partial + full refund update `refunded`/`refunds` correctly for Stripe/Paymob/PayPal.
- [ ] Gateway timeout leaves the order recoverable (`unknown`), not `failed`.
- [ ] `D:\E-Backend`: existing `test/` suite + `npm test`. `D:\admin-dashboard-v2`: `ng test` + `ng build`.

## 8. Decisions (locked to production best practice)

**D1 — Credentials live per-method in the DB, encrypted at rest.**
This is how real payment admin panels work (Shopify Payments, WooCommerce gateways, Stripe-managed platforms): the merchant enters keys in the UI, so they must be stored server-side. Implementation:
- Encrypt with **AES-256-GCM** using a master key from `CREDENTIALS_MASTER_KEY` (env / secret manager). Never a plaintext column.
- Store as `{ ciphertext, iv, tag, last4 }`; on read return only `{ configured: true, hint: '••••1234' }`.
- **Write-only** in the API and dashboard; changing a secret requires re-entering it (no read-back).
- Audit every credential change via the existing audit-log system; never log secrets.
- Platform-wide `.env` values remain only as **defaults/fallback** for providers not yet configured per-method.

**D2 — v1 scope: make the existing providers fully config-driven, then add local gateways.**
Reality is that Fawry/Tabby/Mada each need a merchant account, keys, and their own webhook signature scheme — so they are a separate onboarding step, not a config toggle. v1 therefore:
- Ships the **provider-adapter registry** (§WS1.2) so adding a provider is a new adapter, not a rewrite.
- Makes `card/cod/paypal/paymob` manageable from the dashboard end-to-end (the "real scenario" where an admin flips methods on/off per country).
- Follow-up: add `fawry` and `tabby` adapters behind the same interface, with real test credentials.

**D3 — Storefront path still required.** Needed to wire `GET /countries/:code/payment-methods` into checkout. (Owner to provide.)

**D4 — Order-model drift (G6) must be verified first** (§WS4.1). If the deployed backend already has the fields, the local `D:\E-Backend` just needs syncing.

**Real-world reference scenario this plan reproduces:**
```
Merchant adds gateway keys (encrypted) + enables methods per country      [Admin]
        ↓
Shopper's country → GET /countries/:code/payment-methods                  [Storefront]
        ↓
Shopper picks method → POST /orders/checkout { paymentMethodId }          [Storefront]
        ↓
Backend: order(pending)+transaction(pending) → provider adapter → redirect [Backend]
        ↓
Gateway charges → signed webhook (source of truth) → paid/failed          [Gateway]
        ↓
Stock, coupon, fulfilment via outbox; admin refunds from Transactions      [Backend/Admin]
```
