CREATE PROCEDURE [transfer].[report.settlementDetails]
    @settlementDate datetime, -- setalment report date
    @pageSize INT = 25, -- how many rows will be returned per page
    @pageNumber INT = 1, -- which page number to display
    @orderBy core.orderByTT READONLY, -- what kind of sort to be used ascending or descending & on which column results to be sorted
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

AS
    DECLARE @callParams XML
    DECLARE @startRow INT
    DECLARE @endRow INT
    DECLARE @sortOrder NVARCHAR(5) = N'ASC'
    DECLARE @sortBy NVARCHAR(50) = N'transferId'
BEGIN TRY
    -- checks if the user has a right to make the operation
    DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @RETURN INT = 0
    EXEC @RETURN = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
    IF @RETURN != 0
    BEGIN
        RETURN 55555
    END

    IF OBJECT_ID('tempdb..#settlementDetails') IS NOT NULL
    BEGIN
        DROP TABLE #settlementDetails
    END

    SET @startRow = (@pageNumber - 1) * @pageSize + 1
    SET @endRow = @startRow + @pageSize - 1
    SELECT TOP 1 @sortOrder = dir, @sortBy = field FROM @orderBy


    SET @callParams =
        ( SELECT @settlementDate AS settlementDate,
            (SELECT * FROM @orderBy rows FOR XML AUTO, TYPE) AS orderBy,
            (SELECT * FROM @meta rows FOR XML AUTO, TYPE) AS meta
        FOR XML RAW(N'params'), TYPE)

    ;WITH settlementDetails AS
    (
        SELECT
            v.channelType,
            v.transferId AS transferId,
            N'xxxx' + c.cardNumber AS cardNumber,
            v.transferDateTime AS transferDateTime,
            CASE
                WHEN LEN(v.localDateTime) >= 14 THEN LEFT(v.localDateTime, 8)
                WHEN LEN(v.localDateTime) >= 10 THEN LEFT(v.localDateTime, 4)
                ELSE N''
            END AS localDate,
            RIGHT(v.localDateTime, 6) AS localTime,
            CASE WHEN v.channelType = N'iso' THEN v.transferIdAcquirer ELSE v.transferId END AS transferIdAcquirer, --[Serial],
            processing.x.value(N'(processingCode)[1]', N'NVARCHAR(150)') AS processingCode,
            c.issuerId AS issuerId,
            c.cardProductName AS productName,
            n.itemName [transferType],
            CASE WHEN v.success = 1 AND n.itemCode IN (N'sale', N'withdraw') THEN v.transferAmount END AS transferAmount,
            CASE WHEN v.success = 1 THEN v.acquirerFee END AS transferFee,
            ISNULL((CASE WHEN v.success = 1 AND n.itemCode IN (N'sale', N'withdraw') THEN v.transferAmount END), 0) +
            ISNULL((CASE WHEN v.success = 1 THEN v.acquirerFee END), 0) [dueTo],
            v.transferCurrency AS transferCurrency,
            CASE WHEN v.channelType = N'iso' THEN v.transferIdIssuer ELSE v.transferId END AS transferIdIssuer, -- authorisationCode
            processing.x.value(N'(terminalId)[1]', N'NVARCHAR(150)') AS deviceId,
            processing.x.value(N'(terminalName)[1]', N'NVARCHAR(150)') AS deviceName,
            v.style,
            v.success,
            ROW_NUMBER() OVER (ORDER BY
                CASE
                    WHEN @sortOrder = N'ASC'
                        THEN CASE
                            WHEN @sortBy = N'channelType' THEN v.channelType
                            WHEN @sortBy = N'transferId' THEN REPLICATE('0', 30 - LEN(v.transferId)) + CAST(v.transferId AS NVARCHAR(50))
                            WHEN @sortBy = N'cardNumber' THEN c.cardNumber
                            WHEN @sortBy = N'transferDateTime' THEN CONVERT(NVARCHAR(50), v.transferDateTime, 121)
                            WHEN @sortBy = N'localDate' THEN
                                CASE
                                    WHEN LEN(v.localDateTime) >= 14 THEN LEFT(v.localDateTime, 8)
                                    WHEN LEN(v.localDateTime) >= 10 THEN LEFT(v.localDateTime, 4)
                                    ELSE N''
                                END
                            WHEN @sortBy = N'localTime' THEN RIGHT(v.localDateTime, 6)
                            WHEN @sortBy = N'transferIdAcquirer' THEN
                                CASE
                                    WHEN v.channelType = N'iso' THEN REPLICATE(N'0', 30 - LEN(v.transferIdAcquirer)) + CAST(v.transferIdAcquirer AS NVARCHAR(50))
                                    ELSE REPLICATE(N'0', 30 - LEN(v.transferId)) + CAST(v.transferId AS NVARCHAR(50))
                                END
                            WHEN @sortBy = N'processingCode' THEN processing.x.value(N'(processingCode)[1]', N'NVARCHAR(150)')
                            WHEN @sortBy = N'issuerId' THEN c.issuerId
                            WHEN @sortBy = N'productName' THEN c.cardProductName
                            WHEN @sortBy = N'transferType' THEN n.itemName
                            WHEN @sortBy = N'transferAmount' THEN
                                CASE
                                    WHEN v.success = 1 AND n.itemCode IN (N'sale', N'withdraw') THEN REPLICATE(N'0', 30 - LEN(v.transferAmount)) + CAST(v.transferAmount AS NVARCHAR(50))
                                END
                            WHEN @sortBy = N'transferFee' THEN
                                CASE
                                    WHEN v.success = 1 THEN REPLICATE(N'0', 30 - LEN(v.acquirerFee)) + CAST(v.acquirerFee AS NVARCHAR(50))
                                END
                            WHEN @sortBy = N'dueTo' THEN
                                CASE
                                    WHEN v.success = 1 AND n.itemCode IN (N'sale', N'withdraw') THEN REPLICATE(N'0', 30 - LEN(ISNULL(v.transferAmount, 0) + ISNULL(v.acquirerFee, 0))) + CAST(ISNULL(v.transferAmount, 0) + ISNULL(v.acquirerFee, 0) AS NVARCHAR(50))
                                END
                            WHEN @sortBy = N'transferCurrency' THEN v.transferCurrency
                            WHEN @sortBy = N'transferIdIssuer' THEN
                                CASE
                                    WHEN v.channelType = N'iso' THEN REPLICATE(N'0', 30 - LEN(v.transferIdIssuer)) + CAST(v.transferIdIssuer AS NVARCHAR(50))
                                    ELSE REPLICATE(N'0', 30 - LEN(v.transferId)) + CAST(v.transferId AS NVARCHAR(50))
                                END
                            WHEN @sortBy = N'deviceId' THEN c.cardProductName
                            WHEN @sortBy = N'deviceName' THEN c.cardProductName
                        END
                    END ASC,
                CASE
                    WHEN @sortOrder = N'DESC' THEN
                        CASE
                            WHEN @sortBy = N'channelType' THEN v.channelType
                            WHEN @sortBy = N'transferId' THEN REPLICATE('0', 30 - LEN(v.transferId)) + CAST(v.transferId AS NVARCHAR(50))
                            WHEN @sortBy = N'cardNumber' THEN c.cardNumber
                            WHEN @sortBy = N'transferDateTime' THEN CONVERT(NVARCHAR(50), v.transferDateTime, 121)
                            WHEN @sortBy = N'localDate' THEN
                                CASE
                                    WHEN LEN(v.localDateTime) >= 14 THEN LEFT(v.localDateTime, 8)
                                    WHEN LEN(v.localDateTime) >= 10 THEN LEFT(v.localDateTime, 4)
                                    ELSE N''
                                END
                            WHEN @sortBy = N'localTime' THEN RIGHT(v.localDateTime, 6)
                            WHEN @sortBy = N'transferIdAcquirer' THEN
                                CASE
                                    WHEN v.channelType = N'iso' THEN REPLICATE(N'0', 30 - LEN(v.transferIdAcquirer)) + CAST(v.transferIdAcquirer AS NVARCHAR(50))
                                    ELSE REPLICATE(N'0', 30 - LEN(v.transferId)) + CAST(v.transferId AS NVARCHAR(50))
                                END
                            WHEN @sortBy = N'processingCode' THEN processing.x.value(N'(processingCode)[1]', N'NVARCHAR(150)')
                            WHEN @sortBy = N'issuerId' THEN c.issuerId
                            WHEN @sortBy = N'productName' THEN c.cardProductName
                            WHEN @sortBy = N'transferType' THEN n.itemName
                            WHEN @sortBy = N'transferAmount' THEN
                                CASE
                                    WHEN v.success = 1 AND n.itemCode IN (N'sale', N'withdraw') THEN REPLICATE(N'0', 30 - LEN(v.transferAmount)) + CAST(v.transferAmount AS NVARCHAR(50))
                                END
                            WHEN @sortBy = N'transferFee' THEN
                                CASE
                                    WHEN v.success = 1 THEN REPLICATE(N'0', 30 - LEN(v.acquirerFee)) + CAST(v.acquirerFee AS NVARCHAR(50))
                                END
                            WHEN @sortBy = N'dueTo' THEN
                                CASE
                                    WHEN v.success = 1 AND n.itemCode IN (N'sale', N'withdraw') THEN REPLICATE(N'0', 30 - LEN(ISNULL(v.transferAmount, 0) + ISNULL(v.acquirerFee, 0))) + CAST(ISNULL(v.transferAmount, 0) + ISNULL(v.acquirerFee, 0) AS NVARCHAR(50))
                                END
                            WHEN @sortBy = N'transferCurrency' THEN v.transferCurrency
                            WHEN @sortBy = N'transferIdIssuer' THEN
                                CASE
                                    WHEN v.channelType = N'iso' THEN REPLICATE(N'0', 30 - LEN(v.transferIdIssuer)) + CAST(v.transferIdIssuer AS NVARCHAR(50))
                                    ELSE REPLICATE(N'0', 30 - LEN(v.transferId)) + CAST(v.transferId AS NVARCHAR(50))
                                END
                            WHEN @sortBy = N'deviceId' THEN c.cardProductName
                            WHEN @sortBy = N'deviceName' THEN c.cardProductName
                        END
                    END DESC
            ) AS rowNum,
            COUNT(*) OVER (PARTITION BY 1) AS recordsTotal
        FROM [transfer].vTransferEvent v
        JOIN
            card.vCard c ON c.cardId = v.cardId
        JOIN
            [core].[itemName] n ON n.itemNameId = v.transferTypeId
        OUTER APPLY
            v.requestDetails.nodes(N'/root') AS processing(x)
        WHERE
            v.issuerTxState IN (2, 3)
        AND v.settlementDate >= DATEADD(DAY, DATEDIFF(DAY, 0, ISNULL(@settlementDate, GETDATE())), 0)
        AND v.settlementDate < DATEADD(DAY, DATEDIFF(DAY, 0, ISNULL(@settlementDate, GETDATE())), 1)
        AND (v.channelType = N'iso' OR c.issuerId != N'cbs')
    )
    SELECT
        sd.channelType,
        sd.transferId,
        sd.cardNumber,
        sd.transferDateTime,
