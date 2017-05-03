ALTER PROCEDURE [transfer].[push.execute]
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
    @split transfer.splitTT READONLY,
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
    @ledgerSerialNumber bigint

BEGIN TRY
    -- todo check permission
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
        issuerId,
        ledgerId,
        transferCurrency,
        transferAmount,
        acquirerFee,
        issuerFee,
        transferFee,
        description,
        reversed
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
        0

    DECLARE @transferId BIGINT = @@IDENTITY

    EXEC [transfer].[push.event]
        @transferId = @transferId,
        @type = 'transfer.push',
        @state = 'request',
        @source = 'acquirer',
        @udfDetails = @udfAcquirer,
        @message = 'Transfer created'

    INSERT INTO
        [transfer].[split](
            transferId,
            debit,
            credit,
            amount,
            conditionId,
            splitNameId,
            [description],
            tag
        )
    SELECT
        @transferId,
        debit,
        credit,
        amount,
        conditionId,
        splitNameId,
        [description],
        tag
    FROM
        @split

    COMMIT TRANSACTION

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    if @@TRANCOUNT > 0 ROLLBACK TRANSACTION
    EXEC core.error
    RETURN 55555
END CATCH
