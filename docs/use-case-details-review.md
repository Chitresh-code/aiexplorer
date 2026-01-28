Use Case Details Review
Date: 2026-01-23

Scope
- `AIExplorer/app/use-case-details/[id]/page.tsx`
- `AIExplorer/app/use-case-details/[id]/components/*`
- `AIExplorer/app/use-case-details/multi-combobox.tsx`

Findings (Hardcoded or Placeholder Data)
- Use case lookup pulls the full list from `useUseCases()` and falls back to a local stub (Title/Phase/Status). `AIExplorer/app/use-case-details/[id]/page.tsx:243`
- Default status, phase dates, and timeline are hardcoded (e.g., 2024-01-01/2024-12-31). `AIExplorer/app/use-case-details/[id]/page.tsx:247`, `AIExplorer/app/use-case-details/[id]/page.tsx:686`
- Stakeholders list is hardcoded with demo names and roles. `AIExplorer/app/use-case-details/[id]/page.tsx:262`
- Updates feed is hardcoded. `AIExplorer/app/use-case-details/[id]/page.tsx:276`
- Reprioritize form defaults are hardcoded (RICE score, reporting frequency, toggles). `AIExplorer/app/use-case-details/[id]/page.tsx:301`
- Info tab defaults (Department, AI Themes, Headline, Opportunity, Evidence) are hardcoded strings. `AIExplorer/app/use-case-details/[id]/page.tsx:332`
- AI theme list uses `getDropdownData()` (submit-use-case mapping bundle) instead of a focused mapping endpoint. `AIExplorer/app/use-case-details/[id]/page.tsx:372`
- “Poppulo AI” badge is hardcoded. `AIExplorer/app/use-case-details/[id]/page.tsx:1089`
- Status dropdown options and approval decisions are hardcoded. `AIExplorer/app/use-case-details/[id]/page.tsx:1116`, `AIExplorer/app/use-case-details/[id]/page.tsx:1870`
- Approval history panel uses static data and static submitter. `AIExplorer/app/use-case-details/[id]/page.tsx:431`, `AIExplorer/app/use-case-details/[id]/page.tsx:1700`
- Knowledge source dropdown is hardcoded. `AIExplorer/app/use-case-details/[id]/page.tsx:1497`
- Completion summary and “Request Approval” content is hardcoded. `AIExplorer/app/use-case-details/[id]/page.tsx:2037`, `AIExplorer/app/use-case-details/[id]/page.tsx:2097`

APIs/Data Needed (to replace hardcoded content)
- `GET /api/usecases/:id` for core fields (title, phase, status, business unit, primary contact, evidence, opportunity, business value, info link).
- `GET /api/usecases/:id/plan` (or reuse plan table) for phase date ranges + timeline.
- `GET /api/usecases/:id/stakeholders` for stakeholder list (roles + emails + names).
- `GET /api/usecases/:id/updates` for updates feed.
- `GET /api/usecases/:id/approvals` for approval history and decision options.
- `GET /api/mappings/phases` and `GET /api/mappings/status` for phase/status labels + options.
- `GET /api/mappings/ai-themes` (or a use-case-specific mapping) for AI theme chips.
- `GET /api/mappings/roles` for stakeholder role options.
- `GET /api/mappings/knowledge-sources` (if modeled) for agent library sources.

Performance / Architecture (Vercel React Best Practices)
- Overfetching: the page loads all use cases via `useUseCases()` and then finds one by id. Use a dedicated `useUseCase(id)` hook that calls `GET /api/usecases/:id` to reduce payload and avoid list hydration. `AIExplorer/app/use-case-details/[id]/page.tsx:242`
- Large client component with many heavy tabs (metrics, reprioritize, approvals). Consider code-splitting non-default tabs with `next/dynamic` or lazy-loading tab content to improve initial render.
- `getDropdownData()` likely aggregates multiple mappings; replace with narrower endpoints to avoid loading unused data.

Reusable Component Opportunities
- Timeline rows are repeated per phase; create a `PhaseTimelineRow` component and map from phase mapping data.
- Stakeholder list item and dialog are reusable across screens (submit-use-case and use-case-details).
- Status select dropdown appears in multiple sections; create a shared `StatusSelect` wired to the status mapping.
- Approval history item rendering can be its own component to avoid repeated layout logic.
- Metric date picker patterns duplicate; consolidate into a single date picker component.

Routing Note
- Moving this to `app/my-use-cases/[id]/page.tsx` is reasonable for ownership views, but it would require updating links from gallery/champion screens or adding a route alias/redirect to avoid breaking deep links.

Summary
- The page is still mostly mocked with static data. It needs a dedicated use-case-details API and supporting endpoints (plan, stakeholders, updates, approvals, mappings) before it can be used for real data.
