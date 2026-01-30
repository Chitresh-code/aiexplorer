IF OBJECT_ID('dbo.GetUseCaseDetails', 'P') IS NOT NULL
    DROP PROCEDURE dbo.GetUseCaseDetails
GO

CREATE PROCEDURE dbo.GetUseCaseDetails
    @UseCaseId BIGINT,
    @RequestType NVARCHAR(20) = NULL,
    @IncludeList NVARCHAR(MAX) = NULL,
    @All BIT = 0,
    @Email NVARCHAR(320) = NULL
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @TypeLower NVARCHAR(20) = LOWER(LTRIM(RTRIM(COALESCE(@RequestType, ''))))
    DECLARE @EmailLower NVARCHAR(320) = LOWER(LTRIM(RTRIM(COALESCE(@Email, ''))))
    DECLARE @IncludeLower NVARCHAR(MAX) = LOWER(LTRIM(RTRIM(COALESCE(@IncludeList, ''))))

    IF @TypeLower IN ('owner', 'champion') AND @EmailLower = ''
    BEGIN
        THROW 50000, 'email is required for owner/champion.', 1
    END

    IF @TypeLower = 'owner'
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM dbo.usecases
            WHERE id = @UseCaseId
              AND LOWER(LTRIM(RTRIM(COALESCE(primarycontact, '')))) = @EmailLower
        )
        BEGIN
            THROW 50000, 'Owner email does not match use case primary contact.', 1
        END
    END

    IF @TypeLower = 'champion'
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM dbo.stakeholder_mapping AS sm
            INNER JOIN dbo.rolemapping AS rm
                ON rm.id = sm.roleid
            WHERE LOWER(LTRIM(RTRIM(COALESCE(sm.u_krewer_email, '')))) = @EmailLower
              AND rm.roletype = 1
              AND rm.isactive = 1
              AND sm.isactive = 1
        )
        BEGIN
            THROW 50000, 'Champion email is not eligible.', 1
        END
    END

    DECLARE @IncludeTable TABLE (value NVARCHAR(50) PRIMARY KEY)

    IF @All = 1
    BEGIN
        INSERT INTO @IncludeTable (value)
        VALUES
            ('usecase'),
            ('personas'),
            ('themes'),
            ('agentlibrary'),
            ('plan'),
            ('prioritize'),
            ('metrics'),
            ('stakeholders'),
            ('updates'),
            ('checklist')
    END
    ELSE IF @IncludeLower = ''
    BEGIN
        IF @TypeLower = 'gallery'
        BEGIN
            INSERT INTO @IncludeTable (value)
            VALUES ('usecase')
        END
        ELSE
        BEGIN
            INSERT INTO @IncludeTable (value)
            VALUES
                ('usecase'),
                ('personas'),
                ('themes'),
                ('agentlibrary'),
                ('plan'),
                ('prioritize'),
                ('metrics'),
                ('stakeholders'),
                ('updates'),
                ('checklist')
        END
    END
    ELSE
    BEGIN
        INSERT INTO @IncludeTable (value)
        SELECT DISTINCT LTRIM(RTRIM(value))
        FROM STRING_SPLIT(@IncludeLower, ',')
        WHERE LTRIM(RTRIM(value)) <> ''
    END

    IF EXISTS (SELECT 1 FROM @IncludeTable WHERE value = 'usecase')
    BEGIN
        SELECT
            u.id,
            u.title,
            u.headlines,
            u.opportunity,
            u.business_value,
            u.subteamname,
            u.informationurl,
            u.modified,
            u.created,
            u.primarycontact,
            u.editor_email,
            u.businessunitid,
            u.phaseid,
            u.statusid,
            u.esedependency,
            bu.businessunitname AS businessUnitName,
            bu.teamname AS teamName,
            pm.phase AS phase,
            pm.phasestage AS phaseStage,
            sm.statusname AS statusName,
            sm.statuscolor AS statusColor
        FROM dbo.usecases AS u
        LEFT JOIN dbo.businessunitmapping AS bu
            ON bu.id = u.businessunitid
        LEFT JOIN dbo.phasemapping AS pm
            ON pm.id = u.phaseid
        LEFT JOIN dbo.statusmapping AS sm
            ON sm.id = u.statusid
        WHERE u.id = @UseCaseId
    END

    IF EXISTS (SELECT 1 FROM @IncludeTable WHERE value = 'agentlibrary')
    BEGIN
        DECLARE @hasProduct BIT =
            CASE WHEN COL_LENGTH('dbo.vendormodelmapping', 'ProductName') IS NOT NULL THEN 1 ELSE 0 END
        DECLARE @hasModel BIT =
            CASE WHEN COL_LENGTH('dbo.vendormodelmapping', 'ModelName') IS NOT NULL THEN 1 ELSE 0 END

        DECLARE @agentSql NVARCHAR(MAX)
        SET @agentSql =
            N'SELECT
                al.usecaseid,
                al.id,
                al.vendormodelid,
                al.agentid,
                al.agentlink,
                al.prompt,
                al.modified,
                al.created,
                al.editor_email,
                t.aiThemeIds,
                p.personaIds,
                k.knowledgeSourceIds,
                vm.VendorName AS vendorName,
                ' + CASE WHEN @hasProduct = 1 THEN 'vm.ProductName'
                         WHEN @hasModel = 1 THEN 'vm.ModelName'
                         ELSE 'NULL' END + N' AS productName
            FROM dbo.agentlibrary al
            LEFT JOIN dbo.vendormodelmapping vm
              ON vm.id = al.vendormodelid
            OUTER APPLY (
                SELECT STUFF((
                    SELECT '','' + CONVERT(nvarchar(20), x.aithemeid)
                    FROM (
                        SELECT DISTINCT uct.aithemeid
                        FROM dbo.usecasetheme uct
                        WHERE uct.usecaseid = al.usecaseid
                    ) x
                    ORDER BY x.aithemeid
                    FOR XML PATH(''''), TYPE
                ).value(''.'', ''nvarchar(max)''), 1, 1, '''') AS aiThemeIds
            ) t
            OUTER APPLY (
                SELECT STUFF((
                    SELECT '','' + CONVERT(nvarchar(20), y.personaid)
                    FROM (
                        SELECT DISTINCT ucp.personaid
                        FROM dbo.usecasepersona ucp
                        WHERE ucp.usecaseid = al.usecaseid
                    ) y
                    ORDER BY y.personaid
                    FOR XML PATH(''''), TYPE
                ).value(''.'', ''nvarchar(max)''), 1, 1, '''') AS personaIds
            ) p
            OUTER APPLY (
                SELECT STUFF((
                    SELECT '','' + CONVERT(nvarchar(20), z.knowledgesourceid)
                    FROM (
                        SELECT DISTINCT uks.knowledgesourceid
                        FROM dbo.usecaseknowledgesource uks
                        WHERE uks.usecaseid = al.usecaseid
                    ) z
                    ORDER BY z.knowledgesourceid
                    FOR XML PATH(''''), TYPE
                ).value(''.'', ''nvarchar(max)''), 1, 1, '''') AS knowledgeSourceIds
            ) k
            WHERE al.usecaseid = @UseCaseId
            ORDER BY al.id;'

        EXEC sp_executesql @agentSql, N'@UseCaseId BIGINT', @UseCaseId = @UseCaseId
    END

    IF EXISTS (SELECT 1 FROM @IncludeTable WHERE value = 'personas')
    BEGIN
        SELECT
            up.usecaseid,
            up.personaid,
            p.personaname AS personaName
        FROM dbo.usecasepersona AS up
        LEFT JOIN dbo.personamapping AS p
            ON p.id = up.personaid
        WHERE up.usecaseid = @UseCaseId
    END

    IF EXISTS (SELECT 1 FROM @IncludeTable WHERE value = 'themes')
    BEGIN
        SELECT
            ut.usecaseid,
            ut.aithemeid,
            t.themename AS themeName
        FROM dbo.usecasetheme AS ut
        LEFT JOIN dbo.aithememapping AS t
            ON t.id = ut.aithemeid
        WHERE ut.usecaseid = @UseCaseId
    END

    IF EXISTS (SELECT 1 FROM @IncludeTable WHERE value = 'plan')
    BEGIN
        SELECT
            p.id,
            p.usecaseid,
            p.usecasephaseid,
            pm.phase AS phasename,
            p.startdate,
            p.enddate,
            p.modified,
            p.created,
            p.editor_email
        FROM dbo.[plan] AS p
        LEFT JOIN dbo.phasemapping AS pm
            ON pm.id = p.usecasephaseid
        WHERE p.usecaseid = @UseCaseId
        ORDER BY p.usecasephaseid
    END

    IF EXISTS (SELECT 1 FROM @IncludeTable WHERE value = 'prioritize')
    BEGIN
        SELECT TOP 1
            id,
            usecaseid,
            ricescore,
            priority,
            aigallerydisplay,
            sltreporting,
            totaluserbase,
            reach,
            impact,
            confidence,
            effort,
            timespanid,
            reportingfrequencyid,
            modified,
            created,
            editor_email
        FROM dbo.prioritization
        WHERE usecaseid = @UseCaseId
        ORDER BY id DESC
    END

    IF EXISTS (SELECT 1 FROM @IncludeTable WHERE value = 'metrics')
    BEGIN
        SELECT
            m.id,
            m.usecaseid,
            m.metrictypeid,
            m.unitofmeasureid,
            m.primarysuccessmetricname,
            m.baselinevalue,
            m.baselinedate,
            m.targetvalue,
            m.targetdate,
            m.modified,
            m.created,
            m.editor_email
        FROM dbo.metric m
        WHERE m.usecaseid = @UseCaseId
        ORDER BY m.id

        SELECT
            mr.id,
            mr.usecaseid,
            mr.metricid,
            mr.reportedvalue,
            mr.reporteddate,
            mr.modified,
            mr.created,
            mr.editor_email
        FROM dbo.metricreported mr
        WHERE mr.usecaseid = @UseCaseId
        ORDER BY mr.metricid, mr.reporteddate, mr.id
    END

    IF EXISTS (SELECT 1 FROM @IncludeTable WHERE value = 'stakeholders')
    BEGIN
        SELECT
            s.id,
            s.roleid,
            s.usecaseid,
            COALESCE(s.role, rm.rolename) AS role_name,
            s.stakeholder_email,
            s.modified,
            s.created,
            s.editor_email
        FROM dbo.stakeholder AS s
        LEFT JOIN dbo.rolemapping AS rm
            ON rm.id = s.roleid
        WHERE s.usecaseid = @UseCaseId
          AND COALESCE(s.isactive, 1) = 1
        ORDER BY s.roleid, s.stakeholder_email
    END

    IF EXISTS (SELECT 1 FROM @IncludeTable WHERE value = 'updates')
    BEGIN
        SELECT
            u.id,
            u.usecaseid,
            u.meaningfulupdate,
            u.roleid,
            rm.rolename AS role_name,
            u.usecasephaseid,
            pm.phase AS phase_name,
            u.usecasestatusid,
            sm.statusname AS status_name,
            sm.statuscolor AS status_color,
            u.modified,
            u.created,
            u.editor_email
        FROM dbo.updates AS u
        INNER JOIN dbo.stakeholder AS s
            ON s.id = u.stakeholderid
        LEFT JOIN dbo.rolemapping AS rm
            ON rm.id = u.roleid
        LEFT JOIN dbo.phasemapping AS pm
            ON pm.id = u.usecasephaseid
        LEFT JOIN dbo.statusmapping AS sm
            ON sm.id = u.usecasestatusid
        WHERE u.usecaseid = @UseCaseId
          AND COALESCE(s.isactive, 1) = 1
        ORDER BY u.created DESC
    END

    IF EXISTS (SELECT 1 FROM @IncludeTable WHERE value = 'checklist')
    BEGIN
        SELECT
            c.questionid,
            c.response
        FROM dbo.aiproductchecklist AS c
        WHERE c.usecaseid = @UseCaseId
        ORDER BY c.questionid
    END
END
GO