--      '[Trace]' AS [Trace],
        sd.localDate,
        sd.localTime,
        sd.transferIdAcquirer,
        sd.processingCode,
        sd.issuerId,
        sd.productName,
        sd.transferType,
        sd.transferAmount,
        sd.transferFee,
        sd.dueTo,
        sd.transferCurrency,
        sd.transferIdIssuer,
        sd.deviceId,
        sd.deviceName,
        sd.style,
        sd.rowNum,
        sd.recordsTotal
    INTO #settlementDetails
    FROM settlementDetails sd
    WHERE rowNum BETWEEN @startRow AND @endRow
    UNION ALL
    SELECT
        NULL AS channelType,
        NULL AS transferId,
        NULL AS cardNumber,
        NULL AS transferDateTime,
--      '[Trace]' AS [Trace],
        NULL AS localDate,
        NULL AS localTime,
        NULL AS transferIdAcquirer,
        NULL AS processingCode,
        NULL AS issuerId,
        'Total Successfull' AS productName,
        CAST(COUNT(sd.transferId) AS NVARCHAR(50)) AS transferType,
        SUM(ISNULL(sd.transferAmount, 0)) AS transferAmount,
        SUM(ISNULL(sd.transferFee, 0)) AS transferFee,
        NULL AS dueTo,
        sd.transferCurrency,
        NULL AS transferIdIssuer,
        NULL AS deviceId,
        NULL AS deviceName,
        NULL AS style,
        MAX(sd.rowNum) + 1 AS rowNum,
        MAX(sd.recordsTotal) AS recordsTotal
    FROM settlementDetails sd
    WHERE sd.success = 1
    GROUP BY sd.transferCurrency
