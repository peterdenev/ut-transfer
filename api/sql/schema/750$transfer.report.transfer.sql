ALTER PROCEDURE [transfer].[report.transfer]
    @transferId bigint,
    @cardNumber varchar(32),
    @traceNumber bigint,
    @accountNumber varchar(100),
    @deviceId varchar(100),
    @processingCode varchar(100),
    @startDate datetime,
    @endDate datetime,
    @issuerTxState int,
    @merchantName varchar(100),
    @channelType varchar(50),
    @pageNumber int, -- page number for result
    @pageSize int, -- page size of result
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
SET NOCOUNT ON

DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
DECLARE @cardNumberId BIGINT

-- checks if the user has a right to make the operation
DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @RETURN INT = 0
EXEC @RETURN = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
IF @RETURN != 0
BEGIN
    RETURN 55555
END

IF @cardNumber IS NOT NULL
    SET @cardNumberId = (SELECT numberId FROM [card].[number] WHERE pan = @cardNumber)

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
            t.[credentialId],
            t.[issuerId],
            t.[transferAmount],
            t.[actualAmount],
            t.[replacementAmount],
            CASE
                WHEN t.channelType = 'iso' THEN t.processorFee
                ELSE t.acquirerFee
            END [acquirerFee],
            t.[issuerFee],
            CASE t.channelType
                WHEN 'iso' THEN t.acquirerFee
                WHEN 'atm' THEN t.transferFee
            END [conveinienceFee],
            t.[transferCurrency],
            CASE
                WHEN ((t.channelType = 'iso' AND t.[issuerTxState] IN (2, 8, 12)) OR [acquirerTxState] IN (2, 8, 12)) THEN 1
                ELSE 0
            END AS success,
            ROW_NUMBER() OVER(ORDER BY t.[transferId] DESC) AS [RowNum],
            COUNT(*) OVER(PARTITION BY 1) AS [recordsTotal]
        FROM
            [transfer].[transfer] t
        INNER JOIN
            [card].[card] c ON c.cardId = t.cardId
        LEFT JOIN
            [atm].[terminal] tl ON tl.actorId = t.channelId
        WHERE
            (@transferId IS NULL OR (t.[transferId] = @transferId OR t.transferId LIKE '%' + CAST(@transferId AS VARCHAR(50)) + '%'))
            AND (@accountNumber IS NULL OR t.[sourceAccount] LIKE '%' + @accountNumber + '%')
            AND (@startDate IS NULL OR t.[transferDateTime] >= @startDate)
            AND (@endDate IS NULL OR t.[transferDateTime] <= @endDate)
            AND (@issuerTxState IS NULL OR t.[issuerTxState] = @issuerTxState)
            AND (@traceNumber IS NULL OR t.[transferId] = @traceNumber OR t.[issuerSerialNumber] = @traceNumber)
            -- AND (@cardNumber IS NULL OR c.[cardNumber] LIKE '%' + @cardNumber + '%')
            AND (@cardNumber IS NULL OR t.cardId = @cardNumberId)
            -- AND (@deviceId IS NULL OR t.[requestDetails].value('(/root/terminalId)[1]', 'VARCHAR(8)') LIKE '%' + @deviceId + '%')
            AND (@deviceId IS NULL OR tl.terminalId LIKE '%' + @deviceId + '%')
            AND (@processingCode IS NULL OR t.[transferTypeId] = @processingCode)
            AND (@merchantName IS NULL OR t.[merchantId] LIKE '%' + @merchantName + '%')
            AND (@channelType IS NULL OR t.[channelType] = @channelType)
    )
SELECT
    [transferId],
    [credentialId],
    [issuerId],
    [RowNum],
    [recordsTotal],
    [transferAmount] AS transferAmountTotal,
    [acquirerFee] AS acquirerFeeTotal,
    [issuerFee] AS issuerFeeTotal,
    [conveinienceFee] AS conveinienceFeeTotal,
    [transferCurrency],
    NULL AS recordsTotalSuccessfull
INTO
    #transfersReport
FROM
    cte
WHERE
    (RowNum BETWEEN @startRow AND @endRow) OR (@startRow >= recordsTotal AND RowNum > recordsTotal - (recordsTotal % @pageSize))
UNION ALL SELECT
    NULL AS [transferId],
    NULL AS [credentialId],
    NULL AS [issuerId],
    MIN([recordsTotal]) + ROW_NUMBER() OVER(ORDER BY [transferCurrency]) AS [RowNum],
    MIN([recordsTotal]) + COUNT(*) OVER(PARTITION BY 1) AS [recordsTotal],
    SUM(CASE WHEN success = 1 THEN ISNULL([transferAmount], 0) ELSE 0.0 END) AS transferAmountTotal,
    SUM(CASE WHEN success = 1 THEN ISNULL([acquirerFee], 0) ELSE 0.0 END) AS acquirerFeeTotal,
    SUM(CASE WHEN success = 1 THEN ISNULL([issuerFee], 0) ELSE 0.0 END) AS issuerFeeTotal,
    SUM(CASE WHEN success = 1 THEN ISNULL([conveinienceFee], 0) ELSE 0.0 END) AS conveinienceFeeTotal,
    [transferCurrency],
    COUNT(CASE WHEN success = 1 THEN 1 END) AS [recordsTotalSuccessfull]
