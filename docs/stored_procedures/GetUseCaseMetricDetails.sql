CREATE   PROCEDURE dbo.GetUseCaseMetricsDetails
    @UseCaseId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1) Metrics for the use case
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
    ORDER BY m.id;

    -- 2) Reported metric values for the same use case
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
    ORDER BY mr.metricid, mr.reporteddate, mr.id;
END;