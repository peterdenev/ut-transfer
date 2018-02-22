ALTER PROCEDURE [transfer].[push.confirmReversalIssuer]
    @transferId BIGINT
AS
SET NOCOUNT ON

BEGIN TRY
    BEGIN TRANSACTION
        DECLARE @reversed BIT = 1

        UPDATE
            [transfer].[transfer]
        SET
            reversed = 1,
            @reversed = reversedLedger = CASE WHEN issuerId = ledgerId THEN 1 ELSE reversedLedger END
        WHERE
            transferId = @transferId

        IF @@ROWCOUNT <> 1 RAISERROR('transfer.confirmReversalIssuer', 16, 1);

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
                @udfDetails = NULL
        END
    COMMIT TRANSACTION
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
    EXEC core.error
    RETURN 55555
END CATCH
