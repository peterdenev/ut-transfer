ALTER PROCEDURE [transfer].[push.confirmIssuer]
    @transferId bigint,
    @transferIdIssuer varchar(50),
    @issuerFee money,
    @transferFee money,
    @type varchar(50),
    @message varchar(250),
    @details XML
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    transferIdIssuer = @transferIdIssuer,
    issuerFee = CASE WHEN @issuerFee IS NULL THEN issuerFee ELSE @issuerFee END,
    transferFee = CASE WHEN @transferFee IS NULL THEN transferFee ELSE @transferFee END,
    issuerTxState = 2
WHERE
    transferId = @transferId AND
    issuerTxState = 1

DECLARE @COUNT int = @@ROWCOUNT

SET @type = ISNULL (@type, 'transfer.push.confirmIssuer')

EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'confirm',
    @source = 'issuer',
    @message = @message,
    @udfDetails = @details

IF @COUNT <> 1 RAISERROR('transfer.confirmIssuer', 16, 1);
