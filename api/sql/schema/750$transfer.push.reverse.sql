ALTER  PROCEDURE [transfer].[push.reverse]
    @transferId bigint,
    @type varchar(50),
    @message varchar(250),
    @details XML
AS
SET NOCOUNT ON

DECLARE @today DATETIME = SYSDATETIMEOFFSET ()
UPDATE
    [transfer].[transfer]
SET
    issuerTxState = 3,
    reversed = 1,
    reversalDateTime = @today
WHERE
    transferId = @transferId AND
    issuerTxState = 2

DECLARE @COUNT int = @@ROWCOUNT
EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @source = 'issuer',
    @message = @message,
    @udfDetails = @details

IF @COUNT <> 1 RAISERROR('transfer.reverse', 16, 1);
