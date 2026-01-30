CREATE OR ALTER PROCEDURE dbo.GetUseCases
    @Role NVARCHAR(50) = NULL,
    @Email NVARCHAR(320) = NULL,
    @View NVARCHAR(20) = 'full'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ViewLower NVARCHAR(20) = LOWER(LTRIM(RTRIM(COALESCE(@View, 'full'))));
    DECLARE @RoleLower NVARCHAR(50) = LOWER(LTRIM(RTRIM(COALESCE(@Role, ''))));
    DECLARE @EmailLower NVARCHAR(320) = LOWER(LTRIM(RTRIM(COALESCE(@Email, ''))));

    IF OBJECT_ID('tempdb..#UseCases') IS NOT NULL
        DROP TABLE #UseCases;

    SELECT
        u.id AS id,
        u.businessunitid AS businessUnitId,
        u.phaseid AS phaseId,
        u.statusid AS statusId,
        u.title AS title,
        u.headlines AS headlines,
        u.opportunity AS opportunity,
        u.business_value AS businessValue,
        u.informationurl AS informationUrl,
        u.primarycontact AS primaryContact,
        u.productchecklist AS productChecklist,
        u.esedependency AS eseDependency,
        bu.businessunitname AS businessUnitName,
        bu.teamname AS teamName,
        pm.Phase AS phase,
        sm.StatusName AS statusName,
        sm.StatusColor AS statusColor,
        pr.priority AS priority,
        it.timespan AS deliveryTimespan
    INTO #UseCases
    FROM dbo.usecases AS u
    LEFT JOIN dbo.businessunitmapping AS bu
        ON bu.id = u.businessunitid
    LEFT JOIN dbo.phasemapping AS pm
        ON pm.id = u.phaseid
    LEFT JOIN dbo.statusmapping AS sm
        ON sm.id = u.statusid
    LEFT JOIN dbo.prioritization AS pr
        ON pr.usecaseid = u.id
    LEFT JOIN dbo.implementationtimespan AS it
        ON it.id = pr.timespanid
    WHERE
        (
            @RoleLower <> 'owner' OR
            (
                @EmailLower <> '' AND
                LOWER(LTRIM(RTRIM(COALESCE(u.primarycontact, '')))) = @EmailLower
            )
        )
        AND (
            @RoleLower <> 'champion' OR
            (
                @EmailLower <> '' AND
                EXISTS (
                    SELECT 1
                    FROM dbo.stakeholder AS s
                    INNER JOIN dbo.rolemapping AS rm
                        ON rm.id = s.roleid
                    WHERE s.usecaseid = u.id
                      AND LOWER(LTRIM(RTRIM(COALESCE(s.stakeholder_email, '')))) = @EmailLower
                      AND rm.roletype = 1
                      AND rm.isactive = 1
                )
            )
        );

    SELECT
        id,
        businessUnitId,
        phaseId,
        statusId,
        title,
        headlines,
        opportunity,
        businessValue,
        informationUrl,
        primaryContact,
        productChecklist,
        eseDependency,
        businessUnitName,
        teamName,
        phase,
        statusName,
        statusColor,
        priority,
        deliveryTimespan
    FROM #UseCases
    ORDER BY id ASC;

    SELECT
        p.usecaseid AS useCaseId,
        p.usecasephaseid AS phaseId,
        pm2.Phase AS phaseName,
        p.startdate AS startDate,
        p.enddate AS endDate
    FROM dbo.[plan] AS p
    LEFT JOIN dbo.phasemapping AS pm2
        ON pm2.id = p.usecasephaseid
    WHERE p.usecaseid IN (SELECT id FROM #UseCases)
    ORDER BY p.usecaseid, p.usecasephaseid;
END;
GO

-- Example usage:
-- EXEC dbo.GetUseCases
--     @View = 'gallery';
--
-- EXEC dbo.GetUseCases
--     @Role = 'owner',
--     @Email = 'user@company.com',
--     @View = 'full';
