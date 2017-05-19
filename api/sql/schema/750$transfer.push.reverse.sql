ALTER PROCEDURE [transfer].[push.reverse]
    @transferId bigint,
    @message varchar(250) = 'Reverse created', 
    @udfAcquirer XML
AS

EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = 'transfer.reverse',
    @state = 'request',
    @source = 'acquirer',
    @message = @message,
    @udfDetails = @udfAcquirer
