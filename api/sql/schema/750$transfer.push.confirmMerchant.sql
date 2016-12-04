ALTER PROCEDURE [transfer].[push.confirmMerchant]
    @transferId bigint,
    @transferIdMerchant varchar(50)
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    transferIdMerchant = @transferIdMerchant,
    merchantTxState = 2
WHERE
    transferId = @transferId AND
    merchantTxState = 1

IF @@ROWCOUNT <> 1 RAISERROR('transfer.confirmMerchant', 16, 1);
