ALTER PROCEDURE [transfer].[push.confirmIssuer]
    @transferId BIGINT,
    @transferIdIssuer VARCHAR(50),
    @retrievalReferenceNumber VARCHAR(12),
    @acquirerFee MONEY,
    @issuerFee MONEY,
    @processorFee MONEY,
    @transferFee MONEY,
    @settlementDate VARCHAR(14),
    @actualAmount MONEY,
    @actualAmountCurrency VARCHAR(3),
    @type VARCHAR(50),
    @message VARCHAR(250),
    @details XML
AS
SET NOCOUNT ON

DECLARE @issuerSettlementDate DATETIME

IF @settlementDate IS NOT NULL
BEGIN
    IF LEN(@settlementDate) = 4
    BEGIN
        SET @issuerSettlementDate = CAST(CAST(DATEPART(YEAR, GETDATE()) AS CHAR(4)) + @settlementDate AS DATETIME)
        SET @issuerSettlementDate = DATEADD(YEAR, CASE
            WHEN DATEPART(MONTH, @issuerSettlementDate) = 1 AND DATEPART(MONTH, GETDATE()) = 12 THEN - 1
            WHEN DATEPART(MONTH, @issuerSettlementDate) = 12 AND DATEPART(MONTH, GETDATE()) = 1 THEN 1
            ELSE 0 END, @issuerSettlementDate)
    END ELSE
    IF LEN(@settlementDate) > 4
    BEGIN
        SET @issuerSettlementDate = CAST(@settlementDate AS DATETIME)
    END
END

UPDATE
    [transfer].[transfer]
SET
    transferIdIssuer = @transferIdIssuer,
    issuerFee = ISNULL(@issuerFee, issuerFee),
    transferFee = ISNULL(@transferFee, transferFee),
    acquirerFee = ISNULL(@acquirerFee, acquirerFee),
    processorFee = ISNULL(@processorFee, processorFee),
    settlementDate = ISNULL(@issuerSettlementDate, settlementDate),
    retrievalReferenceNumber = ISNULL(@retrievalReferenceNumber, retrievalReferenceNumber),
    actualAmount = ISNULL(@actualAmount, transferAmount),
    actualAmountCurrency = ISNULL(@actualAmountCurrency, transferCurrency),
    issuerTxState = 2
WHERE
    transferId = @transferId AND
    issuerTxState = 1

DECLARE @COUNT INT = @@ROWCOUNT

SET @type = ISNULL (@type, 'transfer.push.confirmIssuer')

EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = @type,
    @state = 'confirm',
    @source = 'issuer',
    @message = @message,
    @udfDetails = @details

IF @COUNT <> 1 RAISERROR('transfer.confirmIssuer', 16, 1);
