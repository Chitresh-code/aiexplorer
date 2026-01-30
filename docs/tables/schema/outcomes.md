# outcomes

Source table: `aihubdb.dbo.outcomes`

## Columns

| Column | Type | Nullable | Default | Collation |
| --- | --- | --- | --- | --- |
| id | bigint | NO | NEXT VALUE FOR [dbo].[seq_outcomes] |  |
| outcome_category | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| outcome_description | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| default_unitofmeasure_id | bigint | YES |  |  |
| modified | datetime2 | YES |  |  |
| created | datetime2 | YES |  |  |
| editor_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| isactive | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |

## Constraints

- `pk_outcomes` PRIMARY KEY (id)
