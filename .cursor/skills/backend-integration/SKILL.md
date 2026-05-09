---
name: backend-integration
description: Implement and review backend work for this project using Next.js App Router, Server Actions, Supabase (SSR + service role), RPC workflows, and secure admin role checks. Use when building backend jobs, APIs, server actions, database integrations, and architecture-sensitive backend changes.
disable-model-invocation: true
---

# Backend Integration

Use this skill for backend work in this repository.

## Current backend architecture (project-specific)

- Framework: Next.js App Router (`next@16`) with TypeScript.
- Backend entrypoints:
  - Server Actions under `src/app/actions/*.ts`
  - Route Handlers under `src/app/api/**/route.ts`
- Data layer: Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
  - Session client: `src/lib/supabase/server.ts`
  - Admin/service-role client: `src/lib/supabase/admin.ts`
- Service layer exists in `src/services/*.ts` (orders, products, auth, etc.).
- Order domain uses Supabase RPC heavily (`create_order_v3`, `update_order_status_v2`, etc.).
- Side effects: email notifications via `src/services/emailService.ts`.
- Cache/path invalidation via `revalidatePath`.

## Hard rules for backend changes

1. Authenticate first for all protected actions/routes.
2. Enforce authorization explicitly (admin role check from `profiles.role`) before privileged reads/writes.
3. Use service-role client only after role verification.
4. Keep mutating operations atomic when possible (prefer RPC/transaction-like server-side logic).
5. Validate and sanitize all external/user input (IDs, search, payload).
6. Return stable, minimal response shapes (`{ success, message?, data? }` style consistency).
7. Never log secrets, tokens, or sensitive user payloads.
8. Preserve existing revalidation behavior for changed resources.

## Performance standards

- Query only required columns; avoid `select('*')` in high-traffic admin paths.
- Apply pagination on list endpoints/actions by default.
- Push filtering/search to DB (not in-memory post-processing).
- Avoid N+1 fetch patterns; batch where possible.
- Use short-circuit guards before expensive operations.
- Keep email/secondary side effects non-blocking unless business-critical.
- Reuse existing service functions and RPCs instead of duplicating logic.

## Security standards

- Treat all route handler input as untrusted.
- For admin flows:
  1) check `supabase.auth.getUser()`
  2) verify `profiles.role === 'admin'`
  3) then use `getSupabaseAdmin()` for privileged access.
- Do not trust client-provided `user_id`; bind to authenticated user where required.
- Keep service-role usage server-only and never expose in client code.
- Reject ambiguous or malformed identifiers early.

## Implementation pattern (default)

1. Identify the correct backend entrypoint type:
   - user-triggered mutation/read -> Server Action
   - external/system endpoint -> Route Handler
2. Reuse an existing service function if one already models the domain logic.
3. Add input validation at the boundary.
4. Add auth + role checks before privileged operations.
5. Perform DB work with minimal, indexed-friendly query shape.
6. Handle errors with clear non-sensitive messages.
7. Revalidate affected paths.
8. Add/update lightweight verification (lint/type/test/manual validation note).

## Backend jobs guidance

When creating backend jobs (sync, cleanup, batch updates):

- Make jobs idempotent (safe to rerun).
- Process in chunks/batches; avoid one huge write.
- Record progress markers/checkpoints when possible.
- Use retry-safe logic for external calls (email/storage/webhook).
- Fail with actionable error context, but without sensitive data.

## “No bugs” quality gate (practical)

Before finalizing backend work, ensure:

- [ ] auth + authz checks exist and are in correct order
- [ ] input validation exists at boundary
- [ ] DB queries are minimal and paginated where needed
- [ ] privileged operations are server-only
- [ ] side effects won’t silently corrupt main flow
- [ ] paths/cache invalidation are updated
- [ ] no new secret exposure in logs/responses

## Project-specific references

- `src/lib/supabase/server.ts`
- `src/lib/supabase/admin.ts`
- `src/app/actions/orderActions.ts`
- `src/services/orderService.ts`
- `src/app/api/admin/orders/route.ts`
- `src/services/auth.service.ts`

