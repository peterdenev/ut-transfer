ALTER PROCEDURE [transfer].[push.failMerchant]
    @transferId BIGINT,
    @type VARCHAR(50),
    @message VARCHAR(250),
    @details XML
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    merchantTxState = 3
WHERE
    transferId = @transferId AND
    merchantTxState = 1

DECLARE @COUNT INT = @@ROWCOUNT
EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'fail',
    @source = 'merchant',
    @message = @message,
    @udfDetails = @details

IF @COUNT <> 1 RAISERROR('transfer.failMerchant', 16, 1);
