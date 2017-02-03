ALTER PROCEDURE [transfer].[pushSpecialOperation.execute]
    @operationCode nvarchar(200),
    @transferDateTime datetime,
    @transferIdAcquirer varchar(50),
    @channelId bigint,
    @channelType varchar(50),
    @ordererId bigint,
    @merchantId varchar(50),
    @merchantInvoice varchar(50),
    @merchantType varchar(50),
    @cardId bigint,
    @sourceAccount varchar(50),
    @destinationAccount varchar(50),
    @expireTime datetime,
    @transferCurrency varchar(3),
    @transferAmount money,
    @destinationId varchar(50),
    @acquirerFee money,
    @issuerFee money,
    @transferFee money,
    @description varchar(250),
    @udfAcquirer XML,
    @split transfer.splitTT READONLY,
    @meta core.metaDataTT READONLY
AS
DECLARE @callParams XML
DECLARE @merchantPort varchar(50),
    @merchantMode varchar(20),
    @merchantSettlementDate datetime,
    @merchantSerialNumber bigint,
    @merchantSettings XML,
    @destinationPort varchar(50),
    @destinationMode varchar(20),
    @destinationSettlementDate datetime,
    @destinationSerialNumber bigint,
    @destinationSettings XML,
    @transferTypeId bigint

