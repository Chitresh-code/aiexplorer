# Patch APIs: Diff + Stored Procs + Sequences Plan

## Scope
APIs in `docs/aiexplorer-api.md`:
- PATCH `/api/usecases/{id}/info`
- PATCH `/api/usecases/{id}/plan`
- PATCH `/api/usecases/{id}/prioritize`
- PATCH `/api/usecases/{id}/metrics`
- POST `/api/usecases/{id}/stakeholders`
- PATCH `/api/usecases/{id}/stakeholders`
- POST `/api/usecases/{id}/updates`
- PATCH `/api/usecases/{id}/agent-library`

Goals:
1) Send **diffs only** from UI (no full payloads).
2) Use **stored procedures** for all writes.
3) Use **sequences** for inserts (no manual MAX(id)+1).

## Table + Sequence Map (from `docs/tables/schema`)
| API | Tables | Primary Key | Default Sequence |
| --- | --- | --- | --- |
| `/info` | `usecases` | `usecases.id` | `seq_usecases` |
| `/plan` | `[plan]` | `plan.id` | `seq_plan` |
| `/prioritize` | `prioritization` | `prioritization.id` | `seq_prioritization` |
| `/metrics` | `metric`, `metricreported` | `metric.id`, `metricreported.id` | `seq_metric`, `seq_metricreported` |
| `/stakeholders` | `stakeholder` | `stakeholder.id` | `seq_stakeholder` |
| `/updates` | `updates` | `updates.id` | `seq_updates` |
| `/agent-library` | `agentlibrary`, `usecasetheme`, `usecasepersona`, `usecaseknowledgesource` | `agentlibrary.id` / composite keys | `seq_agentlibrary` |

Notes:
- `usecasetheme`, `usecasepersona`, `usecaseknowledgesource` use composite PKs and **do not** use sequences.
- All insert procs should **omit `id`** so SQL defaults (`NEXT VALUE FOR`) are used.

## Diff Contract (UI → API)
General rules:
- Only send **changed fields**.
- Use explicit **create/update/delete** arrays for child collections.
- For **nullable** fields, include them in the payload only when the user intended to clear/change them.

### PATCH `/api/usecases/{id}/info`
Tables: `usecases`
Diff shape:
```
{
  "title": "...",           // only if changed
  "headlines": "...",       // only if changed
  "opportunity": "...",     // only if changed
  "businessValue": "...",   // only if changed
  "editorEmail": "..."
}
```
Stored proc:
- `dbo.UpdateUseCaseInfo`
- Parameters: `@UseCaseId`, `@Title`, `@Headlines`, `@Opportunity`, `@BusinessValue`, `@EditorEmail`
- Update **only** fields that are provided (see “Diff handling in SQL”).

### PATCH `/api/usecases/{id}/plan`
Tables: `[plan]`
Diff shape:
```
{
  "items": [
    { "usecasephaseid": 1, "startdate": "2026-01-01", "enddate": "2026-02-01" }
  ],
  "editorEmail": "..."
}
```
Rules:
- UI sends only changed phases.
- Server upserts on `(usecaseid, usecasephaseid)`.
- Insert uses `DEFAULT` id (sequence).

Stored proc:
- `dbo.UpsertUseCasePlan`
- Parameters: `@UseCaseId`, `@ItemsJson`, `@EditorEmail`
- `OPENJSON(@ItemsJson)` with columns `usecasephaseid`, `startdate`, `enddate`.

