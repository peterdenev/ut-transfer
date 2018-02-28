ALTER PROCEDURE [transfer].[push.reverseLedger]
    @transferId BIGINT,
    @type VARCHAR(50),
    @message VARCHAR(250),
    @details XML
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    ledgerTxState = 4,
    expireTime = DATEADD(S, -1, GETDATE())
WHERE
    transferId = @transferId AND
    ledgerTxState = 1

DECLARE @COUNT INT = @@ROWCOUNT
EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'unknown',
    @source = 'ledger',
    @message = @message,
    @udfDetails = @details

IF @COUNT <> 1 RAISERROR('transfer.reverseLedger', 16, 1);
