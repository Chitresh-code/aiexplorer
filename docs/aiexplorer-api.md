# AIExplorer API Reference

Base path: `/api` (Next.js App Router). All endpoints return JSON. Most responses include `cache-control: no-store`.

## Health

### GET `/api/health`

Checks API + database connectivity.

Response:

```bash
{ "ok": true, "db": "up" }
```

Errors: `503` with `{ "ok": false, "db": "down", "message": "..." }`.

## Champion Lookup

### GET `/api/champion?email=you@company.com`

Returns whether the email is listed as an AI Champion.

Response:

```bash
{ "isChampion": true }
```

If `email` is missing, the response is `{ "isChampion": false }`.

## Stakeholders (by Business Unit)

### GET `/api/stakeholders?businessUnitId=123`

Returns stakeholder mappings for a business unit (filtered by active rows and active role mappings).
If `businessUnitId` is missing/invalid, returns an empty list.

Response:

```bash
{
  "items": [
    {
      "id": 1,
      "businessunitid": 123,
      "businessunit": "Go-to-Market",
      "team": "Team A",
      "roleid": 10,
      "role": "Champion",
      "u_krewer_email": "user@company.com"
    }
  ]
}
```

## Mappings

### GET `/api/mappings?types=...`
Returns one or more mapping lists. `types` is a comma-separated list of camelCase types.

Example request:
```
GET /api/mappings?types=businessUnits,roles,status
```

Example response:
```
{
  "businessUnits": {
    "items": [
      { "id": 1, "businessUnitName": "GTM", "teamName": "Marketing" }
    ]
  },
  "roles": {
    "items": [{ "id": 1, "name": "Champion", "reviewFlag": "1", "roleType": "2" }]
  },
  "status": {
    "items": [{ "id": 1, "name": "Idea", "color": "Green", "definition": "..." }]
  }
}
```

### GET `/api/mappings?all=true`
Returns all mapping types in one payload.

Supported types:
- businessUnits
- themes
- personas
- vendorModels
- aiProductQuestions
- status
- phases
- roles
- reportingFrequency
- rice
- implementationTimespans
- metricCategories
- knowledgeSources
- unitOfMeasure

Notes:
- `businessUnits` is a flat list of unit/team rows; the UI should dedupe `businessUnitName` where needed.
- All mappings are filtered to `isactive = 1` where applicable.

## Use Cases (List + Create)

### GET `/api/usecases`
Query params:
- `view`: `list` | `gallery` | `full` (default: `full`)
- `role`: `owner` | `champion` (optional)
- `email`: required when `role` is provided

Filtering, sorting, and pagination are handled in the frontend.

Response (wrapped):
```
{ "items": [ ... ] }
```

Examples:
- `GET /api/usecases?view=gallery`
- `GET /api/usecases?role=owner&email=you@company.com&view=full`
- `GET /api/usecases?role=champion&email=you@company.com&view=full`

#### `view=list`
```
{
  "items": [
    {
      "id": 1,
      "title": "Use case title",
      "phase": "Idea",
      "status": "New",
      "teamName": "Team A",
      "businessUnitName": "GTM"
    }
  ]
}
```

#### `view=gallery`
```
{
  "items": [
    {
      "id": 1,
      "businessUnitId": 1,
      "phaseId": 1,
      "statusId": 1,
      "title": "...",
      "headlines": "...",
      "opportunity": "...",
      "businessValue": "...",
      "informationUrl": "...",
      "primaryContact": "...",
      "productChecklist": "...",
      "eseDependency": "...",
      "businessUnitName": "...",
      "teamName": "...",
      "phase": "...",
      "statusName": "...",
      "statusColor": "Green"
    }
  ]
}
```

#### `view=full`
```
{
  "items": [
    {
      "id": 1,
      "businessUnitId": 1,
      "phaseId": 1,
      "statusId": 1,
      "title": "...",
      "headlines": "...",
      "opportunity": "...",
      "businessValue": "...",
      "informationUrl": "...",
      "primaryContact": "...",
      "productChecklist": "...",
      "eseDependency": "...",
      "businessUnitName": "...",
      "teamName": "...",
      "phase": "...",
      "statusName": "...",
      "statusColor": "...",
      "priority": 1,
      "deliveryTimespan": "...",
      "phasePlan": [
        { "phaseId": 1, "phaseName": "Idea", "startDate": "2025-01-01", "endDate": "2025-02-01" }
      ]
    }
  ]
}
```

Used by:
- `AIExplorer/features/gallery/api/client.ts` (`view=gallery`)
- `AIExplorer/app/my-use-cases/page.tsx` (`role=owner&view=full`)
- `AIExplorer/app/champion/page.tsx` (`role=champion&view=full`)
- `AIExplorer/app/metric-reporting/page.tsx` (`role=owner&view=full`)

### POST `/api/usecases`
Creates a use case and optional related records.

Required:
- `title`
- `primaryContact`
- `editorEmail`

