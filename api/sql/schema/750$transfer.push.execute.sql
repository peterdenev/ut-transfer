ALTER PROCEDURE [transfer].[push.execute]
    @transfer transfer.transferTT READONLY,
    @meta core.metaDataTT READONLY
AS
DECLARE @callParams XML

BEGIN TRY
    -- todo check permission
    INSERT INTO [transfer].[transfer](
        transferDateTime,
        transferTypeId,
        transferIdAcquirer,
        transferIdIssuer,
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
        expireCount,
        reversed,
        retryTime,
        retryCount,
        issuerTxState,
        acquirerTxState,
        merchantTxState,
        destinationPort,
        transferCurrency,
        transferAmount,
        acquirerFee,
        issuerFee,
        transferFee,
        issuerErrorType,
        issuerErrorMessage,
        reversalErrorType,
        reversalErrorMessage,
        acquirerErrorType,
        acquirerErrorMessage,
        merchantErrorType,
        merchantErrorMessage,
        description,
        udfAcquirer,
        udfIssuer,
        udfTransfer
    )
    OUTPUT  INSERTED.*
    SELECT
        transferDateTime,
        transferTypeId,
        transferIdAcquirer,
        transferIdIssuer,
        REPLACE(REPLACE(REPLACE(CONVERT(varchar, transferDateTime, 120),'-',''),':',''),' ',''),
        settlementDate,
        channelId,
        channelType,
        ordererId,
        merchantId,
        merchantInvoice,
        merchantId,
        merchantType,
        cardId,
        sourceAccount,
        destinationAccount,
        expireTime,
        expireCount,
        reversed,
        retryTime,
        retryCount,
        issuerTxState,
        acquirerTxState,
        merchantTxState,
        destinationPort,
        transferCurrency,
        transferAmount,
        acquirerFee,
        issuerFee,
        transferFee,
        issuerErrorType,
        issuerErrorMessage,
        reversalErrorType,
        reversalErrorMessage,
        acquirerErrorType,
        acquirerErrorMessage,
        merchantErrorType,
        merchantErrorMessage,
        description,
        udfAcquirer,
        udfIssuer,
        udfTransfer
    FROM
        @transfer

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    EXEC core.error
    RETURN 55555
END CATCH
