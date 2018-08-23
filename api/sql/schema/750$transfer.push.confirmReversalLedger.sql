ALTER PROCEDURE [transfer].[push.confirmReversalLedger]
    @transferId BIGINT,
    @details XML
AS
SET NOCOUNT ON

BEGIN TRY
    BEGIN TRANSACTION
        DECLARE @reversed BIT = 0

        UPDATE
            [transfer].[transfer]
        SET
            reversedLedger = 1,
            @reversed = reversed
        WHERE
            transferId = @transferId

        IF @@ROWCOUNT <> 1 RAISERROR('transfer.confirmReversalLedger', 16, 1);

        IF @reversed = 1
        BEGIN
            UPDATE
                [transfer].[pending]
            SET
                [status] = NULL,
                pushTransactionId = NULL
            WHERE
                pushTransactionId = @transferId

            EXEC [transfer].[push.event]
                @transferId = @transferId,
                @type = 'transfer.reverse',
                @state = 'reverse',
                @source = 'acquirer',
                @message = 'TRANSACTION was succesfully reversed',
                @udfDetails = @details
        END
    COMMIT TRANSACTION
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
    EXEC core.error
    RETURN 55555
END CATCH
