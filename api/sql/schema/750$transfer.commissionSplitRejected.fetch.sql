CREATE PROCEDURE [transfer].[commissionSplitRejected.fetch]-- fetch rejected commission for actorId
    @actorIds core.arrayList READONLY,
    @filterBy [transfer].filterByTT READONLY,-- information for filters
    @orderBy [transfer].orderByTT READONLY,-- information for ordering
    @paging [agent].[pagingTT] READONLY,
	@meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

SET NOCOUNT ON
    DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
    DECLARE @actionID VARCHAR(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return INT = 0
    EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = NULL, @meta = @meta
    IF @return != 0
 	BEGIN
         RETURN 55555
    END

    DECLARE @pageSize int
    DECLARE @pageNumber int

    -- Set & Callculate paging details
	SELECT
        @pageNumber = ISNULL(pageNumber,1),
        @pageSize = ISNULL([pageSize], 20)
    FROM @paging

    DECLARE @startRow INT = ( @pageNumber - 1) * @pageSize + 1
    DECLARE @endRow INT = @startRow + @pageSize - 1

    -- Set this flag if any actorIds were provided. If not - all data is returned
    DECLARE @filterByActorIds bit = 0
    IF EXISTS ( SELECT 1 FROM @actorIds WHERE value IS NOT NULL)
        SET @filterByActorIds = 1

    DECLARE
        @transferDateTimeFrom DATE,
        @transferDateTimeTo DATE,
       -- @transferTypeId BIGINT,
        @sortBy varchar(50) = 'itemName',
        @sortOrder varchar(4) = 'ASC'

    SELECT
        @sortBy = ISNULL([column],'itemName'),
        @sortOrder=ISNULL([direction],'ASC')
    FROM @orderBy

    SELECT
        @transferDateTimeFrom = transferDateTimeFrom,
        @transferDateTimeTo = DATEADD(day, 1, transferDateTimeTo)
        --,@transferTypeId = transferTypeId
    FROM @filterBy

     -- Insert all data in a table, so later we can properly filter paging
	CREATE TABLE #resultItems (
        [identifier] NVARCHAR(100),
        splitId bigint,
        transferIdIssuer NVARCHAR(200),
        transferDateTime DATETIME,
        operation NVARCHAR(100),
        commission money,
        transferCurrency NVARCHAR(50),
        transferAmount money,
        [Status] NVARCHAR(100),
        reversed bit,
        rowNum int,
        recordsTotal int
	)

    IF @sortBy = 'commission' --OR @sortBy = 'ammount'
    BEGIN
        INSERT INTO #resultItems
        SELECT h.identifier, s.splitId, t.transferIdIssuer, t.transferDateTime, i.itemName AS [operation],
            s.amount AS commission, t.transferCurrency, t.transferAmount AS transferAmount,
            CASE WHEN t.issuerTxState=2 THEN 'Successful'
            WHEN t.issuerTxState = 4 THEN 'Failed (cbs)'
            WHEN t.issuerTxState = 3 THEN 'Failed'
            WHEN t.issuerTxState = 1 THEN 'Requested'
            ELSE 'Unknown' END AS [Status],
            t.[reversed],
            ROW_NUMBER() OVER(ORDER BY
					         CASE WHEN @sortOrder = 'ASC' THEN
						        CASE
                                   WHEN @sortBy = 'commission' THEN s.amount
                                   --WHEN @sortBy = 'transferAmount' THEN convert(nvarchar(20), t.transferAmount)
							    END
					        END,
					        CASE WHEN @sortOrder = 'DESC' THEN
						        CASE
                                    WHEN @sortBy = 'commission' THEN s.amount
                                    --WHEN @sortBy = 'transferAmount' THEN convert(nvarchar(20), t.transferAmount)
                                END
					        END DESC) AS rowNum,
		    COUNT(*) OVER(PARTITION BY 1) AS recordsTotal
        FROM [transfer].split s
            JOIN [transfer].[transfer] t ON t.transferId = s.transferId /*AND t.channelID = s.ActorId */
            JOIN core.itemName i ON i.itemNameId = t.transferTypeId
            LEFT JOIN [user].[hash] h ON h.actorId = s.actorId
            LEFT JOIN @actorIds ai ON ai.value = s.actorId
        WHERE t.issuerTxState = 2 AND t.reversed = 0
        -- AND (@actorID IS NULL OR s.actorId = @actorID)
        /*AND t.channelID = @actorID*/
        AND t.channelType ='agent'
        AND s.[state] = 5 AND s.tag LIKE '%|commission|%' AND s.tag LIKE '%|pending|%'
        AND ( @transferDateTimeFrom IS NULL OR t.transferDateTime >= @transferDateTimeFrom )
        AND ( @transferDateTimeTo IS NULL OR t.transferDateTime < @transferDateTimeTo )
        AND ( @filterByActorIds = 0 OR ( @filterByActorIds = 1 AND ai.value = s.actorId))

       -- AND ( @transferTypeId IS NULL OR t.transferTypeId = @transferTypeId)
        ORDER BY rowNum
    END
    ELSE
    BEGIN
        INSERT INTO #resultItems
        SELECT h.identifier, s.splitId, t.transferIdIssuer, t.transferDateTime, i.itemName AS [operation],
            s.amount AS commission, t.transferCurrency, t.transferAmount AS transferAmount,
            CASE WHEN t.issuerTxState=2 THEN 'Successful'
            WHEN t.issuerTxState = 4 THEN 'Failed (cbs)'
            WHEN t.issuerTxState = 3 THEN 'Failed'
            WHEN t.issuerTxState = 1 THEN 'Requested'
            ELSE 'Unknown' END AS [Status],
            t.[reversed],
            ROW_NUMBER() OVER(ORDER BY
					         CASE WHEN @sortOrder = 'ASC' THEN
						        CASE
						            WHEN @sortBy = 'splitId' THEN convert(nvarchar(20), s.splitId)
                                    WHEN @sortBy = 'transferIdIssuer' THEN convert(nvarchar(20), t.transferIdIssuer)
                                    WHEN @sortBy = 'transferDateTime' THEN convert(nvarchar(100), t.transferDateTime)
                                    WHEN @sortBy = 'operation' THEN i.itemName
                                    WHEN @sortBy = 'transferCurrency' THEN t.transferCurrency
							    END
					        END,
					        CASE WHEN @sortOrder = 'DESC' THEN
						        CASE
							       WHEN @sortBy = 'splitId' THEN convert(nvarchar(20), s.splitId)
                                    WHEN @sortBy = 'transferIdIssuer' THEN convert(nvarchar(20), t.transferIdIssuer)
                                    WHEN @sortBy = 'transferDateTime' THEN convert(nvarchar(100), t.transferDateTime)
                                    WHEN @sortBy = 'operation' THEN i.itemName
                                    WHEN @sortBy = 'transferCurrency' THEN t.transferCurrency
                                END
					        END DESC) AS rowNum,
		    COUNT(*) OVER(PARTITION BY 1) AS recordsTotal
        FROM [transfer].split s
            JOIN [transfer].[transfer] t ON t.transferId = s.transferId /*AND t.channelID = s.ActorId */
            JOIN core.itemName i ON i.itemNameId = t.transferTypeId
            LEFT JOIN [user].[hash] h ON h.actorId = s.actorId
            LEFT JOIN @actorIds ai ON ai.value = s.actorId
        WHERE t.issuerTxState = 2 AND t.reversed = 0
        --AND /*t.channelID = @actorID*/
        -- (@actorID IS NULL OR s.actorId = @actorID)
        AND t.channelType ='agent'
        AND s.[state] = 5 AND s.tag LIKE '%|commission|%' AND s.tag LIKE '%|pending|%'
        AND ( @transferDateTimeFrom IS NULL OR t.transferDateTime >= @transferDateTimeFrom )
        AND ( @transferDateTimeTo IS NULL OR t.transferDateTime < @transferDateTimeTo )
        AND ( @filterByActorIds = 0 OR ( @filterByActorIds = 1 AND ai.value = s.actorId))
        --AND ( @transferTypeId IS NULL OR t.transferTypeId = @transferTypeId)
        ORDER BY rowNum
       END

    SELECT 'commission' as resultSetName
    SELECT * FROM #resultItems re
	WHERE re.rowNum BETWEEN @startRow AND @endRow
    ORDER BY rowNum

	-- Return pagination data
	SELECT 'pagination' AS resultSetName
    SELECT TOP 1
		@pageSize AS pageSize,
		recordsTotal AS recordsTotal,
		@pageNumber AS pageNumber,
		(recordsTotal - 1) / @pageSize + 1 AS pagesTotal
    FROM #resultItems