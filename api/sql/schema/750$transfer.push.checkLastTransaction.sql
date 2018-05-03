ALTER PROCEDURE [transfer].[push.checkLastTransaction]
    @channelId BIGINT,
    @sernum CHAR(4),
    @status CHAR(1),
    @notes1 INT,
    @notes2 INT,
    @notes3 INT,
    @notes4 INT,
    @confirm BIT,
    @errorMap core.indexedMapTT READONLY
AS
SET NOCOUNT ON
DECLARE @callParams XML

BEGIN TRY

    DECLARE
        @lastTx INT,
        @lastSernum VARCHAR(4),
        @lastNotes1 INT,
        @lastNotes2 INT,
        @lastNotes3 INT,
        @lastNotes4 INT,
        @lastAcquirerState INT,
        @lastIssuerState INT,
        @isFallBack BIT,

        @details XML = @callParams,
        @responseCode VARCHAR(3)

    SET @details.modify('delete (/params/errorMap)[1]')

    SELECT TOP 1
        @lastTx = t.transferId,
        @lastSernum = e.udfDetails.value('(/root/sernum)[1]', 'VARCHAR(4)'),
        @lastAcquirerState = t.acquirerTxState,
        @lastIssuerState = t.issuerTxState,
        @lastNotes1 = e.udfDetails.value('(/root/type1Notes)[1]', 'INT'),
        @lastNotes2 = e.udfDetails.value('(/root/type2Notes)[1]', 'INT'),
        @lastNotes3 = e.udfDetails.value('(/root/type3Notes)[1]', 'INT'),
        @lastNotes4 = e.udfDetails.value('(/root/type4Notes)[1]', 'INT')
    FROM
        [transfer].[transfer] t
    LEFT JOIN
        [transfer].[event] e ON e.transferId = t.transferId AND e.source = 'acquirer' AND e.type = 'transfer.requestAcquirer'
    WHERE
        t.channelId = @channelId
    ORDER BY
        t.transferId DESC

    IF @lastAcquirerState IS NULL AND @lastTx IS NOT NULL
    BEGIN
        SET @responseCode = (SELECT [value] FROM @errorMap WHERE [key] = 'atm.lastTransactionTimeout')
        SET @details.modify('insert <responseCode>{sql:variable("@responseCode")}</responseCode> into (/params)[1]')

        EXEC [transfer].[push.abortAcquirer]
            @transferId = @lastTx,
            @type = 'atm.lastTransactionTimeout',
            @message = 'ATM timed out waiting for response',
            @details = @details
    END ELSE
    IF @lastAcquirerState = 1 AND @lastIssuerState = 2
    BEGIN
        IF @lastSernum IS NULL
        BEGIN
            SET @responseCode = (SELECT [value] FROM @errorMap WHERE [key] = 'atm.lastTransactionMissingSernum')
            SET @details.modify('insert <responseCode>{sql:variable("@responseCode")}</responseCode> into (/params)[1]')

            EXEC [transfer].[push.errorAcquirer]
                @transferId = @lastTx,
                @type = 'atm.lastTransactionMissingSernum',
                @message = 'Missing last transaction serial number',
                @details = @details
        END ELSE
        IF @lastSernum != @sernum
        BEGIN
            IF @confirm = 1
            BEGIN
                SET @responseCode = (SELECT [value] FROM @errorMap WHERE [key] = 'atm.lastTransactionUnexpectedSernum')
                SET @details.modify('insert <responseCode>{sql:variable("@responseCode")}</responseCode> into (/params)[1]')

                EXEC [transfer].[push.errorAcquirer]
                    @transferId = @lastTx,
                    @type = 'atm.lastTransactionUnexpectedSernum',
                    @message = 'Unexpected last transaction serial number',
                    @details = @details
            END ELSE
            BEGIN
                SET @responseCode = (SELECT [value] FROM @errorMap WHERE [key] = 'atm.lastTransactionNoReply')
                SET @details.modify('insert <responseCode>{sql:variable("@responseCode")}</responseCode> into (/params)[1]')

                EXEC [transfer].[push.failAcquirer]
                    @transferId = @lastTx,
                    @type = 'atm.lastTransactionNoReply',
                    @message = 'ATM did not receive transaction reply',
                    @details = @details
            END
        END ELSE
        IF @lastNotes1 != @notes1 OR @lastNotes2 != @notes2 OR @lastNotes3 != @notes3 OR @lastNotes4 != @notes4
        BEGIN
            IF @confirm = 1
            BEGIN
                SET @responseCode = (SELECT [value] FROM @errorMap WHERE [key] = 'atm.lastTransactionUnexpectedDispense')
                SET @details.modify('insert <responseCode>{sql:variable("@responseCode")}</responseCode> into (/params)[1]')

                EXEC [transfer].[push.errorAcquirer]
                    @transferId = @lastTx,
                    @type = 'atm.lastTransactionUnexpectedDispense',
                    @message = 'Unexpected last dispense',
                    @details = @details
            END ELSE
            IF @notes1 = 0 AND @notes2 = 0 AND @notes3 = 0 AND @notes4 = 0
            BEGIN
                SET @responseCode = (SELECT [value] FROM @errorMap WHERE [key] = 'atm.lastTransactionZeroDispense')
                SET @details.modify('insert <responseCode>{sql:variable("@responseCode")}</responseCode> into (/params)[1]')

                EXEC [transfer].[push.failAcquirer]
                    @transferId = @lastTx,
                    @type = 'atm.lastTransactionZeroDispense',
                    @message = 'ATM did not dispense any money',
                    @details = @details
            END ELSE
            BEGIN
                SET @responseCode = (SELECT [value] FROM @errorMap WHERE [key] = 'atm.lastTransactionDifferentDispense')
                SET @details.modify('insert <responseCode>{sql:variable("@responseCode")}</responseCode> into (/params)[1]')

                EXEC [transfer].[push.errorAcquirer]
                    @transferId = @lastTx,
                    @type = 'atm.lastTransactionDifferentDispense',
                    @message = 'ATM dispensed different amount',
                    @details = @details
            END
        END ELSE
        BEGIN
            EXEC [transfer].[push.confirmAcquirer]
                @transferId = @lastTx,
                @transferIdAcquirer = NULL,
                @type = NULL,
                @message = NULL,
                @details = @details
        END
    END

    SELECT 'isFallBack' AS 'resultset'
    SELECT TOP 1
        ISNULL(e.udfDetails.value('(/root/isFallBack)[1]', 'BIT'), 0) AS isFallBack
    FROM
        [transfer].[transfer] t
    LEFT JOIN
        [transfer].[event] e ON e.transferId = t.transferId AND e.source = 'acquirer' AND e.type = 'transfer.push'
    WHERE
        t.channelId = @channelId
    ORDER BY
        t.transferId DESC

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
    EXEC core.error
    RETURN 55555
END CATCH
