ALTER PROCEDURE [transfer].[transfer.get]
    @transferIdAcquirer NVARCHAR (50) = NULL, -- the front end transfer id
    @transferId BIGINT = NULL, -- the transfer id
    @acquirerCode varchar(50) = NULL, -- acquirer code
    @cardId bigint = NULL, -- card Id
    @localDateTime varchar(14) = NULL, -- local datetime of the transaction
    @getReversedSum BIT = 0
AS

declare @incrementalAmountSum money = 0, @reversedSum money = 0;
 
SELECT @transferId = transferId FROM [transfer].[transfer] WHERE [transferIdAcquirer] = @transferIdAcquirer

IF @getReversedSum = 1
BEGIN
    SELECT @reversedSum = SUM(ISNULL(r.reverseAmount, 0))
    FROM [transfer].[reverse] r
    WHERE r.transferId = @transferId
        AND (r.issuerTxState IS NULL 
            OR r.issuerTxState = 1
            OR r.issuerTxState = 2
        )
END
SET @incrementalAmountSum= (SELECT ISNULL(SUM(it.transferAmount), 0)
						  FROM [transfer].[transfer] it
						  WHERE it.originalTransferId = @transferId
					   )
SELECT 'transfer' AS resultSetName
SELECT TOP 1
    t.transferId,
    t.transferTypeId,
    t.acquirerCode,
    t.transferIdAcquirer,
    t.transferIdLedger,
    t.transferIdIssuer,
    t.transferIdMerchant,
    t.transferDateTime,
    t.localDateTime,
    t.settlementDate,
    t.channelId,
    t.channelType,
    t.ordererId,
    t.merchantId,
    t.merchantInvoice,
    t.merchantPort,
    t.merchantType,
    t.cardId,
    t.sourceAccount,
    t.destinationAccount,
    t.expireTime,
    t.expireCount,
    t.reversed,
    t.retryTime,
    t.retryCount,
    t.ledgerTxState,
    t.issuerTxState,
    t.acquirerTxState,
    t.merchantTxState,
    t.issuerId,
    t.ledgerId,
    t.transferCurrency,
    t.transferAmount,
    t.acquirerFee,
    t.issuerFee,
    t.transferFee,
    t.[description],
    t.issuerResponseCode,
    t.issuerResponseMessage,
    t.networkData,
    t.originalRequest,
    t.originalResponse,
    t.stan,
    t.transactionCategoryCode,
    t.originalTransferId,
    t.isPreauthorization,
    @incrementalAmountSum as incrementalAmountSum
    , t.cleared
    , t.clearingStatusId
    , @reversedSum as reversedSum
FROM
    [transfer].[transfer] t
WHERE    
    t.[transferId] = @transferId    
--ORDER BY
--    t.transferDateTime DESC

