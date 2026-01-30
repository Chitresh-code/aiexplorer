# statusmapping

Source table: `aihubdb.dbo.statusmapping`

## Columns

| Column | Type | Nullable | Default | Collation |
| --- | --- | --- | --- | --- |
| id | bigint | NO | NEXT VALUE FOR [dbo].[seq_statusmapping] |  |
| statusname | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| statuscolor | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| statusdefinitions | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| modified | datetime2 | YES |  |  |
| created | datetime2 | YES |  |  |
| editor_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| isactive | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |

## Constraints

- `pk_statusmapping` PRIMARY KEY (id)
