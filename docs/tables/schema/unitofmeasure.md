# unitofmeasure

Source table: `aihubdb.dbo.unitofmeasure`

## Columns

| Column | Type | Nullable | Default | Collation |
| --- | --- | --- | --- | --- |
| id | bigint | NO | NEXT VALUE FOR [dbo].[seq_unitofmeasure] |  |
| unitofmeasure | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| measuretype | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| defaultvalue | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| options | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| modified | datetime2 | YES |  |  |
| created | datetime2 | YES |  |  |
| editor_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| isactive | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |

## Constraints

- `pk_unitofmeasure` PRIMARY KEY (id)
