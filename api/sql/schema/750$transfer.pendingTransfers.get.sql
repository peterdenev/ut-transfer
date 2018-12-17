ALTER PROCEDURE [transfer].[pendingTransfers.get] -- this sp gets transactions pending approval
    @userAvailableAccounts core.arrayList READONLY, -- available accounts for the user maiking the operation
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
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

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
        ( SELECT
            (SELECT * FROM @userAvailableAccounts rows FOR XML AUTO, TYPE) AS availableAccounts,
            @pageSize AS pageSize,
            @pageNumber AS pageNumber,
            (SELECT * FROM @orderBy rows FOR XML AUTO, TYPE) AS orderBy,
            (SELECT * FROM @meta rows FOR XML AUTO, TYPE) AS meta
        FOR XML RAW('params'), TYPE)

    ;WITH transferDetails AS
    (
        SELECT
            cin.itemName AS typeTransaction,
            t.transferId,
            t.channelType,
            t.transferDateTime,
            t.channelId AS channelId,
            t.transferCurrency AS transferCurrency,
            ISNULL(t.transferAmount, 0) AS transferAmount,
            tp.status,
            t.description AS description,
            t.sourceAccount AS sourceAccount,
            t.destinationAccount AS destinationAccount,
            tp.initiatorName,
            ROW_NUMBER() OVER ( ORDER BY
                CASE
                    WHEN @sortOrder = 'ASC' THEN
                        CASE
                            WHEN @sortBy = 'typeTransaction' THEN cin.itemName
                            WHEN @sortBy = 'channelType' THEN t.channelType
                            WHEN @sortBy = 'transferDateTime' THEN CONVERT(NVARCHAR(50), t.transferDateTime, 121)
                            WHEN @sortBy = 'transferCurrency' THEN t.transferCurrency
                            WHEN @sortBy = 'transferAmount' THEN REPLICATE('0', 30 - LEN(t.transferAmount)) + CAST(ISNULL(t.transferAmount, 0) AS NVARCHAR(50))
                        END
                END ASC,
                CASE
                    WHEN @sortOrder = 'DESC'
                        THEN CASE
                            WHEN @sortBy = 'typeTransaction' THEN cin.itemName
                            WHEN @sortBy = 'channelType' THEN t.channelType
                            WHEN @sortBy = 'transferDateTime' THEN CONVERT(NVARCHAR(50), t.transferDateTime, 121)
                            WHEN @sortBy = 'transferCurrency' THEN t.transferCurrency
                            WHEN @sortBy = 'transferAmount' THEN REPLICATE('0', 30 - LEN(t.transferAmount)) + CAST(ISNULL(t.transferAmount, 0) AS NVARCHAR(50))
                        END
                END DESC
            ) AS rowNum,
            COUNT(*) OVER (PARTITION BY 1) AS recordsTotal
    FROM
        [transfer].[transfer] t
    JOIN
        [transfer].pending tp ON tp.[pullTransactionId] = t.[transferId]
    JOIN
        @userAvailableAccounts an ON an.[value] = tp.[approvalAccountNumber]
    JOIN
        core.itemName cin ON cin.itemNameId = t.transferTypeId
    WHERE
        tp.[status] = 1
    ) 
    SELECT
        typeTransaction,
        transferId,
        channelType,
        transferDateTime,
        channelId,
        transferCurrency,
        transferAmount,
        status,
        description,
        sourceAccount,
        destinationAccount,
        initiatorName,
        rowNum,
        recordsTotal,
        COUNT(*) OVER (PARTITION BY 1) AS recordsPageTotal
    INTO #transferDetails
    FROM transferDetails
    WHERE rowNum BETWEEN @startRow AND @endRow

    SELECT 'pendingTransactions' AS resultSetName

    SELECT
        typeTransaction,
        transferId,
        channelType,
        transferDateTime,
        channelId,
        transferCurrency,
        transferAmount,
        status,
        description,
        sourceAccount,
        destinationAccount,
        initiatorName,
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
