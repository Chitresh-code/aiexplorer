# [plan]

Source table: `aihubdb.dbo.[plan]`

## Columns

| Column | Type | Nullable | Default | Collation |
| --- | --- | --- | --- | --- |
| id | bigint | NO | NEXT VALUE FOR [dbo].[seq_plan] |  |
| usecaseid | bigint | YES |  |  |
| usecasephaseid | bigint | YES |  |  |
| startdate | datetime2 | YES |  |  |
| enddate | datetime2 | YES |  |  |
| modified | datetime2 | YES |  |  |
| created | datetime2 | YES |  |  |
| editor_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |

## Constraints

- `pk_plan` PRIMARY KEY (id)
