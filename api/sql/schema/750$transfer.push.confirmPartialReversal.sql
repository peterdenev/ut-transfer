ALTER PROCEDURE [transfer].[push.confirmPartialReversal]
    @partialTransferId bigint,
    @mcResponse varchar(2000)
AS
SET NOCOUNT ON

BEGIN TRY
    BEGIN TRANSACTION

    UPDATE
        [transfer].[reverse]
    SET
        mcResponse = @mcResponse
    WHERE
        transferId = @partialTransferId

    IF @@ROWCOUNT <> 1 RAISERROR('transfer.confirmPartialReversal', 16, 1);

    EXEC [transfer].[push.event]
        @transferId = @partialTransferId,
        @type = 'transfer.reverse',
        @state = 'reverse',
        @source = 'acquirer',
        @message = 'Transaction was succesfully partialy reversed',
        @udfDetails = null

    COMMIT TRANSACTION
END TRY
BEGIN CATCH
    if @@TRANCOUNT > 0 ROLLBACK TRANSACTION
    EXEC core.error
    RETURN 55555
END CATCH

