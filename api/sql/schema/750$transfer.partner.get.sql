ALTER PROCEDURE [transfer].[partner.get] -- this SP gets the information about partner
    @partnerId VARCHAR(50), ---the UNIQUE reference of partner
    @meta core.metaDataTT READONLY -- information FOR the user that makes the operation

AS
SET NOCOUNT ON
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

--checks IF the user has a RIGHT to make the operation
DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @RETURN INT = 0
EXEC @RETURN = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
IF @RETURN != 0
BEGIN
    RETURN 55555
END

SELECT 'partner' AS resultSetName

SELECT partnerId, name, port, mode, settlementDate, settlementAccount, feeAccount, commissionAccount, serialNumber
FROM [transfer].[partner]
WHERE partnerId = @partnerId
