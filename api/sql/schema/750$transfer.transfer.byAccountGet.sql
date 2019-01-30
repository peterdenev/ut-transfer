ALTER PROCEDURE [transfer].[transfer.byAccountGet]
    @startDate DATETIME = NULL,
    @endDate DATETIME = NULL,
    @processingCode INT = NULL,
    @channelType NVARCHAR(50) = NULL,
    @deviceID NVARCHAR(50) = NULL,
    @beneficiaryName NVARCHAR(200) = NULL,
    @userAvailableAccounts core.arrayList READONLY,
    @pageSize INT = 25, -- how many rows will be returned per page
    @pageNumber INT = 1, -- which page number to display
    @orderBy core.orderByTT READONLY, -- what kind of sort to be used ascending or descending & on which column results to be sorted
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
    DECLARE @callParams XML
    DECLARE @startRow INT
    DECLARE @endRow INT
    DECLARE @sortOrder NVARCHAR(5) = 'ASC'
    DECLARE @sortBy NVARCHAR(50) = 'transferDateTime'
BEGIN TRY
    -- checks if the user has a right to make the operation
    DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @RETURN INT = 0
    EXEC @RETURN = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
    IF @RETURN != 0
    BEGIN
        RETURN 55555
    END

    IF OBJECT_ID('tempdb..#transferDetails') IS NOT NULL
    BEGIN
        DROP TABLE #transferDetails
    END

    SET @startRow = (@pageNumber - 1) * @pageSize + 1
    SET @endRow = @startRow + @pageSize - 1
    SELECT TOP 1 @sortOrder = dir, @sortBy = field FROM @orderBy

    SET @callParams =
        ( SELECT @startDate AS startDate,
            @endDate AS endDate,
            @processingCode AS processingCode,
            @channelType AS channelType,
            @deviceID AS deviceID,
            @beneficiaryName AS beneficiaryName,
            @pageSize AS pageSize,
            @pageNumber AS pageNumber,
            (SELECT * FROM @orderBy rows FOR XML AUTO, TYPE) AS orderBy,
            (SELECT * FROM @meta rows FOR XML AUTO, TYPE) AS meta
        FOR XML RAW('params'), TYPE)

    ;WITH transferDetails AS
    (
        SELECT
            it.itemName AS typeTransaction,
            t.transferId,
            t.channelType,
            CONVERT(VARCHAR(19), t.transferDateTime, 120) [transferDateTime],
            t.channelId AS channelId,
            t.transferCurrency AS transferCurrency,
            ISNULL(t.transferAmount, 0) AS transferAmount,
            CASE WHEN ISNULL(tp.[status], 2) <> 2 THEN tp.[status] ELSE t.issuerTxState END AS issuerTxState,
            t.description AS description,
            t.sourceAccount AS sourceAccount,
            t.destinationAccount AS destinationAccount,
            t.destinationAccountHolder AS beneficiaryName,
            ROW_NUMBER() OVER ( ORDER BY
                CASE
                    WHEN @sortOrder = 'ASC' THEN
                        CASE
                            WHEN @sortBy = 'typeTransaction' THEN it.itemName
                            WHEN @sortBy = 'channelType' THEN t.channelType
                            WHEN @sortBy = 'transferDateTime' THEN CONVERT(NVARCHAR(50), t.transferDateTime, 121)
                            WHEN @sortBy = 'transferCurrency' THEN t.transferCurrency
                            WHEN @sortBy = 'beneficiaryName' THEN t.destinationAccountHolder
                            WHEN @sortBy = 'transferAmount' THEN REPLICATE('0', 30 - LEN(t.transferAmount)) + CAST(ISNULL(t.transferAmount, 0) AS NVARCHAR(50))
                        END
                END ASC,
                CASE
                    WHEN @sortOrder = 'DESC'
                        THEN CASE
                            WHEN @sortBy = 'typeTransaction' THEN it.itemName
                            WHEN @sortBy = 'channelType' THEN t.channelType
                            WHEN @sortBy = 'transferDateTime' THEN CONVERT(NVARCHAR(50), t.transferDateTime, 121)
                            WHEN @sortBy = 'transferCurrency' THEN t.transferCurrency
                            WHEN @sortBy = 'beneficiaryName' THEN t.destinationAccountHolder
                            WHEN @sortBy = 'transferAmount' THEN REPLICATE('0', 30 - LEN(t.transferAmount)) + CAST(ISNULL(t.transferAmount, 0) AS NVARCHAR(50))
                        END
                END DESC
            ) AS rowNum,
            COUNT(*) OVER (PARTITION BY 1) AS recordsTotal
        FROM [transfer].[transfer] t
        LEFT JOIN core.itemName it ON it.itemNameId = t.transferTypeId
        LEFT JOIN transfer.pending tp ON tp.pullTransactionId = t.transferId
        WHERE
            (sourceAccount IN (SELECT value FROM @userAvailableAccounts) OR destinationAccount IN (SELECT value FROM @userAvailableAccounts))
            AND ISNULL(tp.[status], 0) <> 1
            AND (@startDate IS NULL OR t.transferDateTime >= @startDate)
            AND (@endDate IS NULL OR t.transferDateTime <= @endDate)
            AND (@processingCode IS NULL OR t.transferTypeId = @processingCode)
            AND (@channelType IS NULL OR t.channelType = @channelType)
            AND (@deviceID IS NULL OR t.channelId = @deviceID)
            AND (@beneficiaryName IS NULL OR t.destinationAccountHolder LIKE '%' + @beneficiaryName + '%')
    )
    SELECT
        typeTransaction,
        transferId,
        channelType,
        transferDateTime,
        channelId,
        transferCurrency,
        transferAmount,
        issuerTxState,
        description,
        sourceAccount,
        destinationAccount,
        rowNum,
        recordsTotal,
        COUNT(*) OVER (PARTITION BY 1) AS recordsPageTotal
    INTO #transferDetails
    FROM transferDetails
    WHERE rowNum BETWEEN @startRow AND @endRow

    SELECT 'transferDetails' AS resultSetName

    SELECT
        typeTransaction,
        transferId,
        channelType,
        transferDateTime,
        channelId,
        transferCurrency,
        transferAmount,
        issuerTxState,
        description,
        sourceAccount,
        destinationAccount,
        rowNum,
        recordsTotal,
        recordsPageTotal
    FROM #transferDetails
    WHERE rowNum BETWEEN @startRow AND @endRow
    ORDER BY rowNum

    SELECT 'pagination' AS resultSetName

    SELECT TOP 1
        @pageSize AS pageSize,
        recordsTotal AS recordsTotal,
        @pageNumber AS pageNumber,
        (recordsTotal - 1) / @pageSize + 1 AS pagesTotal
    FROM #transferDetails

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    EXEC [core].[error]
    RETURN 55555
END CATCH
