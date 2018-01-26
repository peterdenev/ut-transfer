ALTER PROCEDURE [transfer].[push.failAdjustment]
    @transferId bigint,
    @type varchar(50),
    @message varchar(250),
    @source varchar(50),
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
