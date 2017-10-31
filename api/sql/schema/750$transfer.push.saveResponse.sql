ALTER PROCEDURE [transfer].[push.saveResponse]
    @transferId bigint,
    @type varchar(50),
    @message varchar(250),
    @networkData varchar(20),
    @mcResponse varchar(2000),
    @settlementDate varchar(5),
    @responseCode char(2),
    @stan char(6),
    @details XML
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
	networkData = @networkData,
    mcResponse = @mcResponse,
    settlementDate = CONVERT(datetime,CONCAT(YEAR(GETDATE()),'-',SUBSTRING(@settlementDate,1,2),'-',SUBSTRING(@settlementDate,2,4))),
    responseCode = @responseCode,
    stan = @stan
    
WHERE
    transferId = @transferId AND
    issuerTxState = 1

DECLARE @COUNT int = @@ROWCOUNT

SET @type = ISNULL (@type, 'transfer.push.saveResponse')

EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'save',
    @source = 'Response',
    @message = @message,
    @udfDetails = @details

IF @COUNT <> 1 RAISERROR('transfer.saveResponse', 16, 1);