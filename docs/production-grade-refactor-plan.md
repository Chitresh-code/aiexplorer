# Production-Grade Review & Refactor Plan (components/, features/, hooks/, lib/)

## Goal
Bring `components/`, `features/`, `hooks/`, and `lib/` to production-grade quality by improving structure, reducing duplication, standardizing data flow, and enforcing consistent patterns.

## Scope
- `AIExplorer/components/**`
- `AIExplorer/features/**`
- `AIExplorer/hooks/**`
- `AIExplorer/lib/**`

## Current Issues (High-Level)
1. **Component duplication**
   - `components/use-case-details/*` and `components/submit-use-case/*` repeat UI (e.g., `ParcsCategorySelect`, `UnitOfMeasurementSelect`, `MetricsSection`).
   - Multiple “combobox/filter” variants exist across `components/*` and `features/*`.
2. **Mixed concerns**
   - Large page components handle UI + data shaping + API calls in one file.
   - View-only and edit flows are intertwined in feature pages.
3. **Inconsistent data normalization**
   - Some places expect snake_case, others camelCase.
   - Similar mappers repeated across files instead of centralized.
4. **API layer inconsistencies**
   - Mix of `fetch` and `axios` in `lib/api.ts` and feature-specific clients.
   - Error handling varies.
5. **Hooks lack unified fetch strategy**
   - Some hooks are simple state wrappers; others fetch data directly with different patterns.
6. **UI primitives duplicated**
   - `components/use-case-details/multi-combobox.tsx` vs `components/ui/multi-combobox.tsx`.

## Target Structure
```
components/
  ui/                 # primitive, reusable shadcn-style components
  shared/             # reusable domain-agnostic components
  domain/             # use-case specific UI (de-duped)

features/
  <feature>/
    api/              # feature API adapter
    hooks/            # feature data hooks
    components/       # feature components
    types.ts

hooks/
  data/               # generic hooks for data fetching (SWR/React Query)
  ui/                 # UI behavior hooks

lib/
  api/                # base client, error handling, request helpers
  mappers/            # response normalization (snake -> camel)
  types/              # shared domain types
  constants/          # enums/consts for UI + API
```

## Refactor Plan

### Phase 1 — Inventory & De-duplication (Low Risk) ✅ Done
- Identify duplicates:
  - `multi-combobox` exists in `components/use-case-details` and `components/ui`.
  - `filter-combobox` exists in `components/gallery` and `components/my-use-cases`.
  - `ParcsCategorySelect`, `UnitOfMeasurementSelect`, and metrics-related UI exist in multiple places.
- Consolidate duplicates into `components/shared` or `components/ui`.
- Update imports to use the shared versions.

**Completed work**
- Removed deprecated components and switched all usages to `components/shared/filter-combobox`.
- Replaced `ParcsCategorySelect` and `UnitOfMeasurementSelect` with the shared combobox in metrics UIs.
- Deleted unused chart component and empty folders.

**Visual review checklist (pages/sections)**
- `/app/gallery/page.tsx` → Filters bar (GalleryFilters)
- `/app/my-use-cases/page.tsx` → Filters row (Phase/Status/Business Unit)
- `/app/champion/page.tsx` → Filters row (Phase/Status/Business Unit)
- `/app/use-case-details/[id]/page.tsx` → Metrics tab (PARCS + Unit of Measurement dropdowns)
- `/app/submit-use-case/page.tsx` → Metrics step (PARCS + Unit of Measurement dropdowns)
- `/app/metric-reporting/page.tsx` → Metrics table (edit mode dropdowns)

### Phase 2 — Normalize Data Types (Medium Risk) ✅ Done
- Create shared domain types in `lib/types/`.
  - UseCase, PlanItem, Stakeholder, Update, Metrics, Checklist, etc.
- Centralize mapping from DB/API shape → UI shape in `lib/mappers/`.
- Update `useUseCaseDetails`, `useGalleryData`, `useUseCases`, and feature API clients to use normalized types.

**Completed work**
- Added `lib/types/usecase.ts` + `lib/types/usecase-details.ts`.
- Added `lib/mappers/usecase.ts` + `lib/mappers/usecase-details.ts`.
- Normalized data in `hooks/use-usecases.ts` and `hooks/use-usecase-details.ts`.
- Updated `features/gallery/api/client.ts` to use normalized use case mappers.
- Removed legacy field fallbacks in `/app/my-use-cases/page.tsx` and `/app/champion/page.tsx`.

### Phase 3 — API Client Unification (Medium Risk)
- Introduce `lib/api/client.ts` for base `fetch` or axios wrapper.
- Standardize error handling:
  - Common response parsing
  - Consistent error format
- Move feature-specific API calls into `features/<feature>/api/` and reuse base client.

### Phase 4 — Hook Structure (Medium Risk)
- Standardize hooks to one pattern:
  - Either SWR/React Query for data fetching
  - Or a lightweight internal wrapper
- Move feature hooks under `features/<feature>/hooks`.
- Keep only truly generic hooks in `hooks/`.

### Phase 5 — Component Composition Cleanup (Higher Risk)
- Split large pages into smaller components:
  - `/use-case-details/[id]/page.tsx` → view-only + edit-specific subcomponents
  - `submit-use-case/page.tsx` → smaller sections + shared form logic
- Move repeated logic (diff handling, snapshot comparisons, validators) into reusable utilities.

### Phase 6 — UI Consistency & Accessibility (Medium Risk)
- Standardize buttons, inputs, and spacing with shared variants.
- Remove custom styling duplication, rely on `components/ui`.
- Audit interactive elements for keyboard navigation and focus states.

## Deliverables
1. A detailed inventory of duplicate components and recommended destinations.
2. A new `lib/types` + `lib/mappers` foundation.
3. Consolidated API layer with consistent error handling.
4. Smaller, cleaner feature components with separation of concerns.

## Risks & Mitigation
- **Risk**: Breaking data shape expectations.
  - **Mitigation**: Introduce mappers first and refactor incrementally.
- **Risk**: Large UI regressions.
  - **Mitigation**: Split into small PRs and visually verify key pages.

## Immediate Quick Wins
- Remove duplicated `multi-combobox` and `filter-combobox`.
- Consolidate `ParcsCategorySelect` and `UnitOfMeasurementSelect`.
- Centralize checklist + metrics mapping helpers in `lib/mappers`.

## Next Step
Confirm which phase you want to start with. I can produce a concrete refactor checklist per file once you pick the phase.
