ALTER PROCEDURE [transfer].[pendingUserTransfers.fetch] -- this sp fetches the open push requests of the user
    @userAvailableAccounts core.arrayList READONLY, -- available accounts for the user maiking the operation
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

-- checks if the user has a right to make the operation
DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @RETURN INT = 0
EXEC @RETURN = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
IF @RETURN != 0
BEGIN
    RETURN 55555
END

SELECT 'pushTransactions' AS resultSetName
SELECT
    t.*,
    cin.itemCode
FROM
    [transfer].[transfer] t
JOIN
    [transfer].pending tp ON tp.[pullTransactionId] = t.[transferId]
JOIN
    @userAvailableAccounts an ON an.[value] = tp.[approvalAccountNumber]
JOIN
    core.itemName cin ON cin.itemNameId = t.transferTypeId
WHERE
    tp.[status] = 1

SELECT 'pullTransactions' AS resultSetName
SELECT
    t.*,
    cin.itemCode
FROM
    [transfer].[transfer] t
JOIN
    [transfer].pending tp ON tp.[pullTransactionId] = t.[transferId]
JOIN
    core.itemName cin ON cin.itemNameId = t.transferTypeId
WHERE
    t.channelId = @userId AND
    tp.[status] = 1
