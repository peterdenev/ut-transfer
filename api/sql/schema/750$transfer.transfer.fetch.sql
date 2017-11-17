ALTER PROCEDURE [transfer].[transfer.fetch] -- this SP gets all existing card Product in DB or selected by binId or bin
    @transferIdAcquirer varchar(50),
    @transferDateTimeFrom date,
    @transferDateTimeTo date,
    @merchantId varchar(50),
    @reversed bit,
    @orderBy [core].orderByTT READONLY,-- information for ordering
    @paging [core].[pagingTT] READONLY,--information for paging
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

AS
    SET NOCOUNT ON

    DECLARE @userId bigint = (SELECT [auth.actorId] FROM @meta)
    -- checks if the user has a right to make the operation
    declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    if @return != 0
    BEGIN
        RETURN 55555
    END
    SET @transferDateTimeFrom=ISNULL(@transferDateTimeFrom,getdate())
    SET @transferDateTimeTo=ISNULL(@transferDateTimeFrom,@transferDateTimeFrom)
    DECLARE @languageId BIGINT = (SELECT languageId
                        FROM [core].[language] cl
                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                        WHERE us.[actorId] = @userId)

    DECLARE @partnerId  nvarchar(50) ---the unique reference of transfer partner in UTtransfer
    DECLARE @name nvarchar(50) = NULL -- the name of partner
    DECLARE @port nvarchar(50) = NULL -- the name of the port,
    DECLARE @mode nvarchar(20) ---the mode of the partner,
    DECLARE @pageSize INT --how many rows will be returned per page
    DECLARE @pageNumber INT -- which page number to display
    DECLARE @sortBy VARCHAR(50) = 'updatedOn' -- on which column results to be sorted
    DECLARE @sortOrder VARCHAR(4) = 'DESC'--what kind of sort to be used ascending or descending

 

    SELECT @sortBy = [field],
           @sortOrder = [dir]
    FROM @orderBy
    where [field] in ('transferDateTime', 'transferIdAcquirer')
    and [dir] in ('ASC', 'DESC')

    SELECT @pageNumber = ISNULL(pageNumber,1),
       @pageSize = ISNULL([pageSize], 20) FROM @paging

    DECLARE @startRow INT = (@pageNumber - 1) * @pageSize + 1
    DECLARE @endRow INT = @startRow + @pageSize - 1

    IF OBJECT_ID('tempdb..#transfer') IS NOT NULL
    DROP TABLE #transfer

    CREATE TABLE #transfer (     
    [transferId] [bigint] ,
    [transferTypeId] bigint,
    [transferTypeName] [nvarchar](250),
    [transferIdAcquirer] [varchar](50)NULL,	 
    [transferDateTime] [datetime2](0) NULL,	 
    [merchantId] [varchar](50) NULL,
    [merchantName] [nvarchar](250) NULL,	 
    [reversed] [bit] NOT NULL, 
    [issuerTxState] [smallint] NULL,
    [issuerResponseCode] [varchar](10) NULL,
    [issuerResponseMessage] [varchar](250) NULL,
    [isPreauthorization] [bit] NULL,
    [transferAmount] [money]   NULL,   
    [cleared] [bit] NULL,
    [clearingStatusId] [char](5) NULL,
    rowNum INT,
    recordsTotal INT
       )

    ;WITH CTE AS
    (
        SELECT TOP 100
    [transferId]  ,
    [transferTypeId] ,
    ina.itemName transferTypeName ,
    [transferIdAcquirer] ,	 
    [transferDateTime] ,	 
    [merchantId] ,
    c.merchantName,	 
    [reversed] , 
    [issuerTxState] ,
    [issuerResponseCode] ,
    [issuerResponseMessage],
    [isPreauthorization],
    [transferAmount],  
    [cleared] ,
    [clearingStatusId],
            ROW_NUMBER() OVER(ORDER BY
                            CASE WHEN @sortOrder = 'ASC' THEN
                                CASE
                                    WHEN @sortBy = 'transferDateTime' THEN  CONVERT(nvarchar(50), t.transferDateTime, 20)
                                    WHEN @sortBy = 'transferIdAcquirer' THEN t.transferIdAcquirer
                                     
                                END
                            END,
                            CASE WHEN @sortOrder = 'DESC' THEN
                                CASE
                                    WHEN @sortBy = 'transferDateTime' THEN  CONVERT(nvarchar(50), t.transferDateTime, 20)
                                    WHEN @sortBy = 'transferIdAcquirer' THEN t.transferIdAcquirer
                                END
                            END DESC) rowNum,
                            COUNT(*) OVER(PARTITION BY 1) AS recordsTotal            
            FROM [transfer].[transfer] t
		  JOIN [customer].customer c on t.merchantId=c.actorId
		  JOIN  [core].[itemName] ina on t.transferTypeId=ina.parentItemNameId
		  WHERE
			 t.transferDateTime BETWEEN @transferDateTimeFrom and @transferDateTimeTo
			 AND (t.transferIdAcquirer=@transferIdAcquirer OR @transferIdAcquirer IS NULL)
			 AND (t.merchantId=@merchantId OR @merchantId IS NULL)
			 AND (t.reversed=@reversed OR @reversed IS NULL)

     )

    INSERT INTO #transfer
    SELECT *
    FROM CTE
    WHERE rowNum BETWEEN @startRow AND  @endRow


    SELECT 'transfer' AS resultSetName

    SELECT*
    FROM #transfer p
    ORDER BY rowNum

    SELECT 'pagination' AS resultSetName

    SELECT TOP 1 @pageSize AS pageSize, recordsTotal AS recordsTotal, @pageNumber AS pageNumber, (recordsTotal - 1) / @pageSize + 1 AS pagesTotal
    FROM #transfer

    DROP TABLE #transfer
