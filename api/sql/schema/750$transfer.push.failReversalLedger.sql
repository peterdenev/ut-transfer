ALTER PROCEDURE [transfer].[push.failReversalLedger]
    @transferId BIGINT,
    @type VARCHAR(50),
    @message VARCHAR(250),
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
