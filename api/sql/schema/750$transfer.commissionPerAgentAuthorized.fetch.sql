ALTER PROCEDURE [transfer].[commissionPerAgentAuthorized.fetch]-- fetch authorised commissions per agents
    @actorList core.arrayNumberList READONLY,-- actorIds of the agents
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
        --@transferDateTimeFrom DATE,
        --@transferDateTimeTo DATE,
       -- @transferTypeId BIGINT,
        @sortBy varchar(50) = 'agentName',
        @sortOrder varchar(4) = 'ASC',
        @hasActorList bit = 0

    SELECT 
        @sortBy = ISNULL([column],'agentName'), 
        @sortOrder=ISNULL([direction],'ASC') 
    FROM @orderBy

    --SELECT 
    --    @transferDateTimeFrom = transferDateTimeFrom,
    --    @transferDateTimeTo = DATEADD(day, 1, transferDateTimeTo)
    --   -- ,@transferTypeId = transferTypeId
    --FROM @filterBy

    IF EXISTS ( SELECT value FROM @actorList WHERE value IS NOT NULL)
    BEGIN
        SET @hasActorList = 1
    END
    IF OBJECT_ID('tempdb..#commissionAuthorized') IS NOT NULL
    DROP TABLE #commissionAuthorized

    CREATE TABLE #commissionAuthorized
    ( actorId BIGINT,
      agentName NVARCHAR(1000),
      volume BIGINT,
      commission MONEY)

    INSERT INTO #commissionAuthorized( actorId, agentName,  commission, volume )
    SELECT 
        s.actorId,
        p.firstName + ''+ p.lastName AS agentName,
        SUM (s.amount) AS commission,
        COUNT(*) AS volume
    FROM [transfer].split s
    JOIN [transfer].[transfer] t ON t.transferId = s.transferId /*AND t.channelID = s.ActorId */
    --JOIN core.itemName i ON i.itemNameId = t.transferTypeId 
    JOIN customer.person p ON p.actorId = s.actorId
    LEFT JOIN @actorList al ON al.value = s.actorId
    WHERE t.issuerTxState = 2 AND t.reversed = 0 AND /*t.channelID = @actorID*/ /*s.actorId = @actorID  AND */t.channelType ='agent'
    AND s.[state] = 4 AND s.tag LIKE '%|commission|%' AND s.tag LIKE '%|pending|%'
    AND ( @dateFrom IS NULL OR t.transferDateTime >= @dateFrom )
    AND t.transferDateTime < @dateTo 
    AND ( @hasActorList = 0 OR al.value IS NOT NULL)
    GROUP BY GROUPING SETS(
        (s.actorId, p.firstName + ''+ p.lastName)
        ,())


    SELECT 'commission' as resultSetName

    IF @sortBy = 'commission' OR @sortBy = 'volume'
    BEGIN
        SELECT actorId, agentName, volume, commission,
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
        FROM #commissionAuthorized
        WHERE actorId IS NOT NULL
        ORDER BY rowNum
    END
    ELSE
    BEGIN
        SELECT actorId, agentName, volume, commission,
            ROW_NUMBER() OVER( ORDER BY
					           CASE WHEN @sortOrder = 'ASC' THEN
						            CASE
                                        WHEN @sortBy = 'agentName' THEN agentName  
                                       -- WHEN @sortBy = 'volume' THEN  convert(nvarchar(1000), volume)                 
							        END
					           END,
					           CASE WHEN @sortOrder = 'DESC' THEN
						            CASE
                                        WHEN @sortBy = 'agentName' THEN agentName
                                       -- WHEN @sortBy = 'volume' THEN  convert(nvarchar(1000), volume)
                                    END
					           END DESC) AS rowNum
        FROM #commissionAuthorized
        WHERE actorId IS NOT NULL
        ORDER BY rowNum
    END
    
    SELECT 'totalCommission' as resultSetName

    SELECT volume, commission
    FROM #commissionAuthorized
    WHERE actorId IS NULL

    DROP TABLE #commissionAuthorized
END TRY
BEGIN CATCH
    EXEC core.error
    RETURN 55555
END CATCH