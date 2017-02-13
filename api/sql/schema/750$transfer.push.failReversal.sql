ALTER PROCEDURE [transfer].[push.failReversal]
    @transferId bigint,
    @type varchar(50),
    @message varchar(250),
    @details XML
AS
SET NOCOUNT ON

EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'failReversal',
    @source = 'issuer',
    @message = @message,
    @udfDetails = @details
