CREATE OR ALTER PROCEDURE dbo.UpdateUseCasePlan
    @UseCaseId BIGINT,
    @PlanJson NVARCHAR(MAX),
    @EditorEmail NVARCHAR(320) = NULL
AS
BEGIN
    SET NOCOUNT ON
    SET XACT_ABORT ON

    IF @UseCaseId IS NULL OR @UseCaseId <= 0
    BEGIN
        THROW 50000, 'UseCaseId is required.', 1
    END

    IF @PlanJson IS NULL OR ISJSON(@PlanJson) <> 1
    BEGIN
        THROW 50000, 'PlanJson is required and must be valid JSON.', 1
    END

    DECLARE @Now DATETIME2 = SYSUTCDATETIME()

    DECLARE @Plan TABLE (
        usecasephaseid BIGINT,
        startdate DATE,
        enddate DATE
    )

    INSERT INTO @Plan (usecasephaseid, startdate, enddate)
    SELECT usecasephaseid, startdate, enddate
    FROM OPENJSON(@PlanJson)
    WITH (
        usecasephaseid BIGINT '$.usecasephaseid',
        startdate DATE '$.startdate',
        enddate DATE '$.enddate'
    )

    IF NOT EXISTS (SELECT 1 FROM @Plan)
    BEGIN
        THROW 50000, 'PlanJson must contain at least one item.', 1
    END

    BEGIN TRANSACTION

    UPDATE p
    SET
        startdate = pl.startdate,
        enddate = pl.enddate,
        modified = @Now,
        editor_email = COALESCE(@EditorEmail, p.editor_email)
    FROM dbo.[plan] AS p
    INNER JOIN @Plan AS pl
        ON p.usecaseid = @UseCaseId
        AND p.usecasephaseid = pl.usecasephaseid

    INSERT INTO dbo.[plan] (
        usecaseid,
        usecasephaseid,
        startdate,
        enddate,
        modified,
        created,
        editor_email
    )
    SELECT
        @UseCaseId,
        pl.usecasephaseid,
        pl.startdate,
        pl.enddate,
        @Now,
        @Now,
        @EditorEmail
    FROM @Plan AS pl
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.[plan] AS p
        WHERE p.usecaseid = @UseCaseId
          AND p.usecasephaseid = pl.usecasephaseid
    )

    COMMIT TRANSACTION

    SELECT 1 AS Success
END
GO
