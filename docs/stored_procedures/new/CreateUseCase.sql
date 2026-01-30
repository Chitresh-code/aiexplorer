CREATE OR ALTER PROCEDURE dbo.CreateUseCase
    @BusinessUnitId BIGINT,
    @PhaseId BIGINT,
    @StatusId BIGINT,
    @Title NVARCHAR(500),
    @Headlines NVARCHAR(MAX),
    @Opportunity NVARCHAR(MAX),
    @BusinessValue NVARCHAR(MAX),
    @EseDependency NVARCHAR(50),
    @PrimaryContact NVARCHAR(320),
    @EditorEmail NVARCHAR(320),
    @SubTeamName NVARCHAR(200) = NULL,
    @InformationUrl NVARCHAR(1000) = NULL,
    @ChecklistJson NVARCHAR(MAX) = NULL,
    @StakeholdersJson NVARCHAR(MAX),
    @PlanJson NVARCHAR(MAX),
    @MetricsJson NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @Now DATETIME2 = SYSUTCDATETIME();

    IF @Title IS NULL OR LTRIM(RTRIM(@Title)) = ''
        THROW 50000, 'Title is required.', 1;
    IF @PrimaryContact IS NULL OR LTRIM(RTRIM(@PrimaryContact)) = ''
        THROW 50000, 'PrimaryContact is required.', 1;
    IF @EditorEmail IS NULL OR LTRIM(RTRIM(@EditorEmail)) = ''
        THROW 50000, 'EditorEmail is required.', 1;
    IF @BusinessUnitId IS NULL
        THROW 50000, 'BusinessUnitId is required.', 1;
    IF @PhaseId IS NULL
        THROW 50000, 'PhaseId is required.', 1;
    IF @StatusId IS NULL
        THROW 50000, 'StatusId is required.', 1;
    IF @Headlines IS NULL OR LTRIM(RTRIM(@Headlines)) = ''
        THROW 50000, 'Headlines is required.', 1;
    IF @Opportunity IS NULL OR LTRIM(RTRIM(@Opportunity)) = ''
        THROW 50000, 'Opportunity is required.', 1;
    IF @BusinessValue IS NULL OR LTRIM(RTRIM(@BusinessValue)) = ''
        THROW 50000, 'BusinessValue is required.', 1;
    IF @EseDependency IS NULL OR LTRIM(RTRIM(@EseDependency)) = ''
        THROW 50000, 'EseDependency is required.', 1;

    IF @StakeholdersJson IS NULL OR ISJSON(@StakeholdersJson) <> 1
        THROW 50000, 'StakeholdersJson is required and must be valid JSON.', 1;
    IF @PlanJson IS NULL OR ISJSON(@PlanJson) <> 1
        THROW 50000, 'PlanJson is required and must be valid JSON.', 1;
    IF @MetricsJson IS NULL OR ISJSON(@MetricsJson) <> 1
        THROW 50000, 'MetricsJson is required and must be valid JSON.', 1;

    DECLARE @Checklist TABLE (
        questionId BIGINT,
        response NVARCHAR(MAX)
    );
    IF ISJSON(@ChecklistJson) = 1
    BEGIN
        INSERT INTO @Checklist (questionId, response)
        SELECT questionId, response
        FROM OPENJSON(@ChecklistJson)
        WITH (
            questionId BIGINT '$.questionId',
            response NVARCHAR(MAX) '$.response'
        );
    END;

    DECLARE @Stakeholders TABLE (
        roleId BIGINT,
        role NVARCHAR(200),
        stakeholderEmail NVARCHAR(320)
    );
    INSERT INTO @Stakeholders (roleId, role, stakeholderEmail)
    SELECT roleId, role, stakeholderEmail
    FROM OPENJSON(@StakeholdersJson)
    WITH (
        roleId BIGINT '$.roleId',
        role NVARCHAR(200) '$.role',
        stakeholderEmail NVARCHAR(320) '$.stakeholderEmail'
    );

    DECLARE @Plan TABLE (
        usecasephaseid BIGINT,
        startdate DATE,
        enddate DATE
    );
    INSERT INTO @Plan (usecasephaseid, startdate, enddate)
    SELECT usecasephaseid, startdate, enddate
    FROM OPENJSON(@PlanJson)
    WITH (
        usecasephaseid BIGINT '$.usecasephaseid',
        startdate DATE '$.startdate',
        enddate DATE '$.enddate'
    );

    DECLARE @Metrics TABLE (
        metrictypeid BIGINT,
        unitofmeasureid BIGINT,
        primarysuccessmetricname NVARCHAR(500),
        baselinevalue NVARCHAR(200),
        baselinedate DATE,
        targetvalue NVARCHAR(200),
        targetdate DATE
    );
    INSERT INTO @Metrics (
        metrictypeid,
        unitofmeasureid,
        primarysuccessmetricname,
        baselinevalue,
        baselinedate,
        targetvalue,
        targetdate
    )
    SELECT
        metrictypeid,
        unitofmeasureid,
        primarysuccessmetricname,
        baselinevalue,
        baselinedate,
        targetvalue,
        targetdate
    FROM OPENJSON(@MetricsJson)
    WITH (
        metrictypeid BIGINT '$.metrictypeid',
        unitofmeasureid BIGINT '$.unitofmeasureid',
        primarysuccessmetricname NVARCHAR(500) '$.primarysuccessmetricname',
        baselinevalue NVARCHAR(200) '$.baselinevalue',
        baselinedate DATE '$.baselinedate',
        targetvalue NVARCHAR(200) '$.targetvalue',
        targetdate DATE '$.targetdate'
    );

    DECLARE @TotalQuestions BIGINT = 0;
    IF OBJECT_ID('dbo.aiproductquestions', 'U') IS NOT NULL
    BEGIN
        IF COL_LENGTH('dbo.aiproductquestions', 'isactive') IS NOT NULL
        BEGIN
            SELECT @TotalQuestions = COUNT(*)
            FROM dbo.aiproductquestions
            WHERE LOWER(LTRIM(RTRIM(COALESCE(isactive, '1')))) IN ('1', 'true', 'yes', 'y', 'active');
        END
        ELSE
        BEGIN
            SELECT @TotalQuestions = COUNT(*)
            FROM dbo.aiproductquestions;
        END
    END;

    DECLARE @AnsweredQuestions BIGINT = 0;
    SELECT @AnsweredQuestions = COUNT(DISTINCT questionId)
    FROM @Checklist
    WHERE LTRIM(RTRIM(COALESCE(response, ''))) <> '';

    DECLARE @ProductChecklist NVARCHAR(10) = NULL;
    IF @TotalQuestions > 0 AND @AnsweredQuestions >= @TotalQuestions
    BEGIN
        SET @ProductChecklist = 'true';
    END;

    BEGIN TRANSACTION;

    DECLARE @UseCaseId BIGINT
    DECLARE @InsertedUseCase TABLE (id BIGINT)

    INSERT INTO dbo.[usecases] (
        businessunitid,
        phaseid,
        statusid,
        title,
        headlines,
        opportunity,
        business_value,
        subteamname,
        informationurl,
        esedependency,
        productchecklist,
        modified,
        created,
        primarycontact,
        editor_email
    )
    OUTPUT inserted.id INTO @InsertedUseCase (id)
    VALUES (
        @BusinessUnitId,
        @PhaseId,
        @StatusId,
        @Title,
        @Headlines,
        @Opportunity,
        @BusinessValue,
        @SubTeamName,
        @InformationUrl,
        @EseDependency,
        @ProductChecklist,
        @Now,
        @Now,
        @PrimaryContact,
        @EditorEmail
    )

    SELECT @UseCaseId = id FROM @InsertedUseCase

    IF EXISTS (SELECT 1 FROM @Checklist)
    BEGIN
        INSERT INTO dbo.[aiproductchecklist] (
            usecaseid,
            questionid,
            response,
            modified,
            created,
            editor_email
        )
        SELECT
            @UseCaseId,
            questionId,
            response,
            @Now,
            @Now,
            @EditorEmail
        FROM @Checklist
        WHERE LTRIM(RTRIM(COALESCE(response, ''))) <> ''
    END

    IF EXISTS (SELECT 1 FROM @Stakeholders)
    BEGIN
        INSERT INTO dbo.[stakeholder] (
            roleid,
            usecaseid,
            role,
            stakeholder_email,
            modified,
            created,
            editor_email
        )
        SELECT
            roleId,
            @UseCaseId,
            role,
            stakeholderEmail,
            @Now,
            @Now,
            @EditorEmail
        FROM @Stakeholders
        WHERE LTRIM(RTRIM(COALESCE(stakeholderEmail, ''))) <> ''
    END

    IF EXISTS (SELECT 1 FROM @Plan)
    BEGIN
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
            usecasephaseid,
            startdate,
            enddate,
            @Now,
            @Now,
            @EditorEmail
        FROM @Plan
    END

    IF EXISTS (SELECT 1 FROM @Metrics)
    BEGIN
        INSERT INTO dbo.[metric] (
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
        FROM @Metrics
    END

    COMMIT TRANSACTION;

    DECLARE @PhaseName NVARCHAR(200) = NULL;
    SELECT @PhaseName = pm.Phase
    FROM dbo.phasemapping pm
    WHERE pm.id = @PhaseId;

    SELECT
        @UseCaseId AS UseCaseId,
        @PhaseName AS Phase,
        @PhaseId AS Phaseid;

    SELECT
        s.id AS StakeholderID,
        s.roleid AS StakeholderRoleID,
        s.role AS StakeholderRole,
        s.stakeholder_email AS StakeholderEmail,
        CAST(rm.reviewflag AS NVARCHAR(10)) AS ReviewFlag
    FROM dbo.stakeholder s
    LEFT JOIN dbo.rolemapping rm ON rm.id = s.roleid
    WHERE s.usecaseid = @UseCaseId
      AND LTRIM(RTRIM(COALESCE(rm.reviewflag, ''))) = '1';
END;
GO
