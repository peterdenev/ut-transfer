ALTER PROCEDURE [transfer].[report.transfer]
    @cardNumber varchar(20),
    @accountNumber varchar(100),
    @deviceId varchar(100),
    @processingCode varchar(100),
    @startDate datetime,
    @endDate datetime,
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

--EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = NULL, @meta = @meta
--IF @return != 0
--    RETURN 55555

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
            t.[transferAmount],
            t.[acquirerFee], 
            t.[issuerFee],
            t.[transferCurrency],
            CASE
                WHEN ((t.channelType = 'iso' AND t.[issuerTxState] IN (2, 8, 12)) OR [acquirerTxState] in (2, 8, 12)) THEN 1
                ELSE 0
            END AS success,
            ROW_NUMBER() OVER(ORDER BY t.[transferId] DESC) as [RowNum],
            COUNT(*) OVER(PARTITION BY 1) AS [recordsTotal]
        FROM
            [transfer].[transfer] t
        INNER JOIN
            [card].[card] c ON c.cardId = t.cardId
        LEFT JOIN [atm].[terminal] tl ON tl.actorId = t.channelId
        WHERE
            (@accountNumber IS NULL OR t.[sourceAccount] LIKE '%' + @accountNumber + '%')
            AND (@startDate IS NULL OR t.[transferDateTime] >= @startDate)
            AND (@endDate IS NULL OR t.[transferDateTime] <= @endDate)
            AND (@issuerTxState IS NULL OR t.[issuerTxState] = @issuerTxState)
            AND (@cardNumber IS NULL OR c.[cardNumber] LIKE '%' + @cardNumber + '%')
            -- AND (@deviceId IS NULL OR t.[requestDetails].value('(/root/terminalId)[1]', 'varchar(8)') LIKE '%' + @deviceId + '%')
            AND (@deviceId IS NULL OR tl.terminalId LIKE '%' + @deviceId + '%')
            AND (@processingCode IS NULL OR t.[transferTypeId] = @processingCode)
            AND (@merchantName IS NULL OR t.[merchantId] LIKE '%' + @merchantName + '%')
    )

-- INSERT INTO #transfersReport
SELECT
    [transferId],
    [RowNum],
    [recordsTotal],
    [transferAmount] AS transferAmountTotal,
    [acquirerFee] AS acquirerFeeTotal, 
    [issuerFee] AS issuerFeeTotal,
    [transferCurrency]
INTO #transfersReport
FROM cte
WHERE (RowNum BETWEEN @startRow AND @endRow) OR (@startRow >= recordsTotal AND RowNum > recordsTotal - (recordsTotal % @pageSize))
UNION ALL
SELECT
    NULL AS [transferId],
    MIN([recordsTotal]) + 1 AS [RowNum],
    COUNT([transferId]) AS [recordsTotal],
    SUM(ISNULL([transferAmount], 0)) AS transferAmountTotal,
    SUM(ISNULL([acquirerFee], 0)) AS acquirerFeeTotal,
    SUM(ISNULL([issuerFee], 0)) AS issuerFeeTotal,
    [transferCurrency]
FROM cte
WHERE success = 1
GROUP BY transferCurrency

SELECT 'transfers' AS resultSetName

SELECT
    t.[transferId],
    'XXXX' + c.cardNumber [cardNumber],
    convert(varchar(19), t.[transferDateTime], 120) transferDateTime,
    t.[sourceAccount],
    t.[destinationAccount],
    t.[transferType] [description],
    t.[transferIdAcquirer],
    t.[transferAmount],
    t.[acquirerFee], 
    t.[issuerFee],
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
    r.rowNum
FROM
    #transfersReport r
JOIN
    transfer.vTransferEvent t ON t.transferId = r.transferId
JOIN
    [card].[card] c ON c.cardId = t.cardId
UNION ALL
SELECT
    NULL AS transferId,
    NULL AS cardNumber,
    NULL AS transferDateTime,
    NULL AS sourceAccount,
    NULL AS destinationAccount,
    'TOTAL Successful' AS [description],
    CAST(r.recordsTotal AS NVARCHAR(50)) AS transferIdAcquirer,
    r.transferAmountTotal AS transferAmount,
    r.acquirerFeeTotal, 
    r.issuerFeeTotal,
    r.[transferCurrency],
    NULL AS terminalId,
    NULL AS terminalName,
    NULL AS responseCode,
    NULL AS issuerTxStateName,
    NULL AS reversalCode,
    NULL AS merchantName,
    NULL [additionalInfo],
    NULL AS style,
    NULL AS alerts,
    r.rowNum
FROM
    #transfersReport r
WHERE   r.[transferId] IS NULL
AND     (RowNum BETWEEN @startRow AND @endRow) OR (@startRow >= recordsTotal AND RowNum > recordsTotal - (recordsTotal % @pageSize))
ORDER BY
    r.rowNum, transferId desc

SELECT 'pagination' AS resultSetName

SELECT TOP 1
    @pageSize AS pageSize,
    recordsTotal AS recordsTotal,
    CASE WHEN @pageNumber < (recordsTotal - 1) / @pageSize + 1 THEN @pageNumber ELSE (recordsTotal - 1) / @pageSize + 1 END AS pageNumber,
    (recordsTotal - 1) / @pageSize + 1 AS pagesTotal
FROM #transfersReport

DROP TABLE #transfersReport
