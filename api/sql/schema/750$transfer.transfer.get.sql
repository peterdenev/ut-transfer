ALTER PROCEDURE [transfer].[transfer.get]
    @transferIdAcquirer NVARCHAR (50) = NULL, -- the acquirer transfer id
    @transferId BIGINT = NULL, -- the transfer id
    @acquirerCode VARCHAR(50) = NULL, -- acquirer code
    @cardId BIGINT = NULL, -- card Id
    @localDateTime VARCHAR(14) = NULL, -- local datetime of the transaction
    @retrievalReferenceNumber VARCHAR(12) = NULL,
    @transferIdIssuer VARCHAR(50) = NULL,
    @issuerId VARCHAR(50) = NULL,
    @pan VARCHAR(32) = NULL,
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

AS

    -- checks if the user has a right to make the operation
DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @RETURN INT = 0
EXEC @RETURN = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
IF @RETURN != 0
BEGIN
    RETURN 55555
END

IF (ISNULL(@transferID, 0) = 0 AND ISNULL(@transferIdAcquirer, '') = '')
BEGIN
    RAISERROR('transfer.missingParameter', 16, 1);
    RETURN 55555
END

DECLARE @transfer AS TABLE (
    transferId BIGINT, transferTypeId BIGINT, acquirerCode VARCHAR(50), transferIdAcquirer VARCHAR(50), transferIdLedger VARCHAR(50),
    transferIdIssuer VARCHAR(50), transferIdMerchant VARCHAR(50), transferDateTime DATETIME, localDateTime VARCHAR(14), issuerSettlementDate DATE, channelId BIGINT,
    channelType VARCHAR(50), ordererId BIGINT, merchantId VARCHAR(50), merchantInvoice VARCHAR(50), merchantPort VARCHAR(50), merchantType VARCHAR(50),
    cardId BIGINT, sourceAccount VARCHAR(50), destinationAccount VARCHAR(50), expireTime datetime, expireCount INT, expireCountLedger INT, reversed BIT, reversedLedger BIT, reverseIssuer BIT, reverseLedger BIT, retryTime DATETIME,
    retryCount INT, ledgerTxState SMALLINT, issuerTxState SMALLINT, acquirerTxState SMALLINT, merchantTxState SMALLINT, issuerId VARCHAR(50), ledgerId VARCHAR(50),
    transferCurrency VARCHAR(3), transferAmount MONEY, acquirerFee MONEY, issuerFee MONEY, transferFee MONEY, processorFee MONey, [description] VARCHAR(250), issuerPort VARCHAR(50),
    ledgerPort VARCHAR(50), udfAcquirer XML, acquirerError XML, pendingId INT, pullTransactionId BIGINT, pushTransactionId BIGINT, pendingExpireTime DATETIME, params NVARCHAR(max)
)

-- get by pull transaction id
INSERT INTO
    @transfer
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
    t.expireCountLedger,
    t.reversed,
    t.reversedLedger,
    t.reversed ^ 1 AS reverseIssuer,
    CASE WHEN t.reversedLedger = 0 AND t.issuerId != t.ledgerId THEN 1 ELSE 0 END AS reverseLedger,
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
    t.processorFee,
    t.[description],
    pi.port,
    pl.port,
    e.udfDetails,
    er.udfDetails,
    tp.pendingId,
    tp.pullTransactionId,
    tp.pushTransactionId,
    tp.expireTime,
    tp.params
FROM
    [transfer].[transfer] t
JOIN
    [transfer].[partner] pi ON pi.partnerId = t.issuerId
LEFT JOIN
    [transfer].[partner] pl ON pl.partnerId = t.ledgerId
LEFT JOIN
    [transfer].[event] e ON e.transferId = t.transferId AND e.source = 'acquirer' AND e.type = 'transfer.push'
LEFT JOIN
    [transfer].[pending] tp ON tp.pullTransactionId = t.transferId
OUTER APPLY (
    SELECT TOP 1
        udfDetails
    FROM
        [transfer].[event]
    WHERE
        transferId = t.transferId AND source = 'acquirer' AND state = 'fail'
    ORDER BY
        eventDateTime DESC
) AS er
WHERE
    (@transferId IS NULL OR t.[transferId] = @transferId) AND
    (@transferIdAcquirer IS NULL OR t.[transferIdAcquirer] = @transferIdAcquirer) AND
    (@transferIdIssuer IS NULL OR t.[transferIdIssuer] = @transferIdIssuer) AND
    (@issuerId IS NULL OR t.[issuerId] = @issuerId) AND
    (@cardId IS NULL OR t.cardId = @cardId) AND
    (@localDateTime IS NULL OR t.localDateTime LIKE '%' + @localDateTime) AND
    (@acquirerCode IS NULL OR t.acquirerCode = @acquirerCode) AND
    (@retrievalReferenceNumber IS NULL OR t.retrievalReferenceNumber = @retrievalReferenceNumber) AND
    (@pan IS NULL OR e.[udfDetails].value('(/root/pan)[1]', 'VARCHAR(32)') = @pan) AND
    pullTransactionId IS NOT NULL
