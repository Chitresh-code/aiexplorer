# AI Gallery Review (React Best Practices + Web UI Guidelines)

## Scope
- `AIExplorer/app/gallery/page.tsx`
- `AIExplorer/app/gallery/[id]/page.tsx`
- `AIExplorer/lib/api.ts`
- `AIExplorer/lib/submit-use-case.ts`

## Goal
- Make the Gallery list and detail views fully data-driven via internal Next.js APIs.
- Remove hardcoded data and one-off mapping logic.
- Improve code structure without changing UI.
- Centralize reusable components globally for consistency and reuse.
- Use production-grade API structure even with static data stubs for now.

## Findings and Fixes (Ordered by Severity)

### 1) Detail page uses mock data and hardcoded content (critical)
- Evidence: `AIExplorer/app/gallery/[id]/page.tsx:20`, `AIExplorer/app/gallery/[id]/page.tsx:119`
- Why it matters: Refreshing or deep-linking to a use case shows stale or incorrect content because it falls back to `mockUseCases` and static text values.
- Fix:
  - Replace mock data and hardcoded fields with `GET /api/usecases/:id`.
  - Keep the route-state fast path, but fallback to API fetch when state is missing.
  - Add loading and not-found states rather than redirecting immediately.

### 2) Filtering inputs rely on hardcoded values and implicit mappings (high)
- Evidence: `AIExplorer/app/gallery/page.tsx:133`, `AIExplorer/app/gallery/page.tsx:51`
- Why it matters: Phase options and mapping defaults (`bgColor`, `phase`, `modelName`) are embedded in the UI. It makes the list hard to maintain and inconsistent with backend schema.
- Fix:
  - Move phase options and display metadata to an API contract.
  - Normalize the backend response in a dedicated adapter (not inline in the component).
  - Define a strict `GalleryUseCase` DTO so the UI doesn't guess field names.

### 3) Inconsistent data sourcing and API base URL defaults (high)
- Evidence: `AIExplorer/lib/api.ts:3`, `AIExplorer/lib/submit-use-case.ts:7`
- Why it matters: Gallery pulls from multiple helper modules with their own API clients and hardcoded fallbacks, which can cause mismatched data or unexpected environments.
- Fix:
  - Consolidate into internal Next.js route handlers with typed contracts.
  - Keep the data access layer isolated so swapping static data for DB is trivial.

### 4) UI fetch logic and rendering are tightly coupled (medium)
- Evidence: `AIExplorer/app/gallery/page.tsx:44`, `AIExplorer/app/gallery/page.tsx:197`
- Why it matters: The page mixes fetching, normalization, filtering, and rendering in one component, making it harder to test or evolve without regressions.
- Fix:
  - Extract data-loading to a hook (e.g., `useGalleryData`).
  - Extract visual sections (filters, grid, card, empty state) into components.
  - Place reusable components in global shared folders (not route directories).
  - Keep filtering logic close to data (or push to API).

### 5) Accessibility gaps in interactive UI (medium)
- Evidence: `AIExplorer/app/gallery/page.tsx:196`, `AIExplorer/app/gallery/page.tsx:299`
- Why it matters: The search input has no label and cards are clickable without keyboard affordances.
- Fix:
  - Add an `aria-label` to the search input.
  - Use `<Link>` or make cards keyboard focusable with a button role and key handlers.

### 6) "Find Similar" tab has no backend integration (low)
- Evidence: `AIExplorer/app/gallery/page.tsx:209`
- Why it matters: Users can toggle the tab, but results are filtered the same way as "Search."
- Fix:
  - Add a similarity-search API and trigger it when the tab is active.

## Required API Contracts

### API structure expectations (production-ready, static data for now)
- Use route handlers under `AIExplorer/app/api/...` with a clear resource naming scheme.
- Validate query params and return typed responses.
- Keep handler logic in a dedicated `features/gallery/api` module and call it from the route.
- Use a service/repository layer pattern so static data can be replaced by DB access without changing handlers.

### 1) List Use Cases
`GET /api/usecases`
Query params:
- `search`
- `status`
- `phase`
- `business_unit`
- `team`
- `sub_team`
- `vendor`
- `persona`
- `ai_theme`
- `ai_model`
- `skip`
- `limit`

Response (example shape):
```json
{
  "items": [
    {
      "id": 123,
      "title": "Autotranslation using AWS translation",
      "phase": "Diagnose",
      "businessUnit": "Communications",
      "team": "Content Ops",
      "subTeam": "Localization",
      "vendorName": "Poppulo AI",
      "aiTheme": ["Audio Generation", "Causal AI"],
      "personas": ["All"],
      "bgColor": "#c7e7e7"
    }
  ],
  "total": 42
}
```

### 2) Use Case Detail
`GET /api/usecases/:id`
Response (example shape):
```json
{
  "id": 123,
  "title": "Autotranslation using AWS translation",
  "phase": "Diagnose",
  "businessUnit": "Communications",
  "team": "Content Ops",
  "subTeam": "Localization",
  "vendorName": "Poppulo AI",
  "aiTheme": ["Audio Generation", "Causal AI"],
  "personas": ["All"],
  "bgColor": "#c7e7e7",
  "headline": "One-line executive headline",
  "opportunity": "What is the idea for which AI is being used?",
  "evidence": "Why it is needed?",
  "primaryContact": "Name, title, email"
}
```

### 3) Gallery Filters Metadata
`GET /api/usecases/filters`
Response (example shape):
```json
{
  "statuses": ["Draft", "Submitted", "Approved"],
  "phases": ["Idea", "Diagnose", "Design", "Implemented"],
  "personas": ["All", "Developer", "Admin"],
  "aiThemes": ["Conversational AI", "Intelligent Document Processing"],
  "vendors": [
    {
      "name": "Poppulo AI",
      "models": ["Poppulo Model A", "Poppulo Model B"]
    },
    {
      "name": "Azure AI",
      "models": ["GPT-4", "GPT-4o"]
    }
  ],
  "businessUnits": [
    {
      "name": "Engineering",
      "teams": [
        {
          "name": "Platform",
          "subTeams": ["Core", "Infra"]
        }
      ]
    }
  ]
}
```

### 4) Similar Use Cases (Find Similar tab)
`POST /api/usecases/similar`
Request:
```json
{ "query": "Describe your use case to find similar ones..." }
```
Response:
```json
{ "items": [ /* same shape as list items */ ] }
```

## Component Placement (Global Reuse)
- Shared gallery UI components should live outside `app/` routes.
- Suggested: `AIExplorer/components/gallery/` or `AIExplorer/features/gallery/components/`.
- Route files should orchestrate data + layout, not contain reusable widgets.

## Suggested Validation Steps
- Load the gallery list with and without filters; confirm server-driven results and counts.
- Open `/gallery/:id` directly and confirm data renders without route-state.
- Toggle "Find Similar" and verify it uses the similarity endpoint.
- Keyboard-tab through search and cards to confirm accessible navigation.

## Notes
- Web Interface Guidelines normally require fetching the latest rules from Vercel. Network access was unavailable, so the UI review above uses standard accessibility and UX heuristics as a fallback.
