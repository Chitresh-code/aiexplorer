# aiproductquestions

Source table: `aihubdb.dbo.aiproductquestions`

## Columns

| Column | Type | Nullable | Default | Collation |
| --- | --- | --- | --- | --- |
| id | bigint | NO | NEXT VALUE FOR [dbo].[seq_aiproductquestions] |  |
| question | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| questiontype | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| responsevalue | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| modified | datetime2 | YES |  |  |
| created | datetime2 | YES |  |  |
| editor_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| isactive | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |

## Constraints

- `pk_aiproductquestions` PRIMARY KEY (id)
