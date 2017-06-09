ALTER PROCEDURE [transfer].[pending.reject] -- this SP fetches the open pull requests of the user
    @transferId BIGINT, -- id of the transaction
    @userAvailableAccounts core.arrayList READONLY, -- available accounts for the user maiking the operation
    @message varchar(250) = NULL, -- message
    @reasonId BIGINT = NULL, -- reject reason id
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

-- checks if the user has a right to make the operation
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = NULL, @meta = @meta
IF @return != 0
BEGIN
    RETURN 55555
END

DECLARE @type varchar(50) = 'transfer.pending.reject'
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