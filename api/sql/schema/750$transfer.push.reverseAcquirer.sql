ALTER PROCEDURE [transfer].[push.reverseAcquirer]
    @transferId BIGINT,
    @type VARCHAR(50),
    @message VARCHAR(250),
    @details XML
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    acquirerTxState = 4
WHERE
    transferId = @transferId AND
    acquirerTxState = 1

DECLARE @COUNT INT = @@ROWCOUNT
EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'unknown',
    @source = 'acquirer',
    @message = @message,
    @udfDetails = @details

IF @COUNT <> 1 RAISERROR('transfer.reverseAcquirer', 16, 1);
