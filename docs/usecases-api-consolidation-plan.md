# Use Cases API Consolidation Plan

## Goal
Consolidate these endpoints into a single, flexible `GET /api/usecases`:
- `GET /api/usecases` (list)
- `GET /api/usecases/gallery`
- `GET /api/usecases/user`
- `GET /api/usecases/champion`

The consolidated endpoint should:
- power the gallery (with a gallery-friendly view)
- replace `/api/usecases/user` and `/api/usecases/champion` via `role` + `email` filters
- return a consistent, documented response shape

## Current Endpoints (Inputs + Outputs)

### 1) GET `/api/usecases`
Input (query params):
- `search`
- `status`
- `phase`
- `business_unit`
- `team`
- `sub_team`
- also accepted but not applied server-side: `vendor`, `persona`, `ai_theme`, `ai_model`, `sortBy`, `sortDir`, `skip`, `limit`, `filterKey`, `filterValue`

Output fields (array, not wrapped):
- `ID`, `Title`, `Phase`, `Status`, `TeamName`, `SubTeamName`, `BusinessUnitName`

Tables used:
- `usecases`
- `phasemapping`
- `statusmapping`
- `businessunitmapping`

### 2) GET `/api/usecases/gallery`
Input: none

Output fields (`items[]`):
- `id`, `businessUnitId`, `phaseId`, `statusId`
- `title`, `headlines`, `opportunity`, `businessValue`
- `informationUrl`, `primaryContact`, `productChecklist`, `eseDependency`
- `businessUnitName`, `teamName`, `phase`, `statusName`, `statusColor`

Tables used (via stored proc `dbo.GetGalleryUseCases`):
- `usecases`
- `businessunitmapping`
- `phasemapping`
- `statusmapping`

### 3) GET `/api/usecases/user?email=...`
Input:
- `email` (required)

Output fields (`items[]`):
- All gallery fields, plus:
- `priority`, `deliveryTimespan`, `currentPhaseStartDate`, `currentPhaseEndDate`

Tables used (via stored proc `dbo.GetUserUseCases`):
- `usecases`
- `businessunitmapping`
- `phasemapping`
- `statusmapping`
- `prioritization`
- `implementationtimespan`
- `plan`

### 4) GET `/api/usecases/champion?email=...`
Input:
- `email` (required)

Output fields (`items[]`):
- Same as `/api/usecases/user`

Tables used (via stored proc `dbo.GetChampionUseCases`):
- `usecases`
- `businessunitmapping`
- `phasemapping`
- `statusmapping`
- `prioritization`
- `implementationtimespan`
- `plan`
- `stakeholder` (filtering by stakeholder email + role)

## Proposed Unified Endpoint

### GET `/api/usecases`

#### Query params
- `role=owner|champion`
- `email=<useremail>`
- `view=gallery|list|full` (default: `full`)

Filtering, sorting, and pagination are handled in the frontend.

#### Behavior
- `role=owner&email=...`
  - filter `usecases.primarycontact` by email (case-insensitive)
- `role=champion&email=...`
  - filter by stakeholder membership:
    - `stakeholder.stakeholder_email` matches email (case-insensitive)
    - and role IDs used in `GetChampionUseCases` (currently `4` or `14`)
- `view=gallery`
  - return fields used by the gallery; omit advanced fields
- `view=list`
  - return the current lightweight list fields
- `view=full`
  - return the superset of all fields below
  - include `phasePlan` with all phases (not just the current phase)

## Superset Field List (Unified Response)

Core identifiers and metadata:
- `id` (usecases.id)
- `businessUnitId` (usecases.businessunitid)
- `phaseId` (usecases.phaseid)
- `statusId` (usecases.statusid)

Use case content:
- `title` (usecases.title)
- `headlines` (usecases.headlines)
- `opportunity` (usecases.opportunity)
- `businessValue` (usecases.business_value)
- `informationUrl` (usecases.informationurl)
- `primaryContact` (usecases.primarycontact)
- `productChecklist` (usecases.productchecklist)
- `eseDependency` (usecases.esedependency)

Lookup/display fields:
- `businessUnitName` (businessunitmapping.businessunitname)
- `teamName` (businessunitmapping.teamname)
- `phase` (phasemapping.Phase)
- `statusName` (statusmapping.StatusName)
- `statusColor` (statusmapping.StatusColor)

