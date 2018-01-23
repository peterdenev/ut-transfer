ALTER PROCEDURE [transfer].[push.confirmIssuer]
    @transferId bigint,
    @transferIdIssuer varchar(50),
    @retrievalReferenceNumber varchar(12),
    @acquirerFee money,
    @issuerFee money,
    @transferFee money,
    @settlementDate varchar(14),
    @type varchar(50),
    @message varchar(250),
    @details XML
AS
SET NOCOUNT ON

DECLARE @issuerSettlementDate datetime

IF @settlementDate IS NOT NULL
BEGIN
    IF LEN(@settlementDate) = 4
    BEGIN
        SET @issuerSettlementDate = CAST(CAST(DATEPART(YEAR, GETDATE()) AS CHAR(4)) + @settlementDate AS DATETIME)
        SET @issuerSettlementDate = DATEADD(YEAR, CASE
            WHEN DATEPART(MONTH, @issuerSettlementDate) = 1 AND DATEPART(MONTH, GETDATE()) = 12 THEN -1
            WHEN DATEPART(MONTH, @issuerSettlementDate) = 12 AND DATEPART(MONTH, GETDATE()) = 1 THEN 1
            ELSE 0 END, @issuerSettlementDate)
    END ELSE
    IF LEN(@settlementDate) > 4
    BEGIN
        SET @issuerSettlementDate = CAST(@settlementDate AS datetime)
    END
END

UPDATE
    [transfer].[transfer]
SET
    transferIdIssuer = @transferIdIssuer,
    issuerFee = ISNULL(@issuerFee, issuerFee),
    transferFee = ISNULL(@transferFee, transferFee),
    acquirerFee = ISNULL(@acquirerFee, acquirerFee),
    settlementDate = ISNULL(@issuerSettlementDate, settlementDate),
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
