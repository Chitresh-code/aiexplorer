CREATE OR ALTER PROCEDURE dbo.UpdateUseCaseMetrics
    @UseCaseId BIGINT,
    @PayloadJson NVARCHAR(MAX),
    @EditorEmail NVARCHAR(320) = NULL
AS
BEGIN
    SET NOCOUNT ON
    SET XACT_ABORT ON

    IF @UseCaseId IS NULL OR @UseCaseId <= 0
    BEGIN
        THROW 50000, 'UseCaseId is required.', 1
    END

    IF @PayloadJson IS NULL OR ISJSON(@PayloadJson) <> 1
    BEGIN
        THROW 50000, 'PayloadJson is required and must be valid JSON.', 1
    END

    DECLARE @Now DATETIME2 = SYSUTCDATETIME()

    DECLARE @NewMetrics TABLE (
        metrictypeid BIGINT,
        unitofmeasureid BIGINT,
        primarysuccessmetricname NVARCHAR(255),
        baselinevalue NVARCHAR(255),
        baselinedate DATE,
        targetvalue NVARCHAR(255),
        targetdate DATE
    )

    INSERT INTO @NewMetrics (
        metrictypeid,
        unitofmeasureid,
        primarysuccessmetricname,
        baselinevalue,
        baselinedate,
        targetvalue,
        targetdate
    )
    SELECT
        TRY_CONVERT(BIGINT, JSON_VALUE(value, '$.metricTypeId')),
        TRY_CONVERT(BIGINT, JSON_VALUE(value, '$.unitOfMeasureId')),
        JSON_VALUE(value, '$.primarySuccessMetricName'),
        JSON_VALUE(value, '$.baselineValue'),
        TRY_CONVERT(DATE, JSON_VALUE(value, '$.baselineDate')),
        JSON_VALUE(value, '$.targetValue'),
        TRY_CONVERT(DATE, JSON_VALUE(value, '$.targetDate'))
    FROM OPENJSON(@PayloadJson, '$.newMetrics')

    DECLARE @UpdateMetrics TABLE (
        id BIGINT,
        metrictypeid BIGINT,
        unitofmeasureid BIGINT,
        primarysuccessmetricname NVARCHAR(255),
        baselinevalue NVARCHAR(255),
        baselinedate DATE,
        targetvalue NVARCHAR(255),
        targetdate DATE,
        has_metrictypeid BIT,
        has_unitofmeasureid BIT,
        has_primarysuccessmetricname BIT,
        has_baselinevalue BIT,
        has_baselinedate BIT,
        has_targetvalue BIT,
        has_targetdate BIT,
        has_any BIT
    )

    INSERT INTO @UpdateMetrics (
        id,
        metrictypeid,
        unitofmeasureid,
        primarysuccessmetricname,
        baselinevalue,
        baselinedate,
        targetvalue,
        targetdate,
        has_metrictypeid,
        has_unitofmeasureid,
        has_primarysuccessmetricname,
        has_baselinevalue,
        has_baselinedate,
        has_targetvalue,
        has_targetdate,
        has_any
    )
    SELECT
        TRY_CONVERT(BIGINT, JSON_VALUE(value, '$.id')),
        TRY_CONVERT(BIGINT, JSON_VALUE(value, '$.metricTypeId')),
        TRY_CONVERT(BIGINT, JSON_VALUE(value, '$.unitOfMeasureId')),
        JSON_VALUE(value, '$.primarySuccessMetricName'),
        JSON_VALUE(value, '$.baselineValue'),
        TRY_CONVERT(DATE, JSON_VALUE(value, '$.baselineDate')),
        JSON_VALUE(value, '$.targetValue'),
        TRY_CONVERT(DATE, JSON_VALUE(value, '$.targetDate')),
        CASE WHEN CHARINDEX('"metricTypeId"', value) > 0 THEN 1 ELSE 0 END,
        CASE WHEN CHARINDEX('"unitOfMeasureId"', value) > 0 THEN 1 ELSE 0 END,
        CASE WHEN CHARINDEX('"primarySuccessMetricName"', value) > 0 THEN 1 ELSE 0 END,
        CASE WHEN CHARINDEX('"baselineValue"', value) > 0 THEN 1 ELSE 0 END,
        CASE WHEN CHARINDEX('"baselineDate"', value) > 0 THEN 1 ELSE 0 END,
        CASE WHEN CHARINDEX('"targetValue"', value) > 0 THEN 1 ELSE 0 END,
        CASE WHEN CHARINDEX('"targetDate"', value) > 0 THEN 1 ELSE 0 END,
        CASE
            WHEN CHARINDEX('"metricTypeId"', value) > 0 THEN 1
            WHEN CHARINDEX('"unitOfMeasureId"', value) > 0 THEN 1
            WHEN CHARINDEX('"primarySuccessMetricName"', value) > 0 THEN 1
            WHEN CHARINDEX('"baselineValue"', value) > 0 THEN 1
            WHEN CHARINDEX('"baselineDate"', value) > 0 THEN 1
            WHEN CHARINDEX('"targetValue"', value) > 0 THEN 1
            WHEN CHARINDEX('"targetDate"', value) > 0 THEN 1
            ELSE 0
        END
    FROM OPENJSON(@PayloadJson, '$.updateMetrics')

    DECLARE @DeleteMetricIds TABLE (id BIGINT)
    INSERT INTO @DeleteMetricIds (id)
    SELECT TRY_CONVERT(BIGINT, value)
    FROM OPENJSON(@PayloadJson, '$.deleteMetricIds')
    WHERE TRY_CONVERT(BIGINT, value) IS NOT NULL

    DECLARE @NewReported TABLE (
        metricid BIGINT,
        reportedvalue NVARCHAR(255),
        reporteddate DATE
    )

    INSERT INTO @NewReported (metricid, reportedvalue, reporteddate)
    SELECT
        TRY_CONVERT(BIGINT, JSON_VALUE(value, '$.metricId')),
        JSON_VALUE(value, '$.reportedValue'),
        TRY_CONVERT(DATE, JSON_VALUE(value, '$.reportedDate'))
    FROM OPENJSON(@PayloadJson, '$.newReportedMetrics')

    DECLARE @UpdateReported TABLE (
        id BIGINT,
        reportedvalue NVARCHAR(255),
        reporteddate DATE,
        has_reportedvalue BIT,
        has_reporteddate BIT,
        has_any BIT
    )

    INSERT INTO @UpdateReported (
        id,
        reportedvalue,
        reporteddate,
        has_reportedvalue,
        has_reporteddate,
        has_any
    )
    SELECT
        TRY_CONVERT(BIGINT, JSON_VALUE(value, '$.id')),
        JSON_VALUE(value, '$.reportedValue'),
        TRY_CONVERT(DATE, JSON_VALUE(value, '$.reportedDate')),
        CASE WHEN CHARINDEX('"reportedValue"', value) > 0 THEN 1 ELSE 0 END,
        CASE WHEN CHARINDEX('"reportedDate"', value) > 0 THEN 1 ELSE 0 END,
        CASE
            WHEN CHARINDEX('"reportedValue"', value) > 0 THEN 1
            WHEN CHARINDEX('"reportedDate"', value) > 0 THEN 1
            ELSE 0
        END
    FROM OPENJSON(@PayloadJson, '$.updateReportedMetrics')

    DECLARE @DeleteReportedIds TABLE (id BIGINT)
    INSERT INTO @DeleteReportedIds (id)
    SELECT TRY_CONVERT(BIGINT, value)
    FROM OPENJSON(@PayloadJson, '$.deleteReportedMetricIds')
    WHERE TRY_CONVERT(BIGINT, value) IS NOT NULL

    IF NOT EXISTS (SELECT 1 FROM @NewMetrics)
       AND NOT EXISTS (SELECT 1 FROM @UpdateMetrics WHERE has_any = 1)
       AND NOT EXISTS (SELECT 1 FROM @DeleteMetricIds)
       AND NOT EXISTS (SELECT 1 FROM @NewReported)
       AND NOT EXISTS (SELECT 1 FROM @UpdateReported WHERE has_any = 1)
       AND NOT EXISTS (SELECT 1 FROM @DeleteReportedIds)
    BEGIN
        THROW 50000, 'No changes provided.', 1
    END

    BEGIN TRANSACTION

    IF EXISTS (SELECT 1 FROM @DeleteMetricIds)
    BEGIN
        DELETE mr
        FROM dbo.metricreported AS mr
        INNER JOIN @DeleteMetricIds AS d
            ON mr.metricid = d.id
        WHERE mr.usecaseid = @UseCaseId

        DELETE m
        FROM dbo.metric AS m
        INNER JOIN @DeleteMetricIds AS d
            ON m.id = d.id
        WHERE m.usecaseid = @UseCaseId
    END

    IF EXISTS (SELECT 1 FROM @DeleteReportedIds)
    BEGIN
        DELETE mr
        FROM dbo.metricreported AS mr
        INNER JOIN @DeleteReportedIds AS d
            ON mr.id = d.id
        WHERE mr.usecaseid = @UseCaseId
    END

    UPDATE m
    SET
        metrictypeid = CASE WHEN u.has_metrictypeid = 1 THEN u.metrictypeid ELSE m.metrictypeid END,
        unitofmeasureid = CASE WHEN u.has_unitofmeasureid = 1 THEN u.unitofmeasureid ELSE m.unitofmeasureid END,
        primarysuccessmetricname = CASE WHEN u.has_primarysuccessmetricname = 1 THEN u.primarysuccessmetricname ELSE m.primarysuccessmetricname END,
        baselinevalue = CASE WHEN u.has_baselinevalue = 1 THEN u.baselinevalue ELSE m.baselinevalue END,
        baselinedate = CASE WHEN u.has_baselinedate = 1 THEN u.baselinedate ELSE m.baselinedate END,
        targetvalue = CASE WHEN u.has_targetvalue = 1 THEN u.targetvalue ELSE m.targetvalue END,
        targetdate = CASE WHEN u.has_targetdate = 1 THEN u.targetdate ELSE m.targetdate END,
        modified = @Now,
        editor_email = COALESCE(@EditorEmail, m.editor_email)
    FROM dbo.metric AS m
    INNER JOIN @UpdateMetrics AS u
        ON u.id = m.id
    WHERE m.usecaseid = @UseCaseId
      AND u.has_any = 1

    INSERT INTO dbo.metric (
        usecaseid,
        metrictypeid,
        unitofmeasureid,
        primarysuccessmetricname,
        baselinevalue,
        baselinedate,
        targetvalue,
        targetdate,
        modified,
        created,
        editor_email
    )
    SELECT
        @UseCaseId,
        metrictypeid,
        unitofmeasureid,
        primarysuccessmetricname,
        baselinevalue,
        baselinedate,
        targetvalue,
        targetdate,
        @Now,
        @Now,
        @EditorEmail
    FROM @NewMetrics

    UPDATE mr
    SET
        reportedvalue = CASE WHEN u.has_reportedvalue = 1 THEN u.reportedvalue ELSE mr.reportedvalue END,
        reporteddate = CASE WHEN u.has_reporteddate = 1 THEN u.reporteddate ELSE mr.reporteddate END,
        modified = @Now,
        editor_email = COALESCE(@EditorEmail, mr.editor_email)
    FROM dbo.metricreported AS mr
    INNER JOIN @UpdateReported AS u
        ON u.id = mr.id
    WHERE mr.usecaseid = @UseCaseId
      AND u.has_any = 1

    INSERT INTO dbo.metricreported (
        usecaseid,
        metricid,
        reportedvalue,
        reporteddate,
        modified,
        created,
        editor_email
    )
    SELECT
        @UseCaseId,
        metricid,
        reportedvalue,
        reporteddate,
        @Now,
        @Now,
        @EditorEmail
    FROM @NewReported

    COMMIT TRANSACTION

    SELECT 1 AS Success
END
GO
