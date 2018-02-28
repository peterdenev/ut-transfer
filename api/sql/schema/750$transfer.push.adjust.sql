CREATE PROCEDURE [transfer].[push.adjust]
    @transferId BIGINT,
    @message VARCHAR(250) = 'Adjust started',
    @udfAcquirer XML,
    @meta core.metaDataTT READONLY
AS

-- checks if the user has a right to make the operation
--DECLARE @actionID VARCHAR(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @RETURN INT = 0
--EXEC @RETURN = [user].[permission.check] @actionId =  @actionID, @objectId = NULL, @meta = @meta
--IF @RETURN != 0
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

