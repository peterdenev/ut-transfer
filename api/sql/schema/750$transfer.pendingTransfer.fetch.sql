CREATE PROCEDURE [transfer].[pendingTransfer.fetch]-- fetch initiated pendingTransfer
    @transferAmount MONEY, -- amount of initiated pending transfer
    @phoneNumber VARCHAR(50), -- phone number of recipient
    @securityCode VARCHAR(50), -- generated token
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

    SELECT 'pendingTransfer' as resultSetName

    SELECT p.pendingId
    FROM [transfer].pending p
    JOIN [transfer].[transfer] t ON t.transferId = p.firstTransferId
    WHERE p.phoneNumber = @phoneNumber
    AND p.securityCode = @securityCode
    AND t.transferAmount= @transferAmount
    AND p.[status] IS NULL