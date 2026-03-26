# 🚨 Scope Creep Analyzer: System Audit Report

## 1. UI & Layout Issues

_List all broken styles, overflow issues, and component misalignments. (Pay special attention to `/changes/new`)_

- **/app/[user]/[projectId]/changes/new (NewChangeClient / formClient):** Right-column sticky widget is implemented inside a 3-column grid and uses large fixed widths (w-48 / min-w on inner elements). On narrow viewports this causes the grid to overflow horizontally — the sticky widget does not collapse responsively and can overlap content. The submit button renders disabled without contextual helper text or tooltip (UX). The gauge and large border/padding combinations cause vertical overflow on small screens.
- **/app/[user]/[projectId]/baselines/page.jsx:** The table uses `min-w-[600px]` and the baseline detail page uses `min-w-[700px]` which forces horizontal scrolling even on medium devices; `min-w` values are hard-coded and cause overflow on small screens.
- **General: missing loading states:** Many server data fetches (modules list, active baseline) are used to render client components but pages/components lack loading skeletons or spinners (e.g., `NewChangePage` renders `NewChangeClient` with modules—if DB is slow the client shows default empty state without spinner). The Modules manager doesn't show a loading indicator while POST/GET is in progress.
- **Missing/global error boundaries & toasts:** There is no central toast mechanism or per-component error UI to inform users of network/DB errors. Several API calls `fetch(...).then()` silently fail only via alert() or console logs (e.g., ModulesClient uses `alert()` on create failure). There are no Next.js Error boundaries or React Error Boundaries around critical server-rendered pages.
- **Auth pages & (auth) route-group:** The moved auth pages include a Tailwind class lint notice (e.g., `bg-gradient-to-br` vs `bg-linear-to-br`) — styling inconsistency not critical but flagged. Also duplicate copies of auth pages and components exist in the repo (old and new locations) which may create route collisions and inconsistent UIs during dev.

## 2. Dead Functionality & Disconnected Buttons

_List all interactive elements that do not perform their intended action._

- **/app/[user]/[projectId]/changes/new (NewChangeClient / formClient):** Primary call-to-action button labeled "Generate Official Impact" is disabled when required fields are missing and comments show `// onClick={() => submitToServerAction()} // TODO`. There is no client-side submission implemented; the UI never posts the computed payload to the server.
- **/app/[user]/[projectId]/config/page.jsx:** "Save Settings" button is a plain `<button>` with no `onClick` handler or Server Action. Form inputs (`input` elements) are uncontrolled/default-only and not wired to submission logic.
- **/app/(auth)/login & /app/(auth)/signup:** Login and signup pages are UI-only; no form `onSubmit` or server action is implemented to actually sign in or create users. Links like `href="#"` appear in the login card (forgot password) which do nothing.
- **/src/app/page.jsx & my-projects:** "New Project" button in `my-projects/page.jsx` (and similar CTA) is present but has no attached action or server call — it renders a button with no handler.
- **/app/[user]/[projectId]/impacts/page.jsx:** Accept/Promote style interactions are mocked (no wiring to persist decisions). The page uses mock data and there is no way to mark an impact as accepted/rolled-forward.
- **Sidebar links / relative path logic:** Some client code extracts `user` from `window.location.pathname` or uses relative links (`..` or `./change-001`) which works only in some contexts; these heuristics are brittle and can produce non-working links in nested layouts.

## 3. Missing Server Actions & DB Wiring

_List where the frontend needs to be connected to the Drizzle database._

- **Change Requests (change_requests):** There is an API endpoint at `src/app/api/projects/[user]/[projectId]/change-requests/route.js` that inserts into the DB, but the client `NewChangeClient` (and `formClient.jsx`) does not call it anywhere — the `submitToServerAction()` is TODO. Recommended: implement a secure Server Action (Next.js "use server") or call the POST API from the client and generate `customId` server-side.
- **Server-side id generation and atomic persistence:** Currently client-side code sometimes generates pseudo-IDs (older code used `CX${Date.now()}` in earlier iterations). The server route expects `customId` from the payload. Best practice: server should generate `customId` to avoid duplicates and spoofing. No transaction-handling for creating change_request + impact_result + baseline snapshot is present.
- **DB initialization and graceful fallback:** `src/db/index.js`'s `initDb()` relies on `process.env.DATABASE_URL`. The repo contains a `src/lib/dbClient.js` wrapper that `require()`s `../db/index.js` and stubs when unavailable — this leaves many pages working in UI-only mode but not persisting. The audit found numerous places where the UI falls back to sample/mock data (e.g., `baselines/page.jsx` uses a sampleBaselines array) — those must be mapped to `db` queries.
- **leftJoinBaselineModules implementation:** The helper `leftJoinBaselineModules` recreates a new `Pool` and calls `pool.end()` per invocation. This creates resource churn and will be slow/bug-prone on real traffic. It also mixes raw SQL with Drizzle usage. Recommend using the same pooled client obtained via `initDb()` and reusing connections.
- **Potential ESM/CJS mismatch in dbClient:** `src/lib/dbClient.js` uses `require()` which can behave oddly in an ESM environment (Next.js can support both) — validate runtime behavior. If `require()` fails, dbClient stubs with null and pages silently render with empty arrays.
- **Missing Server Actions for critical endpoints:** There are no Next.js Server Action implementations for (a) creating change requests and computing/persisting impact_results, (b) promoting an accepted change to a new baseline (Accept & Promote flow), (c) transactional module+dependency creation using a DB transaction. The API routes exist for modules and baseline-snapshots, but server actions would be preferable for security and server-only id generation.

