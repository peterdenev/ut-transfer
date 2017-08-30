CREATE PROCEDURE [transfer].[pendingTransferExpired.fetch]-- fetch expired initiated pendingTransfer
AS

SET NOCOUNT ON
    DECLARE @result TABLE(
        pendingId bigint NULL,
        transferId bigint NULL,
        transferAmount money NULL,
        transferIdIssuer varchar(50) NULL,
        transferDateTime datetime NULL,
        reversalAttempts int NULL,
        senderPhoneNumber varchar(50) NULL,
        recipientPhoneNumber varchar(50) NULL
    )

    --Fetch only account to nonaccount transfers
    SELECT 'pendingTransferExpired' as resultSetName

    SELECT p.pendingId, t.transferId, t.transferAmount, t.transferIdIssuer, t.transferDateTime, p.reversalAttempts
    FROM [transfer].pending p
    JOIN [transfer].[transfer] t ON t.transferId = p.firstTransferId
    JOIN core.itemName i ON i.itemNameId = t.transferTypeId
    WHERE p.secondTransferId IS NULL AND customerNumber IS NOT NULL
    AND t.reversed=0
    AND p.expireTime < getdate()
    AND p.reversalAttempts <3
    AND i.itemCode = 'transferOtp'

    --Fetch cash option only
    UPDATE p SET
        p.reversalAttempts = 1
    OUTPUT INSERTED.pendingId, INSERTED.reversalAttempts, INSERTED.senderPhoneNumber, INSERTED.recipientPhoneNumber, t.transferId, t.transferAmount, t.transferIdIssuer, t.transferDateTime INTO @result(pendingId, reversalAttempts, senderPhoneNumber, recipientPhoneNumber, transferid, transferAmount, transferIdIssuer, transferDateTime)
    FROM [transfer].pending p
    JOIN [transfer].[transfer] t ON t.transferId = p.firstTransferId
    JOIN core.itemName i ON i.itemNameId = t.transferTypeId
    WHERE p.secondTransferId IS NULL AND customerNumber IS NULL
    AND p.expireTime < getdate()
    AND p.reversalAttempts = 0
    AND i.itemCode = 'transferOtpCash'

    SELECT 'pendingTransferCashExpired' as resultSetName
    SELECT * FROM @result





