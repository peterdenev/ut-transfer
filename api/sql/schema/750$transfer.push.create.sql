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
    @description varchar(250),
    @udfAcquirer XML,
    @offlineDateTime datetime,
    @split transfer.splitTT READONLY,
    @isPending BIT,
    @bioValidatedBy NVARCHAR(100)=NULL,
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
        description,
        reversed,
	   offlineDateTime,
	   bioValidatedBy
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
        @issuerId,
        @ledgerId,
        @transferCurrency,
        @transferAmount,
        @acquirerFee,
        @issuerFee,
        @transferFee,
        @description,
        0,
	   @offlineDateTime,
	   @bioValidatedBy

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