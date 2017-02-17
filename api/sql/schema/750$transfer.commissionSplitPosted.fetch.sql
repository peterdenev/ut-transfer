ALTER PROCEDURE [transfer].[commissionSplitPosted.fetch]-- fetch commission posted for actorId
    @actorId BIGINT,-- actorId of the agent
    @filterBy [transfer].filterByTT READONLY,-- information for filters
    @orderBy [transfer].orderByTT READONLY,-- information for ordering
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

     DECLARE  
        @transferDateTimeFrom DATE,
        @transferDateTimeTo DATE,
        @sortBy varchar(50) = 'itemName',
        @sortOrder varchar(4) = 'ASC'

    SELECT 
        @sortBy = ISNULL([column],'itemName'), 
        @sortOrder=ISNULL([direction],'ASC') 
    FROM @orderBy

    SELECT 
        @transferDateTimeFrom = transferDateTimeFrom,
        @transferDateTimeTo = DATEADD(day, 1, transferDateTimeTo)
    FROM @filterBy

    SELECT 'commission' as resultSetName
    IF @sortBy = 'commission' --OR @sortBy = 'commission'
    BEGIN
        SELECT s.splitId, t.transferIdIssuer, t.transferDateTime, i.itemName AS [operation], 
            s.amount AS commission, t.transferCurrency, t.transferAmount AS transferAmount, 
            CASE WHEN t.issuerTxState=2 THEN 'Successful' 
            WHEN t.issuerTxState = 4 THEN 'Error'
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
					        END DESC) AS rowNum
        FROM [transfer].split s
            JOIN [transfer].[transfer] t ON t.transferId = s.txtId 
            JOIN core.itemName i ON i.itemNameId = t.transferTypeId 
        WHERE s.ActorId  = @actorID AND t.channelType ='agent'
        AND s.tag LIKE '%|commission|%'
        AND ( @transferDateTimeFrom IS NULL OR t.transferDateTime >= @transferDateTimeFrom )
        AND ( @transferDateTimeTo IS NULL OR t.transferDateTime < @transferDateTimeTo )
        ORDER BY rowNum
    END
    ELSE
    BEGIN
        SELECT s.splitId, t.transferIdIssuer, t.transferDateTime, i.itemName AS [operation], 
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
                                    WHEN @sortBy = 'Status' THEN CASE WHEN t.issuerTxState=2 THEN 'Successful' 
                                                                WHEN t.issuerTxState = 4 THEN 'Failed (cbs)'
                                                                WHEN t.issuerTxState = 3 THEN 'Failed'
                                                                WHEN t.issuerTxState = 1 THEN 'Requested'
                                                             ELSE 'Unknown' END
							    END
					        END,
					        CASE WHEN @sortOrder = 'DESC' THEN
						        CASE
							       WHEN @sortBy = 'splitId' THEN convert(nvarchar(20), s.splitId)
                                    WHEN @sortBy = 'transferIdIssuer' THEN convert(nvarchar(20), t.transferIdIssuer)
                                    WHEN @sortBy = 'transferDateTime' THEN convert(nvarchar(100), t.transferDateTime)
                                    WHEN @sortBy = 'operation' THEN i.itemName 
                                    WHEN @sortBy = 'transferCurrency' THEN t.transferCurrency
                                    WHEN @sortBy = 'Status' THEN CASE WHEN t.issuerTxState=2 THEN 'Successful' 
                                                                WHEN t.issuerTxState = 4 THEN 'Failed (cbs)'
                                                                WHEN t.issuerTxState = 3 THEN 'Failed'
                                                                WHEN t.issuerTxState = 1 THEN 'Requested'
                                                             ELSE 'Unknown' END
                                END
					        END DESC) AS rowNum
        FROM [transfer].split s
            JOIN [transfer].[transfer] t ON t.transferId = s.txtId 
            JOIN core.itemName i ON i.itemNameId = t.transferTypeId 
        WHERE s.ActorId  = @actorID AND t.channelType ='agent'
        AND s.tag LIKE '%|commission|%'
        AND ( @transferDateTimeFrom IS NULL OR t.transferDateTime >= @transferDateTimeFrom )
        AND ( @transferDateTimeTo IS NULL OR t.transferDateTime < @transferDateTimeTo )
        ORDER BY rowNum
    END