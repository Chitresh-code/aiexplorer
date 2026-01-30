CREATE   PROCEDURE dbo.GetChampionUseCases
    @StakeholderEmail NVARCHAR(320)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT
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
        it.timespan AS deliveryTimespan,
        planDates.startdate AS currentPhaseStartDate,
        planDates.enddate AS currentPhaseEndDate
    FROM dbo.usecases AS u
    LEFT JOIN dbo.businessunitmapping AS bu
        ON bu.id = u.businessunitid
    LEFT JOIN dbo.phasemapping AS pm
        ON pm.id = u.phaseid
    LEFT JOIN dbo.statusmapping AS sm
        ON sm.id = u.statusid
    OUTER APPLY (
        SELECT TOP (1)
            p.priority,
            p.timespanid
        FROM dbo.prioritization AS p
        WHERE p.usecaseid = u.id
        ORDER BY p.priority ASC
    ) AS pr
    LEFT JOIN dbo.implementationtimespan AS it
        ON it.id = pr.timespanid
    OUTER APPLY (
        SELECT TOP (1)
            pl.startdate,
            pl.enddate
        FROM dbo.[plan] AS pl
        WHERE pl.usecaseid = u.id
          AND pl.usecasephaseid = u.phaseid
        ORDER BY pl.enddate DESC, pl.startdate DESC
    ) AS planDates
    WHERE EXISTS (
        SELECT 1
        FROM dbo.stakeholder AS s   -- <-- change to dbo.stakeholders if that's your real table
        WHERE s.usecaseid = u.id
          AND LOWER(LTRIM(RTRIM(COALESCE(s.stakeholder_email, '')))) =
              LOWER(LTRIM(RTRIM(COALESCE(@StakeholderEmail, ''))))
          AND (s.[roleid] = 4 OR s.[roleid] = 14)
    );
END;