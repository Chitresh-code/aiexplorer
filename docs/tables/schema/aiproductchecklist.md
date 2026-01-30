# aiproductchecklist

Source table: `aihubdb.dbo.aiproductchecklist`

## Columns

| Column | Type | Nullable | Default | Collation |
| --- | --- | --- | --- | --- |
| id | bigint | NO | NEXT VALUE FOR [dbo].[seq_aiproductchecklist] |  |
| usecaseid | bigint | YES |  |  |
| questionid | bigint | YES |  |  |
| response | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| modified | datetime2 | YES |  |  |
| created | datetime2 | YES |  |  |
| editor_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |

## Constraints

- `pk_aiproductchecklist` PRIMARY KEY (id)
