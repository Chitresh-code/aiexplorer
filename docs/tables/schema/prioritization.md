# prioritization

Source table: `aihubdb.dbo.prioritization`

## Columns

| Column | Type | Nullable | Default | Collation |
| --- | --- | --- | --- | --- |
| id | bigint | NO | NEXT VALUE FOR [dbo].[seq_prioritization] |  |
| usecaseid | bigint | YES |  |  |
| ricescore | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| priority | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| aigallerydisplay | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| sltreporting | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| totaluserbase | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| reach | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| impact | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| confidence | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| effort | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| timespanid | bigint | YES |  |  |
| reportingfrequencyid | bigint | YES |  |  |
| modified | datetime2 | YES |  |  |
| created | datetime2 | YES |  |  |
| editor_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |

## Constraints

- `pk_prioritization` PRIMARY KEY (id)
