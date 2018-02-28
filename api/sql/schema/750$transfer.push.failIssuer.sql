ALTER PROCEDURE [transfer].[push.failIssuer]
    @transferId BIGINT,
    @type VARCHAR(50),
    @message VARCHAR(250),
    @details XML
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    issuerTxState = 3
WHERE
    transferId = @transferId AND
    issuerTxState = 1

DECLARE @COUNT INT = @@ROWCOUNT
EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'fail',
    @source = 'issuer',
    @message = @message,
    @udfDetails = @details

IF @COUNT <> 1 RAISERROR('transfer.failIssuer', 16, 1);
