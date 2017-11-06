ALTER PROCEDURE [transfer].[push.confirmReverseMc]
    @reverseId bigint,
    @transferId bigint,
    @issuerResponseCode varchar(10), 
    @issuerResponseMessage varchar(250) = NULL,
    @originalResponse TEXT = NULL,
    @stan char(6) = NULL,
    @networkData varchar(20) = NULL
AS
SET NOCOUNT ON

BEGIN TRY
    BEGIN TRANSACTION

    UPDATE
        [transfer].[reverse]
    SET
        issuerTxState = 2,
        issuerResponseCode = @issuerResponseCode,
        issuerResponseMessage = @issuerResponseMessage,
        originalResponse = @originalResponse,
        stan = @stan,
        networkData = @networkData,
        updatedOn = GETDATE()
    WHERE
        reverseId = @reverseId

    UPDATE
        [transfer].[transfer]
    SET
        reversed = 1
    WHERE
        transferId = @transferId

    IF @@ROWCOUNT <> 1 RAISERROR('transfer.confirmReversal', 16, 1);

    EXEC [transfer].[push.event]
        @transferId = @transferId,
        @type = 'transfer.reverse',
        @state = 'reverse',
        @source = 'acquirer',
        @message = 'Transaction was succesfully reversed',
        @udfDetails = null

    COMMIT TRANSACTION
END TRY
BEGIN CATCH
    if @@TRANCOUNT > 0 ROLLBACK TRANSACTION
    EXEC core.error
    RETURN 55555
END CATCH