### PATCH `/api/usecases/{id}/prioritize`
Tables: `prioritization`
Diff shape:
```
{
  "priority": "High",
  "riceScore": "10",
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
Rules:
- UI sends only changed fields.
- If no prioritization row exists for `usecaseid`, insert and use `DEFAULT` id.

Stored proc:
- `dbo.UpsertUseCasePrioritization`
- Parameters: `@UseCaseId`, `@PayloadJson`, `@EditorEmail`
- Uses JSON field presence to update only provided fields.

### PATCH `/api/usecases/{id}/metrics`
Tables: `metric`, `metricreported`
Diff shape:
```
{
  "newMetrics": [ ... ],
  "updateMetrics": [ ... ],
  "deleteMetricIds": [1,2],
  "newReportedMetrics": [ ... ],
  "updateReportedMetrics": [ ... ],
  "deleteReportedMetricIds": [3,4],
  "editorEmail": "..."
}
```
Rules:
- UI should compute diffs (already partially implemented).
- Insert rows **without** id to use `seq_metric` / `seq_metricreported`.

Stored proc:
- `dbo.UpdateUseCaseMetrics`
- Parameters: `@UseCaseId`, `@PayloadJson`, `@EditorEmail`
- Use `OPENJSON` into table variables for new/update/delete sets.

### POST `/api/usecases/{id}/stakeholders`
Tables: `stakeholder`
Diff shape:
```
{ "roleId": 2, "stakeholderEmail": "user@ukg.com", "editorEmail": "..." }
```
Rules:
- Only insert new row (no update).
- Insert without id; default uses `seq_stakeholder`.
- Validate role: `rolemapping.isactive = 1`, `roletype = 2`, role != `Owner`.

Stored proc:
- `dbo.CreateUseCaseStakeholder`
- Parameters: `@UseCaseId`, `@RoleId`, `@StakeholderEmail`, `@EditorEmail`

### PATCH `/api/usecases/{id}/stakeholders`
Tables: `stakeholder`
Diff shape:
```
{ "id": 1, "roleId": 2, "stakeholderEmail": "user@ukg.com", "editorEmail": "..." }
```
Rules:
- UI sends only changes; server updates only provided fields.
- Keep the same role validations as POST.

Stored proc:
- `dbo.UpdateUseCaseStakeholder`
- Parameters: `@Id`, `@UseCaseId`, `@RoleId`, `@StakeholderEmail`, `@EditorEmail`

### POST `/api/usecases/{id}/updates`
Tables: `updates`
Diff shape:
```
{ "meaningfulUpdate": "...", "editorEmail": "..." }
```
Rules:
- Insert without id (uses `seq_updates`).
- Resolve `roleid`, `usecasephaseid`, `usecasestatusid` server-side.

Stored proc:
- `dbo.CreateUseCaseUpdate`
- Parameters: `@UseCaseId`, `@MeaningfulUpdate`, `@EditorEmail`

### PATCH `/api/usecases/{id}/agent-library`
Tables: `agentlibrary`, `usecasepersona`, `usecasetheme`, `usecaseknowledgesource`
Diff shape:
```
{
  "agentLibraryId": 10,
  "vendorModelId": 5,
  "agentId": "agent-123",
  "agentLink": "...",
  "prompt": "...",
  "aiThemeIds": { "add": [1,2], "remove": [3] },
  "personaIds": { "add": [4], "remove": [] },
  "knowledgeSourceIds": { "add": [], "remove": [6] },
  "editorEmail": "..."
}
```
Rules:
- Only send changed scalar fields.
- For link tables, send `add`/`remove` sets.
- Insert agentlibrary row (if missing) without id (uses `seq_agentlibrary`).

Stored proc:
- `dbo.UpdateUseCaseAgentLibraryDetails` (extend if needed)
- Parameters: `@UseCaseId`, `@PayloadJson`, `@EditorEmail`
- Apply add/remove to join tables with `MERGE` or `INSERT`/`DELETE`.

## Diff Handling in SQL (pattern)
For nullable values, SQL must distinguish:
- **Not provided** → do not update
- **Provided as null** → clear the column

Recommended approach:
```
DECLARE @hasTitle BIT = IIF(JSON_VALUE(@PayloadJson, '$.title') IS NULL
  AND JSON_QUERY(@PayloadJson, '$.title') IS NULL, 0, 1);
```
Then update only when `@hasTitle = 1`.

## Implementation Steps
1. **UI diff snapshots**
   - Store the original data per section.
   - Build diff objects on save and send only changed fields.
2. **API layer**
   - Update routes to pass JSON payloads to stored procs only.
   - Remove inline SQL in PATCH/POST handlers for this scope.
3. **Stored procs**
   - Add the procs listed above (`docs/stored_procedures/new/`).
   - All inserts should omit `id` to use sequences.
4. **Validation**
   - Keep role validation for stakeholders.
   - Keep metric validation (dates, required fields) in proc or API.
5. **Docs**
   - Update `docs/aiexplorer-api.md` with diff payloads and note sequence usage.
   - Add a “Diff + Stored Proc + Sequence” section per endpoint.

## Dependencies / Cross-Checks
- `seq_*` defaults exist for all ID tables listed above.
- Composite-key tables (`usecasetheme`, `usecasepersona`, `usecaseknowledgesource`) should be handled with add/remove lists.
- Ensure **no MAX(id)+1** usage in procs to avoid race conditions.
