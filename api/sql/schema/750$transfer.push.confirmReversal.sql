ALTER PROCEDURE [transfer].[push.confirmReversal]
    @transferId bigint
AS
SET NOCOUNT ON

BEGIN TRY
    BEGIN TRANSACTION

    UPDATE
        [transfer].[transfer]
    SET
        reversed = 1,
	   reversalDate=GETDATE()
    WHERE
        transferId = @transferId

    IF @@ROWCOUNT <> 1 RAISERROR('transfer.confirmReversal', 16, 1);

    UPDATE
        [transfer].[pending]
    SET
        [status] = NULL,
        pushTransactionId = NULL
    WHERE
        pushTransactionId=@transferId

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

