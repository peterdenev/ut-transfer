ALTER PROCEDURE [transfer].[push.cancel] --this SP will trigger event for pending transaction cancel request
    @transferId bigint, -- the id of the transfer to be canceled
    @message varchar(250) = 'Cancel created', -- message type
    @meta core.metaDataTT READONLY -- the id of the user performing the operation
AS

 -- checks if the user has a right to make the operation
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
IF @return != 0
BEGIN
    RETURN 55555
END

EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = 'transfer.cancel',
    @state = 'request',
    @source = 'issuer',
    @message = @message,
    @udfDetails = NULL