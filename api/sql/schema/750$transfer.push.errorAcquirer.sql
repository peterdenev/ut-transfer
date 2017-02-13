ALTER PROCEDURE [transfer].[push.errorAcquirer]
    @transferId bigint,
    @type varchar(50),
    @message varchar(250),
    @details XML
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    acquirerTxState = 6
WHERE
    transferId = @transferId AND
    acquirerTxState = 1

DECLARE @COUNT int = @@ROWCOUNT
EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'error',
    @source = 'acquirer',
    @message = @message,
    @udfDetails = @details

IF @COUNT <> 1 RAISERROR('transfer.errorAcquirer', 16, 1);
