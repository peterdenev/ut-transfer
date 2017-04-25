ALTER PROCEDURE [transfer].[pendingTransfer.update] -- update status of pending transfer
    @pendingId INT, -- unique id of pending transaction
    @secondTransferId BIGINT, -- second transfer Id
    @status INT, -- status of pending transfer
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
SET NOCOUNT ON

    DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
    DECLARE @actionID VARCHAR(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return INT = 0
    EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = NULL, @meta = @meta
    IF @return != 0
    BEGIN
        RETURN 55555
    END

    UPDATE
        [transfer].[pending]
    SET
        secondTransferId = @secondTransferId,
        attempts = attempts + 1,
        [status] = [status]
    WHERE
        pendingId = @pendingId

