ALTER PROCEDURE [transfer].[push.confirmIssuer]
    @transferId bigint,
    @transferIdIssuer varchar(50),
    @type varchar(50),
    @message varchar(250),
    @issuerResponseCode varchar(10), 
    @issuerResponseMessage varchar(250),
    @networkData varchar(20),
    @originalResponse TEXT,
    @stan char(6),
    @settlementDate varchar(10),
    @details XML
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    transferIdIssuer = @transferIdIssuer,
    issuerTxState = 2,
    issuerResponseCode=@issuerResponseCode,
    issuerResponseMessage=@issuerResponseMessage,
    networkData = @networkData,
    originalResponse = @originalResponse,
    stan = @stan,
    settlementDate = @settlementDate
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