Optional:
- `businessUnitId`, `phaseId`, `statusId`
- `headlines`, `opportunity`, `businessValue`, `subTeamName`, `informationUrl`, `eseDependency`
- `checklist`: `{ questionId, response }[]`
- `stakeholders`: `{ roleId, role, stakeholderEmail }[]`
- `plan`: `{ usecasephaseid, startdate, enddate }[]`
- `metrics`: `{ metrictypeid, unitofmeasureid, primarysuccessmetricname, baselinevalue, baselinedate, targetvalue, targetdate }[]`

Response:
```
{ "id": 123, "approvals": false }
```
TODO: Update this api's stored proc to use now created sequence for id.

`approvals` is true when the approval flow is successfully triggered.

## Use Case Detail

### GET `/api/usecases/{id}`
Query params:
- `type`: `gallery` | `owner` | `champion`
- `include`: comma-separated list of sections to return
- `all=true`: return all sections (ignores `include`)
- `email`: required when `type=owner` or `type=champion`

Defaults:
- `type=gallery` → `include=useCase`
- `type=owner|champion` → all sections (unless `include` provided)

Response shape varies by `include`:
```
{
  "useCase": { ... },
  "agentLibrary": [ ... ],
  "personas": [ ... ],
  "themes": [ ... ],
  "plan": [ ... ],
  "prioritize": { ... },
  "metrics": { "items": [ ... ], "reported": [ ... ] },
  "stakeholders": [ ... ],
  "updates": [ ... ]
}
```

## Use Case Info

### PATCH `/api/usecases/{id}/info`
Body:
```
{
  "title": "...",
  "headlines": "...",
  "opportunity": "...",
  "businessValue": "...",
  "editorEmail": "..."
}
```
At least one of `title`, `headlines`, `opportunity`, `businessValue` is required.

Response:
```
{ "ok": true }
```

## Use Case Plan

### GET `/api/usecases/{id}/plan`
Response:
```
{
  "items": [
    {
      "id": 1,
      "usecaseid": 123,
      "usecasephaseid": 2,
      "phase": "Design",
      "startdate": "2025-01-01",
      "enddate": "2025-02-01",
      "modified": "...",
      "created": "...",
      "editor_email": "..."
    }
  ]
}
```

### PATCH `/api/usecases/{id}/plan`
Body:
```
{
  "items": [
    { "usecasephaseid": 2, "startdate": "2025-01-01", "enddate": "2025-02-01" }
  ],
  "editorEmail": "..."
}
```
TODO: need to update the proc to use the new sequence for id.

Response:
```
{ "ok": true }
```

## Use Case Prioritization

### GET `/api/usecases/{id}/prioritize`
Response:
```
{
  "item": {
    "id": 1,
    "usecaseid": 123,
    "ricescore": "10",
    "priority": "High",
    "aigallerydisplay": "true",
    "sltreporting": "false",
    "totaluserbase": "1000",
    "reach": "500",
    "impact": "Medium",
    "confidence": "0.7",
    "effort": "2",
    "timespanid": 1,
    "reportingfrequencyid": 2,
    "modified": "...",
    "created": "...",
    "editor_email": "..."
  }
}
```

### PATCH `/api/usecases/{id}/prioritize`
Body (any subset is allowed):
```
{
  "riceScore": "10",
  "priority": "High",
  "displayInGallery": true,
  "sltReporting": false,
  "totalUserBase": 1000,
  "reach": 500,
  "impact": "Medium",
  "confidence": 0.7,
  "effort": 2,
  "timespanId": 1,
  "reportingFrequencyId": 2,
  "editorEmail": "..."
}
```
TODO: need to update the proc to use the new sequence for id.

Response:
```
{ "ok": true, "id": 1 }
```

## Use Case Metrics

### GET `/api/usecases/{id}/metrics`
Response:
```
{
  "metrics": [ ... ],
  "reportedMetrics": [ ... ]
}
```

### PATCH `/api/usecases/{id}/metrics`
Body (all keys optional; must include at least one change):
```
{
  "newMetrics": [
    {
      "metricTypeId": 1,
      "unitOfMeasureId": 2,
      "primarySuccessMetricName": "Time saved",
      "baselineValue": 10,
      "baselineDate": "2025-01-01",
      "targetValue": 20,
      "targetDate": "2025-06-01"
    }
  ],
  "updateMetrics": [
    {
      "id": 10,
      "metricTypeId": 1,
      "unitOfMeasureId": 2,
      "primarySuccessMetricName": "Time saved",
      "baselineValue": 10,
      "baselineDate": "2025-01-01",
      "targetValue": 20,
      "targetDate": "2025-06-01"
    }
  ],
  "deleteMetricIds": [10],
  "newReportedMetrics": [
    { "metricId": 10, "reportedValue": 12, "reportedDate": "2025-02-01" }
  ],
  "updateReportedMetrics": [
    { "id": 5, "reportedValue": 15, "reportedDate": "2025-03-01" }
  ],
  "deleteReportedMetricIds": [5],
  "editorEmail": "..."
}
```
TODO: need to update the proc to use the new sequence for id.

