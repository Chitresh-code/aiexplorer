# stakeholder_mapping

Source table: `aihubdb.dbo.stakeholder_mapping`

## Columns

| Column | Type | Nullable | Default | Collation |
| --- | --- | --- | --- | --- |
| id | bigint | NO | NEXT VALUE FOR [dbo].[seq_stakeholder_mapping] |  |
| businessunitid | bigint | YES |  |  |
| roleid | bigint | YES |  |  |
| businessunit | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| team | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| role | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| u_krewer_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| created | datetime2 | YES |  |  |
| modified | datetime2 | YES |  |  |
| editor_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| isactive | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |

## Constraints

- `pk_stakeholder_mapping` PRIMARY KEY (id)
