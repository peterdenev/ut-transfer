ALTER PROCEDURE [transfer].[partner.fetch] -- this SP gets all existing card Product in DB or selected by binId or bin
    @filterBy [transfer].filterByTT READONLY,-- information for filters
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

    SELECT @partnerId = partnerid, @name = name,  @port = port, @mode = mode
    FROM @filterBy

    SELECT @sortBy = [field],
           @sortOrder = [dir]
    FROM @orderBy
    where [field] in ('partnerId', 'name', 'port', 'mode')
    and [dir] in ('ASC', 'DESC')

    SELECT @pageNumber = ISNULL(pageNumber,1),
       @pageSize = ISNULL([pageSize], 20) FROM @paging

    DECLARE @startRow INT = (@pageNumber - 1) * @pageSize + 1
    DECLARE @endRow INT = @startRow + @pageSize - 1

    IF OBJECT_ID('tempdb..#Partner') IS NOT NULL
    DROP TABLE #Partner

    CREATE TABLE #Partner (
        partnerId varchar(50) NOT NULL,
        [name] nvarchar(50) NOT NULL,
        port varchar(50) NOT NULL,
        mode varchar(20) NOT NULL,
        settlementDate datetime,
        settlementAccount varchar(50),
        feeAccount varchar(50),
        commissionAccount varchar(50),
        serialNumber bigint,
        rowNum INT,
        recordsTotal INT)

    ;WITH CTE AS
    (
        SELECT partnerId, name, port, mode, settlementAccount, settlementDate, feeAccount, commissionAccount, serialNumber,
            ROW_NUMBER() OVER(ORDER BY
                            CASE WHEN @sortOrder = 'ASC' THEN
                                CASE
                                    WHEN @sortBy = 'partnerId' THEN p.partnerId
                                    WHEN @sortBy = 'name' THEN p.[name]
                                    WHEN @sortBy = 'port' THEN p.port
                                    WHEN @sortBy = 'mode' THEN p.mode
                                END
                            END,
                            CASE WHEN @sortOrder = 'DESC' THEN
                                CASE
                                    WHEN @sortBy = 'partnerId' THEN p.partnerId
                                    WHEN @sortBy = 'name' THEN p.[name]
                                    WHEN @sortBy = 'port' THEN p.port
                                    WHEN @sortBy = 'mode' THEN p.mode
                                END
                            END DESC) rowNum,
                            COUNT(*) OVER(PARTITION BY 1) AS recordsTotal
        FROM
        (
            SELECT p.partnerId, p.name, p.port, p.mode, p.settlementAccount, p.settlementDate, p.feeAccount, p.commissionAccount, p.serialNumber
            FROM [transfer].partner p
            WHERE (@partnerId IS NULL OR p.partnerId like '%' + @partnerId + '%')
                AND (@name IS NULL OR p.name like '%' + @name + '%')
                AND (@port IS NULL OR p.port like '%' + @port + '%')
                AND (@mode IS NULL OR p.mode like '%' + @mode + '%')
        )   p
     )

    INSERT INTO #Partner( partnerId, [name], port, mode, settlementAccount, settlementDate, feeAccount, commissionAccount, serialNumber, rowNum, recordsTotal )
    SELECT partnerId, [name], port, mode, settlementAccount, settlementDate, feeAccount, commissionAccount, serialNumber, rowNum, recordsTotal
    FROM CTE
    WHERE rowNum BETWEEN @startRow AND  @endRow


    SELECT 'partner' AS resultSetName

    SELECT partnerId, name, port, mode, settlementAccount, settlementDate, feeAccount, commissionAccount, serialNumber
    FROM #Partner p
    ORDER BY rowNum

    SELECT 'pagination' AS resultSetName

    SELECT TOP 1 @pageSize AS pageSize, recordsTotal AS recordsTotal, @pageNumber AS pageNumber, (recordsTotal - 1) / @pageSize + 1 AS pagesTotal
    FROM #Partner

    DROP TABLE #Partner
