# Mapping APIs and Filter Replacement

> Note: Mapping endpoints are now consolidated under `/api/mappings?types=...`.  
> This document reflects the legacy per-type endpoints for historical reference.

Goal: Replace the single `/api/usecases/filters` endpoint with dedicated mapping endpoints backed by Azure SQL. The frontend should build filter options by calling the mapping endpoints it needs.

Source of truth: `docs/Aihub.xlsx` (mapping sheets).

## Standard response shape

All mapping endpoints should return:

```
{
  "items": [
    {
      "id": 1,
      "name": "Example"
    }
  ]
}
```

Notes:
- Use `isActive` only where the UI needs it.
- Do not return `createdAt`, `updatedAt`, `createdBy`, or `updatedBy`.

## Mapping endpoints

### Business units, teams, and subteams (nested)
Source table: `Subteam_mapping` (Id, Businesssunitid, Business Unit Name, Team Name, Sub Team Name, isactive)

Endpoint:
- `GET /api/mappings/business-units`

Response shape:
```
{
  "items": [
    {
      "businessUnitName": "Go-to-Market",
      "teams": [
        {
          "teamName": "GTM",
          "subteams": [
            {
              "subTeamId": 1,
              "subTeamName": "Strategy"
            }
          ]
        }
      ]
    }
  ]
}
```

Required IDs:
- Always include `subTeamId` because it is the foreign key used in forms and related tables.

### Subteams (flat list)
Sheet: `Subteam_mapping` (Id, Businesssunitid, Business Unit Name, Team Name, Sub Team Name, isactive)

Endpoint:
- `GET /api/mappings/subteams`

Response fields:
- `id`, `businessUnitId`, `businessUnitName`, `teamName`, `subTeamName`

### AI themes
Sheet: `AITheme_mapping` (Id, ThemeName, ThemeDefinition, ThemeExample, Modified, Created, Editor.EMail, isactive)

Endpoint:
- `GET /api/mappings/themes`

Response fields:
- `id`, `name`, `definition`, `example`

### Personas
Sheet: `Persona_mapping` (Id, PersonaName, RoleDefinition, ExampleRoles, Modified, Created, Editor.EMail, isactive)

Endpoint:
- `GET /api/mappings/personas`

Response fields:
- `id`, `name`, `definition`, `exampleRoles`

### Vendor models
Sheet: `VendorModel_mapping` (Id, VendorName, ProductName, Modified, Created, Editor.EMail, isactive)

Endpoint:
- `GET /api/mappings/vendor-models`

Response fields:
- `id`, `vendorName`, `productName`, `roleId`

### AI product questions
Sheet: `AIProductQuestions_mapping` (Id, Question, QuestionType, ResponseValue, Modified, Created, Editor.EMail, isactive)

Endpoint:
- `GET /api/mappings/ai-product-questions`

Response fields:
- `id`, `question`, `questionType`, `responseValue`

### Status
Sheet: `Status_mapping` (Id, StatusName, StatusColor, StatusDefinitions, Modified, Created, Editor.EMail, isactive)

Endpoint:
- `GET /api/mappings/status`

Response fields:
- `id`, `name`, `color`, `definition`

### Phase
Sheet: `Phase_mapping` (Id, Phase, PhaseStage, Modified, Created, GUID, Editor.EMail, isactive)

Endpoint:
- `GET /api/mappings/phases`

Response fields:
- `id`, `name`, `stage`, `guid`

### Roles
Sheet: `Role_mapping` (Id, RoleName, Reviewflag, Roletype, Modified, Created, Editor.EMail, isactive)

Endpoint:
- `GET /api/mappings/roles`

Response fields:
- `id`, `name`, `reviewFlag`, `roleType`

### Reporting frequency
Sheet: `ReportingFrequency_mapping` (Id, Frequency, Modified, Created, Editor.EMail, isactive)

Endpoint:
- `GET /api/mappings/reporting-frequency`

Response fields:
- `id`, `frequency`

### RICE
Sheet: `RICE_mapping` (Id, CategoryDisplay, CategoryHeader, CategoryValue, Modified, Created, Editor.EMail, isactive)

Endpoint:
- `GET /api/mappings/rice`

Response fields:
- `id`, `categoryDisplay`, `categoryHeader`, `categoryValue`

### Implementation timespan
Sheet: `ImplementationTimespan_mapping` (Id, Timespan, Modified, Created, Editor.EMail, isactive)

Endpoint:
- `GET /api/mappings/implementation-timespans`

Response fields:
- `id`, `timespan`

### Metric categories
Sheet: `MetricCategory_mapping` (ID, Outcome Category, Outcome Description, default_unitofmeasure_id, Modified, Created, Modified By.email)

Endpoint:
- `GET /api/mappings/metric-categories`

Response fields:
- `id`, `category`, `description`, `defaultUnitOfMeasureId`

### Unit of measure
Sheet: `UnitOfMeasure_mapping` (ID, UnitOfMeasure, measuretype, Defaultvalue, Options, Modified, Created, Modified By.email)

Endpoint:
- `GET /api/mappings/unit-of-measure`

Response fields:
- `id`, `name`, `measureType`, `defaultValue`, `options`

## Remove filters API

Remove `/api/usecases/filters` and replace frontend usage with calls to mapping endpoints above. Build filter options from:
- `status`, `phases`, `business-units`, `subteams`, `themes`, `personas`, `vendor-models`

If any screen requires a consolidated response for performance, implement a dedicated UI-specific endpoint (for example, `/api/mappings/gallery`) that calls these mappings server-side. This should remain distinct from `/api/usecases/filters`.
