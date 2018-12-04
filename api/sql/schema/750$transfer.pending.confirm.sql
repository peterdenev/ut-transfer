ALTER PROCEDURE [transfer].[pending.confirm] -- this SP fetches the open pull requests of the user
    @transferId BIGINT, -- id of the TRANSACTION
    @userAvailableAccounts core.arrayList READONLY, -- available accounts FOR the user maiking the operation
    @message VARCHAR(250) = NULL, -- message
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

DECLARE @type VARCHAR(50) = 'transfer.pending.confirm'
SET @message = ISNULL (@message, 'transferPendingConfirm')

UPDATE
    tp
SET
    [status] = 2,
    [description] = @message,
    [updatedBy] = @userId,
    [updatedOn] = GETDATE()
FROM
    [transfer].[transfer] t
JOIN
    [transfer].[pending] tp ON tp.pullTransactionId = t.transferId
JOIN
    @userAvailableAccounts uaa ON uaa.[value] = tp.approvalAccountNumber
WHERE
    t.transferId = @transferId AND
    pushTransactionId IS NULL AND
    [status] = 1 AND
    issuerTxState IS NULL

IF @@ROWCOUNT = 0
BEGIN
    RAISERROR ('transfer.confirmFailure', 16, 1)
END
ELSE
BEGIN
    EXEC [transfer].[push.event]
        @transferId = @transferId,
        @type = @type,
        @state = 'success',
        @source = 'issuer',
        @message = @message,
        @udfDetails = NULL
END
