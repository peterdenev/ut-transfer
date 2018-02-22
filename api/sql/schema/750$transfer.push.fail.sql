ALTER PROCEDURE [transfer].[push.fail] --this sp will trigger event for pending transaction fail approval request
    @transferId BIGINT, -- the id of the transfer
    @type VARCHAR(50) = 'transfer.fail',
    @message VARCHAR(250) = 'Approval failed' -- message type

AS

EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'fail',
    @source = 'issuer',
    @message = @message,
    @udfDetails = NULL
