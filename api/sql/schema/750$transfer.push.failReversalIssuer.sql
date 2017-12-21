ALTER PROCEDURE [transfer].[push.failReversalIssuer]
    @transferId bigint,
    @type varchar(50),
    @message varchar(250),
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
