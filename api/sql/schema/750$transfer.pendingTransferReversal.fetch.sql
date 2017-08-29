CREATE PROCEDURE [transfer].[pendingTransferReversal.fetch]-- fetch initiated pendingTransfer for reversal
    @transactionRrn VARCHAR(50), -- amount of initiated pending transfer
    @senderPhoneNumber VARCHAR(50), -- phone number of the sender
    @securityCode VARCHAR(50), -- generated token
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

    SELECT 'pendingTransfer' as resultSetName

    SELECT p.pendingId, t.transferAmount, p.reversalAttempts
    FROM [transfer].pending p
    JOIN [transfer].[transfer] t ON t.transferId = p.firstTransferId
    WHERE p.senderPhoneNumber = @senderPhoneNumber
    AND p.securityCode = @securityCode
    AND t.transferIdIssuer = @transactionRrn
    AND p.secondTransferId IS NULL
    AND p.customerNumber IS NULL
    AND t.reversed = 0
    AND p.expireTime < GETDATE()