ALTER PROCEDURE [transfer].[transferDetails.get]
    @startDate DATETIME = NULL,
    @endDate DATETIME = NULL,
    @processingCode INT = NULL,
    @channelType NVARCHAR(50) = NULL,
    @deviceID NVARCHAR(50) = NULL,
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
            @pageSize AS pageSize,
            @pageNumber AS pageNumber,
            (SELECT * FROM @orderBy rows FOR XML AUTO, TYPE) AS orderBy,
            (SELECT * FROM @meta rows FOR XML AUTO, TYPE) AS meta
        FOR XML RAW('params'), TYPE)

    ;WITH transferDetails AS
    (
        SELECT
            it.itemName AS typeTransaction, -- p.Description type_transaction,
            NULL AS branchCode, -- ISNULL(b.NomItemText,'???') branch_code,
            t.transferId AS transferId, -- m.msgid,
            t.channelType AS channelType, -- d.DeviceType,
            CONVERT(VARCHAR(19), t.transferDateTime, 120) [transferDateTime],
            NULL AS retrievalReferenceNumber, -- m.retrieval_reference_number,
            NULL AS datetimeTransmission, -- m.datetime_transmission,
            t.channelId AS channelId, -- m.acceptor_terminal,
            t.transferCurrency AS transferCurrency,
            ISNULL(t.transferAmount, 0) AS transferAmount, -- m.amount_transaction,
            t.amountBilling AS amountBilling, -- m.fee_acq_transaction + ISNULL(fee_fwd_transaction,0) AS amount_billing,
            t.amountSettlement AS amountSettlement, -- t.acquirerFee +-- ISNULL(m.amount_transaction,0) + ISNULL(fee_acq_transaction,0) + ISNULL(fee_fwd_transaction,0) AS amount_settlement
            t.transferIdIssuer AS transferIdIssuer,
            t.transferIdAcquirer AS transferIdAcquirer,
            t.transferIdLedger AS transferIdLedger,
            t.transferIdMerchant AS transferIdMerchant,
            t.issuerTxState AS issuerTxState,
            t.acquirerTxState AS acquirerTxState,
            t.ledgerTxState AS ledgerTxState,
            t.merchantTxState AS merchantTxState,
            t.description AS description,
            NULL AS isError, -- WHEN alerts != '' THEN ' style="background-color:#F3F781"'
            NULL AS alerts,
            ROW_NUMBER() OVER ( ORDER BY
                CASE
                    WHEN @sortOrder = 'ASC' THEN
                        CASE
                            WHEN @sortBy = 'typeTransaction' THEN it.itemName
                            WHEN @sortBy = 'channelType' THEN t.channelType
                            WHEN @sortBy = 'transferDateTime' THEN CONVERT(NVARCHAR(50), t.transferDateTime, 121)
                            WHEN @sortBy = 'transferCurrency' THEN t.transferCurrency
                            WHEN @sortBy = 'transferAmount' THEN REPLICATE('0', 30 - LEN(t.transferAmount)) + CAST(ISNULL(t.transferAmount, 0) AS NVARCHAR(50))
                            WHEN @sortBy = 'amountBilling' THEN REPLICATE('0', 30 - LEN(t.amountBilling)) + CAST(t.amountBilling AS NVARCHAR(50))
                            WHEN @sortBy = 'amountSettlement' THEN REPLICATE('0', 30 - LEN(t.amountSettlement)) + CAST(t.amountSettlement AS NVARCHAR(50))
                        END
                END ASC,
                CASE
                    WHEN @sortOrder = 'DESC'
                        THEN CASE
                            WHEN @sortBy = 'typeTransaction' THEN it.itemName
                            WHEN @sortBy = 'channelType' THEN t.channelType
                            WHEN @sortBy = 'transferDateTime' THEN CONVERT(NVARCHAR(50), t.transferDateTime, 121)
                            WHEN @sortBy = 'transferCurrency' THEN t.transferCurrency
                            WHEN @sortBy = 'transferAmount' THEN REPLICATE('0', 30 - LEN(t.transferAmount)) + CAST(ISNULL(t.transferAmount, 0) AS NVARCHAR(50))
                            WHEN @sortBy = 'amountBilling' THEN REPLICATE('0', 30 - LEN(t.amountBilling)) + CAST(t.amountBilling AS NVARCHAR(50))
                            WHEN @sortBy = 'amountSettlement' THEN REPLICATE('0', 30 - LEN(t.amountSettlement)) + CAST(t.amountSettlement AS NVARCHAR(50))
                        END
                END DESC
            ) AS rowNum,
            COUNT(*) OVER (PARTITION BY 1) AS recordsTotal
        FROM [transfer].[vTransfer] t
        LEFT JOIN core.itemName it ON it.itemNameId = t.transferTypeId
        WHERE (@startDate IS NULL OR t.transferDateTime >= @startDate)
            AND (@endDate IS NULL OR t.transferDateTime <= @endDate)
            AND (@processingCode IS NULL OR t.transferTypeId = @processingCode)
            AND (@channelType IS NULL OR t.channelType = @channelType)
            AND (@deviceID IS NULL OR t.channelId = @deviceID)
    --AND t.channelType = 'ATM'
    )
    SELECT
        typeTransaction,
        branchCode,
        transferId,
        channelType,
        transferDateTime,
        retrievalReferenceNumber,
        datetimeTransmission,
        channelId,
        transferCurrency,
        transferAmount,
        amountBilling,
        amountSettlement,
        transferIdIssuer,
        transferIdAcquirer,
        transferIdLedger,
        transferIdMerchant,
        issuerTxState,
        acquirerTxState,
        ledgerTxState,
        merchantTxState,
        description,
        isError,
        alerts,
        rowNum,
        recordsTotal,
        COUNT(*) OVER (PARTITION BY 1) AS recordsPageTotal
    INTO #transferDetails
    FROM transferDetails
    WHERE rowNum BETWEEN @startRow AND @endRow
--    ORDER BY rowNum

    SELECT 'transferDetails' AS resultSetName

    SELECT
        typeTransaction,
        branchCode,
        transferId,
        channelType,
        transferDateTime,
        retrievalReferenceNumber,
        datetimeTransmission,
        channelId,
        transferCurrency,
        transferAmount,
        amountBilling,
        amountSettlement,
        transferIdIssuer,
        transferIdAcquirer,
        transferIdLedger,
        transferIdMerchant,
        issuerTxState,
        acquirerTxState,
        ledgerTxState,
        merchantTxState,
        description,
        isError,
        alerts,
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
