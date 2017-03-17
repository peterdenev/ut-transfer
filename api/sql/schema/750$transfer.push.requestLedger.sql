ALTER PROCEDURE [transfer].[push.requestLedger]
    @transferId bigint
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    ledgerTxState = 1
WHERE
    transferId = @transferId AND
    ledgerTxState is NULL

IF @@ROWCOUNT <> 1 RAISERROR('transfer.requestLedger', 16, 1);
