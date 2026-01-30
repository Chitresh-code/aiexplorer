# agentlibrary

Source table: `aihubdb.dbo.agentlibrary`

## Columns

| Column | Type | Nullable | Default | Collation |
| --- | --- | --- | --- | --- |
| id | bigint | NO | NEXT VALUE FOR [dbo].[seq_agentlibrary] |  |
| usecaseid | bigint | YES |  |  |
| vendormodelid | bigint | YES |  |  |
| agentid | bigint | YES |  |  |
| agentlink | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| prompt | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| modified | datetime2 | YES |  |  |
| created | datetime2 | YES |  |  |
| editor_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |

## Constraints

- `pk_agentlibrary` PRIMARY KEY (id)
