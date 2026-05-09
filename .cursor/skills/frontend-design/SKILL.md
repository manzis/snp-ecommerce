---
name: frontend-design
description: Build new admin panel pages and components that match this project's existing design system (Products, Orders, shared admin UI). Use only for admin routes/components (src/app/admin and src/components/admin), including admin views, cards, dropdowns, action menus, filters, modals/sheets, and list-grid pages. Do not use for store-facing pages.
disable-model-invocation: true
---

# Frontend Design (Admin Panel)

Use this skill to generate new admin pages/components with the same UI language as existing `Products` and `Orders` dashboards.

## Scope guard (strict)

- Use this skill only for admin interfaces under `src/app/admin` and `src/components/admin`.
- Do not apply this skill to store pages/components under `src/app/(store)` or store/shared storefront UI.
- If the user request is store-facing, stop and use store-specific patterns instead of this skill.

## Primary references in this repo

Read these first before building:

- `src/app/admin/(dashboard)/products/ProductsClient.tsx`
- `src/app/admin/(dashboard)/orders/OrdersClient.tsx`
- `src/components/admin/layout/AdminSubNav.tsx`
- `src/components/admin/shared/AdminDropdown.tsx`
- `src/components/admin/products/ProductActionMenu.tsx`
- `src/components/admin/orders/OrderActionMenu.tsx`
- `src/components/admin/products/ProductFilters.tsx`
- `src/components/admin/orders/OrderFilters.tsx`
- `src/components/admin/products/ProductCard.tsx`
- `src/components/admin/orders/OrderCard.tsx`
- `src/components/admin/shared/AdminModal.tsx`
- `src/components/admin/shared/AdminSheet.tsx`
- `src/components/admin/ui/AdminToast.tsx`
- `src/components/admin/ui/AdminToastProvider.tsx`

## Non-negotiable design rules

1. Use `font-rubik` for admin surfaces.
2. Keep base palette neutral: `#242424` primary text, `#71717a` secondary, white backgrounds, soft gray borders.
3. Use rounded corners heavily: `rounded-[8px]`, `rounded-[10px]`, `rounded-[12px]`, `rounded-xl`, `rounded-2xl`.
4. Use soft borders and subtle shadows, not hard contrast.
5. Keep transitions smooth and short with `transition-all` and Framer Motion where menus/panels appear.
6. Prefer compact spacing and density similar to Products/Orders cards.
7. Reuse existing shared admin components before creating new primitives.
8. Never introduce a conflicting color system without explicit user request.

## Component patterns to copy

### 1) Admin page shell pattern

For new dashboard pages, follow this composition:

1. Root wrapper: `flex flex-col h-full bg-white rounded-[12px] overflow-hidden font-rubik`
2. Header nav: `<DynamicAdminNav />`
3. Sub nav: `<AdminSubNav />` with search, optional view toggle, and filter slot
4. Main content area: scrollable with responsive padding (`p-4 md:p-6 lg:p-8`)
5. Loading state: use admin skeletons with `AnimatePresence`
6. Empty state: centered icon + concise message + clear recovery action
7. Pagination at bottom when total pages > 1

### 2) Search + filter + view switch

- Use `AdminSubNav` rather than custom top bars.
- Debounce search via `onSearch` flow (already handled in `AdminSubNav`).
- Pass a filter component through `filterDropdown`.
- If grid/list is needed, use `showViewMode`, `viewMode`, and `onViewModeChange`.

### 3) Dropdowns (`AdminDropdown`)

- Use searchable dropdown with click-outside close behavior.
- Keep list panel animated (`AnimatePresence` + `motion.div`).
- Support optional `onCreateNew` button when entity creation is part of flow.
- Show concise validation state using `showError` + `error`.

### 4) Action menus

Follow `ProductActionMenu` and `OrderActionMenu`:

- Trigger button is compact (`32x32`) with muted default and dark active state.
- Menu is absolute-positioned right-aligned with white background, subtle border, rounded corners, soft shadow.
- Close on click outside.
- Each row: icon + label, `text-[14px]`, `rounded-[6px]`, `hover:bg-zinc-100`.
- Separate destructive actions with divider and red text/background hover.
- Prevent event bubbling when menu lives inside clickable cards.

### 5) Filters popover

Follow `ProductFilters` / `OrderFilters`:

- Anchor button includes filter icon + chevron rotation.
- Backdrop click closes panel.
- Floating panel uses `rounded-2xl`, white background, subtle border/shadow.
- Group controls under uppercase small headings.
- Footer actions: primary dark "Apply" + neutral "Reset".

### 6) Admin cards (Product/Order style)

- Card surface: white, rounded, subtle border + hover elevation and tiny lift.
- Keep information hierarchy: status chips -> brand/meta -> title -> value rows.
- Use compact text sizes (`11-16px`) and muted metadata.
- Include action menu in top-right absolute slot.
- For structured metadata blocks, use bordered mini-grid sections.

### 7) Overlays and feedback

- Modal flows: use `AdminModal`.
- Side panels / editor flows: use `AdminSheet`.
- Toast notifications: use `useAdminToast()` and `showAdminToast(message, type)`.
- Do not use browser-native alert/confirm for user feedback except quick admin confirmations already used in existing flows.

## Interaction and state conventions

1. Keep server actions in page/client container components; pass handlers into UI components.
2. Use optimistic UI where existing patterns already do so (for list updates/deletes).
3. Reset pagination to page 1 when search/filter changes.
4. Keep selection state (`selectedIds`) in list containers when bulk actions are possible.
5. Use mounted-guard pattern (`isMounted`) for hydration-sensitive admin pages.

## Implementation workflow for new admin page

1. Create `src/app/admin/(dashboard)/<feature>/<Feature>Client.tsx` (or follow existing route structure).
2. Implement page shell with `DynamicAdminNav` + `AdminSubNav`.
3. Add search/filter/view-mode state and wire server actions.
4. Build card + table variants if both views are required.
5. Add action menu and any modal/sheet flows.
6. Add loading skeleton and empty state.
7. Add pagination and scroll-to-top on page change.
8. Add success/error toasts for all mutating actions.
9. Re-check spacing/colors/typography against Products and Orders pages.

## Implementation workflow for new admin component

1. Check whether `AdminDropdown`, `AdminModal`, `AdminSheet`, `AdminSubNav`, existing filter/menu/card components can be reused or extended.
2. Copy closest matching component structure and adapt behavior.
3. Keep class naming and utility style density consistent with existing admin components.
4. Add click-outside, escape/backdrop close, and animation where applicable.
5. Ensure mobile behavior is acceptable (stacking, width, scroll, tap targets).

## Output checklist (must pass before finishing)

- [ ] Uses existing admin shared components where possible
- [ ] Matches neutral admin palette and `font-rubik`
- [ ] Includes proper loading, empty, and error feedback states
- [ ] Includes toasts for mutation success/failure
- [ ] Uses consistent rounded borders/shadows/spacing
- [ ] Search/filter/view behavior aligns with `AdminSubNav` pattern
- [ ] Menus/dropdowns close correctly on outside click
- [ ] No visually conflicting new design language introduced

## Example trigger prompts

- "Create a new admin returns page with grid/list toggle and filters."
- "Build an admin vendor card similar to product and order cards."
- "Add action menu for coupon rows matching existing menu style."
- "Generate a new admin dropdown with search and create-new option."

