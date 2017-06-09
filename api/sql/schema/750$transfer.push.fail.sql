ALTER PROCEDURE [transfer].[push.fail] --this SP will trigger event for pending transaction fail approval request
    @transferId bigint, -- the id of the transfer
    @type varchar(50) = 'transfer.fail',
    @message varchar(250) = 'Approval failed' -- message type

AS

EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'fail',
    @source = 'issuer',
    @message = @message,
    @udfDetails = NULL