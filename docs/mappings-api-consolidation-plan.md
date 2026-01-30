# Mappings API Consolidation Plan

## Goal
Replace multiple mapping endpoints with a single endpoint that can return one or many mappings via query params. This reduces client calls and allows a page to fetch all required mapping data in one request.

## Proposed Endpoint

### GET `/api/mappings`

#### Query params
- `types`: comma-separated list of mapping types to return (camelCase only)  
  Example: `types=businessUnits,roles,status`
- `all=true`: return all mapping types (ignores `types`)

#### Response
Always returns an object keyed by mapping type.

Example:
```
{
  "businessUnits": { "items": [ ... ] },
  "roles": { "items": [ ... ] },
  "status": { "items": [ ... ] }
}
```

Errors:
- `400` if an unknown `types` value is provided.

## Supported Mapping Types

| Type | Current Endpoint | Source Table | Notes |
| --- | --- | --- | --- |
| businessUnits | `/api/mappings/business-units` | `businessunitmapping` | Returns flat rows of business unit + team |
| themes | `/api/mappings/themes` | `aithememapping` | `isactive` filtered |
| personas | `/api/mappings/personas` | `personamapping` | `isactive` filtered |
| vendorModels | `/api/mappings/vendor-models` | `vendormodelmapping` | `isactive` filtered |
| aiProductQuestions | `/api/mappings/ai-product-questions` | `aiproductquestions` | `isactive` filtered |
| status | `/api/mappings/status` | `statusmapping` | `isactive` filtered |
| phases | `/api/mappings/phases` | `phasemapping` | `isactive` filtered |
| roles | `/api/mappings/roles` | `rolemapping` | `isactive` filtered |
| reportingFrequency | `/api/mappings/reporting-frequency` | `reportingfrequency` | `isactive` filtered |
| rice | `/api/mappings/rice` | `rice` | `isactive` filtered |
| implementationTimespans | `/api/mappings/implementation-timespans` | `implementationtimespan` | `isactive` filtered |
| metricCategories | `/api/mappings/metric-categories` | `outcomes` | `isactive` filtered |
| knowledgeSources | `/api/mappings/knowledge-sources` | `knowledgesourcemapping` | `isactive` filtered |
| unitOfMeasure | `/api/mappings/unit-of-measure` | `unitofmeasure` | `isactive` filtered |

## Shape Compatibility
The consolidated API should return the **same per-type shape** as the current endpoint to avoid client breakage,
except for `businessUnits`, which now returns a flat list of unit/team rows.
Use the table definitions in `docs/tables/schema` as the source of truth when mapping fields.

All mapping results must be filtered to `isactive = 1` where the column exists.

Examples:
- `roles` → `{ items: [{ id, name, reviewFlag, roleType }] }`
- `status` → `{ items: [{ id, name, color, definition }] }`
- `businessUnits` → `{ items: [{ id, businessUnitName, teamName }] }` (frontend dedupes businessUnitName)
  - Use `id` as the team-level identifier for selections (per-row team ID in `businessunitmapping`).

## Implementation Notes
1. Keep each mapping query in its existing helper (or a shared internal function).
2. Resolve `types` param into a set of allowed mapping types.
3. Execute only requested queries and return a keyed object.
4. Preserve `cache-control: no-store`.

## Example Requests
- All mappings:
  - `GET /api/mappings?all=true`
- Page-level subset:
  - `GET /api/mappings?types=roles,status,phases`

## UI Update Plan (by page)
These pages should switch from multiple per-type calls to a single consolidated call:

- **Gallery filters** (`AIExplorer/features/gallery/api/client.ts`)
  - Replace multiple calls with:  
    `GET /api/mappings?types=businessUnits,status,phases,personas,themes,vendorModels`
- **Submit Use Case** (`AIExplorer/app/submit-use-case/page.tsx`)
  - Replace mapping calls with:  
    `GET /api/mappings?types=businessUnits,roles,aiProductQuestions,metricCategories,unitOfMeasure,phases`
- **Use Case Details** (`AIExplorer/app/use-case-details/[id]/page.tsx`)
  - Replace mapping calls with:  
    `GET /api/mappings?types=themes,status,metricCategories,unitOfMeasure,phases,personas,vendorModels,knowledgeSources,rice,implementationTimespans,reportingFrequency,roles`
- **My Use Cases** (`AIExplorer/app/my-use-cases/page.tsx`)
  - Replace mapping calls with:  
    `GET /api/mappings?types=businessUnits,phases,status,implementationTimespans`
- **Champion Use Cases** (`AIExplorer/app/champion/page.tsx`)
  - Replace mapping calls with:  
    `GET /api/mappings?types=businessUnits,phases,status,implementationTimespans`
- **Metric Reporting** (`AIExplorer/app/metric-reporting/page.tsx`)
  - Replace mapping calls with:  
    `GET /api/mappings?types=metricCategories,unitOfMeasure`

## APIs to Remove (after migration)
Once pages are updated, delete these per-type endpoints:
- `AIExplorer/app/api/mappings/ai-product-questions`
- `AIExplorer/app/api/mappings/business-units`
- `AIExplorer/app/api/mappings/implementation-timespans`
- `AIExplorer/app/api/mappings/knowledge-sources`
- `AIExplorer/app/api/mappings/metric-categories`
- `AIExplorer/app/api/mappings/personas`
- `AIExplorer/app/api/mappings/phases`
- `AIExplorer/app/api/mappings/reporting-frequency`
- `AIExplorer/app/api/mappings/rice`
- `AIExplorer/app/api/mappings/roles`
- `AIExplorer/app/api/mappings/status`
- `AIExplorer/app/api/mappings/themes`
- `AIExplorer/app/api/mappings/unit-of-measure`
- `AIExplorer/app/api/mappings/vendor-models`
- `AIExplorer/app/api/mappings/subteams` (no longer needed)

## Migration Plan
1. Implement consolidated endpoint.
2. Update pages to call `/api/mappings?types=...`.
3. Deprecate old endpoints after confirmation.

## Open Questions
- None.
