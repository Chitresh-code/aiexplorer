# decisions

Source table: `aihubdb.dbo.decisions`

## Columns

| Column | Type | Nullable | Default | Collation |
| --- | --- | --- | --- | --- |
| id | bigint | NO | NEXT VALUE FOR [dbo].[seq_decisions] |  |
| usecaseid | bigint | YES |  |  |
| usecasephaseid | bigint | YES |  |  |
| roleid | bigint | YES |  |  |
| stakeholderid | bigint | YES |  |  |
| result | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| decisioncomments | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| modified | datetime2 | YES |  |  |
| created | datetime2 | YES |  |  |
| editor_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |

## Constraints

- `pk_decisions` PRIMARY KEY (id)
