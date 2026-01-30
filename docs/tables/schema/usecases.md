# usecases

Source table: `aihubdb.dbo.usecases`

## Columns

| Column | Type | Nullable | Default | Collation |
| --- | --- | --- | --- | --- |
| id | bigint | NO | NEXT VALUE FOR [dbo].[seq_usecases] |  |
| businessunitid | bigint | YES |  |  |
| phaseid | bigint | YES |  |  |
| statusid | bigint | YES |  |  |
| title | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| headlines | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| opportunity | nvarchar(MAX) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| business_value | nvarchar(MAX) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| subteamname | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| informationurl | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| productchecklist | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| esedependency | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| modified | datetime2 | YES |  |  |
| created | datetime2 | YES |  |  |
| primarycontact | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| editor_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |

## Constraints

- `pk_usecases` PRIMARY KEY (id)
