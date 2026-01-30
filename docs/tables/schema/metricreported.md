# metricreported

Source table: `aihubdb.dbo.metricreported`

## Columns

| Column | Type | Nullable | Default | Collation |
| --- | --- | --- | --- | --- |
| id | bigint | NO | NEXT VALUE FOR [dbo].[seq_metricreported] |  |
| usecaseid | bigint | YES |  |  |
| metricid | bigint | YES |  |  |
| reportedvalue | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| reporteddate | datetime2 | YES |  |  |
| modified | datetime2 | YES |  |  |
| created | datetime2 | YES |  |  |
| editor_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |

## Constraints

- `pk_metricreported` PRIMARY KEY (id)
