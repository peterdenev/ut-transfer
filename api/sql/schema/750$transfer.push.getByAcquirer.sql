ALTER PROCEDURE [transfer].[push.getByAcquirer]
    @acquirerCode varchar(50),
    @transferIdAcquirer varchar(20),
    @cardId bigint,
    @localDateTime varchar(14)
AS
    SELECT TOP 1
        '430' mti,
        'reverse' operation,
        pi.port issuerPort,
        pl.port ledgerPort,
        t.cardId,
        'push' transferType,
        t.transferAmount,
        t.transferCurrency,
        t.localDateTime,
        t.settlementDate issuerSettlementDate,
        t.merchantType,
        e.udfDetails udfAcquirer,
        t.transferId,
        t.transferIdAcquirer,
        t.sourceAccount,
        t.destinationAccount,
        t.reversed
    FROM
        [transfer].[transfer] t
    JOIN
        [transfer].[partner] pi on pi.partnerId = t.issuerId
    LEFT JOIN
        [transfer].[partner] pl on pl.partnerId = t.ledgerId
    LEFT JOIN
        [transfer].[event] e ON e.transferId = t.transferId AND e.source = 'acquirer' AND e.type = 'transfer.push'
    WHERE
        t.transferIdAcquirer = @transferIdAcquirer AND
        t.cardId = @cardId AND
        t.localDateTime LIKE '%' + @localDateTime AND
        t.acquirerCode = @acquirerCode
-- todo add time restriction