FROM
    cte
GROUP BY
    transferCurrency

DECLARE @lastPageSize INT = @@ROWCOUNT -- we need to know if the page become bigger than max size when add totals

SELECT 'transfers' AS resultSetName

SELECT
    t.[transferId],
    r.[credentialId] [cardNumber],
    CONVERT(VARCHAR(19), t.[transferDateTime], 120) transferDateTime,
    t.[sourceAccount],
    t.[destinationAccount],
    t.[transferType] [description],
    t.[transferIdAcquirer],
    t.[transferIdIssuer],
    t.[transferAmount],
    t.[actualAmount],
    t.[replacementAmount],
    CASE
        WHEN t.channelType = 'iso' THEN t.processorFee
        ELSE t.acquirerFee
    END [acquirerFee],
    t.[issuerFee],
    CASE t.channelType
        WHEN 'iso' THEN t.acquirerFee
        WHEN 'atm' THEN t.transferFee
    END [conveinienceFee],
    t.[transferCurrency],
    t.[requestDetails].value('(/root/terminalId)[1]', 'VARCHAR(8)') [terminalId],
    t.[requestDetails].value('(/root/terminalName)[1]', 'VARCHAR(40)') [terminalName],
    CASE
        WHEN t.responseCode = '13' THEN 'Invalid Amount'
        WHEN t.responseCode = '25' THEN 'Destination Invalid'
        WHEN t.responseCode = '96' THEN 'Dispenser Fault'
        WHEN t.success = 0 THEN t.errorMessage
        ELSE 'Successful'
    END [responseDetails],
    ISNULL(ISNULL(
        t.[errorDetails].value('(/root/responseCode)[1]', 'VARCHAR(3)'),
        t.[errorDetails].value('(/params/responseCode)[1]', 'VARCHAR(3)')
    ), CASE WHEN t.success = 1 THEN '00' ELSE '96' END
    ) [responseCode],
    CASE WHEN t.[issuerTxStateName] = '' THEN 'rejected'
        ELSE t.[issuerTxStateName]
    END [issuerTxStateName],
    ISNULL(t.reverseMessage, t.reverseErrorMessage) [reversalCode],
    t.[merchantId] [merchantName],
    UPPER(t.[channelType]) [channelType],
    CASE WHEN t.issuerId != 'cbs' THEN t.issuerSerialNumber
        ELSE t.transferId
    END [traceNumber],
    CASE t.channelType
        WHEN 'iso' THEN t.transferIdAcquirer
        WHEN 'atm' THEN t.issuerSerialNumber
        ELSE t.transferId
    END [stan],
    t.retrievalReferenceNumber [rrn],
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
WHERE
-- if last page transactions + totals is bigger than pageSize we don't want to show transacions
    (RowNum BETWEEN @startRow AND @endRow) OR ((@startRow >= recordsTotal AND RowNum > recordsTotal - (recordsTotal % @pageSize) AND @lastPageSize <= @pageSize))
UNION ALL SELECT
    NULL AS transferId,
    NULL AS cardNumber,
    NULL AS transferDateTime,
    NULL AS sourceAccount,
    NULL AS destinationAccount,
    'TOTAL Successful' AS [description],
    CAST(r.recordsTotalSuccessfull AS NVARCHAR(50)) AS transferIdIssuer,
    NULL AS transferIdAcquirer,
    r.transferAmountTotal AS transferAmount,
    NULL AS actualAmount,
    NULL AS replacementAmount,
    r.acquirerFeeTotal,
    r.issuerFeeTotal,
    r.conveinienceFeeTotal,
    r.[transferCurrency],
    NULL AS terminalId,
    NULL AS terminalName,
    NULL AS responseDetails,
    NULL AS responseCode,
    NULL AS issuerTxStateName,
    NULL AS reversalCode,
    NULL AS merchantName,
    NULL AS channelType,
    NULL AS rrn,
    NULL AS traceNumber,
    NULL AS authCode,
    NULL AS [additionalInfo],
    'transferAverage' AS style,
    NULL AS alerts,
    r.rowNum
FROM
    #transfersReport r
WHERE
    r.[transferId] IS NULL AND
    ((RowNum BETWEEN @startRow AND @endRow) OR (@startRow >= recordsTotal AND RowNum > recordsTotal - (recordsTotal % @pageSize)))
ORDER BY
    r.rowNum, transferId DESC

SELECT 'pagination' AS resultSetName

SELECT TOP 1
    @pageSize AS pageSize,
    recordsTotal AS recordsTotal,
    CASE
        WHEN @pageNumber < (recordsTotal - 1) / @pageSize + 1 THEN @pageNumber
        ELSE (recordsTotal - 1) / @pageSize + 1
    END AS pageNumber,
    (recordsTotal - 1) / @pageSize + 1 AS pagesTotal
FROM
    #transfersReport
ORDER BY
    rowNum DESC

DROP TABLE #transfersReport
