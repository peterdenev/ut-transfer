ALTER PROCEDURE [transfer].[push.requestMerchant]
    @transferId BIGINT
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    merchantTxState = 1
WHERE
    transferId = @transferId AND
    merchantTxState IS NULL

IF @@ROWCOUNT <> 1 RAISERROR('transfer.requestMerchant', 16, 1);