Prioritization / planning (used by user/champion):
- `priority` (prioritization.priority)
- `deliveryTimespan` (implementationtimespan.timespan)
- `phasePlan` (all plan rows for the use case, grouped by phase)
  - `phaseId` (plan.usecasephaseid)
  - `phaseName` (phasemapping.Phase)
  - `startDate` (plan.startdate)
  - `endDate` (plan.enddate)

## Data Sources (from docs/tables)

| Field | Source table | Source column |
| --- | --- | --- |
| id | usecases | id |
| businessUnitId | usecases | businessunitid |
| phaseId | usecases | phaseid |
| statusId | usecases | statusid |
| title | usecases | title |
| headlines | usecases | headlines |
| opportunity | usecases | opportunity |
| businessValue | usecases | business_value |
| informationUrl | usecases | informationurl |
| primaryContact | usecases | primarycontact |
| productChecklist | usecases | productchecklist |
| eseDependency | usecases | esedependency |
| businessUnitName | businessunitmapping | businessunitname |
| teamName | businessunitmapping | teamname |
| phase | phasemapping | Phase |
| statusName | statusmapping | StatusName |
| statusColor | statusmapping | StatusColor |
| priority | prioritization | priority |
| deliveryTimespan | implementationtimespan | timespan |
| phasePlan | plan + phasemapping | usecasephaseid, startdate, enddate, Phase |
| champion filter | stakeholder | stakeholder_email, roleid |

## Suggested Join/Filter Logic

Base join (always):
- `usecases` u
- `businessunitmapping` bu on `bu.id = u.businessunitid`
- `phasemapping` pm on `pm.id = u.phaseid`
- `statusmapping` sm on `sm.id = u.statusid`

Optional joins (only when `view=full` or `role` filters require):
- `prioritization` pr (latest/lowest priority row)
- `implementationtimespan` it on `it.id = pr.timespanid`
- `plan` pl on `pl.usecaseid = u.id`
- `phasemapping` pm2 on `pm2.id = pl.usecasephaseid` (for plan phase names)
- `stakeholder` s (for `role=champion`)

Role filters:
- `role=owner`: match `LOWER(u.primarycontact)` to `LOWER(@email)`
- `role=champion`: `EXISTS` a stakeholder row where:
  - `LOWER(stakeholder_email) = LOWER(@email)`
  - `roleid IN (4, 14)` (per `GetChampionUseCases`)

## Response Shape by View

| Field | list | gallery | full |
| --- | --- | --- | --- |
| id | ✅ | ✅ | ✅ |
| businessUnitId | ❌ | ✅ | ✅ |
| phaseId | ❌ | ✅ | ✅ |
| statusId | ❌ | ✅ | ✅ |
| title | ✅ | ✅ | ✅ |
| headlines | ❌ | ✅ | ✅ |
| opportunity | ❌ | ✅ | ✅ |
| businessValue | ❌ | ✅ | ✅ |
| informationUrl | ❌ | ✅ | ✅ |
| primaryContact | ❌ | ✅ | ✅ |
| productChecklist | ❌ | ✅ | ✅ |
| eseDependency | ❌ | ✅ | ✅ |
| businessUnitName | ✅ | ✅ | ✅ |
| teamName | ✅ | ✅ | ✅ |
| phase | ✅ | ✅ | ✅ |
| statusName | ✅ | ✅ | ✅ |
| statusColor | ❌ | ✅ | ✅ |
| priority | ❌ | ❌ | ✅ |
| deliveryTimespan | ❌ | ❌ | ✅ |
| phasePlan | ❌ | ❌ | ✅ |

## Migration Plan

1) Implement unified `/api/usecases`:
   - use a stored procedure or shared query builder
   - support `role`, `email`, and `view` params
2) Update callers:
   - Gallery → `/api/usecases?view=gallery`
   - My Use Cases → `/api/usecases?role=owner&email=...`
   - Champion view → `/api/usecases?role=champion&email=...`
3) Deprecate old endpoints:
   - `/api/usecases/gallery`
   - `/api/usecases/user`
   - `/api/usecases/champion`

## Decisions
- List view will return `id` (lower camelCase). This is the common REST/JSON convention and avoids mixed casing across endpoints.
- `role=champion` should not hard-code role IDs. Resolve eligible roles from `rolemapping` where `roletype = 1` and `isactive = 1` so IDs can change without code updates.
