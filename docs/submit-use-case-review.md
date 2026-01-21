# Submit Use Case Review

Scope: `AIExplorer/app/submit-use-case/page.tsx`, combobox/select components in `AIExplorer/app/submit-use-case/`, and data helpers in `AIExplorer/lib/submit-use-case.ts`.

Skills applied:
- vercel-react-best-practices (performance/structure review).
- web-design-guidelines (attempted; guideline fetch blocked by network, so UI review is best-effort).

## Findings (ordered by severity)

1) Hard-coded API base URL and console logging in client path
- `AIExplorer/lib/submit-use-case.ts:5` and `AIExplorer/lib/submit-use-case.ts:12` hard-code external URLs and localhost fallbacks, and `AIExplorer/lib/submit-use-case.ts:16` logs them. This bypasses Next.js API routing, leaks internal endpoints to the client bundle, and makes environments fragile.
Status: Implemented (same-origin by default; optional `NEXT_PUBLIC_API_URL`).

2) Single, very large client component with `@ts-nocheck`
- `AIExplorer/app/submit-use-case/page.tsx:1` disables type checks for the entire file, masking errors and making refactors risky. This file is ~130k lines and mixes UI, data fetching, validation, and dialogs, which increases bundle size and re-render cost.
Status: Not started.

3) Extra re-render subscriptions from unused `form.watch` calls
- `AIExplorer/app/submit-use-case/page.tsx:365` and `AIExplorer/app/submit-use-case/page.tsx:375` watch multiple fields that are not used. Each watch subscribes to changes and can trigger re-renders. Remove or replace with `useWatch` where needed.
Status: Implemented (targeted `useWatch`).

4) Sequential API calls on submit (avoidable waterfall)
- `AIExplorer/app/submit-use-case/page.tsx:1018` through `AIExplorer/app/submit-use-case/page.tsx:1039` creates stakeholders one by one and only then posts the plan. These can be parallelized after `createUseCase` to reduce total latency.
Status: Implemented (parallelized stakeholder + plan).

## Reusability opportunities

1) Consolidate single-select comboboxes
- `AIExplorer/app/submit-use-case/vendor-combobox.tsx:1`
- `AIExplorer/app/submit-use-case/model-combobox.tsx:1`
- `AIExplorer/app/submit-use-case/business-unit-combobox.tsx:1`
- `AIExplorer/app/submit-use-case/team-combobox.tsx:1`
- `AIExplorer/app/submit-use-case/sub-team-combobox.tsx:1`
All share the same Popover + Command pattern. Create one `SingleSelectCombobox` in `AIExplorer/components/ui` and pass options, placeholders, and align props. This will cut duplicate code and make dropdown behavior consistent.
Status: Implemented (now uses `AIExplorer/components/ui/combobox.tsx`).

2) Consolidate multi-select comboboxes
- `AIExplorer/app/submit-use-case/multi-combobox.tsx:1`
- `AIExplorer/app/submit-use-case/ai-theme-multi-combobox.tsx:1`
- `AIExplorer/app/submit-use-case/persona-multi-combobox.tsx:1`
These are near-identical. Consider one `MultiSelectCombobox` with optional badges and custom label renderers.
Status: Implemented (now uses `AIExplorer/components/ui/multi-combobox.tsx`).

3) Extract reusable layout blocks
- `AIExplorer/app/submit-use-case/page.tsx:102` to `AIExplorer/app/submit-use-case/page.tsx:2200` repeats Card + Header + Content patterns for each step. A `FormSection` or `StepCard` component would reduce duplication and make consistent spacing easier.
Status: Not started.

4) Extract dialog and table sections
- Stakeholders dialog logic and rendering can move into a `StakeholdersDialog` component to isolate Graph search + form controls.
- Metrics table (columns, inputs, and date dialog) can be a `MetricsTable` component to shrink the main file and reduce renders.
Status: Not started.

## UI/UX and accessibility (best-effort without fetched guidelines)

1) Dropdown positioning uses fixed offsets and disables collision handling
- `AIExplorer/components/ui/multi-combobox.tsx:61`
- `AIExplorer/components/ui/combobox.tsx:58`
- `AIExplorer/app/submit-use-case/components/ParcsCategorySelect.tsx:33`
Fixed offsets plus `avoidCollisions={false}` can place menus off-screen and break keyboard navigation on smaller viewports. Prefer anchor-aligned positioning with collision handling enabled.
Status: Implemented (collision-aware positioning, normalized offsets).

2) Labels are not bound to controls in the stakeholder dialog
- `AIExplorer/app/submit-use-case/page.tsx:2119` uses `<label htmlFor="role">`, but the Select trigger has no matching `id`, so screen readers cannot associate label and control.
Status: Implemented (label wired to trigger).

3) Search result list lacks listbox semantics
- `AIExplorer/app/submit-use-case/page.tsx:2139` renders a button list without `role="listbox"` and `role="option"` or keyboard navigation support. This is hard to use with keyboard and screen readers.
Status: Implemented (listbox/option roles added).

## Performance notes (vercel-react-best-practices)

1) Bundle size risk from axios in the client
- `AIExplorer/lib/submit-use-case.ts:3` pulls axios into a client-heavy screen. Consider switching to `fetch` in the client or moving data access to Next.js API routes to reduce bundle size.
Status: Implemented (axios removed).

2) Avoid unnecessary renders from derived state
- `AIExplorer/app/submit-use-case/page.tsx:365` and `AIExplorer/app/submit-use-case/page.tsx:375` subscribe to several fields and do not use them. This is a straightforward re-render optimization.
Status: Implemented (targeted `useWatch`).

3) Parallelize submit network calls
- `AIExplorer/app/submit-use-case/page.tsx:1018` can run stakeholder creation and plan creation in parallel after the use case is created to reduce total submission time.
Status: Implemented.

## Suggested next steps

1) Replace hard-coded API URLs with internal Next.js routes or environment-driven configs.
2) Collapse combobox components into reusable single and multi-select components.
3) Break `page.tsx` into smaller components (each step, dialog, metrics table).
4) Normalize dropdown positioning (anchor-based, collision-aware).
5) Add proper label/aria wiring for dialog inputs and search results.
