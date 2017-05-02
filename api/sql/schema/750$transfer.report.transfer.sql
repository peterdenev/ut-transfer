ALTER PROCEDURE [transfer].[report.transfer]
    @cardNumber varchar(20),
    @accountNumber varchar(100),
    @deviceId varchar(100),
    @processingCode varchar(100),
    @startDate date,
    @endDate date,
    @issuerTxState int,
    @merchantName varchar(100),
    @pageNumber int, -- page number for result
    @pageSize int, -- page size of result
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
SET NOCOUNT ON

DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
DECLARE @actionID VARCHAR(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return INT = 0
DECLARE @totalRows INT

EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = NULL, @meta = @meta
IF @return != 0
    RETURN 55555

IF @pageNumber IS NULL
    SET @pageNumber = 1

IF @pagesize IS NULL
    SET @pageSize = 25

DECLARE @startRow INT = (@pageNumber - 1) * @pageSize + 1
DECLARE @endRow INT = @startRow + @pageSize - 1

IF OBJECT_ID('tempdb..#transfersReport') IS NOT NULL
    DROP TABLE #transfersReport

;WITH CTE AS
    (
        SELECT
            t.[transferId],
            c.cardNumber [cardNumber],
            t.[transferDateTime],
            t.[sourceAccount],
            t.[destinationAccount],
            t.[transferType] [description],
            t.[transferIdAcquirer],
            t.[transferAmount],
            t.[transferCurrency],
            t.[requestDetails].value('(/root/terminalId)[1]', 'varchar(8)') [terminalId],
            t.[requestDetails].value('(/root/terminalName)[1]', 'varchar(40)') [terminalName],
            ISNULL(t.errorMessage, 'Success') [responseCode],
            t.[issuerTxStateName],
            ISNULL(t.reverseMessage, t.reverseErrorMessage) [reversalCode],
            t.[merchantId] [merchantName],
            NULL [additionalInfo],
            t.style,
            t.alerts,
            ROW_NUMBER() OVER(ORDER BY t.[transferId]) as [RowNum],
            COUNT(*) OVER(PARTITION BY 1) AS [recordsTotal]
        FROM
            [integration].[vTransferEvent] t
        INNER JOIN
            [card].[card] c ON c.cardId = t.cardId
        WHERE
            (@accountNumber IS NULL OR t.[sourceAccount] LIKE '%' + @accountNumber + '%')
            AND (@startDate IS NULL OR t.[transferDateTime] >= @startDate)
            AND (@endDate IS NULL OR t.[transferDateTime] < DATEADD(d, 1, @endDate))
            AND (@issuerTxState IS NULL OR t.[issuerTxState] = @issuerTxState)
            AND (@cardNumber IS NULL OR c.[cardNumber] LIKE '%' + @cardNumber + '%')
            AND (@deviceId IS NULL OR t.[requestDetails].value('(/root/terminalId)[1]', 'varchar(8)') LIKE '%' + @deviceId + '%')
            AND (@processingCode IS NULL OR t.[transferTypeId] = @processingCode)
            AND (@merchantName IS NULL OR t.[merchantId] LIKE '%' + @merchantName + '%')
    )

SELECT
    [transferId],
    [cardNumber],
    [transferDateTime],
    [sourceAccount],
    [destinationAccount],
    [description],
    [transferIdAcquirer],
    [transferAmount],
    [transferCurrency],
    [terminalId],
    [terminalName],
    [responseCode],
    [issuerTxStateName],
    [reversalCode],
    [merchantName],
    [additionalInfo],
    [style],
    [alerts],
    [RowNum],
    [recordsTotal]
INTO #transfersReport
FROM cte
WHERE (RowNum BETWEEN @startRow AND @endRow) OR (@startRow >= recordsTotal AND RowNum > recordsTotal - (recordsTotal % @pageSize))

SELECT 'transfers' AS resultSetName

SELECT
    [transferId],
    [cardNumber],
    [transferDateTime],
    [sourceAccount],
    [destinationAccount],
    [description],
    [transferIdAcquirer],
    [transferAmount],
    [transferCurrency],
    [terminalId],
    [terminalName],
    [responseCode],
    [issuerTxStateName],
    [reversalCode],
    [merchantName],
    [additionalInfo],
    [alerts],
    [style]
FROM  #transfersReport
ORDER BY rowNum desc

SELECT 'pagination' AS resultSetName

SELECT TOP 1
    @pageSize AS pageSize,
    recordsTotal AS recordsTotal,
    CASE WHEN @pageNumber < (recordsTotal - 1) / @pageSize + 1 THEN @pageNumber ELSE (recordsTotal - 1) / @pageSize + 1 END AS pageNumber,
    (recordsTotal - 1) / @pageSize + 1 AS pagesTotal
FROM #transfersReport

DROP TABLE #transfersReport
