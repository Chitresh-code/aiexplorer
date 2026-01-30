CREATE OR ALTER PROCEDURE dbo.UpdateUseCaseAgentLibraryDetails
    @UseCaseId BIGINT,
    @AIThemeIds NVARCHAR(MAX) = NULL,
    @PersonaIds NVARCHAR(MAX) = NULL,
    @KnowledgeSourceIds NVARCHAR(MAX) = NULL,
    @AgentLibraryId BIGINT = NULL,
    @VendorModelId BIGINT = NULL,
    @AgentId NVARCHAR(255) = NULL,
    @AgentLink NVARCHAR(255) = NULL,
    @Prompt NVARCHAR(MAX) = NULL,
    @EditorEmail NVARCHAR(320) = NULL
AS
BEGIN
    SET NOCOUNT ON
    SET XACT_ABORT ON

    IF @UseCaseId IS NULL OR @UseCaseId <= 0
    BEGIN
        THROW 50000, 'UseCaseId is required.', 1
    END

    DECLARE @Now DATETIME2 = SYSUTCDATETIME()
    DECLARE @TargetAgentLibraryId BIGINT
    DECLARE @InsertedIds TABLE (id BIGINT)

    SELECT TOP 1 @TargetAgentLibraryId = al.id
    FROM dbo.agentlibrary AS al
    WHERE al.id = @AgentLibraryId
      AND al.usecaseid = @UseCaseId

    IF @TargetAgentLibraryId IS NULL
    BEGIN
        SELECT TOP 1 @TargetAgentLibraryId = al.id
        FROM dbo.agentlibrary AS al
        WHERE al.usecaseid = @UseCaseId
        ORDER BY al.id DESC
    END

    IF @TargetAgentLibraryId IS NULL
       AND (
            @VendorModelId IS NOT NULL OR
            @AgentId IS NOT NULL OR
            @AgentLink IS NOT NULL OR
            @Prompt IS NOT NULL OR
            @EditorEmail IS NOT NULL
       )
    BEGIN
        INSERT INTO dbo.agentlibrary (
            usecaseid,
            vendormodelid,
            agentid,
            agentlink,
            prompt,
            modified,
            created,
            editor_email
        )
        OUTPUT inserted.id INTO @InsertedIds (id)
        VALUES (
            @UseCaseId,
            @VendorModelId,
            @AgentId,
            @AgentLink,
            @Prompt,
            @Now,
            @Now,
            @EditorEmail
        )

        SELECT TOP 1 @TargetAgentLibraryId = id FROM @InsertedIds
    END

    IF @TargetAgentLibraryId IS NOT NULL
    BEGIN
        UPDATE dbo.agentlibrary
        SET
            vendormodelid = CASE WHEN @VendorModelId IS NULL THEN vendormodelid ELSE @VendorModelId END,
            agentid = CASE WHEN @AgentId IS NULL THEN agentid ELSE @AgentId END,
            agentlink = CASE WHEN @AgentLink IS NULL THEN agentlink ELSE @AgentLink END,
            prompt = CASE WHEN @Prompt IS NULL THEN prompt ELSE @Prompt END,
            modified = @Now,
            editor_email = COALESCE(@EditorEmail, editor_email)
        WHERE id = @TargetAgentLibraryId
    END

    IF @AIThemeIds IS NOT NULL
    BEGIN
        DECLARE @ThemeIds TABLE (id BIGINT PRIMARY KEY)
        INSERT INTO @ThemeIds (id)
        SELECT DISTINCT TRY_CONVERT(BIGINT, LTRIM(RTRIM(value)))
        FROM STRING_SPLIT(@AIThemeIds, ',')
        WHERE TRY_CONVERT(BIGINT, LTRIM(RTRIM(value))) IS NOT NULL

        DELETE ut
        FROM dbo.usecasetheme AS ut
        WHERE ut.usecaseid = @UseCaseId
          AND NOT EXISTS (
              SELECT 1 FROM @ThemeIds AS t WHERE t.id = ut.aithemeid
          )

        INSERT INTO dbo.usecasetheme (usecaseid, aithemeid)
        SELECT @UseCaseId, t.id
        FROM @ThemeIds AS t
        WHERE NOT EXISTS (
            SELECT 1
            FROM dbo.usecasetheme AS ut
            WHERE ut.usecaseid = @UseCaseId AND ut.aithemeid = t.id
        )
    END

    IF @PersonaIds IS NOT NULL
    BEGIN
        DECLARE @PersonaIdsTable TABLE (id BIGINT PRIMARY KEY)
        INSERT INTO @PersonaIdsTable (id)
        SELECT DISTINCT TRY_CONVERT(BIGINT, LTRIM(RTRIM(value)))
        FROM STRING_SPLIT(@PersonaIds, ',')
        WHERE TRY_CONVERT(BIGINT, LTRIM(RTRIM(value))) IS NOT NULL

        DELETE up
        FROM dbo.usecasepersona AS up
        WHERE up.usecaseid = @UseCaseId
          AND NOT EXISTS (
              SELECT 1 FROM @PersonaIdsTable AS p WHERE p.id = up.personaid
          )

        INSERT INTO dbo.usecasepersona (usecaseid, personaid)
        SELECT @UseCaseId, p.id
        FROM @PersonaIdsTable AS p
        WHERE NOT EXISTS (
            SELECT 1
            FROM dbo.usecasepersona AS up
            WHERE up.usecaseid = @UseCaseId AND up.personaid = p.id
        )
    END

    IF @KnowledgeSourceIds IS NOT NULL
    BEGIN
        DECLARE @KnowledgeSourceIdsTable TABLE (id BIGINT PRIMARY KEY)
        INSERT INTO @KnowledgeSourceIdsTable (id)
        SELECT DISTINCT TRY_CONVERT(BIGINT, LTRIM(RTRIM(value)))
        FROM STRING_SPLIT(@KnowledgeSourceIds, ',')
        WHERE TRY_CONVERT(BIGINT, LTRIM(RTRIM(value))) IS NOT NULL

        DELETE uk
        FROM dbo.usecaseknowledgesource AS uk
        WHERE uk.usecaseid = @UseCaseId
          AND NOT EXISTS (
              SELECT 1 FROM @KnowledgeSourceIdsTable AS k WHERE k.id = uk.knowledgesourceid
          )

        INSERT INTO dbo.usecaseknowledgesource (usecaseid, knowledgesourceid)
        SELECT @UseCaseId, k.id
        FROM @KnowledgeSourceIdsTable AS k
        WHERE NOT EXISTS (
            SELECT 1
            FROM dbo.usecaseknowledgesource AS uk
            WHERE uk.usecaseid = @UseCaseId AND uk.knowledgesourceid = k.id
        )
    END

    SELECT 1 AS Success, 'Agent library updated.' AS Message
END
GO
