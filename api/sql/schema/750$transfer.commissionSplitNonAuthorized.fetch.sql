CREATE PROCEDURE [transfer].[commissionSplitNonAuthorized.fetch]-- fetch commission non authorised for actorId
    @actorId BIGINT,-- actorId of the agent
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

    SELECT 'commission' as resultSetName
    SELECT s.splitId, t.transferIdIssuer, t.transferDateTime, i.itemName AS [operation], 
        s.amount AS commission, t.transferCurrency, t.transferAmount AS transferAmount
    FROM [transfer].split s
        JOIN [transfer].[transfer] t ON t.transferId = s.transferId AND t.channelID = s.ActorId 
        JOIN core.itemName i ON i.itemNameId = t.transferTypeId 
    WHERE t.transferIdIssuer IS NOT NULL AND t.reversed = 0 AND t.channelID = @actorID AND t.channelType ='agent'
    AND s.[state] IS NULL AND s.tag LIKE '%|commission|%' AND s.tag LIKE '%|pending|%'
    ORDER BY i.itemName