ORDER BY
    t.transferDateTime DESC

IF @@ROWCOUNT = 0 -- get by push transaction id
BEGIN
    INSERT INTO @transfer
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
        t.expireCountLedger,
        t.reversed,
        t.reversedLedger,
        t.reversed ^ 1 AS reverseIssuer,
        CASE WHEN t.reversedLedger = 0 AND t.issuerId != t.ledgerId THEN 1 ELSE 0 END AS reverseLedger,
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
        t.processorFee,
        t.[description],
        pi.port,
        pl.port,
        e.udfDetails,
        er.udfDetails,
        tp.pendingId,
        tp.pullTransactionId,
        tp.pushTransactionId,
        tp.expireTime,
        tp.params
    FROM
        [transfer].[transfer] t
    JOIN
        [transfer].[partner] pi ON pi.partnerId = t.issuerId
    LEFT JOIN
        [transfer].[partner] pl ON pl.partnerId = t.ledgerId
    LEFT JOIN
        [transfer].[event] e ON e.transferId = t.transferId AND e.source = 'acquirer' AND e.type = 'transfer.push'
    LEFT JOIN
        [transfer].[pending] tp ON tp.pushTransactionId = t.transferId
    OUTER APPLY (
        SELECT TOP 1
            udfDetails
        FROM
            [transfer].[event]
        WHERE
            transferId = t.transferId AND source = 'acquirer' AND state = 'fail'
        ORDER BY
            eventDateTime DESC
    ) AS er
    WHERE
        (@transferId IS NULL OR t.[transferId] = @transferId) AND
        (@transferIdAcquirer IS NULL OR t.[transferIdAcquirer] = @transferIdAcquirer) AND
        (@transferIdIssuer IS NULL OR t.[transferIdIssuer] = @transferIdIssuer) AND
        (@issuerId IS NULL OR t.[issuerId] = @issuerId) AND
        (@cardId IS NULL OR t.cardId = @cardId) AND
        (@localDateTime IS NULL OR t.localDateTime LIKE '%' + @localDateTime) AND
        (@acquirerCode IS NULL OR t.acquirerCode = @acquirerCode) AND
        (@retrievalReferenceNumber IS NULL OR t.retrievalReferenceNumber = @retrievalReferenceNumber) AND
        (@pan IS NULL OR e.[udfDetails].value('(/root/pan)[1]', 'VARCHAR(32)') = @pan)
    ORDER BY
        t.transferDateTime DESC
END

SELECT 'transfer' AS resultSetName
SELECT
    transferId,
    transferTypeId,
    cin.itemCode,
    acquirerCode,
    transferIdAcquirer,
    transferIdLedger ,
    transferIdIssuer,
    transferIdMerchant,
    transferDateTime,
    localDateTime,
    issuerSettlementDate,
    channelId,
    channelType,
    ordererId,
    merchantId,
    merchantInvoice,
    merchantPort,
    merchantType,
    cardId,
    sourceAccount,
    destinationAccount,
    expireTime,
    expireCount,
    expireCountLedger,
    reversed,
    reversedLedger,
    reverseLedger adjustLedger,
    reverseIssuer,
    reverseIssuer adjustIssuer,
    reverseLedger,
    retryTime,
    retryCount,
    ledgerTxState,
    issuerTxState,
    acquirerTxState,
    merchantTxState,
    issuerId,
    ledgerId,
    transferCurrency,
    transferAmount,
    acquirerFee,
    issuerFee,
    transferFee,
    processorFee,
    [description],
    issuerPort,
    ledgerPort,
    udfAcquirer,
    acquirerError
FROM
    @transfer t
JOIN
    core.itemName cin ON cin.itemNameId = t.transferTypeId

SELECT 'transferSplit' AS resultSetName
SELECT
    ts.splitId,
    ts.transferId,
    ts.conditionId,
    ts.splitNameId,
    ts.debit,
    ts.credit,
    ts.amount,
    ts.[description],
    ts.tag,
    ts.debitActorId,
    ts.creditActorId,
    ts.debitItemId,
    ts.creditItemId,
    ts.[state],
    ts.[transferIdPayment]
FROM
    [transfer].[split] ts
JOIN
    @transfer t ON ts.transferId = t.transferId

SELECT 'transferPending' AS resultSetName
SELECT
    pendingId,
    pullTransactionId,
    pushTransactionId, expireTime, params
FROM @transfer
