ALTER PROCEDURE [transfer].[idle.execute]
    @destinationPort varchar(50)
AS
DECLARE @callParams XML
DECLARE
    @txid bigint = NULL,
    @mtid varchar(4),
    @opcode varchar(20)
BEGIN TRY

    UPDATE
        [transfer].[transfer]
    SET
        expireTime = CASE
            WHEN 5>isnull(retryCount,0) THEN DATEADD(SECOND, 30, GETDATE())
            WHEN 10>retryCount THEN DATEADD(SECOND, 60, GETDATE())
            WHEN 15>retryCount THEN DATEADD(MINUTE, 30, GETDATE())
            WHEN 20>retryCount THEN DATEADD(HOUR, 1, GETDATE())
        END,
        @txid = transferId,
        retryCount = ISNULL(retryCount, 0) + 1,
        retryTime = GETDATE(),
        @mtid = '200',
        @opcode = 'forward'
    WHERE
        transferId IN (
            SELECT TOP 1
                t.transferId
            FROM
                [transfer].[transfer] t
            JOIN
                [transfer].[partner] p ON p.partnerId = t.destinationId AND p.mode in ('online') AND p.port = @destinationPort
            WHERE
                t.issuerTxState IN (8, 11, 13, 14) AND
                ISNULL(t.acquirerTxState, CASE t.channelType WHEN 'POS' THEN 2 else 0 END) IN (2) AND
                t.reversed = 0 AND
                20 > ISNULL(t.retryCount,0) AND
                GETDATE() >= t.expireTime AND
                DATEADD(DAY, 1, t.transferDateTime) > GETDATE() AND
                t.channelType IN ('ATM','POS')
            ORDER
                BY t.expireTime, t.transferId
        )

    IF @txid IS NULL -- reversals
    BEGIN
        UPDATE
            [transfer].[transfer]
        SET
            expireTime = CASE
                WHEN 5 > ISNULL(expireCount, 0) THEN DATEADD(SECOND, 30, GETDATE())
                WHEN 10 > expireCount THEN DATEADD(SECOND, 60, GETDATE())
                WHEN 15 > expireCount THEN DATEADD(MINUTE, 30, GETDATE())
                WHEN 20 > expireCount THEN DATEADD(HOUR, 1, GETDATE())
            END,
            @txid = transferId,
            expireCount = ISNULL(expireCount, 0) + 1,
            @mtid = '420',
            @opcode = 'reverse'
        WHERE
            transferId IN (
                SELECT TOP 1
                    t.transferId
                FROM
                    [transfer].[transfer] t
                JOIN
                    [transfer].[partner] p ON p.partnerId = t.destinationId AND p.port = @destinationPort
                WHERE
                    (
                        (t.issuerTxState = 2 AND ISNULL(t.acquirerTxState, 0) IN (0 , 3, 4, 5) AND p.mode = 'online') OR                --tx succeeded at issuer during online but failed at acquirer and current mode is online
                        (t.issuerTxState = 8 AND ISNULL(t.acquirerTxState, 0) IN (0 , 3, 4, 5) AND p.mode IN ('online', 'offline')) OR --tx succeeded at issuer during offline but failed at acquirer and current mode is online/offline
                        (ISNULL(t.merchantTxState, 0) IN (1, 3)) OR                                                               --tx failed at merchant (succeeded at issuer implicitly)
                        (t.issuerTxState IN (1,4) AND p.mode = 'online') OR                                                    --tx timed out at issuer during online and current mode is online
                        (t.issuerTxState IN (7,9) AND p.mode IN ('online', 'offline'))                                        --tx timed out during offline and current mode is online/offline
                    )  AND
                    t.reversed = 0 AND
                    20 > ISNULL(t.expireCount, 0) AND
                    GETDATE() >= t.expireTime AND
                    DATEADD(DAY, 1, t.transferDateTime) > GETDATE() AND
                    t.channelType IN ('ATM')
                ORDER
                    BY t.expireTime, t.transferId
            )
    END

    IF @txid IS NULL -- reversals of expired pending
    BEGIN
        UPDATE
            [transfer].[transfer]
        SET
            expireTime = CASE
                WHEN 5 > ISNULL(expireCount,0) THEN DATEADD(SECOND, 30, GETDATE())
                WHEN 10 > expireCount THEN DATEADD(SECOND, 60, GETDATE())
                WHEN 15 > expireCount THEN DATEADD(MINUTE, 30, GETDATE())
                WHEN 20 > expireCount THEN DATEADD(HOUR, 1, GETDATE())
            END,
            @txid = transferId,
            expireCount = ISNULL(expireCount, 0) + 1,
            @mtid = '200',
            @opcode = 'reverse'
        WHERE
            issuerTxState IN (2, 12) AND
            reversed = 0 AND
            20 > isnull(expireCount, 0) AND
            GETDATE() >= expireTime AND
            transferId IN (
                SELECT TOP 1
                    d.transferId
                FROM
                    [transfer].[pending] cc
                JOIN
                    [transfer].[transfer] d ON d.transferId = cc.firstTransferId
                JOIN
                    [transfer].[partner] p ON p.partnerId = d.destinationId AND p.port = @destinationPort
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

    IF @txid IS NULL
    BEGIN
        SELECT 0 result WHERE 1 = 2
    END ELSE
    BEGIN
        SELECT TOP 1
            @mtid mti,
            @opcode operation,
            @destinationPort destinationPort,
            t.cardId,
            'push' transferType,
            -- CASE
            --     WHEN channelType='ISO' THEN STAN
            --     ELSE RIGHT('000000' + CAST(id % 1000000 AS VARCHAR),6)
            -- END stan,
            t.transferAmount,
            t.transferCurrency,
            t.localDateTime,
            t.settlementDate destinationSettlementDate,
            t.merchantType,
            e.udfDetails udfAcquirer,
            t.transferId,
            t.transferIdAcquirer,
            t.sourceAccount,
            t.destinationAccount
        FROM
            [transfer].[transfer] t
        LEFT JOIN
            [transfer].[event] e ON e.transferId = t.transferId AND e.source = 'acquirer' AND e.type = 'transfer.push'
        WHERE
            t.transferId = @txid
        ORDER BY
            e.eventDateTime, e.eventId
    END

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
    EXEC core.error
    RETURN 55555
END CATCH
