ALTER PROCEDURE [transfer].[push.create]
    @transferTypeId bigint,
    @acquirerCode varchar(50),
    @transferDateTime datetime2(0),
    @localDateTime varchar(14),
    @settlementDate varchar(14),
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
    @expireSeconds int,
    @transferCurrency varchar(3),
    @transferAmount money,
    @issuerId varchar(50),
    @issuerChannelId char(4),
    @ledgerId varchar(50),
    @acquirerFee money,
    @issuerFee money,
    @transferFee money,
    @description varchar(250),
    @udfAcquirer XML,
    @split transfer.splitTT READONLY,
    @isPending BIT,
    @originalRequest TEXT,
    @originalTransferId bigint,
    @isPreauthorization bit,
    @networkData varchar(20),
    @transactionCategoryCode char(1),
    @processingCode char(6),
    @posEntryMode char(3),
    @posData varchar(25),
    @transferType varchar(25),
    @transferPending transfer.pendingTT READONLY,
    @clearingStatusId CHAR(6),
    @userAvailableAccounts [core].[arrayList] READONLY,
    @meta core.metaDataTT READONLY
AS
DECLARE @callParams XML = NULL
DECLARE @merchantPort varchar(50),
    @merchantMode varchar(20),
    @merchantSettlementDate datetime,
    @merchantSerialNumber bigint,
    @merchantSettings XML,
    @issuerPort varchar(50),
    @issuerMode varchar(20),
    @issuerSettlementDate datetime,
    @issuerSerialNumber bigint,
    @issuerSettings XML,
    @ledgerPort varchar(50),
    @ledgerMode varchar(20),
    @ledgerSerialNumber bigint,
    @userId bigint

