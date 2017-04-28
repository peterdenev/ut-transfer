ALTER PROCEDURE [transfer].[push.failLedger]
    @transferId bigint,
    @type varchar(50),
    @message varchar(250),
    @details XML
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    ledgerTxState = 3
WHERE
    transferId = @transferId AND
    ledgerTxState = 1

DECLARE @COUNT int = @@ROWCOUNT
EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'fail',
    @source = 'ledger',
    @message = @message,
    @udfDetails = @details

IF @COUNT <> 1 RAISERROR('transfer.failLedger', 16, 1);