Validation highlights:
- New metrics require `metricTypeId`, `unitOfMeasureId`, `primarySuccessMetricName`,
  `baselineValue`, `baselineDate`, `targetValue`, `targetDate`.
- `targetDate` must be after `baselineDate` and after today.
- Reported metrics require `reportedValue` and `reportedDate` when provided.

Response:
```
{ "ok": true }
```

## Use Case Stakeholders

### GET `/api/usecases/{id}/stakeholders`
Response:
```
{
  "items": [
    {
      "id": 1,
      "roleid": 2,
      "usecaseid": 123,
      "role": "Reviewer",
      "stakeholder_email": "user@company.com",
      "modified": "...",
      "created": "...",
      "editor_email": "..."
    }
  ]
}
```

### POST `/api/usecases/{id}/stakeholders`
Adds a stakeholder. Role must be active, roleType `2`, and not "Owner".

Body:
```
{ "roleId": 2, "stakeholderEmail": "user@company.com", "editorEmail": "..." }
```

Response:
```
{ "item": { "id": 1, "roleid": 2, "usecaseid": 123, "role": "Reviewer", "stakeholder_email": "user@company.com" } }
```
TODO: need to update the proc to use the new sequence for id.

### PATCH `/api/usecases/{id}/stakeholders`
Updates a stakeholder. Same role rules as POST.

Body:
```
{ "id": 1, "roleId": 2, "stakeholderEmail": "user@company.com", "editorEmail": "..." }
```

Response:
```
{ "item": { "id": 1, "roleid": 2, "usecaseid": 123, "role": "Reviewer", "stakeholder_email": "user@company.com" } }
```
TODO: need to update the proc to use the new sequence for id. if being used

## Use Case Updates

### GET `/api/usecases/{id}/updates`
Response:
```
{
  "items": [
    {
      "id": 1,
      "usecaseid": 123,
      "meaningfulupdate": "...",
      "roleid": 2,
      "role": "Reviewer",
      "usecasephaseid": 1,
      "phase": "Idea",
      "usecasestatusid": 1,
      "status": "New",
      "statusColor": "Green",
      "modified": "...",
      "created": "...",
      "editor_email": "..."
    }
  ]
}
```

### POST `/api/usecases/{id}/updates`
Adds a stakeholder update. The user must be a stakeholder for the use case.

Body:
```
{ "meaningfulUpdate": "...", "editorEmail": "user@company.com" }
```

Response:
```
{ "item": { "id": 1, "meaningfulupdate": "...", "usecaseid": 123, "roleid": 2 } }
```
TODO: need to update the proc to use the new sequence for id.

## Use Case Agent Library

### GET `/api/usecases/{id}/agent-library`
Response:
```
{
  "items": [
    {
      "usecaseid": 123,
      "aiThemeIds": [1, 2],
      "personaIds": [3],
      "knowledgeSourceIds": [4],
      "id": 10,
      "vendormodelid": 5,
      "agentid": "agent-123",
      "agentlink": "https://...",
      "prompt": "...",
      "modified": "...",
      "created": "...",
      "editor_email": "..."
    }
  ]
}
```

### PATCH `/api/usecases/{id}/agent-library`
Body (any subset is allowed):
```
{
  "aiThemeIds": [1, 2],
  "personaIds": [3],
  "knowledgeSourceIds": [4],
  "agentLibraryId": 10,
  "vendorModelId": 5,
  "agentId": "agent-123",
  "agentLink": "https://...",
  "prompt": "...",
  "editorEmail": "..."
}
```
TODO: need to update the proc to use the new sequence for id.

Response:
```
{ "message": "Agent library updated successfully", "success": true }
```

## Use Case Similarity

### POST `/api/usecases/similar`
Body:
```
{ "query": "search terms" }
```

Response:
```
{
  "items": [
    {
      "id": 1,
      "title": "...",
      "phase": "...",
      "status": "...",
      "businessUnit": "...",
      "team": "...",
      "subTeam": "",
      "vendorName": "",
      "aiModel": "",
      "aiThemes": [],
      "personas": [],
      "bgColor": "#F5F5F5"
    }
  ],
  "total": 1
}
```

If `query` is empty, all gallery items are returned. If no matches are found, the full list is returned.

## AI Suggestions

These endpoints forward requests to the AI configuration in `config/*.yaml` and return the JSON output from the model.

### POST `/api/ai/suggestions/usecase`
Body: arbitrary JSON, passed to the use case suggestions schema.

Response (shape controlled by `config/usecase-suggestions.yaml`):
```
{ "suggestions": { ... } }
```

### POST `/api/ai/suggestions/metric`
Body: arbitrary JSON, passed to the metric suggestions schema.

Response:
```
{ "items": [ ... ] }
```

### POST `/api/ai/suggestions/phase`
Body:
```
{ "useCase": { ... }, "phases": [ ... ], "context": { ... } }
```

Response:
```
{ "items": [{ "name": "...", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" }] }
```
