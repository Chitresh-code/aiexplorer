# ai_champions

Source table: `aihubdb.dbo.ai_champions`

## Columns

| Column | Type | Nullable | Default | Collation |
| --- | --- | --- | --- | --- |
| id | bigint | NO | NEXT VALUE FOR [dbo].[seq_ai_champions] |  |
| buisnessunitid | bigint | YES |  |  |
| roleid | bigint | YES |  |  |
| businessunit | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| team | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| role | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| u_krewer_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| created | datetime2 | YES |  |  |
| modified | datetime2 | YES |  |  |
| editor_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |

## Constraints

- `pk_ai_champions` PRIMARY KEY (id)
