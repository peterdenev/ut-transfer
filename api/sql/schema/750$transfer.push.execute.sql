ALTER PROCEDURE [transfer].[push.execute]
    @transfer transfer.transferTT READONLY,
    @meta core.metaDataTT READONLY
AS
DECLARE @callParams XML

BEGIN TRY
    -- todo check permission
    INSERT INTO [transfer].[transfer](
        transferDateTime,
        transferType,
        transferIdAcquirer,
        transferIdIssuer,
        localDateTime,
        settlementDate,
        channelId,
        channelType,
        holderId,
        holderType,
        merchantId,
        merchantType,
        cardId,
        phone,
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
        GETDATE(),
        transferType,
        transferIdAcquirer,
        transferIdIssuer,
        localDateTime,
        settlementDate,
        channelId,
        channelType,
        holderId,
        holderType,
        merchantId,
        merchantType,
        cardId,
        phone,
        sourceAccount,
        destinationAccount,
        expireTime,
        expireCount,
        reversed,
        retryTime,
        retryCount,
        1, --issuerTxState,
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
    FROM @transfer

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    EXEC core.error
    RETURN 55555
END CATCH
