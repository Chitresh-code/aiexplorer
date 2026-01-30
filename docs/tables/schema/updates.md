# updates

Source table: `aihubdb.dbo.updates`

## Columns

| Column | Type | Nullable | Default | Collation |
| --- | --- | --- | --- | --- |
| id | bigint | NO | NEXT VALUE FOR [dbo].[seq_updates] |  |
| meaningfulupdate | nvarchar(MAX) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| usecaseid | bigint | YES |  |  |
| stakeholderid | bigint | YES |  |  |
| roleid | bigint | YES |  |  |
| usecasephaseid | bigint | YES |  |  |
| usecasestatusid | bigint | YES |  |  |
| modified | datetime2 | YES |  |  |
| created | datetime2 | YES |  |  |
| editor_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |

## Constraints

- `pk_updates` PRIMARY KEY (id)
