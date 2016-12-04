ALTER PROCEDURE [transfer].[push.requestMerchant]
    @transferId bigint
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    merchantTxState = 1
WHERE
    transferId = @transferId AND
    merchantTxState is NULL

IF @@ROWCOUNT <> 1 RAISERROR('transfer.requestMerchant', 16, 1);