## 4. Architectural Routing Gaps

_List any missing pages, 404 risks, or broken links between views._

- **Duplicate/moved files causing route collisions:** The repo currently contains copies of `login`, `signup`, `data-table.jsx`, and `columns.jsx` both in `src/app/` and in their new locations (`src/app/(auth)/...` and `src/components/ui/...`). Duplicate pages/files can create route collisions or serve different UI during development. Clean move / deletes are required.
- **Relative link fragility:** Several components attempt to derive `user` from `window.location.pathname` (e.g., `ModulesClient.getUserFromPath()`). This is brittle (breaks in nested routes, changes in base path) and increases 404 risk for constructed API calls. Prefer `useParams()` in server/client components or pass `user` as a prop from the server layout.
- **Hard-coded demo links:** `changes/page.jsx` includes placeholder rows linking to `./change-001` and `./change-001` view links; these relative links will not always resolve as expected when the current route changes. Use absolute `/[user]/[projectId]/changes/[changeId]` construction with `params` values.
- **Missing Accept & Promote flow routing:** `changes/[changeId]/page.jsx` contains an "Accept & Promote" button that toggles a local state but does not call a server route that would create a new baseline or update change status. Without that, the path from Accept -> baseline creation is not implemented and risks 404s for expected baseline pages.
- **Impacts ledger separation:** `impacts/page.jsx` is implemented as a project-specific display but is mocked; there is no dedicated query for `impact_results` (or an API route to list them) — this creates an audit gap between Change Requests and persistent Impact Results.

## 5. Recommended Fix Order (Triage Plan)

1. Fix DB connectivity & initDb pattern (critical):
   - Ensure `src/db/index.js` uses a single shared Pool and that `initDb()` returns a stable Drizzle client. Remove per-call Pool creation and `pool.end()` in `leftJoinBaselineModules`.
   - Verify `src/lib/dbClient.js` imports the DB helper in an ESM-compatible way (avoid `require()` if Next is ESM-only).
2. Implement server-side creation flow for Change Requests (high priority):
   - Add a Server Action or secure POST handler that: generates server-side `customId`, inserts into `change_requests`, evaluates impact (call the calculation engine on server), persists `impact_results`, and returns the created record. Use a DB transaction.
3. Wire client UI to server actions & add UX feedback (medium):
   - Wire `NewChangeClient` (`formClient.jsx`) to call the POST API / Server Action and show loading/toast/error states. Replace TODO with actual code.
   - Provide success/failure toasts and disable-spinners for all create/update flows (modules, config, change-requests).
4. Harden routing & remove duplicate files (medium):
   - Complete the file moves (remove old files in `src/app/`) to avoid route collisions. Replace fragile client-derived `user` path parsing with explicit `params` passed from server components/ layouts.
5. UX polish & responsiveness (low-medium):
   - Remove hard `min-w-[]` where possible, make the right-side sticky widget responsive (collapse to a stacked card on small screens). Add skeleton loaders to server fetches and implement React Error Boundaries where server fetches may fail.

---

Observations & notes:

- The repository contains a well-structured schema (`src/db/schema.js`) that models the snapshot architecture correctly (projects, modules, baselines, change_requests, impact_results). The core gaps are wiring (server actions, robust DB initialization) and a few UX missing pieces (loading states, toasts, form handlers).
- Many pages already exist (modules list + client, baselines & detail, impacts) — this is a strong starting point. The highest-impact fixes are the DB connectivity and the server-side change request pipeline (atomic insert + impact calculation + result persistence).

If you want I can now implement the top-priority fix (stabilize `src/db/index.js` connection pooling and create a secure server action for creating change requests), then wire the client and add loading/toast UX — say "Proceed: DB & change-request flow" and I'll begin making code changes and tests.
