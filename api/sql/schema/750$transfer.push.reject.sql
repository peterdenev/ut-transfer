ALTER PROCEDURE [transfer].[push.reject] --this sp will trigger event for pending transaction reject request
    @transferId BIGINT, -- the id of the transfer to be rejected
    @message VARCHAR(250) = 'Reject created', -- message type
    @meta core.metaDataTT READONLY -- the id of the user performing the operation
AS

-- checks if the user has a right to make the operation
DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @RETURN INT = 0
EXEC @RETURN = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
IF @RETURN != 0
BEGIN
    RETURN 55555
END

EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = 'transfer.reject',
    @state = 'request',
    @source = 'acquirer',
    @message = @message,
    @udfDetails = NULL