BEGIN TRY
    -- todo check permission
    SET @transferTypeId = 
    (
        SELECT i.itemNameId
        FROM core.itemName i
        JOIN core.itemType t on t.itemTypeId = i.itemTypeId AND t.alias='operation'
        WHERE i.itemCode = @operationCode 
    )

    BEGIN TRANSACTION

    UPDATE
        [transfer].[partner]
    SET
        @merchantPort = port,
        @merchantMode = mode,
        @merchantSettlementDate = settlementDate,
        @merchantSerialNumber = serialNumber = ISNULL(serialNumber, 0) + 1,
        @merchantSettings = settings
    WHERE
        partnerId = @merchantId

    UPDATE
        [transfer].[partner]
    SET
        @destinationPort = port,
        @destinationMode = mode,
        @destinationSettlementDate = settlementDate,
        @destinationSerialNumber = serialNumber = ISNULL(serialNumber, 0) + 1,
        @destinationSettings = settings
    WHERE
        partnerId = ISNULL(@destinationId, 'cbs')

    INSERT INTO [transfer].[transfer](
        transferDateTime,
        transferTypeId,
        transferIdAcquirer,
        localDateTime,
        settlementDate,
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
        destinationPort,
        transferCurrency,
        transferAmount,
        acquirerFee,
        issuerFee,
        transferFee,
        description,
        reversed
    )
    --OUTPUT
    --    INSERTED.*,
    --    @merchantMode merchantMode,
    --    REPLACE(REPLACE(REPLACE(CONVERT(varchar, @merchantSettlementDate, 120),'-',''),':',''),' ','') merchantSettlementDate,
    --    @merchantSerialNumber merchantSerialNumber,
    --    @merchantSettings merchantSettings,
    --    @destinationMode destinationMode,
    --    REPLACE(REPLACE(REPLACE(CONVERT(varchar, @destinationSettlementDate, 120),'-',''),':',''),' ','') destinationSettlementDate,
    --    @destinationSerialNumber destinationSerialNumber,
    --    @destinationSettings destinationSettings
    SELECT
        @transferDateTime,
        @transferTypeId,
        @transferIdAcquirer,
        REPLACE(REPLACE(REPLACE(CONVERT(varchar, @transferDateTime, 120),'-',''),':',''),' ',''),
        @destinationSettlementDate,
        @channelId,
        @channelType,
        @ordererId,
        @merchantId,
        @merchantInvoice,
        @merchantPort,
        @merchantType,
        @cardId,
        @sourceAccount,
        @destinationAccount,
        @expireTime,
        @destinationPort,
        @transferCurrency,
        @transferAmount,
        @acquirerFee,
        @issuerFee,
        @transferFee,
        @description,
        0

    DECLARE @transferId BIGINT = @@IDENTITY

    EXEC [transfer].[push.event]
        @transferId = @transferId,
        @type = 'transfer.push',
        @source = 'acquirer',
        @udfDetails = @udfAcquirer,
        @message = 'Transfer created'

    IF EXISTS (SELECT 1 FROM @Split)
    BEGIN
        DECLARE @splitTT [transfer].splitTT
        DECLARE @transfer TABLE(
                  transferId BIGINT,
                  sourceAccount VARCHAR(50),
                  destinationAccount VARCHAR(50),
                  transferAmount MONEY
                  )

        INSERT @splitTT
        EXEC [integration].[splitAliasAccount.replace] -- replace Alias with Account in splitAssignment
            @actorId = @channelId,-- actorId of agent
            @split = @split, -- split with Alias as accounts
            @debitAccount= @sourceAccount, --debit Account of transaction
            @creditAccount= @destinationAccount, --credit Account of transaction
	        @meta = @meta -- information for the user that makes the operation

        IF EXISTS ( SELECT 1 FROM @splitTT WHERE tag LIKE '%|realtime|%' AND (tag LIKE '%|issuer|%' OR tag LIKE '%|acquirer|%') )
        BEGIN

            DECLARE @transferTypeFeeId BIGINT =
            (
                SELECT i.itemNameId
                FROM core.itemName i
                JOIN core.itemType t on t.itemTypeId = i.itemTypeId AND t.alias='operation'
                WHERE i.itemCode = 'fee'
            )

            --IF OBJECT_ID('tempdb..#transfer') IS NOT NULL
            --DROP TABLE #transfer

            --CREATE TABLE #transfer (
            --      transferId BIGINT,
            --      sourceAccount VARCHAR(50),
            --      destinationAccount VARCHAR(50),
            --      transferAmount MONEY
            --      )
            -- 1 -->authorized
            INSERT INTO [transfer].[transfer] (sourceAccount, destinationAccount, transferCurrency, transferAmount,
                channelId, channelType, transferTypeId, transferDateTime, localDateTime, settlementDate, reversed, issuerTxState,
                destinationPort, [acquirerFee], [issuerFee], [transferFee], [description])
            OUTPUT inserted.transferId, inserted.sourceAccount, inserted.destinationAccount, inserted.transferAmount INTO @transfer
            SELECT s.credit, s.debit, 'GHS' /*transferCurrency*/,  sum(s.amount), /*s.actorId */ @channelId, 'agent', @transferTypeFeeId,
                @transferDateTime, REPLACE(REPLACE(REPLACE(CONVERT(varchar, @transferDateTime, 120),'-',''),':',''),' ',''),
                @destinationSettlementDate, 0, NULL, 'cbs',  0.00, 0.00, 0.00, 'FEE'
            FROM @splitTT s
			WHERE s.tag LIKE '%|realtime|%' AND (tag LIKE '%|issuer|%' OR tag LIKE '%|acquirer|%')
            GROUP BY s.credit, s.debit--, s.actorId

            UPDATE s
            SET [state] = 2,
                txtId = t.transferId
            FROM @splitTT s
            JOIN @transfer t ON t.sourceAccount = s.credit AND t.destinationAccount = s.debit
            WHERE s.tag LIKE '%|realtime|%' AND (tag LIKE '%|issuer|%' OR tag LIKE '%|acquirer|%')

            --INSERT INTO [transfer].[splitAudit] (splitId, field, oldValue, createdBy, createdOn)
            --SELECT s.splitId, 'state', s.[state], @userId, @today
            --FROM [transfer].split s
            --JOIN @splitIds si on si.value = s.splitId

        END


        INSERT INTO
            [transfer].[split](
                transferId,
                debit,
                credit,
                amount,
                conditionId,
                splitNameId,
                [description],
                tag,
                actorId,
                [state],
                txtId
            )
        SELECT
            @transferId,
            debit,
            credit,
            amount,
            conditionId,
            splitNameId,
            [description],
            tag,
            actorId,
            --@channelId,
            [state],
            txtId
        FROM
            @splitTT

        
        SELECT 'Fee' AS resultSetName

        SELECT * FROM @transfer
        --DROP TABLE #transfer

    END
    COMMIT TRANSACTION
    
    SELECT 'Transfer' AS resultSetName
    SELECT @transferId AS transferId

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    if @@TRANCOUNT > 0 ROLLBACK TRANSACTION
    EXEC core.error
    RETURN 55555
END CATCH