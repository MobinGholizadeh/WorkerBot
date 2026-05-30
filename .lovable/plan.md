# Fix: agent detail page not rendering

## Problem

Navigating to `/agents/ada` matches the route, but nothing appears. Cause: in TanStack Router's flat file convention, `src/routes/agents.tsx` and `src/routes/agents.$id.tsx` are treated as **parent + child** (same `agents` prefix). The parent (`agents.tsx`) must render `<Outlet />` for the child detail page to appear — but it currently renders the agents grid directly with no `<Outlet />`.

## Fix

Rename the agents listing file so `/agents` is a leaf, not a layout:

- `src/routes/agents.tsx` → `src/routes/agents.index.tsx`
- Update the route id inside from `createFileRoute("/agents")` → `createFileRoute("/agents/")`

Result: `/agents` renders the grid (leaf), and `/agents/$id` renders the detail page independently — no parent layout in between.

## Why not add `<Outlet />` instead

Adding `<Outlet />` to `agents.tsx` would render the entire agents grid above every detail/configure page, which is not the intended UX. Splitting parent vs index is the standard TanStack pattern here.

## Files touched

- rename `src/routes/agents.tsx` → `src/routes/agents.index.tsx` (single line change inside: route id string)
- `src/routeTree.gen.ts` regenerates automatically
