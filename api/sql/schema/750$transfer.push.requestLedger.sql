ALTER PROCEDURE [transfer].[push.requestLedger]
    @transferId BIGINT
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    ledgerTxState = 1
WHERE
    transferId = @transferId AND
    ledgerTxState IS NULL

IF @@ROWCOUNT <> 1 RAISERROR('transfer.requestLedger', 16, 1);
