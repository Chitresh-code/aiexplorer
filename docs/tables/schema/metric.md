# metric

Source table: `aihubdb.dbo.metric`

## Columns

| Column | Type | Nullable | Default | Collation |
| --- | --- | --- | --- | --- |
| id | bigint | NO | NEXT VALUE FOR [dbo].[seq_metric] |  |
| usecaseid | bigint | YES |  |  |
| metrictypeid | bigint | YES |  |  |
| unitofmeasureid | bigint | YES |  |  |
| primarysuccessmetricname | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| baselinevalue | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| baselinedate | datetime2 | YES |  |  |
| targetvalue | nvarchar(255) | YES |  | SQL_Latin1_General_CP1_CI_AS |
| targetdate | datetime2 | YES |  |  |
| modified | datetime2 | YES |  |  |
| created | datetime2 | YES |  |  |
| editor_email | nvarchar(320) | YES |  | SQL_Latin1_General_CP1_CI_AS |

## Constraints

- `pk_metric` PRIMARY KEY (id)
