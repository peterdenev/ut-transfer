ALTER PROCEDURE [transfer].[push.failAdjustment]
    @transferId BIGINT,
    @type VARCHAR(50),
    @message VARCHAR(250),
    @source VARCHAR(50),
    @details XML
AS
SET NOCOUNT ON

EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'failAdjustment',
    @source = @source,
    @message = @message,
    @udfDetails = @details
