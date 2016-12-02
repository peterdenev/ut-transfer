ALTER PROCEDURE [transfer].[push.confirmMerchant]
    @transferId bigint,
    @transferIdMerchant varchar(50)
AS
DECLARE @callParams XML

BEGIN TRY

    UPDATE
        [transfer].[transfer]
    SET
        transferIdMerchant = @transferIdMerchant,
        merchantTxState = 2
    WHERE
        transferId = @transferId AND
        merchantTxState = 1

    IF @@ROWCOUNT <> 1 RAISERROR('transfer.confirmMerchant', 16, 1);

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    EXEC core.error
    RETURN 55555
END CATCH
