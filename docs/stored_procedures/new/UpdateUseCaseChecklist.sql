CREATE OR ALTER PROCEDURE dbo.UpdateUseCaseChecklist
    @UseCaseId BIGINT,
    @ChecklistJson NVARCHAR(MAX),
    @EditorEmail NVARCHAR(320) = NULL
AS
BEGIN
    SET NOCOUNT ON
    SET XACT_ABORT ON

    IF @UseCaseId IS NULL OR @UseCaseId <= 0
    BEGIN
        THROW 50000, 'UseCaseId is required.', 1
    END

    IF @ChecklistJson IS NULL OR ISJSON(@ChecklistJson) <> 1
    BEGIN
        THROW 50000, 'ChecklistJson is required and must be valid JSON.', 1
    END

    DECLARE @Now DATETIME2 = SYSUTCDATETIME()

    DECLARE @Checklist TABLE (
        questionId BIGINT,
        response NVARCHAR(MAX)
    )

    INSERT INTO @Checklist (questionId, response)
    SELECT
        TRY_CONVERT(BIGINT, JSON_VALUE(value, '$.questionId')),
        JSON_VALUE(value, '$.response')
    FROM OPENJSON(@ChecklistJson)
    WHERE TRY_CONVERT(BIGINT, JSON_VALUE(value, '$.questionId')) IS NOT NULL

    IF NOT EXISTS (SELECT 1 FROM @Checklist)
    BEGIN
        THROW 50000, 'ChecklistJson must contain at least one item.', 1
    END

    DELETE c
    FROM dbo.aiproductchecklist AS c
    INNER JOIN @Checklist AS t
        ON t.questionId = c.questionid
    WHERE c.usecaseid = @UseCaseId
      AND LTRIM(RTRIM(COALESCE(t.response, ''))) = ''

    UPDATE c
    SET
        response = t.response,
        modified = @Now,
        editor_email = COALESCE(@EditorEmail, c.editor_email)
    FROM dbo.aiproductchecklist AS c
    INNER JOIN @Checklist AS t
        ON t.questionId = c.questionid
    WHERE c.usecaseid = @UseCaseId
      AND LTRIM(RTRIM(COALESCE(t.response, ''))) <> ''

    INSERT INTO dbo.aiproductchecklist (
        usecaseid,
        questionid,
        response,
        modified,
        created,
        editor_email
    )
    SELECT
        @UseCaseId,
        t.questionId,
        t.response,
        @Now,
        @Now,
        @EditorEmail
    FROM @Checklist AS t
    WHERE LTRIM(RTRIM(COALESCE(t.response, ''))) <> ''
      AND NOT EXISTS (
          SELECT 1
          FROM dbo.aiproductchecklist AS c
          WHERE c.usecaseid = @UseCaseId
            AND c.questionid = t.questionId
      )

    DECLARE @TotalQuestions BIGINT = 0
    IF OBJECT_ID('dbo.aiproductquestions', 'U') IS NOT NULL
    BEGIN
        IF COL_LENGTH('dbo.aiproductquestions', 'isactive') IS NOT NULL
        BEGIN
            SELECT @TotalQuestions = COUNT(*)
            FROM dbo.aiproductquestions
            WHERE LOWER(LTRIM(RTRIM(COALESCE(isactive, '1')))) IN ('1', 'true', 'yes', 'y', 'active')
        END
        ELSE
        BEGIN
            SELECT @TotalQuestions = COUNT(*)
            FROM dbo.aiproductquestions
        END
    END

    DECLARE @AnsweredQuestions BIGINT = 0
    SELECT @AnsweredQuestions = COUNT(DISTINCT questionid)
    FROM dbo.aiproductchecklist
    WHERE usecaseid = @UseCaseId
      AND LTRIM(RTRIM(COALESCE(response, ''))) <> ''

    UPDATE dbo.usecases
    SET
        productchecklist = CASE
            WHEN @TotalQuestions > 0 AND @AnsweredQuestions >= @TotalQuestions THEN 'true'
            ELSE NULL
        END,
        modified = @Now,
        editor_email = COALESCE(@EditorEmail, editor_email)
    WHERE id = @UseCaseId

    SELECT 1 AS Success
END
GO
