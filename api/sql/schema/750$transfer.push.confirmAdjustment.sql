CREATE PROCEDURE [transfer].[push.confirmAdjustment]
    @transferId BIGINT,
    @source VARCHAR(50),
    @replacementAmounT MONEY,
    @replacementAmountCurrency VARCHAR(3),
    @actualAmount MONEY,
    @actualAmountCurrency VARCHAR(3),
    @transferIdIssuer varchar(50),
    @transferIdLedger varchar(50),
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
            actualAmountCurrency = ISNULL(@actualAmountCurrency, @replacementAmountCurrency),
            transferIdIssuer = ISNULL(@transferIdIssuer, transferIdIssuer),
            transferIdLedger = ISNULL(@transferIdLedger, transferIdLedger)
        WHERE
            transferId = @transferId

        IF @@ROWCOUNT <> 1 RAISERROR('transfer.confirmAdjustment', 16, 1);

        EXEC [transfer].[push.event]
            @transferId = @transferId,
            @type = 'transfer.adjust',
            @state = 'adjust',
            @source = @source,
            @message = 'TRANSACTION was succesfully adjusted',
            @udfDetails = @details
    COMMIT TRANSACTION
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
    EXEC core.error
    RETURN 55555
END CATCH
