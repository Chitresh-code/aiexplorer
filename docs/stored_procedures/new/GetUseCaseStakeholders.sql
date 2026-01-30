CREATE OR ALTER PROCEDURE dbo.GetUseCaseStakeholders
    @BusinessUnitId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        sm.id AS id,
        sm.businessunitid,
        sm.businessunit AS businessunit,
        sm.team AS team,
        sm.roleid AS roleid,
        sm.role AS role,
        sm.u_krewer_email AS u_krewer_email
    FROM dbo.stakeholder_mapping AS sm
    INNER JOIN dbo.rolemapping AS rm
        ON rm.id = sm.roleid
    WHERE sm.businessunitid = @BusinessUnitId
      AND sm.isactive = 1
      AND rm.roletype = 1
      AND rm.isactive = 1;
END;
GO

-- Example usage:
-- EXEC dbo.GetUseCaseStakeholders @BusinessUnitId = 123;
