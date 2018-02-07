CREATE PROCEDURE [transfer].[push.confirmAdjustment]
    @transferId bigint,
    @source varchar(50),
    @amount money,
    @currency varchar(3),
    @details XML
AS
SET NOCOUNT ON
BEGIN TRY
    BEGIN TRANSACTION
        UPDATE
            [transfer].[transfer]
        SET
            transferAmount = @amount,
            transferCurrency = @currency
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
