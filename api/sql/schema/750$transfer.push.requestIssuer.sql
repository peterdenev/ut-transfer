ALTER PROCEDURE [transfer].[push.requestIssuer]
    @transferId bigint,
    @type varchar(50),
    @message varchar(250),
    @details XML
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    issuerTxState = 1
WHERE
    transferId = @transferId AND
    issuerTxState is NULL

SET @type = ISNULL (@type, 'transfer.push.requestIssuer')

DECLARE @COUNT int = @@ROWCOUNT
EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'request',
    @source = 'issuer',
    @message = @message,
    @udfDetails = @details

IF @COUNT <> 1 RAISERROR('transfer.requestIssuer', 16, 1);
