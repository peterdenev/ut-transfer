ALTER PROCEDURE [transfer].[push.reverseledger]
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
    @state = 'reverse',
    @source = 'ledger',
    @message = @message,
    @udfDetails = @details

IF @COUNT <> 1 RAISERROR('transfer.reverseLedger', 16, 1);
