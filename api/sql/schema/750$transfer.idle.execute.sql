ALTER PROCEDURE [transfer].[idle.execute]
    @ports core.arrayList READONLY,
    @count int
AS
DECLARE @callParams XML
DECLARE @updated TABLE(
    txid bigint,
    mtid varchar(4),
    opcode varchar(20),
    reverseIssuer bit,
    reverseLedger bit
)
BEGIN TRY
    -- forward stored
    UPDATE
        [transfer].[transfer]
    SET
        expireTime = CASE
            WHEN 5>isnull(retryCount,0) THEN DATEADD(SECOND, 30, GETDATE())
            WHEN 10>retryCount THEN DATEADD(SECOND, 60, GETDATE())
            WHEN 15>retryCount THEN DATEADD(MINUTE, 30, GETDATE())
            WHEN 20>retryCount THEN DATEADD(HOUR, 1, GETDATE())
        END,
        retryCount = ISNULL(retryCount, 0) + 1,
        retryTime = GETDATE()
    OUTPUT
        INSERTED.transferId, '200', 'forward'
    INTO
        @updated(txid, mtid, opcode)
    WHERE
        transferId IN (
            SELECT TOP (@count)
                t.transferId
            FROM
                [transfer].[transfer] t
            JOIN
                [transfer].[partner] p ON p.partnerId = t.issuerId AND p.mode in ('online') AND p.port IN (SELECT value FROM @ports)
            WHERE
                t.issuerTxState IN (8, 11, 13, 14) AND
                ISNULL(t.acquirerTxState, CASE t.channelType WHEN 'POS' THEN 2 else 0 END) IN (2) AND
                t.reversed = 0 AND
                20 > ISNULL(t.retryCount,0) AND
                GETDATE() >= t.expireTime AND
                t.transferDateTime > DATEADD(DAY, -1, GETDATE()) AND
                t.channelType IN ('ATM','POS')
            ORDER
                BY t.expireTime, t.transferId
        )
    SELECT @count = @count - COUNT(*) FROM @updated
    IF @count > 0 -- reversals
    BEGIN
        UPDATE
            [transfer].[transfer]
        SET
            expireTime = CASE
                WHEN 5 > ISNULL(expireCount, 0) THEN DATEADD(SECOND, 30, GETDATE())
                WHEN 10 > expireCount THEN DATEADD(SECOND, 60, GETDATE())
                WHEN 15 > expireCount THEN DATEADD(MINUTE, 30, GETDATE())
                WHEN 20 > expireCount THEN DATEADD(HOUR, 1, GETDATE())
            END
        OUTPUT
            INSERTED.transferId, '420', 'reverse', r.reverseIssuer, r.reverseLedger
        INTO
            @updated(txid, mtid, opcode, reverseIssuer, reverseLedger)
        FROM
            [transfer].[transfer] t
        JOIN (
            SELECT TOP (@count)
                transferId, reverseIssuer, reverseLedger
            FROM
                [transfer].[sReversal]
            WHERE
                port IN (SELECT value FROM @ports) AND
                expireTime <= GETDATE() AND
                (reverseIssuer = 1 OR reverseLedger = 1)
            ORDER
                BY expireTime, transferId
        ) r ON r.transferId = t.transferId
    END

    SELECT @count = @count - COUNT(*) FROM @updated
    IF @count > 0 -- reversals of expired pending
    BEGIN
        UPDATE
            [transfer].[transfer]
        SET
            expireTime = CASE
                WHEN 5 > ISNULL(expireCount,0) THEN DATEADD(SECOND, 30, GETDATE())
                WHEN 10 > expireCount THEN DATEADD(SECOND, 60, GETDATE())
                WHEN 15 > expireCount THEN DATEADD(MINUTE, 30, GETDATE())
                WHEN 20 > expireCount THEN DATEADD(HOUR, 1, GETDATE())
            END
        OUTPUT
            INSERTED.transferId, '420', 'reverse'
        INTO
            @updated(txid, mtid, opcode)
        WHERE
            issuerTxState IN (2, 12) AND
            reversed = 0 AND
            20 > isnull(expireCount, 0) AND
            GETDATE() >= expireTime AND
            transferId IN (
                SELECT TOP (@count)
                    d.transferId
                FROM
                    [transfer].[pending] cc
                JOIN
                    [transfer].[transfer] d ON d.transferId = cc.pullTransactionId
                JOIN
                    [transfer].[partner] p ON p.partnerId = d.issuerId AND p.port IN (SELECT value FROM @ports)
                WHERE
                    cc.status IS NULL
                    AND cc.expireTime < GETDATE()
                    AND d.issuerTxState IN (2,12)
                    AND d.reversed = 0
                    AND 20 > ISNULL(d.expireCount, 0)
                    AND GETDATE() >= d.expireTime
                    AND d.channelType IN ('ATM')
                ORDER BY
                    d.expireTime, d.transferId
            )
    END

    SELECT @count = COUNT(*) FROM @updated
    IF @count <= 0
    BEGIN
        SELECT 0 result WHERE 1 = 2
    END ELSE
    BEGIN
        SELECT 'transferInfo' AS resultSetName

        SELECT
            u.mtid mti,
            u.opcode operation,
            ip.port issuerPort,
            lp.port ledgerPort,
            t.cardId,
            'push' transferType,
            t.issuerSerialNumber,
            t.transferAmount,
            t.transferFee,
            t.acquirerFee,
            t.issuerFee,
            t.processorFee,
            t.transferCurrency,
            t.localDateTime,
            t.settlementDate issuerSettlementDate,
            t.merchantType,
            e.udfDetails udfAcquirer,
            er.udfDetails acquirerError,
            er.type acquirerErrorType,
            t.transferId,
            t.transferIdAcquirer,
            t.sourceAccount,
            t.destinationAccount,
            t.channelType,
            cin.itemCode,
            t.retrievalReferenceNumber,
            t.reversed,
            t.reversedLedger,
            u.reverseIssuer,
            u.reverseLedger,
            t.issuerId,
            t.ledgerId,
            issuerError.udfDetails issuerError,
            issuerError.type issuerErrorType
        FROM
            @updated u
        JOIN
            [transfer].[transfer] t ON t.transferId = u.txid
        JOIN
            core.itemName cin ON cin.itemNameId = t.transferTypeId
        LEFT JOIN
            [transfer].[event] e ON e.transferId = t.transferId AND e.source = 'acquirer' AND e.type = 'transfer.push'
        LEFT JOIN
            [transfer].[partner] lp ON lp.partnerId = t.ledgerId
        LEFT JOIN
            [transfer].[partner] ip ON ip.partnerId = t.issuerId
        OUTER APPLY (
            SELECT TOP 1
                udfDetails, [type]
            FROM
                [transfer].[event]
            WHERE
                transferId = t.transferId AND source = 'acquirer' AND state = 'fail'
            ORDER BY
                eventDateTime DESC
        ) AS er
        OUTER APPLY (
            SELECT TOP 1
                udfDetails, [type]
            FROM
                [transfer].[event]
            WHERE
                transferId = t.transferId AND source = 'issuer' AND state = 'unknown'
            ORDER BY
                eventDateTime DESC
        ) issuerError
        ORDER BY
            e.eventDateTime, e.eventId

        SELECT 'split' AS resultSetName

        SELECT
            splitId,
            transferId,
            conditionId,
            splitNameId,
            debit,
            credit,
            amount,
            [description],
            tag,
            debitActorId,
            creditActorId,
            debitItemId,
            creditItemId,
            [state],
            transferIdPayment
        FROM
            @updated u
        JOIN
            [transfer].[split] s ON s.transferId = u.txid
    END

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
    EXEC core.error
    RETURN 55555
END CATCH
