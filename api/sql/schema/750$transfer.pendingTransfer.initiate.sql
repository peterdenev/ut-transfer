ALTER PROCEDURE [transfer].[pendingTransfer.initiate] -- initialization of pending transaction
    @pendingTransfer [transfer].pendingTT READONLY, --information for pendingTransfer
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

DECLARE @callParams XML
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
DECLARE @pendingId INT

BEGIN TRY
    DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta

    IF @return != 0
    BEGIN
        RETURN 55555
    END

    BEGIN TRANSACTION
    BEGIN
        
        INSERT INTO [transfer].pending ( firstTransferId, securityCode, attempts, customerNumber, phoneNumber )
        SELECT firstTransferId, securityCode, 0, customerNumber, phoneNumber
        FROM @pendingTransfer

    END

    SET @pendingId = SCOPE_IDENTITY()

    COMMIT TRANSACTION

    SELECT 'transferPending' AS resultSetName

    SELECT *
    FROM [transfer].pending
    WHERE pendingId = @pendingId 

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
	EXEC [core].[error]
    RETURN 55555
END CATCH