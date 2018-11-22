ALTER PROCEDURE [transfer].[report.userTransfers]
    @startDate DATETIME2(0), -- transaction start date
    @endDate DATETIME2(0), -- transaction end date
    @customerNumber NVARCHAR(20), -- filter by customer number
    @pageSize INT = 25, -- how many rows will be returned per page
    @pageNumber INT = 1, -- which page number to display
    @orderBy core.orderByTT READONLY, -- what kind of sort to be used ascending or descending & on which column results to be sorted
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
    DECLARE @startRow INT = (@pageNumber - 1) * @pageSize + 1
    DECLARE @endRow INT = @startRow + @pageSize - 1
    DECLARE @sortOrder NVARCHAR(5)
    DECLARE @sortBy NVARCHAR(50)

    -- checks if the user has a right to make the operation
    DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @RETURN INT = 0
    EXEC @RETURN = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
    IF @RETURN != 0
    BEGIN
        RETURN 55555
    END

    IF OBJECT_ID('tempdb..#transfers') IS NOT NULL
    BEGIN
        DROP TABLE #transfers
    END

    SELECT TOP 1
        @sortOrder = ISNULL(dir, 'ASC'),
        @sortBy = ISNULL(field, 'transferDateTime')
    FROM @orderBy

    ;WITH transfers AS
    (
        SELECT
            c.actorId,
            c.personName AS senderName,
            c.customerNumber,
            c.userName,
            t.sourceAccount AS senderAccount,
            t.destinationAccount AS beneficiaryAccount,
            t.transferDateTime,
            t.transferAmount,
            t.transferCurrency,
            t.[description],
            ROW_NUMBER() OVER ( ORDER BY
                CASE
                    WHEN @sortOrder = 'ASC' THEN
                        CASE
                            WHEN @sortBy = 'transferDateTime' THEN t.transferDateTime
                            --WHEN @sortBy = 'transferDateTime' THEN CONVERT(NVARCHAR(50), t.transferDateTime, 121)
                        END
                END ASC,
                CASE
                    WHEN @sortOrder = 'DESC'
                        THEN CASE
                            WHEN @sortBy = 'transferDateTime' THEN t.transferDateTime
                            --WHEN @sortBy = 'transferDateTime' THEN CONVERT(NVARCHAR(50), t.transferDateTime, 121)
                        END
                END DESC
            ) AS rowNum,
            COUNT(*) OVER (PARTITION BY 1) AS recordsTotal
        FROM [integration].[vCustomer] c
        JOIN [transfer].[transfer] t ON t.channelId = c.actorId
        WHERE transferDateTime >= @startDate
            AND transferDateTime < @endDate
            AND (@customerNumber IS NULL OR c.customerNumber = @customerNumber)
    )

    SELECT
        actorId,
        senderName,
        customerNumber,
        userName,
        senderAccount,
        beneficiaryAccount,
        transferDateTime,
        transferAmount,
        transferCurrency,
        [description],
        rowNum,
        recordsTotal
    INTO #transfers
    FROM transfers
    WHERE rowNum BETWEEN @startRow AND @endRow

    SELECT 'transfers' AS resultSetName

    SELECT
        actorId,
        senderName,
        customerNumber,
        userName,
        senderAccount,
        beneficiaryAccount,
        transferDateTime,
        transferAmount,
        transferCurrency,
        [description],
        rowNum,
        recordsTotal
    FROM #transfers
    ORDER BY rowNum

    SELECT 'pagination' AS resultSetName

    SELECT TOP 1
        @pageSize AS pageSize,
        recordsTotal AS recordsTotal,
        @pageNumber AS pageNumber,
        (recordsTotal - 1) / @pageSize + 1 AS pagesTotal
    FROM #transfers

    DROP TABLE #transfers
