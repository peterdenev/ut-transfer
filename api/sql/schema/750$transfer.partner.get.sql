ALTER PROCEDURE [transfer].[partner.get] -- this SP gets the information about partner
    @partnerId varchar(50), ---the unique reference of partner
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

AS
SET NOCOUNT ON
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

--checks if the user has a right to make the operation
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
IF @return != 0
BEGIN
    RETURN 55555
END

SELECT 'partner' AS resultSetName

SELECT partnerId, name, port, mode, settlementDate, settlementAccount, feeAccount, commissionAccount, serialNumber
FROM [transfer].[partner]
WHERE partnerId = @partnerId
