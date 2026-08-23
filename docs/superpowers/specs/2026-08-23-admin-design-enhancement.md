# Admin Dashboard Design Enhancement

## Overview

Enhance the admin dashboard's spacing, typography, and the roles/permissions pages. Global token update propagates to all pages; roles pages get a full redesign.

## 1. Global Typography & Spacing

### Typography Scale

| Element | Current | New |
|---------|---------|-----|
| Page title (h1) | `text-2xl font-bold uppercase` | `text-3xl font-bold uppercase tracking-wide` |
| Section heading (h2) | `text-2xl font-bold uppercase` | `text-xl font-semibold uppercase tracking-wider` |
| Card/group header (h3) | `text-base font-bold` | `text-base font-semibold uppercase tracking-wider` |
| Body text | `text-sm` | `text-sm` (unchanged) |
| Labels | `text-sm font-medium` | `text-xs font-medium uppercase tracking-wider text-[#797979]` |
| Table headers | `text-xs font-medium uppercase tracking-wider text-[#797979]` | unchanged |

### Spacing Scale

| Area | Current | New |
|------|---------|-----|
| Main content padding | `p-6` | `p-8` |
| Card padding | `p-6` | `p-8` |
| Section vertical spacing | `space-y-6` | `space-y-8` |
| Form field gaps | `space-y-4` | `space-y-6` |
| Table row padding | `py-3` | `py-4` |

### Implementation

Update `admin-shell.component.ts` main padding: `p-6` -> `p-8`. Update individual page components to use the new scale. No new CSS custom properties needed — Tailwind v4 utility classes handle this.

## 2. Roles List Page

### Current State

Minimal table with 3 columns: Name, Permissions (count), Default (Yes/No). No actions column, no badges.

### New Design

**Header row**: `h1 text-3xl font-bold uppercase text-blue-black` + salmon "Add Role" button with `+` icon.

**Table columns**:

| Column | Content | Style |
|--------|---------|-------|
| Name | Role name text | `font-semibold text-blue-black`, sortable |
| Permissions | Colored chips showing first 3 permission group names, then "+N more" overflow | `bg-almond text-blue-black text-xs rounded-full px-2.5 py-1` for each chip |
| Default | Checkmark icon if true, dash if false | `text-green-500 bi-check-lg` or `text-[#797979] bi-dash` |
| Actions | Edit (pencil icon) + Delete (trash icon) buttons | Ghost buttons, `text-[#797979] hover:text-salmon` |

**Row styles**: `hover:bg-[#F6F8FE]`, `py-4`, `border-b border-[#F6F8FE]`.

**Empty state**: Centered icon + "No roles found" message when list is empty.

**Delete confirmation**: Existing `ConfirmDialogComponent` (unchanged).

### Permissions Chip Logic

Extract permission prefixes (e.g. `products:read` -> `Products`). Show unique group names as chips. If >3 groups, show first 3 + "+N more" badge.

## 3. Role Form Page

### Current State

Single-column form: Name input, Default checkbox, flat 2-column checkbox grid with 30 raw permission strings.

### New Design

**Two-panel layout**: Left panel (1/3 width) for role info, right panel (2/3 width) for permissions.

#### Left Panel — Role Info Card

Card with `rounded-lg border border-[#F6F8FE] bg-white p-8`:
- Role name input: `text-sm font-medium text-[#646D77]` label, standard input styling
- Default role toggle: styled checkbox with description text

#### Right Panel — Permissions Card

Card with same styling. Contains:

**Summary bar** at top: "X of Y permissions selected" in `text-sm text-[#797979]`.

**Permission groups** — 9 groups, each with:

| Group | Permissions |
|-------|------------|
| Dashboard | `dashboard:read` |
| Products | `products:read`, `products:create`, `products:update`, `products:delete` |
| Categories | `categories:read`, `categories:create`, `categories:update`, `categories:delete` |
| Orders | `orders:read`, `orders:update`, `orders:delete` |
| Users | `users:read`, `users:create`, `users:update`, `users:delete` |
| Coupons | `coupons:read`, `coupons:create`, `coupons:update`, `coupons:delete` |
| Content | `content:read`, `content:create`, `content:update`, `content:delete` |
| Reviews | `reviews:read`, `reviews:delete` |
| Roles | `roles:read`, `roles:create`, `roles:update`, `roles:delete`, `roles:manage` |

**Each group layout**:
- Group header: `text-xs font-semibold uppercase tracking-wider text-[#797979]` with group name + "Select All" checkbox on the right
- Permissions below: clean checkbox list with readable labels (e.g. `Read`, `Create`, `Update`, `Delete`)
- Selected permissions shown as `bg-salmon/10 text-salmon text-xs rounded-full px-2 py-0.5` chips below the checkboxes
- Group separator: `border-b border-[#F6F8FE]` between groups

**Group select-all logic**: "Select All" checkbox is checked when all permissions in the group are selected, indeterminate when some are selected, unchecked when none are selected. Clicking toggles all permissions in the group.

#### Footer

Right-aligned: Cancel button (bordered) + Save button (salmon, uppercase, tracking-wider). Same pattern as current.

### Permission Label Mapping

Convert raw permission strings to readable labels:
- Split on `:` — first part is group name, second is action
- Capitalize both parts: `products:create` -> `Products : Create`

## Files Modified

1. `src/styles.css` — no changes needed (Tailwind utilities handle the new scale)
2. `src/app/admin/layout/admin-shell.component.ts` — `p-6` -> `p-8`
3. `src/app/admin/layout/topbar.component.ts` — minor spacing update
4. `src/app/admin/pages/roles/roles-list.component.ts` — full redesign
5. `src/app/admin/pages/roles/role-form.component.ts` — full redesign with grouped permissions
6. `src/app/shared/table/base-table.component.ts` — `py-3` -> `py-4` on rows
7. Other list pages (products, users, categories, orders, coupons, reviews) — update heading sizes and spacing to match new scale

## Out of Scope

- Sidebar changes
- Login page changes
- New components or services
- Backend changes
- Dark mode