BEGIN TRY

    IF @transferDateTime IS NULL
    BEGIN
        SELECT @transferDateTime = GETDATE()
    END

    SET @userId = (SELECT [auth.actorId] FROM @meta)

     IF EXISTS(SELECT TOP 1 1 from [transfer].[transfer] 
		  WHERE transferIdAcquirer=@transferIdAcquirer 
		  AND ([issuerTxState] = 1 OR [issuerTxState] = 2))
    BEGIN
	   RAISERROR('Duplicate transfer id. This transfer was already sent.', 16, 1) 
    END

    IF @transferTypeId IS NULL
    BEGIN
        SELECT @transferTypeId = n.itemNameId
        FROM [core].[itemName] n
        JOIN [core].[itemType] t ON n.itemTypeId = t.itemTypeId AND t.alias = 'operation'
        WHERE itemCode = @transferType
    END

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
        @issuerPort = port,
        @issuerMode = mode,
        @issuerSettlementDate = settlementDate,
        @issuerSerialNumber = serialNumber = ISNULL(serialNumber, 0) + 1,
        @issuerSettings = settings
    WHERE
        partnerId = @issuerId
    
    IF LEN(@settlementDate) = 4
    BEGIN
        SET @issuerSettlementDate = CAST(CAST(DATEPART(YEAR, GETDATE()) AS CHAR(4)) + @settlementDate AS DATETIME)
        SET @issuerSettlementDate = DATEADD(YEAR, CASE
            WHEN DATEPART(MONTH, @issuerSettlementDate) = 1 AND DATEPART(MONTH, GETDATE()) = 12 THEN -1
            WHEN DATEPART(MONTH, @issuerSettlementDate) = 12 AND DATEPART(MONTH, GETDATE()) = 1 THEN 1
            ELSE 0 END, @issuerSettlementDate)
    END ELSE
    IF LEN(@settlementDate) > 4
    BEGIN
        SET @issuerSettlementDate = CAST(@settlementDate AS datetime)
    END

    UPDATE
        [transfer].[partner]
    SET
        @ledgerPort = port,
        @ledgerMode = mode,
        @ledgerSerialNumber = serialNumber = ISNULL(serialNumber, 0) + 1
    WHERE
        partnerId = @ledgerId
    
    INSERT INTO [transfer].[transfer](
        transferDateTime,
        transferTypeId,
        acquirerCode,
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
        issuerTxState,
        issuerId,
        issuerChannelId,
        ledgerId,
        transferCurrency,
        transferAmount,
        acquirerFee,
        issuerFee,
        transferFee,
        description,
        reversed,
		networkData,
        transactionCategoryCode,
        processingCode,
        posEntryMode,
        posData,
        originalRequest,
        originalTransferId,
        isPreauthorization,
	    clearingStatusId,
        createdOn,
        updatedOn
    )
    OUTPUT
        INSERTED.*,
        @merchantMode merchantMode,
        REPLACE(REPLACE(REPLACE(CONVERT(varchar, @merchantSettlementDate, 120),'-',''),':',''),' ','') merchantSettlementDate,
        @merchantSerialNumber merchantSerialNumber,
        @merchantSettings merchantSettings,
        @issuerMode issuerMode,
        REPLACE(REPLACE(REPLACE(CONVERT(varchar, @issuerSettlementDate, 120),'-',''),':',''),' ','') issuerSettlementDate,
        @issuerSerialNumber issuerSerialNumber,
        @issuerSettings issuerSettings,
        @issuerPort issuerPort,
        @ledgerPort ledgerPort,
        @ledgerMode ledgerMode,
        @ledgerSerialNumber ledgerSerialNumber
    SELECT
        @transferDateTime,
        @transferTypeId,
        @acquirerCode,
        @transferIdAcquirer,
        ISNULL(@localDateTime, REPLACE(REPLACE(REPLACE(CONVERT(varchar, @transferDateTime, 120),'-',''),':',''),' ','')),
        @issuerSettlementDate,
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
        ISNULL(@expireTime, DATEADD(SECOND, @expireSeconds, @transferDateTime)),
        1,
        @issuerId,
        @issuerChannelId,
        @ledgerId,
        @transferCurrency,
        @transferAmount,
        @acquirerFee,
        @issuerFee,
        @transferFee,
        @description,
        0,
		@networkData,
        @transactionCategoryCode,
        @processingCode,
        @posEntryMode,
        @posData,
		@originalRequest,
        @originalTransferId,
        @isPreauthorization,
	    @clearingStatusId,
        SYSDATETIMEOFFSET(),
        SYSDATETIMEOFFSET()
    DECLARE @transferId BIGINT = @@IDENTITY

    EXEC [transfer].[push.event]
        @transferId = @transferId,
        @type = 'transfer.push',
        @state = 'request',
        @source = 'acquirer',
        @udfDetails = @udfAcquirer,
        @message = 'Transfer created'

    IF @isPending = 1
    BEGIN
        INSERT INTO
            [transfer].[pending](
                pullTransactionId,
                securityCode,
                expireTime,
                attempts,
                [status],
                approvalAccountNumber,
                params,
                createdBy
            )
        SELECT
            @transferId,
            securityCode,
            expireTime,
            0,
            1,
            approvalAccountNumber,
            params,
            @userId
        FROM
            @transferPending
    END ELSE IF EXISTS (SELECT * FROM [transfer].[pending] tp JOIN @transferPending s on s.pullTransactionId = tp.pullTransactionId)
    BEGIN
        UPDATE
            tp
        SET
            pushTransactionId = @transferId,
            tp.[status] = 2,
            updatedBy = @userId,
            updatedOn = GETDATE()
        FROM
            [transfer].[pending] tp
        JOIN
            @transferPending s ON s.pullTransactionId = tp.pullTransactionId AND ISNULL (s.securityCode, 0) = ISNULL (tp.securityCode, 0)
        JOIN
            @userAvailableAccounts uaa ON uaa.value = tp.approvalAccountNumber
        JOIN
            [transfer].[transfer] t ON t.transferId = tp.pullTransactionId
        WHERE
            tp.expireTime >= GETDATE() AND
            t.reversed = 0 AND
            tp.[status] = 1
        IF @@ROWCOUNT = 0
            RAISERROR ('transfer.unauthorizedTransfer', 16, 1)
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
            creditActorId,
            debitActorId,
            creditItemId,
            debitItemId,
            [state],
            [transferIdPayment]
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
        creditActorId,
        debitActorId,
        creditItemId,
        debitItemId,
        [state],
        [transferIdPayment]
    FROM
        @split

    COMMIT TRANSACTION

    --EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    IF error_number() not in (2627)
        BEGIN
DECLARE @CORE_ERROR_FILE_281 sysname='c:\UT5\impl-alignet-mastercard\node_modules\ut-transfer\api\sql\schema/750$transfer.push.create.sql' DECLARE @CORE_ERROR_LINE_281 int='282' EXEC [core].[errorStack] @procid=@@PROCID, @file=@CORE_ERROR_FILE_281, @fileLine=@CORE_ERROR_LINE_281, @params = @callParams
        END
    ELSE
    BEGIN TRY
        RAISERROR('transfer.idAlreadyExists', 16, 1);
    END TRY
    BEGIN CATCH
DECLARE @CORE_ERROR_FILE_288 sysname='c:\UT5\impl-alignet-mastercard\node_modules\ut-transfer\api\sql\schema/750$transfer.push.create.sql' DECLARE @CORE_ERROR_LINE_288 int='289' EXEC [core].[errorStack] @procid=@@PROCID, @file=@CORE_ERROR_FILE_288, @fileLine=@CORE_ERROR_LINE_288, @params = @callParams
    END CATCH
END CATCH