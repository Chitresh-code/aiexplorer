# Use Case Details: AI Product Checklist Plan

## Goal
Add an owner-only “AI Product Checklist” tab to the Use Case Details page, backed by a stored proc and a new PATCH API that sends diffs only. Ensure the consolidated `GetUseCaseDetails` payload includes checklist data.

## Scope
- **UI**: Owner-only tab in `/use-case-details/[id]` using `AIExplorer/components/submit-use-case/ChecklistSection.tsx`.
- **API**: New `PATCH /api/usecases/{id}/checklist` that accepts diffs and calls a stored proc.
- **DB**:
  - Update `GetUseCaseDetails` to return checklist responses.
  - New stored proc to upsert checklist responses and update `usecases.productchecklist`.
- **Docs**: Add API contract + implementation notes.

## Data Sources
- **Questions**: `dbo.aiproductquestions` (via mappings API).
- **Responses**: `dbo.aiproductchecklist` (per use case + question).
- **Completion flag**: `dbo.usecases.productchecklist` (true when all questions have a response).

## Proposed API Contract
### GET (existing consolidated detail)
- `GET /api/usecases/{id}?type=owner&include=checklist`
- Adds:
```
{
  "checklist": [
    { "questionId": 1, "response": "..." }
  ]
}
```

### PATCH (new)
- `PATCH /api/usecases/{id}/checklist`
- Body:
```
{
  "editorEmail": "user@ukg.com",
  "items": [
    { "questionId": 1, "response": "Yes" },
    { "questionId": 2, "response": "..." }
  ]
}
```
- Only changed questions are sent. Empty responses remove existing answers.

## Stored Procedure Changes
1. **GetUseCaseDetails**: Add a checklist resultset filtered by usecaseid.
2. **UpdateUseCaseChecklist**: Upsert rows in `dbo.aiproductchecklist`, delete rows where response is empty, and set `dbo.usecases.productchecklist` to `1` only when all questions have responses.

## UI Behavior
- Tab is visible only when `type=owner`.
- Tab uses ChecklistSection in **view** mode by default.
- Enter edit mode enables inputs and shows Apply/Cancel.
- Submit sends only diffs vs. initial snapshot.
- Cancel restores snapshot.

## Step-by-Step Implementation Plan
1. **Stored Proc**
   - Add checklist select to `docs/stored_procedures/new/GetUseCaseDetails.sql`.
   - Ensure ordering is stable by question id.
   - Keep existing resultset order; append checklist as a new resultset.
2. **API**
   - Add `/app/api/usecases/[id]/checklist/route.ts` with PATCH.
   - Validate payload and call `dbo.UpdateUseCaseChecklist`.
   - Ensure the consolidated GET handler includes `checklist` when requested.
3. **UI**
   - Add a new tab in `AIExplorer/app/use-case-details/[id]/page.tsx`.
   - Fetch mapping questions via `getMappings(['aiProductQuestions'])`.
   - Map API responses to form defaults.
   - Implement diff-only submit.
4. **Docs**
   - Update `docs/aiexplorer-api.md` to include the new PATCH endpoint.
   - Add a short doc describing checklist behavior, payload, and diff rules.
5. **Validation**
   - Verify owner-only access and email validation remains intact.
   - Confirm `productchecklist` toggles only when all questions have non-empty responses.

## Open Questions
- Should checklist updates be allowed for champions? (plan assumes owner-only).
- Do we need to support draft states, or treat empty responses as deletes?
