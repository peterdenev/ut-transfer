ALTER PROCEDURE [transfer].[push.confirmReversal]
    @transferId bigint
AS
SET NOCOUNT ON

BEGIN TRY
    BEGIN TRANSACTION

    UPDATE
        [transfer].[transfer]
    SET
        reversed = 1
    WHERE
        transferId = @transferId

    IF @@ROWCOUNT <> 1 RAISERROR('transfer.confirmReversal', 16, 1);

    UPDATE
        [transfer].[pending]
    SET
        [status] = NULL,
        secondTransferId = NULL
    WHERE
        secondTransferId=@transferId

    COMMIT TRANSACTION
END TRY
BEGIN CATCH
    if @@TRANCOUNT > 0 ROLLBACK TRANSACTION
    EXEC core.error
    RETURN 55555
END CATCH

