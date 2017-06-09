ALTER PROCEDURE [transfer].[reason.add] -- add new transfer reason in DB
    @reason NVARCHAR (100),-- -- in this parameter the stored procedure receives all fields of transfer Reason
    @action NVARCHAR (50), --the action ids for which this reason is valid
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

AS
DECLARE @callParams XML
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

BEGIN TRY
    -- checks if the user has a right to make the operation
    DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    IF @return != 0
    BEGIN
        RETURN 55555
    END

    DECLARE @languageId BIGINT = ISNULL((
        SELECT 
            languageId  
        FROM  
            [core].[language] cl  
        JOIN  
            [user].[session] us ON us.[language] = cl.[iso2Code]  
        WHERE  
            us.[actorId] = @userId), ( 
        SELECT  
            [languageId]  
        FROM  
            [core].[language]  
        WHERE  
            [name] = 'English')) 

    IF EXISTS 
        (
            SELECT 
                1 
            FROM 
                core.itemName cin
            JOIN 
                core.itemType cit ON cit.itemTypeId = cin.itemTypeId            
            WHERE 
                cit.alias = 'transferReason' + @action
            AND 
                cin.itemName = @reason            
         )
        BEGIN 
            RAISERROR ('transfer.reasonNameExists', 16,1)        
        END 

    DECLARE @itemNameId bigint

    BEGIN TRANSACTION
        INSERT INTO
            core.itemName(itemTypeId, itemName, isEnabled)
        SELECT
            itemTypeId, @reason, 1
        FROM
            core.itemType
        WHERE
            alias = 'transferReason' + @action

        SET @itemNameId = SCOPE_IDENTITY()

        INSERT INTO
            core.itemTranslation (languageId, itemNameId, itemNameTranslation)
        SELECT
            @languageId, @itemNameId, @reason
    COMMIT TRANSACTION

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    EXEC [core].[error]
    RETURN 55555
END CATCH