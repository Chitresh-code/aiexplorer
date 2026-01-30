# stakeholder

Source table: `aihubdb.dbo.stakeholder`

## Columns

| Column | Type | Nullable | Default | Collation |
| --- | --- | --- | --- | --- |
| id | bigint | NO | NEXT VALUE FOR [dbo].[seq_stakeholder] |  |
| roleid | bigint | YES |  |  |
| usecaseid | bigint | YES |  |  |
| role | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| stakeholder_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| modified | datetime2 | YES |  |  |
| created | datetime2 | YES |  |  |
| editor_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| isactive | int | YES | 1 |  |

## Constraints

- `pk_stakeholder` PRIMARY KEY (id)
