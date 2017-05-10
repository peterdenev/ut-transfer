CREATE PROCEDURE [transfer].[pendingTransferExpired.fetch]-- fetch expired initiated pendingTransfer 
AS

SET NOCOUNT ON

    SELECT 'pendingTransferExpired' as resultSetName

    SELECT p.pendingId, t.transferId, t.transferAmount, t.transferIdIssuer, t.transferDateTime, p.reversalAttempts
    FROM [transfer].pending p
    JOIN [transfer].[transfer] t ON t.transferId = p.firstTransferId
    JOIN core.itemName i ON i.itemNameId = t.transferTypeId 
    WHERE p.secondTransferId IS NULL
    AND t.reversed=0 
    AND p.expireTime < getdate()
    AND p.reversalAttempts <3
    AND i.itemCode = 'transferOtp'