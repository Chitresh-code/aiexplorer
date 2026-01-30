CREATE OR ALTER PROCEDURE dbo.CreateUseCaseUpdate
    @UseCaseId BIGINT,
    @MeaningfulUpdate NVARCHAR(MAX),
    @EditorEmail NVARCHAR(320)
AS
BEGIN
    SET NOCOUNT ON
    SET XACT_ABORT ON

    IF @UseCaseId IS NULL OR @UseCaseId <= 0
    BEGIN
        THROW 50000, 'UseCaseId is required.', 1
    END

    IF @MeaningfulUpdate IS NULL OR LTRIM(RTRIM(@MeaningfulUpdate)) = ''
    BEGIN
        THROW 50000, 'MeaningfulUpdate is required.', 1
    END

    IF @EditorEmail IS NULL OR LTRIM(RTRIM(@EditorEmail)) = ''
    BEGIN
        THROW 50000, 'EditorEmail is required.', 1
    END

    DECLARE @RoleId BIGINT
    DECLARE @StakeholderId BIGINT
    DECLARE @PhaseId BIGINT
    DECLARE @StatusId BIGINT

    SELECT TOP 1
        @RoleId = s.roleid,
        @StakeholderId = s.id
    FROM dbo.stakeholder AS s
    WHERE s.usecaseid = @UseCaseId
      AND LOWER(LTRIM(RTRIM(COALESCE(s.stakeholder_email, '')))) =
          LOWER(LTRIM(RTRIM(@EditorEmail)))
      AND COALESCE(s.isactive, 1) = 1

    IF @RoleId IS NULL OR @StakeholderId IS NULL
    BEGIN
        THROW 50000, 'User is not a stakeholder for this use case.', 1
    END

    SELECT TOP 1
        @PhaseId = u.phaseid,
        @StatusId = u.statusid
    FROM dbo.usecases AS u
    WHERE u.id = @UseCaseId

    IF @PhaseId IS NULL OR @StatusId IS NULL
    BEGIN
        THROW 50000, 'Unable to resolve current phase or status.', 1
    END

    DECLARE @Now DATETIME2 = SYSUTCDATETIME()
    DECLARE @Inserted TABLE (
        id BIGINT,
        meaningfulupdate NVARCHAR(MAX),
        usecaseid BIGINT,
        roleid BIGINT,
        usecasephaseid BIGINT,
        usecasestatusid BIGINT,
        modified DATETIME2,
        created DATETIME2,
        editor_email NVARCHAR(320)
    )

    INSERT INTO dbo.updates (
        meaningfulupdate,
        usecaseid,
        stakeholderid,
        roleid,
        usecasephaseid,
        usecasestatusid,
        modified,
        created,
        editor_email
    )
    OUTPUT
        inserted.id,
        inserted.meaningfulupdate,
        inserted.usecaseid,
        inserted.roleid,
        inserted.usecasephaseid,
        inserted.usecasestatusid,
        inserted.modified,
        inserted.created,
        inserted.editor_email
    INTO @Inserted (
        id,
        meaningfulupdate,
        usecaseid,
        roleid,
        usecasephaseid,
        usecasestatusid,
        modified,
        created,
        editor_email
    )
    VALUES (
        @MeaningfulUpdate,
        @UseCaseId,
        @StakeholderId,
        @RoleId,
        @PhaseId,
        @StatusId,
        @Now,
        @Now,
        @EditorEmail
    )

    SELECT
        id,
        meaningfulupdate,
        usecaseid,
        roleid,
        usecasephaseid,
        usecasestatusid,
        modified,
        created,
        editor_email
    FROM @Inserted
END
GO
