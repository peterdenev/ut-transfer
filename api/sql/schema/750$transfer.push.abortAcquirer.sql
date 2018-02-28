ALTER PROCEDURE [transfer].[push.abortAcquirer]
    @transferId BIGINT,
    @type VARCHAR(50),
    @message VARCHAR(250),
    @details XML
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    acquirerTxState = 5
WHERE
    transferId = @transferId AND
    acquirerTxState IS NULL

DECLARE @COUNT INT = @@ROWCOUNT
EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'abort',
    @source = 'acquirer',
    @message = @message,
    @udfDetails = @details

IF @COUNT <> 1 RAISERROR('transfer.abortAcquirer', 16, 1);
