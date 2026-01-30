# Use Case Detail API Consolidation Plan

## Goal
Replace multiple sub-APIs under `/api/usecases/{id}` with a single consolidated endpoint that returns all required data in one payload (with optional sections via query params if needed).

## Current Sub-APIs
- `/api/usecases/{id}` (core detail payload: useCase + personas + themes + agentLibrary)
- `/api/usecases/{id}/info`
- `/api/usecases/{id}/plan`
- `/api/usecases/{id}/prioritize`
- `/api/usecases/{id}/metrics`
- `/api/usecases/{id}/stakeholders`
- `/api/usecases/{id}/updates`
- `/api/usecases/{id}/agent-library`

## Proposed Consolidated Endpoint
- `GET /api/usecases/{id}`

### Query params
- `type`: `gallery` | `owner` | `champion`
- `include`: comma-separated list of sections to return
- `all=true`: return all sections (ignores `include`)
- `email`: required when `type=champion` or `type=owner`

## Proposed Response Shape
```
{
  "useCase": { ... },
  "personas": [ ... ],
  "themes": [ ... ],
  "agentLibrary": [ ... ],
  "plan": [ ... ],
  "prioritize": { ... },
  "metrics": { "items": [ ... ], "reported": [ ... ] },
  "stakeholders": [ ... ],
  "updates": [ ... ]
}
```

## Data Sources
Identify how each section is currently sourced:
- `useCase` / `personas` / `themes` / `agentLibrary`: current `/api/usecases/{id}`
- `plan`: current `/api/usecases/{id}/plan`
- `prioritize`: current `/api/usecases/{id}/prioritize`
- `metrics`: current `/api/usecases/{id}/metrics`
- `stakeholders`: current `/api/usecases/{id}/stakeholders`
- `updates`: current `/api/usecases/{id}/updates`

## Implementation Approach
1. **Define contract** in code and docs.
2. **Server aggregation**
   - Option 1: New stored proc that returns multiple resultsets for each section.
   - Option 2: Compose server-side with parallel queries and existing procs.
3. **Use `type` + `include`** to control payload size per consumer.
4. **Update client usage**
   - `AIExplorer/app/use-case-details/[id]/page.tsx`: switch to consolidated endpoint.
   - `AIExplorer/app/gallery/[id]/page.tsx`: use consolidated endpoint with `type=gallery` and `include=useCase` only.
   - Champion/Owner views: use `type=champion` / `type=owner` with their respective include sets.
   - Any other call sites using sub-APIs.
5. **Deprecate and delete** old sub-API routes after verification.

## UI Changes (by page)
- **Use Case Details**: single request on load; replace per-section requests for plan, stakeholders, updates, metrics, prioritize.
- **Gallery Detail**: `type=gallery` and `include=useCase` only.
- **Champion Detail**: `type=champion` with `email` and include set for champion needs.
- **Owner Detail**: `type=owner` with include set for owner needs.
- **AI Gallery**: uses the consolidated `/api/usecases/{id}` for detail view.
- **Use Case Info**: loads use case details via `/api/usecases/{id}` (info section).
- **Report Metrics**: uses `/api/usecases/{id}` for detail context and `/api/usecases/{id}/metrics` for updates.

## APIs to Deprecate After Migration
- `/api/usecases/{id}/info`
- `/api/usecases/{id}/plan`
- `/api/usecases/{id}/prioritize`
- `/api/usecases/{id}/metrics`
- `/api/usecases/{id}/stakeholders`
- `/api/usecases/{id}/updates`
- `/api/usecases/{id}/agent-library`

## Access/Validation Notes
- For `type=champion`, validate the email exists in `dbo.stakeholder_mapping` with `roletype=1` and `isactive=1` before returning data.
- For `type=owner`, require `email` and validate it matches the use case `primarycontact`.

## Open Questions
- Should the consolidated endpoint be cached? (current endpoints are `no-store`)
- Confirm exact include defaults per `type` (gallery/owner/champion).
