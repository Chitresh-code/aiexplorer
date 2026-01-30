CREATE OR ALTER PROCEDURE dbo.UpdateUseCaseStakeholder
    @Id BIGINT,
    @UseCaseId BIGINT,
    @RoleId BIGINT,
    @StakeholderEmail NVARCHAR(320),
    @EditorEmail NVARCHAR(320) = NULL
AS
BEGIN
    SET NOCOUNT ON
    SET XACT_ABORT ON

    IF @Id IS NULL OR @Id <= 0
    BEGIN
        THROW 50000, 'Id is required.', 1
    END

    IF @UseCaseId IS NULL OR @UseCaseId <= 0
    BEGIN
        THROW 50000, 'UseCaseId is required.', 1
    END

    IF @RoleId IS NULL OR @RoleId <= 0
    BEGIN
        THROW 50000, 'RoleId is required.', 1
    END

    IF @StakeholderEmail IS NULL OR LTRIM(RTRIM(@StakeholderEmail)) = ''
    BEGIN
        THROW 50000, 'StakeholderEmail is required.', 1
    END

    DECLARE @RoleName NVARCHAR(255)
    DECLARE @RoleType NVARCHAR(255)
    DECLARE @IsActive NVARCHAR(255)

    SELECT TOP 1
        @RoleName = rm.rolename,
        @RoleType = rm.roletype,
        @IsActive = rm.isactive
    FROM dbo.rolemapping rm
    WHERE rm.id = @RoleId

    IF @RoleName IS NULL OR LTRIM(RTRIM(@RoleName)) = ''
    BEGIN
        THROW 50000, 'Role is invalid.', 1
    END

    IF LTRIM(RTRIM(COALESCE(@RoleType, ''))) <> '2'
    BEGIN
        THROW 50000, 'Role is not eligible for stakeholders.', 1
    END

    IF LTRIM(RTRIM(COALESCE(@IsActive, '1'))) <> '1'
    BEGIN
        THROW 50000, 'Role is inactive.', 1
    END

    IF LOWER(LTRIM(RTRIM(@RoleName))) = 'owner'
    BEGIN
        THROW 50000, 'Owner role cannot be added as stakeholder.', 1
    END

    DECLARE @Now DATETIME2 = SYSUTCDATETIME()

    UPDATE dbo.stakeholder
    SET
        roleid = @RoleId,
        role = @RoleName,
        stakeholder_email = @StakeholderEmail,
        modified = @Now,
        editor_email = COALESCE(@EditorEmail, editor_email)
    WHERE id = @Id
      AND usecaseid = @UseCaseId

    IF @@ROWCOUNT = 0
    BEGIN
        THROW 50000, 'Stakeholder not found.', 1
    END

    SELECT
        @Id AS id,
        @RoleId AS roleid,
        @UseCaseId AS usecaseid,
        @RoleName AS role,
        @StakeholderEmail AS stakeholder_email
END
GO
