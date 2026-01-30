# usecasestakeholderapproval

Source table: `aihubdb.dbo.usecasestakeholderapproval`

## Columns

| Column | Type | Nullable | Default | Collation |
| --- | --- | --- | --- | --- |
| id | bigint | NO | NEXT VALUE FOR [dbo].[seq_usecasestakeholderapproval] |  |
| stakeholderid | bigint | YES |  |  |
| roleid | bigint | YES |  |  |
| usecaseid | bigint | YES |  |  |
| usecasephaseid | bigint | YES |  |  |
| stakeholderemail | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| flowid | bigint | YES |  |  |
| teamsmsgid | bigint | YES |  |  |
| outlookmsgid | bigint | YES |  |  |
| decisionmsgid | bigint | YES |  |  |
| decision | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| comments | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| iscancelled | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| cancelreason | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| created | datetime2 | YES |  |  |
| modified | datetime2 | YES |  |  |
| editor_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| flowrundt | datetime2 | YES |  |  |

## Constraints

- `pk_usecasestakeholderapproval` PRIMARY KEY (id)
