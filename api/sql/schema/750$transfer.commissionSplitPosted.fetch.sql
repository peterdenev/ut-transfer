ALTER PROCEDURE [transfer].[commissionSplitPosted.fetch]-- fetch commission posted for actorId
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
        s.amount AS commission, t.transferCurrency, t.transferAmount AS transferAmount, 
        CASE WHEN t.issuerTxState=2 THEN 'Successful' 
        WHEN t.issuerTxState = 4 THEN 'Error'
        WHEN t.issuerTxState = 1 THEN 'Requested'
        ELSE 'Unknown' END AS [Status],
        t.[reversed]
    FROM [transfer].split s
        JOIN [transfer].[transfer] t ON t.transferId = s.txtId 
        JOIN core.itemName i ON i.itemNameId = t.transferTypeId 
    WHERE s.ActorId  = @actorID AND t.channelType ='agent'
    AND s.tag LIKE '%|commission|%'
    ORDER BY i.itemName