# aithememapping

Source table: `aihubdb.dbo.aithememapping`

## Columns

| Column | Type | Nullable | Default | Collation |
| --- | --- | --- | --- | --- |
| id | bigint | NO | NEXT VALUE FOR [dbo].[seq_aithememapping] |  |
| themename | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| themedefinition | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| themeexample | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| modified | datetime2 | YES |  |  |
| created | datetime2 | YES |  |  |
| editor_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| isactive | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |

## Constraints

- `pk_aithememapping` PRIMARY KEY (id)
