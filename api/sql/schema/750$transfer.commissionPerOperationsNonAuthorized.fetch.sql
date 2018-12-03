ALTER PROCEDURE [transfer].[commissionPerOperationsNonAuthorized.fetch]-- fetch non authorised commissions per agent's operations
    @actorId BIGINT, -- agent's actorId
    @dateFrom DATETIME = NULL, --start date 
    @dateTo DATETIME, --end date
    @orderBy [transfer].orderByTT READONLY,-- information for ordering
	@meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
DECLARE @callParams XML
BEGIN TRY

    SET NOCOUNT ON
    DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

    DECLARE @actionID VARCHAR(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return INT = 0
    EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = NULL, @meta = @meta
    IF @return != 0
 	BEGIN
         RETURN 55555
    END

    DECLARE  
       -- @transferTypeId BIGINT,
        @sortBy varchar(50) = 'commission',
        @sortOrder varchar(4) = 'ASC'

    SELECT 
        @sortBy = ISNULL([column],'commission'), 
        @sortOrder=ISNULL([direction],'ASC') 
    FROM @orderBy

    SET @dateTo = DATEADD(day, 1, @dateTo)
    
    IF OBJECT_ID('tempdb..#commissionPerOperationNonAuthorized') IS NOT NULL
    DROP TABLE #commissionPerOperationNonAuthorized

    CREATE TABLE #commissionPerOperationNonAuthorized
    ( 
      transferTypeId BIGINT,
      operationName NVARCHAR(200),
      volume BIGINT,
      commission MONEY)

    INSERT INTO #commissionPerOperationNonAuthorized( transferTypeId, operationName,  commission, volume )
    SELECT 
        t.transferTypeId,
        i.itemName AS operationName,
        SUM (s.amount) AS commission,
        COUNT(*) AS volume
    FROM [transfer].split s
    JOIN [transfer].[transfer] t ON t.transferId = s.transferId
    JOIN core.itemName i ON i.itemNameId = t.transferTypeId
    WHERE t.issuerTxState = 2 AND t.reversed = 0 AND s.actorId = @actorID
    AND t.channelType ='agent'
    AND s.[state] IS NULL AND s.tag LIKE '%|commission|%' AND s.tag LIKE '%|pending|%'
    AND ( @dateFrom IS NULL OR t.transferDateTime >= @dateFrom )
    AND t.transferDateTime < @dateTo
    GROUP BY GROUPING SETS(
        (t.transferTypeId, i.itemName)
        ,())

    SELECT 'commission' as resultSetName

    IF @sortBy = 'commission' OR @sortBy = 'volume'
    BEGIN
        SELECT transferTypeId, operationName, volume, commission,
            ROW_NUMBER() OVER( ORDER BY
					           CASE WHEN @sortOrder = 'ASC' THEN
						            CASE
                                        WHEN @sortBy = 'commission' THEN commission  
                                        WHEN @sortBy = 'volume' THEN  volume                                 
							        END
					           END,
					           CASE WHEN @sortOrder = 'DESC' THEN
						            CASE
                                        WHEN @sortBy = 'commission' THEN commission
                                        WHEN @sortBy = 'volume' THEN  volume    
                                    END
					           END DESC) AS rowNum
        FROM #commissionPerOperationNonAuthorized
        WHERE transferTypeId IS NOT NULL
        ORDER BY rowNum
    END
    ELSE
    BEGIN
        SELECT transferTypeId, operationName, volume, commission,
            ROW_NUMBER() OVER( ORDER BY
					           CASE WHEN @sortOrder = 'ASC' THEN
						            CASE
                                        WHEN @sortBy = 'operationName' THEN operationName                               
							        END
					           END,
					           CASE WHEN @sortOrder = 'DESC' THEN
						            CASE
                                        WHEN @sortBy = 'operationName' THEN operationName
                                    END
					           END DESC) AS rowNum
        FROM #commissionPerOperationNonAuthorized
        WHERE transferTypeId IS NOT NULL
        ORDER BY rowNum
    END
    
    SELECT 'totalCommission' as resultSetName

    SELECT volume, commission
    FROM #commissionPerOperationNonAuthorized
    WHERE transferTypeId  IS NULL

    DROP TABLE #commissionPerOperationNonAuthorized
END TRY
BEGIN CATCH
    EXEC core.error
    RETURN 55555
END CATCH