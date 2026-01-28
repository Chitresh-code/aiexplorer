# Stakeholder Role Mappings (Unified)

## Goal
Add a single API that merges `ai_champions` and `aichampiondelegates` so Stakeholders can be auto-suggested by Business Unit when adding roles in the Submit Use Case flow. The Owner role continues to map to the logged-in user.

## Plan
1. Build one mapping endpoint that normalizes both tables and supports filtering by business unit.
2. Keep payload shapes consistent and small (id, businessUnitName, businessUnitId if available, email, role).
3. Update stakeholder section to:
   - Load roles from `/api/mappings/roles`.
   - Set Owner = logged-in user.
   - Load stakeholders (champion + delegate) based on selected business unit.
4. Add guardrails: if business unit not selected, return empty lists (no errors).

## API Contracts

### GET /api/stakeholders
Sources: `ai_champions`, `aichampiondelegates`

Query params:
- `businessUnitId` (optional, number)

Response:
```json
{
  "items": [
    {
      "id": 12,
      "businessUnitName": "Global Business Operations",
      "email": "first.last@ukg.com",
      "role": "Champion"
    },
    {
      "id": 5,
      "businessUnitId": 7,
      "businessUnitName": "Global Business Operations",
      "email": "first.last@ukg.com",
      "role": "Champion Delegate"
    }
  ]
}
```

Notes:
- `ai_champions` mapping:
  - `businessUnitName` from `ai_champions.businessunit`
  - `email` from `ai_champions.u_krewer_email`
  - `role` from `ai_champions.role` (default to `"Champion"` when blank)
- `aichampiondelegates` mapping:
  - `businessUnitId` from `aichampiondelegates.businessunitid`
  - `businessUnitName` from `aichampiondelegates.businessunit_businessunitname`
  - `email` from `aichampiondelegates.ukrewer_email`
  - `role` from `aichampiondelegates.role` (default to `"Champion Delegate"` when blank)
- Use `businessUnitId` to filter delegates; champions can be filtered by matching
  `ai_champions.businessunit` to the business unit name derived from the ID.

## Frontend Integration Notes
- When a Business Unit is selected, call:
  - `/api/stakeholders?businessUnitId=...`
- Merge results into Stakeholders UI for quick add (no Owner returned).
- Keep manual add flow intact.
- Owner role should be auto-added from the logged-in account (current behavior).
