ALTER PROCEDURE [transfer].[push.confirmIssuer]
    @transferId bigint,
    @transferIdIssuer varchar(50),
    @retrievalReferenceNumber varchar(12),
    @issuerFee money,
    @transferFee money,
    @settlementDate date,
    @type varchar(50),
    @message varchar(250),
    @details XML
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    transferIdIssuer = @transferIdIssuer,
    issuerFee = ISNULL(@issuerFee, issuerFee),
    transferFee = ISNULL(@transferFee, transferFee),
    settlementDate = ISNULL(@settlementDate, settlementDate),
    retrievalReferenceNumber = ISNULL(@retrievalReferenceNumber, retrievalReferenceNumber),
    issuerTxState = 2
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
