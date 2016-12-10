ALTER PROCEDURE [transfer].[push.reverseAcquirer]
    @transferId bigint,
    @type varchar(50),
    @message varchar(250),
    @details XML
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    acquirerTxState = 3
WHERE
    transferId = @transferId AND
    acquirerTxState = 1

DECLARE @COUNT int = @@ROWCOUNT
EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @source = 'acquirer',
    @message = @message,
    @udfDetails = @details

IF @COUNT <> 1 RAISERROR('transfer.reverseAcquirer', 16, 1);
