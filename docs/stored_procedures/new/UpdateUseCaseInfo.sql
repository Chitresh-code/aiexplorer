CREATE OR ALTER PROCEDURE dbo.UpdateUseCaseInfo
    @UseCaseId BIGINT,
    @PayloadJson NVARCHAR(MAX),
    @EditorEmail NVARCHAR(320) = NULL
AS
BEGIN
    SET NOCOUNT ON

    IF @UseCaseId IS NULL OR @UseCaseId <= 0
    BEGIN
        THROW 50000, 'UseCaseId is required.', 1
    END

    IF @PayloadJson IS NULL OR LTRIM(RTRIM(@PayloadJson)) = ''
    BEGIN
        THROW 50000, 'PayloadJson is required.', 1
    END

    DECLARE @HasTitle BIT
    DECLARE @HasHeadlines BIT
    DECLARE @HasOpportunity BIT
    DECLARE @HasBusinessValue BIT

    SET @HasTitle = 0
    SET @HasHeadlines = 0
    SET @HasOpportunity = 0
    SET @HasBusinessValue = 0

    IF CHARINDEX('"title"', @PayloadJson) > 0
        SET @HasTitle = 1
    IF CHARINDEX('"headlines"', @PayloadJson) > 0
        SET @HasHeadlines = 1
    IF CHARINDEX('"opportunity"', @PayloadJson) > 0
        SET @HasOpportunity = 1
    IF CHARINDEX('"businessValue"', @PayloadJson) > 0
        SET @HasBusinessValue = 1

    IF @HasTitle = 0 AND @HasHeadlines = 0 AND @HasOpportunity = 0 AND @HasBusinessValue = 0
    BEGIN
        THROW 50000, 'At least one field must be provided.', 1
    END

    DECLARE @Title NVARCHAR(255) = JSON_VALUE(@PayloadJson, '$.title')
    DECLARE @Headlines NVARCHAR(255) = JSON_VALUE(@PayloadJson, '$.headlines')
    DECLARE @Opportunity NVARCHAR(MAX) = JSON_VALUE(@PayloadJson, '$.opportunity')
    DECLARE @BusinessValue NVARCHAR(MAX) = JSON_VALUE(@PayloadJson, '$.businessValue')

    UPDATE dbo.usecases
    SET
        title = CASE WHEN @HasTitle = 1 THEN @Title ELSE title END,
        headlines = CASE WHEN @HasHeadlines = 1 THEN @Headlines ELSE headlines END,
        opportunity = CASE WHEN @HasOpportunity = 1 THEN @Opportunity ELSE opportunity END,
        business_value = CASE WHEN @HasBusinessValue = 1 THEN @BusinessValue ELSE business_value END,
        editor_email = COALESCE(@EditorEmail, editor_email),
        modified = GETDATE()
    WHERE id = @UseCaseId

    IF @@ROWCOUNT = 0
    BEGIN
        THROW 50000, 'Use case not found.', 1
    END

    SELECT 1 AS Success
END
GO
