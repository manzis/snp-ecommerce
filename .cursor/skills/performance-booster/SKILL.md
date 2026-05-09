---
name: performance-booster
description: Optimize frontend and backend performance for this project to reduce response time, improve loading speed, and keep UX smooth. Use when working on page speed, API latency, rendering efficiency, caching, DB queries, and performance regressions.
disable-model-invocation: true
---

# Performance Booster

Use this skill for both frontend and backend performance work in this repository.

## Goal

Deliver fast, smooth, low-latency behavior across all pages and flows without breaking correctness, security, or maintainability.

## Stack-aware context

- Frontend: Next.js App Router + React 19 + Tailwind + Framer Motion.
- Backend: Server Actions + Route Handlers + Supabase.
- Data/infra patterns: Supabase RPC, role-checked admin flows, `revalidatePath`.

## Core rules

1. Optimize the bottleneck first (measure before broad refactors).
2. Prefer small, safe changes with clear impact.
3. Do not trade security/correctness for speed.
4. Avoid unnecessary re-renders, over-fetching, and duplicate work.
5. Keep UX responsive with fast feedback and progressive loading states.

## Frontend performance standards

- Minimize client components; keep as much as possible server-rendered.
- Split heavy UI into dynamic/lazy-loaded chunks where useful.
- Avoid large prop chains that trigger broad re-renders.
- Use memoization only where profiling shows repeated expensive work.
- Optimize images (`next/image`, proper sizes, modern formats).
- Keep animation lightweight; avoid expensive layout thrashing.
- Use skeletons/placeholders to improve perceived performance.
- Avoid fetching same data multiple times in page trees.

## Backend performance standards

- Keep DB queries narrow (only required columns).
- Always paginate list endpoints/actions.
- Push filtering/sorting to DB; avoid in-memory filtering when possible.
- Prefer RPC/atomic DB operations for complex writes.
- Prevent N+1 queries by batching and join/select planning.
- Keep hot paths free of blocking side effects.
- Run secondary side effects asynchronously when business-safe.
- Use caching/revalidation deliberately; avoid unnecessary invalidations.

## Supabase-specific guidance

- Use session client for user-scoped reads/writes.
- Verify admin role before any privileged operation.
- Use service-role client only after role check.
- Design queries to leverage indexed fields (ids, status, created_at, etc.).
- Keep search clauses bounded and safe to avoid expensive scans.

## “Instant-feel” UX guidance

- Prioritize above-the-fold content first.
- Show meaningful placeholders immediately.
- Keep interactions optimistic where data integrity allows.
- Avoid UI jank during transitions, filters, and pagination.
- Maintain stable layouts to reduce cumulative layout shift.

## Performance workflow

1. Identify slow path (page load, action, API, query, render).
2. Add/inspect lightweight timing evidence.
3. Apply highest-impact low-risk fix first.
4. Re-check response time and render behavior.
5. Validate no functional/security regressions.

## Quality gate (must pass)

- [ ] Faster or equal response/render time on target flow
- [ ] No auth/security regression
- [ ] No correctness/data regression
- [ ] No unnecessary bundle/query growth
- [ ] Loading/empty/error states still clean
- [ ] No new hydration or re-render issues

## When generating code

- Keep diffs minimal and focused.
- Reuse existing patterns/utilities before introducing new abstractions.
- Add comments only for non-obvious optimization logic.
- Include brief verification notes for what improved.

