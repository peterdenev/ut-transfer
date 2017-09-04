ALTER PROCEDURE [transfer].[push.getByAcquirer]
    @acquirerCode varchar(50),
    @transferIdAcquirer varchar(20),
    @settlementDate varchar(14),
    @localDateTime varchar(14),
    @udfAcquirer XML
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
        t.reversed = 0 AND
        t.settlementDate = CAST(CAST(DATEPART(YEAR, GETDATE()) AS CHAR(4)) + '0802' AS DATETIME) AND
        t.localDateTime LIKE '%' + @localDateTime AND
        t.acquirerCode = @acquirerCode AND
        e.udfDetails.value('(/root/terminalId/text())[1]', 'nvarchar(8)') = @udfAcquirer.value('(/root/terminalId/text())[1]', 'nvarchar(8)')
-- todo add time restriction
