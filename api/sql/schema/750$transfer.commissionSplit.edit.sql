ALTER PROCEDURE [transfer].[commissionSplit.edit] -- edit data in transfer.split
    @splitId BIGINT, -- splitId
    @amount MONEY, -- new amount
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

    IF @splitId IS NULL
    BEGIN
         RAISERROR('transfer.commissionSplit.edit.noSplitId', 16, 1);
    END
    
    IF @amount IS NULL
    BEGIN
        RAISERROR('transfer.commissionSplit.edit.noAmount', 16, 1);
    END

    IF EXISTS 
    (
        SELECT 1 
        FROM [transfer].split s
        WHERE s.[state] IS NOT NULL AND s.splitId = @splitId
    )
    BEGIN
        RAISERROR('transfer.commissionSplit.edit.wrongState', 16, 1);
    END

    BEGIN TRANSACTION
    BEGIN
        DECLARE @today DATETIMEOFFSET = SYSDATETIMEOFFSET()
        
        INSERT INTO [transfer].[splitAudit] (splitId, field, oldValue, createdBy, createdOn)
        SELECT s.splitId, 'amount', s.amount, @userId, @today
        FROM [transfer].split s
        WHERE s.splitId = @splitId


        UPDATE [transfer].split
        SET amount = CONVERT( DECIMAL(17,2), @amount )
        FROM [transfer].split
        WHERE splitId = @splitId
    END

    COMMIT TRANSACTION

    SELECT 'splitEdit' AS resultSetName
    SELECT 'Successfully'

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
	EXEC [core].[error]
    RETURN 55555
END CATCH