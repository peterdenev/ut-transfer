ALTER PROCEDURE [transfer].[push.failIssuer]
    @transferId bigint,
    @type varchar(50),
    @message varchar(250),
    @issuerResponseCode varchar(10), 
    @issuerResponseMessage varchar(250),
    @details XML
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    issuerTxState = 3,
    issuerResponseCode=@issuerResponseCode,
    issuerResponseMessage=@issuerResponseMessage
WHERE
    transferId = @transferId 

EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'fail',
    @source = 'issuer',
    @message = @message,
    @udfDetails = @details

