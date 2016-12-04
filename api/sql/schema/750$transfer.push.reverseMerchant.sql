ALTER PROCEDURE [transfer].[push.reverseMerchant]
    @transferId bigint
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    merchantTxState = 3
WHERE
    transferId = @transferId AND
    merchantTxState = 1

IF @@ROWCOUNT <> 1 RAISERROR('transfer.reverseMerchant', 16, 1);
