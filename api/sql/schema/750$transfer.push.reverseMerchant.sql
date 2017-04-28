ALTER PROCEDURE [transfer].[push.reverseMerchant]
    @transferId bigint,
    @type varchar(50),
    @message varchar(250),
    @details XML
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    merchantTxState = 4
WHERE
    transferId = @transferId AND
    merchantTxState = 1

DECLARE @COUNT int = @@ROWCOUNT
EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'reverse',
    @source = 'merchant',
    @message = @message,
    @udfDetails = @details

IF @COUNT <> 1 RAISERROR('transfer.reverseMerchant', 16, 1);
