ALTER PROCEDURE [transfer].[transfer.get]
    @transferIdAcquirer NVARCHAR (50) = NULL,
    @transferId BIGINT = NULL, -- the transfer id
    @acquirerCode varchar(50) = NULL, -- acquirer code
    @cardId bigint = NULL, -- card Id
    @localDateTime varchar(14) = NULL
AS

declare @incrementalAmountSum money = 0, @reversedSum money = 0;
 
SELECT @transferId = transferId FROM [transfer].[transfer] WHERE [transferIdAcquirer] = @transferIdAcquirer

SELECT @reversedSum = SUM(ISNULL(r.reverseAmount, 0))
    FROM [transfer].[reverse] r
    WHERE r.transferId = @transferId
        AND (r.issuerTxState IS NULL 
            OR r.issuerTxState = 1
            OR r.issuerTxState = 2
        )
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
    t.processingCode,
    t.posEntryMode,
    t.posData,
    t.originalTransferId,
    t.isPreauthorization,
    t.clearingStatusId,
    @incrementalAmountSum as incrementalAmountSum
    , t.cleared
    , @reversedSum as reversedSum
FROM
    [transfer].[transfer] t
WHERE    
    t.[transferId] = @transferId    
--ORDER BY
--    t.transferDateTime DESC

