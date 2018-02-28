ALTER PROCEDURE [transfer].[push.failReversalIssuer]
    @transferId BIGINT,
    @type VARCHAR(50),
    @message VARCHAR(250),
    @details XML
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    expireCount = ISNULL(expireCount, 0) + 1
WHERE
    transferId = @transferId

EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'failReversal',
    @source = 'issuer',
    @message = @message,
    @udfDetails = @details
