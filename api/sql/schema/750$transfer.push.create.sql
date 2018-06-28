ALTER PROCEDURE [transfer].[push.create]
    @transferTypeId bigint,
    @acquirerCode varchar(50),
    @transferDateTime datetime,
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
    @ledgerId varchar(50),
    @acquirerFee money,
    @issuerFee money,
    @transferFee money,
	@taxVAT money = 0,
    @taxWTH money = 0,
	@taxOther money = 0,
	@commission money = 0,
    @description varchar(250),
	@comment NVARCHAR(250) = NULL,
	@noteToSelf NVARCHAR(250) = NULL,
    @utilityRef NVARCHAR(250) = NULL,
    @udfAcquirer XML,
    @split transfer.splitTT READONLY,
    @isPending BIT,
    @transferPending transfer.pendingTT READONLY,
    @userAvailableAccounts [core].[arrayList] READONLY,
    @meta core.metaDataTT READONLY
AS
DECLARE @callParams XML
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

    -- checks if the user has a right to make the operation
    DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    IF @return != 0
    BEGIN
        RETURN 55555
    END

    SET @userId = (SELECT [auth.actorId] FROM @meta)

    BEGIN TRANSACTION

    UPDATE
        [transfer].[partner]
    SET
        serialNumber = ISNULL(serialNumber, 0) + 1
    WHERE
        partnerId IN (@ledgerId, @issuerId, @merchantId)

    SELECT
        @merchantPort = port,
        @merchantMode = mode,
        @merchantSettlementDate = settlementDate,
        @merchantSerialNumber = serialNumber ,
        @merchantSettings = settings
    FROM [transfer].[partner]
    WHERE
        partnerId = @merchantId

    SELECT
        @issuerPort = port,
        @issuerMode = mode,
        @issuerSettlementDate = settlementDate,
        @issuerSerialNumber = serialNumber,
        @issuerSettings = settings
    FROM [transfer].[partner]
    WHERE
        partnerId = @issuerId

    SELECT
        @ledgerPort = port,
        @ledgerMode = mode,
        @ledgerSerialNumber = serialNumber
    FROM [transfer].[partner]
    WHERE partnerId = @ledgerId
    
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

	DECLARE @outputTable TABLE (
    transferId bigint NULL,
    transferTypeId bigint NULL,
    acquirerCode varchar(50) NULL,
    transferIdAcquirer varchar(50) NULL,
    transferIdLedger varchar(50) NULL,
    transferIdIssuer varchar(50) NULL,
    transferIdMerchant varchar(50) NULL,
    transferDateTime datetime NULL,
    localDateTime varchar(14) NULL,
    settlementDate date NULL,
    channelId bigint NULL,
    channelType varchar(50) NULL,
    ordererId bigint NULL,
    merchantId varchar(50) NULL,
    merchantInvoice varchar(50) NULL,
    merchantPort varchar(50) NULL,
    merchantType varchar(50) NULL,
    cardId bigint NULL,
    sourceAccount varchar(50) NULL,
    destinationAccount varchar(50) NULL,
    expireTime datetime NULL,
    expireCount int NULL,
    reversed bit NULL,
    retryTime datetime NULL,
    retryCount int NULL,
    ledgerTxState smallint NULL,
    issuerTxState smallint NULL,
    acquirerTxState smallint NULL,
    merchantTxState smallint NULL,
    issuerId varchar(50) NULL,
    ledgerId varchar(50) NULL,
    transferCurrency varchar(3) NULL,
    transferAmount money NULL,
    acquirerFee money NULL,
    issuerFee money NULL,
    transferFee money NULL,
	taxVAT money NULL,
    taxWTH money NULL,
	taxOther money NULL,
	commission money NULL,
    description varchar(250) NULL,
	comment NVARCHAR(250) NULL,
	noteToSelf NVARCHAR(250) NULL,
    utilityRef NVARCHAR(250) NULL,
    merchantMode varchar(20),
    merchantSettlementDate datetime,
    merchantSerialNumber bigint,
    merchantSettings XML,
    issuerMode varchar(20),
    issuerSettlementDate datetime,
    issuerSerialNumber bigint,
    issuerSettings XML,
    issuerPort varchar(50),
    ledgerPort varchar(50),
    ledgerMode varchar(20),
    ledgerSerialNumber bigint
	);

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
        issuerId,
        ledgerId,
        transferCurrency,
        transferAmount,
        acquirerFee,
        issuerFee,
        transferFee,
		taxVAT,
		taxWTH,
		taxOther,
		commission,
        description,
		comment,
		noteToSelf,
    utilityRef,
        reversed
    )
    OUTPUT
        INSERTED.transferId,
        INSERTED.transferTypeId,
        INSERTED.acquirerCode,
        INSERTED.transferIdAcquirer,
        INSERTED.transferIdLedger,
        INSERTED.transferIdIssuer,
        INSERTED.transferIdMerchant,
        INSERTED.transferDateTime,
        INSERTED.localDateTime,
        INSERTED.settlementDate,
        INSERTED.channelId,
        INSERTED.channelType,
        INSERTED.ordererId,
        INSERTED.merchantId,
        INSERTED.merchantInvoice,
        INSERTED.merchantPort,
        INSERTED.merchantType,
        INSERTED.cardId,
        INSERTED.sourceAccount,
        INSERTED.destinationAccount,
        INSERTED.expireTime,
        INSERTED.expireCount,
        INSERTED.reversed,
        INSERTED.retryTime,
        INSERTED.retryCount,
        INSERTED.ledgerTxState,
        INSERTED.issuerTxState,
        INSERTED.acquirerTxState,
        INSERTED.merchantTxState,
        INSERTED.issuerId,
        INSERTED.ledgerId,
        INSERTED.transferCurrency,
        INSERTED.transferAmount,
        INSERTED.acquirerFee,
        INSERTED.issuerFee,
        INSERTED.transferFee,
		INSERTED.taxVAT,
		INSERTED.taxWTH,
		INSERTED.taxOther,
		INSERTED.commission,
        INSERTED.description,
		INSERTED.comment,
		INSERTED.noteToSelf,
    INSERTED.utilityRef,
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
		INTO @outputTable
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
        @issuerId,
        @ledgerId,
        @transferCurrency,
        @transferAmount,
        @acquirerFee,
        @issuerFee,
        @transferFee,
		@taxVAT,
		@taxWTH,
		@taxOther,
		@commission,
        @description,
		@comment,
		@noteToSelf,
    @utilityRef,
        0

    SELECT *
    FROM @outputTable;

    DECLARE @transferId BIGINT = (SELECT transferId FROM @outputTable);

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

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    IF error_number() not in (2627)
        BEGIN
            EXEC [core].[error]
        END
    ELSE
    BEGIN TRY
        RAISERROR('transfer.idAlreadyExists', 16, 1);
    END TRY
    BEGIN CATCH
        EXEC [core].[error]
    END CATCH
END CATCH
