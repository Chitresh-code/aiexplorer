# phasemapping

Source table: `aihubdb.dbo.phasemapping`

## Columns

| Column | Type | Nullable | Default | Collation |
| --- | --- | --- | --- | --- |
| id | bigint | NO | NEXT VALUE FOR [dbo].[seq_phasemapping] |  |
| phase | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| phasestage | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| modified | datetime2 | YES |  |  |
| created | datetime2 | YES |  |  |
| guid | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| editor_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| isactive | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |

## Constraints

- `pk_phasemapping` PRIMARY KEY (id)
