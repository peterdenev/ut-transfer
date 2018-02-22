ALTER PROCEDURE [transfer].[push.confirmAcquirer]
    @transferId BIGINT,
    @transferIdAcquirer VARCHAR(50),
    @type VARCHAR(50),
    @message VARCHAR(250),
    @details XML
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    [transferIdAcquirer] = @transferIdAcquirer,
    acquirerTxState = 2
WHERE
    transferId = @transferId AND
    acquirerTxState IN (1, 2)

DECLARE @COUNT INT = @@ROWCOUNT

SET @type = ISNULL (@type, 'transfer.push.confirmAcquirer')

EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'confirm',
    @source = 'acquirer',
    @message = @message,
    @udfDetails = @details

IF @COUNT <> 1 RAISERROR('transfer.confirmAcquirer', 16, 1);
