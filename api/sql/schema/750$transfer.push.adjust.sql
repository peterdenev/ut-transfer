CREATE PROCEDURE [transfer].[push.adjust]
    @transferId bigint,
    @message varchar(250) = 'Adjust started',
    @udfAcquirer XML,
    @meta core.metaDataTT READONLY
AS

-- checks if the user has a right to make the operation
--DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
--EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
--IF @return != 0
--BEGIN
--    RETURN 55555
--END

EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = 'transfer.adjust',
    @state = 'request',
    @source = 'acquirer',
    @message = @message,
    @udfDetails = @udfAcquirer

