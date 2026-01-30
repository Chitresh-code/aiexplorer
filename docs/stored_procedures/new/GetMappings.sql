CREATE OR ALTER PROCEDURE dbo.GetMappings
    @Types NVARCHAR(MAX) = NULL,
    @All BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TypesTable TABLE (value NVARCHAR(100));

    IF @All = 1 OR @Types IS NULL OR LTRIM(RTRIM(@Types)) = ''
    BEGIN
        SET @All = 1;
    END
    ELSE
    BEGIN
        INSERT INTO @TypesTable (value)
        SELECT LOWER(LTRIM(RTRIM(value)))
        FROM STRING_SPLIT(@Types, ',')
        WHERE LTRIM(RTRIM(value)) <> '';
    END

    -- businessUnits
    IF @All = 1 OR EXISTS (SELECT 1 FROM @TypesTable WHERE value = 'businessunits')
    BEGIN
        SELECT
            id AS id,
            businessunitname AS businessUnitName,
            teamname AS teamName
        FROM dbo.businessunitmapping
        WHERE TRY_CONVERT(INT, isactive) = 1;
    END

    -- themes
    IF @All = 1 OR EXISTS (SELECT 1 FROM @TypesTable WHERE value = 'themes')
    BEGIN
        SELECT
            id AS id,
            themename AS name,
            themedefinition AS definition,
            themeexample AS example
        FROM dbo.aithememapping
        WHERE TRY_CONVERT(INT, isactive) = 1;
    END

    -- personas
    IF @All = 1 OR EXISTS (SELECT 1 FROM @TypesTable WHERE value = 'personas')
    BEGIN
        SELECT
            id AS id,
            personaname AS name,
            roledefinition AS definition,
            exampleroles AS exampleRoles
        FROM dbo.personamapping
        WHERE TRY_CONVERT(INT, isactive) = 1;
    END

    -- vendorModels
    IF @All = 1 OR EXISTS (SELECT 1 FROM @TypesTable WHERE value = 'vendormodels')
    BEGIN
        SELECT
            id AS id,
            vendorname AS vendorName,
            productname AS productName
        FROM dbo.vendormodelmapping
        WHERE TRY_CONVERT(INT, isactive) = 1;
    END

    -- aiProductQuestions
    IF @All = 1 OR EXISTS (SELECT 1 FROM @TypesTable WHERE value = 'aiproductquestions')
    BEGIN
        SELECT
            id AS id,
            question AS question,
            questiontype AS questionType,
            responsevalue AS responseValue
        FROM dbo.aiproductquestions
        WHERE TRY_CONVERT(INT, isactive) = 1;
    END

    -- status
    IF @All = 1 OR EXISTS (SELECT 1 FROM @TypesTable WHERE value = 'status')
    BEGIN
        SELECT
            id AS id,
            statusname AS name,
            statuscolor AS color,
            statusdefinitions AS definition
        FROM dbo.statusmapping
        WHERE TRY_CONVERT(INT, isactive) = 1;
    END

    -- phases
    IF @All = 1 OR EXISTS (SELECT 1 FROM @TypesTable WHERE value = 'phases')
    BEGIN
        SELECT
            id AS id,
            phase AS name,
            phasestage AS stage,
            guid AS guid
        FROM dbo.phasemapping
        WHERE TRY_CONVERT(INT, isactive) = 1;
    END

    -- roles
    IF @All = 1 OR EXISTS (SELECT 1 FROM @TypesTable WHERE value = 'roles')
    BEGIN
        SELECT
            id AS id,
            rolename AS name,
            reviewflag AS reviewFlag,
            roletype AS roleType
        FROM dbo.rolemapping
        WHERE TRY_CONVERT(INT, isactive) = 1;
    END

    -- reportingFrequency
    IF @All = 1 OR EXISTS (SELECT 1 FROM @TypesTable WHERE value = 'reportingfrequency')
    BEGIN
        SELECT
            id AS id,
            frequency AS frequency
        FROM dbo.reportingfrequency
        WHERE TRY_CONVERT(INT, isactive) = 1;
    END

    -- rice
    IF @All = 1 OR EXISTS (SELECT 1 FROM @TypesTable WHERE value = 'rice')
    BEGIN
        SELECT
            id AS id,
            categorydisplay AS categoryDisplay,
            categoryheader AS categoryHeader,
            categoryvalue AS categoryValue
        FROM dbo.rice
        WHERE TRY_CONVERT(INT, isactive) = 1;
    END

    -- implementationTimespans
    IF @All = 1 OR EXISTS (SELECT 1 FROM @TypesTable WHERE value = 'implementationtimespans')
    BEGIN
        SELECT
            id AS id,
            timespan AS timespan
        FROM dbo.implementationtimespan
        WHERE TRY_CONVERT(INT, isactive) = 1;
    END

    -- metricCategories
    IF @All = 1 OR EXISTS (SELECT 1 FROM @TypesTable WHERE value = 'metriccategories')
    BEGIN
        SELECT
            id AS id,
            outcome_category AS category,
            outcome_description AS description,
            default_unitofmeasure_id AS defaultUnitOfMeasureId
        FROM dbo.outcomes
        WHERE TRY_CONVERT(INT, isactive) = 1;
    END

    -- knowledgeSources
    IF @All = 1 OR EXISTS (SELECT 1 FROM @TypesTable WHERE value = 'knowledgesources')
    BEGIN
        SELECT
            id AS id,
            knowledgesourcename AS name
        FROM dbo.knowledgesourcemapping
        WHERE TRY_CONVERT(INT, isactive) = 1;
    END

    -- unitOfMeasure
    IF @All = 1 OR EXISTS (SELECT 1 FROM @TypesTable WHERE value = 'unitofmeasure')
    BEGIN
        SELECT
            id AS id,
            unitofmeasure AS name,
            measuretype AS measureType,
            defaultvalue AS defaultValue,
            options AS options
        FROM dbo.unitofmeasure
        WHERE TRY_CONVERT(INT, isactive) = 1;
    END
END;
GO

-- Example usage:
-- EXEC dbo.GetMappings @Types = 'businessUnits,roles,status';
-- EXEC dbo.GetMappings @All = 1;
