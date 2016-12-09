ALTER PROCEDURE [transfer].[push.failIssuer]
    @transferId bigint,
    @type varchar(50),
    @message varchar(250),
    @details XML
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    issuerTxState = 4
WHERE
    transferId = @transferId AND
    issuerTxState = 1

DECLARE @COUNT int = @@ROWCOUNT
EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @source = 'issuer',
    @message = @message,
    @udfDetails = @details

IF @COUNT <> 1 RAISERROR('transfer.failIssuer', 16, 1);
