ALTER PROCEDURE [transfer].[push.failMerchant]
    @transferId bigint
AS
DECLARE @callParams XML

BEGIN TRY

    UPDATE
        [transfer].[transfer]
    SET
        merchantTxState = 4
    WHERE
        transferId = @transferId AND
        merchantTxState = 1

    IF @@ROWCOUNT <> 1 RAISERROR('transfer.failMerchant', 16, 1);

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    EXEC core.error
    RETURN 55555
END CATCH
