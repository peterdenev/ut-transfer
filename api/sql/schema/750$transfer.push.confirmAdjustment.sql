CREATE PROCEDURE [transfer].[push.confirmAdjustment]
    @transferId bigint,
    @source varchar(50),
    @replacementAmount money,
    @replacementAmountCurrency varchar(3),
    @actualAmount money,
    @actualAmountCurrency varchar(3),
    @details XML
AS
SET NOCOUNT ON
BEGIN TRY
    BEGIN TRANSACTION
        UPDATE
            [transfer].[transfer]
        SET
            replacementAmount = @replacementAmount,
            replacementAmountCurrency = @replacementAmountCurrency,
            actualAmount = ISNULL(@actualAmount, @replacementAmount),
            actualAmountCurrency = ISNULL(@actualAmountCurrency, @replacementAmountCurrency)
        WHERE
            transferId = @transferId

        IF @@ROWCOUNT <> 1 RAISERROR('transfer.confirmAdjustment', 16, 1);

        EXEC [transfer].[push.event]
            @transferId = @transferId,
            @type = 'transfer.adjust',
            @state = 'adjust',
            @source = @source,
            @message = 'Transaction was succesfully adjusted',
            @udfDetails = @details
    COMMIT TRANSACTION
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
    EXEC core.error
    RETURN 55555
END CATCH
