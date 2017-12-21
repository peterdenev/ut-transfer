ALTER PROCEDURE [transfer].[push.failReversalLedger]
    @transferId bigint,
    @type varchar(50),
    @message varchar(250),
    @details XML
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    expireCountLedger = ISNULL(expireCountLedger, 0) + 1
WHERE
    transferId = @transferId

EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'failReversal',
    @source = 'ledger',
    @message = @message,
    @udfDetails = @details
