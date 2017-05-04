CREATE PROCEDURE [transfer].[pendingTransferExpired.fetch]-- fetch expired initiated pendingTransfer 
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

    SELECT 'pendingTransferExpired' as resultSetName

    SELECT p.pendingId, t.transferId, t.transferAmount, t.transferIdIssuer, t.transferDateTime, p.reversalAttempts
    FROM [transfer].pending p
    JOIN [transfer].[transfer] t ON t.transferId = p.firstTransferId
    WHERE p.secondTransferId IS NULL
    AND t.reversed=0 
    AND p.expireTime < getdate()
    AND p.reversalAttempts <3