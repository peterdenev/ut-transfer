ALTER PROCEDURE [transfer].[report.byDayOfWeek]
    @startDate DATETIME = NULL,
    @endDate DATETIME = NULL,
    @transferCurrency NVARCHAR(3) = NULL,
    @orderBy core.orderByTT READONLY,                  -- what kind of sort to be used ascending or descending & on which column results to be sorted
    @meta core.metaDataTT READONLY                     -- information for the user that makes the operation
AS
    DECLARE @callParams XML
    DECLARE @DATEFIRST INT = (SELECT @@DATEFIRST)
    DECLARE @sortOrder NVARCHAR(5) = 'ASC'
    DECLARE @sortBy NVARCHAR(50) = 'agreatepredicate'
BEGIN TRY
    SET DATEFIRST 1                         -- set first day of week to be Monday (default is Sunday)

     -- checks if the user has a right to make the operation
    DECLARE @actionID VARCHAR(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return INT = 0
--    EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = NULL, @meta = @meta

    SELECT TOP 1 @sortOrder = dir, @sortBy = field FROM @orderBy  

    SET @callParams = ( SELECT  @startDate AS startDate, 
                                @endDate AS endDate, 
                                @transferCurrency AS transferCurrency,
                                (SELECT * from @orderBy rows FOR XML AUTO, TYPE) AS orderBy, 
                                (SELECT * from @meta rows FOR XML AUTO, TYPE) AS meta 
                        FOR XML RAW('params'),TYPE)

    SELECT 'transferDayOfWeek' AS resultSetName

    ;WITH transferDayOfWeek AS 
    (
        SELECT 
            DATEPART(WEEKDAY, t.transferDateTime) AS weekDayNum,
            DATENAME(WEEKDAY, t.transferDateTime) AS weekDayName,
            t.transferCurrency AS transferCurrency,
            COUNT(t.transferId) AS recordsTotalByDay,
            SUM(COUNT(t.transferId)) OVER (PARTITION BY t.transferCurrency) AS recordsTotal,
            SUM(ISNULL(t.transferAmount, 0)) AS transferAmount,
            SUM(SUM(ISNULL(t.transferAmount, 0))) OVER (PARTITION BY t.transferCurrency) AS transferAmountTotal,
            SUM(ISNULL(t.acquirerFee, 0)) AS acquirerFee,
            SUM(SUM(ISNULL(t.acquirerFee, 0))) OVER (PARTITION BY t.transferCurrency) AS acquirerFeeTotal,
            SUM(ISNULL(t.issuerFee, 0)) AS issuerFee,
            SUM(SUM(ISNULL(t.issuerFee, 0))) OVER (PARTITION BY t.transferCurrency) AS issuerFeeTotal,
            SUM(ISNULL(t.transferFee, 0)) AS transferFee,
            SUM(SUM(ISNULL(t.transferFee, 0))) OVER (PARTITION BY t.transferCurrency) AS transferFeeTotal,
            SUM(ISNULL(t.amountBilling, 0)) AS amountBilling,
            SUM(SUM(ISNULL(t.amountBilling, 0))) OVER (PARTITION BY t.transferCurrency) AS amountBillingTotal,
            SUM(ISNULL(t.amountSettlement, 0)) AS amountSettlement,
            SUM(SUM(ISNULL(t.amountSettlement, 0))) OVER (PARTITION BY t.transferCurrency) AS amountSettlementTotal,
            ROW_NUMBER() OVER (
              ORDER BY CASE 
                WHEN @sortOrder = 'ASC'
                    THEN CASE                         
                        WHEN @sortBy = 'agreatepredicate' THEN DATEPART(WEEKDAY, t.transferDateTime)                     
                        WHEN @sortBy = 'transferCount' THEN COUNT(t.transferId)
                        WHEN @sortBy = 'transferCountPercent' THEN COUNT(t.transferId)
                        WHEN @sortBy = 'transferAmount' THEN SUM(ISNULL(t.transferAmount, 0))
                        WHEN @sortBy = 'transferAmountPercent' THEN SUM(ISNULL(t.transferAmount, 0))
                        WHEN @sortBy = 'acquirerFee' THEN SUM(ISNULL(t.acquirerFee, 0))
                        WHEN @sortBy = 'acquirerFeePercent' THEN SUM(ISNULL(t.acquirerFee, 0))
                        WHEN @sortBy = 'issuerFee' THEN SUM(ISNULL(t.issuerFee, 0))
                        WHEN @sortBy = 'issuerFeePercent' THEN SUM(ISNULL(t.issuerFee, 0))
                        WHEN @sortBy = 'transferFee' THEN SUM(ISNULL(t.transferFee, 0))
                        WHEN @sortBy = 'transferFeePercent' THEN SUM(ISNULL(t.transferFee, 0))
                        WHEN @sortBy = 'amountBilling' THEN SUM(ISNULL(t.amountBilling, 0))
                        WHEN @sortBy = 'amountBillingPercent' THEN SUM(ISNULL(t.amountBilling, 0))
                        WHEN @sortBy = 'amountSettlement' THEN SUM(ISNULL(t.amountSettlement, 0))
                        WHEN @sortBy = 'amountSettlementPercent' THEN SUM(ISNULL(t.amountSettlement, 0))
                    END
                END ASC,
              CASE 
                WHEN @sortOrder = 'DESC'
                    THEN CASE 
                        WHEN @sortBy = 'agreatepredicate' THEN DATEPART(WEEKDAY, t.transferDateTime)                    
                        WHEN @sortBy = 'transferCount' THEN COUNT(t.transferId)
                        WHEN @sortBy = 'transferCountPercent' THEN COUNT(t.transferId)
                        WHEN @sortBy = 'transferAmount' THEN SUM(ISNULL(t.transferAmount, 0))
                        WHEN @sortBy = 'transferAmountPercent' THEN SUM(ISNULL(t.transferAmount, 0))
                        WHEN @sortBy = 'acquirerFee' THEN SUM(ISNULL(t.acquirerFee, 0))
                        WHEN @sortBy = 'acquirerFeePercent' THEN SUM(ISNULL(t.acquirerFee, 0))
                        WHEN @sortBy = 'issuerFee' THEN SUM(ISNULL(t.issuerFee, 0))
                        WHEN @sortBy = 'issuerFeePercent' THEN SUM(ISNULL(t.issuerFee, 0))
                        WHEN @sortBy = 'transferFee' THEN SUM(ISNULL(t.transferFee, 0))
                        WHEN @sortBy = 'transferFeePercent' THEN SUM(ISNULL(t.transferFee, 0))
                        WHEN @sortBy = 'amountBilling' THEN SUM(ISNULL(t.amountBilling, 0))
                        WHEN @sortBy = 'amountBillingPercent' THEN SUM(ISNULL(t.amountBilling, 0))
                        WHEN @sortBy = 'amountSettlement' THEN SUM(ISNULL(t.amountSettlement, 0))
                        WHEN @sortBy = 'amountSettlementPercent' THEN SUM(ISNULL(t.amountSettlement, 0))
                    END                                                           
                END DESC
            ) AS rowNum,
          COUNT(*) OVER (PARTITION BY 1) AS dayTotal
       FROM [transfer].[vTransfer] t
       WHERE
           (@startDate IS NULL OR t.transferDateTime >= @startDate)
       AND (@endDate IS NULL OR t.transferDateTime <= @endDate)
       AND (@transferCurrency IS NULL OR t.transferCurrency = @transferCurrency)
       AND t.success = 1
       GROUP BY 
        DATEPART(WEEKDAY, t.transferDateTime), 
        DATENAME(WEEKDAY, t.transferDateTime),
        t.transferCurrency
    )
    SELECT  -- [weekDay]
        CAST(weekDayNum AS NVARCHAR)+ '.' + weekDayName AS agreatepredicate,
        CAST(recordsTotalByDay AS NVARCHAR(50)) AS transferCount,
        CAST(CAST(recordsTotalByDay*100.0/ISNULL(NULLIF(recordsTotal,0),1) AS DECIMAL(18, 2)) AS NVARCHAR(50)) + ' %' AS transferCountPercent,
        CAST(transferAmount AS DECIMAL(18, 2)) AS transferAmount,
        CAST(CAST(transferAmount*100.0/ISNULL(NULLIF(transferAmountTotal,0),1) AS DECIMAL(18, 2)) AS NVARCHAR(50)) + ' %' AS transferAmountPercent,
        CAST(acquirerFee AS DECIMAL(18, 2)) AS acquirerFee,
        CAST(CAST(acquirerFee*100.0/ISNULL(NULLIF(acquirerFeeTotal,0),1) AS DECIMAL(18, 2)) AS NVARCHAR(50)) + ' %' AS acquirerFeePercent,
        CAST(issuerFee AS DECIMAL(18, 2)) AS issuerFee,
        CAST(CAST(issuerFee*100.0/ISNULL(NULLIF(issuerFeeTotal,0),1) AS DECIMAL(18, 2))AS NVARCHAR(50)) + ' %' AS issuerFeePercent,
        CAST(transferFee AS DECIMAL(18, 2)) AS transferFee,
        CAST(CAST(transferFee*100.0/ISNULL(NULLIF(transferFeeTotal,0),1) AS DECIMAL(18, 2)) AS NVARCHAR(50)) + ' %' AS transferFeePercent,
        CAST(amountBilling AS DECIMAL(18, 2)) AS amountBilling,
        CAST(CAST(amountBilling*100.0/ISNULL(NULLIF(amountBillingTotal,0),1) AS DECIMAL(18, 2))AS NVARCHAR(50)) + ' %' AS amountBillingPercent,
        CAST(amountSettlement AS DECIMAL(18, 2)) AS amountSettlement,
        CAST(CAST(amountSettlement*100.0/ISNULL(NULLIF(amountSettlementTotal,0),1) AS DECIMAL(18, 2)) AS NVARCHAR(50)) + ' %'  AS amountSettlementPercent,
        transferCurrency,
        1000 + rowNum AS sortFlag
    FROM transferDayOfWeek 
    UNION ALL
    SELECT  -- AVERAGE
        transferCurrency + ' - AVERAGE' AS agreatepredicate,
        CAST(CAST(AVG(recordsTotalByDay*1.0) AS DECIMAL(18, 1)) AS NVARCHAR(50)) AS transferCount,
        NULL AS transferCountPercent,
        CAST((SUM(transferAmount)*1.0/Count(weekDayNum)) AS DECIMAL(18, 2)) AS transferAmount,
        NULL AS transferAmountPercent,
        CAST((SUM(acquirerFee)*1.0/Count(weekDayNum)) AS DECIMAL(18, 2)) AS acquirerFee,
        NULL AS acquirerFeePercent,
        CAST((SUM(issuerFee)*1.0/Count(weekDayNum)) AS DECIMAL(18, 2)) AS issuerFee,
        NULL AS issuerFeePercent,
        CAST((SUM(transferFee)*1.0/Count(weekDayNum)) AS DECIMAL(18, 2)) AS transferFee,
        NULL AS transferFeePercent,
        CAST((SUM(amountBilling)*1.0/Count(weekDayNum)) AS DECIMAL(18, 2)) AS amountBilling,
        NULL AS amountBillingPercent,
        CAST((SUM(amountSettlement)*1.0/Count(weekDayNum)) AS DECIMAL(18, 2)) AS amountSettlement,
        NULL AS amountSettlementPercent,
        transferCurrency,
        2001 AS sortFlag
    FROM transferDayOfWeek
    GROUP BY transferCurrency
    UNION ALL
    SELECT  -- TOTAL
        transferCurrency + ' - TOTAL' AS agreatepredicate,
        CAST(SUM(recordsTotalByDay) AS NVARCHAR(50)) AS transferCount,
        NULL AS transferCountPercent,
        CAST(SUM(transferAmount) AS DECIMAL(18, 2)) AS transferAmount,
        NULL AS transferAmountPercent,
        CAST(SUM(acquirerFee) AS DECIMAL(18, 2)) AS acquirerFee,
        NULL AS acquirerFeePercent,
        CAST(SUM(issuerFee) AS DECIMAL(18, 2)) AS issuerFee,
        NULL AS issuerFeePercent,
        CAST(SUM(transferFee) AS DECIMAL(18, 2)) AS transferFee,
        NULL AS transferFeePercent,
        CAST(SUM(amountBilling) AS DECIMAL(18, 2)) AS amountBilling,
        NULL AS amountBillingPercent,
        CAST(SUM(amountSettlement)  AS DECIMAL(18, 2)) AS amountSettlement,
        NULL AS amountSettlementPercent,
        transferCurrency,
        3000 AS sortFlag
    FROM transferDayOfWeek
    GROUP BY transferCurrency
    ORDER BY transferCurrency, sortFlag

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
    SET DATEFIRST @DATEFIRST                                                    -- restore default
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    SET DATEFIRST @DATEFIRST                                                    -- restore default

    EXEC [core].[error]
    RETURN 55555
END CATCH