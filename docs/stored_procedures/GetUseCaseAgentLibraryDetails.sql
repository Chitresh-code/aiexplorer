CREATE   PROCEDURE dbo.GetUseCaseAgentLibraryDetails
    @UseCaseId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
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
        k.knowledgeSourceIds
    FROM dbo.agentlibrary al

    -- Themes
    OUTER APPLY (
        SELECT STRING_AGG(CONVERT(nvarchar(20), x.aithemeid), ',')
               WITHIN GROUP (ORDER BY x.aithemeid) AS aiThemeIds
        FROM (
            SELECT DISTINCT uct.aithemeid
            FROM dbo.usecasetheme uct
            WHERE uct.usecaseid = al.usecaseid
        ) x
    ) t

    -- Personas
    OUTER APPLY (
        SELECT STRING_AGG(CONVERT(nvarchar(20), y.personaid), ',')
               WITHIN GROUP (ORDER BY y.personaid) AS personaIds
        FROM (
            SELECT DISTINCT ucp.personaid
            FROM dbo.usecasepersona ucp
            WHERE ucp.usecaseid = al.usecaseid
        ) y
    ) p

    -- Knowledge Sources
    OUTER APPLY (
        SELECT STRING_AGG(CONVERT(nvarchar(20), z.knowledgesourceid), ',')
               WITHIN GROUP (ORDER BY z.knowledgesourceid) AS knowledgeSourceIds
        FROM (
            SELECT DISTINCT uks.knowledgesourceid
            FROM dbo.usecaseknowledgesource uks
            WHERE uks.usecaseid = al.usecaseid
        ) z
    ) k

    WHERE al.usecaseid = @UseCaseId
    ORDER BY al.id;
END;