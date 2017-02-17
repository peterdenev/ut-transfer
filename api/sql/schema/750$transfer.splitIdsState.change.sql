ALTER PROCEDURE [transfer].[splitIdsState.change] -- update state of splitIds
    @splitIds core.arrayNumberList READONLY, -- the list of items
	@meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

DECLARE @callParams XML
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
    
BEGIN TRY    
    DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta  
    
    IF @return != 0
    BEGIN
        RETURN 55555
    END
    
    BEGIN TRANSACTION
    BEGIN
        DECLARE @today DATETIMEOFFSET = SYSDATETIMEOFFSET()
        -- 4 --> selected, 5 --> authorized, 1 --> requested, 2 --> processed, 6 --> failed
        
        INSERT INTO [transfer].[splitAudit] (splitId, field, oldValue, createdBy, createdOn)
        SELECT s.splitId, 'status', s.[state], @userId, @today
        FROM [transfer].split s
        JOIN @splitIds si on si.value = s.splitId

        UPDATE s
        SET [state] = 4
        FROM [transfer].split s
        join @splitIds si on si.value = s.splitId
           
    END

    COMMIT TRANSACTION

    SELECT 'selectSplitIds' AS resultSetName
    SELECT 'Successfully'

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
	EXEC [core].[error]
    RETURN 55555
END CATCH