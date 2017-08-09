ALTER PROCEDURE [transfer].[commissionPerAgent.authorize]-- authorized non authorised commissions per agents
    @actorList core.arrayNumberList READONLY,-- actorIds of the agents
    @dateFrom DATETIME = NULL, --start date 
    @dateTo DATETIME, --end date
	@meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
DECLARE @callParams XML
BEGIN TRY

    SET NOCOUNT ON
    DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
    DECLARE @today DATETIMEOFFSET = SYSDATETIMEOFFSET()

    DECLARE @actionID VARCHAR(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return INT = 0
    EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = NULL, @meta = @meta
    IF @return != 0
 	BEGIN
         RETURN 55555
    END
 
    SET @dateTo = DATEADD(day, 1, @dateTo)

    IF NOT EXISTS ( SELECT value FROM @actorList WHERE value IS NOT NULL)
    BEGIN
        RAISERROR('commissionPerAgent.authorize.actorListMissing', 16, 1);
    END
    
    IF OBJECT_ID('tempdb..#splitAuthorized') IS NOT NULL
        DROP TABLE #splitAuthorized

    CREATE TABLE #splitAuthorized
    ( splitId BIGINT )

    BEGIN TRANSACTION
    BEGIN
       
        INSERT INTO [transfer].[splitAudit] (splitId, field, oldValue, createdBy, createdOn)
        OUTPUT inserted.splitId INTO #splitAuthorized
        SELECT s.splitId, 'status', s.[state], @userId, @today
        FROM 
            [transfer].split s
        JOIN 
            [transfer].[transfer] t ON t.transferId = s.transferId
        JOIN 
            @actorList al ON al.value = s.actorId
        WHERE t.issuerTxState = 2 AND t.reversed = 0 AND t.channelType ='agent'
        AND s.[state] IS NULL AND s.tag LIKE '%|commission|%' AND s.tag LIKE '%|pending|%'
        AND ( @dateFrom IS NULL OR t.transferDateTime >= @dateFrom )
        AND t.transferDateTime < @dateTo
         
        UPDATE s
        -- 4 -->authorized
        SET s.[state] = 4 
        FROM [transfer].split s
        JOIN #splitAuthorized a ON a.splitId = s.splitId
                  
    END

    COMMIT TRANSACTION

    SELECT 'authorizeSplit' AS resultSetName
    SELECT 'Successfully'
       
    DROP TABLE #splitAuthorized

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    EXEC core.error
    RETURN 55555
END CATCH