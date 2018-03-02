ALTER PROCEDURE [transfer].[push.confirmMerchant]
    @transferId BIGINT,
    @transferIdMerchant VARCHAR(50),
    @type VARCHAR(50),
    @message VARCHAR(250),
    @details XML
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    transferIdMerchant = @transferIdMerchant,
    merchantTxState = 2
WHERE
    transferId = @transferId AND
    merchantTxState = 1

DECLARE @COUNT INT = @@ROWCOUNT

SET @type = ISNULL (@type, 'transfer.push.confirmMerchant')

EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'confirm',
    @source = 'merchant',
    @message = @message,
    @udfDetails = @details

IF @COUNT <> 1 RAISERROR('transfer.confirmMerchant', 16, 1);