--    WHERE rowNum BETWEEN @startRow AND @endRow
    ORDER BY rowNum

    SELECT 'settlementDetails' AS resultSetName

    SELECT
        sd.channelType,
        sd.transferId,
        sd.cardNumber,
        CONVERT(NVARCHAR(50), sd.transferDateTime, 120) AS transferDateTime,
--      '[Trace]' AS [Trace],
        sd.localDate,
        sd.localTime,
        sd.transferIdAcquirer,
        sd.processingCode,
        sd.issuerId,
        sd.productName,
        sd.transferType,
        sd.transferAmount,
        sd.transferFee,
        sd.dueTo,
        sd.transferCurrency,
        sd.transferIdIssuer,
        sd.deviceId,
        sd.deviceName,
        sd.style,
        sd.rowNum,
        sd.recordsTotal
    FROM #settlementDetails sd
    WHERE rowNum BETWEEN @startRow AND @endRow + 1
    ORDER BY rowNum

    SELECT 'pagination' AS resultSetName

    SELECT TOP 1
        @pageSize AS pageSize,
        recordsTotal AS recordsTotal,
        @pageNumber AS pageNumber,
        (recordsTotal - 1) / @pageSize + 1 AS pagesTotal
    FROM #settlementDetails

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    EXEC [core].[error]
    RETURN 55555
END CATCH
