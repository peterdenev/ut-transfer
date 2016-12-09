ALTER PROCEDURE [transfer].[push.execute]
    @transferTypeId bigint,
    @transferDateTime datetime,
    @settlementDate date,
    @channelId bigint,
    @channelType varchar(50),
    @ordererId bigint,
    @merchantId varchar(50),
    @merchantInvoice varchar(50),
    @merchantPort varchar(50),
    @merchantType varchar(50),
    @cardId bigint,
    @sourceAccount varchar(50),
    @destinationAccount varchar(50),
    @expireTime datetime,
    @transferCurrency varchar(3),
    @transferAmount money,
    @destinationPort varchar(50),
    @acquirerFee money,
    @issuerFee money,
    @transferFee money,
    @description varchar(250),
    @udfAcquirer XML,
    @meta core.metaDataTT READONLY
AS
DECLARE @callParams XML

BEGIN TRY
    -- todo check permission
    BEGIN TRANSACTION

    INSERT INTO [transfer].[transfer](
        transferDateTime,
        transferTypeId,
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
    OUTPUT
        INSERTED.*
    VALUES (
        @transferDateTime,
        @transferTypeId,
        REPLACE(REPLACE(REPLACE(CONVERT(varchar, @transferDateTime, 120),'-',''),':',''),' ',''),
        @settlementDate,
        @channelId,
        @channelType,
        @ordererId,
        @merchantId,
        @merchantInvoice,
        @merchantId,-- todo lookup merchantPort,
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
    )

    EXEC [transfer].[push.event]
        @transferId = @@IDENTITY,
        @type = 'transfer.push',
        @source = 'acquirer',
        @udfDetails = @udfAcquirer,
        @message = 'Transfer created'

    COMMIT TRANSACTION

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    if @@TRANCOUNT > 0 ROLLBACK TRANSACTION
    EXEC core.error
    RETURN 55555
END CATCH
