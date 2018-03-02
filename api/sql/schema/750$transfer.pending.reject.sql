ALTER PROCEDURE [transfer].[pending.reject] -- this SP fetches the open pull requests of the user
    @transferId BIGINT, -- id of the TRANSACTION
    @userAvailableAccounts core.arrayList READONLY, -- available accounts FOR the user maiking the operation
    @message VARCHAR(250) = NULL, -- message
    @reasonId BIGINT = NULL, -- reject reason id
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

DECLARE @type VARCHAR(50) = 'transfer.pending.reject'
SET @message = ISNULL (@message, 'transferPendingReject')

UPDATE
    tp
SET
    [status] = 3,
    [reasonId] = @reasonId,
    [description] = @message,
    [updatedBy] = @userId,
    [updatedOn] = GETDATE()
FROM
    [transfer].[pending] tp
JOIN
    @userAvailableAccounts uaa ON uaa.[value] = tp.approvalAccountNumber
WHERE
    tp.pullTransactionId = @transferId AND
    pushTransactionId IS NULL AND
    [status] = 1

IF @@ROWCOUNT = 0
BEGIN
    RAISERROR ('transfer.rejectFailure', 16, 1)
END ELSE BEGIN
    EXEC [transfer].[push.event]
        @transferId = @transferId,
        @type = @type,
        @state = 'success',
        @source = 'issuer',
        @message = @message,
        @udfDetails = NULL
END
