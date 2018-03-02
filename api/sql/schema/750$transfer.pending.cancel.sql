ALTER PROCEDURE [transfer].[pending.cancel] -- this sp is used to cancel opened pending transaction
    @transferId BIGINT, -- id of the transaction
    @message VARCHAR(250) = NULL, -- message
    @reasonId BIGINT = NULL, -- cancel reason id
    @meta core.metaDataTT READONLY -- information FOR the user that makes the operation
AS
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

-- checks if the user has a right to make the operation
DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @RETURN INT = 0
EXEC @RETURN = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
IF @RETURN != 0
BEGIN
    RETURN 55555
END

DECLARE @type VARCHAR(50) = 'transfer.pending.cancel'
SET @message = ISNULL(@message, 'transferPendingCancel')

UPDATE
    tp
SET
    [status] = 5,
    [reasonId] = @reasonId,
    [description] = @message,
    [updatedBy] = @userId,
    [updatedOn] = GETDATE()
FROM
    [transfer].[pending] tp
JOIN
    [transfer].[transfer] t ON t.transferId = tp.pullTransactionId
WHERE
    tp.pullTransactionId = @transferId AND
    t.channelId = @userId AND
    [status] = 1

IF @@ROWCOUNT = 0
BEGIN
    RAISERROR ('transfer.cancelFailure', 16, 1)
END ELSE BEGIN
    EXEC [transfer].[push.event]
        @transferId = @transferId,
        @type = @type,
        @state = 'success',
        @source = 'acquirer',
        @message = @message,
        @udfDetails = NULL
END
