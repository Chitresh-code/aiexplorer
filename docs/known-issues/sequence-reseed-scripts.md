# Sequence Reseed Scripts (Per Table)

Each block below is a single statement, so it works with tools that execute statements one-by-one (like DBeaver SQL script mode).

## Single Script (All Sequences)
```sql
IF OBJECT_ID('dbo.agentlibrary', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.agentlibrary;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_agentlibrary RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.ai_champions', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.ai_champions;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_ai_champions RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.aichampiondelegates', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.aichampiondelegates;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_aichampiondelegates RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.aiproductchecklist', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.aiproductchecklist;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_aiproductchecklist RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.aiproductquestions', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.aiproductquestions;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_aiproductquestions RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.aithememapping', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.aithememapping;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_aithememapping RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.businessunitmapping', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.businessunitmapping;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_businessunitmapping RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.decisions', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.decisions;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_decisions RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.implementationtimespan', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.implementationtimespan;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_implementationtimespan RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.knowldegesourcemapping', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.knowldegesourcemapping;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_knowldegesourcemapping RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.knowledgesourcemapping', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.knowledgesourcemapping;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_knowledgesourcemapping RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.legacy_usecasestakeholderapproval', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.legacy_usecasestakeholderapproval;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_legacy_usecasestakeholderapproval RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.metric', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.metric;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_metric RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.metricreported', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.metricreported;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_metricreported RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.outcomes', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.outcomes;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_outcomes RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.personamapping', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.personamapping;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_personamapping RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.phasemapping', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.phasemapping;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_phasemapping RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.[plan]', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.[plan];
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_plan RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.prioritization', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.prioritization;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_prioritization RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.reportingfrequency', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.reportingfrequency;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_reportingfrequency RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.rice', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.rice;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_rice RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.rolemapping', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.rolemapping;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_rolemapping RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.stakeholder', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.stakeholder;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_stakeholder RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.stakeholder_mapping', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.stakeholder_mapping;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_stakeholder_mapping RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.statusmapping', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.statusmapping;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_statusmapping RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.subteammapping', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.subteammapping;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_subteammapping RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.unitofmeasure', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.unitofmeasure;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_unitofmeasure RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.updates', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.updates;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_updates RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.usecases', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.usecases;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_usecases RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.usecasestakeholderapproval', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.usecasestakeholderapproval;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_usecasestakeholderapproval RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')

IF OBJECT_ID('dbo.vendormodelmapping', 'U') IS NOT NULL EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.vendormodelmapping;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_vendormodelmapping RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);')
```

## agentlibrary
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.agentlibrary;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_agentlibrary RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## ai_champions
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.ai_champions;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_ai_champions RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## aichampiondelegates
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.aichampiondelegates;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_aichampiondelegates RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## aiproductchecklist
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.aiproductchecklist;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_aiproductchecklist RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## aiproductquestions
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.aiproductquestions;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_aiproductquestions RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## aithememapping
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.aithememapping;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_aithememapping RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## businessunitmapping
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.businessunitmapping;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_businessunitmapping RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## decisions
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.decisions;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_decisions RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## implementationtimespan
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.implementationtimespan;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_implementationtimespan RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## knowldegesourcemapping
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.knowldegesourcemapping;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_knowldegesourcemapping RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## knowledgesourcemapping
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.knowledgesourcemapping;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_knowledgesourcemapping RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## metric
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.metric;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_metric RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## metricreported
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.metricreported;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_metricreported RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## outcomes
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.outcomes;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_outcomes RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## personamapping
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.personamapping;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_personamapping RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## phasemapping
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.phasemapping;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_phasemapping RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## plan
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.plan;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_plan RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## prioritization
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.prioritization;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_prioritization RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## reportingfrequency
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.reportingfrequency;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_reportingfrequency RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## rice
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.rice;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_rice RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## rolemapping
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.rolemapping;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_rolemapping RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## stakeholder
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.stakeholder;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_stakeholder RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## stakeholder_mapping
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.stakeholder_mapping;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_stakeholder_mapping RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## statusmapping
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.statusmapping;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_statusmapping RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## unitofmeasure
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.unitofmeasure;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_unitofmeasure RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## updates
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.updates;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_updates RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## usecases
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.usecases;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_usecases RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## usecasestakeholderapproval
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.usecasestakeholderapproval;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_usecasestakeholderapproval RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
## vendormodelmapping
```sql
EXEC(N'DECLARE @Next BIGINT;
SELECT @Next = ISNULL(MAX(id), 0) + 1 FROM dbo.vendormodelmapping;
DECLARE @sql NVARCHAR(200);
SET @sql = N''ALTER SEQUENCE dbo.seq_vendormodelmapping RESTART WITH '' + CAST(@Next AS NVARCHAR(50));
EXEC(@sql);');
```
