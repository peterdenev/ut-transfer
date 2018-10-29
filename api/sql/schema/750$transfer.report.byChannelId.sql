ALTER PROCEDURE [transfer].[report.byChannelId]
    @channelId VARCHAR(100),
    @startDate DATETIME2 = NULL,
    @endDate DATETIME2 = NULL,
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
SET NOCOUNT ON

DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
-- checks if the user has a right to make the operation
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
IF @return != 0
BEGIN
    RETURN 55555
END

IF OBJECT_ID('tempdb..#channelIdReport') IS NOT NULL
    DROP TABLE #channelIdReport


SELECT transferId,transferTypeId, [description],transferCurrency, transferAmount, 
   convert(varchar, transferDateTime,103) AS tranDate, CONVERT(VARCHAR, transferDateTime,8) AS tranTime 
   INTO #channelIdReport
   FROM transfer.vTransfer 
WHERE channelId = @channelId AND
(@startDate IS NULL or transferDateTime >= @startDate) AND 
(@endDate IS NULL OR transferDateTime <=  DATEADD (dd, 1, @endDate)) AND
success = 1

SELECT 'detailTranReport' AS resultSetName
SELECT * FROM #channelIdReport

SELECT 'summaryTranReport' AS resultSetName
SELECT transferTypeId, [description],transferCurrency, SUM(transferAmount) as totalAmount, count(transferTypeId) as countOfType
FROM #channelIdReport
GROUP BY transferCurrency,[description],transferTypeId ORDER BY transferTypeId
 

DROP TABLE #channelIdReport
