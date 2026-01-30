# Create Use Case: Duplicate ID from sequence

## Summary
`POST /api/usecases` can fail with a SQL error when inserting into `dbo.stakeholder` because the sequence `dbo.seq_stakeholder` is behind the current max `id` value.

## Error
```
Violation of PRIMARY KEY constraint 'pk_stakeholder'. Cannot insert duplicate key in object 'dbo.stakeholder'. The duplicate key value is (2).
```

## Root Cause
`dbo.CreateUseCase` uses `NEXT VALUE FOR dbo.seq_stakeholder` when `dbo.stakeholder.id` is not an identity column.
If the sequence current value is less than or equal to `MAX(id)` in `dbo.stakeholder`, the insert can generate a duplicate key.

## Resolution
Reseed the sequence to `MAX(id) + 1` and retry the insert.

Example:
```sql
DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.stakeholder;
EXEC('ALTER SEQUENCE dbo.seq_stakeholder RESTART WITH ' + CAST(@Next AS NVARCHAR(50)));
```

## Notes
- This is a data/sequence synchronization issue, not an API payload issue.
- The stored procedure remains unchanged; fix is operational (sequence reseed).
