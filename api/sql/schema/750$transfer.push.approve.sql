CREATE PROCEDURE [transfer].[push.approve] --this sp will trigger event for pending transaction approval request
    @transferId BIGINT, -- the id of the transfer to be approved
    @message VARCHAR(250) = 'Approval created', -- message type
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
    @type = 'transfer.approve',
    @state = 'request',
    @source = 'issuer',
    @message = @message,
    @udfDetails = NULL
