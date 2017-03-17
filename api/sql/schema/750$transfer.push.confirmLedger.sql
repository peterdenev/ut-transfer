ALTER PROCEDURE [transfer].[push.confirmLedger]
    @transferId bigint,
    @transferIdledger varchar(50)
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    transferIdledger = @transferIdledger,
    ledgerTxState = 2
WHERE
    transferId = @transferId AND
    ledgerTxState = 1

IF @@ROWCOUNT <> 1 RAISERROR('transfer.confirmLedger', 16, 1);
