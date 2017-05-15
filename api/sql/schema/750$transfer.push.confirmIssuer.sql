ALTER PROCEDURE [transfer].[push.confirmIssuer]
    @transferId bigint,
    @transferIdIssuer varchar(50),
    @type varchar(50),
    @message varchar(250),
    @details XML
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    transferIdIssuer = @transferIdIssuer,
    issuerTxState = 2
WHERE
    transferId = @transferId AND
    issuerTxState = 1

DECLARE @COUNT int = @@ROWCOUNT

IF @type IS NOT NULL AND @message IS NOT NULL
BEGIN
EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'confirm',
    @source = 'issuer',
    @message = @message,
    @udfDetails = @details
END

IF @COUNT <> 1 RAISERROR('transfer.confirmIssuer', 16, 1);
